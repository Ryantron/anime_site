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
  if (errorLi) errorLi.remove();
  // Also check for server generated errors
  const serverErrorEl = document.querySelector(".serverErrorContainer");
  if (serverErrorEl) serverErrorEl.remove();
};

const main = document.querySelector("main");
const resetForm = document.querySelector("#resetForm");
const malForm = document.querySelector("#malForm");
const toggleReset = document.querySelector("#toggleReset");
const submitResetInput = document.querySelector("#submitResetInput");
const toggleMalLink = document.querySelector("#toggleMalLink");
const submitMalInput = document.querySelector("#submitMalInput");
const unlinkMalButton = document.querySelector("#unlinkMalButton");
const toggleRecHistory = document.querySelector("#toggleRecHistory");
const usernameInput = document.querySelector("#usernameInput");
const emailAddressInput = document.querySelector("#emailAddressInput");
const passwordInput = document.querySelector("#passwordInput");
const pfpInput = document.querySelector("#pfpInput");
const malUsernameInput = document.querySelector("#malUsernameInput");

// Toggle button event listeners
if (!toggleReset) {
  toggleReset.addEventListener("click", (e) => {
    if (resetForm.style.display === "none") {
      resetForm.style.display = "block";
    } else {
      resetForm.style.display = "none";
    }
  });
}
if (!toggleMalLink) {
  toggleMalLink.addEventListener("click", (e) => {
    if (malForm.style.display === "none") {
      malForm.style.display = "block";
    } else {
      malForm.style.display = "none";
    }
  });
}

// Forms
if (!resetForm) {
  resetForm.addEventListener("submit", (e) => {
    deleteError();
    const errors = [];
    const username = stringValidation(usernameInput.value, {
      minLen: 2,
      maxLen: 25,
    });
    const emailAddress = emailValidation(emailAddressInput.value);
    const password = passwordValidation(passwordInput.value);
    const pfp = pfpValidaton(pfpInput.value);
    if (typeof username === "object")
      errors.push("(Username) " + firstName.message);
    if (typeof emailAddress === "object")
      errors.push("(Email Address) " + emailAddress.message);
    if (typeof password === "object")
      errors.push("(Password) " + password.message);
    if (typeof pfp === "object")
      errors.push("(Profile Picture:) " + pfp.message);

    if (errors.length > 0) {
      e.preventDefault();
      const errLi = createErrorList(errors);
      main.appendChild(errLi);
    }
  });
} else if (form.id === "signupForm") {
  form.addEventListener("submit", (e) => {
    deleteError();
    const errors = [];
    const username = stringValidation(usernameInput.value, {
      minLen: 2,
      maxLen: 25,
    });
    const emailAddress = emailValidation(emailAddressInput.value);
    const password = passwordValidation(passwordInput.value);
    if (typeof username === "object")
      errors.push("(Username) " + firstName.message);
    if (typeof emailAddress === "object")
      errors.push("(Email Address) " + emailAddress.message);
    if (typeof password === "object")
      errors.push("(Password) " + password.message);

    if (errors.length > 0) {
      e.preventDefault();
      const errLi = createErrorList(errors);
      main.appendChild(errLi);
    }
  });
}
