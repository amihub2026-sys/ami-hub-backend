const Razorpay = require("razorpay");

console.log(
  "RAZORPAY KEY CHECK:",
  process.env.RAZORPAY_KEY_ID ? "FOUND" : "MISSING"
);

console.log(
  "RAZORPAY SECRET CHECK:",
  process.env.RAZORPAY_KEY_SECRET ? "FOUND" : "MISSING"
);


const razorpay = new Razorpay({

  key_id: process.env.RAZORPAY_KEY_ID,

  key_secret: process.env.RAZORPAY_KEY_SECRET

});


module.exports = razorpay;