import { CatchAsyncHandler } from "../middlewares/CatchAsyncError.js";
import { Stats } from "../models/Stats.js";
import ErrorHandler from "../utils/errorHandler.js";
import { sendMail } from "../utils/sendMail.js";

// @router : app/v1/contact [POST]
// @acccess: public
// @desc: use for contact with contact form
export const contact = CatchAsyncHandler(async (req, res, next) => {
  const { name, email, message: contact_message } = req.body;

  if (!name || !email || !contact_message) {
    return next(new ErrorHandler("plz add all field", 409));
  }

  const to = process.env.MY_MAIL;
  const subject = "Contact from Apna Udemy";
  const message = `Hi, \n i am ${name} and my mail id is ${email} \n ${contact_message}`;

  await sendMail(to, subject, message);
  res.status(200).json({
    sucessfull: true,
    message: "your message has been send",
  });
});

// @router : app/v1/request [POST]
// @acccess: public
// @desc: use for request with request course form
export const courseRequest = CatchAsyncHandler(async (req, res, next) => {
  const { name, email, course } = req.body;

  if (!name || !email || !course) {
    return next(new ErrorHandler("plz add all field", 409));
  }

  const to = process.env.MY_MAIL;
  const subject = "Request for Coures from Apna Udemy";
  const message = `Hi, \n i am ${name} and my mail id is ${email} \n 
       i am requesting a course which name is ${course}`;

  await sendMail(to, subject, message);
  res.status(200).json({
    sucessfull: true,
    message: "your requet has been send",
  });
});

// @router : app/v1/admin/stat [GET]
// @acccess: private
// @desc: use for dispaly the admin dashboard stats
export const getAdminDashboardStats = CatchAsyncHandler(
  async (req, res, next) => {
    const stats = await Stats.find({}).sort({ createAt: "desc" }).limit(12);

    const statsData = [];

    for (let i = 0; i < stats.length; i++) {
      statsData.unshift(stats[i]);
    }

    const requiredSize = 12 - stats.length;

    // .unshif => places at starting
    for (let i = 0; i < requiredSize.length; i++) {
      statsData.unshift({
        users: 0,
        subscription: 0,
        views: 0,
      });
    }

    const usersCount = statsData[11].users;
    const subscriptionCount = statsData[11].subscription;
    const viewsCount = statsData[11].views;

    let usersPercentage = 0, subscriptionPercentage = 0, viewsPercentage =0;
    
    let usersProfit = 0, subscriptionProfit = 0, viewsProfit =0;

    if (statsData[10].users === 0) usersPercentage = usersCount*100;
    if (statsData[10].subscription === 0) subscriptionPercentage = subscriptionCount*100;
    if (statsData[10].views === 0) viewsPercentage = viewsCount*100;
    else{
      const difference = {
        users: statsData[11].users - statsData[10].users,
        subscription: statsData[11].subscription - statsData[10].subscription,
        views: statsData[11].views - statsData[10].views,
      }

      usersProfit = (difference.users/statsData[10].users * 100)
      viewsProfit = (difference.views/statsData[10].views * 100)
      subscriptionProfit = (difference.subscription/statsData[10].subscription * 100)

      if(usersProfit < 0) usersProfit = false;
      if(subscriptionProfit < 0 ) subscriptionProfit = false;
      if(viewsProfit < 0) viewsProfit = false;


    }

    res.status(200).json({
      sucessfull: true,
      stats: statsData,
      usersCount,
      subscriptionCount,
      viewsCount,
      usersPercentage, usersProfit,
      subscriptionPercentage, subscriptionProfit,
      viewsPercentage, viewsProfit
    });
  }
);
