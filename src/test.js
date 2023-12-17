import { getManualListRecs, getUserRecs, rateRecommendations } from "./data/recommendations.js";
import { unlinkMalAccount, linkMalAccount } from "./data/users.js";
import { registerUser } from "./data/users.js";
import { acceptFriendRequest, rejectFriendRequest, isFriendOrPending, sendFriendRequest } from "./data/friends.js";

console.log(await isFriendOrPending("fishylizz", "giganigga"))