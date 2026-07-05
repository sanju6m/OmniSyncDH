// Required packages: npm install express mongodb cors
const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');

const app = express();
const port = 3000;

// Enable CORS so the HTML dashboard can communicate with this API
app.use(cors());
app.use(express.json());

// --- MONGODB CONNECTION ---
// Replace <YOUR_CLUSTER_URL> with your actual cluster address (e.g., cluster0.abcd.mongodb.net)
const uri = "mongodb+srv://sanjujm06_db_user:2i47WBEmHwXnLw3V@<mongodb://atlas-sql-6a49d5ab2fa4182921224960-opi5kj.a.query.mongodb.net/sample_mflix?ssl=true&authSource=admin>/?retryWrites=true&w=majority";
const client = new MongoClient(uri);

let db, messagesCollection;

async function connectDB() {
    try {
        await client.connect();
        console.log("✅ Successfully connected to MongoDB!");
        db = client.db("OmniSync_SAS");
        messagesCollection = db.collection("MessageCenter");
    } catch (err) {
        console.error("❌ MongoDB connection failed:", err);
    }
}
connectDB();

// --- API ENDPOINTS ---

// 1. GET all messages
app.get('/api/messages', async (req, res) => {
    try {
        const messages = await messagesCollection.find({}).sort({ createdAt: -1 }).toArray();
        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch messages" });
    }
});

// 2. POST a new reply to a message
app.post('/api/messages/:id/reply', async (req, res) => {
    try {
        const messageId = req.params.id;
        const { replyText, repliedBy } = req.body;

        const result = await messagesCollection.updateOne(
            { _id: new ObjectId(messageId) },
            { 
                $set: { 
                    reply: replyText,
                    repliedBy: repliedBy,
                    repliedAt: new Date()
                } 
            }
        );

        if (result.modifiedCount === 1) {
            res.json({ success: true, message: "Reply saved successfully" });
        } else {
            res.status(404).json({ error: "Message not found" });
        }
    } catch (err) {
        res.status(500).json({ error: "Failed to save reply" });
    }
});

// 3. DELETE a reply
app.delete('/api/messages/:id/reply', async (req, res) => {
    try {
        const messageId = req.params.id;

        const result = await messagesCollection.updateOne(
            { _id: new ObjectId(messageId) },
            { $set: { reply: null, repliedBy: null, repliedAt: null } }
        );

        if (result.modifiedCount === 1) {
            res.json({ success: true, message: "Reply deleted successfully" });
        } else {
            res.status(404).json({ error: "Message not found" });
        }
    } catch (err) {
        res.status(500).json({ error: "Failed to delete reply" });
    }
});

app.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
});