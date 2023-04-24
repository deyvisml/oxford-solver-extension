chrome.runtime.onInstalled.addListener(function (details) {
  clear_cachetoken_and_storage();
});

/**
 * LImpiar el storage local y la cache de google auth (esto para permitir al usuario ingresar una cuenta cualquiera)
 */
const clear_cachetoken_and_storage = () => {
  chrome.storage.local.clear(function () {
    const error = chrome.runtime.lastError;
    if (error) {
      console.error(error);
    }
    // do something more
  });

  chrome.identity.clearAllCachedAuthTokens((res) => {
    console.log(res);
  });
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log(message, sender, sendResponse);

  if (message.action === "login") {
    // https://stackoverflow.com/questions/53024819/chrome-extension-sendresponse-not-waiting-for-async-function/53024910#53024910
    (async () => {
      // Verificar si hay una sesión existente
      const result = await get_status_token();

      if (result.token_alive === false) {
        /**
         * === GOOGLE LOGIN START ===
         */
        console.log("Starting Oauth");
        chrome.identity.getAuthToken({ interactive: true }, async (token) => {
          if (chrome.runtime.lastError) {
            clear_cachetoken_and_storage();
            console.log("Run time last error", chrome.runtime.lastError);
            sendResponse({
              logged: false,
            });
            return;
          }

          const response = await fetch(
            `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${token}`
          );
          const data = await response.json();

          const result = await login(data);

          if (!Object.keys(result).length || result.logged === false) {
            console.log("Usuario no logedao :(");
            clear_cachetoken_and_storage();
            sendResponse({
              logged: false,
            });
          } else {
            console.log("USUARIO LOGEADO");
            chrome.storage.local.set(
              {
                token: result.token,
              },
              function () {
                console.log("CREDENCIALES GUARDADAS");
                sendResponse({
                  logged: true,
                });
              }
            );
          }
        });
        /*END GOOGLE LOGIN*/
      } else {
        sendResponse({ logged: true });
      }
    })();

    return true; // para mantener el canal de mensaje abierto: https://stackoverflow.com/questions/20077487/chrome-extension-message-passing-response-not-sent
  } else if (message.action === "get-user-profile") {
    (async () => {
      // https://stackoverflow.com/questions/53024819/chrome-extension-sendresponse-not-waiting-for-async-function/53024910#53024910
      const result = await get_status_token();
      console.log("RESUL 2:", result);
      if (result.token_alive === true) {
        const data = await get_user_profile();
        console.log("RESUL 3:", data);
        data.used_at = data.used_at.substr(0, 10);
        data.expire_at = data.expire_at.substr(0, 10);
        result.user_info = data;
      }
      sendResponse(result);
    })();
    return true;
  } else if (message.action === "get-status-token") {
    (async () => {
      console.log("fun status token");
      // https://stackoverflow.com/questions/53024819/chrome-extension-sendresponse-not-waiting-for-async-function/53024910#53024910
      const result = await get_status_token();
      console.log("result", result);
      sendResponse(result);
    })();
    return true;
  } else if (message.action === "close-session") {
    clear_cachetoken_and_storage();
    sendResponse({ session_closed: true });
    return true;
  } else if (message.action === "register-code") {
    // verificar token
    (async () => {
      // https://stackoverflow.com/questions/53024819/chrome-extension-sendresponse-not-waiting-for-async-function/53024910#53024910
      let result = await get_status_token();
      console.log("RESUL 2:", result);
      if (result.token_alive === true) {
        //registrar codigo
        result = await register_code(message.code);
        if ("expire_at" in result) {
          result.expire_at = result.expire_at.substr(0, 10);
        }
      }
      sendResponse(result);
    })();
  } else if (message.action === "verify-activity") {
    (async () => {
      // https://stackoverflow.com/questions/53024819/chrome-extension-sendresponse-not-waiting-for-async-function/53024910#53024910
      const result = await verify_activity(
        message.program_name,
        message.topic_name,
        message.activity_type_name
      );
      console.log("result", result);

      sendResponse(result);
    })();
  } else if (message.action === "get-answers") {
    (async () => {
      // https://stackoverflow.com/questions/53024819/chrome-extension-sendresponse-not-waiting-for-async-function/53024910#53024910
      let result = await get_status_token();
      if (result.token_alive === true) {
        result = await get_status_code();
        if (result.code_available === true) {
          // show answers
          const id_activity = message.id_activity;
          result = await get_answers(id_activity);
        }
      }
      sendResponse(result);
    })();
  }

  return true;
});

