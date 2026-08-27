// controllers/clientController.js
// One function per route. Kept separate from routes/clientRoutes.js so
// "what happens" (controller) is separate from "which URL triggers it" (route).
import Client from "../models/Client.js";

// GET /api/clients - list all clients
export const getClients = async (req, res) => {
  try {
    const clients = await Client.find().sort({ createdAt: -1 });
    res.json(clients);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/clients/:id - one client's full details
export const getClientById = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ message: "Client not found" });
    res.json(client);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/clients - add a new client (for the "Add Client" button)
export const createClient = async (req, res) => {
  try {
    const newClient = await Client.create(req.body);
    res.status(201).json(newClient);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// PUT /api/clients/:id - edit a client (for the "Edit Client" button)
export const updateClient = async (req, res) => {
  try {
    const updated = await Client.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// DELETE /api/clients/:id - delete a client (for the "Delete Client" button)
export const deleteClient = async (req, res) => {
  try {
    await Client.findByIdAndDelete(req.params.id);
    res.json({ message: "Client deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/clients/import - bulk insert clients parsed from an uploaded
// Excel file (for the "Import Excel" button). Expects { clients: [...] }.
export const importClients = async (req, res) => {
  try {
    const { clients } = req.body;
    if (!Array.isArray(clients) || clients.length === 0) {
      return res.status(400).json({ message: "No clients provided to import" });
    }
    // ordered:false means one bad row (e.g. missing required field) won't
    // stop the rest from being inserted
    const inserted = await Client.insertMany(clients, { ordered: false });
    res.status(201).json({ message: `${inserted.length} client(s) imported`, clients: inserted });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};