// controllers/clientController.js
// Client Management controller supporting full CRUD, search, status filtering,
// pagination, data validation, and both soft and hard deletion.
import Client from "../models/Client.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// GET /api/clients - list clients with optional search, status filter, and pagination
export const getClients = async (req, res) => {
  try {
    const { search, status, industry, page, limit, includeDeleted } = req.query;

    const query = {};

    // Filter out deleted unless requested
    if (includeDeleted !== "true") {
      query.isDeleted = { $ne: true };
    }

    // Status filter
    if (status && status !== "All Status" && status !== "All") {
      query.status = status;
    }

    // Industry filter
    if (industry && industry !== "All Industry" && industry !== "All") {
      query.industry = industry;
    }

    // Search query across clientName, companyName, company, contact, email, phone, address
    if (search && search.trim() !== "") {
      const q = search.trim();
      const regex = new RegExp(q, "i");
      query.$or = [
        { clientName: regex },
        { contact: regex },
        { companyName: regex },
        { company: regex },
        { email: regex },
        { phone: regex },
        { address: regex },
      ];
    }

    // If pagination requested via query params
    if (page && limit) {
      const pageNum = Math.max(1, parseInt(page, 10) || 1);
      const limitNum = Math.max(1, parseInt(limit, 10) || 20);
      const skip = (pageNum - 1) * limitNum;

      const [total, clients] = await Promise.all([
        Client.countDocuments(query),
        Client.find(query).sort({ createdAt: -1 }).skip(skip).limit(limitNum),
      ]);

      return res.json({
        clients,
        total,
        page: pageNum,
        totalPages: Math.ceil(total / limitNum),
      });
    }

    // Default list response (array of clients)
    const clients = await Client.find(query).sort({ createdAt: -1 });
    res.json(clients);
  } catch (err) {
    console.error("Error fetching clients:", err);
    res.status(500).json({ message: "Failed to retrieve clients", error: err.message });
  }
};

