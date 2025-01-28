import mongoose, {model, Schema} from "mongoose";


const watchLaterSchema = new Schema(
    {
      user_id: {
        type: Schema.Types.ObjectId,
        ref: "User", // Relationship: User → Watch_Later (Many-to-Many)
      },
      movie_id: {
        type: Schema.Types.ObjectId,
        ref: "Movie", // Relationship: Movie → Watch_Later (Many-to-Many)
      },
    },
    { timestamps: true }
  );
  
  module.exports = mongoose.model("WatchLater", watchLaterSchema);