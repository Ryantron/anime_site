$(document).ready(function () {
  $("#manual-form").submit((event) => {
    let input = $("#animeInput").val().trim();
    let hasErred = false;
    if (typeof input != "string" && !hasErred) {
      //case
      $("#csverr").html("Your input must be a string!");
      event.preventDefault();
      hasErred = true;
    }
    if (input === "" && !hasErred) {
      //case
      $("#csverr").html("Your input cannot be empty!");
      event.preventDefault();
      hasErred = true;
    }
    input = input.split(",");
    let inputArr = [];
    for (let x of input) {
      if (x.trim() != "") {
        inputArr.push(x.trim());
      }
    }
    if (inputArr.length === 0 && !hasErred) {
      //case
      $("#csverr").html("Your input does not contain any valid values!");
      event.preventDefault();
      hasErred = true;
    }
    let count = 0;
    for (let x of inputArr) {
      if (isNaN(x) && !hasErred) {
        //case
        $("#csverr").html("Your input contains a non-number attribute!");
        event.preventDefault();
        hasErred = true;
        break;
      } else inputArr[count] = parseInt(x);
      count++;
    }
    if (!hasErred) {
      $("#csverr").html("");
    }
  });
});
