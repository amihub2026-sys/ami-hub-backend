const Profile = require("../models/Profile");
const User = require("../models/User");
const SellerHistory = require("../models/SellerHistory");
const createProfile = async (req,res)=>{

try{


const profile = await Profile.create({

userId:req.user._id,

fullName:req.body.fullName,

mobile:req.body.mobile,

email:req.body.email,

profileImage:req.body.profileImage || null,

kycImage:req.body.kycImage || null,

qrCodeImage:req.body.qrCodeImage || null,

termsAccepted:req.body.termsAccepted || false

});
const updatedUser = await User.findByIdAndUpdate(
  req.user._id,
  {
    fullName: req.body.fullName,
    mobile: req.body.mobile,
    email: req.body.email,

    isSeller: true,
    sellerStatus: "seller",
    sellerSince: new Date(),
    isOnboardingCompleted: true
  },
  {
    new: true,
    runValidators: true
  }
);

console.log("UPDATED USER:", updatedUser);
const existingHistory = await SellerHistory.findOne({
  userId:req.user._id,
  action:"became_seller"
});


if(!existingHistory){

await SellerHistory.create({

  userId:req.user._id,

  action:"became_seller"

});

}
res.status(201).json({

success:true,

message:"Profile Created Successfully",

data:profile

});


}
catch(error){

res.status(400).json({

success:false,

message:error.message

});

}

};

const getMyProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({
      userId: req.user._id
    });

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found"
      });
    }

    const user = await User.findById(req.user._id)
      .select("fullName mobile email");

    res.status(200).json({
      success: true,
      data: {
        ...profile.toObject(),

        fullName:
          user?.fullName ||
          profile.fullName ||
          "",

        mobile:
          user?.mobile ||
          profile.mobile ||
          "",

        email:
          user?.email ||
          profile.email ||
          ""
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
const updateMyProfile = async (req, res) => {
  try {
    const profile = await Profile.findOneAndUpdate(
      { userId: req.user._id },
{
  fullName: req.body.fullName,
  mobile: req.body.mobile,
  email: req.body.email,
  profileImage: req.body.profileImage,
  kycImage: req.body.kycImage,
  qrCodeImage: req.body.qrCodeImage,
  termsAccepted: req.body.termsAccepted
},
      { new: true }
    );

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found"
      });
    }
    const updatedUser = await User.findByIdAndUpdate(
  req.user._id,
  {
    fullName: req.body.fullName,
    mobile: req.body.mobile,
    email: req.body.email
  },
  {
    new: true,
    runValidators: true
  }
);

    res.status(200).json({
      success: true,
      message: "Profile Updated Successfully",
      data: profile
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createProfile,
  getMyProfile,
  updateMyProfile
};