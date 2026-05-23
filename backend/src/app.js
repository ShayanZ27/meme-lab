const express = require("express");
const cors = require("cors");
const memeRoutes = require("./routes/memeRoutes");

const app = express();

const authRoutes = require("./routes/authRoutes");

// Middlewares
app.use(cors());
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/meme", memeRoutes);
const communityRoutes = require("./routes/communityRoutes");
app.use("/api/community", communityRoutes);

app.get("/", (req, res) => {
    res.send("Hello World - Meme Lab Backend");
});

module.exports = app;
