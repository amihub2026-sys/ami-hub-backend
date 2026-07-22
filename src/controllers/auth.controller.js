const authService = require("../services/auth.service");

const User = require("../models/User");

const jwt = require("jsonwebtoken");

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

const otpStore = {};



const sendOtp = async(req,res)=>{

 try{

 const {mobile}=req.body;


 const otp =
 Math.floor(100000 + Math.random()*900000)
 .toString();


 otpStore[mobile]=otp;


 console.log(
 "OTP:",
 otp
 );


 res.json({

 success:true,
 message:"OTP Sent"

 });


 }catch(error){

 res.status(400).json({

 success:false,
 message:error.message

 });

 }

};





const verifyOtp = async(req,res)=>{

try{


const {
mobile,
otp
}=req.body;



if(
otpStore[mobile] !== otp
){

throw new Error(
"Invalid OTP"
);

}



let user =
await User.findOne({
mobile
});



if(!user){

user =
await User.create({

mobile,

fullName:"New User",

role:"user",

isActive:true,

isOnboardingCompleted:false

});

}



const token =
jwt.sign(
{
id:user._id
},
process.env.JWT_SECRET,
{
expiresIn:"7d"
}
);



res.json({

success:true,

token,

user

});



}catch(error){

res.status(400).json({

success:false,

message:error.message

});

}


};

module.exports={
register,
login,
getProfile,
adminLogin,
sendOtp,
verifyOtp
};