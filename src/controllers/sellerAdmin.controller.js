const User = require("../models/User");

const Profile = require("../models/Profile");
const Post = require("../models/post.model");
const SellerHistory = require("../models/SellerHistory");
const getAllSellers = async (req,res)=>{

try{


const sellers = await User.find({
    isSeller:true,
    sellerStatus:"seller",
    role:"user"
})
.select(
    "fullName mobile email sellerStatus sellerSince createdAt"
)
.sort({
    sellerSince:-1
});


res.status(200).json({

success:true,

count:sellers.length,

data:sellers

});


}
catch(error){

res.status(500).json({

success:false,

message:error.message

});

}

};

const getSellerById = async (req,res)=>{

try{

const sellerId = req.params.id;


// seller basic details
const seller = await User.findById(sellerId)
.select(
"fullName mobile email sellerStatus sellerSince createdAt"
);


// seller profile
const profile = await Profile.findOne({
userId:sellerId
});


// seller posts
const posts = await Post.find({
sellerId:sellerId
});

// seller history
const history = await SellerHistory.find({
userId:sellerId
});


res.status(200).json({

success:true,

data:{
seller,
profile,
posts,
history
}

});


}
catch(error){

res.status(500).json({

success:false,

message:error.message

});

}

};
const removeSeller = async(req,res)=>{

try{

const seller = await User.findById(req.params.id);


if(!seller){

return res.status(404).json({
success:false,
message:"Seller not found"
});

}


// remove seller status

seller.isSeller = false;
seller.sellerStatus = "user";
seller.sellerSince = null;


await seller.save();


// save history

await SellerHistory.create({

userId:seller._id,

action:"removed_seller"

});


res.json({

success:true,
message:"Seller removed successfully"

});


}
catch(error){

res.status(500).json({

success:false,
message:error.message

});

}

};
module.exports = {
    getAllSellers,
    getSellerById,
    removeSeller
};