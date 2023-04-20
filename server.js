import app from "./app.js"
import {connectDB} from "./config/database.js"
import cloudinary from "cloudinary"
import Razorpay from "razorpay";
import nodeCron from "node-cron"
import { Stats } from "./models/Stats.js";

// for database connection
connectDB();

// for cloudinary configuration
cloudinary.v2.config({
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.API_KEY, 
    api_secret: process.env.API_SECRET
});

// for rezorpay configuration
export const instance = new Razorpay({
  key_id:process.env.RAZORPAY_API_KEY,
  key_secret:process.env.RAZORPAY_API_SECRET,
});

// nodecron => which task schedular
// create the stats every 1st day of month
nodeCron.schedule("0 0 0 1 * *", async ()=>{
  try {
    await Stats.create({})
  } catch (error) {
    console.log(error);
  }
})


// run the server
app.listen(process.env.PORT, ()=>{
    console.log(`the server is running on ${process.env.PORT}`);
})