const errorConstructor = (message) => {
  return {
    message,
  };
};

/**
 * @param {any} str
 * @param {object} [param0]
 * @param {number} [param0.minLen]
 * @param {number} [param0.maxLen]
 *
 */
const stringValidation = (str, { minLen = 1, maxLen = Infinity } = {}) => {
  if (typeof str !== "string")
    return errorConstructor(`${str} is not of type string`);

  str = str.trim();

  if (minLen && str.length < minLen)
    return errorConstructor(`Length is less than ${minLen}`);

  if (maxLen && str.length > maxLen)
    return errorConstructor(`Length is more than ${maxLen}`);

  return str;
};

/**
 * @param {any} email
 * @param {object} [obj]
 * @returns {string}
 */
const emailValidation = (email) => {
  const res = stringValidation(email);
  if (typeof res === "object") return res;
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/i;

  if (emailRegex.test(res)) return res;
  else return errorConstructor(`Invalid email ${res}`);
};

const passwordValidation = (password) => {
  if (/\s/.test(password)) {
    return errorConstructor("Password cannot contain empty spaces");
  }
  password = password.trim();
  const passRegex =
    /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^\&*\)\(+=._-])[a-zA-Z0-9!@#\$%\^\&*\)\(+=._-]{8,}$/;
  if (!passRegex.test(password)) {
    return errorConstructor(
      "Password must be at least 8 characters long and contain 1 special character, number, and uppercase letter"
    );
  }

  return password;
};

// TODO: validation?
const pfpValidation = (pfp) => {
  return pfp;
};

const createErrorList = (errors) => {
  const ul = document.createElement("ul");
  ul.classList.add("clienterror");
  for (const error of errors) {
    const errorLi = document.createElement("li");
    errorLi.classList.add("no-bullet");
    const errorP = document.createElement("p");
    errorP.textContent = error;
    errorLi.appendChild(errorP);
    ul.appendChild(errorLi);
  }
  return ul;
};

const deleteError = () => {
  const errorLi = document.querySelector(".clienterror");
  const errorHeader = document.querySelector(".errorHeader");
  if (errorLi) errorLi.remove();
  if (errorHeader) errorHeader.remove();
  // Also check for server generated errors
  const serverErrorEl = document.querySelector(".serverErrorContainer");
  if (serverErrorEl) serverErrorEl.remove();
};

const errorList = document.querySelector("#errorList");
const resetForm = document.querySelector("#resetForm");
const malForm = document.querySelector("#malForm");
const submitResetInput = document.querySelector("#submitResetInput");
const submitMalInput = document.querySelector("#submitMalInput");
const toggleRecHistory = document.querySelector("#toggleRecHistory");
const usernameInput = document.querySelector("#usernameInput");
const emailAddressInput = document.querySelector("#emailAddressInput");
const passwordInput = document.querySelector("#passwordInput");
const pfpInput = document.querySelector("#pfpInput");
const malUsernameInput = document.querySelector("#malUsernameInput");

// Toggle button event listeners
// TODO: this, and remove toggleRecHistory?

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
    username = stringValidation(usernameInput.value, {
      minLen: 2,
      maxLen: 25,
    });
  }
  if (
    typeof emailAddressInput.value === "string" &&
    emailAddressInput.value.trim() !== ""
  ) {
    emailAddress = emailValidation(emailAddressInput.value);
  }
  if (
    typeof passwordInput.value === "string" &&
    passwordInput.value.trim() !== ""
  ) {
    password = passwordValidation(passwordInput.value);
  }
  if (typeof pfpInput.value === "string" && pfpInput.value.trim() !== "") {
    pfp = stringValidation(pfpInput.value, {
      minLen: 2,
      maxLen: 25,
    });
  }

  if (typeof username === "object")
    errors.push("(Username) " + username.message);
  if (typeof emailAddress === "object")
    errors.push("(Email Address) " + emailAddress.message);
  if (typeof password === "object")
    errors.push("(Password) " + password.message);
  if (typeof pfp === "object") errors.push("(Profile Picture) " + pfp.message);

  if (errors.length > 0) {
    e.preventDefault();
    const errorHeader = document.createElement("h3");
    errorHeader.classList.add("errorHeader");
    errorHeader.classList.add("px-4");
    errorHeader.textContent = "Error:";
    errorList.appendChild(errorHeader);
    const errLi = createErrorList(errors);
    errorList.appendChild(errLi);
  }
});

malForm.addEventListener("submit", (e) => {
  deleteError();
  const errors = [];
  const malUsername = stringValidation(malUsernameInput.value);
  if (typeof malUsername === "object")
    errors.push("(MyAnimeList Username) " + malUsername.message);
  if (errors.length > 0) {
    e.preventDefault();
    const errorHeader = document.createElement("h3");
    errorHeader.classList.add("errorHeader");
    errorHeader.classList.add("px-4");
    errorHeader.textContent = "Error:";
    errorList.appendChild(errorHeader);
    const errLi = createErrorList(errors);
    errorList.appendChild(errLi);
  }
});
