const app = require("./app");
require("dotenv").config();

const PORT = 5000;

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
