import {User} from "../models/user.model.js";
import { Movie } from "../models/movie.model.js";
import { Review } from "../models/review.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js"
import axios from "axios";
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
const checkAuth = asyncHandler(async(req,res)=>{
  res.status(200).json(new ApiResponse(200,"User Authenticated !"));
})
const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
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
    const { username, email } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { username, email},
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

const recommendMovies = asyncHandler(async(req,res)=>{
  
  const user_id = req.user._id
  const response  = await axios.get(`http://127.0.0.1:8000/recommend-movies/${user_id}`);
  if(!response){
    throw new ApiError(500,"Failes to fetch reommendations");
  }
  console.log(response.data)
  res.status(200).json(response.data)
})


const submitReview = asyncHandler(async (req, res) => {
  const { movie_id, text } = req.body;
  const user_id = req.user._id;

  if (!movie_id || !text) {
      throw new ApiError(400, "All fields are required");
  }

  const movieExists = await Movie.findById(movie_id);
  if (!movieExists) {
      throw new ApiError(404, "Movie not found");
  }


  const response  = await axios.post("http://127.0.0.1:8000/predict-rating",{text:text});
  console.log(response.data.rating);
  const review = await Review.create({
      user_id,
      movie_id,
      rate:response.data.rating,
      text,
  });
    const reviews = await Review.find({ movie_id });
    const totalVotes = reviews.length;
    const totalRating = reviews.reduce((sum, review) => sum + review.rate, 0);
    const averageRating = totalVotes > 0 ? totalRating / totalVotes : 0;

    // Update movie model
    await Movie.findByIdAndUpdate(movie_id, {
      average_rating: averageRating,
      votes: totalVotes,
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

const getTopMovies = asyncHandler(async (req,res)=>{
  const topMovies = await Movie.aggregate([
    {
      $facet: {
        latest: [
          { $sort: { release_date: -1 } },
          { $limit: 10 }
        ],
        topRated: [
          { $sort: { average_rating: -1 } },
          { $limit: 10 }
        ]
      }
    },
    {
      $project: {
        combined: { $setUnion: ["$latest", "$topRated"] }
      }
    },
    {
      $unwind: "$combined"
    },
    {
      $lookup: {
        from: "reviews",
        localField: "combined._id",
        foreignField: "movie_id",
        as: "reviews"
      }
    },
    {
      $addFields: {
        "combined.positiveReviews": {
          $size: {
            $filter: {
              input: "$reviews",
              as: "review",
              cond: { $gte: ["$$review.rate", 4] }
            }
          }
        },
        "combined.negativeReviews": {
          $size: {
            $filter: {
              input: "$reviews",
              as: "review",
              cond: { $lte: ["$$review.rate", 2] }
            }
          }
        }
      }
    },
    {
      $group: {
        _id: null,
        combined: { $push: "$combined" }
      }
    }
  ])

  
  const movies = topMovies[0]?.combined || []
  
  
  const shuffledMovies = movies.sort(() => Math.random() - 0.5)

  res.status(200).json(new ApiResponse(200,shuffledMovies,"movies fetched successfully"))
})

const getMoiveDetails = asyncHandler(async (req,res)=>{
  const {id} = req.params;
  const movie = await Movie.findById(id);
  if(!movie){
    return new ApiError(400,"movie not found")
  }
  res.status(200).json(movie)
})

const getMovieReviews = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user ? req.user._id.toString() : null; // Get logged-in user ID

  const reviews = await Review.find({ movie_id: id })
    .populate("user_id", "username")
    .lean();

  const formattedReviews = reviews.map((review) => ({
    id: review._id,
    author: review.user_id?.username || "Anonymous",
    score: review.rate,
    date: new Date(review.createdAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).toUpperCase(),
    content: review.text,
    type: review.rate >= 4 ? "positive" : review.rate >= 2 ? "mixed" : "negative",
    canEdit: userId === review.user_id?._id.toString(), // Check if logged-in user is the author
  }));

  res.status(200).json(formattedReviews);
});



const search = asyncHandler(async(req,res)=>{
  console.log("helloasd")
  const { query } = req.query;
  console.log(query)
  if (!query) {
    return res.status(400).json({ message: "Search query is required" });
  }

  try {
    const movies = await Movie.find({
      $or: [
        { name: { $regex: query, $options: "i" } },
        { genre: { $regex: query, $options: "i" } },
        { cast: { $regex: query, $options: "i" } },
        { directors: { $regex: query, $options: "i" } },
        { description: { $regex: query, $options: "i" } }
      ]
    }).limit(30);

    res.status(200).json(movies);
  } catch (error) {
    res.status(500).json({ message: "Something went wrong", error: error.message });
  }
})
const addToWatchList = asyncHandler(async(req,res)=>{
  const user_id = req.user._id;
  const {movie_id} = req.body;
  if(!movie_id){
    throw new ApiError(400,"movie Id required");
  }
  await User.findByIdAndUpdate(user_id,{$addToSet:{watchList:movie_id}});
  res.status(200).json(new ApiResponse(200,"Added successfully!"));
})
const removeFromWatchlist = asyncHandler(async(req,res)=>{
  const user_id = req.user._id;
  const {movie_id} = req.body;
  if(!movie_id){
    throw new ApiError(400,"movie Id required");
  }
  await User.findByIdAndUpdate(user_id,{$pull:{watchList:movie_id}});
  res.status(200).json(new ApiResponse(200,"Removed successfully!"));
})

const getWatchlist = asyncHandler(async(req,res)=>{
  const user_id = req.user._id;
  const user = await User.findById(user_id).populate("watchList");
  console.log("Watchlist Movies:", user.watchList);
  res.status(200).json(user.watchList);
})

export {
  registerUser,
  getUser,
  updateUser,
  deleteUser,
  changeCurrentPassword,
  loginUser,
  logoutUser,
  submitReview,
  removeReview,
  recommendMovies,
  checkAuth,
  getTopMovies,
  getMovieReviews,
  getMoiveDetails,
  search,
  getWatchlist,
  addToWatchList,
  removeFromWatchlist
};
