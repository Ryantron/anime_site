import { ObjectId } from "mongodb";
import bcrypt from "bcrypt";

import { convertIdToStrArr, removeObjectIdFromUser } from "../src/helpers.js";
import { users } from "../src/config/mongoCollections.js";
const saltRounds = 16;

export async function getUserByEmail(emailAddress) {
  if (!emailAddress) throw new Error("Need to provide emailAddress");
  const usersCollection = await users();
  const user = await usersCollection.findOne({ emailAddress });
  if (user === null)
    throw new Error(`User not found by email: ${emailAddress}`);

  removeObjectIdFromUser(user);
  console.log(user);
  return user;
}

export async function addRecommendation({
  emailAddress,
  recommendation,
  ratings = 0,
} = {}) {
  if (!emailAddress || !recommendation)
    throw new Error("Need to provide emailAddress and recommendation array");
  if (!Array.isArray(recommendation))
    throw new Error("Recommendation is not an array");
  if (!(ratings >= 0 && ratings <= 5))
    throw new Error("Ratings is not between 0 to 5");

  const user = await getUserByEmail(emailAddress);
  const recObj = {
    _id: new ObjectId(),
    ratings,
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
  sendRequests = [],
  pendingRequests = [],
  friendList = [],
} = {}) {
  const res = {
    ...{
      username,
      emailAddress,
      hashedPassword: await bcrypt.hash(password, saltRounds),
      pfpId,
      sendRequests,
      pendingRequests,
      friendList,
      recommendations: [],
    },
    ...(malUsername ? { malUsername } : {}),
  };
  const usersCollection = await users();
  const user = await usersCollection.insertOne(res);
  if (!user) throw "Unable to add user to collection";
  removeObjectIdFromUser(user);
  return user;
}