// GET /api/clients/stats - summary metrics for clients
export const getClientStats = async (req, res) => {
  try {
    const now = new Date();
    const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [total, active, newThisMonth, pendingAgreements] = await Promise.all([
      Client.countDocuments({ isDeleted: { $ne: true } }),
      Client.countDocuments({ isDeleted: { $ne: true }, status: "Active" }),
      Client.countDocuments({ isDeleted: { $ne: true }, createdAt: { $gte: firstDayThisMonth } }),
      Client.countDocuments({
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
    console.error("Error fetching client stats:", err);
    res.status(500).json({ message: "Failed to load client stats", error: err.message });
  }
};

// GET /api/clients/:id - one client's full details
export const getClientById = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client || client.isDeleted) {
      return res.status(404).json({ message: "Client not found" });
    }
    res.json(client);
  } catch (err) {
    res.status(500).json({ message: "Failed to retrieve client details", error: err.message });
  }
};

// POST /api/clients - add a new client
export const createClient = async (req, res) => {
  try {
    const {
      clientName,
      companyName,
      company,
      contact,
      email,
      phone,
      address,
      status,
      designation,
      industry,
      companySize,
      website,
      gst,
      notes,
    } = req.body;

    const resolvedClientName = (clientName || company || companyName || "").trim();
    const resolvedContact = (contact || clientName || "").trim();
    const resolvedCompanyName = (companyName || company || clientName || "").trim();
    const resolvedEmail = (email || "").trim().toLowerCase();

    // Validation
    if (!resolvedClientName && !resolvedCompanyName) {
      return res.status(400).json({ message: "Client Name is required." });
    }

    if (!resolvedEmail) {
      return res.status(400).json({ message: "Email is required." });
    }

    if (!EMAIL_REGEX.test(resolvedEmail)) {
      return res.status(400).json({ message: "Please provide a valid email address." });
    }

    // Check for duplicate active client with identical email
    const existing = await Client.findOne({
      email: resolvedEmail,
      isDeleted: { $ne: true },
    });
    if (existing) {
      return res.status(400).json({ message: "A client with this email address already exists." });
    }

    const payload = {
      clientName: resolvedClientName,
      contact: resolvedContact || resolvedClientName,
      companyName: resolvedCompanyName || "Individual",
      company: resolvedCompanyName || "Individual",
      email: resolvedEmail,
      phone: (phone || "").trim(),
      address: (address || "").trim(),
      status: status === "Inactive" ? "Inactive" : "Active",
      designation: (designation || "").trim(),
      industry: industry || "IT Services",
      companySize: (companySize || "").trim(),
      website: (website || "").trim(),
      gst: (gst || "").trim(),
      notes: (notes || "").trim(),
      logo: req.body.logo || req.body.image || "",
      isDeleted: false,
    };

    const newClient = await Client.create(payload);
    res.status(201).json(newClient);
  } catch (err) {
    console.error("Error creating client:", err);
    res.status(400).json({ message: err.message || "Failed to create client" });
  }
};

// PUT /api/clients/:id - edit a client
export const updateClient = async (req, res) => {
  try {
    const { id } = req.params;

    const existingClient = await Client.findById(id);
    if (!existingClient || existingClient.isDeleted) {
      return res.status(404).json({ message: "Client not found" });
    }

    const updateData = { ...req.body };

    if (updateData.clientName) {
      updateData.clientName = updateData.clientName.trim();
    }
    if (updateData.contact) {
      updateData.contact = updateData.contact.trim();
    } else if (updateData.clientName && !existingClient.contact) {
      updateData.contact = updateData.clientName;
    }

    if (updateData.companyName) {
      updateData.companyName = updateData.companyName.trim();
      updateData.company = updateData.companyName;
    } else if (updateData.company) {
      updateData.company = updateData.company.trim();
      updateData.companyName = updateData.company;
    } else if (updateData.clientName) {
      updateData.company = updateData.clientName;
      updateData.companyName = updateData.clientName;
    }

    if (updateData.email) {
      updateData.email = updateData.email.trim().toLowerCase();
      if (!EMAIL_REGEX.test(updateData.email)) {
        return res.status(400).json({ message: "Please provide a valid email address." });
      }

      // Check if duplicate with another client
      const duplicate = await Client.findOne({
        _id: { $ne: id },
        email: updateData.email,
        isDeleted: { $ne: true },
      });
      if (duplicate) {
        return res.status(400).json({ message: "Another client already uses this email address." });
      }
    }

    const updated = await Client.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    res.json(updated);
  } catch (err) {
    console.error("Error updating client:", err);
    res.status(400).json({ message: err.message || "Failed to update client" });
  }
};

// DELETE /api/clients/:id - soft delete or delete client
export const deleteClient = async (req, res) => {
  try {
    const { id } = req.params;
    const client = await Client.findById(id);
    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    // Soft delete preserves audit records and relationships
    client.isDeleted = true;
    client.status = "Inactive";
    await client.save();

    res.json({ message: "Client deleted successfully", id });
  } catch (err) {
    console.error("Error deleting client:", err);
    res.status(500).json({ message: "Failed to delete client", error: err.message });
  }
};

// POST /api/clients/:id/restore - restore soft deleted client
export const restoreClient = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    client.isDeleted = false;
    client.status = "Active";
    await client.save();

    res.json({ message: "Client restored successfully", client });
  } catch (err) {
    res.status(500).json({ message: "Failed to restore client", error: err.message });
  }
};

// DELETE /api/clients/:id/hard - permanently delete client
export const hardDeleteClient = async (req, res) => {
  try {
    const deleted = await Client.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Client not found" });
    }
    res.json({ message: "Client permanently deleted", id: req.params.id });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete client permanently", error: err.message });
  }
};

// POST /api/clients/import - bulk insert clients
export const importClients = async (req, res) => {
  try {
    const { clients } = req.body;
    if (!Array.isArray(clients) || clients.length === 0) {
      return res.status(400).json({ message: "No clients provided to import" });
    }

    const formatted = clients.map((c) => {
      const cName = (c.clientName || c.contact || "Unnamed Client").trim();
      const compName = (c.companyName || c.company || "Individual").trim();
      return {
        ...c,
        clientName: cName,
        contact: cName,
        companyName: compName,
        company: compName,
        email: (c.email || "").trim().toLowerCase(),
        phone: (c.phone || "").toString().trim(),
        address: (c.address || "").trim(),
        status: c.status === "Inactive" ? "Inactive" : "Active",
        isDeleted: false,
      };
    });

    const inserted = await Client.insertMany(formatted, { ordered: false });
    res.status(201).json({ message: `${inserted.length} client(s) imported successfully`, clients: inserted });
  } catch (err) {
    res.status(400).json({ message: err.message || "Failed to import clients" });
  }
};