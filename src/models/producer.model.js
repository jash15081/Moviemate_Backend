import mongoose, {model, Schema} from "mongoose";


const producerSchema = new Schema(
    {
      name: {
        type: String,
        required: true,
      },
      profile_url: {
        type: String, // URL for producer profile
      },
    },
    { timestamps: true }
  );
  
module.exports = mongoose.model("Producer", producerSchema);