require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const fileUpload = require("express-fileupload");

const { mongoDb } = require("./database/mongoDb");
const {
  errorHandler,
  removeTempFiles,
  rejectOversizedFiles,
} = require("./middlewares");
const { throwError } = require("./utils");
const { MAX_UPLOAD_BYTES } = require("./constants");
const allRoutes = require("./routes");
const { router: webhookRoutes } = require("./routes/webhooks");
const { startJobs } = require("./jobs");

const app = express();
const port = process.env.PORT || 8080;

// First, so errors raised while an upload is parsed still carry CORS headers
// — without them the browser hides the real error behind a CORS failure.
app.use(cors());
app.use(removeTempFiles);
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
    // busboy flags a file as truncated on reaching the limit, so a file of
    // exactly MAX_UPLOAD_BYTES needs one byte of room to get through.
    limits: { fileSize: MAX_UPLOAD_BYTES + 1 },
  }),
);
app.use(rejectOversizedFiles);

/*
 * ⚠️ Webhooks mount BEFORE express.json().
 *
 * Razorpay signs the raw request body; once the JSON parser has consumed the
 * stream, re-serialising the parsed object yields different bytes and the
 * signature can never verify. The router applies express.raw() itself.
 * See docs/SUBSCRIPTIONS.md section 6.
 */
app.use("/hiranyagarbha/webhooks", webhookRoutes);

app.use(express.json());
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
