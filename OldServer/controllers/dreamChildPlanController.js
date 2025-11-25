const DreamChildPlanModel = require("../models/DreamChildPlanModel");
const DreamChildPlan = require("../models/DreamChildPlanModel");
const Subscription = require("../models/Subscription");
const userModel = require("../models/userModel");

// Create DreamChild Plan
exports.createPlan = async (req, res) => {
  try {
    const { title, category, price, duration, features } = req.body;

    if (!title || !category || !price || !duration || !features) {
      return res.status(400).json({ success: false, message: "Please provide all required fields: title, category, price, duration, features.", });
    }

    const newPlan = new DreamChildPlan({ title, category, price, duration, features, });
    const savedPlan = await newPlan.save();

    res.status(201).json({ success: true, data: savedPlan });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.updatePlan = async (req, res) => {
  try {
    const { id } = req.params; // Get plan ID from request params
    const updateData = req.body; // Get update data from request body

    if (!id) {
      return res.status(400).json({ success: false, message: "Plan ID is required." });
    }

    const updatedPlan = await DreamChildPlan.findByIdAndUpdate(id, updateData, {
      new: true, // Return the updated document
      runValidators: true, // Ensure data validation
    });

    if (!updatedPlan) {
      return res.status(404).json({ success: false, message: "Plan not found." });
    }

    res.status(200).json({ success: true, data: updatedPlan });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


// Get All Plans
exports.getPlans = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;

    const plans = await DreamChildPlan.find().skip(skip).limit(limitNumber);

    const totalPlans = await DreamChildPlan.countDocuments();

    res.status(200).json({ success: true, data: plans, pagination: { totalPlans, currentPage: pageNumber, totalPages: Math.ceil(totalPlans / limitNumber), limit: limitNumber, }, });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};


exports.deletePlan = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ success: false, message: "Plan ID is required." });
    }

    const deletedPlan = await DreamChildPlan.findByIdAndDelete(id);

    if (!deletedPlan) {
      return res.status(404).json({ success: false, message: "Plan not found." });
    }

    res.status(200).json({ success: true, message: "Plan deleted successfully." });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}


///////////////////////////////////////////// subscribe //////////////////////////////////
exports.applySubscription = async (req, res) => {
  const userId = req.user?._id
  const planId = req.body.planId
  const amount = req.body?.paidAmount
  const paymentStatus = req.body?.paymentStatus


  try {
    if (!userId || !planId) {
      return res.status(400).json({ success: false, message: "User ID and Plan ID are required." });
    }

    const checkUser = await userModel.findById(userId)
    if (!checkUser) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    if (checkUser?.isSubscribed) {
      return res.status(400).json({ success: false, message: "User is already subscribed." });
    }
    const checkPlan = await DreamChildPlanModel.findById(planId)
    if (!checkPlan) {
      return res.status(404).json({ success: false, message: "Plan not found." });
    }

    const activeSubscription = await Subscription.findOne({
      _id: checkUser?.subscription,
      // status: 'active',
      endDate: { $gt: new Date() } // Check if the subscription is still valid
    });
    if (activeSubscription) {
      return res.status(400).json({ success: false, message: `Subscription is already taken. Please contact to admin.` });
    }
    // const subscriptionDate = new Date();
    // const expirationDate = new Date(subscriptionDate.getTime() + checkSubscription.duration * 24 * 60 * 60 * 1000);
    const subscriptionDate = new Date(); // Current date
    const expirationDate = new Date(subscriptionDate); // Copy current date

    // Add months based on the subscription duration
    expirationDate.setMonth(expirationDate.getMonth() + checkPlan.duration);

    const result = await Subscription.create({ userId, plan: planId, endDate: expirationDate, duration: checkPlan.duration, amount: amount, paymentStatus })
    checkUser.subscription = result?._id
    if (result) {
      await checkUser.save()
      return res.status(200).json({ success: true, message: "Subscription applied successfully", result });
    }
    return res.status(400).json({ success: false, message: "Failed to apply subscription" });
  } catch (error) {
    console.log("error on applySubscription: ", error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

exports.getSubscription = async (req, res) => {
  const id = req.params?.id
  try {
    const checkUser = await userModel.findById(id)
    if (!checkUser) {
      return res.status(404).json({ success: false, message: "User not found." });
    }
    const result = await Subscription.find({ userId: id }).populate("plan").sort({ createdAt: -1 })
    if (result) {
      return res.status(200).json({ success: true, message: "Subscription found", data: result });
    }
    return res.status(404).json({ success: false, message: "No subscription found." });
    /* const activeSubscription = await Subscription.findOne({
      _id: checkUser?.subscription,
      // status: 'active',
      endDate: { $gt: new Date() } // Check if the subscription is still valid
    });
    if (activeSubscription) {
      return res.status(200).json({ success: true, message: "Subscription found", subscription: activeSubscription });
    } */
    // return res.status(404).json({ success: false, message: "No active subscription found." });
  } catch (error) {
    console.log("error on getSubscription: ", error);
    return res.status(500).json({ success: false, error: error.message });
  }
}


exports.getAllSubscription = async (req, res) => {
  try {
    const result = await Subscription.find().sort({ createdAt: -1 }).populate("plan").populate("userId", "-password -__v -role -otp -isVerified")
    if (result) {
      return res.status(200).json({ success: true, message: "Subscriptions found", data: result });
    }
    return res.status(404).json({ success: false, message: "No subscriptions found." });
  } catch (error) {
    console.log("error on getAllSubscription: ", error);
    return res.status(500).json({ success: false, error: error.message });
  }
}