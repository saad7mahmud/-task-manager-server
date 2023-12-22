const express = require("express");
require("dotenv").config();
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

// Middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.znptc55.mongodb.net/?retryWrites=true&w=majority`;

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
    // await client.connect();

    // Create Collections
    const taskCollections = client.db("taskDB").collection("tasks");

    // Send All ToDos  Data To DB
    app.post("/todos", async (req, res) => {
      const todosInfo = req.body;
      console.log("body data", todosInfo);
      const result = await taskCollections.insertOne(todosInfo);
      res.send(result);
    });

    // get email based to dos if TODO
    app.get("/todos/:email", async (req, res) => {
      const email = req.params.email;
      const query = {
        $and: [{ type: "todo" }, { userEmail: email }],
      };
      const result = await taskCollections.find(query).toArray();
      res.send(result);
    });
    // get email based to dos if ongoing
    app.get("/todos/ongoing/:email", async (req, res) => {
      const email = req.params.email;
      const query = {
        $and: [{ type: "ongoing" }, { userEmail: email }],
      };
      const result = await taskCollections.find(query).toArray();
      res.send(result);
    });
    // get email based to dos if completed

    app.get("/todos/completed/:email", async (req, res) => {
      const email = req.params.email;
      const query = {
        $and: [{ type: "completed" }, { userEmail: email }],
      };
      const result = await taskCollections.find(query).toArray();
      res.send(result);
    });

    //   Make Ongoing
    app.patch("/todos/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const finalUpdateInfo = {
        $set: {
          type: "ongoing",
        },
      };
      const result = await taskCollections.updateOne(
        query,
        finalUpdateInfo,
        options
      );
      res.send(result);
    });
    //   Make Complete
    app.patch("/todos/completed/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const finalUpdateInfo = {
        $set: {
          type: "completed",
        },
      };
      const result = await taskCollections.updateOne(
        query,
        finalUpdateInfo,
        options
      );
      res.send(result);
    });

    // delete id based to dos
    app.delete("/todos/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await taskCollections.deleteOne(query);
      res.send(result);
    });
    // get  id based to doss NOT WORKING
    app.get("/todos/:id", async (req, res) => {
      const id = req.params.id;
      console.log("received id:", id);
      const query = { _id: new ObjectId(id) };
      const result = await taskCollections.findOne(query);
      res.send(result);
    });

    // await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Task Manager server is running");
});

app.listen(port, () => {
  console.log(`Task Manager Server is running on port: ${port}`);
});
