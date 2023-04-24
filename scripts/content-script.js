const body_element = document.querySelector("body");

const display_login_interface = () => {
  // Elminar la interfaz actual
  document.querySelector(".interface")?.remove();

  const interface_element = document.createElement("div");
  interface_element.classList.add("interface");

  interface_element.innerHTML = `<ul class="options-container only-login">
                                  <li title="Login" class="login-btn"><i class="fa-brands fa-google"></i></li>
                                  <div style="display:none" class="load loader-login-btn"><span></span></div>
                                </ul>`;

  body_element.insertAdjacentElement("afterbegin", interface_element);

  const login_btn = document.querySelector(".login-btn");

  login_btn.addEventListener("click", () => {
    document.querySelector(".login-btn").style.display = "none";
    document.querySelector(".loader-login-btn").style.removeProperty("display");
    handler_login_btn();
  });
};

const display_user_interface = () => {
  // Elminar la interfaz actual
  document.querySelector(".interface")?.remove();

  const interface_element = document.createElement("div");
  interface_element.classList.add("interface");

  interface_element.innerHTML = `<ul class="options-container">
                                  <li title="Perfil" class="perfil-btn"><i class="fa-solid fa-user"></i></li>
                                  <li title="Comprar código" class="buy-code-btn"><i class="fa-solid fa-cart-shopping"></i></li>
                                  <li title="Ingresar código" class="display-enter-code-btn"><i class="fa-solid fa-code"></i></li>
                                </ul>`;

  body_element.insertAdjacentElement("afterbegin", interface_element);

  const perfil_btn = document.querySelector(".perfil-btn");
  perfil_btn.addEventListener("click", () => {
    handler_display_perfil();
  });

  const enter_code_btn = document.querySelector(".display-enter-code-btn");
  enter_code_btn.addEventListener("click", () => {
    handler_display_enter_code();
  });

  const buy_code_btn = document.querySelector(".buy-code-btn");
  buy_code_btn.addEventListener("click", () => {
    const url = "https://wa.link/c402hd";
    window.open(url, "_blank").focus();
  });
};

const display_key_btn = async () => {
  // Elminar el boton existente actual (solo si existe)
  document.querySelector(".btn-key-container")?.remove();

  const response = await verify_activity();

  if (response.activity_available === true) {
    const key_btn = document.createElement("div");
    key_btn.classList.add("btn-key-container");
    key_btn.setAttribute("title", "Mostrar respuestas");
    key_btn.innerHTML = `<img class="img-btn-key" src="${chrome.runtime.getURL(
      "images/key.png"
    )}" alt="">
    <div style="display:none" class="load loader-key-btn"><span></span></div>`;

    const interface_element = document.querySelector(".interface");
    interface_element.insertAdjacentElement("afterbegin", key_btn); // issue: but it's working xd it should be beforebegin

    const id_activity = response.id_activity;

    // add listener
    key_btn.addEventListener("click", () => {
      document.querySelector(".img-btn-key").style.display = "none";
      document.querySelector(".loader-key-btn").style.removeProperty("display");
      handler_key_btn(id_activity);
    });
  }
};

const display_float_window_answers = (questions_answers) => {
  handler_close_float_window_answers();

  const display_format = questions_answers.display_format;
  const display_width = questions_answers.display_width;
  const questions = questions_answers.questions;

  console.log("questions_answers:", questions_answers);

  const float_window_answer = document.createElement("div");
  // Agregar la clase para el tamaño de la ventana
  float_window_answer.classList.add("float-window-answers", display_width);

  // Agregar los contenidos de las pregutnas y respuestas segun el tipo de formato

  const head_float_window_element = document.createElement("div");
  head_float_window_element.classList.add("head-float-window");
  head_float_window_element.innerHTML = `<p class="title-head">Answer key</p>
                                        <div class="close-float-window-answers">
                                          <i class="fa-solid fa-xmark"></i>
                                        </div>`;

  const body_float_window_element = create_body_float_window(
    questions,
    display_format
  );

  float_window_answer.insertAdjacentElement(
    "beforeend",
    head_float_window_element
  );
  float_window_answer.insertAdjacentElement(
    "beforeend",
    body_float_window_element
  );

  body_element.insertAdjacentElement("afterbegin", float_window_answer);
  //alert(id_activity);
  make_float_window_answer_draggable();

  const close_float_window_answers_btn = document.querySelector(
    ".close-float-window-answers"
  );

  close_float_window_answers_btn.addEventListener("click", () => {
    handler_close_float_window_answers();
  });
};

