// controllers/companyController.js
// Dedicated Company Controller handling complete CRUD, filtering, searching,
// pagination, and statistics specifically for Company entities.
import Company from "../models/Company.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Initial default companies to seed if database has zero companies
const DEFAULT_COMPANIES = [
  {
    companyName: "TCS Technologies",
    company: "TCS Technologies",
    logo: "TCS",
    contact: "Rohit Sharma",
    designation: "HR Manager",
    email: "rohit.sharma@tcs.com",
    phone: "9876543210",
    industry: "IT Services",
    activeJobs: 5,
    status: "Active",
    companySize: "10,001+ Employees",
    website: "www.tcs.com",
    gst: "27AAACT2727Q1ZJ",
    address: "TCS House, Raveline Street, Fort, Mumbai - 400001, Maharashtra, India",
    notes: "Preferred for IT & Non-IT Hiring. Good response and quick turnaround.",
    agreementFile: "tcs_agreement_2024.pdf",
    agreementStart: new Date("2024-01-01"),
    agreementEnd: new Date("2024-12-31"),
    agreementStatus: "Active",
  },
  {
    companyName: "Infosys Limited",
    company: "Infosys Limited",
    logo: "INFY",
    contact: "Neha Gupta",
    designation: "Talent Acquisition",
    email: "neha.gupta@infosys.com",
    phone: "9123456780",
    industry: "IT Services",
    activeJobs: 3,
    status: "Active",
    companySize: "10,001+ Employees",
    website: "www.infosys.com",
    gst: "29AAACI4567P1ZX",
    address: "Electronics City, Hosur Road, Bangalore - 560100, Karnataka, India",
    notes: "Focus on Enterprise Consulting.",
    agreementFile: "infosys_agreement_2024.pdf",
    agreementStart: new Date("2024-02-01"),
    agreementEnd: new Date("2025-01-31"),
    agreementStatus: "Active",
  },
  {
    companyName: "Wipro Technologies",
    company: "Wipro Technologies",
    logo: "WIPRO",
    contact: "Amit Patel",
    designation: "Hiring Lead",
    email: "amit.patel@wipro.com",
    phone: "9898989898",
    industry: "IT Services",
    activeJobs: 4,
    status: "Active",
    companySize: "10,001+ Employees",
    website: "www.wipro.com",
    gst: "29AAACW1234P1Z5",
    address: "Doddakannelli, Sarjapur Road, Bangalore - 560035, Karnataka, India",
    notes: "Requires regular candidate pipeline updates.",
    agreementStatus: "Active",
  },
];

// GET /api/companies - list companies with optional search, status, industry & pagination
export const getCompanies = async (req, res) => {
  try {
    const { search, status, industry, page, limit, includeDeleted } = req.query;

    const query = {};

    if (includeDeleted !== "true") {
      query.isDeleted = { $ne: true };
    }

    if (status && status !== "All Status" && status !== "All") {
      query.status = status;
    }

    if (industry && industry !== "All Industry" && industry !== "All") {
      query.industry = industry;
    }

    if (search && search.trim() !== "") {
      const q = search.trim();
      const regex = new RegExp(q, "i");
      query.$or = [
        { companyName: regex },
        { company: regex },
        { contact: regex },
        { clientName: regex },
        { designation: regex },
        { email: regex },
        { phone: regex },
        { website: regex },
        { address: regex },
      ];
    }

    // Auto-seed if empty
    const count = await Company.countDocuments();
    if (count === 0) {
      await Company.insertMany(DEFAULT_COMPANIES);
    }

    if (page && limit) {
      const pageNum = Math.max(1, parseInt(page, 10) || 1);
      const limitNum = Math.max(1, parseInt(limit, 10) || 20);
      const skip = (pageNum - 1) * limitNum;

      const [total, companies] = await Promise.all([
        Company.countDocuments(query),
        Company.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      ]);

      return res.json({
        companies,
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum),
      });
    }

    const companies = await Company.find(query).sort({ createdAt: -1 });
    res.json(companies);
  } catch (err) {
    console.error("Error fetching companies:", err);
    res.status(500).json({ message: "Failed to retrieve companies", error: err.message });
  }
};

