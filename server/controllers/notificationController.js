// server/controllers/notificationController.js
import Notification from "../models/Notification.js";
import Activity from "../models/Activity.js";

// Seed default initial notifications if empty
const seedInitialNotifications = async () => {
  try {
    const count = await Notification.countDocuments();
    if (count === 0) {
      // Check if activities exist to convert
      const activities = await Activity.find().sort({ createdAt: -1 }).limit(10);
      if (activities.length > 0) {
        const notifs = activities.map((act) => ({
          title: act.text || "System Update",
          description: act.text || "Activity logged in system",
          message: act.text || "Activity logged in system",
          subMessage: act.category ? `Category: ${act.category}` : "",
          tag: act.type === "offer" ? "Important" : "",
          type: act.type === "schedule" ? "interview" : (act.type || "system"),
          isRead: false,
          isImportant: act.type === "offer",
          createdAt: act.createdAt || new Date(),
        }));
        await Notification.insertMany(notifs);
      } else {
        await Notification.insertMany([
          {
            title: "New Candidate Applied",
            description: "Priya Sharma applied for MERN Stack Developer at TCS Technologies",
            message: "Priya Sharma applied for MERN Stack Developer at TCS Technologies",
            subMessage: "Profile passed automated screening with 92% match score.",
            type: "candidate",
            tag: "New",
            isRead: false,
            isImportant: false,
            details: {
              candidateName: "Priya Sharma",
              candidateRole: "MERN Stack Developer",
              candidateEmail: "priya.sharma@example.com",
              candidatePhone: "+91 98765 43210",
              experience: "4.5 Years",
              currentCTC: "₹12.5 LPA",
              expectedCTC: "₹18.0 LPA"
            },
            createdAt: new Date(Date.now() - 1000 * 60 * 30),
          },
          {
            title: "Interview Scheduled Today",
            description: "Technical Interview round scheduled with Rahul Verma at 02:30 PM",
            message: "Technical Interview round scheduled with Rahul Verma at 02:30 PM",
            subMessage: "Panel: Sanjay Vishwakarma & Senior Architect.",
            type: "interview",
            tag: "Urgent",
            isRead: false,
            isImportant: true,
            details: {
              candidateName: "Rahul Verma",
              candidateRole: "Senior React Native Lead",
              candidateEmail: "rahul.verma@example.com",
              candidatePhone: "+91 91234 56789",
              experience: "6 Years",
              currentCTC: "₹16 LPA",
              expectedCTC: "₹24 LPA"
            },
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
          },
          {
            title: "Offer Letter Released",
            description: "Offer released to Neha Gupta for HR Executive role at Infosys",
            message: "Offer released to Neha Gupta for HR Executive role at Infosys",
            subMessage: "Offer letter sent via email. Candidate requested 48h to respond.",
            type: "offer",
            tag: "High Priority",
            isRead: true,
            isImportant: true,
            details: {
              candidateName: "Neha Gupta",
              candidateRole: "HR Executive",
              candidateEmail: "neha.gupta@example.com",
              candidatePhone: "+91 99887 76655",
              experience: "3 Years",
              currentCTC: "₹6 LPA",
              expectedCTC: "₹9 LPA"
            },
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
          },
          {
            title: "Job Opening Approved",
            description: "New job requisition for Senior DevOps Engineer approved and published",
            message: "New job requisition for Senior DevOps Engineer approved and published",
            subMessage: "Requisition #REQ-2026-88 is now live on career portal.",
            type: "job",
            tag: "Hiring",
            isRead: true,
            isImportant: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
          },
        ]);
      }
    }
  } catch (err) {
    console.warn("Notification seed check:", err.message);
  }
};

// GET /api/notifications
export const getNotifications = async (req, res) => {
  try {
    await seedInitialNotifications();
    const notifications = await Notification.find().sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: "Error fetching notifications", error: err.message });
  }
};

// PUT /api/notifications/mark-all-read
export const markAllRead = async (req, res) => {
  try {
    await Notification.updateMany({}, { isRead: true });
    res.json({ message: "All notifications marked as read" });
  } catch (err) {
    res.status(500).json({ message: "Error updating notifications", error: err.message });
  }
};

// PUT /api/notifications/:id/read
export const toggleRead = async (req, res) => {
  try {
    const { id } = req.params;
    const { isRead } = req.body;
    const notif = await Notification.findByIdAndUpdate(
      id,
      { isRead: isRead !== undefined ? isRead : true },
      { new: true }
    );
    if (!notif) return res.status(404).json({ message: "Notification not found" });
    res.json(notif);
  } catch (err) {
    res.status(500).json({ message: "Error updating notification", error: err.message });
  }
};

// DELETE /api/notifications/:id
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const notif = await Notification.findByIdAndDelete(id);
    if (!notif) return res.status(404).json({ message: "Notification not found" });
    res.json({ message: "Notification deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting notification", error: err.message });
  }
};
