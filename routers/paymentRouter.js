import express from "express"
import { isAuthenticated } from "../middlewares/isAuthenticated.js"
import { buySubscription, cancelSubscription, getRazorpayKey, paymentVerification } from "../controllers/paymentController.js";

const router = express.Router()

//buy subscription
router
    .route("/subscribe")
    .get(isAuthenticated, buySubscription)

// for payment
router
    .route("/paymentverification")
    .post(isAuthenticated, paymentVerification)

// for razorpay key
router
    .route("/razorpaykey")
    .get(getRazorpayKey)

// for cancel subscription
router
    .route('/cancle')
    .delete(isAuthenticated, cancelSubscription)

export default router;