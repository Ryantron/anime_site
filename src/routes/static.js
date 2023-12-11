import express from "express";
const router = express.Router();
import validation, {
  AuthError,
  DBError,
  ResourcesError,
  errorToStatus,
  IMAGE_PATHS,
} from "../helpers.js";
import {
  changeUserInfo,
  registerUser,
  loginUser,
  linkMalAccount,
  unlinkMalAccount,
} from "../data/users.js";
import {
  hasCurrentUserLikedAlready,
  isFriendAlready,
  getRecommendationListAndAuthor,
  likeRecAnimeList,
  getManualListUsers,
  getUserRecs,
  getManualListRecs,
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
          linkMessage: "Search using your MyAnimeList recommendations",
        });
      } else {
        //Route ran if logged in and not linked
        return res.render("main", {
          title: "Main",
          linkedRoute: "/accounts",
          linkMessage:
            "Link your MyAnimeList account to use MAL Functionality!",
        });
      }
    } else {
      //Route ran if not logged in
      return res.render("main", {
        title: "Main",
        linkedRoute: "/login",
        linkMessage: "Login to use MyAnimeList Functionality!",
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
      for (let x of finalAnimeArr)
      {
        if (isNaN(x)) throw new RangeError("Invalid Input");
        else finalAnimeArr[count] = parseInt(x);
        count++;
      }
      if (req.session.user) {
        //If section to add the manual list to the database is the user is logged in
        let result = await getManualListUsers(req.session.user.emailAddress, finalAnimeArr);
        return res.redirect("/recommendations/".concat(result.recId));
      } else {
        let result = await getManualListRecs(finalAnimeArr);
        console.log(result);
        return res.render('manualList', {
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

router.route("/main/recommendations").get(async (req, res) => {
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
    const alreadyFriended = req.session.user
      ? await isFriendAlready(req.session.user._id, recId)
      : true;
    const alreadyLiked = req.session.user
      ? await hasCurrentUserLikedAlready(req.session.user._id, recId)
      : true;
    return res.render("recommendationList", {
      title: "Recommendation List",
      image: authorRec.authorPfpPath,
      authorName: authorRec.authorName,
      authorId: authorRec.authorId,
      recId: recId,
      alreadyFriended: alreadyFriended,
      alreadyLiked: alreadyLiked,
      recommendations: authorRec.recList,
    });
  } catch (err) {
    return res.redirect(
      `/errors?errorStatus=${errorToStatus(err)}&message=${err}`
    );
  }
});

router.route("/recommendations/like/:recId").post(async (req, res) => {
  // If user had not liked before: add user like
  // Else: remove user like
  try {
    const recId = req.params.recId;
    if (!ObjectId.isValid(recId))
      throw new TypeError("recId is not a valid ObjectId type");
    await likeRecAnimeList(req.session.user?._id, recId);
  } catch (err) {
    return res.redirect(
      `/errors?errorStatus=${errorToStatus(err)}&message=${err}`
    );
  }
});

router.route("/recommendations/friend/:authorId").post(async (req, res) => {
  // Boilerplate
  try {
    const authorId = req.params.authorId;
    if (!ObjectId.isValid(authorId))
      throw new TypeError("authorId is not a valid ObjectId type");
    if (authorId == req.session.user?._id)
      throw new RangeError("You can't friend yourself.");
    //FIXME: something to finish, data function here
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
      return res.redirect(
        `/errors?errorStatus=${errorToStatus(err)}&message=${err.message}`
      );
    }

    try {
      const user = await loginUser(body.emailAddressInput, body.passwordInput);
      req.session.user = user;
      return res.redirect("/accounts");
    } catch (err) {
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
  const {
    username,
    emailAddress,
    malUsername,
    friendCount,
    friendList,
    recommendations,
  } = req.session.user;
  return res.render("accounts", {
    title: "Your Account",
    username: username,
    emailAddress: emailAddress,
    malUsername: malUsername ?? "N/A",
    friendCount: friendCount,
    friendList: friendList,
    recommendations: recommendations,
    hasLinked: malUsername !== undefined,
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
    res.redirect("/accounts");
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

export default router;
