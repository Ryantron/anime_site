import { users } from "../config/mongoCollections.js";
import validation, {
  DBError,
  ResourcesError,
  IMAGE_PATHS,
  removeObjectIdFromUser,
} from "../helpers.js";
import { MAL_HANDLER } from "./mal-handler.js";
import { ObjectId } from "mongodb";

const MAL_API_URL = "https://api.myanimelist.net/v2/users/";
const MAL_CLIENT_ID = "1998d4dbe36d8e9b017e280329d92592";
const MAL_CLIENT_HEADERS = { "X-MAL-CLIENT-ID": MAL_CLIENT_ID };

// Helper function for getUserRecs
const getUserAnimeList = async (emailAddress) => {
  if (!emailAddress) {
    throw "You must supply your accounts email address";
  }
  emailAddress = validation.emailValidation(emailAddress);
  const usersCollection = await users();
  const user = await usersCollection.findOne({ emailAddress: emailAddress });
  if (user === null) {
    throw "Error: No user with provided email found.";
  }

  if (!user.malUsername) {
    throw "Error: You dont have a linked myanimelist account, please link your account to get recommendations based on MAL profile";
  }
  const URL =
    MAL_API_URL + user.malUsername + "/animelist?fields=completed&limit=1000";

  const response = await MAL_HANDLER.request(URL, MAL_CLIENT_HEADERS, "GET");
  const userList = await response.json();

  return userList.data;
};

// Helper function for getUserRecs
const getAnimeRecs = async (animeId) => {
  const URL =
    "https://api.myanimelist.net/v2/anime/" +
    animeId +
    "?fields=recommendations";
  const response = await MAL_HANDLER.request(URL, MAL_CLIENT_HEADERS, "GET");
  let recs = await response.json();
  return recs.recommendations;
};

// Helper function for getUserRecs
const getTopFiveRecs = async (recs, showsSeen, emailAddress) => {
  const usersCollection = await users();
  const user = await usersCollection.findOne({ emailAddress: emailAddress });
  if (user) {
    const userRecs = user.recommendations;
    if (userRecs) {
      for (const entry in userRecs) {
        const entryData = userRecs[entry].recommendations;
        for (const anime in entryData) {
          showsSeen.push(entryData[anime].id);
        }
      }
    }
  }
  const filterRecs = recs.filter((num) => !showsSeen.includes(num));
  const counts = {};

  filterRecs.forEach((element) => {
    counts[element] = (counts[element] || 0) + 1;
  });

  const sortedRecs = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const topFive = sortedRecs.slice(0, 5);

  let finalRecs = [];
  for (const pair in topFive) {
    const anime = await getAnimeInfo(topFive[pair][0]);
    delete anime.main_picture;
    anime.frequency = topFive[pair][1];
    finalRecs.push(anime);
  }
  return finalRecs;
};

// Helper function for getUserRecs
// Exported for testing purposes
export const getAnimeInfo = async (animeId) => {
  const URL =
    "https://api.myanimelist.net/v2/anime/" + animeId + "?fields=title,";
  const response = await MAL_HANDLER.request(URL, MAL_CLIENT_HEADERS, "GET");
  let animeInfo = await response.json();
  return animeInfo;
};

export const getHistory = async (emailAddress) => {
  emailAddress = validation.emailValidation(emailAddress);

  let usersCollection = undefined;
  let user = undefined;
  try {
    usersCollection = await users();
    user = await usersCollection.findOne({ emailAddress: emailAddress });
  } catch {
    throw new DBError("UnexpectedError: Failed to connect to DB");
  }
  if (user === null) {
    throw new ResourcesError("Error: No user with provided email found.");
  }

  removeObjectIdFromUser(user);
  return user.recommendations;
};

