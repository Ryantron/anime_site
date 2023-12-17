import {
  ajaxPost,
  createErrorList,
  deleteError,
  usernameValidation,
} from "./helpers.js";

/**
 * DOM ELEMENTS
 */

const errorContainer = document.querySelector("#errorContainer");

const friendRequestByTextForm = document.querySelector(
  "#friendRequestByTextForm"
);
const friendRequestInput = document.querySelector("#friendRequestInput");

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

friendRequestByTextForm.addEventListener("submit", (e) => {
  e.preventDefault();
  deleteError();

  let targetUsername = friendRequestInput.value;
  targetUsername = usernameValidation(targetUsername);
  if (targetUsername.success) {
    targetUsername = targetUsername.data;
    ajaxPost(`/accounts/friend/${targetUsername}`, errorContainer);
  } else {
    const errLi = createErrorList([targetUsername.error]);
    errorContainer.appendChild(errLi);
  }
});
