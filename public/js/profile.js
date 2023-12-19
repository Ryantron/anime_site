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
