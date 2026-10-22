// server/controllers/authController.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

// @desc Register user
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please enter all required fields" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "recruiter",
      phone: "+91 92326 86188",
      location: "Gwalior, Madhya Pradesh, India",
      designation: role === "admin" ? "HR & Operations Executive" : "Recruitment Officer",
      department: "Human Resources",
      experience: "3.5 Years",
      dob: "1995-05-12",
      gender: "Male",
      companyName: "SKS Talent Solutions",
      officeLocation: "Gwalior, Madhya Pradesh",
      workMode: "Remote / Office",
      workingHours: "Flexible"
    });

    if (user) {
      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET || "sks_talent_solutions_secret_key_2026",
        { expiresIn: "30d" }
      );

      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture || "",
        token,
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ message: "Server error during registration", error: error.message });
  }
};

// @desc Login user
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please enter email and password" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "sks_talent_solutions_secret_key_2026",
      { expiresIn: "30d" }
    );

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profilePicture: user.profilePicture || "",
      phone: user.phone || "",
      designation: user.designation || "",
      token,
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error during login", error: error.message });
  }
};

// Helper to ensure at least one default Super Admin user exists
export const ensureDefaultAdmin = async () => {
  try {
    const count = await User.countDocuments();
    if (count === 0) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash("admin123", salt);
      await User.create({
        name: "Sanjay Kushwaha",
        email: "admin@sks.com",
        password: hashedPassword,
        role: "admin",
        phone: "+91 92326 86188",
        location: "Gwalior, Madhya Pradesh, India",
        designation: "Super Admin & Talent Director",
        department: "Talent Acquisition & Executive Management",
        experience: "8.5 Years",
        dob: "1992-04-18",
        gender: "Male",
        companyName: "SKS Talent Solutions",
        officeLocation: "Gwalior, Madhya Pradesh",
        workMode: "Hybrid",
        workingHours: "Full-Time",
        profilePicture: "",
      });
      console.log("Default admin user created: admin@sks.com");
    }
  } catch (err) {
    console.warn("User auto-seed check:", err.message);
  }
};

// Helper to extract user ID from req.user, Authorization header, or body
const extractUserId = (req) => {
  if (req.user && (req.user.id || req.user._id)) return req.user.id || req.user._id;
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "sks_talent_solutions_secret_key_2026");
      return decoded.id || decoded._id;
    }
  } catch (e) {}
  return req.body?._id || req.body?.id || null;
};

// @desc Get current user profile
export const getUserProfile = async (req, res) => {
  try {
    await ensureDefaultAdmin();
    const userId = extractUserId(req);
    let user = null;
    if (userId) {
      user = await User.findById(userId).select("-password");
    }
    if (!user) {
      // Fallback to first existing user in DB
      user = await User.findOne().select("-password");
    }
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user profile", error: error.message });
  }
};

// @desc Update profile
export const updateUserProfile = async (req, res) => {
  try {
    const userId = extractUserId(req);
    let user = null;
    if (userId) {
      user = await User.findById(userId);
    }
    if (!user) {
      user = await User.findOne();
    }
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    Object.assign(user, req.body);
    const updatedUser = await user.save();

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Error updating profile", error: error.message });
  }
};
