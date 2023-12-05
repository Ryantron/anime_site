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

export const loginUser = async (emailAddress, password) => {
  if (!emailAddress || !password) {
    throw "You must provide both an email and a password";
  }
  emailAddress = validation.emailValidation(emailAddress);
  emailAddress = emailAddress.toLowerCase();
  password = validation.passwordValidation(password);
  const usersCollection = await users();
  const user = await usersCollection.findOne({ emailAddress: emailAddress });
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

// TODO: newPfp implementation and pfpValidation()
export const changeUserInfo = async (emailAddress, newInfo, fieldCode) => {
  // fieldCode: 0=newUsername, 1=newEmail, 2=newPassword, 3=newPfp
  const usersCollection = await users();
  switch (fieldCode) {
    case 0: // Update username
      newInfo = validation.usernameValidation(newInfo);
      await usersCollection.findOneAndUpdate(
        { emailAddress: emailAddress }, // Filter
        { $set: { username: newInfo } }, // Update
        { returnDocument: "after" }, // Options
      );
    case 1: // Update email
      newInfo = validation.emailValidation(newInfo);
      newInfo = newInfo.toLowerCase();
      await usersCollection.findOneAndUpdate(
        { emailAddress: emailAddress }, // Filter
        { $set: { emailAddress: newInfo } }, // Update
        { returnDocument: "after" }, // Options
      );
    case 2: // Update password
      newInfo = validation.passwordValidation(newInfo);
      const hashedPassword = await bcrypt.hash(newInfo, saltRounds);
      await usersCollection.findOneAndUpdate(
        { emailAddress: emailAddress }, // Filter
        { $set: { hashedPassword: hashedPassword } }, // Update
        { returnDocument: "after" }, // Options
      );
    // case 3: // Update pfp
    //   validation.pfpValidation(newInfo);
  }
  return { changedUser: true };
};
