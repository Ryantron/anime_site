import express from "express";
const router = express.Router();
import validation from "../helpers.js";
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
  // TODO: pfp change implementation
  // Update exactly 1 field (username, email, password, or pfp)
  let userInfo = req.body;
  let fieldCode = undefined;
  let newField = undefined;
  try {
    if (userInfo.username) {
      validation.usernameValidation(userInfo.username);
      newField = userInfo.username;
      fieldCode = 0;
    } else if (userInfo.emailAddress) {
      validation.emailValidation(userInfo.emailAddress);
      newField = userInfo.emailAddress;
      fieldCode = 1;
    } else if (userInfo.password) {
      validation.passwordValidation(userInfo.password);
      newField = userInfo.password;
      fieldCode = 2;
    } else {
      validation.pfpValidation(userInfo.pfp);
      newField = userInfo.pfp;
      fieldCode = 3;
    }
  } catch (e) {
    // Client-side validation should prevent this
    return res.status(400).render("errors", {
      errorStatus: 400,
      title: "Error",
      errorMessage: "Invalid user info",
    });
  }

  try {
    const update = await changeUserInfo(
      req.session.user.emailAddress,
      newField,
      fieldCode,
    );
    if (!update) {
      res.status(500).render("errors", {
        errorStatus: 500,
        title: "Error",
        errorMessage: "Internal server error",
      });
    } else {
      res.redirect("accounts");
    }
  } catch (e) {
    res.status(400).render("errors", {
      errorStatus: 400,
      title: "Error",
      errorMessage: e,
    });
  }
});

export default router;
