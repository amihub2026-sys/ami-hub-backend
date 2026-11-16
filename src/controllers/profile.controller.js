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
const getProfileForAdmin = async (req, res) => {
  try {
    const userId = req.params.userId;

    if (!/^[a-f\d]{24}$/i.test(userId || "")) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID"
      });
    }

    const user = await User.findById(userId)
      .select("fullName mobile email");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const profile = await Profile.findOne({ userId });

    return res.status(200).json({
      success: true,
      profileExists: !!profile,
      data: {
        ...(profile ? profile.toObject() : {}),
        userId: String(user._id),
        fullName: user.fullName || profile?.fullName || "",
        mobile: user.mobile || profile?.mobile || "",
        email: user.email || profile?.email || ""
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
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
const saveProfileForAdmin = async (req, res) => {
  try {
    const userId = req.params.userId;

    if (!/^[a-f\d]{24}$/i.test(userId || "")) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID"
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const profileData = {
      fullName: req.body.fullName,
      mobile: req.body.mobile,
      email: req.body.email,
      profileImage: req.body.profileImage || null,
      kycImage: req.body.kycImage || null,
      qrCodeImage: req.body.qrCodeImage || null,
      termsAccepted: req.body.termsAccepted === true
    };

    user.fullName = profileData.fullName;
    user.mobile = profileData.mobile;
    user.email = profileData.email;
    user.isSeller = true;
    user.sellerStatus = "seller";
    user.sellerSince = user.sellerSince || new Date();
    user.isOnboardingCompleted = true;

    await user.validate();

    const profile = await Profile.findOneAndUpdate(
      { userId },
      { $set: profileData },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true
      }
    );

    await user.save();

    await SellerHistory.updateOne(
      { userId, action: "became_seller" },
      {
        $setOnInsert: {
          userId,
          action: "became_seller"
        }
      },
      { upsert: true }
    );

    return res.status(200).json({
      success: true,
      message: "Selected user's profile saved successfully",
      data: profile
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createProfile,
  getMyProfile,
  updateMyProfile,
  getProfileForAdmin,
  saveProfileForAdmin
};