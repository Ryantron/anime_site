/**
 * Level 1
 */

const errorConstructor = (message) => {
  return {
    success: false,
    error: message,
  };
};

const dataConstructor = (data) => {
  return {
    success: true,
    data,
  };
};

/**
 * Level 2
 */

/**
 * @param {any} str
 * @param {object} [param0]
 * @param {number} [param0.minLen]
 * @param {number} [param0.maxLen]
 * @returns {object}
 */
export const stringValidation = (
  str,
  { minLen = 1, maxLen = Infinity } = {}
) => {
  if (typeof str !== "string")
    return errorConstructor(`${str} is not of type string`);

  str = str.trim();

  if (minLen && str.length < minLen)
    return errorConstructor(`Length is less than ${minLen}`);

  if (maxLen && str.length > maxLen)
    return errorConstructor(`Length is more than ${maxLen}`);

  return dataConstructor(str);
};

/**
 * Level 3
 */

/**
 * @param {any} email
 * @param {object} [obj]
 * @returns {object}
 */
export const emailValidation = (email) => {
  const res = stringValidation(email);
  if (typeof res.success === false) return res;
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/i;
  email = res.data;

  if (emailRegex.test(email)) return dataConstructor(email);
  else return errorConstructor(`Invalid email ${email}`);
};

/**
 *
 * @param {any} password
 * @returns {object}
 */
export const passwordValidation = (password) => {
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

  return dataConstructor(password);
};

/**
 * Level 4
 */

export const createErrorList = (errors) => {
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

export const deleteError = () => {
  const errorLi = document.querySelector(".clienterror");
  if (errorLi) errorLi.remove();
  // Also check for server generated errors
  const serverErrorEl = document.querySelector(".serverErrorContainer");
  if (serverErrorEl) serverErrorEl.remove();
};

export const addClassTo = (el, className) => {
  el.classList.add(className);
};

export const removeClassFrom = (el, className) => {
  el.classList.remove(className);
};

export const addClassToArr = (elArr, className) => {
  elArr.forEach((el) => el.classList.add(className));
};

export const removeClassFromArr = (elArr, className) => {
  elArr.forEach((el) => el.classList.remove(className));
};
