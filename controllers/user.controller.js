import User from "../models/User.js";
import { sendEmail } from "../utils/sendEmail.js";
import { hashPassword, comparePassword } from "../utils/hash.js";

// Create user - Admin can create sub-admin and agent, Sub-admin can create only agent
export const createUser = async (req, res) => {
  try {
    const { name, email, password, role, agentType } = req.body;

    console.log(req.body);
    console.log("Creating user with role:", role, "and agentType:", agentType);

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
    let filter = {
      _id: { $ne: req.user.id }, // exclude logged-in user
    };

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

// Get Agents - Admin sees all agents, Sub-admin sees only created agents
export const getAgents = async (req, res) => {
  try {
    let filter = {
      role: "agent",
    };

    if (req.user.role === "sub-admin") {
      filter.createdBy = req.user.id;
    }

    const agents = await User.find(filter).select("-password");

    res.status(200).json({
      success: true,
      message: "Fetch agents successfully",
      data: agents,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get Single User
export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

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

// Update User
export const updateUser = async (req, res) => {
  try {
    const { name, phone, role, agentType, isActive } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Sub-admin restrictions
    if (req.user.role === "sub-admin" && user.role !== "agent") {
      return res.status(403).json({
        success: false,
        message: "Sub-admin can manage only agents",
      });
    }

    user.name = name || user.name;
    user.phone = phone || user.phone;
    user.agentType = agentType || user.agentType;

    // Only admin can update role
    if (req.user.role === "admin") {
      user.role = role || user.role;
      user.isActive = isActive !== undefined ? isActive : user.isActive;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Toggle User Status
export const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${user.isActive ? "enabled" : "disabled"} successfully`,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete User
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
