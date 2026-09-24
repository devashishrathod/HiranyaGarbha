require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const fileUpload = require("express-fileupload");

const { mongoDb } = require("./database/mongoDb");
const { errorHandler } = require("./middlewares");
const { throwError } = require("./utils");
const allRoutes = require("./routes");
const { startJobs } = require("./jobs");

const app = express();
const port = process.env.PORT || 8080;

app.use(fileUpload({ useTempFiles: true, tempFileDir: "/tmp/" }));
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));
app.use("/hiranyagarbha/", allRoutes);
app.get("/", async (req, res) => {
  res.send("Welcome to HiranyaGarbha🚀");
});
app.use((req, res, next) => {
  throwError(404, "Invalid API");
});
app.use(errorHandler);

// Jobs start only once the database is up — a sweep that runs before mongoose
// connects buffers its query and times out, which reads as a broken scheduler
// rather than a boot-order problem.
mongoDb().then(startJobs);

app.listen(port, () =>
  console.log(`✅ HiranyaGarbha Server running on http://localhost:${port}`)
);
