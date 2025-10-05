import express from "express";
import Appointment from "../models/Appointment.js";

const router = express.Router();
// 💰 Define fixed service prices

// Book appointment

router.post("/", async (req, res) => {
  try {
    const { name, service,time } = req.body;
   const servicePrices = {
  "Haircut": 50,
  "Beard Shape": 30,
  "Haircut + Beard Shape": 70
};

const price = servicePrices[service] || 0;
    const last = await Appointment.findOne({ status: { $ne: "completed" } })
      .sort({ queueNumber: -1 });

    const queueNumber = last ? last.queueNumber + 1 : 1;

    const appointment = new Appointment({ name, service,time,price, queueNumber });
    await appointment.save();

    res.json({ message: "Appointment booked", appointment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Approve appointment
router.patch("/:id/approve", async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status: "approved" },
      { new: true }
    );
    if (!appointment) return res.status(404).json({ error: "Not found" });
    res.json({ message: "Approved", appointment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Complete appointment
router.patch("/:id/complete", async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ error: "Not found" });

    appointment.status = "completed";
    await appointment.save();

    // shift queue for others
    await Appointment.updateMany(
      { status: { $ne: "completed" }, queueNumber: { $gt: appointment.queueNumber } },
      { $inc: { queueNumber: -1 } }
    );

    res.json({ message: "Completed", appointment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Delete appointment
router.delete("/:id", async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);
    if (!appointment) return res.status(404).json({ error: "Not found" });

    // reorder queue
    await Appointment.updateMany(
      { status: { $ne: "completed" }, queueNumber: { $gt: appointment.queueNumber } },
      { $inc: { queueNumber: -1 } }
    );

    res.json({ message: "Appointment deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all appointments
router.get("/", async (req, res) => {
  try {
    const appointments = await Appointment.find().sort({ queueNumber: 1 });
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// ✅ Count completed appointments for today
router.get("/count-today", async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const count = await Appointment.countDocuments({
      status: "completed",
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    });

    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get revenue of today
router.get("/revenue/today", async (req, res) => {
  try {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const revenue = await Appointment.aggregate([
      {
        $match: {
          status: "completed",
          createdAt: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$price" },
          count: { $sum: 1 }
        }
      }
    ]);

    res.json(revenue[0] || { totalRevenue: 0, count: 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


export default router;  // ✅ ESM export
