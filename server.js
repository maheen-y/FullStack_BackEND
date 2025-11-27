// Import required modules
require("dotenv").config(); // Used to load the env file 
var express = require("express");
var path = require("path");
const cors = require("cors");

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

var app = express();

// Use CORS for requests
app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT"],
    allowedHeaders: ["Content-Type"]
}));

app.use(express.json());

// Logger middleware includes a timestamp - outputs all requests to server console
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} Incoming request to ${req.url}`);
    next();
});

// Static file middleware to return lesson images
app.use("/images", express.static(path.join(__dirname, "static/images")));

// Error message displayed in JSON format if image file does not exist 
app.use("/images", (req, res) => {
    res.status(404).json({ error: "Image file does not exist, please try again" });
});


// Allows server to access MongoDB URI
const uri = process.env.Mongo_URI;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: false,
        deprecationErrors: true,
    }
});

let database;
let lessonsCollection;
let ordersCollection;

// Server connects to MongoDB
async function connectDB() {

    try {
        await client.connect();

        // Required database and collections are accessed
        database = client.db("SchoolActivities");
        lessonsCollection = database.collection("lessons");
        ordersCollection = database.collection("orders");

        console.log("Successfully connected to MongoDB Atlas");
    } catch (error) {
        console.error("Connection unsuccessful:", error);
    }
}

connectDB();

// HTTP methods

// GET route for /lessons - returns lessons in JSON format
app.get("/lessons", async (req, res) => {
    try {
        const lessons = await lessonsCollection.find({}).toArray();
        res.json(lessons);
    } catch (error) {
        res.status(500).json({ message: "lessons could not be found" });
    }
});

// POST route - save new order into order collection
app.post("/orders", async (req, res) => {
    const newOrder = req.body;

    try {
        const outcome = await ordersCollection.insertOne(newOrder);
        res.status(201).json({
            message: "Your order has been saved",
            orderId: outcome.insertedId
        });
    } catch (error) {
        res.status(500).json({ error: "Your order could not be saved" });
    }
});

// PUT route - update an attribute of a lesson
app.put("/lessons/:id", async (req, res) => {
    const id = req.params.id;
    const updates = req.body;

    try {
        const outcome = await lessonsCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updates }
        );

        if (outcome.matchedCount === 0) {
            return res.status(404).json({ error: "Lesson does not exist" });
        }

        res.json({ message: "Lesson update successful" });
    } catch (error) {
        res.status(500).json({ error: "Lessons could not update" });
    }
});

// App listens on port 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port " + PORT));
