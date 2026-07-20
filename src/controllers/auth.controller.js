const authService = require("../services/auth.service");

const register = async (req, res) => {
    try {

        const user = await authService.registerUser(
            req.body
        );

        res.status(201).json({
            success: true,
            message: "User Registered Successfully",
            data: user
        });

    } catch (error) {

        res.status(400).json({
            success: false,
            message: error.message
        });

    }
};

const login = async (req, res) => {

    console.log("LOGIN BODY:", req.body);

    try {

        const result = await authService.loginUser(
    req.body.identifier,
    req.body.password
);

        res.status(200).json({

            success: true,

            message: "Login Successful",

            token: result.token,

            user: result.user

        });


    } catch (error) {


        res.status(400).json({

            success: false,

            message: error.message

        });


    }
};

const getProfile = async (req, res) => {
    try {
        const user = req.user;

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

const adminLogin = async (req, res) => {
  try {
    const result = await authService.adminLogin(
      req.body.email,
      req.body.password
    );

    res.status(200).json({
      success: true,
      message: "Admin Login Successful",
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  adminLogin
};