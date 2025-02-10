import express from 'express';
import {
  registerUser,
  loginUser,
  logoutUser,
  getUser,
  updateUser,
  deleteUser,
  changeCurrentPassword,
  submitReview,
  removeReview
} from '../controllers/user.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.route("/register").post(registerUser);
router.route("/review").post(verifyJWT,submitReview);
router.route("/login").post(loginUser);
router.route("/logout").post(verifyJWT,logoutUser)
router.route("/:id").get(getUser);
router.route("/user").put(updateUser);
router.route("/user").delete(deleteUser);
router.route("/change-password").post(changeCurrentPassword);

export default router;
