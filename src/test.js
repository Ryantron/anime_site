import { getManualListRecs, getUserRecs, rateRecommendations } from "./data/recommendations.js";
import { unlinkMalAccount, linkMalAccount } from "./data/users.js";
import { registerUser } from "./data/users.js";
import { sendFriendRequest, acceptFriendRequest, rejectFriendRequest, removeFriend, isFriendOrPending } from "./data/friends.js";

