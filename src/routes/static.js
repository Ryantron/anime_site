import express from "express";
const router = express.Router();
import helpers from "../helpers.js";
import { changeUserInfo } from "../data/users.js";

router.route("/").get(async (req, res) => {
  return res.render("aboutus", {
    title: "About Us",
  });
});

router.route("/aboutus").get(async (req, res) => {
  return res.render("aboutus", {
    title: "About Us",
  });
});

router.route("/accounts/reset").patch(async (req, res) => {
  // No pfp change yet
  /*
  Only when logged in? req.session would help
  -> Would fill in rest of details if only updating 1 at a time
  -> https://www.jotform.com/blog/wp-content/uploads/2022/03/jotform-profile-new-email-address.png
  Or update more than 1 at a time...
  */
  let userInfo = req.body;
  try {
    if (userInfo.username) {
      helpers.usernameValidation(userInfo.username);
    }
    if (userInfo.emailAddress) {
      helpers.emailValidation(userInfo.emailAddress);
    }
    if (userInfo.password) {
      helpers.passwordValidation(userInfo.password);
    }
  } catch (e) {
    // Client-side validation should prevent this
    return res.status(400).render("errors", {
      errorStatus: 400,
      title: "Error",
      errorMessage: "Invalid user info",
    });
  }

  /*
  Another problem: any 1 (or more?) parameter in req.body
  Then changeUserInfo needs to be changed
  */
  try {
    await changeUserInfo(
      userInfo.username,
      userInfo.emailAddress,
      userInfo.password,
    );
    res.redirect("accounts");
  } catch (e) {
    return res.status(400).render("errors", {
      errorStatus: 400,
      title: "Error",
      errorMessage: e,
    });
  }
});

export default router;
