import mongoose, {model, Schema} from "mongoose";



const reviewSchema = new Schema(
    {
      text: {
        type: String,
        required: true,
      },
      rate: {
        type: Number, // User rating for the movie
        required: true,
        min: 1,
        max: 5,
      },
      user_id: {
        type: Schema.Types.ObjectId,
        ref: "User", // Relationship: User → Review (One-to-Many)
      },
      movie_id: {
        type: Schema.Types.ObjectId,
        ref: "Movie", // Relationship: Movie → Review (One-to-Many)
      },
    },
    { timestamps: true }
  );
  
  export const Review= mongoose.model("Review", reviewSchema);