import { users } from "../config/mongoCollections.js";
import { ObjectId } from "mongodb";
import validation, { DBError, ResourcesError, getUserInfo, updateFriendsList, updateSentPendingRequests } from "../helpers.js";

export const sendFriendRequest = async (senderName, recipientName) => {
    const userData = await getUserInfo(senderName, recipientName)
    const senderData = userData.sender
    const recipientData = userData.recipient
    const senderUsername = senderData.username
    const recipientUsername = recipientData.username
    //Check for auto accepting when you already have a request from another user
    //This check was gone post refactoring, so I added it back.
    if (await isFriendOrPending(recipientUsername, senderUsername)) return await acceptFriendRequest(senderUsername, recipientUsername);
    let pendingRequests = recipientData.pendingRequests;
    let sentRequests = senderData.sentRequests;
    if(sentRequests && pendingRequests){
        if(sentRequests.includes(recipientUsername) && pendingRequests.includes(senderUsername)){
            throw new RangeError("You have already sent a friend request to this user")
        }
    }else{
        pendingRequests = []
        sentRequests = []
    }

    pendingRequests.push(senderUsername);
    sentRequests.push(recipientUsername)
    let updated = await updateSentPendingRequests(senderUsername, sentRequests, recipientUsername, pendingRequests)
    if (updated !== true){
        throw new DBError("Error updatating request information")
    }

  return {
    friendRequestSent: true,
    from: senderUsername,
    to: recipientUsername,
  };
}

export const acceptFriendRequest = async (recipientUsername, senderUsername) => {
  const userInfo = await getUserInfo(senderUsername, recipientUsername)
  const senderData = userInfo.sender
  const recipientData = userInfo.recipient
    const senderName = senderData.username
    const recipientName = recipientData.username

  let pendingRequests = recipientData.pendingRequests;
  let sentRequests = senderData.sentRequests;
  let updatePending = [];
  let updateSent = [];

  if (
    !pendingRequests ||
    !sentRequests ||
    pendingRequests.length === 0 ||
    sentRequests.length === 0
  ) {
    throw new RangeError("This user has not sent you a friend request");
  }

  pendingRequests.forEach((request) => {
    if (request !== senderName) {
      updatePending.push(request);
    }
  });
  sentRequests.forEach((request) => {
    if (request !== recipientName) {
      updateSent.push(request);
    }
  });

  const updatedRequests = await updateSentPendingRequests(senderName, updateSent, recipientName, updatePending)
  if(updatedRequests !== true){throw new DBError("Could not update request successfully")}

  const updatedFriends = await updateFriendsList(senderData, recipientData)
  if(updatedFriends !== true){throw new DBError("Could not update friend list successfully")
}

  return { friendAdded: true };
};

export const rejectFriendRequest = async (recipientUsername, senderUsername) => {
  const userData = await getUserInfo(senderUsername, recipientUsername)
    const senderData = userData.sender
    const recipientData = userData.recipient
    const senderName = senderData.username
    const recipientName = recipientData.username

  let pendingRequests = recipientData.pendingRequests;
  let sentRequests = senderData.sentRequests;
  let updatePending = [];
  let updateSent = [];

  if (
    !pendingRequests ||
    !sentRequests ||
    pendingRequests.length === 0 ||
    sentRequests.length === 0
  ) {
    throw new ResourcesError("This user has not sent you a friend request");
  }

  pendingRequests.forEach((request) => {
    if (request !== senderName) {
      updatePending.push(request);
    }
  });
  sentRequests.forEach((request) => {
    if (request !== recipientName) {
      updateSent.push(request);
    }
  });

  const updatedRequests = await updateSentPendingRequests(senderName, updateSent, recipientName, updatePending)
  if(updatedRequests !== true){
    throw new DBError("Could not update requests successfully")
  }
  return { requestRejected: true };
};

export const removeFriend = async (senderUsername, removalRecipientUsername) => {
  const userInfo = await getUserInfo(senderUsername, removalRecipientUsername)
  const sender = userInfo.sender
  const removalRecipient = userInfo.recipient
  const senderName = sender.username
  const removalRecipientName = removalRecipient.username

  const senderFriends = sender.friendList;
  const removalRecipientFriends = removalRecipient.friendList;
  let updateSenderFriends = [];
  let updateRemovalRecipientFriends = [];
    let checkSender = []
    let checkRecipient = []
  
  
  senderFriends.forEach((friend) => {
    checkSender.push(friend.username)
    if (friend.username !== removalRecipientName) {
      updateSenderFriends.push(friend);
    }
  });
  removalRecipientFriends.forEach((friend) => {
    checkRecipient.push(friend.username)
    if (friend.username !== senderName) {
      updateRemovalRecipientFriends.push(friend);
    }
  });

  if(!checkSender.includes(removalRecipientName) || !checkRecipient.includes(senderName)){
    throw new RangeError("You are not friends with this user. Cannot remove.")
  }

  const usersCollection = await users();
  const updateYourFriends = {
    friendList: updateSenderFriends,
    friendCount: updateSenderFriends.length,
  };

  const updateTheirFriends = {
    friendList: updateRemovalRecipientFriends,
    friendCount: updateRemovalRecipientFriends.length,
  };

  const updateYourList = await usersCollection.updateOne(
    { username: senderName },
    { $set: updateYourFriends },
    { returnDocument: "after" }
  );

  const updatedTheirList = await usersCollection.updateOne(
    { username: removalRecipientName },
    { $set: updateTheirFriends },
    { returnDocument: "after" }
  );

  if (updateYourList.modifiedCount === 0)
    throw new DBError("Could not update pendingRequests successfully");
  if (updatedTheirList.modifiedCount === 0)
    throw new DBError("Could not update sentRequests successfully");

    return {friendRemoved: removalRecipientName, status: true}
}

export const isFriendOrPending = async (senderUsername, recipientUsername) => {
  const userData = await getUserInfo(senderUsername, recipientUsername)
  const sender = userData.sender
  const recipient = userData.recipient

  const yourFriends = sender.friendList;
  const targetFriends = recipient.friendList;

  for (const friend of yourFriends) {
    if (friend.username === recipient.username) {
      return true;
    }
  }

  for (const friend of targetFriends) {
    if (friend.username === sender.username) {
      return true;
    }
  }

  if (
    recipient.pendingRequests.includes(sender.username) //Turned back to one sided for other implementation.
  ) {
    return true;
  }

  return false;
};

