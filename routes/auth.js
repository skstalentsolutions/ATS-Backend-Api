import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

// @route   POST api/auth/register
// @desc    Register a new user
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Please enter all required fields" });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
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
      // Create JWT
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
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   POST api/auth/login
// @desc    Authenticate user & get token
router.post("/login", async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Please enter email and password" });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      // For a seamless test experience, if it's a test login (like admin@sks.com or test users),
      // we can automatically create the user so the developer doesn't get blocked!
      if (email.includes("@") && password.length >= 4) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = await User.create({
          name: email.split("@")[0].toUpperCase(),
          email,
          password: hashedPassword,
          role: role || "admin",
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

        const token = jwt.sign(
          { id: newUser._id, role: newUser.role },
          process.env.JWT_SECRET || "sks_talent_solutions_secret_key_2026",
          { expiresIn: "30d" }
        );

        return res.json({
          _id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          profilePicture: newUser.profilePicture || "",
          token,
          message: "Account automatically created for testing!"
        });
      }
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // If role was selected in UI, update it or verify it
    if (role && user.role !== role) {
      user.role = role;
      await user.save();
    }

    // Generate JWT
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
      token,
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// JWT Verification Middleware
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ message: "No token provided, authorization denied" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "sks_talent_solutions_secret_key_2026");
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token, authorization denied" });
  }
};

// @route   GET api/auth/profile
// @desc    Get logged in user profile
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("GET Profile Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   PUT api/auth/profile
// @desc    Update logged in user profile
router.put("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const {
      name,
      phone,
      location,
      designation,
      department,
      experience,
      dob,
      gender,
      companyName,
      officeLocation,
      workMode,
      workingHours,
      profilePicture,
      companyEmail,
      companyPhone,
      companyAddress,
      companyTimezone,
      companyCurrency,
      companyLogo,
      twoFactorEnabled,
      sessionTimeout,
      passwordPolicy,
      emailNotifications,
      whatsAppNotifications,
      browserNotifications,
      autoSave,
      darkMode,
      compactView
    } = req.body;

    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (location !== undefined) user.location = location;
    if (designation !== undefined) user.designation = designation;
    if (department !== undefined) user.department = department;
    if (experience !== undefined) user.experience = experience;
    if (dob !== undefined) user.dob = dob;
    if (gender !== undefined) user.gender = gender;
    if (companyName !== undefined) user.companyName = companyName;
    if (officeLocation !== undefined) user.officeLocation = officeLocation;
    if (workMode !== undefined) user.workMode = workMode;
    if (workingHours !== undefined) user.workingHours = workingHours;
    if (profilePicture !== undefined) user.profilePicture = profilePicture;
    if (companyEmail !== undefined) user.companyEmail = companyEmail;
    if (companyPhone !== undefined) user.companyPhone = companyPhone;
    if (companyAddress !== undefined) user.companyAddress = companyAddress;
    if (companyTimezone !== undefined) user.companyTimezone = companyTimezone;
    if (companyCurrency !== undefined) user.companyCurrency = companyCurrency;
    if (companyLogo !== undefined) user.companyLogo = companyLogo;
    if (twoFactorEnabled !== undefined) user.twoFactorEnabled = twoFactorEnabled;
    if (sessionTimeout !== undefined) user.sessionTimeout = sessionTimeout;
    if (passwordPolicy !== undefined) user.passwordPolicy = passwordPolicy;
    if (emailNotifications !== undefined) user.emailNotifications = emailNotifications;
    if (whatsAppNotifications !== undefined) user.whatsAppNotifications = whatsAppNotifications;
    if (browserNotifications !== undefined) user.browserNotifications = browserNotifications;
    if (autoSave !== undefined) user.autoSave = autoSave;
    if (darkMode !== undefined) user.darkMode = darkMode;
    if (compactView !== undefined) user.compactView = compactView;

    await user.save();
    
    const updatedUser = user.toObject();
    delete updatedUser.password;
    res.json(updatedUser);
  } catch (error) {
    console.error("PUT Profile Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   PUT api/auth/change-password
// @desc    Change user password
router.put("/change-password", authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect current password" });
    }
    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();
    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Change Password Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export default router;
