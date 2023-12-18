import { stringValidation, createErrorList, deleteError } from "./helpers.js";

/**
 * DOM ELEMENTS
 */

const manualForm = document.querySelector("#manual-form");
const animeInput = document.querySelector("#animeInput");
const errorContainer = document.querySelector("#errorContainer");

/**
 * EVENT LISTENERS
 */

manualForm.addEventListener("submit", (e) => {
  deleteError();
  const errors = [];
  let animeValue = stringValidation(animeInput.value);
  if (animeValue.success) animeValue = animeValue.data;
  else errors.push("(Anime List) An empty list was provided.");

  if (typeof animeValue === "string") {
    const animeList = animeValue
      .split(",")
      .map((el) => el.trim())
      .filter((el) => el !== "");

    if (animeList.length === 0)
      errors.push("(Anime List) Anime List is empty.");
    if (
      animeList.length !=
      animeList.filter((el) => isNaN(Number(el)) === false).length
    )
      errors.push(
        "(Anime List) No non-ID values are accepted. Examples of ID: 1, 40148, 49889."
      );
    if (animeList.length != [...new Set(animeList)].length)
      errors.push(
        "(Anime List) Duplicate IDs found. Please remove before submission."
      );
  }

  if (errors.length > 0) {
    e.preventDefault();
    const errLi = createErrorList(errors);
    errorContainer.appendChild(errLi);
  }
});

