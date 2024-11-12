const app = require("./app");
const http = require("http");
const server = http.createServer(app);
const port = 3000;
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
