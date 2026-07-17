const SubscriptionPlan = require("../models/subscriptionPlan.model");


// CREATE PLAN
exports.createPlan = async (req,res)=>{

    try{

        const plan = await SubscriptionPlan.create(req.body);

        res.status(201).json({
            success:true,
            message:"Plan created successfully",
            data:plan
        });


    }catch(error){

        res.status(500).json({
            success:false,
            message:error.message
        });

    }

};



// GET ALL PLANS (ADMIN)
exports.getPlans = async(req,res)=>{

    try{

        const plans = await SubscriptionPlan.find()
        .sort({createdAt:-1});


        res.json({

            success:true,
            data:plans

        });


    }catch(error){

        res.status(500).json({
            success:false,
            message:error.message
        });

    }

};



// GET ACTIVE PLANS (USER)
exports.getActivePlans = async(req,res)=>{

    try{

        const plans =
        await SubscriptionPlan.find({
            isActive:true
        });


        res.json({

            success:true,
            data:plans

        });


    }catch(error){

        res.status(500).json({
            success:false,
            message:error.message
        });

    }

};



// UPDATE PLAN
exports.updatePlan = async(req,res)=>{

    try{

        const plan =
        await SubscriptionPlan.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new:true
            }
        );


        res.json({

            success:true,
            message:"Plan updated",
            data:plan

        });


    }catch(error){

        res.status(500).json({
            success:false,
            message:error.message
        });

    }

};



// ACTIVATE / DEACTIVATE
exports.toggleStatus = async(req,res)=>{

    try{

        const plan =
        await SubscriptionPlan.findById(req.params.id);


        plan.isActive = !plan.isActive;


        await plan.save();


        res.json({

            success:true,
            message:"Status changed",
            data:plan

        });


    }catch(error){

        res.status(500).json({
            success:false,
            message:error.message
        });

    }

};



// DELETE PLAN
exports.deletePlan = async(req,res)=>{

    try{

        await SubscriptionPlan.findByIdAndDelete(
            req.params.id
        );


        res.json({

            success:true,
            message:"Plan deleted"

        });


    }catch(error){

        res.status(500).json({
            success:false,
            message:error.message
        });

    }

};