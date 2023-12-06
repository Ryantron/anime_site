const errorConstructor = (message, errData) => {
  return {
    message,
    errData,
  };
};

/**
 * @param {any} str
 * @param {object} [param0]
 * @param {number} [param0.minLen]
 * @param {number} [param0.maxLen]
 * @param {any[]} [param0.errData]
 *
 */
const stringVerification = (
  str,
  { minLen = 1, maxLen = Infinity, errData = [] } = {}
) => {
  if (typeof str !== "string")
    return errorConstructor(`${str} is not of type string`, errData);

  str = str.trim();

  if (minLen && str.length < minLen)
    return errorConstructor(`Length is less than ${minLen}`, errData);

  if (maxLen && str.length > maxLen)
    return errorConstructor(`Length is more than ${maxLen}`, errData);

  return str;
};

/**
 * @param {any} email
 * @param {object} [obj]
 * @param {any[]} [obj.errData]
 * @returns {string}
 */
const emailVerification = (email, { errData = [] } = {}) => {
  const res = stringVerification(email, { errData }).toLowerCase();
  if (typeof res === "object") return res;
  const emailRegex = /^[A-Z0-9\.\-\&]+@[A-Z0-9]+\.[A-Z0-9]+$/i;

  if (emailRegex.test(res)) return res;
  else
    return errorConstructor(`emailVerification: Invalid email ${res}`, errData);
};

/**
 * @param {any} password
 * @param {object} [obj]
 * @param {any[]} [obj.errData]
 * @param {number} [obj.minLen]
 * @param {number} [obj.maxLen]
 * @param {boolean} [obj.banSpace]
 * @param {boolean} [obj.requireUpperCase]
 * @param {boolean} [obj.requireNumber]
 * @param {boolean} [obj.requireSpecial]
 * @returns {string}
 */
const passwordVerification = (
  password,
  {
    errData = [],
    minLen = 8,
    maxLen = Infinity,
    banSpace = true,
    requireUpperCase = true,
    requireNumber = true,
    requireSpecial = true,
  } = {}
) => {
  password = stringVerification(password, { errData, minLen, maxLen });
  if (typeof password === "object") return password;
  if (banSpace && password.includes(" "))
    return errorConstructor(`Password contains empty space`, errData);
  if (
    requireUpperCase &&
    password
      .split("")
      .reduce((acc, char) => acc && (char < "A" || char > "Z"), true)
  )
    return errorConstructor(
      `Password does not contain at least one uppercase letter`,
      errData
    );
  if (
    requireNumber &&
    password.split("").reduce((acc, char) => acc && isNaN(char), true)
  )
    return errorConstructor(
      `Password does not contain at least one number`,
      errData
    );
  if (
    requireSpecial &&
    password
      .split("")
      .reduce((acc, char) => acc && char.match(/[^0-9a-z]/gi) === null, true)
  )
    return errorConstructor(
      `Password does not contain at least one special character`,
      errData
    );

  return password;
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
const form = document.querySelector("form");
const usernameInput = document.querySelector("#usernameInput");
const emailAddressInput = document.querySelector("#emailAddressInput");
const passwordInput = document.querySelector("#passwordInput");
const confirmPasswordInput = document.querySelector("#confirmPasswordInput");
const submitInput = document.querySelector("#submitInput");

if (form.id === "loginForm") {
  form.addEventListener("submit", (e) => {
    deleteError();
    const errors = [];
    const emailAddress = emailVerification(emailAddressInput.value);
    const password = passwordVerification(passwordInput.value);

    if (typeof emailAddress === "object")
      errors.push("(Email Address) " + emailAddress.message);
    if (typeof password === "object")
      errors.push("(Password) " + password.message);

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
    const username = stringVerification(usernameInput.value, {
      minLen: 2,
      maxLen: 25,
    });
    const emailAddress = emailVerification(emailAddressInput.value);
    const password = passwordVerification(passwordInput.value);
    const confirmPassword = passwordVerification(confirmPasswordInput.value);
    if (typeof username === "object")
      errors.push("(Username) " + firstName.message);
    if (typeof emailAddress === "object")
      errors.push("(Email Address) " + emailAddress.message);
    if (typeof password === "object")
      errors.push("(Password) " + password.message);
    if (typeof confirmPassword === "object")
      errors.push("(Confirm Password) " + confirmPassword.message);
    if (
      typeof password === "string" &&
      typeof confirmPassword === "string" &&
      password !== confirmPassword
    )
      errors.push("Password and Confirm Password do not match.");

    if (errors.length > 0) {
      e.preventDefault();
      const errLi = createErrorList(errors);
      main.appendChild(errLi);
    }
  });
}
