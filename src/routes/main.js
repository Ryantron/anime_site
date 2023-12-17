import express from "express";
const router = express.Router();
import {
  AuthError,
  errorToStatus,
} from "../helpers.js";
import {
  getManualListUsers,
  getUserRecs,
  getManualListRecs,
} from "../data/recommendations.js";

router
  .route("/")
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

router.route("/recommendations").post(async (req, res) => {
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

export default router;
