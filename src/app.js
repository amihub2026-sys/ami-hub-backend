
const express = require("express");
const cors = require("cors");
const path = require("path");

// ============================================
// ROUTE IMPORTS
// ============================================

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

const heroSliderRoutes = require(
  "./routes/heroSlider.routes"
);

const subscriptionPlanRoutes = require(
  "./routes/subscriptionPlan.routes"
);

const boostPlanRoutes = require(
  "./routes/boostPlan.routes"
);

const customFieldRoutes = require(
  "./routes/customField.routes"
);

const customFieldAssignmentRoutes = require(
  "./routes/customFieldAssignment.routes"
);

const paymentRoutes = require(
  "./routes/payment.routes"
);

const subscriptionRoutes = require(
  "./routes/subscription.routes"
);

const sellerAdminRoutes = require(
  "./routes/sellerAdmin.routes"
);

// ============================================
// EXPRESS APP
// ============================================

const app = express();

// ============================================
// CORS CONFIGURATION
// ============================================

// Trusted frontend origins
const allowedOrigins = new Set([
  "http://localhost:4200",
  "http://127.0.0.1:4200",
  "https://ami-hub-node-sepia.vercel.app"
]);

// Additional trusted frontend domains can be
// configured in Render environment variables:
//
// FRONTEND_URLS=https://example.com,https://www.example.com

const additionalOrigins = (
  process.env.FRONTEND_URLS || ""
)
  .split(",")
  .map((origin) => origin.trim().replace(/\/$/, ""))
  .filter(Boolean);

additionalOrigins.forEach((origin) => {
  allowedOrigins.add(origin);
});

const corsOptions = {
  origin: (origin, callback) => {

    // Allow server-to-server requests and requests
    // without an Origin header.
    if (!origin) {
      return callback(null, true);
    }

    // Allow only trusted frontend domains.
    if (allowedOrigins.has(origin)) {
      return callback(null, true);
    }

    // Log blocked domains for troubleshooting.
    console.warn(
      "CORS blocked origin:",
      origin
    );

    return callback(
      new Error("Not allowed by CORS")
    );
  },

  credentials: true,

  methods: [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS"
  ],

  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-CSRF-Token",
    "X-Requested-With"
  ],

  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

// ============================================
// BODY PARSING
// ============================================

app.use(express.json({
  limit: "10mb"
}));

app.use(express.urlencoded({
  extended: true,
  limit: "10mb"
}));

// ============================================
// HEALTH CHECK
// ============================================

app.get("/", (req, res) => {
  return res.status(200).send(
    "🚀 AMIHUB Backend is Running Successfully!"
  );
});

app.get("/api/health", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "AMIHUB API is running",
    timestamp: new Date().toISOString()
  });
});

// ============================================
// AUTHENTICATION & USERS
// ============================================

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/user", userRoutes);

// ============================================
// BUSINESS & MARKETPLACE
// ============================================

app.use("/api/business", businessRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/enquiries", enquiryRoutes);
app.use("/api/posts", postRoutes);

// ============================================
// CATEGORIES
// ============================================

app.use("/api/categories", categoryRoutes);
app.use("/api/subcategories", subcategoryRoutes);

// ============================================
// NOTIFICATIONS & CHAT
// ============================================

app.use("/api/notifications", notificationRoutes);
app.use("/api/chats", chatRoutes);

// ============================================
// DASHBOARD & ADMIN
// ============================================

app.use("/api/dashboard", dashboardRoutes);

app.use("/api/admin", adminRoutes);
app.use("/api/admin", sellerAdminRoutes);

// ============================================
// REPORTS & BLOCKS
// ============================================

app.use("/api/reports", reportRoutes);
app.use("/api/blocks", blockRoutes);

// ============================================
// FILE UPLOADS
// ============================================

app.use("/api/uploads", uploadRoutes);

app.use(
  "/uploads",
  express.static(
    path.join(__dirname, "../uploads")
  )
);

// ============================================
// HERO SLIDER
// ============================================

app.use(
  "/api/hero-slider",
  heroSliderRoutes
);

// ============================================
// SUBSCRIPTION PLANS
// ============================================

app.use(
  "/api/subscription-plans",
  subscriptionPlanRoutes
);

// ============================================
// USER SUBSCRIPTIONS
// ============================================

app.use(
  "/api/subscriptions",
  subscriptionRoutes
);

// ============================================
// BOOST PLANS
// ============================================

app.use(
  "/api/boost-plans",
  boostPlanRoutes
);

// ============================================
// CUSTOM FIELDS
// ============================================

app.use(
  "/api/admin/custom-fields",
  customFieldRoutes
);

app.use(
  "/api/custom-field-assignment",
  customFieldAssignmentRoutes
);

// ============================================
// RAZORPAY PAYMENT
// ============================================

app.use(
  "/api/payment",
  paymentRoutes
);

// ============================================
// 404 HANDLER
// ============================================

app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: "API route not found"
  });
});

// ============================================
// ERROR HANDLER
// ============================================

app.use((err, req, res, next) => {
  console.error("AMIHUB API ERROR:", err.message);

  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({
      success: false,
      message: "Request origin is not allowed"
    });
  }

  return res.status(err.status || 500).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : err.message || "Internal server error"
  });
});

// ============================================
// EXPORT APP
// ============================================

module.exports = app;
