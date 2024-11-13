const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const { broadbandnowscrapper } = require("./functions");
const router = express.Router();
const redis = require("./redis");

app.use(cors());
app.use(bodyParser.json());

app.use("/api", router);
app.use("/", async (req, res) => {
  res.send("Welcome to the Broadband Now Scraper API");
});

// router
router.route("/fetch-providers/:zip").get(async (req, res) => {
  try {
    const type = req.query.type || "residential";
    if (type !== "residential" && type !== "business") {
      throw new Error(
        "Invalid type. Type must be either residential or business"
      );
    }
    const key = `${req.params.zip}-${type}`;
    const cachedData = await redis.get(key);
    if (cachedData) {
      return res.json(JSON.parse(cachedData));
    }
    const data = await broadbandnowscrapper(req.params.zip, type);
    res.json(data);
    redis.set(key, JSON.stringify(data), "EX", 60 * 60 * 24);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = app;
