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
const addFriendForm = document.querySelector("#addFriendForm");
const thumbsUpForm = document.querySelector("#thumbsUpForm");
const authorIdP = document.querySelector("#authorIdP");
const recIdP = document.querySelector("#recIdP");

addFriendForm.addEventListener("submit", (e) => {
  e.preventDefault();
  deleteError();
  if (authorIdP.textContent === null) {
    console.error("Author not found... Invalid page...");
    return (window.location.href = "/main");
  }
  $.ajax({
    method: "POST",
    url: `/recommendations/friend/${authorIdP.textContent}`,
  })
    .then(() => {
      return (window.location.href = `/recommendations/${recIdP.textContent}`);
    })
    .fail((xhr, _, err) => {
      const errEl = createErrorList([`Status ${xhr.status}: ${err}`]);
      main.appendChild(errEl);
    });
});

thumbsUpForm.addEventListener("submit", (e) => {
  e.preventDefault();
  deleteError();
  if (recIdP.textContent === null) {
    console.error("Recommendation ID not found... Invalid page...");
    return (window.location.href = "/main");
  }
  $.ajax({
    method: "POST",
    url: `/recommendations/like/${recIdP.textContent}`,
  })
    .then(() => {
      return (window.location.href = `/recommendations/${recIdP.textContent}`);
    })
    .fail((xhr, _, err) => {
      const errEl = createErrorList([`Status ${xhr.status}: ${err}`]);
      main.appendChild(errEl);
    });
});
