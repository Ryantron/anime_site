import { users } from "../src/config/mongoCollections.js";
import { ObjectId } from "mongodb";
import bcrypt from "bcrypt";
import { users } from "../src/config/mongoCollections.js";
const saltRounds = 16;

export async function getUserByEmail(emailAddress) {
  const usersCollection = await users();
  const user = await usersCollection.findOne({ emailAddress });
  user._id = user._id.toString();
  user.recommendations = user.recommendations.map((rec) => {
    rec._id = rec._id.toString();
    rec.usersLiked = rec.usersLiked.map((objId) => objId.toString());
    return rec;
  });
  return user;
}

export async function insertUser({
  username,
  emailAddress,
  password,
  pfpId,
  recommendations,
  malUsername,
}) {
  recommendations = recommendations.map((rec) => {
    rec._id = new ObjectId();
    return rec;
  });

  const res = {
    ...{
      username,
      emailAddress,
      hashedPassword: await bcrypt.hash(password, saltRounds),
      pfpId,
      recommendations,
    },
    ...(malUsername ? { malUsername } : {}),
  };
  const usersCollection = await users();
  const user = await usersCollection.insertOne(res);
  if (!user) throw "Unable to add user to collection";
  return user;
}