// GET /api/companies/stats - summary metrics for companies
export const getCompanyStats = async (req, res) => {
  try {
    const now = new Date();
    const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [total, active, newThisMonth, pendingAgreements] = await Promise.all([
      Company.countDocuments({ isDeleted: { $ne: true } }),
      Company.countDocuments({ isDeleted: { $ne: true }, status: "Active" }),
      Company.countDocuments({ isDeleted: { $ne: true }, createdAt: { $gte: firstDayThisMonth } }),
      Company.countDocuments({
        isDeleted: { $ne: true },
        $or: [{ agreementStatus: "Pending" }, { agreementStatus: { $exists: false } }],
      }),
    ]);

    res.json({
      total,
      active,
      newThisMonth,
      pendingAgreements,
    });
  } catch (err) {
    console.error("Error fetching company stats:", err);
    res.status(500).json({ message: "Failed to load company stats", error: err.message });
  }
};

// GET /api/companies/:id - single company details
export const getCompanyById = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company || company.isDeleted) {
      return res.status(404).json({ message: "Company not found" });
    }
    res.json(company);
  } catch (err) {
    res.status(500).json({ message: "Failed to retrieve company details", error: err.message });
  }
};

// POST /api/companies - add a new company
export const createCompany = async (req, res) => {
  try {
    const {
      companyName,
      company,
      contact,
      clientName,
      designation,
      email,
      phone,
      website,
      industry,
      companySize,
      gst,
      address,
      status,
      activeJobs,
      notes,
      agreementFile,
      agreementStart,
      agreementEnd,
      agreementStatus,
      logo,
    } = req.body;

    const resolvedName = (companyName || company || "").trim();
    if (!resolvedName) {
      return res.status(400).json({ message: "Company name is required." });
    }

    if (!email || !EMAIL_REGEX.test(email)) {
      return res.status(400).json({ message: "A valid email address is required." });
    }

    // Check duplicate
    const existing = await Company.findOne({
      email: email.trim().toLowerCase(),
      isDeleted: { $ne: true },
    });
    if (existing) {
      return res.status(409).json({ message: "A company with this email address already exists." });
    }

    const newCompany = new Company({
      companyName: resolvedName,
      company: resolvedName,
      contact: (contact || clientName || "").trim(),
      clientName: (contact || clientName || "").trim(),
      designation: (designation || "").trim(),
      email: email.trim().toLowerCase(),
      phone: (phone || "").trim(),
      website: (website || "").trim(),
      industry: industry || "IT Services",
      companySize: companySize || "",
      gst: (gst || "").trim(),
      address: (address || "").trim(),
      status: status === "Inactive" ? "Inactive" : "Active",
      activeJobs: typeof activeJobs === "number" ? activeJobs : 0,
      notes: notes || "",
      agreementFile: agreementFile || "",
      agreementStart: agreementStart ? new Date(agreementStart) : undefined,
      agreementEnd: agreementEnd ? new Date(agreementEnd) : undefined,
      agreementStatus: agreementStatus || "Pending",
      logo: logo || resolvedName.substring(0, 3).toUpperCase(),
    });

    const saved = await newCompany.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error("Error creating company:", err);
    res.status(500).json({ message: "Failed to create company", error: err.message });
  }
};

