const app = require("./app");

const PORT = Number(process.env.PORT || 8080);

// Start the backend server on port 8080.
app.listen(8080, () => {
    // Print a message when the server starts listening.
    console.log(`Server running on port ${PORT}`);
});
