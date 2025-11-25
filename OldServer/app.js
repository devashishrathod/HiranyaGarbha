const express = require("express");
const connectDB = require("./config/dbConnection.js");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5580;
connectDB();

app.use(cors());
app.use(express.json());

app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/plans", require("./routes/dreamChildPlanRoutes"));
app.use("/api/main-categories", require("./routes/mainCategoriesRoutes"));
app.use("/api/medias-categories", require("./routes/mediaRoutes"));
app.use("/api/image", require("./routes/imageRoutes"));
app.use("/api/video", require("./routes/videoRoutes"));

app.get("/", (req, res) => {
  res.send("Welcome to Adiya Dream Child server.");
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: "Something went wrong" });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
