const razorpay = require("./razorpay");

/**
 * The payments boundary. Domain code imports from here and nowhere deeper —
 * reaching into `./razorpay` directly is how a second integration path starts.
 */
module.exports = { razorpay };
