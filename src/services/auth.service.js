const jwt = require("jsonwebtoken");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

const registerUser = async (data) => {

    const existingUser = await User.findOne({
        mobile: data.mobile
    });

    if (existingUser) {
        throw new Error("Mobile already exists");
    }

    const hashedPassword = await bcrypt.hash(
        data.password,
        10
    );

    const user = await User.create({
        fullName: data.fullName,
        mobile: data.mobile,
        email: data.email,
        password: hashedPassword
    });

    return user;
};

const loginUser = async (mobile, password) => {

    const user = await User.findOne({ mobile });

    if (!user) {
        throw new Error("User not found");
    }

    const isMatch = await bcrypt.compare(
        password,
        user.password
    );

    if (!isMatch) {
        throw new Error("Invalid password");
    }

    const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );

    return {
        token,
        user
    };
};

const adminLogin = async (email, password) => {
  const admin = await User.findOne({
    email,
    role: "admin",
    isActive: true
  });

  if (!admin) {
    throw new Error("Admin not found");
  }

  if (admin.password !== password) {
    throw new Error("Invalid admin password");
  }

  const token = jwt.sign(
    { id: admin._id, role: "admin" },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  return { token, admin };
};

module.exports = {
  registerUser,
  loginUser,
  adminLogin
};