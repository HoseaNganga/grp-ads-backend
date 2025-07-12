import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.model";
import verificationTokenModel from "../models/verificationToken.model";
import sendEmail from "../utils/sendEmail";

export async function getAllUsers(_req: Request, res: Response) {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users" });
  }
}
export async function registerUser(req: Request, res: Response) {
  const {
    first_name,
    last_name,
    email,
    password,
    phoneNumber,
    interest,
    selection,
    acceptTerms,
  } = req.body;

  try {
    const existing = await User.findOne({ email });
    if (existing)
      return res.status(409).json({ message: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      first_name,
      last_name,
      email,
      password: hashed,
      phoneNumber,
      interest,
      selection,
      acceptTerms,
      provider: "credentials",
      isVerified: false,
    });

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    await verificationTokenModel.create({
      userId: user._id,
      token: code,
      expiresAt: new Date(Date.now() + 1000 * 60 * 10),
    });

    await sendEmail(
      user.email,
      "Verify Your Email",
      `<p>Your verification code is: <strong>${code}</strong></p>`
    );

    res.status(201).json({
      message:
        "User registered. Please check your email to verify your account.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error during registration" });
  }
}

export async function loginUser(_req: Request, res: Response) {
  const { email, password } = _req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !user.password)
      return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, {
      expiresIn: "7d",
    });
    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Login failed" });
  }
}

export async function deleteUserById(req: Request, res: Response) {
  const { id } = req.params;
  try {
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User deleted successfully", user: deletedUser });
  } catch (error) {
    res.status(500).json({ message: "Error deleting user" });
  }
}
export async function verifyUserByCode(req: Request, res: Response) {
  const { email, code } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const tokenDoc = await verificationTokenModel.findOne({
      userId: user._id,
      token: code,
      expiresAt: { $gt: new Date() },
    });

    if (!tokenDoc)
      return res.status(400).json({ message: "Invalid or expired code" });

    user.isVerified = true;
    await user.save();
    await tokenDoc.deleteOne();

    res.json({ message: "Email verified successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Verification failed" });
  }
}
