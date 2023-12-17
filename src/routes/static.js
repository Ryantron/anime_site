import express from "express";
const router = express.Router();
import crypto from "crypto";
import validation, {
  AuthError,
  DBError,
  ResourcesError,
  errorToStatus,
  IMAGE_PATHS,
  getUserByEmail,
} from "../helpers.js";
import {
  acceptFriendRequest,
  isFriendOrPending,
  rejectFriendRequest,
  removeFriend,
  sendFriendRequest,
} from "../data/friends.js";
import {
  changeUserInfo,
  registerUser,
  loginUser,
  linkMalAccount,
  unlinkMalAccount,
} from "../data/users.js";
import {
  getRecommendationListAndAuthor,
  likeRecAnimeList,
  getManualListUsers,
  getUserRecs,
  getManualListRecs,
  getHistory,
  rateRecommendations,
} from "../data/recommendations.js";
import { ObjectId } from "mongodb";

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
//Everything commented out with / * * / on the left side always
router
  .route("/main")
  .get(async (req, res) => {
    if (req.session.user) {
      if (req.session.user["malUsername"]) {
        //Route ran if logged in + linked MAL Username
        return res.render("main", {
          title: "Main",
          linkedRoute: "/main/recommendations",
          linkMessage: "Search using your MyAnimeList recommendations!",
          MalLinked: true,
          AccountLoggedIn: true,
        });
      } else {
        //Route ran if logged in and not linked
        return res.render("main", {
          title: "Main",
          linkedRoute: "/accounts",
          linkMessage:
            "Link your MyAnimeList account to use MAL Functionality!",
          MalLinked: false,
          AccountLoggedIn: true,
        });
      }
    } else {
      //Route ran if not logged in
      return res.render("main", {
        title: "Main",
        linkedRoute: "/login",
        linkMessage: "Login to use MyAnimeList Functionality!",
        MalLinked: false,
        AccountLoggedIn: false,
      });
    }
  })
  .post(async (req, res) => {
    try {
      if (typeof req.body["animeInput"] != "string")
        throw new RangeError("Invalid input");
      let animeInput = req.body["animeInput"].trim(); //trimming the initial input
      if (animeInput === "") throw new RangeError("Invalid input"); //Invalid input for empty strings/only spaces
      let animeArr = animeInput.split(","); //splitting into an array
      let finalAnimeArr = []; //the array that'll be used for comparing
      for (let x of animeArr) {
        //this entire for statement prunes the blank/space only inputs of the manual input
        if (x.trim() != "") {
          finalAnimeArr.push(x.trim());
        }
      }
      if (finalAnimeArr.length === 0) throw new RangeError("Invalid Input"); //If every single one was invalid, then errors, else goes with all other valid inputs
      let count = 0;
      for (let x of finalAnimeArr) {
        if (isNaN(x)) throw new RangeError("Invalid Input");
        else finalAnimeArr[count] = parseInt(x);
        count++;
      }
      if (req.session.user) {
        //If section to add the manual list to the database is the user is logged in
        let result = await getManualListUsers(
          req.session.user.emailAddress,
          finalAnimeArr
        );
        return res.redirect("/recommendations/".concat(result.recId));
      } else {
        let result = await getManualListRecs(finalAnimeArr);
        return res.render("manualList", {
          title: "Recommendation List",
          Result: result, //This will be some form of the returned list/Object list instead in the final, for now it just returns the list the user put it (with valid values)
        });
      }
    } catch (err) {
      //If the function errors out if no recommendations are found, I'll implement a case for that then.
      return res.redirect(
        `/errors?errorStatus=${errorToStatus(err)}&message=${err}`
      );
    }
  });

router.route("/main/recommendations").post(async (req, res) => {
  try {
    if (req.session.user) {
      //Checks for if the user is logged in, if they somehow get here without being so.
      if (req.session.user["malUsername"]) {
        //This should already be checked once you get here, but one more check doesn't hurt
        let newReccs = await getUserRecs(req.session.user["emailAddress"]);
        return res.redirect("/recommendations/".concat(newReccs.recId)); //Redirects to the recommendation page. (Will be functional when function and recommendations page is done)
      }
    }
    throw new AuthError("Not Authorized");
  } catch (err) {
    return res.redirect(
      `/errors?errorStatus=${errorToStatus(err)}&message=${err}`
    );
  }
});

