const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fcmyfrv.mongodb.net/?retryWrites=true&w=majority`;

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
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    // collection for the database
    const categoryCollection = client.db("libraryManagementDB").collection("bookCategory");
    const booksCollection = client.db("libraryManagementDB").collection("books");
    const userCollection = client.db("libraryManagementDB").collection("users");

    // GET request to retrieve a list of Category
    app.get("/bookCategory", async (req, res) => {
      const cursor = categoryCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // GET request to retrieve books for a specific Category by Category ID
    app.get("/bookCategory/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const categoryNameFromData = await categoryCollection.findOne(filter);
      const result = await booksCollection
        .find({ CategoryName: categoryNameFromData.CategoryName })
        .toArray();
      res.send(result);
    });

    //Books post method
    app.post("/books", async (req, res) => {
      const user = req.body;
      console.log(user);
      const result = await booksCollection.insertOne(user);
      res.send(result);
    });

    // GET request to retrieve a list of Books
    app.get("/books", async (req, res) => {
      const cursor = booksCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // GET request to retrieve books for a specific book by book ID
    app.get("/books/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const books = await booksCollection.findOne(query);
      console.log(books);
      res.send(books);
    });

     // put request to retrieve books for a specific book by book ID update there information
    app.put("/books/:id", async (req, res) => {
      const id = req.params.id;
      const data = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedBooks = {
        $set: {
          name: data.name,
          CategoryName: data.CategoryName,
          type: data.type,
          rating: data.rating,
          content:data.content,
          photo: data.photo,
        },
      };
      // console.log(updatedProduct,filter,options);
      const result = await booksCollection.updateOne(
        filter,
        updatedBooks,
        options
      );
      res.send(result);
    });


        // post method for the user collection
        app.post("/user", async (req, res) => {
          const user = req.body;
          const result = await userCollection.insertOne(user);
          res.send(result);
        });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
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
  res.send("Library Management Server");
});

app.listen(port, () => {
  console.log(`Library Management Server listening on port ${port}`);
});
