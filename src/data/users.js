import { response } from "express";
import { users } from "../config/mongoCollections.js";
import validation, {
  DBError,
  ResourcesError,
  createOptionalObject,
  removeObjectIdFromUser,
} from "../helpers.js";
import bcrypt from "bcrypt";
import { ObjectId } from "mongodb";
const saltRounds = 16;

export const registerUser = async (username, emailAddress, password) => {
  validation.inputCheck(username, emailAddress, password);
  emailAddress = emailAddress.toLowerCase();
  username = username.toLowerCase();
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const usersCollection = await users();
  let existingUser = await usersCollection.findOne({
    emailAddress: emailAddress,
  });
  if (existingUser !== null) {
    throw new RangeError("User with provided email already exists");
  }
  let newUser = {
    username: username,
    emailAddress: emailAddress,
    hashedPassword: hashedPassword,
    pfpId: 1,
    recommendations: [],
  };

  const insertedInfo = await usersCollection.insertOne(newUser);
  if (!insertedInfo.acknowledged || !insertedInfo.insertedId) {
    throw new DBError("User could not be added");
  }

  return { insertedUser: true };
};

export const loginUser = async (emailAddress, password) => {
  if (!emailAddress || !password) {
    throw new TypeError("You must provide both an email and a password");
  }

  if (typeof emailAddress !== "string" || typeof password !== "string") {
    throw new TypeError("Both username and password must be string inputs");
  }

  emailAddress = emailAddress.toLowerCase();
  emailAddress = validation.emailValidation(emailAddress);

  password = validation.passwordValidation(password);
  const usersCollection = await users();
  const user = await usersCollection.findOne({ emailAddress: emailAddress });
  // For login data functions, not finding user should return RangeError
  if (user === null) {
    throw new RangeError("Either the username or password is invalid");
  }
  const passwordCheck = await bcrypt.compare(password, user.hashedPassword);
  if (!passwordCheck) {
    throw new RangeError("Either the username or password is invalid");
  }

  removeObjectIdFromUser(user);
  return user;
};

export const changeUserInfo = async (
  id,
  username,
  emailAddress,
  password,
  pfpId
) => {
  if (!username && !emailAddress && !password && !pfpId)
    throw new RangeError("Must provide at least one input");

  let hashedPassword;
  if (!id) throw new TypeError("Must always provide id");
  else {
    id = validation.stringCheck(id);
    if (!ObjectId.isValid(id))
      throw new TypeError("Id provided is not a valid Object Id string");
    id = new ObjectId(id);
  }
  if (username) username = validation.stringCheck(username).toLowerCase();
  if (emailAddress) {
    emailAddress = validation.emailValidation(emailAddress).toLowerCase();
  }
  if (password) {
    password = validation.passwordValidation(password);
    hashedPassword = await bcrypt.hash(password, saltRounds);
  }
  if (pfpId) validation.integerCheck(pfpId, { min: 1, max: 5 });

  const updatedProps = {
    ...createOptionalObject("username", username),
    ...createOptionalObject("emailAddress", emailAddress),
    ...createOptionalObject("hashedPassword", hashedPassword),
    ...createOptionalObject("pfpId", pfpId),
  };

  const usersCollection = await users();
  const user = await usersCollection.findOne({ _id: id });
  if (user === null) {
    throw new ResourcesError("No user with provided email found.");
  }

  const updateRes = await usersCollection.updateOne(
    { _id: id },
    { $set: updatedProps },
    { returnDocument: "after" }
  );
  if (!updateRes) throw new DBError("DB Error.");

  if (!updateRes.acknowledged) throw new DBError("Unable to update DB.");

  const updatedUser = await usersCollection.findOne({
    _id: id,
  });

  if (updatedUser === null)
    throw new DBError(
      "DB was not updated even though update was acknowledged."
    );

  removeObjectIdFromUser(updatedUser);
  return updatedUser;
};

export const linkMalAccount = async (emailAddress, malUsername) => {
  if (!emailAddress || !malUsername) {
    throw new TypeError("You must provide both your email and malUsername");
  }
  emailAddress = validation.emailValidation(emailAddress);
  if (typeof malUsername !== "string") {
    throw new TypeError("malUsername must be a string input");
  }

  const MAL_API_URL =
    "https://api.myanimelist.net/v2/users/" + malUsername + "/animelist";
  const MAL_CLIENT_ID = "1998d4dbe36d8e9b017e280329d92592";

  await fetch(MAL_API_URL, {
    method: "GET",
    headers: {
      "X-MAL-CLIENT-ID": MAL_CLIENT_ID,
    },
  }).then((response) => {
    if (!response.ok) {
      throw new ResourcesError(
        `No user with provided username found. Status: ${response.status}`
      );
    }
  });

  let usersCollection = undefined;
  let user = undefined;
  try {
    usersCollection = await users();
    user = await usersCollection.findOne({ emailAddress: emailAddress });
  } catch {
    throw new DBError("Unable to query DB.");
  }
  if (user === null) {
    throw new ResourcesError("No user with provided email found.");
  }

  if (user.malUsername) {
    throw new RangeError(
      "You have a My Anime List account linked to your profile. Please unlink the current account to link a new one"
    );
  }

  const updatedInfo = await usersCollection.updateOne(
    { emailAddress: emailAddress },
    { $set: { malUsername: malUsername } },
    { returnDocument: "after" }
  );
  if (updatedInfo.modifiedCount === 0) {
    throw new DBError("Could not link account");
  }

  return { emailAddress: emailAddress, linkedAccount: true };
};

export const unlinkMalAccount = async (emailAddress) => {
  if (!emailAddress) {
    throw new TypeError("You must provide your email");
  }
  emailAddress = validation.emailValidation(emailAddress);
  let usersCollection = undefined;
  let user = undefined;
  try {
    usersCollection = await users();
    user = await usersCollection.findOne({ emailAddress: emailAddress });
  } catch {
    throw new DBError("Unable to query DB.");
  }
  if (user === null) {
    throw new ResourcesError("No user with provided email found.");
  }

  if (!user.malUsername) {
    throw new RangeError(
      "You do not have a My Anime List account linked to your profile."
    );
  }

  const updatedInfo = await usersCollection.updateOne(
    { emailAddress: emailAddress },
    { $unset: { malUsername: 1 } },
    { returnDocument: "after" }
  );
  if (updatedInfo.modifiedCount === 0) {
    throw new DBError("Could not unlink account.");
  }

  return { emailAddress: emailAddress, unlinkedAccount: true };
};

// Add user's _id to usersLiked for corresponding recListId (if not in usersLiked)
// TODO: error checking
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

  // User already liked the recList: no-op
  if (
    recList.usersLiked.find(
      (userObjId) => userObjId.toString() === currentUserId
    )
  ) {
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
