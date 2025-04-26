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
  getTopMovies,
  getMoiveDetails,
  getMovieReviews,
  search,
  getWatchlist,
  addToWatchList,
  removeFromWatchlist
} 
from '../controllers/user.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { get } from 'mongoose';

const router = express.Router();

router.route("/register").post(registerUser);
router.route("/updateUser").post(verifyJWT,updateUser)
router.route("/review").post(verifyJWT,submitReview);
router.route("/login").post(loginUser);
router.route("/logout").post(verifyJWT,logoutUser)
router.route("/getRecommendations").get(verifyJWT,recommendMovies)
router.route("/checkAuth").post(verifyJWT,checkAuth)
router.route("/review/:id").delete(verifyJWT,removeReview)
router.route("/searchMovie").get(verifyJWT,search)
router.route("/getTopMovies").get(verifyJWT,getTopMovies)
router.route("/getMovieDetails/:id").get(verifyJWT,getMoiveDetails)
router.route("/").get(verifyJWT,getUser);
router.route("/user").put(updateUser);
router.route("/user").delete(deleteUser);
router.route("/change-password").post(changeCurrentPassword);
router.route("/getMovieReviews/:id").get(verifyJWT,getMovieReviews)
router.route("/getWatchList").get(verifyJWT,getWatchlist)
router.route("/addToWatchList").post(verifyJWT,addToWatchList)
router.route("/removeFromWatchList").post(verifyJWT,removeFromWatchlist)

export default router;
