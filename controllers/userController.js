import { User } from "../models/User.js";
import ErrorHandler from "../utils/errorHandler.js";
import { sendToken } from "../utils/sendToken.js";
import { CatchAsyncHandler } from "../middlewares/CatchAsyncError.js";
import { sendMail } from "../utils/sendMail.js";
import { Course } from "../models/Course.js";
import cloudinary from "cloudinary"
import getDataUri from "../utils/datauri.js";
import { Stats } from "../models/Stats.js";
import crypto from "crypto"

// Route: api/v1/register [POST]
// Access : Public
export const registerUser = CatchAsyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  const file = req.file

  if (!name || !email || !password || !file) {
    return next(new ErrorHandler("plz fill all the field", 400));
  }
  let user = await User.findOne({ email }); //because password was selected false in model

  if (user) {
    return next(new ErrorHandler("user already exits", 409));
  }

  // upload the file in cloudniary
  const fileuri = getDataUri(file)
  const myCloud = await cloudinary.v2.uploader.upload(fileuri.content)

  user = await User.create({
    name,
    email,
    password,
    avatar: {
      public_id: myCloud.url,
      url: myCloud.secure_url,
    },
  });

  // send token
  sendToken( res, user, "Registation Successfull", 201);
});

// Route: api/v1/login [POST]
// Access : Public
export const loginUser = CatchAsyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorHandler("Enter the all Field", 400));
  }
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new ErrorHandler("Invalid password or Email", 409));
  }

  const isMatch = await user.isMatchPassword(password);

  if (!isMatch) {
    return next(new ErrorHandler("Invalid password or email", 404));
  }
  // send token
  sendToken(res, user, `welcome back ${user.name}`, 201);
});

// Route: api/v1/logout [GET]
// Access : Protected
export const logoutUser = CatchAsyncHandler(async (req, res, next) => {
  res
    .status(200)
    .clearCookie('token')
    .json({
      successful: true,
      message: "your are logout successfully",
    });
});

// Route: api/v1/me [GET]
// Access : Protected
export const getmyProfile = CatchAsyncHandler(async (req, res, next) => {
  // where id is not giving by manual
  const user = await User.findById(req.user._id);
  
 

  res.status(200).json({
    successful: true,
    user,
  });
});


// Route: api/v1/me [DELETE]
// Access : Protected
export const deleteMyProfile = CatchAsyncHandler(async (req, res, next) => {
  // where id is not giving by manual
  const user = await User.findById(req.user._id);
  
  await cloudinary.v2.uploader.destroy(user.avatar.public_id)

  await user.remove()
 

  res.status(200).clearCookie("token",{
    expires: new Date(Date.now()),
    httpOnly: true,
  }).json({
    successful: true,
    message: "Our profile is deleted successfully"
  });

});



// Route: api/v1/changepassword [PUT]
// Access : Protected
export const updatePassword = CatchAsyncHandler(async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return next(new ErrorHandler("plz the all Field", 400));
  }

  // where id is not giving by manual
  const user = await User.findById(req.user._id).select("+password");

  const isMatch = await user.isMatchPassword(oldPassword);

  if (!isMatch) {
    return next(new ErrorHandler("invalid old password", 400));
  }

  user.password = newPassword;

  await user.save();

  res.status(200).json({
    successful: true,
    message: "Password is change successfully",
  });
});

// Route: api/v1/changeprofile [PUT]
// Access : Protected
export const updateProfile = CatchAsyncHandler(async (req, res, next) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return next(new ErrorHandler("fill the fields", 400));
  }
  const user = await User.findById(req.user._id);

  if (name) user.name = name;
  if (email) user.email = email;

  await user.save();

  res.status(200).json({
    successfull: true,
    message: "the profile is updated",
  });
});

// Route: api/v1/changeprofile [PUT]
// Access : Protected
export const changeProfilePicture = CatchAsyncHandler(
  async (req, res, next) => {

    const user = await User.findById(req.user._id)

    // cloudniary add
    const file = req.file
    const fileuri = getDataUri(file)
    const myCloud = await cloudinary.v2.uploader.upload(fileuri.content)

    await cloudinary.v2.uploader.destroy(user.avatar.public_id);

    user.avatar = {
      public_id: myCloud.url,
      url: myCloud.secure_url
    };

    await user.save();

    res.status(200).json({
      successfull: true,
      message: "your profile picture is change",
    });
  }
);