// PUT /api/companies/:id - update an existing company
export const updateCompany = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company || company.isDeleted) {
      return res.status(404).json({ message: "Company not found" });
    }

    const {
      companyName,
      company: compAlias,
      contact,
      clientName,
      designation,
      email,
      phone,
      website,
      industry,
      companySize,
      gst,
      address,
      status,
      activeJobs,
      notes,
      agreementFile,
      agreementStart,
      agreementEnd,
      agreementStatus,
      logo,
    } = req.body;

    if (email !== undefined) {
      if (!EMAIL_REGEX.test(email)) {
        return res.status(400).json({ message: "Invalid email format." });
      }
      const existing = await Company.findOne({
        email: email.trim().toLowerCase(),
        _id: { $ne: req.params.id },
        isDeleted: { $ne: true },
      });
      if (existing) {
        return res.status(409).json({ message: "Another company is already using this email." });
      }
      company.email = email.trim().toLowerCase();
    }

    const newName = (companyName || compAlias || "").trim();
    if (newName) {
      company.companyName = newName;
      company.company = newName;
    }

    if (contact !== undefined || clientName !== undefined) {
      const contactVal = (contact || clientName || "").trim();
      company.contact = contactVal;
      company.clientName = contactVal;
    }

    if (designation !== undefined) company.designation = designation.trim();
    if (phone !== undefined) company.phone = phone.trim();
    if (website !== undefined) company.website = website.trim();
    if (industry !== undefined) company.industry = industry;
    if (companySize !== undefined) company.companySize = companySize;
    if (gst !== undefined) company.gst = gst.trim();
    if (address !== undefined) company.address = address.trim();
    if (status !== undefined) company.status = status;
    if (activeJobs !== undefined) company.activeJobs = Number(activeJobs) || 0;
    if (notes !== undefined) company.notes = notes;
    if (agreementFile !== undefined) company.agreementFile = agreementFile;
    if (agreementStart !== undefined) company.agreementStart = agreementStart ? new Date(agreementStart) : undefined;
    if (agreementEnd !== undefined) company.agreementEnd = agreementEnd ? new Date(agreementEnd) : undefined;
    if (agreementStatus !== undefined) company.agreementStatus = agreementStatus;
    if (logo !== undefined) company.logo = logo;

    const updated = await company.save();
    res.json(updated);
  } catch (err) {
    console.error("Error updating company:", err);
    res.status(500).json({ message: "Failed to update company", error: err.message });
  }
};

// DELETE /api/companies/:id - soft delete company
export const deleteCompany = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    company.isDeleted = true;
    await company.save();

    res.json({ message: "Company deleted successfully (soft delete)", id: req.params.id });
  } catch (err) {
    console.error("Error deleting company:", err);
    res.status(500).json({ message: "Failed to delete company", error: err.message });
  }
};

// POST /api/companies/:id/restore - restore soft deleted company
export const restoreCompany = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    company.isDeleted = false;
    await company.save();

    res.json({ message: "Company restored successfully", company });
  } catch (err) {
    res.status(500).json({ message: "Failed to restore company", error: err.message });
  }
};

// POST /api/companies/import - bulk insert companies
export const importCompanies = async (req, res) => {
  try {
    const { companies, clients } = req.body;
    const list = Array.isArray(companies) ? companies : (Array.isArray(clients) ? clients : []);
    if (list.length === 0) {
      return res.status(400).json({ message: "No companies provided to import" });
    }

    const formatted = list.map((c) => {
      const compName = (c.companyName || c.company || "Unnamed Company").trim();
      const cName = (c.contact || c.clientName || "").trim();
      return {
        ...c,
        companyName: compName,
        company: compName,
        contact: cName,
        clientName: cName,
        email: (c.email || `info@${compName.toLowerCase().replace(/[^a-z0-9]/g, "")}.com`).trim().toLowerCase(),
        phone: (c.phone || "").toString().trim(),
        address: (c.address || "").trim(),
        status: c.status === "Inactive" ? "Inactive" : "Active",
        isDeleted: false,
      };
    });

    const inserted = await Company.insertMany(formatted, { ordered: false });
    res.status(201).json({ message: `${inserted.length} company(ies) imported successfully`, companies: inserted });
  } catch (err) {
    res.status(400).json({ message: err.message || "Failed to import companies" });
  }
};

// DELETE /api/companies/:id/hard - permanently delete company
export const hardDeleteCompany = async (req, res) => {
  try {
    const deleted = await Company.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Company not found" });
    }
    res.json({ message: "Company permanently deleted", id: req.params.id });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete company permanently", error: err.message });
  }
};

