import mongoose, {model, Schema} from "mongoose";

const actorSchema = new Schema(
    {
      name: {
        type: String,
        required: true,
      },
      profile_pic_url: {
        type: String, // URL for actor profile image
      },
    },
    { timestamps: true }
  );
  
  module.exports = mongoose.model("Actor", actorSchema);