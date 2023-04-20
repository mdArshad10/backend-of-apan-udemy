import mongoose from "mongoose";

const schema = new mongoose.Schema({
    title:{
        type: String,
        required:[true,"plz enter the title of Course"],
        minLength:[4,"Title must be least 4 characters"],
        maxLength: [80," title can't exced 80 characters"]
    },
    description:{
        type: String,
        required:[true, "plz enter the description of Course"],
        minLength:[20,"Title must be least 20 characters"],    },
    lectures:[{
        title:{
            type:String,
            required:[true,"plz enter tilt"]
        },
        description:{
            type:String,
            required:[true,"plz enter tilt"]
        },
        video:{
            public_id:{
                type: String,
                required:true,
            },
            url:{
                type: String,
                required:true,
            }
        }
    }],
    poster:{
        public_id:{
            type: String,
            required:true,
        },
        url:{
            type: String,
            required:true,
        }
    },
    views:{
        type: Number,
        default: 0,
    }, 
    numOfVideos:{
        type: Number,
        default:0,
    },
    category:{
        type: String,
        required:true,
    },
    createdBy:{
        type: String,
        required: [true,"enter course creatoer name"]
    },
    createdAt:{
        type: Date,
        default: Date.now,
    }
})

export const Course = mongoose.model("Course",schema)