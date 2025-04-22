import User from "../models/user.model.js";
import bcryptjs from "bcryptjs";

import generateTokenAndSetCookie from "../utils/generateTokenAndSetCookie.js";
import { sendVerificationEmail } from "../mailtrap/emails.js";
import { sendWelcomeEmail } from "../mailtrap/emails.js";

export const signup = async (req, res) => {
  const { email, password, name } = req.body;
  try {
    // Validate input data
    if (!email || !password || !name) {
      // return res.status(400).json({ message: "All fields are required" }); or ...
      throw new Error("All fields are required");
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      // return res.status(400).json({success:false, message: "User already exists" }); or ...
      throw new Error("User already exists");
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(password, 10);
    const verificationToken = Math.floor(
      100000 + Math.random() * 900000
    ).toString(); // Generate a verification token

    const user = new User({
      email,
      password: hashedPassword,
      name,
      verificationToken,
      verificationExpires: Date.now() + 24 * 60 * 60 * 1000, //
    });

    await user.save();

    // Generate a JWT token and set it in a cookie
    const token = generateTokenAndSetCookie(res, user._id);

    // Send verification email
    await sendVerificationEmail(user.email, verificationToken);

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: {
        ...user._doc,
        password: undefined, // Exclude password from the response
      },
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ success: false, message: error.message });
  }
};

export const verifyEmail = async (req, res) => {
  const { code } = req.body;
  try {
    const user = await User.findOne({
      verificationToken: code,
      verificationExpires: { $gt: Date.now() },
    });

    console.log(user);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification code",
      });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    await sendWelcomeEmail(user.email, user.name);
    res.status(200).json({
      success: true,
      message: "Email verified successfully",
      user: {
        ...user._doc,
        password: undefined,
      },
    });
  } catch (error) {
    console.log("error in verifyEmail", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const login = async (req, res) => {
  res.send("Login");
};

export const logout = async (req, res) => {
  res.send("Logout");
};
