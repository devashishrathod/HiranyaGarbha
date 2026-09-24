const fs = require("fs");
const path = require("path");
const express = require("express");

const router = express.Router();
const routesDir = __dirname;

/*
 * Mounted by hand in index.js instead, BEFORE express.json().
 *
 * The Razorpay signature is an HMAC over the raw request bytes, and anything
 * mounted through this auto-loader has already been through the JSON parser by
 * the time it runs. See docs/SUBSCRIPTIONS.md section 6.
 */
const MOUNTED_EARLY = new Set(["webhooks.js"]);

fs.readdirSync(routesDir).forEach((file) => {
  const fullPath = path.join(routesDir, file);
  if (
    file !== "index.js" &&
    !MOUNTED_EARLY.has(file) &&
    file.endsWith(".js") &&
    fs.statSync(fullPath).isFile()
  ) {
    const routeModule = require(fullPath);
    const mainRouter = routeModule.router || routeModule;
    const mainPrefix =
      routeModule.routePrefix || "/" + path.basename(file, ".js");
    if (mainRouter && typeof mainRouter === "function") {
      router.use(mainPrefix, mainRouter);
      console.log(`✅ Mounted: ${mainPrefix} → ${file}`);
    }
    // Support extraRoutes array
    if (Array.isArray(routeModule.extraRoutes)) {
      routeModule.extraRoutes.forEach(({ path, router: extraRouter }) => {
        if (path && typeof extraRouter === "function") {
          router.use(path, extraRouter);
          console.log(`🔁 Extra Mounted: ${path} → ${file}`);
        }
      });
    }
  }
});

module.exports = router;
