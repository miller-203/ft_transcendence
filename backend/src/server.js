const app = require("./app");

// Start the backend server on the configured port.
const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
    console.log(`Server running on port http://localhost:${PORT}`);
});
