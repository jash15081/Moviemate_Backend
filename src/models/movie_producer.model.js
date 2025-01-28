import mongoose, {model, Schema} from "mongoose";

const movieProducerSchema = new Schema(
    {
      movie_id: {
        type: Schema.Types.ObjectId,
        ref: "Movie", // Relationship: Movie → Movie_Producer (One-to-Many)
      },
      producer_id: {
        type: Schema.Types.ObjectId,
        ref: "Producer", // Relationship: Movie_Producer → Producer (Many-to-One)
      },
    },
    { timestamps: true }
  );
  
  module.exports = mongoose.model("MovieProducer", movieProducerSchema);