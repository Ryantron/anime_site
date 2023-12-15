import { closeConnection } from "../src/config/mongoConnection.js";
import { users } from "../src/config/mongoCollections.js";
import { insertUser, addRecommendation } from "./helpers.js";

// Delete collection

const usersCollection = await users();
await usersCollection.drop();

// Add document to collection

const testuser = await insertUser({
  username: "testuser",
  emailAddress: "test@test.com",
  password: "Test1234@",
  malUsername: "Jimmy2006",
});

await addRecommendation({
  emailAddress: "test@test.com",
  ratings: 3,
  recommendation: [
    {
      id: 25798,
      title:
        "That time I got reincarnated as a coach and had to go around the world to save fishes because they needed help from the humans who are incompetent",
      frequency: 3,
    },
    {
      id: 13452,
      title: "Paul V",
      frequency: 2,
    },
  ],
});

const testuser2 = await insertUser({
  username: "testuser2",
  emailAddress: "test2@test.com",
  password: "Test1234@@",
});

const testuser3 = await insertUser({
  username: "testuser3",
  emailAddress: "test3@test.com",
  password: "Test123@@",
  pfpId: 3,
});

await addRecommendation({
  emailAddress: "test3@test.com",
  recommendation: [
    {
      id: 25798,
      title:
        "That time I got reincarnated as a coach and had to go around the world to save fishes because they needed help from the humans who are incompetent",
      frequency: 3,
    },
    {
      id: 13452,
      title: "Paul V",
      frequency: 2,
    },
  ],
});

await closeConnection();
