import { closeConnection } from "../src/config/mongoConnection.js";
import { users } from "../src/config/mongoCollections.js";
import { ObjectId } from "mongodb";
import bcrypt from "bcrypt";
const saltRounds = 16;

async function insertUser({
  username,
  emailAddress,
  password,
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
      recommendations,
    },
    ...(malUsername ? {} : { malUsername }),
  };
  const usersCollection = await users();
  const user = await usersCollection.insertOne(res);
  console.log(user);
  if (!user) throw "Unable to add user to collection";
}

await insertUser({
  username: "testuser",
  emailAddress: "test@test.com",
  password: "Test1234@",
  recommendations: [
    {
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
