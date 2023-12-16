import { users } from "../config/mongoCollections.js";
import { ObjectId } from "mongodb";
import validation, { DBError, ResourcesError } from "../helpers.js";

export const sendFriendRequest = async (yourUsername, targetUsername) => {
  yourUsername = validation.stringCheck(yourUsername);
  targetUsername = validation.stringCheck(targetUsername);
  //Check if user is awating a request by their target, if they are then accept that request instead.
  if (await isFriendOrPending(targetUsername, yourUsername))
    return await acceptFriendRequest(yourUsername, targetUsername);
  yourUsername = yourUsername.toLowerCase();
  targetUsername = targetUsername.toLowerCase();

  const usersCollection = await users();
  let existingUser = await usersCollection.findOne({
    username: yourUsername,
  });
  let targetUser = await usersCollection.findOne({
    username: targetUsername,
  });
  if (!existingUser) {
    throw new DBError("Db Error: Could not find your username");
  }
  if (!targetUser) {
    throw new RangeError(
      "The person you are trying to add does not exist. Double check their username for spelling errors"
    );
  }

  let pendingRequests = targetUser.pendingRequests;
  if (!pendingRequests) {
    pendingRequests = [];
  }
  if (pendingRequests.includes(yourUsername)) {
    throw new RangeError("You have already sent a friend request to this user");
  }
  pendingRequests.push(yourUsername);

  let sentRequests = existingUser.sentRequests;
  if (!sentRequests) {
    sentRequests = [];
  }
  if (sentRequests.includes(targetUsername)) {
    throw new RangeError("You have already sent a friend request to this user");
  }

  sentRequests.push(targetUsername);

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
    throw "Could not update pendingRequests successfully";
  if (updatedSent.modifiedCount === 0)
    throw "Could not update sentRequests successfully";

  return {
    friendRequestSent: true,
    from: yourUsername,
    to: targetUsername,
  };
};

