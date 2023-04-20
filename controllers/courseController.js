import { CatchAsyncHandler } from "../middlewares/CatchAsyncError.js";
import { Course } from "../models/Course.js";
import { Stats } from "../models/Stats.js";
import getDataUri from "../utils/datauri.js";
import ErrorHandler from "../utils/errorHandler.js";
import cloudinary from "cloudinary";

// Route: api/v1/courses [GET]
// Access : public
export const getAllCourses = CatchAsyncHandler(async (req, res, next) => {
  const courses = await Course.find().select("-lectures");
  res.status(200).json({
    success: true,
    courses,
  });
});

// Route: api/v1/createcourse [POST]
// Access : private (only admin)
export const createCourse = CatchAsyncHandler(async (req, res, next) => {
  const { title, description, category, createdBy } = req.body;

  if (!title || !description || !category || !createdBy) {
    return next(new ErrorHandler("please add all fields", 400));
  }

  // it is use for file upload
  const file = req.file;

  const fileuri = getDataUri(file);

  const myCloud = await cloudinary.v2.uploader.upload(fileuri.content);

  await Course.create({
    title,
    description,
    category,
    createdBy,
    poster: {
      public_id: myCloud.public_id,
      url: myCloud.secure_url,
    },
  });

  res.status(201).json({
    success: true,
    message: "your are created a Course",
  });
});

// Route: api/v1/course/:id [GET]
// Access : public
export const getCourseLecture = CatchAsyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return next(new ErrorHandler("the Course is not Found", 404));
  }
  course.views += 1;

  await course.save();
  res.status(201).json({
    success: true,
    lectures: course,
  });
});

// Route: api/v1/course/:id [POST]
// Access : private
export const addLecture = CatchAsyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { title, description } = req.body;
  const course = await Course.findById(id);

  // there we use the multer
  const file = req.file;

  if (!course) {
    return next(new ErrorHandler("the Course is not Found", 404));
  }

  // file uploaded
  const fileuri = getDataUri(file);

  const myCloud = await cloudinary.v2.uploader.upload(fileuri.content, {
    resource_type: "video",
  });

  course.lectures.push({
    title,
    description,
    video: {
      public_id: myCloud.url,
      url: myCloud.secure_url,
    },
  });

  course.numOfVideos = course.lectures.length;

  await course.save();
  res.status(201).json({
    success: true,
    message: "Lectures will added on Courses",
  });
});

// Route: api/v1/course/:id [DELETE]
// Access : private
export const deleteCourse = CatchAsyncHandler(async(req,res,next)=>{
  const {id} = req.params;
  const course = await Course.findById(id)

  if(!course) return next(new ErrorHandler("the course is not alaviable",404))

  await cloudinary.v2.uploader
  .destroy(course.poster.public_id)

  for (let i = 0; i < course.lectures.length; i++) {
    const singleLecture = course.lectures[i];
    await cloudinary.v2.uploader.destroy(singleLecture.video.public_id,{
      resource_type:"video"
    })
    console.log(singleLecture.video.public_id);
  }

  await course.deleteOne();

  res.status(200).json({
    success: true,
    message: "Course Deleted Successfully",
  })

})

// Route: api/v1/lecture [DELETE]
// Access : private
export const deleteLecture = CatchAsyncHandler( async(req,res,next)=>{
  const {courseId, lectureId} = req.query;

  const course = await Course.findById(courseId)
  if (!course) {
    return next(new ErrorHandler("the Course is not exist",404))
  }

  // find the course's lecture which is equal to lecture id
  const lecture = course.lectures.find((item)=>{
    if(item._id.toString() === lectureId.toString())  return item
  })

  // remove the element from cloudinary
  await cloudinary.v2.uploader.destroy(lecture.video.public_id,{
    resource_type:"video"
  })

  // filter the lecture
  course.lectures = course.lectures.filter((item)=>{
    if(item._id.toString()!== lectureId.toString())  return item
  })

  course.numOfVideos = course.lectures.length;

  await course.save()

  res.status(200).json({
    success: true,
    message: "delete the lecture sucessfully"
  })
})


Course.watch().on("change", async()=>{
  const stats = await Stats.find({}).sort({createAt:"desc"}).limit(1)
  const course = await Course.find({})

  totalView = 0

  for (let i = 0; i < course.length; i++) {
    const element = course[i];
    totalView += element.views;
  }

  stats[0].views = totalView;
  stats[0].createdAt = new Date(Date.now)

  await stats.save()
})