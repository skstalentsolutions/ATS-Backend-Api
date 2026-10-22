// server/controllers/candidateDatabaseController.js
// Dedicated controller for the Candidate Database management system

import mongoose from "mongoose";
import CandidateDatabase from "../models/CandidateDatabase.js";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import { parseResumeFromBuffer } from "../utils/resumeParser.js";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Seed data to bootstrap if collection is empty
const INITIAL_DATABASE_CANDIDATES = [
  {
    name: "Rahul Sharma",
    email: "rahul.sharma@gmail.com",
    phone: "+91 98765 43210",
    role: "Full Stack Developer",
    skills: ["React", "Node.js", "MongoDB", "Express", "TypeScript"],
    experience: "2.5 Years",
    location: "Indore (M.P.)",
    status: "Shortlisted",
    stage: "shortlisted",
    client: "TCS (Tata Consultancy Services)",
    company: "Tata Consultancy Services (TCS)",
    education: "B.Tech (Computer Science), DAVV Indore (2021)",
    currentCompany: "Infosys Ltd, Software Engineer (2021 - Present)",
    about: "Proactive Full Stack Developer with 2.5 years experience in building high performance React and Node.js web applications.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    dateAdded: "12 Oct 2024",
  },
  {
    name: "Priya Singh",
    email: "priya.singh@gmail.com",
    phone: "+91 87654 32109",
    role: "Java Backend Developer",
    skills: ["Java", "Spring Boot", "MySQL", "Hibernate"],
    experience: "3 Years",
    location: "Bhopal (M.P.)",
    status: "Interview Scheduled",
    stage: "interview",
    client: "Infosys Technologies",
    company: "Infosys Ltd",
    education: "B.Tech (IT), MANIT Bhopal (2020)",
    currentCompany: "Wipro Technologies, Backend Developer (2020 - Present)",
    about: "Experienced Java Backend Developer building microservices architectures and database management systems.",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    dateAdded: "10 Oct 2024",
  },
  {
    name: "Amit Kumar",
    email: "amit.kumar@gmail.com",
    phone: "+91 76543 21098",
    role: "Python Data Engineer",
    skills: ["Python", "Django", "PostgreSQL", "AWS"],
    experience: "4 Years",
    location: "Indore (M.P.)",
    status: "In Progress",
    stage: "screening",
    client: "Wipro Limited",
    company: "Wipro Technologies",
    education: "MCA, SGSITS Indore (2019)",
    currentCompany: "Cognizant, Data Engineer (2019 - Present)",
    about: "Python developer specializing in data pipelining, cloud integrations with AWS, and backend API engineering.",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    dateAdded: "09 Oct 2024",
  },
  {
    name: "Neha Gupta",
    email: "neha.gupta@gmail.com",
    phone: "+91 91234 56780",
    role: "Frontend Developer (React)",
    skills: ["React", "JavaScript", "HTML/CSS", "Redux", "Tailwind CSS"],
    experience: "1.5 Years",
    location: "Indore (M.P.)",
    status: "Shortlisted",
    stage: "shortlisted",
    client: "TCS (Tata Consultancy Services)",
    company: "Tata Consultancy Services (TCS)",
    education: "B.Tech (CSE), Acropolis Institute Indore (2022)",
    currentCompany: "XYZ Technologies, Junior React Developer (2022 - Present)",
    about: "Passionate Frontend Developer focused on modern UI design, state management, and responsive interfaces.",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    dateAdded: "08 Oct 2024",
  },
  {
    name: "Vikram Malhotra",
    email: "vikram.m@gmail.com",
    phone: "+91 99887 66554",
    role: "Full Stack Engineer",
    skills: ["Angular", "Node.js", "MongoDB", "Express"],
    experience: "2 Years",
    location: "Agra (U.P.)",
    status: "Rejected",
    stage: "rejected",
    client: "HCL Technologies",
    company: "HCL Technologies",
    education: "B.Tech (CSE), Dayalbagh Educational Institute (2021)",
    currentCompany: "Accenture, Software Associate (2021 - 2023)",
    about: "Full stack engineer focused on building enterprise web apps with Angular, Node.js, and MongoDB.",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80",
    dateAdded: "07 Oct 2024",
  },
  {
    name: "Pooja Sharma",
    email: "pooja.sharma@gmail.com",
    phone: "+91 77665 44332",
    role: "HR Executive",
    skills: ["HR", "Communication", "MS Office", "Talent Acquisition"],
    experience: "3.5 Years",
    location: "Lucknow (U.P.)",
    status: "In Progress",
    stage: "screening",
    client: "Tech Mahindra",
    company: "Tech Mahindra",
    education: "MBA (HR), Lucknow University (2020)",
    currentCompany: "Capgemini, Senior HR Associate (2020 - Present)",
    about: "Human resource management specialist focused on recruitment life-cycle, campus drives, and candidate onboarding.",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    dateAdded: "05 Oct 2024",
  },
  {
    name: "Rohit Patel",
    email: "rohit.patel@gmail.com",
    phone: "+91 96543 22110",
    role: "Senior Frontend Engineer",
    skills: ["Angular", "React", "Node.js", "Next.js"],
    experience: "5 Years",
    location: "Delhi (NCR)",
    status: "Hired",
    stage: "hired",
    client: "Accenture Solutions",
    company: "Accenture India",
    education: "B.Tech (CSE), DTU Delhi (2018)",
    currentCompany: "Paytm, Senior UI Engineer (2018 - Present)",
    about: "Senior UI specialist with deep expertise in performance engineering, accessible UI systems, and modern React architectures.",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
    dateAdded: "03 Oct 2024",
  },
  {
    name: "Kavya Mehta",
    email: "kavya.mehta@gmail.com",
    phone: "+91 93456 77889",
    role: "UI/UX Designer",
    skills: ["UI/UX", "Figma", "Adobe XD", "User Research"],
    experience: "2 Years",
    location: "Noida (U.P.)",
    status: "Applied",
    stage: "applied",
    client: "Paytm Payments",
    company: "Paytm Technologies",
    education: "B.Des (Interaction Design), NID (2021)",
    currentCompany: "Zomato, Associate Product Designer (2021 - Present)",
    about: "Creative Product Designer creating human-centered interfaces, accessible wireframes, and design systems in Figma.",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    dateAdded: "01 Oct 2024",
  },
];