export const acceptFriendRequest = async (yourUsername, requestUsername) => {
  yourUsername = validation.stringCheck(yourUsername);
  requestUsername = validation.stringCheck(requestUsername);

  yourUsername = yourUsername.toLowerCase();
  requestUsername = requestUsername.toLowerCase();

  const usersCollection = await users();
  let existingUser = await usersCollection.findOne({
    username: yourUsername,
  });
  let requestExists = await usersCollection.findOne({
    username: requestUsername,
  });

  if (!existingUser) {
    throw new DBError("Db Error: Could not find your username");
  }
  if (!requestExists) {
    throw new ResourcesError("The person you are trying to add does not exist");
  }

  let pendingRequests = existingUser.pendingRequests;
  let sentRequests = requestExists.sentRequests;
  let removePending = [];
  let removeSent = [];

  if (
    !pendingRequests ||
    !sentRequests ||
    pendingRequests.length === 0 ||
    sentRequests.length === 0
  ) {
    throw "This user has not sent you a friend request";
  }

  pendingRequests.forEach((request) => {
    if (request !== requestUsername) {
      removePending.push(request);
    }
  });
  sentRequests.forEach((request) => {
    if (request !== yourUsername) {
      removeSent.push(request);
    }
  });

  const updatePendingRequests = {
    pendingRequests: removePending,
  };

  const updateSentRequests = {
    sentRequests: removeSent,
  };

  const updatePending = await usersCollection.updateOne(
    { username: yourUsername },
    { $set: updatePendingRequests },
    { returnDocument: "after" }
  );

  const updatedSent = await usersCollection.updateOne(
    { username: requestUsername },
    { $set: updateSentRequests },
    { returnDocument: "after" }
  );

  if (updatePending.modifiedCount === 0)
    throw "Could not update pendingRequests successfully";
  if (updatedSent.modifiedCount === 0)
    throw "Could not update sentRequests successfully";

  let recipientFriends = existingUser.friendList;
  if (!recipientFriends) {
    recipientFriends = [];
  }

  let senderFriends = requestExists.friendList;
  if (!senderFriends) {
    senderFriends = [];
  }

  recipientFriends.push({
    _id: new ObjectId(),
    username: requestUsername,
  });
  senderFriends.push({
    _id: new ObjectId(),
    username: yourUsername,
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
    { username: requestUsername },
    { $set: updateSentFriend },
    { returnDocument: "after" }
  );

  const updateRecipientFriendsList = await usersCollection.updateOne(
    { username: yourUsername },
    { $set: updatePendingFriend },
    { returnDocument: "after" }
  );

  if (updateSenderFriendsList.modifiedCount === 0)
    throw "Could not update friendList successfully";
  if (updateRecipientFriendsList.modifiedCount === 0)
    throw "Could not update friendList successfully";

  return { friendAdded: true };
};

export const rejectFriendRequest = async (yourUsername, requestUsername) => {
  yourUsername = validation.stringCheck(yourUsername);
  requestUsername = validation.stringCheck(requestUsername);

  yourUsername = yourUsername.toLowerCase();
  requestUsername = requestUsername.toLowerCase();

  const usersCollection = await users();
  let existingUser = await usersCollection.findOne({
    username: yourUsername,
  });
  let requestExists = await usersCollection.findOne({
    username: requestUsername,
  });

  if (!existingUser) {
    throw new DBError("Db Error: Could not find your username");
  }
  if (!requestExists) {
    throw new ResourcesError("The person you are trying to add does not exist");
  }

  let pendingRequests = existingUser.pendingRequests;
  let sentRequests = requestExists.sentRequests;
  let removePending = [];
  let removeSent = [];

  if (
    !pendingRequests ||
    !sentRequests ||
    pendingRequests.length === 0 ||
    sentRequests.length === 0
  ) {
    throw "This user has not sent you a friend request";
  }

  pendingRequests.forEach((request) => {
    if (request !== requestUsername) {
      removePending.push(request);
    }
  });
  sentRequests.forEach((request) => {
    if (request !== yourUsername) {
      removeSent.push(request);
    }
  });

  const updatePendingRequests = {
    pendingRequests: removePending,
  };

  const updateSentRequests = {
    sentRequests: removeSent,
  };

  const updatePending = await usersCollection.updateOne(
    { username: yourUsername },
    { $set: updatePendingRequests },
    { returnDocument: "after" }
  );

  const updatedSent = await usersCollection.updateOne(
    { username: requestUsername },
    { $set: updateSentRequests },
    { returnDocument: "after" }
  );

  if (updatePending.modifiedCount === 0)
    throw new DBError("Could not update pendingRequests successfully");
  if (updatedSent.modifiedCount === 0)
    throw new DBError("Could not update sentRequests successfully");

  return { requestRejected: true };
};

export const removeFriend = async (yourUsername, targetUsername) => {
  yourUsername = validation.stringCheck(yourUsername);
  targetUsername = validation.stringCheck(targetUsername);

  yourUsername = yourUsername.toLowerCase();
  targetUsername = targetUsername.toLowerCase();

  const usersCollection = await users();
  let existingUser = await usersCollection.findOne({
    username: yourUsername,
  });
  let friendToRemove = await usersCollection.findOne({
    username: targetUsername,
  });

  if (!existingUser) {
    throw new DBError("Db Error: Could not find your username");
  }
  if (!friendToRemove) {
    throw new ResourcesError(
      "The person you are trying to remove does not exist"
    );
  }

  const yourFriends = existingUser.friendList;
  const targetFriends = friendToRemove.friendList;

  let yourFriendsUsernames = [];
  let theirFriendUsernames = [];
  yourFriends.forEach((friend) => {
    yourFriendsUsernames.push(friend.username);
  });
  targetFriends.forEach((friend) => {
    theirFriendUsernames.push(friend.username);
  });

  if (
    !yourFriendsUsernames.includes(targetUsername) ||
    !theirFriendUsernames.includes(yourUsername)
  ) {
    throw "You are not friends with this user. Cannot remove";
  }
  let updateYourFriendsArray = [];
  let updateTheirFriendsArray = [];
  yourFriends.forEach((friend) => {
    if (friend.username !== targetUsername) {
      updateYourFriendsArray.push(friend);
    }
  });
  targetFriends.forEach((friend) => {
    if (friend.username !== yourUsername) {
      updateTheirFriendsArray.push(friend);
    }
  });

  const updateYourFriends = {
    friendList: updateYourFriendsArray,
    friendCount: updateYourFriendsArray.length,
  };

  const updateTheirFriends = {
    friendList: updateTheirFriendsArray,
    friendCount: updateTheirFriendsArray.length,
  };

  const updateYourList = await usersCollection.updateOne(
    { username: yourUsername },
    { $set: updateYourFriends },
    { returnDocument: "after" }
  );

  const updatedTheirList = await usersCollection.updateOne(
    { username: targetUsername },
    { $set: updateTheirFriends },
    { returnDocument: "after" }
  );

  if (updateYourList.modifiedCount === 0)
    throw "Could not update pendingRequests successfully";
  if (updatedTheirList.modifiedCount === 0)
    throw "Could not update sentRequests successfully";
  return { friendRemoved: targetUsername, status: true };
};

export const isFriendOrPending = async (yourUsername, targetUsername) => {
  yourUsername = validation.stringCheck(yourUsername);
  targetUsername = validation.stringCheck(targetUsername);

  yourUsername = yourUsername.toLowerCase();
  targetUsername = targetUsername.toLowerCase();

  const usersCollection = await users();
  let existingUser = await usersCollection.findOne({
    username: yourUsername,
  });
  let targetUser = await usersCollection.findOne({
    username: targetUsername,
  });

  if (!existingUser) {
    throw new DBError("Db Error: Could not find your username");
  }
  if (!targetUser) {
    throw new ResourcesError("The target person does not exist");
  }

  const yourFriends = existingUser.friendList;
  const targetFriends = targetUser.friendList;

  for (const friend of yourFriends) {
    if (friend.username === targetUsername) {
      return true;
    }
  }

  for (const friend of targetFriends) {
    if (friend.username === yourUsername) {
      return true;
    }
  }

  if (
    targetUser.pendingRequests.includes(yourUsername) //Turned back to one sided for other implementation.
  ) {
    return true;
  }

  return false;
};