const get_answers = async (id_activity) => {
  const result = await readLocalStorage("token");
  const token = result.token;

  const response = await fetch("https://oxfordsolver.codigosoxford/api/solve", {
    method: "post",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      id_activity: id_activity,
    }),
  });

  let data = await response.json();

  if (!("succeed" in data)) {
    data = { succeed: false };
  }

  return data;
};

const verify_activity = async (
  program_name,
  topic_name,
  activity_type_name
) => {
  console.log("names:", program_name, topic_name, activity_type_name);

  const response = await fetch(
    "https://oxfordsolver.codigosoxford/api/verify-activity",
    {
      method: "post",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        program_name: program_name,
        topic_name: topic_name,
        activity_type_name: activity_type_name,
      }),
    }
  );

  let data = await response.json();

  console.log("data::", data);

  if (!("activity_available" in data) || data["activity_available"] === false) {
    data = { activity_available: false };
  }

  return data;
};

const register_code = async (code) => {
  const result = await readLocalStorage("token");
  const token = result.token;

  const response = await fetch(
    "https://oxfordsolver.codigosoxford/api/register_code",
    {
      method: "post",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        code: code,
      }),
    }
  );

  let data = await response.json();

  if (!("code_registered" in data)) {
    data = { code_registered: false };
  }

  return data;
};

const login = async (credentials) => {
  const response = await fetch("https://oxfordsolver.codigosoxford/api/login", {
    method: "post",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: credentials.email,
      password: "true",
    }),
  });
  let data = await response.json();

  if ("message" in data && data.message === "invalid credentials") {
    data = await register(credentials);
  } else if ("message" in data) {
    // TODO: Si se trata de otro error
    return { logged: false };
  }

  let result = {};
  if (data.errors && Object.keys(data.errors).length) {
    console.log("LOGIN FAIL: ERROS IN LOGIN OR REGISTER PROCCESS"); // TODO: No registrar ni logear usuario en este caso
    result = { logged: false };
  } else {
    console.log("LOGIN OK", data);
    result = { logged: true, token: data.token };
  }

  return result;
};

// registrar nuevo usuario
const register = async (credentials) => {
  console.log("REGISTERING USER");

  const response = await fetch(
    "https://oxfordsolver.codigosoxford/api/new_register",
    {
      method: "post",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: credentials.name ?? "null",
        email: credentials.email,
        password: "true",
        password_confirmation: "true",
      }),
    }
  );
  const data = await response.json();

  return data;
};

const readLocalStorage = async (key) => {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get([key], function (result) {
      resolve(result);
    });
  });
};

const get_user_profile = async () => {
  const result = await readLocalStorage("token");
  const token = result.token;

  const response = await fetch(
    "https://oxfordsolver.codigosoxford/api/user-profile/",
    {
      method: "get",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  let data = await response.json();

  return data;
};

const get_status_token = async () => {
  const result = await readLocalStorage("token");

  const token = "token" in result ? result.token : "null";

  let data = {};

  if (token !== "null") {
    const response = await fetch(
      "https://oxfordsolver.codigosoxford/api/status-token/",
      {
        method: "get",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    data = await response.json();

    if ("message" in data) {
      clear_cachetoken_and_storage();
      data = { token_alive: false };
    }
  } else {
    clear_cachetoken_and_storage();
    data = { token_alive: false };
  }

  return data;
};

const get_status_code = async () => {
  const result = await readLocalStorage("token");
  const token = "token" in result ? result.token : "null";

  let data = {};

  if (token !== "null") {
    const response = await fetch(
      "https://oxfordsolver.codigosoxford/api/status-code/",
      {
        method: "get",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    data = await response.json();
  } else {
    clear_cachetoken_and_storage();
    data = { code_available: false };
  }

  return data;
};
