const app = require("./app");

const PORT = Number(process.env.PORT || 8000);

// Start the backend server on port 3000 || 8000.
app.listen(PORT, () => {
    // Print a message when the server starts listening.
    console.log(`Server running on port http://localhost:${PORT}`);
});
