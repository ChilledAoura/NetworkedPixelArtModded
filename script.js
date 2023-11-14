document.addEventListener("DOMContentLoaded", function () {
    const canvas = document.getElementById("canvas");
    const socket = io();
    let selectedColor = "#00f"; // Default color is blue

    // Create a 20x20 grid of pixels
    for (let i = 0; i < 20; i++) {
        for (let j = 0; j < 20; j++) {
            const pixel = document.createElement("div");
            pixel.classList.add("pixel");
            pixel.setAttribute("data-row", i);
            pixel.setAttribute("data-col", j);
            canvas.appendChild(pixel);

            // Add click event listener to handle pixel placement or removal
            pixel.addEventListener("click", handlePixelClick);
        }
    }

    // Create the color display square
    const colorDisplay = document.getElementById("color-display");
    colorDisplay.style.backgroundColor = selectedColor;

    // Listen for the initial state from the server
    socket.on('initialState', (initialState) => {
        applyInitialState(initialState);
    });

    // Listen for 'updatePixel' and 'removePixel' events from the server
    socket.on('updatePixel', (data) => {
        updatePixel(data);
    });

    socket.on('removePixel', (data) => {
        removePixel(data);
    });

    // Apply the initial state received from the server
    function applyInitialState(initialState) {
        for (const key in initialState) {
            if (initialState.hasOwnProperty(key)) {
                const [row, col] = key.split('-');
                const color = initialState[key];
                updatePixel({ row, col, color });
            }
        }
    }

    // Update the corresponding pixel on the client
    function updatePixel(data) {
        const pixels = document.querySelectorAll(`[data-row="${data.row}"][data-col="${data.col}"]`);
        pixels.forEach((pixel) => {
            pixel.style.backgroundColor = data.color || "#00f";
        });
    }

    // Remove the corresponding pixel on the client
    function removePixel(data) {
        const pixels = document.querySelectorAll(`[data-row="${data.row}"][data-col="${data.col}"]`);
        pixels.forEach((pixel) => {
            pixel.style.backgroundColor = "#fff";
        });
    }

    // Handle pixel placement or removal when clicking on a pixel
    function handlePixelClick(event) {
        const clickedPixel = event.target;
        const row = clickedPixel.getAttribute("data-row");
        const col = clickedPixel.getAttribute("data-col");
        const pixelColor = window.getComputedStyle(clickedPixel).backgroundColor;

        // If the pixel is colored, emit a 'removePixel' event to the server
        if (pixelColor !== 'rgba(0, 0, 0, 0)' && pixelColor !== 'rgb(255, 255, 255)') {
            socket.emit('removePixel', { row, col });
        }
        // If the pixel is not colored, emit a 'pixelClick' event with the selected color
        else {
            socket.emit('pixelClick', { row, col, color: selectedColor });
        }
    }

    // Get the selected color based on the pressed keys
    function getSelectedColor() {
        const keyToColor = {
            '1': '#f00', // Red
            '2': '#0f0', // Green
            '3': '#33FFFF', // Blue
            '4': '#ff0', // Yellow
            '5': '#f90', // Orange
            '6': '#FF66FF', // Purple
            '8': '#fff', // White
            '7': '#000'  // Black
        };

        const pressedKey = event.key.toUpperCase();
        return keyToColor[pressedKey] || '#00f'; // Default to blue if the key is not mapped
    }

    // Listen for keyboard events to change the selected color
    document.addEventListener('keydown', (event) => {
        selectedColor = getSelectedColor();
        colorDisplay.style.backgroundColor = selectedColor;
    });

    // Disconnect a specific user when the button is clicked
    const disconnectButton = document.getElementById('disconnectButton');
    disconnectButton.addEventListener('click', () => {
        const socketId = prompt('Enter the socket ID of the user to disconnect:');
        if (socketId) {
            socket.disconnectUser(socketId);
        }
    });
});
