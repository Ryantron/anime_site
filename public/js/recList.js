import {
  createErrorList,
  deleteError,
  addClassToArr,
  removeClassFromArr,
  ajaxPost,
} from "./helpers.js";

/**
 * HELPERS
 */

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
const stars = [...document.querySelectorAll(".fa-star")];

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
if (document.getElementById("addFriendForm")) {
  addFriendForm.addEventListener("submit", (e) => {
    e.preventDefault();
    deleteError();
    if (!handlebars.AUTHOR_NAME) {
      console.error("Author not found... Invalid page...");
      return (window.location.href = "/main");
    }
    ajaxPost(`/accounts/friend/${handlebars.AUTHOR_NAME}`, main);
  });
}
if (document.getElementById("addReviewForm")) {
  addReviewForm.addEventListener("submit", (e) => {
    e.preventDefault();
    deleteError();
    if (!handlebars.REC_ID) {
      console.error("Recommendation ID not found... Invalid page...");
      return (window.location.href = "/main");
    }
    const rating = e.submitter.value;
    ajaxPost(
      `/recommendations/review/${handlebars.REC_ID}?rating=${rating}`,
      main
    );
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
