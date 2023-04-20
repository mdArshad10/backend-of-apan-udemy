import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  getmyProfile,
  updatePassword,
  updateProfile,
  changeProfilePicture,
  forgetPassword,
  resetPassword,
  addtoPlaylist,
  removeFromPlaylist,
  getAllUsers,
  upadateUserRole,
  deleteMyProfile,
  deleteUser,
} from "../controllers/userController.js";

import {
  isAuthenticated,
  isAuthorizedAdmin,
} from "../middlewares/isAuthenticated.js";

import uploadFile from "../middlewares/multer.js";

const router = express.Router();

// Register
router
  .route("/register")
  .post(uploadFile, registerUser);

// login
router
  .route("/login")
  .post(loginUser);

// logout
router
  .route("/logout")
  .get(logoutUser);

// get My profile
router
  .route("/me")
  .get(isAuthenticated, getmyProfile)
  .delete(isAuthenticated, deleteMyProfile);

// change the password
router
  .route("/changepassword")
  .put(isAuthenticated, updatePassword);

// chanage the profile
router
  .route("/changeprofile")
  .put(isAuthenticated, updateProfile);

// change the profile picture
router
  .route("/changeprofilepicture")
  .put(isAuthenticated, uploadFile, changeProfilePicture);

// forget password
router
  .route("/forgetpassword")
  .post(forgetPassword);

// Reset Password
router
  .route("/resetpassword/:token")
  .put(resetPassword);

// add to the playlist
router
  .route("/addtoplaylist")
  .post(isAuthenticated, addtoPlaylist);

// remove from the playlist
router
  .route("/removefromplaylist")
  .delete(isAuthenticated, removeFromPlaylist);

// Admin Router
router
  .route("/admin/users")
  .get(isAuthenticated, isAuthorizedAdmin, getAllUsers);

// Admin Router user
router
  .route("/admin/user/:id")
  .put(isAuthenticated, isAuthorizedAdmin, upadateUserRole)
  .delete(isAuthenticated, isAuthorizedAdmin, deleteUser)

export default router;
