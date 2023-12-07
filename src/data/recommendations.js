import { users } from "../config/mongoCollections.js";
import validation from "../helpers.js";

export const getHistory = async (emailAddress) => {
  emailAddress = validation.emailValidation(emailAddress);

  let usersCollection = undefined;
  let user = undefined;
  try {
    usersCollection = await users();
    user = await usersCollection.findOne({ emailAddress: emailAddress });
  } catch {
    throw "UnexpectedError: Failed to connect to DB";
  }
  if (user === null) {
    throw "Error: No user with provided email found.";
  }

  return user.recommendations;
};
