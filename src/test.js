import { getManualListRecs, getUserRecs, rateRecommendations } from "./data/recommendations.js";
import { unlinkMalAccount, linkMalAccount } from "./data/users.js";
import { registerUser } from "./data/users.js";
import { sendFriendRequest } from "./friends.js";

console.log(await sendFriendRequest("giganigga", "fishylizz"))