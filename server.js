const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const PORT = process.env.PORT || 3000;

// In-memory storage for pixel colors
const pixelState = {};

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Set up a route for the root URL to serve the index.html file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Keep track of the total number of connected users
let totalUsers = 0;

io.on('connection', (socket) => {
    // Increment the totalUsers count on each new connection
    totalUsers++;
    io.emit('updateUserCount', totalUsers); // Send the updated user count to all clients

    // logs on connection
    console.log('A user connected');

    // Send the existing pixel state to the new user
    socket.emit('initialState', pixelState);

    // Handle pixel placement
    socket.on('pixelClick', (data) => {
        pixelState[data.row + '-' + data.col] = data.color; // Store the color in the pixel state
        io.emit('updatePixel', data);
    });

    // Handle pixel removal
    socket.on('removePixel', (data) => {
        delete pixelState[data.row + '-' + data.col]; // Remove the color from the pixel state
        io.emit('removePixel', data);
    });

    socket.on('disconnect', () => {
        // Decrement the totalUsers count on each disconnection
        totalUsers = Math.max(0, totalUsers - 1);
        io.emit('updateUserCount', totalUsers); // Send the updated user count to all clients
        console.log('User disconnected');
    });
});

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
