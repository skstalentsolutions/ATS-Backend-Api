// server/controllers/jobController.js
import Job from "../models/Job.js";

// @desc Get all jobs
export const getJobs = async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    console.error("GET Jobs Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc Create a job
export const createJob = async (req, res) => {
  try {
    const { title, client, description, location } = req.body;

    if (!title || !client) {
      return res.status(400).json({ message: "Please provide title and client" });
    }

    const logoTextVal = req.body.logoText || (client ? client.toLowerCase().substring(0, 3) : "job");
    const logoBgVal = req.body.logoBg || "bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-500/20";

    const newJob = new Job({
      ...req.body,
      logoText: logoTextVal,
      logoBg: logoBgVal,
      location: location || req.body.location || "Remote",
      fullLocation: req.body.fullLocation || location || "Remote",
    });

    const savedJob = await newJob.save();
    res.status(201).json(savedJob);
  } catch (error) {
    console.error("POST Job Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc Bulk import jobs
export const bulkImportJobs = async (req, res) => {
  try {
    const jobs = req.body;
    if (!Array.isArray(jobs) || jobs.length === 0) {
      return res.status(400).json({ message: "Invalid format. Expected an array of jobs." });
    }

    const formattedJobs = jobs.map((job) => {
      if (!job.title || !job.client) {
        throw new Error("Each job must have at least title and client");
      }
      return {
        title: job.title,
        client: job.client,
        logoText: job.logoText || job.client.toLowerCase().substring(0, 3),
        logoBg: job.logoBg || "bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-500/20",
        type: job.type || "Full Time",
        location: job.location || "Remote",
        fullLocation: job.fullLocation || job.location || "Remote",
        experience: job.experience || "0 - 1 Years",
        vacancies: Number(job.vacancies) || 1,
        status: job.status || "Active",
        postedOn: job.postedOn || "Today",
        closingDate: job.closingDate || "Not Specified",
        ctcRange: job.ctcRange || "Not Specified",
        recruiter: job.recruiter || "Sanjay Kushwaha",
        candidatesCount: Number(job.candidatesCount) || 0,
        description: job.description || "",
        skills: Array.isArray(job.skills) ? job.skills : (job.skills ? job.skills.split(",").map((s) => s.trim()) : []),
        attachmentName: job.attachmentName || "Job_Description.pdf",
      };
    });

    const insertedJobs = await Job.insertMany(formattedJobs);
    res.status(201).json(insertedJobs);
  } catch (error) {
    console.error("Bulk Import Error:", error);
    res.status(400).json({ message: error.message || "Bulk import failed" });
  }
};

// @desc Update job
export const updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Job post not found" });
    }

    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.json(updatedJob);
  } catch (error) {
    console.error("PUT Job Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc Delete job
export const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ message: "Job post not found" });
    }

    await Job.findByIdAndDelete(req.params.id);
    res.json({ message: "Job post successfully deleted", id: req.params.id });
  } catch (error) {
    console.error("DELETE Job Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
