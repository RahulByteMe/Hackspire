import mongoose, {Schema} from "mongoose";


const userSchema = new Schema({
  aadhaarHash: {
    type: String,
    required: true,
    unique: true
  },
  wallet: {
    type: String,
    required: true,
    unique: true
  },
  verified: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export const User = mongoose.model("User", userSchema)
