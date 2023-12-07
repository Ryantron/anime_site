import { closeConnection } from "../src/config/mongoConnection.js";
import { getHistory } from "../src/data/recommendations.js";

/**
 * getHistory Tests
 */

const res = await getHistory("test@test.com");

console.log("-----------------");
console.log("getHistory Test 1");
console.log(JSON.stringify(res, undefined, 2));
console.log("-----------------");

await closeConnection();
