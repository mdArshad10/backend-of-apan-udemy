import { CatchAsyncHandler } from "../middlewares/CatchAsyncError.js";
import { Payment } from "../models/Payment.js";
import { User } from "../models/User.js";
import {instance} from "../server.js"
import crypto from "crypto"


// Route: app/v1/subscribe [GET]
// @ccess: Protect
export const buySubscription = CatchAsyncHandler(async(req,res,next)=>{
    
    const user = await User.findById(req.user._id)

    const plan_id = process.env.PLAN_ID || 'plan_7wAosPWtrkhqZw'

    const subscription = await instance.subscriptions.create({
        plan_id,
        customer_notify: 1,
        total_count: 12,
        
      })
    
    user.subscription = {
        id: subscription.id ,
        status: subscription.status,
    }

    await user.save();

    res.status(201).json({
        success: true,
        subscriptionId: subscription.id
    })
    
})

// Route: app/v1/paymentverification [POST]
// @ccess: Protect
export const paymentVerification = CatchAsyncHandler(async(req,res,next)=>{
    
    const {razorpay_payment_id,razorpay_subscription_id,razorpay_signature} = req.body;

    const user = await User.findById(req.user._id)

    const subscriptionId = user.subscription.id;

    // yaha per kiya kam hoga hai ???
    const generated_signature = crypto.createHmac("sha256",process.env.RAZORPAY_API_SECRET).update(razorpay_payment_id+"|"+subscriptionId,"utf-8").digest("hex")

    const isAuthentic = razorpay_signature === generated_signature;
    
    if(!isAuthentic) return res.direct(`${process.env.FRONT_URL}/paymentfail`)

    // database comes here
    await Payment.create({
        razorpay_payment_id, razorpay_signature, razorpay_subscription_id
    })

    user.subscription.status = true

    await user.save()

    res.direct(`${process.env.FRONT_URL}/paymentsuccess?refernce=${razorpay_payment_id}`)
    
})

// Route: app/v1/razorpaykey [GET]
// @ccess: Public
export const getRazorpayKey = CatchAsyncHandler(async(req,res,next)=>{
    res.status(200).json({
        success: true,
        key: process.env.RAZORPAY_API_KEY
    })
})


// Route: app/v1/cancle [DELETE]
// @ccess: Protect
export const cancelSubscription = CatchAsyncHandler(async(req,res,next)=>{
    
    const user = await User.findById(req.user._id)

    const subscriptionId =  user.subscription.id;

    let refund = false
    // let refund = process.env.REFUND_DAY

    await instance.subscription.cancel(subscriptionId)

    const payment = await Payment.findOne({
        razorpay_subscription_id: subscriptionId
    })

    const refundTime = process.env.REFUND_DAY * 24*60*60*1000
    const gap = new Date() - payment.createdAt;

    if (refundTime > gap) {
        await instance.payment.refund(payment.razorpay_payment_id)
        refund = true
    }

    await payment.remove();

    user.subscription.id = undefined;
    user.subscription.status = undefined;

    res.status(200).json({
        success: true,
        message: refund ? "subscription cancelled. you will full refund within 7 Days" : "Subscription Cancelled. Now refund initiated as subscription was cancelled after 7 days"
    })
})
