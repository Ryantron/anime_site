import { getManualListRecs, getUserRecs, rateRecommendations } from "./data/recommendations.js";
import { unlinkMalAccount, linkMalAccount } from "./data/users.js";
import { registerUser } from "./data/users.js";
import { sendFriendRequest, acceptFriendRequest, rejectFriendRequest, removeFriend } from "./data/friends.js";

console.log(await removeFriend("test", "aero"))