export const getUserRecs = async (emailAddress) => {
  let recs = [];
  let showsSeen = [];
  const userList = await getUserAnimeList(emailAddress);
  for (const anime of userList) {
    showsSeen.push(anime.node.id);
    const recdata = await getAnimeRecs(anime.node.id);
    for (const entry of recdata) {
      recs.push(entry.node.id);
    }
  }

  const animeRecommendations = await getTopFiveRecs(
    recs,
    showsSeen,
    emailAddress
  );

  const usersCollection = await users();
  const user = await usersCollection.findOne({ emailAddress: emailAddress });
  let recommendationArray = user.recommendations;
  if (!recommendationArray) {
    recommendationArray = [];
  }

  const insertRec = {
    _id: new ObjectId(),
    usersLiked: [],
    rating: 0,
    recommendations: animeRecommendations,
  };
  let recId = insertRec._id.toString();
  recommendationArray.push(insertRec);
  const updatedRecommendations = {
    recommendations: recommendationArray,
  };

  const updatedInfo = await usersCollection.updateOne(
    { emailAddress: emailAddress },
    { $set: updatedRecommendations },
    { returnDocument: "after" }
  );

  if (updatedInfo.modifiedCount === 0)
    throw "Could not update recommendation successfully";

  return {
    emailAddress: emailAddress,
    recommendations: updatedRecommendations,
    recId: recId,
  };
};

export const getManualListUsers = async (emailAddress, idArray) => {
  emailAddress = validation.emailValidation(emailAddress);
  if (!Array.isArray(idArray)) {
    throw "You must provide an array of animeIds";
  }
  if (idArray.length === 0) {
    throw "You must provide a non-empty array of integers";
  }
  idArray.forEach((id) => {
    if (!Number.isInteger(id)) {
      throw "every animeId must be an integer";
    }
  });

  let recs = [];
  let showsSeen = [];

  for (const id in idArray) {
    showsSeen.push(idArray[id]);
    const recdata = await getAnimeRecs(idArray[id]);
    for (const entry of recdata) {
      recs.push(entry.node.id);
    }
  }

  const animeRecommendations = await getTopFiveRecs(
    recs,
    showsSeen,
    emailAddress
  );

  const usersCollection = await users();
  const user = await usersCollection.findOne({ emailAddress: emailAddress });
  let recommendationArray = user.recommendations;
  if (!recommendationArray) {
    recommendationArray = [];
  }

  const insertRec = {
    _id: new ObjectId(),
    usersLiked: [],
    rating: 0,
    recommendations: animeRecommendations,
  };
  let recId = insertRec._id.toString();
  recommendationArray.push(insertRec);
  const updatedRecommendations = {
    recommendations: recommendationArray,
  };

  const updatedInfo = await usersCollection.updateOne(
    { emailAddress: emailAddress },
    { $set: updatedRecommendations },
    { returnDocument: "after" }
  );

  if (updatedInfo.modifiedCount === 0)
    throw "Could not update recommendation successfully";

  return {
    emailAddress: emailAddress,
    recommendations: insertRec,
    recId: recId,
    inserted: true,
  };
};

export const getManualListRecs = async (idArray) => {
  if (!Array.isArray(idArray)) {
    throw "You must provide an array of animeIds";
  }
  if (idArray.length === 0) {
    throw "You must provide a non-empty array of integers";
  }
  idArray.forEach((id) => {
    if (!Number.isInteger(id)) {
      throw "every animeId must be an integer";
    }
  });

  const animeRecommendations = await getTopFiveRecs(recs, showsSeen);
  return animeRecommendations;
};

