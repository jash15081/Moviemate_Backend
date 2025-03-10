import mongoose from "mongoose";

const movieSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    pic_url: { type: String },
    description: { type: String },
    trailer_url: { type: String },
    release_date: { type: String, required: true }, 
    average_rating: { type: Number, default: 0 },
    genre: { type: [String], default: [] },
    cast: { type: [String], default: [] },
    directors: { type: [String], default: [] },
    runtime: { type: String },
    meta_score: { type: Number },
    certificate: { type: String },
    votes: { type: Number },
    gross: { type: String },
  },
  { timestamps: true }
);
export const Movie  = mongoose.model("Movie", movieSchema);