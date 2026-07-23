const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const profileRoutes = require("./routes/profile.routes");
const businessRoutes = require("./routes/business.routes");
const favoriteRoutes = require("./routes/favorite.routes");
const reviewRoutes = require("./routes/review.routes");
const enquiryRoutes = require("./routes/enquiry.routes");
const adminRoutes = require("./routes/admin.routes");
const userRoutes = require("./routes/user.routes");
const notificationRoutes = require("./routes/notification.routes");
const chatRoutes = require("./routes/chat.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const categoryRoutes = require("./routes/category.routes");
const subcategoryRoutes = require("./routes/subcategory.routes");
const postRoutes = require("./routes/post.routes");
const reportRoutes = require("./routes/report.routes");
const blockRoutes = require("./routes/block.routes");
const uploadRoutes = require("./routes/upload.routes");
const subscriptionPlanRoutes =
require("./routes/subscriptionPlan.routes");
const boostPlanRoutes =
require("./routes/boostPlan.routes");
const customFieldRoutes =
require("./routes/customField.routes");
const customFieldAssignmentRoutes =
require("./routes/customFieldAssignment.routes");
const paymentRoutes =
require("./routes/payment.routes");
const subscriptionRoutes =
require("./routes/subscription.routes");
const path = require("path");

const app = express();

app.use(cors({
  origin: function (origin, callback) {

    if (
      !origin || 
      origin.startsWith("http://localhost:")
    ) {
      callback(null, true);
    } 
    else if (
      origin === "https://ami-hub-node-sepia.vercel.app"
    ) {
      callback(null, true);
    } 
    else {
      callback(new Error("Not allowed by CORS"));
    }

  },
  credentials:true
}));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("🚀 AMIHUB Backend is Running Successfully!");
});

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/business", businessRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/enquiries", enquiryRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/user", userRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/subcategories", subcategoryRoutes);
app.use("/api/posts", postRoutes);
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use("/api/reports", reportRoutes);
app.use("/api/blocks", blockRoutes);
app.use("/api/uploads", uploadRoutes);
app.use(
  "/api/subscription-plans",
  subscriptionPlanRoutes
);
app.use(
"/api/boost-plans",
boostPlanRoutes
);
app.use(
"/api/admin/custom-fields",
customFieldRoutes
);
app.use(
 "/api/custom-field-assignment",
 customFieldAssignmentRoutes
);
app.use(
"/api/payment",
paymentRoutes
);
app.use(
"/api/subscriptions",
subscriptionRoutes
);
module.exports = app;