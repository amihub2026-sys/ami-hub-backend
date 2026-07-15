const Profile = require("../models/Profile");

const createProfile = async (req,res)=>{

try{


const profile = await Profile.create({

userId:req.user._id,

fullName:req.body.fullName,

businessName:req.body.businessName || "",

mobile:req.body.mobile,

email:req.body.email,


accountType:req.body.accountType || "",

category:req.body.category || "",

city:req.body.city || "",

address:req.body.address || "",

profileImage:req.body.profileImage || null,

kycImage:req.body.kycImage || null,

qrCodeImage:req.body.qrCodeImage || null,

rating:req.body.rating || 4,

verified:req.body.verified || false,

termsAccepted:req.body.termsAccepted || false

});


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

    res.status(200).json({
      success: true,
      data: profile
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
        businessName: req.body.businessName,
        mobile: req.body.mobile,
        email: req.body.email,
        city: req.body.city,
        address: req.body.address
      },
      { new: true }
    );

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found"
      });
    }

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