router.route("/recommendations/:recId").get(async (req, res) => {
  try {
    const recId = req.params.recId;
    const authorRec = await getRecommendationListAndAuthor(recId);
    const isStrangers = req.session.user
      ? !(await isFriendOrPending(
          req.session.user.username,
          authorRec.authorName
        ))
      : true;
    // If logged in, add new recommendation list to session
    if (req.session.user) {
      const newRecHistory = await getHistory(req.session.user.emailAddress);
      req.session.user.recommendations = newRecHistory;
    }
    const isAuthor = req.session.user
      ? req.session.user._id === authorRec.authorId
      : false;
    let showFriendB = false;
    if (req.session.user) {
      if (!isAuthor && isStrangers) {
        showFriendB = true;
      }
    }
    return res.render("recommendationList", {
      title: "Recommendation List",
      recListNounce: crypto.randomUUID(),
      image: authorRec.authorPfpPath,
      isAuthor: isAuthor,
      authorName: authorRec.authorName,
      authorId: authorRec.authorId,
      recId: recId,
      reviewRating: authorRec.reviewRating,
      isStrangers: isStrangers,
      recommendations: authorRec.recList,
      showFriendButton: showFriendB,
    });
  } catch (err) {
    return res.redirect(
      `/errors?errorStatus=${errorToStatus(err)}&message=${err}`
    );
  }
});

router.route("/recommendations/review/:recId").post(async (req, res) => {
  try {
    if (!req.session.user)
      throw new Error(
        "Unexpected Error. Frontend should not be calling this route when user is not logged in."
      );
    const recId = validation.objectIdValidation(req.params.recId);
    const rating = validation.integerCheck(Number(req.query.rating), {
      min: 1,
      max: 5,
    });
    const result = await rateRecommendations(
      req.session.user.emailAddress,
      recId,
      rating
    );
    return res.status(200).send("Ok");
  } catch (err) {
    console.log(err);
    return res.status(errorToStatus(err)).send({
      message: err.message ?? "Unknown Error",
    });
  }
});

router.route("/accounts/friend/:username").post(async (req, res) => {
  try {
    let userName = validation.stringCheck(req.params.username);
    if (userName == req.session.user?.username)
      throw new RangeError("You can't friend yourself.");
    let ownUserName = validation.stringCheck(req.session.user.username);
    await sendFriendRequest(ownUserName, userName);
    return res.redirect("/accounts/friends");
  } catch (err) {
    return res.redirect(
      `/errors?errorStatus=${errorToStatus(err)}&message=${err}`
    );
  }
});

router.route("/accounts/friend/reject/:username").post(async (req, res) => {
  try {
    let userName = validation.stringCheck(req.params.username);
    if (userName == req.session.user?.username)
      throw new RangeError("You can't have a friend request from yourself.");
    let ownUserName = validation.stringCheck(req.session.user.username);
    await rejectFriendRequest(ownUserName, userName);
    return res.redirect("/accounts/friends");
  } catch (err) {
    return res.redirect(
      `/errors?errorStatus=${errorToStatus(err)}&message=${err}`
    );
  }
});

router.route("/accounts/friend/accept/:username").post(async (req, res) => {
  try {
    let userName = validation.stringCheck(req.params.username);
    if (userName == req.session.user?.username)
      throw new RangeError("You can't have a friend request from yourself.");
    let ownUserName = validation.stringCheck(req.session.user.username);
    await acceptFriendRequest(ownUserName, userName);
    return res.redirect("/accounts/friends");
  } catch (err) {
    return res.redirect(
      `/errors?errorStatus=${errorToStatus(err)}&message=${err}`
    );
  }
});

