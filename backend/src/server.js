// import {app} from "./app";
const app = require("./app");

// Start the backend server on port 3000 || 8000.
const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
    // Print a message when the server starts listening.
    console.log(`Server running on port http://localhost:${PORT}`);
});
