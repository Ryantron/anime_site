import { users } from "../config/mongoCollections.js";
import validation from "../helpers.js";
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
    throw "User with provided email already exists";
  }
  let newUser = {
    username: username,
    emailAddress: emailAddress,
    hashedPassword: hashedPassword,
  };

  const insertedInfo = await usersCollection.insertOne(newUser);
  if (!insertedInfo.acknowledged || !insertedInfo.insertedId) {
    throw "User could not be added";
  }

  return { insertedUser: true };
};

export const loginUser = async (username, password) => {
  if (!username || !password) {
    throw "You must provide both an username and a password";
  }
  username = username.toLowerCase();
  password = validation.passwordValidation(password);
  const usersCollection = await users();
  const user = await usersCollection.findOne({ username: username });
  if (user === null) {
    throw "Either the username or password is invalid";
  }
  const passwordCheck = await bcrypt.compare(password, user.hashedPassword);
  if (!passwordCheck) {
    throw "Either the username or password is invalid";
  }

  return {
    username: user.username,
    emailAddress: user.emailAddress,
  };
};

export const changeUserInfo = async (username, emailAddress, password) => {
  if (!emailAddress) {
    throw "You must provide your account's email address to modify username/password";
  }
  if (!username || !password) {
    throw "You must provide a username and password to modify.";
  }
  username = username.toLowerCase();
  password = validation.passwordValidation(password);
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  const usersCollection = await users();
  const user = await usersCollection.findOne({ emailAddress: emailAddress });
  if (user === null) {
    throw "No user with provided email found.";
  }
  const updatedUser = {
    username: username,
    emailAddress: emailAddress,
    hashedPassword: hashedPassword,
  };

  const updatedInfo = await usersCollection.updateOne(
    { emailAddress: emailAddress },
    { $set: updatedUser },
    { returnDocument: "after" },
  );

  return { emailAddress: emailAddress, username: username };
};
