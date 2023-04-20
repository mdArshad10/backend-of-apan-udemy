import mongoose from "mongoose";
import validator from "validator";
import jwt  from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto"

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "plz enter the name"],
  },
  email: {
    type: String,
    required: [true, "plz enter the email"],
    unique: true,
    vaildate: validator.isEmail,
  },
  password: {
    type: String,
    required: [true, "plz enter the password"],
    minLength: [6, "plz password has min length"],
    select: false,
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  subscription: {
    id: String,
    status: String,
  },
  avatar: {
    public_id: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
  },
  playlist: [
    {
      course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
      poster: String,
    },
  ],
  createdAt:{
    type:Date,
    default: Date.now()
  },

  // those is used for reset password and forget password
  resetPasswordToken: String,
  resetPasswordExpire: String
});

// Method used for create token
schema.methods.getJWTToken = function(){
  return jwt.sign({_id: this._id}, process.env.JWT_SECRET,{
    expiresIn:"15d",
  })
}

// encrypt the password and run before the save
schema.pre("save", async function(next){

  // only run when password change
  if (!this.isModified("password")) return next();
  console.log('we are hashing the password');
  // save the password after bcrypt
  this.password = await bcrypt.hash(this.password,10)
  next();
})

// Method used for campare the passwords
schema.methods.isMatchPassword = async function(plainPassword){
    return await bcrypt.compare(plainPassword, this.password)
}

// Rest the Token
schema.methods.getResetToken = function(){
  // create 64 bytes of random digits as token
  const resetToken = crypto.randomBytes(64).toString('hex');

  // set the resttoken
  this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex")

  this.resetPasswordExpire = Date.now() + 1000*60*15;
  return resetToken;
}


export const User = mongoose.model("User", schema);
