const express = require("express");
var path = require("path");
const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  var options = {
    root: path.join(__dirname),
  };

  var fileName = "home.html";
  res.sendFile(fileName, options);
});

app.listen(PORT, () => {
  console.log(`Listning on port ${PORT}`);
});
