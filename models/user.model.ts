import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  first_name: string;
  last_name: string;
  name?: string;
  email: string;
  password: string;
  phoneNumber: string;
  interest: string;
  selection: string;
  acceptTerms: boolean;
  provider: "google" | "credentials";
  isVerified: boolean;
}

const userSchema = new Schema<IUser>(
  {
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    interest: { type: String, required: true },
    selection: { type: String, required: true },
    acceptTerms: { type: Boolean, required: true },
    provider: { type: String, enum: ["google", "credentials"], required: true },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", userSchema);
