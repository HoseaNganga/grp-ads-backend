import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  name?: string;
  email: string;
  password?: string;
  provider: "google" | "credentials";
}

const userSchema = new Schema<IUser>(
  {
    name: String,
    email: { type: String, required: true, unique: true },
    password: String,
    provider: { type: String, enum: ["google", "credentials"], required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", userSchema);
