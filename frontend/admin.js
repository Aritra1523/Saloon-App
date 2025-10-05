const API_URL = "http://localhost:5000/api/appointments";

// Load all appointments
async function loadAppointments() {
  try {
    const res = await fetch(API_URL);
    const appointments = await res.json();

    const list = document.getElementById("appointments");
    list.innerHTML = "";

    appointments.forEach(a => {
      const li = document.createElement("li");
      li.classList.add("appointment-card", a.status);
      li.innerHTML = `
        #${a.queueNumber} - ${a.name} (${a.service}) at <b>${a.time}</b> [${a.status}]
        ${a.status === "pending" ? `<button onclick="approve('${a._id}')">Approve</button>` : ""}
        ${a.status !== "completed" ? `<button onclick="complete('${a._id}')">Complete</button>` : ""}
        <button onclick="deleteAppointment('${a._id}')">Delete</button>
      `;
      list.appendChild(li);
    });
     // ✅ Load today count
    loadTodayCount();

    //Reveneu Count
    loadRevenue();
    // 🔄 Auto-refresh every 5 seconds
//setInterval(loadAppointments, 5000);
  } catch (err) {
    console.error(err);
    alert("Error loading appointments");
  }
}
// Fetch today’s completed count
async function loadTodayCount() {
  try {
    const res = await fetch(`${API_URL}/count-today`);
    const data = await res.json();
    document.getElementById("todayCount").textContent = data.count;
  } catch (err) {
    console.error("Error loading today count:", err);
  }
}
// Approve appointment
async function approve(id) {
  try {
    await fetch(`${API_URL}/${id}/approve`, { method: "PATCH" });
    loadAppointments();
  } catch (err) {
    console.error("Error approving:", err);
  }
}

// Complete appointment
async function complete(id) {
  try {
    await fetch(`${API_URL}/${id}/complete`, { method: "PATCH" });
    loadAppointments();
  } catch (err) {
    console.error("Error completing:", err);
  }
}

// Delete appointment
async function deleteAppointment(id) {
  if (!confirm("Are you sure you want to delete this appointment?")) return;
  try {
    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    loadAppointments();
  } catch (err) {
    console.error("Error deleting:", err);
  }
}

//Reveneue
async function loadRevenue() {
  try {
    const res = await fetch(`${API_URL}/revenue/today`);
    const data = await res.json();

    document.getElementById("revenue").innerText =
      `💰 Today’s Revenue: ₹${data.totalRevenue} from ${data.count} completed services`;
      
  } catch (err) {
    console.error(err);
  }
}

// Load data initially
loadAppointments();
