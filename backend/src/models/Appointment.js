import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
  name: { type: String, required: true },   // User name
  service: { type: String, required: true }, // e.g. Haircut, Facial
  time: { type: String, required: true }, 
  price: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ["waiting", "approved", "completed"], 
    default: "waiting" 
  },
  queueNumber: { type: Number, required: true }, // Token number
  createdAt: { type: Date, default: Date.now }
});




export default mongoose.model("Appointment", appointmentSchema);
