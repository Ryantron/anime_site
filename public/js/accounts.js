import {
  stringValidation,
  integerValidation,
  usernameValidation,
  emailValidation,
  passwordValidation,
  createErrorList,
  deleteError,
} from "./helpers.js";

/**
 * HELPERS
 */

const addErrorTo = (parentEl, errors) => {
  const errorHeader = document.createElement("h3");
  errorHeader.classList.add("errorHeader");
  errorHeader.classList.add("px-4");
  errorHeader.textContent = "Error:";
  parentEl.appendChild(errorHeader);

  const errLi = createErrorList(errors);
  parentEl.appendChild(errLi);
};

/**
 * DOM ELEMENTS
 */

const errorList = document.querySelector("#errorList");

const resetForm = document.querySelector("#resetForm");
const usernameInput = document.querySelector("#usernameInput");
const emailAddressInput = document.querySelector("#emailAddressInput");
const passwordInput = document.querySelector("#passwordInput");
const pfpIdInput = document.querySelector("#pfpIdInput");

const malForm = document.querySelector("#malForm");
const malUsernameInput = document.querySelector("#malUsernameInput");

const toggleRecHistory = document.querySelector("#toggleRecHistory");
const recHistory = document.querySelector("#recHistory");

/**
 * EVENT LISTENERS
 */

// Toggle button event listeners
toggleRecHistory.addEventListener("click", (e) => {
  recHistory.classList.toggle("hidden");
});

// Form event listeners
resetForm.addEventListener("submit", (e) => {
  deleteError();
  const errors = [];
  // Not all input required: validate non-empty strings after trim
  let username = undefined;
  let emailAddress = undefined;
  let password = undefined;
  let pfp = undefined;
  if (
    typeof usernameInput.value === "string" &&
    usernameInput.value.trim() !== ""
  ) {
    username = usernameValidation(usernameInput.value);
    if (username.success) username = username.data;
    else errors.push("(Username) " + username.error);
  }
  if (
    typeof emailAddressInput.value === "string" &&
    emailAddressInput.value.trim() !== ""
  ) {
    emailAddress = emailValidation(emailAddressInput.value);
    if (emailAddress.success) emailAddress = emailAddress.data;
    else errors.push("(Email Address) " + emailAddress.error);
  }
  if (
    typeof passwordInput.value === "string" &&
    passwordInput.value.trim() !== ""
  ) {
    password = passwordValidation(passwordInput.value);
    if (password.success) password = password.data;
    else errors.push("(Password) " + password.error);
  }
  if (typeof pfpIdInput.value === "string" && pfpIdInput.value.trim() !== "") {
    pfp = integerValidation(pfpIdInput.value, { min: 1, max: 5 });
    if (pfp.success) pfp = pfp.data;
    else errors.push("(Profile Picture) " + pfp.error);
  }

  // Error: no input provided
  if (
    !usernameInput.value &&
    !emailAddressInput.value &&
    !passwordInput.value &&
    !pfpIdInput.value
  ) {
    errors.push("Must provide at least one input!");
  }

  if (errors.length > 0) {
    e.preventDefault();
    addErrorTo(errorList, errors);
  }
});

if (malForm) {
  malForm.addEventListener("submit", (e) => {
    deleteError();
    const errors = [];
    let malUsername = stringValidation(malUsernameInput.value);
    if (malUsername.success) malUsername = malUsername.data;
    else errors.push("(MyAnimeList Username) " + malUsername.message);

    if (errors.length > 0) {
      e.preventDefault();
      addErrorTo(errorList, errors);
    }
  });
}