const create_body_float_window = (questions, format_type) => {
  const body_float_window_element = document.createElement("div");
  body_float_window_element.classList.add("body-float-window", format_type);

  switch (format_type) {
    case "format-1":
      // 1 question (It's not required to for the questions, because only exits one
      for (const question of questions) {
        for (const answer of question.answers) {
          const answer_element = document.createElement("div");
          answer_element.classList.add("answer");

          answer_element.innerHTML = `<div class="num">${answer.ordinal_number}</div>
                                      <div class="content-answer">${answer.answer}</div>`;

          body_float_window_element.insertAdjacentElement(
            "beforeend",
            answer_element
          );
        }
      }
      break;

    case "format-2":
      // 1 question
      for (const question of questions) {
        for (const answer of question.answers) {
          const answer_element = document.createElement("div");
          answer_element.classList.add("answer");

          answer_element.innerHTML = `<div class="content-answer">${answer.answer}</div>`;

          body_float_window_element.insertAdjacentElement(
            "beforeend",
            answer_element
          );
        }
      }
      break;

    case "format-3":
      // n questions
      for (const question of questions) {
        const question_element = document.createElement("div");
        question_element.classList.add("question");
        question_element.innerHTML = `<div class="content-question">${question.question}</div>`;

        const answers_element = document.createElement("div");
        answers_element.classList.add("answers");
        for (const answer of question.answers) {
          const answer_element = document.createElement("div");
          answer_element.classList.add("answer");

          answer_element.innerHTML = `<div class="content-answer">${answer.answer}</div>`;

          answers_element.insertAdjacentElement("beforeend", answer_element);
        }

        question_element.insertAdjacentElement("beforeend", answers_element);
        body_float_window_element.insertAdjacentElement(
          "beforeend",
          question_element
        );
      }
      break;

    case "format-4":
      // n questions
      for (const question of questions) {
        for (const answer of question.answers) {
          const answer_element = document.createElement("div");
          answer_element.classList.add("answer");

          answer_element.innerHTML = `<div class="question">${question.question}</div>
                                      <div class="content-answer">${answer.answer}</div>`;

          body_float_window_element.insertAdjacentElement(
            "beforeend",
            answer_element
          );
        }
      }
      break;

    case "format-5":
      // n questions
      for (const question of questions) {
        for (const answer of question.answers) {
          const answer_element = document.createElement("div");
          answer_element.classList.add("answer");

          answer_element.innerHTML = `<div class="question">
                                        <img src="${chrome.runtime.getURL(
                                          "images/question_answer_images/".concat(
                                            question.question
                                          )
                                        )}"/>
                                      </div>
                                      <div class="content-answer">${
                                        answer.answer
                                      }</div>`;

          body_float_window_element.insertAdjacentElement(
            "beforeend",
            answer_element
          );
        }
      }
      break;

    case "format-6":
      // 1 questions
      for (const question of questions) {
        for (const answer of question.answers) {
          const answer_element = document.createElement("div");
          answer_element.classList.add("answer");

          answer_element.innerHTML = `<img class="content-answer" src="${chrome.runtime.getURL(
            "images/question_answer_images/".concat(question.question)
          )}"/>`;

          body_float_window_element.insertAdjacentElement(
            "beforeend",
            answer_element
          );
        }
      }
      break;

    default:
      console.log("invalid format type");
      break;
  }

  return body_float_window_element;
};

const verify_activity = async () => {
  // TODO: Estas rutas xpath son muy IMPORTANTES ya que definen con exactitud de que activity se trata. (puede que varien en las distintas actitivy ...)

  const path_program =
    "/html/body/header/nav/d2l-navigation/d2l-navigation-main-header/div[1]/div[2]/div/a";
  const path_topic =
    "/html/body/div[3]/div[2]/div[1]/div/div[1]/div/div/d2l-breadcrumbs/d2l-breadcrumb[3]";
  const path_activity_type =
    "/html/body/div[3]/div[2]/div[1]/div/div[1]/div/div/d2l-breadcrumbs/d2l-breadcrumb-current-page";

  const program_element = await checkElement(path_program);
  const topic_element = await checkElement(path_topic);
  const activity_type_element = await checkElement(path_activity_type);

  const program_name = program_element.getAttribute("title");
  const topic_name = topic_element.getAttribute("text");
  const activity_type_name = activity_type_element.getAttribute("text");

  /*
  const program_element = await checkElement('//*[@id="program"]');
  const topic_element = await checkElement('//*[@id="topic"]');
  const activity_type_element = await checkElement('//*[@id="activity-type"]');

  const program_name = program_element.value;
  const topic_name = topic_element.value;
  const activity_type_name = activity_type_element.value;*/

  // verificar en el backend
  // https://stackoverflow.com/questions/52087734/make-promise-wait-for-a-chrome-runtime-sendmessage
  const response = await new Promise((resolve) => {
    chrome.runtime.sendMessage(
      {
        action: "verify-activity",
        program_name: program_name,
        topic_name: topic_name,
        activity_type_name: activity_type_name,
      },
      resolve
    );
  });

  return response;
};

