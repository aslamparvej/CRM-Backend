import User from "../models/User.js";
import { sendEmail } from "../utils/sendEmail.js";
import { hashPassword, comparePassword } from "../utils/hash.js";

export const createUser = async (req, res) => {
  try {
    const { name, email, password, role, agentType } = req.body;

    console.log(req.body);

    // Check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(500).json({
        success: false,
        message: "User already exists",
      });
    }

    // Hased passsord
    const hashedPassword = await hashPassword(password);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      agentType,
      createdBy: req.user.id,
    });

    // Send email
    await sendEmail({
      to: email,
      subject: "Your CRM Account Created",
      html: `
        <h2>Welcome to CRM App</h2>
        <p>Your account has been created successfully.</p>

        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Password:</strong> ${password}</p>
        <p><strong>Role:</strong> ${role}</p>

        <br/>

        <p>Please login and change your password after first login.</p>
      `,
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

// Get all users
export const getUsers = async (req, res) => {
  try {
    let filter = {};

    // Sub-admin sees only created agents
    if (req.user.role === "sub-admin") {
      filter = {
        createdBy: req.user.id,
      };
    }

    const users = await User.find(filter)
      .select("-password")
      .populate("createdBy", "name email");

    res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      count: users.length,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
