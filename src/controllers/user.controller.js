import {User} from "../models/user.model.js";
import { Movie } from "../models/movie.model.js";
import { Review } from "../models/review.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js"
const generateAccessAndRefereshTokens = async(userId) =>{
  try {
      const user = await User.findById(userId)
      const accessToken = user.generateAccessToken()
      const refreshToken = user.generateRefreshToken()

      
     

      return {accessToken, refreshToken}


  } catch (error) {
    console.log(error);
      throw new ApiError(500, "Something went wrong while generating referesh and access token")
  }
}

const registerUser = asyncHandler( async (req, res) => {
   
  const { email, username, password } = req.body
  if (
      [email, username, password].some((field) => field?.trim() === "")
  ) {
      throw new ApiError(400, "All fields are required")
  }
  const existedUser = await User.findOne({email});
  if (existedUser) {
      throw new ApiError(409, "User with same email already exists")
  }
  const existedUser1 = await User.findOne({username});
  if (existedUser1) {
      throw new ApiError(409, "User with same username already exists")
  }
  
  const user = await User.create({
      email, 
      password,
      username,
  })
  const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"
  )
  if (!createdUser) {
      throw new ApiError(500, "Something went wrong while registering the user")
  }
  return res.status(201).json(
      new ApiResponse(200, createdUser, "User registered Successfully")
  )
} )
const loginUser = asyncHandler(async (req, res) =>{
  const {email, username, password} = req.body
  console.log(email);

  if (!username && !email) {
      throw new ApiError(400, "username or email is required")
  }
  

  const user = await User.findOne({
      $or: [{username}, {email}]
  })

  if (!user) {
      throw new ApiError(404, "User does not exist")
  }

 const isPasswordValid = await user.isPasswordCorrect(password)

 if (!isPasswordValid) {
  throw new ApiError(401, "Invalid Password")
  }

 const {accessToken, refreshToken} = await generateAccessAndRefereshTokens(user._id)

  const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

  const options = {
      httpOnly: true,
      secure: true,
      maxAge: 24 * 60 * 60 * 1000,
  }

  return res
  .status(200)
  .cookie("accessToken", accessToken, options)
  .cookie("refreshToken", refreshToken, options)
  .json(
      new ApiResponse(
          200, 
          {
              user: loggedInUser, accessToken, refreshToken
          },
          "User logged In Successfully"
      )
  )

})
const logoutUser = asyncHandler(async(req, res) => {
  await User.findByIdAndUpdate(
      req.user._id,
      {
          $unset: {
              refreshToken: 1 // this removes the field from document
          }
      },
      {
          new: true
      }
  )

  const options = {
      httpOnly: true,
      secure: true
  }

  return res
  .status(200)
  .clearCookie("accessToken", options)
  .clearCookie("refreshToken", options)
  .json(new ApiResponse(200, {}, "User logged Out"))
})

const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const updateUser = async (req, res) => {
  try {
    const { username, email, role } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { username, email, role},
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const changeCurrentPassword = async (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isPasswordValid = await user.isValidPassword(current_password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    user.password = new_password; // Hash the new password before saving
    await user.save();
    
    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



const submitReview = asyncHandler(async (req, res) => {
  const { movie_id, rate, text } = req.body;
  const user_id = req.user._id; // Assuming user is authenticated via middleware

  if (!movie_id || !rate || !text) {
      throw new ApiError(400, "All fields are required");
  }

  // Check if the movie exists
  const movieExists = await Movie.findById(movie_id);
  if (!movieExists) {
      throw new ApiError(404, "Movie not found");
  }

  // Check if the user has already reviewed the movie
  const existingReview = await Review.findOne({ user_id, movie_id });
  if (existingReview) {
      throw new ApiError(409, "You have already reviewed this movie");
  }

  // Create a new review
  const review = await Review.create({
      user_id,
      movie_id,
      rate,
      text,
  });

  if (!review) {
      throw new ApiError(500, "Failed to submit review");
  }

  return res.status(201).json(
      new ApiResponse(201, review, "Review submitted successfully")
  );
});


const removeReview = asyncHandler(async (req, res) => {
  const review_id = req.params.id;
  const user_id = req.user._id; // Assuming authentication middleware provides user ID

  // Find the review
  const review = await Review.findById(review_id);
  if (!review) {
      throw new ApiError(404, "Review not found");
  }

  // Check if the user is the owner of the review
  if (review.user_id.toString() !== user_id.toString()) {
      throw new ApiError(403, "You can only delete your own reviews");
  }

  await Review.findByIdAndDelete(review_id);

  return res.status(200).json(
      new ApiResponse(200, {}, "Review removed successfully")
  );
});

export {
  registerUser,
  getUser,
  updateUser,
  deleteUser,
  changeCurrentPassword,
  loginUser,
  logoutUser,
  submitReview,
  removeReview
};
