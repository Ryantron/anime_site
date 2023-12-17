import {
  stringValidation,
  emailValidation,
  passwordValidation,
  createErrorList,
  deleteError,
} from "./helpers.js";

/**
 * DOM ELEMENTS
 */

const main = document.querySelector("main");
const form = document.querySelector("form");
const usernameInput = document.querySelector("#usernameInput");
const emailAddressInput = document.querySelector("#emailAddressInput");
const passwordInput = document.querySelector("#passwordInput");
const confirmPasswordInput = document.querySelector("#confirmPasswordInput");
const submitInput = document.querySelector("#submitInput");

/**
 * EVENT LISTENERS
 */

if (form.id === "loginForm") {
  form.addEventListener("submit", (e) => {
    deleteError();
    const errors = [];
    let emailAddress = emailValidation(emailAddressInput.value);
    let password = passwordValidation(passwordInput.value);

    if (emailAddress.success) emailAddress = emailAddress.data;
    else errors.push("(Email Address) " + emailAddress.error);

    if (password.success) password = password.data;
    else errors.push("(Password) " + password.error);

    if (errors.length > 0) {
      e.preventDefault();
      console.log(errors);
      const errLi = createErrorList(errors);
      main.appendChild(errLi);
    }
  });
} else if (form.id === "signupForm") {
  form.addEventListener("submit", (e) => {
    deleteError();
    const errors = [];
    let username = stringValidation(usernameInput.value, {
      minLen: 2,
      maxLen: 25,
    });
    let emailAddress = emailValidation(emailAddressInput.value);
    let password = passwordValidation(passwordInput.value);
    const confirmPassword = confirmPasswordInput.value.trim();

    if (username.success) username = username.data;
    else errors.push("(Username) " + username.error);

    if (emailAddress.success) emailAddress = emailAddress.data;
    else errors.push("(Email Address) " + emailAddress.message);

    if (password.success) password = password.data;
    else errors.push("(Password) " + password.message);

    if (password !== confirmPassword)
      errors.push("Password and Confirm Password do not match.");

    if (errors.length > 0) {
      e.preventDefault();
      const errLi = createErrorList(errors);
      main.appendChild(errLi);
    }
  });
}
