// server/controllers/candidateController.js
import Candidate from "../models/Candidate.js";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import { parseResumeFromBuffer } from "../utils/resumeParser.js";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "ats-resumes",
        resource_type: "auto",
        public_id: `${Date.now()}-${req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_")}`,
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload stream error:", error);
          return res.status(500).json({ message: "Cloudinary upload failed", error: error.message || error });
        }
        res.json({
          url: result.secure_url,
          name: req.file.originalname,
        });
      }
    );

    uploadStream.end(req.file.buffer);
  } catch (error) {
    console.error("POST Upload Resume Route Error:", error);
    res.status(500).json({ message: "Server error during file upload", error: error.message });
  }
};

export const parseResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const parsedDetails = await parseResumeFromBuffer(req.file.buffer, req.file.originalname);

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "ats-resumes",
        resource_type: "auto",
        public_id: `${Date.now()}-${req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_")}`,
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload stream error:", error);
          return res.json({
            ...parsedDetails,
            resumeName: req.file.originalname,
            resumeUrl: "",
          });
        }
        res.json({
          ...parsedDetails,
          resumeName: req.file.originalname,
          resumeUrl: result.secure_url,
        });
      }
    );

    uploadStream.end(req.file.buffer);
  } catch (error) {
    console.error("POST Parse Resume Route Error:", error);
    res.status(500).json({ message: "Server error during resume parsing", error: error.message });
  }
};

export const getCandidateStats = async (req, res) => {
  try {
    const total = await Candidate.countDocuments();
    const stageCounts = await Candidate.aggregate([
      { $group: { _id: "$stage", count: { $sum: 1 } } },
    ]);

    const stageMap = {};
    stageCounts.forEach((s) => {
      if (s._id) stageMap[s._id] = s.count;
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
};

export const getCandidates = async (req, res) => {
  try {
    const { search, stage, source, recruiter } = req.query;
    const filter = {};

    if (search) {
      const regex = new RegExp(search, "i");
      filter.$or = [
        { name: regex },
        { role: regex },
        { position: regex },
        { company: regex },
        { client: regex },
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
};

export const getCandidateById = async (req, res) => {
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
};

export const createCandidate = async (req, res) => {
  try {
    const { name, email, role, position } = req.body;

    if (!name || (!email && !role && !position)) {
      return res.status(400).json({ message: "Please provide candidate details (name, email/role)" });
    }

    if (email) {
      const existing = await Candidate.findOne({ email: email.toLowerCase() });
      if (existing) {
        return res.status(400).json({ message: "A candidate with this email already exists" });
      }
    }

    const candidate = new Candidate(req.body);
    const saved = await candidate.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error("POST Candidate Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const bulkImportCandidates = async (req, res) => {
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
};

export const updateCandidate = async (req, res) => {
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
};

export const updateCandidateStage = async (req, res) => {
  try {
    const { stage } = req.body;
    const validStages = ["applied", "screening", "shortlisted", "interview", "offer", "hired", "Screening", "Interview", "Selected", "Offer", "Joined", "Rejected"];

    if (!stage || !validStages.includes(stage)) {
      return res.status(400).json({
        message: `Invalid stage. Must be one of: ${validStages.join(", ")}`,
      });
    }

    const candidate = await Candidate.findById(req.params.id);
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    candidate.stage = stage.toLowerCase();
    candidate.status = stage;
    const updated = await candidate.save();
    res.json(updated);
  } catch (error) {
    console.error("PATCH Stage Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deleteCandidate = async (req, res) => {
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
};
