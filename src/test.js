import { getManualListRecs, getUserRecs, rateRecommendations } from "./data/recommendations.js";
import { unlinkMalAccount, linkMalAccount } from "./data/users.js";
import { registerUser } from "./data/users.js";

console.log(await rateRecommendations("blockman57@gmail.com", "657659250d02c7af77a8322a", 5))

console.log(await rateRecommendations("blockman57@gmail.com", "657659250d02c7af77a8322a", 2))

