import { closeConnection } from "../src/config/mongoConnection.js";
import { users } from "../src/config/mongoCollections.js";
import { ObjectId } from "mongodb";
import bcrypt from "bcrypt";
const saltRounds = 16;

async function insertUser({
  username,
  emailAddress,
  password,
  pfpId,
  recommendations,
  malUsername,
}) {
  recommendations = recommendations.map((rec) => {
    rec._id = new ObjectId();
    return rec;
  });

  const res = {
    ...{
      username,
      emailAddress,
      hashedPassword: await bcrypt.hash(password, saltRounds),
      pfpId,
      recommendations,
    },
    ...(malUsername ? { malUsername } : {}),
  };
  const usersCollection = await users();
  const user = await usersCollection.insertOne(res);
  if (!user) throw "Unable to add user to collection";
  return user;
}

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
      usersLiked: [],
      recommendationList: [
        {
          animeId: "25798",
          title:
            "That time I got reincarnated as a coach and had to go around the world to save fishes because they needed help from the humans who are incompetent",
          frequency: 3,
          review: 5,
        },
        {
          animeId: "13452",
          title: "Paul V",
          frequency: 2,
          review: 4,
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
      usersLiked: [testuser.insertedId],
      recommendationList: [
        {
          animeId: "25798",
          title:
            "That time I got reincarnated as a coach and had to go around the world to save fishes because they needed help from the humans who are incompetent",
          frequency: 3,
          review: 5,
        },
        {
          animeId: "13452",
          title: "Paul V",
          frequency: 2,
          review: 4,
        },
      ],
    },
  ],
});

await closeConnection();
