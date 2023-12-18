import crypto from "crypto";
import express from "express";
const router = express.Router();
import validation, {
  errorToStatus,
  IMAGE_PATHS,
  getUserByEmail,
  friendRoute,
} from "../helpers.js";
import {
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
  sendFriendRequest,
} from "../data/friends.js";
import {
  changeUserInfo,
  linkMalAccount,
  unlinkMalAccount,
} from "../data/users.js";

router.route("/").get(async (req, res) => {
  // Middleware requires req.session.user, else redirect to /login
  const { username, emailAddress, malUsername, recommendations, pfpId } =
    req.session.user;
  return res.render("accounts", {
    title: "Your Account",
    username: username,
    emailAddress: emailAddress,
    malUsername: malUsername || "N/A",
    recommendations: recommendations,
    hasLinked: malUsername !== "",
    image: IMAGE_PATHS[pfpId],
  });
});

router.route("/friends").get(async (req, res) => {
  // Update session: all of user (for friend info, other user performs asynchronous change)
  const user = await getUserByEmail(req.session.user.emailAddress);
  req.session.user = user;
  return res.render("friends", {
    title: "Your Friends",
    username: req.session.user.username,
    friendsNonce: crypto.randomUUID(),
    friendCount: req.session.user.friendCount,
    friendList: req.session.user.friendList.map((obj) => obj.username),
    pendingRequests: req.session.user.pendingRequests,
    sentRequests: req.session.user.sentRequests,
  });
});

router.route("/friend/:username").post(async (req, res) => {
  try {
    await friendRoute(req, res, sendFriendRequest);
    return res.json({
      message: "success",
    });
  } catch (err) {
    return res.status(errorToStatus(err)).send({
      message: err.message ?? "Unknown Error",
    });
  }
});

router.route("/friend/reject/:username").post(async (req, res) => {
  try {
    await friendRoute(req, res, rejectFriendRequest);
    return res.redirect("/accounts/friends");
  } catch (err) {
    return res.redirect(
      `/errors?errorStatus=${errorToStatus(err)}&message=${err}`
    );
  }
});

router.route("/friend/accept/:username").post(async (req, res) => {
  try {
    await friendRoute(req, res, acceptFriendRequest);
    return res.redirect("/accounts/friends");
  } catch (err) {
    return res.redirect(
      `/errors?errorStatus=${errorToStatus(err)}&message=${err}`
    );
  }
});

router.route("/friend/unfriend/:username").post(async (req, res) => {
  try {
    await friendRoute(req, res, removeFriend);
    return res.redirect("/accounts/friends");
  } catch (err) {
    return res.redirect(
      `/errors?errorStatus=${errorToStatus(err)}&message=${err}`
    );
  }
});

router.route("/mal/link").post(async (req, res) => {
  try {
    const { malUsernameInput } = req.body;
    const malUsername = validation.stringCheck(malUsernameInput);
    const updateInfo = await linkMalAccount(
      req.session.user.emailAddress,
      malUsername
    );
    if (!updateInfo.linkedAccount) {
      return res.redirect(
        `/errors?errorStatus=${500}&errorMessage=${"Internal server error"}`
      );
    }
    // Update session: set malUsername
    req.session.user.malUsername = malUsername.trim();
    return res.redirect("/accounts");
  } catch (err) {
    return res.redirect(
      `/errors?errorStatus=${errorToStatus(err)}&message=${err}`
    );
  }
});

router.route("/mal/unlink").post(async (req, res) => {
  try {
    const updateInfo = await unlinkMalAccount(req.session.user.emailAddress);
    if (!updateInfo.unlinkedAccount) {
      return res.redirect(
        `/errors?errorStatus=${500}&message=${"Internal server error"}`
      );
    }
    // Update session: clear malUsername
    req.session.user.malUsername = "";
    return res.redirect("/accounts");
  } catch (err) {
    return res.redirect(
      `/errors?errorStatus=${errorToStatus(err)}&message=${err}`
    );
  }
});

router.route("/reset").patch(async (req, res) => {
  try {
    const body = req.body;
    if (
      !body.usernameInput &&
      !body.emailAddressInput &&
      !body.passwordInput &&
      !body.pfpIdInput
    )
      throw new RangeError("Must provide at least one input");
    if (body.usernameInput) {
      validation.usernameValidation(body.usernameInput);
    }
    if (body.emailAddressInput) {
      validation.emailValidation(body.emailAddressInput);
    }
    if (body.passwordInput) {
      validation.passwordValidation(body.passwordInput);
    }
    if (body.pfpIdInput) {
      body.pfpIdInput = validation.pfpValidation(body.pfpIdInput, {
        min: 1,
        max: 5,
      });
    }

    const user = await changeUserInfo(
      req.session.user._id,
      body.usernameInput,
      body.emailAddressInput,
      body.passwordInput,
      body.pfpIdInput
    );
    req.session.user.username = user.username;
    req.session.user.emailAddress = user.emailAddress;
    req.session.user.hashedPassword = user.hashedPassword;
    req.session.user.pfpId = user.pfpId;
    return res.redirect("/accounts");
  } catch (err) {
    return res.redirect(
      `/errors?errorStatus=${errorToStatus(err)}&message=${err}`
    );
  }
});
export default router;