// Route: api/v1/resetpassword/klajfldkfalkfakdflaklk(token) [POST]
// Access : Public
export const resetPassword = CatchAsyncHandler(async (req, res, next) => {

  const {token} = req.params;

  const resetPasswordToken = crypto
                                  .createHash("sha256")
                                  .update(token)
                                  .digest("hex")

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire:{
      $gt: Date.now()
    }
  })

  if(!user) return next(new ErrorHandler("Token is invalid or has been expire",401))

  user.password = req.body.password;

  user.resetPasswordExpire = undefined;
  user.resetPasswordToken = undefined;

  await user.save();

  res.status(200).json({
    successfull: true,
    message: "your password has changed Successfully",
  });
});

// Route: api/v1/forgetpassword [POST]
// Access : Public
export const forgetPassword = CatchAsyncHandler(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return next(new ErrorHandler("User don't exist", 400));
  }

  const resetToken = await user.getResetToken();

  await user.save()

  // https://localhost:3000/resetpassword/kjdhfkajdlkfaldkjfl
  const url = `${process.env.FRONT_URL}/resetpassword/${resetToken}`;

  const message = `Click on the link to reset your password. ${url}. if you have not request then please ignore`;

  // send token to email
  await sendMail(user.email, "Apna Udemy Reset the Password", message);

  res.status(200).json({
    successfull: true,
    message: `Rest token has been send to ${user.email}`,
  });
});

// Route: api/v1/addtoplaylist [POST]
// Access : Protected
export const addtoPlaylist = CatchAsyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  const course = await Course.findById(req.body.id);
  if (!course) {
    return next(new ErrorHandler("Course dosn't exist", 404));
  }

  // check the condition for the course is not already present
  const isExist = user.playlist.find((item) => {
    if (item.course.toString() === course._id.toString()) {
      return true;
    }
  });

  if (isExist) {
    return next(new ErrorHandler("Course already Exist", 409));
  }

  user.playlist.push({
    course: course._id,
    poster: course.poster.url,
  });

  await user.save();

  res.status(200).json({
    successfull: true,
    message: `Course add to the playlist`,
  });
});

// Route: api/v1/removeplaylist [DELETE]
// Access : Protected
export const removeFromPlaylist = CatchAsyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  // https://localhost:3000/api/v1/removeformplaylist?id=kdlakdl
  const course = await Course.findById(req.query.id);
  if (!course) {
    return next(new ErrorHandler("Course dosn't exist", 404));
  }
  const newPlaylist = user.playlist.filter((item) => {
    if (item.course.toString() !== course._id.toString()) return item;
  });

  user.playlist = newPlaylist;

  // here we add the when the playlist is empty
  if (!user.playlist.length) {
    res.status(200).json({
      successfull: true,
      message: `playlist is empty`,
    });
  }
  await user.save();

  res.status(200).json({
    successfull: true,
    message: `remove course from playlist`,
  });
});


// Route: api/v1/admin/users [GET]
// Access : Protected
export const getAllUsers = CatchAsyncHandler(async(req,res,next)=>{
  const users = await User.find({})

  res.status(200).json({
    successfull: true,
    users
  });
})

// Route: api/v1/admin/user/:id [PUT]
// Access : Protected
export const upadateUserRole = CatchAsyncHandler(async(req,res,next)=>{

  const user = await User.findById(req.params.id)

  if (!user) {
    return next(new ErrorHandler("User is not found",404))
  }

  if (user.role ==="user") {
    user.role = 'admin'
  }else{
    user.role = "user"
  }

  await user.save()

  res.status(200).json({
    successfull: true,
    message: "update the User Role successfully"
  });
})


// Route: api/v1/admin/user/:id [DELETE]
// Access : Protected
export const deleteUser = CatchAsyncHandler(async(req,res,next)=>{

  const user = await User.findById(req.params.id)
  
  if (!user) {
    return next(new ErrorHandler("User is not found",404))
  }

  await cloudinary.v2.uploader.destroy(user.avatar.public_id)

  // cancel subscription

  await user.deleteOne();

  res.status(200).json({
    successfull: true,
    message: "user is delete successfully"
  });
})


// real time changes in user
User.watch().on("change", async ()=>{
  
  const stats = await Stats.find({}).sort({createAt:"desc"}).limit(1)
  const subscription = await User.find({"subscription.status":"active"})

  stats[0].users = await User.countDocuments();
  stats[0].subscription = subscription.length;
  stats[0].createdAt = new Date(Date.now)

  await stats.save()
})