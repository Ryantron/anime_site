import express from "express";
const router = express.Router();
import validation from "../helpers.js";
import {
  changeUserInfo,
  registerUser,
  linkMalAccount,
  unlinkMalAccount,
} from "../data/users.js";

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

router.route("/errors").get(async (req, res) => {
  const errorStatus = Number.parseInt(req.query.errorStatus);
  const errorMessage = req.query.message ?? "Internal Server Error";
  return res.render("errors", {
    title: "Errors",
    errorStatus: Number.isNaN(errorStatus) ? 500 : errorStatus,
    errorMessage,
  });
});

router
  .route("/login")
  .get(async (req, res) => {
    const wasErrored = req.query?.wasErrored ?? false;
    const errorStatus = req.query?.errorStatus ?? 500;
    const errorMessage = req.query?.errorMessage ?? "Internal Server Error";
    return res.render("login", {
      title: "Login",
      wasErrored,
      errorStatus,
      errorMessage,
    });
  })
  .post(async (req, res) => {
    const body = req.body;

    try {
      validation.emailValidation(body.emailAddressInput);
      validation.passwordValidation(body.passwordInput);
    } catch (err) {
      return res.redirect(`/errors?errorStatus=${400}&message=${err}`);
    }

    try {
      const user = loginUser(body.usernameInput, body.passwordInput);
      req.session.user = user;
      return res.redirect("/accounts");
    } catch (err) {
      return res.redirect(
        `/login?wasErrored=${true}&errorStatus=${500}&errorMessage=${"Internal Server Error"}`
      );
    }
  });

router
  .route("/signup")
  .get(async (req, res) => {
    const wasErrored = req.query?.wasErrored ?? false;
    const errorStatus = req.query?.errorStatus ?? 500;
    const errorMessage = req.query?.errorMessage ?? "Internal Server Error";
    return res.render("signup", {
      title: "Signup",
      wasErrored,
      errorStatus,
      errorMessage,
    });
  })
  .post(async (req, res) => {
    const body = req.body;

    try {
      validation.inputCheck(
        body.usernameInput,
        body.emailAddressInput,
        body.passwordInput
      );
    } catch (err) {
      return res.redirect(`/errors?errorStatus=${400}&message=${err}`);
    }

    try {
      registerUser(
        body.usernameInput.trim(),
        body.emailAddressInput.trim(),
        body.passwordInput.trim()
      );
      return res.redirect("/login");
    } catch (err) {
      return res.redirect(
        `/signup?wasErrored=${true}&errorStatus=${500}&errorMessage=${"Internal Server Error"}`
      );
    }
  });

router.route("/accounts/mal/link/:malUsername").post(async (req, res) => {
  const { emailAddress, malUsername } = req.body;
  try {
    const updateInfo = await linkMalAccount(emailAddress, malUsername);
    if (!updateInfo.linkedAccount) {
      return res.status(500).render("errors", {
        errorStatus: 500,
        title: "Error",
        errorMessage: "Internal server error",
      });
    }
    res.redirect("/accounts");
  } catch (e) {
    res.status(400).render("errors", {
      errorStatus: 400,
      title: "Error",
      errorMessage: e,
    });
  }
});

router.route("/accounts/mal/unlink").post(async (req, res) => {
  const { emailAddress, malUsername } = req.body;
  try {
    const updateInfo = await unlinkMalAccount(emailAddress, malUsername);
    if (!updateInfo.unlinkedAccount) {
      return res.status(500).render("errors", {
        errorStatus: 500,
        title: "Error",
        errorMessage: "Internal server error",
      });
    }
    res.redirect("/accounts");
  } catch (e) {
    res.status(400).render("errors", {
      errorStatus: 400,
      title: "Error",
      errorMessage: e,
    });
  }
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
      fieldCode
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
