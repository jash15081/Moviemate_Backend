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
  removeReview,
  recommendMovies,
  checkAuth,
  getTopMovies
} from '../controllers/user.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.route("/register").post(registerUser);
router.route("/review").post(verifyJWT,submitReview);
router.route("/login").post(loginUser);
router.route("/logout").post(verifyJWT,logoutUser)
router.route("/getRecommendations").get(verifyJWT,recommendMovies)
router.route("/checkAuth").post(verifyJWT,checkAuth)
router.route("/getTopMovies").get(verifyJWT,getTopMovies)
router.route("/:id").get(getUser);
router.route("/user").put(updateUser);
router.route("/user").delete(deleteUser);
router.route("/change-password").post(changeCurrentPassword);
export default router;
