//You can add and export any helper functions you want here. If you aren't using any, then you can just leave this file as is.
import { ObjectId } from "mongodb";
import { users } from "./config/mongoCollections.js";

/**
 * Errors
 * TypeError (wrong type) -> 400
 * RangeError (bad value provided by user even though type is correct) -> 400
 * DBError (Database errors) -> 500
 * ResourcesError (resources not found) -> 404
 */

export class AuthError extends Error {
  constructor(msg) {
    super(msg);
  }
}
export class DBError extends Error {
  constructor(msg) {
    super(msg);
  }
}
export class ResourcesError extends Error {
  constructor(msg) {
    super(msg);
  }
}

export function errorToStatus(error) {
  switch (error.constructor.name) {
    case "TypeError":
    case "RangeError":
      return 400;
    case "AuthError":
      return 401;
    case "ResourcesError":
      return 404;
    case "DBError":
    default:
      return 500;
  }
}

export function createOptionalObject(name, value) {
  return value ? { [name]: value } : {};
}

export function convertIdToStrArr(objIdStr) {
  return objIdStr.map((id) => id.toString());
}

export function removeObjectIdFromUser(user) {
  user._id = user._id.toString();
  user.recommendations = user.recommendations.map((rec) => {
    rec._id = rec._id.toString();
    return rec;
  });
}

export async function getUserByEmail(emailAddress) {
  if (!emailAddress) throw new Error("Need to provide emailAddress");
  const usersCollection = await users();
  const user = await usersCollection.findOne({ emailAddress });
  if (user === null)
    throw new Error(`User not found by email: ${emailAddress}`);

  removeObjectIdFromUser(user);
  return user;
}

export const IMAGE_PATHS = {
  1: "/public/images/pfp/1-apple-istock.png",
  2: "/public/images/pfp/2-pen-vecteezy.png",
  3: "/public/images/pfp/3-miku-mikuexpo2023.png",
  4: "/public/images/pfp/4-white_hair_girl-pinterest.png",
  5: "/public/images/pfp/5-anime_boy-wallpapers_clan.png",
};

export async function updateFriendsList(senderData, recipientData) {
  const usersCollection = await users();
  let recipientFriends = recipientData.friendList;
  if (!recipientFriends) {
    recipientFriends = [];
  }

  let senderFriends = senderData.friendList;
  if (!senderFriends) {
    senderFriends = [];
  }

  recipientFriends.push({
    _id: new ObjectId(),
    username: senderData.username,
  });
  senderFriends.push({
    _id: new ObjectId(),
    username: recipientData.username,
  });

  const updatePendingFriend = {
    friendList: recipientFriends,
    friendCount: recipientFriends.length,
  };

  const updateSentFriend = {
    friendList: senderFriends,
    friendCount: senderFriends.length,
  };

  const updateSenderFriendsList = await usersCollection.updateOne(
    { username: senderData.username },
    { $set: updateSentFriend },
    { returnDocument: "after" }
  );

  const updateRecipientFriendsList = await usersCollection.updateOne(
    { username: recipientData.username },
    { $set: updatePendingFriend },
    { returnDocument: "after" }
  );

  if (updateSenderFriendsList.modifiedCount === 0)
    throw new DBError("Could not update friendList successfully");
  if (updateRecipientFriendsList.modifiedCount === 0)
    throw new DBError("Could not update friendList successfully");

  return true;
}
export async function updateSentPendingRequests(
  yourUsername,
  sentRequests,
  targetUsername,
  pendingRequests
) {
  const usersCollection = await users();

  const insertPending = {
    pendingRequests: pendingRequests,
  };

  const insertSent = {
    sentRequests: sentRequests,
  };

  const updatePending = await usersCollection.updateOne(
    { username: targetUsername },
    { $set: insertPending },
    { returnDocument: "after" }
  );

  const updatedSent = await usersCollection.updateOne(
    { username: yourUsername },
    { $set: insertSent },
    { returnDocument: "after" }
  );

  if (updatePending.modifiedCount === 0)
    throw new DBError("Could not update pendingRequests successfully");
  if (updatedSent.modifiedCount === 0)
    throw new DBError("Could not update sentRequests successfully");

  return true;
}
export async function getUserInfo(senderName, recipientName) {
  senderName = exportedMethods.stringCheck(senderName);
  recipientName = exportedMethods.stringCheck(recipientName);

  senderName = senderName.toLowerCase();
  recipientName = recipientName.toLowerCase();

  const usersCollection = await users();
  const sender = await usersCollection.findOne({
    username: senderName,
  });
  const recipient = await usersCollection.findOne({
    username: recipientName,
  });

  if (!sender) {
    throw new RangeError("Could not find your username");
  }
  if (!recipient) {
    throw new RangeError(
      "The person you are trying to add does not exist. Double check their username for spelling errors"
    );
  }

  return { sender, recipient };
}

