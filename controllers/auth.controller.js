import User from "../models/User.js";
import { hashPassword, comparePassword } from "../utils/hash.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateToken.js";

// Register (Admin/Sub-admin only)
export const register = async (req, res) => {
  try {
    const { name, email, password, role, agentType } = req.body;

    // Check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // Hased passsord
    const hashedPassword = await hashPassword(password);
    console.log("Hashed Password --->");

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      agentType,
      createdBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: "User created successfully",
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.json({
      success: true,
      message: "Login successful",
      data: {
        accessToken,
        refreshToken,
        user,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Refresh token
export const refreshToken = async (req, res) => {
  try {
    const { token } = req.body;
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);
    const accessToken = generateAccessToken(user);

    res.json({
      success: true,
      data: { accessToken },
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Inavlid refresh token",
    });
  }
};
