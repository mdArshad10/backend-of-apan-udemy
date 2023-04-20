import express from "express";
import {
  addLecture,
  createCourse,
  getAllCourses,
  getCourseLecture,
  deleteCourse,
  deleteLecture,
} from "../controllers/courseController.js";
import uploadFile from "../middlewares/multer.js";
import {
  isAuthenticated,
  isAuthorizedAdmin,
} from "../middlewares/isAuthenticated.js";

const router = express.Router();

router
  .route("/courses")
  .get(getAllCourses);

// creeate course - only admin
router
  .route("/createcourse")
  .post(isAuthenticated, isAuthorizedAdmin, uploadFile, createCourse);

// add lecture, delete lecture ....
router
  .route("/course/:id")
  .get(isAuthenticated, getCourseLecture) //get all course lecture
  .post(isAuthenticated, isAuthorizedAdmin, uploadFile, addLecture) //add lecture video
  .delete(isAuthenticated, isAuthorizedAdmin, deleteCourse); //delete the videos in lecture

// delete the lecture
router
  .route("/lecture")
  .delete(isAuthenticated, isAuthorizedAdmin, deleteLecture);

export default router;