router.route("/accounts/friend/unfriend/:username").post(async (req, res) => {
  try {
    let userName = validation.stringCheck(req.params.username);
    if (userName == req.session.user?.username)
      throw new RangeError("You can't be friends with yourself.");
    let ownUserName = validation.stringCheck(req.session.user.username);
    await removeFriend(ownUserName, userName);
    return res.redirect("/accounts/friends");
  } catch (err) {
    return res.redirect(
      `/errors?errorStatus=${errorToStatus(err)}&message=${err}`
    );
  }
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
      console.log(err);
      return res.redirect(
        `/errors?errorStatus=${errorToStatus(err)}&message=${err.message}`
      );
    }

    try {
      const user = await loginUser(body.emailAddressInput, body.passwordInput);
      req.session.user = user;
      return res.redirect("/accounts");
    } catch (err) {
      console.log(err);
      return res.redirect(
        `/login?wasErrored=${true}&errorStatus=${errorToStatus(
          err
        )}&errorMessage=${err}`
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
      return res.redirect(
        `/errors?errorStatus=${errorToStatus(err)}&message=${err}`
      );
    }

    try {
      await registerUser(
        body.usernameInput.trim(),
        body.emailAddressInput.trim(),
        body.passwordInput.trim()
      );
      return res.redirect("/login");
    } catch (err) {
      return res.redirect(
        `/signup?wasErrored=${true}&errorStatus=${errorToStatus(
          err
        )}&errorMessage=${err}`
      );
    }
  });

router.route("/accounts").get(async (req, res) => {
  // Middleware requires req.session.user, else redirect to /login
  const { username, emailAddress, malUsername, recommendations, pfpId } =
    req.session.user;
  return res.render("accounts", {
    title: "Your Account",
    username: username,
    emailAddress: emailAddress,
    malUsername: malUsername || "N/A",
    recommendations: recommendations,
    hasLinked: malUsername !== undefined,
    image: IMAGE_PATHS[pfpId],
  });
});

router.route("/accounts/mal/link").post(async (req, res) => {
  const { malUsernameInput } = req.body;
  try {
    const updateInfo = await linkMalAccount(
      req.session.user.emailAddress,
      malUsernameInput
    );
    if (!updateInfo.linkedAccount) {
      return res.redirect(
        `/errors?errorStatus=${500}&errorMessage=${"Internal server error"}`
      );
    }
    // Update session: set malUsername
    req.session.user.malUsername = malUsernameInput;
    return res.redirect("/accounts");
  } catch (err) {
    return res.redirect(
      `/errors?errorStatus=${errorToStatus(err)}&message=${err}`
    );
  }
});

router.route("/accounts/mal/unlink").post(async (req, res) => {
  try {
    const updateInfo = await unlinkMalAccount(req.session.user.emailAddress);
    if (!updateInfo.unlinkedAccount) {
      return res.redirect(
        `/errors?errorStatus=${500}&message=${"Internal server error"}`
      );
    }
    // Update session: clear malUsername
    req.session.user.malUsername = undefined;
    return res.redirect("/accounts");
  } catch (err) {
    return res.redirect(
      `/errors?errorStatus=${errorToStatus(err)}&message=${err}`
    );
  }
});

router.route("/accounts/reset").patch(async (req, res) => {
  try {
    const body = req.body;
    if (
      !body.usernameInput &&
      !body.emailAddressInput &&
      !body.passwordInput &&
      !body.pfpIdInput
    )
      throw new RangeError("Must provide at least one input");
    if (body.usernameInput) validation.usernameValidation(body.usernameInput);
    if (body.emailAddressInput)
      validation.emailValidation(body.emailAddressInput);
    if (body.passwordInput) validation.passwordValidation(body.passwordInput);
    if (body.pfpIdInput)
      validation.integerCheck(body.pfpIdInput, { min: 1, max: 5 });

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

router.route("/accounts/friends").get(async (req, res) => {
  // Update session: all of user (for friend info, other user performs asynchronous change)
  const user = await getUserByEmail(req.session.user.emailAddress);
  req.session.user = user;
  return res.render("friends", {
    title: "Your Friends",
    friendCount: req.session.user.friendCount,
    friendList: req.session.user.friendList,
    pendingRequests: req.session.user.pendingRequests,
    sentRequests: req.session.user.sentRequests,
  });
});

export default router;
