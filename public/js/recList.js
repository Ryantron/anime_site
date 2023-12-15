/**
 * HELPERS
 */

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

const addClassTo = (el, className) => {
  el.classList.add(className);
};

const removeClassFrom = (el, className) => {
  el.classList.remove(className);
};

const addClassToArr = (elArr, className) => {
  elArr.forEach((el) => el.classList.add(className));
};

const removeClassFromArr = (elArr, className) => {
  elArr.forEach((el) => el.classList.remove(className));
};

const fillStars = (stars, maxStarValue) => {
  const filledStars = stars.filter((star) => star.value <= maxStarValue);
  const unfilledStars = stars.filter((star) => star.value > maxStarValue);
  removeClassFromArr(stars, "fa-regular");
  removeClassFromArr(stars, "fa-solid");
  addClassToArr(filledStars, "fa-solid");
  addClassToArr(unfilledStars, "fa-regular");
};

/**
 * DOM ELEMENTS
 */

const main = document.querySelector("main");
const addFriendForm = document.querySelector("#addFriendForm");
const addReviewForm = document.querySelector("#addReviewForm");

const star1 = document.querySelector("#star1");
const star2 = document.querySelector("#star2");
const star3 = document.querySelector("#star3");
const star4 = document.querySelector("#star4");
const star5 = document.querySelector("#star5");

const stars = [star1, star2, star3, star4, star5];

/**
 * CONSTANTS
 */

/**
 * RUNTIME Dynamic HTML & CSS
 */

const filledStars = stars.filter(
  (star) => star.id[star.id.length - 1] <= handlebars.REVIEW_RATING
);

filledStars.forEach((star) => {
  star.classList.remove("fa-regular");
  star.classList.add("fa-solid");
});

/**
 * EVENT LISTENERS
 */

addFriendForm.addEventListener("submit", (e) => {
  e.preventDefault();
  deleteError();
  if (!handlebars.AUTHOR_ID) {
    console.error("Author not found... Invalid page...");
    return (window.location.href = "/main");
  }
  $.ajax({
    method: "POST",
    url: `/recommendations/friend/${handlebars.AUTHOR_ID}`,
  })
    .then(() => {
      return (window.location.href = `/recommendations/${handlebars.REC_ID}`);
    })
    .fail((xhr, _, err) => {
      const errEl = createErrorList([`Status ${xhr.status}: ${err}`]);
      main.appendChild(errEl);
    });
});

if (handlebars.IS_AUTHOR === true) {
  addReviewForm.addEventListener("submit", (e) => {
    e.preventDefault();
    deleteError();
    if (!handlebars.REC_ID) {
      console.error("Recommendation ID not found... Invalid page...");
      return (window.location.href = "/main");
    }

    const rating = e.submitter.value;

    $.ajax({
      method: "POST",
      url: `/recommendations/review/${handlebars.REC_ID}?rating=${rating}`,
    })
      .then((res) => {
        return (window.location.href = `/recommendations/${handlebars.REC_ID}`);
      })
      .fail((xhr, _, err) => {
        const errEl = createErrorList([`Status ${xhr.status}: ${err}`]);
        main.appendChild(errEl);
      });
  });

  addReviewForm.addEventListener("mouseover", (e) => {
    if (e.target.tagName != "BUTTON") return;
    const btn = e.target;
    fillStars(stars, btn.value);
  });

  addReviewForm.addEventListener("mouseout", (e) => {
    fillStars(stars, handlebars.REVIEW_RATING);
  });
}
