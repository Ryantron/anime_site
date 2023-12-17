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
