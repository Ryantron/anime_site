import {
  closeConnection,
  dbConnection,
} from "../src/config/mongoConnection.js";
import { getHistory } from "../src/data/recommendations.js";
import supertest from "supertest";
import { app, server } from "../src/app.js";

const request = supertest(app);

/**
 * getHistory Tests
 */

console.log("-----------------");
console.log("getHistory Test 1");
try {
  const res = await getHistory("test@test.com");
  console.log(JSON.stringify(res, undefined, 2));
  console.log("Success");
} catch (err) {
  console.log("getHistory Test 1 Failed: ");
  console.log(err);
}
console.log("-----------------");

/**
 * signup Route Error Tests
 */

console.log("-----------------");
console.log("signup Route Error Test 1");
console.log("   - Testing empty input");
try {
  await request
    .post("/signup")
    .send({})
    .expect("Location", /errorStatus=400/);
  console.log("Success");
} catch (err) {
  console.log("signup Route Error Test 1 Failed: ");
  console.log(err);
}
console.log("-----------------");

await closeConnection();
server.close();
