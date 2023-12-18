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

const toggleRecHistory = document.querySelector("#toggleRecHistory");
const recHistory = document.querySelector("#recHistory");

/**
 * EVENT LISTENERS
 */

// Toggle button event listeners
toggleRecHistory.addEventListener("click", (e) => {
  recHistory.classList.toggle("hidden");
});