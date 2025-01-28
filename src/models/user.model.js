import mongoose, {model, Schema} from "mongoose";

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
    google_id: {
      type: String,
      unique: true,
      sparse: true, // To allow either google_id or email/password, but not both
    },
    profile_url: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"], // Assuming roles can be 'user' or 'admin'
      default: "user",
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

// Before saving a user, we hash the password if it's provided (for email authentication)
userSchema.pre("save", async function (next) {
  if (this.password && this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10); // 10 is the salt rounds for bcrypt
  }
  next();
});

// Method to check if the entered password is correct (for login)
userSchema.methods.isValidPassword = async function (password) {
  if (!this.password) {
    return false; // If there's no password (Google login), return false
  }
  return bcrypt.compare(password, this.password);
};

export const User = mongoose.model("User", userSchema);