// Helper to auto-seed if empty
const ensureDatabaseSeeded = async () => {
  try {
    const count = await CandidateDatabase.countDocuments();
    if (count === 0) {
      await CandidateDatabase.insertMany(INITIAL_DATABASE_CANDIDATES);
      console.log("Candidate Database bootstrapped with initial candidate records.");
    }
  } catch (err) {
    console.warn("Auto-seed error for candidate database:", err.message);
  }
};

// GET /api/candidate-database
export const getCandidates = async (req, res) => {
  try {
    await ensureDatabaseSeeded();

    const {
      search,
      skill,
      experience,
      location,
      status,
      tab,
      sortBy = "latest",
    } = req.query;

    const filter = {};

    // Search query
    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), "i");
      filter.$or = [
        { name: regex },
        { email: regex },
        { phone: regex },
        { role: regex },
        { company: regex },
        { client: regex },
        { location: regex },
        { skills: regex },
        { about: regex },
        { education: regex },
      ];
    }

    // Skills filter
    if (skill && skill !== "All Skills") {
      filter.skills = { $in: [new RegExp(skill, "i")] };
    }

    // Experience filter
    if (experience && experience !== "All Experience") {
      filter.experience = new RegExp(experience, "i");
    }

    // Location filter
    if (location && location !== "All Locations") {
      filter.location = new RegExp(location, "i");
    }

    // Status filter
    if (status && status !== "All Status") {
      filter.status = status;
    }

    // Tab filter ('all', 'active', 'placed', 'inprocess', 'rejected')
    if (tab && tab !== "all") {
      if (tab === "active") {
        filter.status = { $in: ["Shortlisted", "Applied", "In Progress"] };
      } else if (tab === "placed") {
        filter.status = { $in: ["Hired", "Offer Extended"] };
      } else if (tab === "inprocess") {
        filter.status = { $in: ["In Progress", "Interview Scheduled"] };
      } else if (tab === "rejected") {
        filter.status = "Rejected";
      }
    }

    // Sorting
    let sortObj = { createdAt: -1 };
    if (sortBy === "name_asc") {
      sortObj = { name: 1 };
    } else if (sortBy === "name_desc") {
      sortObj = { name: -1 };
    } else if (sortBy === "exp_high") {
      sortObj = { experience: -1 };
    } else if (sortBy === "exp_low") {
      sortObj = { experience: 1 };
    }

    const candidates = await CandidateDatabase.find(filter).sort(sortObj);
    res.json(candidates);
  } catch (error) {
    console.error("GET CandidateDatabase error:", error);
    res.status(500).json({ message: "Failed to fetch candidates", error: error.message });
  }
};

// GET /api/candidate-database/stats
export const getDatabaseStats = async (req, res) => {
  try {
    await ensureDatabaseSeeded();

    const total = await CandidateDatabase.countDocuments();
    const active = await CandidateDatabase.countDocuments({
      status: { $in: ["Shortlisted", "Applied", "In Progress"] },
    });
    const placed = await CandidateDatabase.countDocuments({
      status: { $in: ["Hired", "Offer Extended"] },
    });
    const inProcess = await CandidateDatabase.countDocuments({
      status: { $in: ["In Progress", "Interview Scheduled"] },
    });
    const rejected = await CandidateDatabase.countDocuments({
      status: "Rejected",
    });

    res.json({
      total,
      active,
      placed,
      inProcess,
      rejected,
    });
  } catch (error) {
    console.error("GET CandidateDatabase stats error:", error);
    res.status(500).json({ message: "Failed to fetch database stats", error: error.message });
  }
};

