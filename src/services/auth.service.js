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

    username: data.username,

    password: hashedPassword,

    role: "user",

    isActive: true,

    isOnboardingCompleted: false

});

    return user;
};

const loginUser = async (identifier, password) => {

    console.log("LOGIN IDENTIFIER:", identifier);
    console.log("LOGIN PASSWORD:", password);


    const user = await User.findOne({
      $or:[
        {mobile: identifier},
        {email: identifier},
        {username: identifier}
      ]
    });


    console.log("FOUND USER:", user);


    if (!user) {
        throw new Error("User not found");
    }


    const isMatch = await bcrypt.compare(
        password,
        user.password
    );


    console.log("PASSWORD MATCH:", isMatch);


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