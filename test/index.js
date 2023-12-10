import {
  closeConnection,
  dbConnection,
} from "../src/config/mongoConnection.js";
import { users } from "../src/config/mongoCollections.js";
import { changeUserInfo, linkMalAccount } from "../src/data/users.js";
import {
  getHistory,
  getAnimeInfo,
  getUserRecs,
  hasCurrentUserLikedAlready,
} from "../src/data/recommendations.js";
import { app, server } from "../src/app.js";
import supertest from "supertest";

async function getUserByEmail(emailAddress) {
  const usersCollection = await users();
  const user = await usersCollection.findOne({ emailAddress });
  user._id = user._id.toString();
  user.recommendations = user.recommendations.map((rec) => {
    rec._id = rec._id.toString();
    rec.usersLiked = rec.usersLiked.map((objId) => objId.toString());
    return rec;
  });
  return user;
}

async function createTest(name, callback, should_print_res = false) {
  console.log("-----------------");
  console.log(`${name}`);
  try {
    const res = await callback();
    if (should_print_res) console.log(res);
    console.log("Success");
  } catch (err) {
    console.log(`${name} Failed: `);
    console.log(err);
  }
  console.log("-----------------");
}

const request = supertest(app);

/************
 * DATA TESTS
 ************/

/**
 * getHistory Data Tests
 */

await createTest(
  "getHistory Data Test 1",
  async () => {
    return await getHistory("test@test.com");
  },
  true
);

/**
 * changeUserInfo Data Tests
 */

await createTest(
  "changeUserInfo Data Test 1",
  async () => {
    const user = await getUserByEmail("test@test.com");
    return await changeUserInfo(user._id, "sus", undefined, "ABC123SS@saf", 2);
  },
  true
);

await createTest(
  "changeUserInfo Data Test 2",
  async () => {
    const user = await getUserByEmail("test2@test.com");
    return await changeUserInfo(
      user._id,
      undefined,
      user.emailAddress,
      undefined,
      undefined
    );
  },
  true
);

/**
 * getAnimeInfo Data Unit Tests
 */

await createTest(
  "getAnimeInfo Data Unit Test 1",
  async () => {
    return await getAnimeInfo("52991");
  },
  true
);

/**
 * getUserRecs Data Tests
 */

// await createTest(
//   "getUserRecs Data Test 1",
//   async () => {
//     await linkMalAccount("test2@test.com", "Centillionial");
//     return await getUserRecs("test2@test.com");
//   },
//   true
// );

/**
 * hasCurrentUserLikedAlready Data Tests
 */

await createTest("hasCurrentUserLikedAlready Data Test 1", async () => {
  // testuser3 rec list has testuser1 in usersLiked
  const currentUser = await getUserByEmail("test@test.com");
  const authorUser = await getUserByEmail("test3@test.com");
  const recId = authorUser.recommendations.find((rec) => {
    return rec.usersLiked.includes(currentUser._id);
  })._id;
  const res = await hasCurrentUserLikedAlready(currentUser._id, recId);

  if (!res)
    throw new Error(
      "Wrong value returned by hasCurrentUserLikedAlready Data Test 1"
    );
});

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

createTest("/signup Route Error Test 1", async () => {
  return await request
    .post("/signup")
    .send({})
    .expect("Location", /errorStatus=400/);
});

await closeConnection();
server.close();
