import { insertUser } from "./helpers.js";

// Delete collection

const usersCollection = await users();
await usersCollection.drop();

// Add document to collection

const testuser = await insertUser({
  username: "testuser",
  emailAddress: "test@test.com",
  password: "Test1234@",
  pfpId: 1,

  recommendations: [
    {
      rating: 3,
      recommendationList: [
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
    },
  ],
  malUsername: "Jimmy2006",
});

const testuser2 = await insertUser({
  username: "testuser2",
  emailAddress: "test2@test.com",
  password: "Test1234@@",
  pfpId: 1,
  recommendations: [],
});

const testuser3 = await insertUser({
  username: "testuser3",
  emailAddress: "test3@test.com",
  password: "Test123@@",
  pfpId: 3,
  recommendations: [
    {
      rating: 3,
      recommendationList: [
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
    },
  ],
});

await closeConnection();
