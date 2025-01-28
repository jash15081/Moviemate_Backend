import express from 'express';
import {
  registerOrLoginUser,
  getUser,
  updateUser,
  deleteUser,
  changeCurrentPassword,
} from '../controllers/user.controller.js';

const router = express.Router();

// Register or Login a User (via email or Google)
try
{router.route("/register-or-login").post(registerOrLoginUser);}
catch(error)
{
  console.log(`Router Errror ${error}`);
}

// Get User details
router.route("/:id").get(getUser);

// Update User details
router.route("/user").put(updateUser);

// Delete User
router.route("/user").delete(deleteUser);

// Change User password
router.route("/change-password").post(changeCurrentPassword);

export default router;
