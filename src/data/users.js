import { response } from "express";
import { users } from "../config/mongoCollections.js";
import validation, { DBError, ResourcesError } from "../helpers.js";
import bcrypt from "bcrypt";
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
  emailAddress = emailAddress.toLowerCase();

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

  return {
    username: user.username,
    emailAddress: user.emailAddress,
  };
};

export const changeUserInfo = async (username, emailAddress, password) => {
  if (
    typeof username !== "string" ||
    typeof emailAddress !== "string" ||
    typeof password !== "string"
  ) {
    throw new TypeError("All inputs must be a string");
  }
  if (!emailAddress) {
    throw new TypeError(
      "You must provide your account's email address to modify username/password"
    );
  }
  if (!username || !password) {
    throw new TypeError("You must provide a username and password to modify.");
  }

  username = username.toLowerCase();
  password = validation.passwordValidation(password);
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  const usersCollection = await users();
  const user = await usersCollection.findOne({ emailAddress: emailAddress });
  if (user === null) {
    throw new ResourcesError("No user with provided email found.");
  }
  const updatedUser = {
    username: username,
    emailAddress: emailAddress,
    hashedPassword: hashedPassword,
  };

  const updatedInfo = await usersCollection.updateOne(
    { emailAddress: emailAddress },
    { $set: updatedUser },
    { returnDocument: "after" }
  );

  if (!updatedInfo.acknowledged) throw new DBError("Unable to update DB.");

  // TODO: Error testing for

  return { emailAddress: emailAddress, username: username };
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

export const unlinkMalAccount = async (emailAddress, malUsername) => {
  if (!emailAddress || !malUsername) {
    throw new TypeError("You must provide both your email and malUsername");
  }
  emailAddress = validation.emailValidation(emailAddress);
  if (typeof malUsername !== "string") {
    throw new TypeError("malUsername must be a string input");
  }
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
