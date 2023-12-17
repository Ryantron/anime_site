import express from "express";
const router = express.Router();
import crypto from "crypto";
import validation, {
  errorToStatus,
} from "../helpers.js";
import {
  isFriendOrPending,
} from "../data/friends.js";
import {
  getRecommendationListAndAuthor,
  getHistory,
  rateRecommendations,
} from "../data/recommendations.js";

router.route("/:recId").get(async (req, res) => {
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

router.route("/review/:recId").post(async (req, res) => {
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

export default router;
