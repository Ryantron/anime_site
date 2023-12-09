import {
  closeConnection,
  dbConnection,
} from "../src/config/mongoConnection.js";
import { users } from "../src/config/mongoCollections.js";
import { changeUserInfo } from "../src/data/users.js";
import { getHistory } from "../src/data/recommendations.js";
import { app, server } from "../src/app.js";
import supertest from "supertest";

async function getUserByEmail(emailAddress) {
  const usersCollection = await users();
  const user = await usersCollection.findOne({ emailAddress });
  return user;
}

const request = supertest(app);

/************
 * DATA TESTS
 ************/

/**
 * getHistory Data Tests
 */

console.log("-----------------");
console.log("getHistory Data Test 1");
try {
  const res = await getHistory("test@test.com");
  console.log(JSON.stringify(res, undefined, 2));
  console.log("Success");
} catch (err) {
  console.log("getHistory Data Test 1 Failed: ");
  console.log(err);
}
console.log("-----------------");

/**
 * changeUserInfo Data Tests
 */

console.log("-----------------");
console.log("changeUserInfo Data Test 1");
try {
  const user = await getUserByEmail("test@test.com");
  const res = await changeUserInfo(
    user._id,
    "sus",
    undefined,
    "ABC123SS@saf",
    2
  );
  console.log(res);
} catch (err) {
  console.log("changeUserInfo Data Test 1 Failed: ");
  console.log(err);
}
console.log("-----------------");

console.log("-----------------");
console.log("changeUserInfo Data Test 2");
try {
  const user = await getUserByEmail("test2@test.com");
  const res = await changeUserInfo(
    user._id,
    undefined,
    user.emailAddress,
    undefined,
    undefined
  );
  console.log(res);
  console.log("Success");
} catch (err) {
  console.log("changeUserInfo Data Test 1 Failed: ");
  console.log(err);
}
console.log("-----------------");

/************
 * DATA ERROR TESTS
 ************/

/************
 * ROUTE TESTS
 ************/

// TODO maybe: Can't get supertest to work with express-session
// console.log("-----------------");
// console.log("/accounts/reset Route Test 1");
// try {
//   const res = await request.post("/login").send({
//     emailAddressInput: "test3@test.com",
//     passwordInput: "Test123@@",
//   });
//   await request
//     .post("/accounts/reset")
//     .send({
//       usernameInput: "Jimmy_uwu",
//     })
//     .expect("Location", /\/accounts/);
//   console.log("Success");
// } catch (err) {
//   console.log("/accounts/reset Route Test 1 Failed: ");
//   console.log(err);
// }
// console.log("-----------------");

/************
 * ROUTE ERROR TESTS
 ************/

/**
 * signup Route Error Tests
 */

console.log("-----------------");
console.log("/signup Route Error Test 1");
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
