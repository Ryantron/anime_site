import { ObjectId } from "mongodb";
import bcrypt from "bcrypt";

import validation, {
  convertIdToStrArr,
  removeObjectIdFromUser,
} from "../src/helpers.js";
import { users } from "../src/config/mongoCollections.js";
const saltRounds = 16;

export async function getUserByEmail(emailAddress) {
  if (!emailAddress) throw new Error("Need to provide emailAddress");
  const usersCollection = await users();
  const user = await usersCollection.findOne({ emailAddress });
  if (user === null)
    throw new Error(`User not found by email: ${emailAddress}`);

  removeObjectIdFromUser(user);
  return user;
}

export async function addRecommendation({
  emailAddress,
  recommendation,
  rating = 0,
} = {}) {
  emailAddress = validation.emailValidation(emailAddress);
  if (!recommendation)
    throw new Error("Need to provide emailAddress and recommendation array");
  if (!Array.isArray(recommendation))
    throw new Error("Recommendation is not an array");
  if (!(rating >= 0 && rating <= 5))
    throw new Error("Rating is not between 0 to 5");

  const user = await getUserByEmail(emailAddress);
  const recObj = {
    _id: new ObjectId(),
    rating,
    recommendation,
  };

  user.recommendations.push(recObj);

  const usersCollection = await users();
  const res = await usersCollection.updateOne(
    { emailAddress: emailAddress },
    {
      $set: {
        recommendations: user.recommendations,
      },
    },
    { returnDocument: "after" }
  );
}

export async function insertUser({
  username,
  emailAddress,
  password,
  malUsername,
  pfpId = 1,
  sentRequests = [],
  pendingRequests = [],
  friendList = [],
} = {}) {
  username = validation.stringCheck(username);
  emailAddress = validation.emailValidation(emailAddress);
  password = validation.passwordValidation(password);
  const res = {
    ...{
      username,
      emailAddress,
      hashedPassword: await bcrypt.hash(password, saltRounds),
      pfpId,
      sentRequests,
      pendingRequests,
      friendList,
      recommendations: [],
    },
    ...(malUsername ? { malUsername } : {}),
  };
  const usersCollection = await users();
  const result = await usersCollection.insertOne(res);
  if (!result) throw "Unable to add user to collection";

  const user = await usersCollection.findOne({ _id: result.insertedId });
  result.user = user;

  removeObjectIdFromUser(user);
  result._id = result.insertedId.toString();

  return result;
}
