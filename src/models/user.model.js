import mongoose, {model, Schema} from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"

// const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/.+@.+\..+/, "Please enter a valid email address"], // Regex for email validation
    },
    password: {
      type: String,
      required: function () {
        // Password is required only if the user isn't signing in via Google
        return this.google_id === undefined || this.google_id === null;
      },
    },
    google_id:{
      type: String,
      unique: true,
      sparse: true, // To allow either google_id or email/password, but not both
    },
    role: {
      type: String,
      enum: ["user", "admin"], // Assuming roles can be 'user' or 'admin'
      default: "user",
    },
    watchList:[{
      type:Schema.Types.ObjectId,
      ref:'Movie'
    }],
    likedMovies: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Movie', // Reference to the Movie model
      },
    ],
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);


userSchema.pre("save", async function (next) {
  if(!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10)
  next()
})

userSchema.methods.isPasswordCorrect = async function(password){
  return await bcrypt.compare(password, this.password)
}
userSchema.methods.generateAccessToken = function(){
  return jwt.sign(
      {
          _id: this._id,
          email: this.email,
          username: this.username
          
      },
      process.env.ACCESS_TOKEN_SECRET,
      {
          expiresIn: process.env.ACCESS_TOKEN_EXPIRY
      }
  )
}
userSchema.methods.generateRefreshToken = function(){
  return jwt.sign(
      {
          _id: this._id,
          
      },
      process.env.REFRESH_TOKEN_SECRET,
      {
          expiresIn: process.env.REFRESH_TOKEN_EXPIRY
      }
  )
}
export const User = mongoose.model("User", userSchema);