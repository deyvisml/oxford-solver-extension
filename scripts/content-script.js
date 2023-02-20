const body_element = document.querySelector("body");

const create_interface = () => {
  const interface_element = document.createElement("div");
  interface_element.classList.add("interface");

  interface_element.innerHTML = `<div class="btn-key-container">
                                <img src="${chrome.runtime.getURL(
                                  "images/key.png"
                                )}" alt="">
                                </div>
                                <ul class="options-container">
                                <li><i class="fa-brands fa-google"></i></li>
                                <li><i class="fa-solid fa-code"></i></i></li>
                                <li><i class="fa-solid fa-cart-shopping"></i></li>
                                </ul>`;

  body_element.insertAdjacentElement("afterbegin", interface_element);
};

create_interface();