export const rateRecommendations = async (
  emailAddress,
  recommendationId,
  rating
) => {
  if (!emailAddress || !recommendationId || !rating) {
    throw "You must provide an email address, recommendationId, and a rating";
  }
  emailAddress = validation.emailValidation(emailAddress);
  if (!Number.isInteger(rating)) {
    throw "Rating must be an integer between 1-5";
  }
  if (!ObjectId.isValid(recommendationId)) throw "invalid object Id";

  const usersCollection = await users();
  const user = await usersCollection.findOne({ emailAddress: emailAddress });
  const recommendations = user.recommendations;
  let updateRecRating;
  let index;
  recommendations.forEach((recommendation) => {
    if (recommendation._id.toString() == recommendationId) {
      index = recommendations.indexOf(recommendation);
      updateRecRating = recommendation;
    }
  });
  if (!updateRecRating) {
    throw "No recommendation with that id found";
  }

  updateRecRating.rating = rating;
  recommendations[index] = updateRecRating;
  const updatedRating = {
    recommendations,
  };

  const updatedInfo = await usersCollection.updateOne(
    { emailAddress: emailAddress },
    { $set: updatedRating },
    { returnDocument: "after" }
  );

  if (updatedInfo.modifiedCount === 0)
    throw "Could not update recommendation successfully";

  return { updateRecRating };
};
export const hasCurrentUserLikedAlready = async (currentUserId, recListId) => {
  // Validate emailAddress and recListId
  currentUserId = validation.stringCheck(currentUserId);
  recListId = validation.stringCheck(recListId);

  if (!ObjectId.isValid(currentUserId))
    throw new TypeError("currentUserId is not a valid ObjectId type");
  if (!ObjectId.isValid(recListId))
    throw new TypeError("recListId is not a valid ObjectId type");

  const usersCollection = await users();
  const user = await usersCollection.findOne({
    "recommendations._id": new ObjectId(recListId),
  });

  if (user === null)
    throw new ResourcesError(
      `No user with recommendation id ${recListId} found.`
    );

  const recList = user.recommendations.find(
    (rec) => rec._id.toString() === recListId
  );
  if (!recList) throw new Error("Interal Error, recList is null");

  if (
    recList.usersLiked.find(
      (userObjId) => userObjId.toString() === currentUserId
    )
  ) {
    return true;
  } else return false;
};

export const isFriendAlready = async (currentUserId, authorUserId) => {
  return false;
};

export const getRecommendationListAndAuthor = async (recListId) => {
  recListId = validation.stringCheck(recListId);
  if (!ObjectId.isValid(recListId))
    throw new TypeError("recListId is not a valid ObjectId type");

  const usersCollection = await users();
  const user = await usersCollection.findOne({
    "recommendations._id": new ObjectId(recListId),
  });
  if (user === null)
    throw new ResourcesError(
      "User with recommendation list is not found in getRecommendationList"
    );

  const recListSubDoc = user.recommendations.find(
    (rec) => rec._id.toString() === recListId
  );

  if (!recListSubDoc)
    throw new Error("Internal Error. Author found, but rec list not found.");

  return {
    authorName: user.username,
    authorId: user._id.toString(),
    authorPfpPath: IMAGE_PATHS[user.pfpId],
    recList: recListSubDoc.recommendations,
  };
};

// Add user's _id to usersLiked for corresponding recListId (if not in usersLiked)
// REMOVES unlike if the user already liked
export const likeRecAnimeList = async (currentUserId, recListId) => {
  if (!ObjectId.isValid(currentUserId))
    throw new TypeError("currentUserId is not a valid ObjectId type");
  if (!ObjectId.isValid(recListId))
    throw new TypeError("recListId is not a valid ObjectId type");
  const usersCollection = await users();
  const user = await usersCollection.findOne({
    _id: new ObjectId(currentUserId),
  });

  if (user === null) {
    throw new ResourcesError(`No user with user id ${currentUserId} found.`);
  }

  // recList not just the recommendationList, but its object wrapper
  const recList = user.recommendations.find(
    (rec) => rec._id.toString() === recListId
  );
  if (!recList) {
    throw new Error("Interal Error, recList is null");
  }

  // User already liked the recList: REMOVE like
  if (
    recList.usersLiked.find(
      (userObjId) => userObjId.toString() === currentUserId
    )
  ) {
    const updatedInfo = await usersCollection.updateOne(
      { "recommendations._id": new ObjectId(recListId) },
      { $pull: { "recommendations.$.usersLiked": currentUserId } },
      { returnDocument: "after" }
    );
    if (updatedInfo.modifiedCount === 0) {
      throw new DBError("Like could not be removed");
    }
    return { addedLike: false };
  } else {
    // Add user like
    const updatedInfo = await usersCollection.updateOne(
      { "recommendations._id": new ObjectId(recListId) },
      { $push: { "recommendations.$.usersLiked": currentUserId } },
      { returnDocument: "after" }
    );
    if (updatedInfo.modifiedCount === 0) {
      throw new DBError("Like could not be added");
    }
    return { addedLike: true };
  }
};