const exportedMethods = {
  integerCheck(arg, { min = -Infinity, max = Infinity } = {}) {
    if (arg == undefined)
      throw new TypeError(`No value passed to integerCheck: ${arg}`);
    if (typeof arg !== "number") throw new TypeError(`${arg} must be a number`);
    if (!Number.isInteger(arg))
      throw new RangeError(`${arg} is not an integer`);
    if (arg < min)
      throw new RangeError(`${arg} is below min allowed value (${min})`);
    if (arg > max)
      throw new RangeError(`${arg} is above max allowed value (${max})`);

    return arg;
  },
  stringCheck(arg) {
    if (arg == undefined) {
      throw new TypeError(
        `You must provide a string input for your parameter ${arg}`
      );
    } else if (typeof arg !== "string") {
      throw new TypeError(`${arg} must be a string`);
    } else if (arg.trim().length == 0) {
      throw new RangeError(`string inputs cannot be empty space`);
    }
    return arg.trim();
  },

  inputCheck(username, emailAddress, password) {
    if (!username || !emailAddress || !password) {
      throw new TypeError("All inputs must be non-empty strings");
    }
    if (
      typeof username !== "string" ||
      typeof emailAddress !== "string" ||
      typeof password !== "string"
    ) {
      throw new TypeError("All inputs must be a string");
    }

    username = this.usernameValidation(username);
    password = this.passwordValidation(password);
    emailAddress = this.emailValidation(emailAddress);
  },

  usernameValidation(username) {
    username = this.stringCheck(username);
    // Username trimmed in stringCheck
    if (username.length < 2) {
      throw new RangeError("username cannot be less than 2 characters long");
    }
    if (username.length > 25) {
      throw new RangeError("username cannot be more than 25 characters long");
    }
    if (/\s/.test(username)) {
      throw new RangeError("username cannot contain empty spaces");
    }
    const nameRegex = /^[A-Za-z0-9]{2,}$/;
    if (!nameRegex.test(username)) {
      throw new RangeError(
        "username must be at least 2 characters long and contain no special characters"
      );
    }
    return username;
  },

  emailValidation(email) {
    email = this.stringCheck(email);
    // Email trimmed in stringCheck
    const emailCheck = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/i;
    if (!emailCheck.test(email)) {
      throw new RangeError("emailAddress is not a valid email");
    }
    return email;
  },

  passwordValidation(password) {
    if (/\s/.test(password)) {
      throw new RangeError("password cannot contain empty spaces");
    }
    // No trim
    const passRegex =
      /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^\&*\)\(+=._-])[a-zA-Z0-9!@#\$%\^\&*\)\(+=._-]{8,}$/;
    if (!passRegex.test(password)) {
      throw new RangeError(
        "password must be at least 8 characters long and contain 1 special character, number, and uppercase letter"
      );
    }
    return password;
  },

  pfpValidation(pfpId) {
    pfpId = this.stringCheck(pfpId);
    // pfpId trimmed in stringCheck
    if (pfpId.length !== 1) {
      throw new RangeError(`${pfpId} is not an integer between 1 to 5`);
    }
    const parsedPfp = parseInt(pfpId, 10);
    if (!Number.isInteger(parsedPfp)) {
      throw new RangeError(`${pfpId} is not an integer`);
    }
    pfpId = this.integerCheck(parsedPfp, { min: 1, max: 5 });
    return pfpId;
  },

  objectIdValidation(str) {
    str = this.stringCheck(str);

    if (!ObjectId.isValid(str))
      throw new TypeError(`Id ${str} is not of type ObjectId.`);

    return str;
  },
};

export async function friendRoute(req, res, friendFun) {
  let userName = exportedMethods.stringCheck(req.params.username);
  if (userName === req.session.user?.username)
    throw new RangeError("You can't be friends with yourself.");
  let ownUserName = exportedMethods.stringCheck(req.session.user.username);
  return await friendFun(ownUserName, userName);
}

export default exportedMethods;
