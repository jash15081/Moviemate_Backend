import mongoose, {model, Schema} from "mongoose";


const movieSchema = new Schema(
    {
      name: {
        type: String,
        required: true,
      },
      pic_url: {
        type: String, // URL for movie poster
      },
      description: {
        type: String, // Movie description
      },
      trailer_url: {
        type: String, // URL for movie trailer
      },
      release_date: {
        type: Date,
        required: true,
      },
      average_rating: {
        type: Number, // Calculated based on user reviews
        default: 0,
      },
    },
    { timestamps: true }
  );
  
  module.exports = mongoose.model("Movie", movieSchema);