import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import bodyParser from "body-parser";
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:8000", // Laravel app URL
        methods: ["GET", "POST"],
    },
});

// Middleware to parse JSON
app.use(bodyParser.json());

const users = {}; // { userId: socketId }

// Listen for WebSocket connections
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Handle user identification (e.g., sent from the client)
    socket.on('register', (userId) => {
        users[userId] = socket.id;
        console.log(userId)
        console.log(`User registered: ${userId} with socket ID: ${socket.id}`);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        for (const [userId, socketId] of Object.entries(users)) {
            if (socketId === socket.id) {
                delete users[userId];
                console.log(`User disconnected: ${userId}`);
                break;
            }
        }
    });
});

// Handle HTTP POST requests to send notifications
app.post('/emit', (req, res) => {
    const { event, data, userId } = req.body;
    console.log(req.body)
    if (!event || !data || !userId) {
        return res.status(400).send({ error: 'Event, data, and userId are required' });
    }
    console.log(users)
    const socketId = users[userId];
    console.log(`Target userId: ${userId}, socketId: ${socketId}`);

    if (socketId) {
        // Emit the event to the specific user
        io.to(socketId).emit(`notification:${userId}`, data);
        console.log(`Sent event "${event}" to userId: ${userId}, socketId: ${socketId}`);
        return res.send({ success: true });
    }

    return res.status(404).send({ error: 'User not connected' });
});

server.listen(3000, () => {
    console.log('Socket.IO server running on http://localhost:3000');
});