// GET /api/candidate-database/:id
export const getCandidateById = async (req, res) => {
  try {
    const candidate = await CandidateDatabase.findById(req.params.id);
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found in database" });
    }
    res.json(candidate);
  } catch (error) {
    console.error("GET CandidateDatabase by ID error:", error);
    res.status(500).json({ message: "Error retrieving candidate", error: error.message });
  }
};

// POST /api/candidate-database
export const createCandidate = async (req, res) => {
  try {
    const { name, email, role, skills } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Candidate name is required" });
    }

    // Process skills if passed as comma-separated string
    let parsedSkills = skills;
    if (typeof skills === "string") {
      parsedSkills = skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }

    // Sanitize body: strip client-generated temporary _id if not a valid Mongo ObjectId
    const candidateData = { ...req.body };
    if (candidateData._id && !mongoose.Types.ObjectId.isValid(candidateData._id)) {
      delete candidateData._id;
    }

    const newCandidate = new CandidateDatabase({
      ...candidateData,
      skills: parsedSkills || [],
      dateAdded: candidateData.dateAdded || (() => {
        const now = new Date();
        const options = { day: "2-digit", month: "short", year: "numeric" };
        return now.toLocaleDateString("en-GB", options);
      })(),
    });

    const saved = await newCandidate.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error("POST CandidateDatabase error:", error);
    res.status(500).json({ message: "Failed to create candidate", error: error.message });
  }
};

// POST /api/candidate-database/bulk
export const bulkImportCandidates = async (req, res) => {
  try {
    const list = req.body;
    if (!Array.isArray(list) || list.length === 0) {
      return res.status(400).json({ message: "Expected a non-empty array of candidates" });
    }

    const formattedList = list.map((c) => {
      let skills = c.skills;
      if (typeof skills === "string") {
        skills = skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      }
      const item = {
        ...c,
        skills: skills || [],
      };
      if (item._id && !mongoose.Types.ObjectId.isValid(item._id)) {
        delete item._id;
      }
      return item;
    });

    const saved = await CandidateDatabase.insertMany(formattedList);
    res.status(201).json({
      message: `Successfully imported ${saved.length} candidates into database.`,
      count: saved.length,
      candidates: saved,
    });
  } catch (error) {
    console.error("POST Bulk CandidateDatabase error:", error);
    res.status(500).json({ message: "Bulk import failed", error: error.message });
  }
};

// PUT /api/candidate-database/:id
export const updateCandidate = async (req, res) => {
  try {
    const { id } = req.params;
    let updateData = { ...req.body };

    if (typeof updateData.skills === "string") {
      updateData.skills = updateData.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }

    const updated = await CandidateDatabase.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    res.json(updated);
  } catch (error) {
    console.error("PUT CandidateDatabase error:", error);
    res.status(500).json({ message: "Failed to update candidate", error: error.message });
  }
};

// PUT /api/candidate-database/:id/move
export const moveCandidate = async (req, res) => {
  try {
    const { id } = req.params;
    const { client, company, role, status, stage } = req.body;

    const candidate = await CandidateDatabase.findById(id);
    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    if (client) candidate.client = client;
    if (company) candidate.company = company;
    if (role) candidate.role = role;
    if (status) candidate.status = status;
    if (stage) candidate.stage = stage;

    const updated = await candidate.save();
    res.json(updated);
  } catch (error) {
    console.error("PUT Move CandidateDatabase error:", error);
    res.status(500).json({ message: "Failed to move candidate", error: error.message });
  }
};

// DELETE /api/candidate-database/:id
export const deleteCandidate = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await CandidateDatabase.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    res.json({ message: "Candidate deleted from database successfully", id });
  } catch (error) {
    console.error("DELETE CandidateDatabase error:", error);
    res.status(500).json({ message: "Failed to delete candidate", error: error.message });
  }
};

// POST /api/candidate-database/bulk-delete
export const deleteMultipleCandidates = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "Array of candidate IDs is required" });
    }

    const result = await CandidateDatabase.deleteMany({ _id: { $in: ids } });
    res.json({
      message: `Deleted ${result.deletedCount} candidate records`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Bulk delete CandidateDatabase error:", error);
    res.status(500).json({ message: "Failed to delete candidates", error: error.message });
  }
};

// POST /api/candidate-database/upload-resume
export const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "candidate-database-resumes",
        resource_type: "auto",
        public_id: `db-${Date.now()}-${req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_")}`,
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload error in candidate database:", error);
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
    console.error("POST Database Upload Resume Error:", error);
    res.status(500).json({ message: "Server error during file upload", error: error.message });
  }
};

// POST /api/candidate-database/parse-resume
export const parseResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const parsedDetails = await parseResumeFromBuffer(req.file.buffer, req.file.originalname);

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "candidate-database-resumes",
        resource_type: "auto",
        public_id: `db-${Date.now()}-${req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_")}`,
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload fallback in parse-resume:", error);
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
    console.error("POST Database Parse Resume Error:", error);
    res.status(500).json({ message: "Server error during resume parsing", error: error.message });
  }
};
