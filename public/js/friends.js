/**
 * DOM ELEMENTS
 */

const friendListButton = document.querySelector("#friendList");
const pendingRequestsButton = document.querySelector("#pendingRequests");
const sentRequestsButton = document.querySelector("#sentRequests");
const friendListInfo = document.querySelector(".friendListInfo");
const pendingRequestsInfo = document.querySelector(".pendingRequestsInfo");
const sentRequestsInfo = document.querySelector(".sentRequestsInfo");

/**
 * EVENT LISTENERS
 */

// Toggle button event listeners
friendListButton.addEventListener("click", () => {
  friendListInfo.classList.remove("hidden");
  pendingRequestsInfo.classList.add("hidden");
  sentRequestsInfo.classList.add("hidden");
});

pendingRequestsButton.addEventListener("click", () => {
  friendListInfo.classList.add("hidden");
  pendingRequestsInfo.classList.remove("hidden");
  sentRequestsInfo.classList.add("hidden");
});

sentRequestsButton.addEventListener("click", () => {
  friendListInfo.classList.add("hidden");
  pendingRequestsInfo.classList.add("hidden");
  sentRequestsInfo.classList.remove("hidden");
});
