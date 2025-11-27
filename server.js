// Import required modules
require("dotenv").config();
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

// Logger middleware which includes a timestamp to output requests
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} Incoming request to ${req.url}`);
    next();
});

// Static file middleware to return lesson images
app.use("/images", express.static(path.join(__dirname, "static/images")));


// Connect to MongoDB
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

async function connectDB() {
    try {
        await client.connect();

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

// GET route for /lessons
app.get("/lessons", async (req, res) => {
    try {
        const lessons = await lessonsCollection.find({}).toArray();
        res.json(lessons);
    } catch (error) {
        res.status(500).json({ message: "lessons could not be found"});
    }  
});

// POST route - save new order into order collection
app.post("/orders", async (req, res) => {
    const newOrder = req.body;

    try{
        const outcome = await ordersCollection.insertOne(newOrder);
        res.status(201).json({
            message: "Your order has been saved", 
            orderId: outcome.insertedId
        });
    } catch (error){
        res.status(500).json({ error: "Your order could not be saved"});
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
            return res.status(404).json({ error: "Lesson does not exist"});
        }

        res.json({ message: "Lesson update successful"});
    } catch (error) {
        res.status(500).json({ error: "Lessons could not update" });
    }
});

// Displays error message if file not found
app.use((req, res) => {
    res.status(404).send(" File does not exist, please try again");
});

// App listens on port 3000
app.listen(3000, () => console.log("Server running on port 3000"));
