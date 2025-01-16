require("dotenv").config();
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const app = express();
const port = process.env.port || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

// middleware

app.use(
  cors({
    origin: ["http://localhost:5173",
      "https://forum-website-pi.vercel.app"
    ],
    credentials: true,
    optionsSuccessStatus: 200,
  })
);
app.use(cors());
app.use(express.json());
app.use(cookieParser());

//mongodb user & pass

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xxagl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Database
    const forumCategory = client.db(`${process.env.DB_NAME}`).collection(`${process.env.DB_COLLECTION_NAME_1}`);
    const forumTags = client.db(`${process.env.DB_NAME}`).collection(`${process.env.DB_COLLECTION_NAME_2}`);
    const forumPosts = client.db(`${process.env.DB_NAME}`).collection(`${process.env.DB_COLLECTION_NAME_3}`);
    const forumUser = client.db(`${process.env.DB_NAME}`).collection(`${process.env.DB_COLLECTION_NAME_4}`);
    const forumComments = client.db(`${process.env.DB_NAME}`).collection(`${process.env.DB_COLLECTION_NAME_5}`);

    // default page
    app.get("/", (req, res) => {
      res.send("forum server running");
    });

    // All category
    app.get("/category", async (req, res) => {
      const result = await forumCategory.find().toArray();
      res.send(result);
    });

    // all tags
    app.get("/tags", async (req, res) => {
      const result = await forumTags.find().toArray();
      res.send(result);
    });

    // all posts
    app.get("/posts", async (req, res) => {
      const result = await forumPosts.find().toArray();
      res.send(result);
    });

    // all users
    app.get("/users", async (req, res) => {
      const result = await forumUser.find().toArray();
      res.send(result);
    });

    // all comments
    app.get("/comments", async (req, res) => {
      const result = await forumComments.find().toArray();
      res.send(result);
    });

    app.get("/mergedAllData", async (req, res) => {
      const postsWithUsers = await forumPosts.aggregate([
          {
            $lookup: {
              from: "userData", // The MongoDB collection for users
              localField: "authorId", // posts authorId
              foreignField: "id", // in the users collection id field
              as: "author", // Alias for joined data
            },
          },
          {
            $unwind: "$author", // Flatten the array to simplify response structure
          },

          {
            $lookup: {
              from : "comments", // The MongoDB collection for comments
              localField : "id", // posts id
              foreignField : "postId", // in comments collection postId field
              as : "commentData", // Alias for joined Data
            },
          },

          // unwind choose only one obj in array 

          // {
          //   $unwind: "$commentData", // Flatten the array to simplify response structure
          // },
          
        ]).toArray();
      res.send(postsWithUsers);
    });


  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`server is running on port : ${port}`);
});
