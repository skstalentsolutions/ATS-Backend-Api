import express from "express";
import Candidate from "../models/Candidate.js";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import { parseResumeFromBuffer } from "../utils/resumeParser.js";

// Load environment variables
dotenv.config();

const router = express.Router();

// Multer memory storage configuration
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// @route   POST /api/candidates/upload-resume
// @desc    Upload candidate resume to Cloudinary
router.post("/upload-resume", upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Upload file buffer to Cloudinary using stream
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "ats-resumes",
        resource_type: "auto", // Automatically detects PDF as document/image and DOCX as raw file
        public_id: `${Date.now()}-${req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_")}`
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload stream error:", error);
          return res.status(500).json({ message: "Cloudinary upload failed", error: error.message || error });
        }
        res.json({
          url: result.secure_url,
          name: req.file.originalname
        });
      }
    );

    uploadStream.end(req.file.buffer);
  } catch (error) {
    console.error("POST Upload Resume Route Error:", error);
    res.status(500).json({ message: "Server error during file upload", error: error.message });
  }
});

// @route   POST /api/candidates/parse-resume
// @desc    Upload candidate resume to Cloudinary and parse its text contents
router.post("/parse-resume", upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // 1. Parse details from buffer
    const parsedDetails = await parseResumeFromBuffer(req.file.buffer, req.file.originalname);

    // 2. Upload file buffer to Cloudinary using stream to get url
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "ats-resumes",
        resource_type: "auto",
        public_id: `${Date.now()}-${req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_")}`
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload stream error:", error);
          // If cloudinary fails, we still return parsed details but with empty URL
          return res.json({
            ...parsedDetails,
            resumeName: req.file.originalname,
            resumeUrl: ""
          });
        }
        
        // Return parsed details + cloudinary info
        res.json({
          ...parsedDetails,
          resumeName: req.file.originalname,
          resumeUrl: result.secure_url
        });
      }
    );

    uploadStream.end(req.file.buffer);
  } catch (error) {
    console.error("POST Parse Resume Route Error:", error);
    res.status(500).json({ message: "Server error during resume parsing", error: error.message });
  }
});


// @route   GET /api/candidates/stats
// @desc    Get aggregate candidate stats for dashboard metrics
router.get("/stats", async (req, res) => {
  try {
    const total = await Candidate.countDocuments();
    const stageCounts = await Candidate.aggregate([
      { $group: { _id: "$stage", count: { $sum: 1 } } },
    ]);

    const stageMap = {};
    stageCounts.forEach((s) => {
      stageMap[s._id] = s.count;
    });

    const hired = stageMap["hired"] || 0;
    const applied = stageMap["applied"] || 0;
    const activePipeline = total - hired;
    const inProgress =
      (stageMap["screening"] || 0) +
      (stageMap["shortlisted"] || 0) +
      (stageMap["interview"] || 0) +
      (stageMap["offer"] || 0);

    res.json({
      total,
      activePipeline,
      inProgress,
      hired,
      applied,
      stageCounts: stageMap,
    });
  } catch (error) {
    console.error("GET Candidate Stats Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/candidates
// @desc    Get all candidates with optional search/filter query params
router.get("/", async (req, res) => {
  try {
    const { search, stage, source, recruiter } = req.query;
    const filter = {};

    if (search) {
      const regex = new RegExp(search, "i");
      filter.$or = [
        { name: regex },
        { role: regex },
        { company: regex },
        { skills: regex },
        { email: regex },
      ];
    }

    if (stage && stage !== "all") {
      filter.stage = stage;
    }

    if (source && source !== "all") {
      filter.source = source;
    }

    if (recruiter && recruiter !== "all" && recruiter !== "All Recruiters") {
      filter.recruiter = recruiter;
    }

    const candidates = await Candidate.find(filter).sort({ createdAt: -1 });
    res.json(candidates);
  } catch (error) {
    console.error("GET Candidates Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   GET /api/candidates/:id
// @desc    Get single candidate by ID
router.get("/:id", async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }
    res.json(candidate);
  } catch (error) {
    console.error("GET Candidate Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   POST /api/candidates
// @desc    Create a new candidate
router.post("/", async (req, res) => {
  try {
    const { name, email, role } = req.body;

    if (!name || !email || !role) {
      return res.status(400).json({ message: "Please provide name, email, and role" });
    }

    // Check for duplicate email
    const existing = await Candidate.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: "A candidate with this email already exists" });
    }

    const candidate = new Candidate(req.body);
    const saved = await candidate.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error("POST Candidate Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   POST /api/candidates/bulk
// @desc    Bulk import candidates
router.post("/bulk", async (req, res) => {
  try {
    const list = req.body;
    if (!Array.isArray(list)) {
      return res.status(400).json({ message: "Request body must be an array of candidates" });
    }
    const saved = await Candidate.insertMany(list);
    res.status(201).json(saved);
  } catch (error) {
    console.error("POST Bulk Candidates Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   PUT /api/candidates/:id
// @desc    Update candidate fields (edit profile, add notes)
router.put("/:id", async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    const updated = await Candidate.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    res.json(updated);
  } catch (error) {
    console.error("PUT Candidate Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   PATCH /api/candidates/:id/stage
// @desc    Move candidate to a new pipeline stage
router.patch("/:id/stage", async (req, res) => {
  try {
    const { stage } = req.body;
    const validStages = ["applied", "screening", "shortlisted", "interview", "offer", "hired"];

    if (!stage || !validStages.includes(stage)) {
      return res.status(400).json({
        message: `Invalid stage. Must be one of: ${validStages.join(", ")}`,
      });
    }

    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    candidate.stage = stage;
    const updated = await candidate.save();
    res.json(updated);
  } catch (error) {
    console.error("PATCH Stage Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// @route   DELETE /api/candidates/:id
// @desc    Delete a candidate
router.delete("/:id", async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    await Candidate.findByIdAndDelete(req.params.id);
    res.json({ message: "Candidate successfully deleted", id: req.params.id });
  } catch (error) {
    console.error("DELETE Candidate Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

export default router;