/* ====================================================================== */
/* === METODOS AUXILIARES === */

const getElementByXpath = (path) => {
  return document.evaluate(
    path,
    document,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null
  ).singleNodeValue;
};

const checkElement = async (selector) => {
  console.log("SEARCHING ELEMENT");
  while (getElementByXpath(selector) === null) {
    console.log("PIPIPI");
    await new Promise((resolve) => requestAnimationFrame(resolve));
  }
  return getElementByXpath(selector);
};

const isNumeric = (value) => {
  return /^\d+$/.test(value);
};

/* =================================== */
/**
 * Metodo a ejecutar por defecto, para mostrar la interfaz correspondiente
 */
const main = () => {
  getElementByXpath(
    `//*[@id="__8x8-chat-button-container-script_15047778015c77c13fd4b099.78966852"]`
  )?.remove(); // delete float div "livechat"

  chrome.runtime.sendMessage(
    { action: "get-status-token" },
    function (response) {
      if (response.token_alive === false) {
        display_login_interface();
      } else {
        display_user_interface();
      }
      display_key_btn();
    }
  );
};

main();

/* ====================================================================== */
/* == HANDLERS == TODO: Los handlers son metodos de escuah del addeventlistener*/

const handler_key_btn = (id_activity) => {
  chrome.runtime.sendMessage(
    {
      action: "get-answers",
      id_activity: id_activity,
    },
    function (response) {
      if ("token_alive" in response && response.token_alive === false) {
        // verificar si el usuario esta logeado (token)
        alert("Por favor, primero debe iniciar sesión.");
      } else if (
        // verificar si el usuario tiene un código activo
        "code_available" in response &&
        response.code_available === false
      ) {
        alert("Usted no cuenta con un código vigente.\n");
      } else {
        // si todo esta ok mostrar ventana flotante
        display_float_window_answers(response);
      }

      // eliminar el loader
      document.querySelector(".img-btn-key").style.removeProperty("display");
      document.querySelector(".load").style.display = "none";
    }
  );
};

const make_float_window_answer_draggable = () => {
  $("body")
    .on("mousedown", ".head-float-window", function () {
      $(".float-window-answers")
        .addClass("draggable")
        .parents()
        .on("mousemove", function (e) {
          $(".draggable")
            .offset({
              top: e.pageY - $(".head-float-window").outerHeight() / 2,
              left: e.pageX - $(".head-float-window").outerWidth() / 2,
            })
            .on("mouseup", function () {
              $(".float-window-answers").removeClass("draggable");
            });
        });
    })
    .on("mouseup", function () {
      $(".draggable").removeClass("draggable");
    });
};

const handler_display_enter_code = () => {
  // display flaot window
  const float_window_element = document.createElement("div");
  float_window_element.classList.add("float-window");
  float_window_element.innerHTML = `<div class="head-float-window">
                                      <div class="close-float-window">
                                        <i class="fa-solid fa-xmark"></i>
                                      </div>
                                    </div>
                                    <div class="body-float-window">
                                      <p class="title-window">
                                          Ingresar código
                                      </p>
                                      <p class="description-window">
                                          Por favor, ingrese su código adquirido en la parte de abajo
                                      </p>
                                      <div class="center-input-button">
                                          <input class="input-code no-spinner" type="text" maxlength="8" placeholder="00000000" autofocus>
                                          <button class="btn-register-code">CANJEAR</button>
                                      </div>
                                    </div>`;

  body_element.insertAdjacentElement("beforebegin", float_window_element);

  const cover_window_element = document.createElement("div");
  cover_window_element.classList.add("cover-window");
  body_element.insertAdjacentElement("beforebegin", cover_window_element);

  // add events (close window)
  cover_window_element.addEventListener("click", () => {
    handler_close_float_window();
  });
  const close_float_window_btn = document.querySelector(".close-float-window");
  close_float_window_btn.addEventListener("click", () => {
    handler_close_float_window();
  });

  // add events (others)
  const register_code_btn = document.querySelector(".btn-register-code");
  register_code_btn.addEventListener("click", () => {
    // obtener el codigo ingresado
    const code = document.querySelector(".input-code").value;
    handler_register_code(code);
  });
};

