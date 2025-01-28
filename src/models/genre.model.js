import mongoose, {model, Schema} from "mongoose";


const genreSchema = new Schema(
    {
      genre_name: {
        type: String,
        required: true,
      },
      movie_id: {
        type: Schema.Types.ObjectId,
        ref: "Movie", // Relationship: Movie → Genre (Many-to-Many)
      },
    },
    { timestamps: true }
  );
  
  module.exports = mongoose.model("Genre", genreSchema);