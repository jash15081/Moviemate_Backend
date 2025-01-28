import mongoose, {model, Schema} from "mongoose";

const movieActorSchema = new Schema(
    {
      movie_id: {
        type: Schema.Types.ObjectId,
        ref: "Movie", // Relationship: Movie → Movie_Actor (One-to-Many)
      },
      actor_id: {
        type: Schema.Types.ObjectId,
        ref: "Actor", // Relationship: Movie_Actor → Actor (Many-to-One)
      },
    },
    { timestamps: true }
  );
  
  module.exports = mongoose.model("MovieActor", movieActorSchema);