const handler_register_code = (code) => {
  // verificar si el codigio es valido
  if (code.length === 8 && isNumeric(code)) {
    chrome.runtime.sendMessage(
      {
        action: "register-code",
        code: code,
      },
      function (response) {
        if ("token_alive" in response && response.token_alive === false) {
          // token alive = false
          // eliminar la ventana flotante
          handler_close_float_window();
          // cambiar a la interfaz de login
          display_login_interface();
          // TODO: Clear storage (to delete the token) - Aunque esto creo ya se hace en el background cuando establece el falor de token_alive = false
        } else if ("code_registered" in response) {
          let badge = null;
          if (response.code_registered === true) {
            // code registered = true
            document.querySelector(".response-register-code")?.remove();
            badge = document.createElement("p");
            badge.classList.add("response-register-code", "success");
            badge.innerText = `Código registrado exitosamente! (expira: ${response.expire_at})`;
          } else {
            // code registered = false
            document.querySelector(".response-register-code")?.remove();
            badge = document.createElement("p");
            badge.classList.add("response-register-code", "error");
            badge.innerText = `Error, el código no es válido o ya fue usado.`;
          }
          const body_float_window_element =
            document.querySelector(".body-float-window");
          body_float_window_element.insertAdjacentElement("beforeend", badge); // insertando la bandera
          window.getComputedStyle(badge);
        }
        console.log("Response register code:", response);
      }
    );
  } else {
    alert("Por favor, ingrese un código valido");
  }
};

const handler_login_btn = () => {
  chrome.runtime.sendMessage({ action: "login" }, function (response) {
    if (response.logged) {
      main();
    } else {
      console.log("-> El usuario no se logeo");
    }
    // eliminar el loader de login
    document.querySelector(".login-btn").style.removeProperty("display");
    document.querySelector(".loader-login-btn").style.display = "none";
  });
};

const handler_display_perfil = () => {
  // TODO: Obtener la información del usuario (depaso se verifica si el token sigue activo)
  chrome.runtime.sendMessage(
    { action: "get-user-profile" },
    function (response) {
      const error = chrome.runtime.lastError;
      if (error) {
        console.error(error);
      }

      console.log("reponse content", response);

      if (response.token_alive === false) {
        //TODO: El usuario necesita logearse
        display_login_interface();
      } else {
        const float_window_element = document.createElement("div");
        float_window_element.classList.add("float-window");
        float_window_element.innerHTML = `<div class="head-float-window">
                                            <div class="close-float-window">
                                             <i class="fa-solid fa-xmark"></i>
                                            </div>
                                          </div>
                                          <div class="body-float-window">
                                            <p class="title-window">Información personal</p>
                                            <p class="item-profile-description first">
                                              <strong>Nombre: </strong>${
                                                response.user_info.name ??
                                                "null"
                                              }
                                            </p>
                                            <p class="item-profile-description">
                                              <strong>Código registrado: </strong>${
                                                response.user_info.used_at ??
                                                "null"
                                              }
                                            </p>
                                            <p class="item-profile-description">
                                              <strong>Código expira: </strong>${
                                                response.user_info.expire_at ??
                                                "null"
                                              }
                                            </p>
      
                                            <button class="close-session-btn">Cerrar sesión</button>
                                          </div>`;

        body_element.insertAdjacentElement("beforebegin", float_window_element);

        const cover_window_element = document.createElement("div");
        cover_window_element.classList.add("cover-window");
        body_element.insertAdjacentElement("beforebegin", cover_window_element);

        cover_window_element.addEventListener("click", () => {
          handler_close_float_window();
        });
        const close_float_window_btn = document.querySelector(
          ".close-float-window"
        );
        close_float_window_btn.addEventListener("click", () => {
          handler_close_float_window();
        });

        const close_sessión_btn = document.querySelector(".close-session-btn");
        close_sessión_btn.addEventListener("click", () => {
          handler_close_session_btn();
        });
      }
    }
  );
};

const handler_close_session_btn = () => {
  // enviar mensaje close session
  chrome.runtime.sendMessage(
    {
      action: "close-session",
    },
    function (response) {}
  );

  // eliminar la ventana flotante
  handler_close_float_window();

  // cambiar a la interfaz de login
  main();
};

const handler_close_float_window = () => {
  const float_window_element = document.querySelector(".float-window");
  const cover_window_element = document.querySelector(".cover-window");

  float_window_element.remove();
  cover_window_element.remove();
};

const handler_close_float_window_answers = () => {
  const float_window_answers_element = document.querySelector(
    ".float-window-answers"
  );

  float_window_answers_element?.remove();
};
