import express from "express";
const router = express.Router();
import validation, {
  DBError,
  ResourcesError,
  errorToStatus,
} from "../helpers.js";
import {
  changeUserInfo,
  registerUser,
  loginUser,
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
//Everything commented out with / * * / on the left side always
router
  .route("/main")
  .get(async (req, res) => {
  if (req.session.user)
  {
    if (req.session.user["MALUsername"])
    {
      //Route ran if logged in + linked MAL Username
      return res.render("main", {
      title: "Main",
      linkedRoute: "/main/recommendations",
      linkMessage: "Search using your MyAnimeList recommendations",
      });
    }
    else
    {
      //Route ran if logged in and not linked
      return res.render("main", {
        title: "Main",
        linkedRoute: "/accounts",
        linkMessage: "Link your MyAnimeList account to use MAL Functionality!",
      });
    }
  }
  else
  {
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
      if (typeof req.body["animeInput"] != 'string') throw new RangeError("Invalid input"); 
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
      //let newManList = placeholderManRecc(finalAnimeArr);  //Placeholder function that obtains the object list of recommendations, commented out until implemented
      if (req.session.user)    //If section to add the manual list to the database is the user is logged in
      {
        //let manObjectId = placeholderManAddDb(newManList);   //Placeholder function to add a manual list to the database, might need another parameter such as req.session.user[emailAddress] to work, commented out until implemented
        let manObjectId = "success";                                    //Testing purposes, delete when above line implemented
        return res.redirect("/recommendations/".concat(manObjectId));   //Redirects to recommendations page (will work when both recommendations and function are implemented)
      }
      else
      {
        return res.render("manualList", {
        //Renders the manual list in its own screen, I realized that I don't actually need to use /entries and can just render it here in /main
        NoResult: false, //This variable will be used in a later potential check for if the function errors out if there's no results, below I'll catch that specific error and set this to true.
        Result: finalAnimeArr, //This will be some form of the returned list/Object list instead in the final, for now it just returns the list the user put it (with valid values)
        });
      }
    } 
    catch (err) {
      //If the function errors out if no recommendations are found, I'll implement a case for that then.
      return res.redirect(`/errors?errorStatus=${errorToStatus(err)}&message=${err}`);
    }
});

router.route("/main/recommendations").get(async (req, res) => {
  try{ 
    if (req.session.user)                     //Checks for 
    {
      if (req.session.user["MALUsername"])    //This should already be checked once you get here, but one more check doesn't hurt
      {
        //let newReccs = malReccFunction(req.session.user["emailAddress"]);      //Placeholder function that returns the object id of a myanimelist recc list that is inserted into the db
        let newReccs = "success"                                        //Testing purposes, delete when above line implemented
        return res.redirect("/recommendations/".concat(newReccs));      //Redirects to the recommendation page. (Will be functional when function and recommendations page is done)
      }
    }
    throw new AuthError("Not Authorized");
  }
  catch (err) {
    return res.redirect(`/errors?errorStatus=${errorToStatus(err)}&message=${err}`);
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

router.route("/accounts/mal/link/:malUsername").post(async (req, res) => {
  const { emailAddress, malUsername } = req.body;
  try {
    const updateInfo = await linkMalAccount(emailAddress, malUsername);
    if (!updateInfo.linkedAccount) {
      return res.redirect(
        `/errors?errorStatus=${500}&message=${"Internal server error"}`
      );
    }
    return res.redirect("/accounts");
  } catch (err) {
    return res.redirect(
      `/errors?errorStatus=${errorToStatus(err)}&message=${err}`
    );
  }
});

router.route("/accounts/mal/unlink").post(async (req, res) => {
  const { emailAddress, malUsername } = req.body;
  try {
    const updateInfo = await unlinkMalAccount(emailAddress, malUsername);
    if (!updateInfo.unlinkedAccount) {
      return res.redirect(
        `/errors?errorStatus=${500}&message=${"Internal server error"}`
      );
    }
    res.redirect("/accounts");
  } catch (err) {
    return res.redirect(
      `/errors?errorStatus=${errorToStatus(err)}&message=${err}`
    );
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
  } catch (err) {
    // Client-side validation should prevent this
    return res.redirect(
      `/errors?errorStatus=${errorToStatus(err)}&message=${err}`
    );
  }

  try {
    const update = await changeUserInfo(
      req.session.user.emailAddress,
      newField,
      fieldCode
    );
    if (!update) {
      return res.redirect(
        `/errors?errorStatus=${500}&message=${"Internal server error"}`
      );
    } else {
      res.redirect("accounts");
    }
  } catch (err) {
    return res.redirect(
      `/errors?errorStatus=${errorToStatus(err)}&message=${err}`
    );
  }
});

export default router;
