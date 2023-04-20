import jwt from "jsonwebtoken";
import { CatchAsyncHandler } from "./CatchAsyncError.js";
import ErrorHandler from "../utils/errorHandler.js";
import { User } from "../models/User.js";

export const isAuthenticated = CatchAsyncHandler(async (req, res, next) => {
  
  const { token } = req.cookies;

  if (!token) return next(new ErrorHandler("Not Logged In", 401));

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  req.user = await User.findById(decoded._id);

  next();
});


export const isAuthorizedAdmin = (req,res,next)=>{
  if (req.user.role !=="admin") {
    return next(new ErrorHandler(`${req.user.role} is not access the content`,403))
  }

  next();
}
