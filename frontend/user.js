const API_URL = "http://localhost:5000/api/appointments";

// Book an appointment
async function bookSlot() {
  const name = document.getElementById("name").value;
  const service = document.getElementById("service").value;
  const time = document.getElementById("time").value;

  if (!name || !service || !time) {
    alert("Please enter name and service অনুগ্রহ করে নাম, পরিষেবা এবং সময় লিখুন।");
    return;
  }
// 🔑 Price mapping
 const servicePrices = {
  "Haircut": 50,
  "Beard Shape": 30,
  "Haircut + Beard Shape": 70
};

  const price = servicePrices[service] || 0;
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, service, time,price })
    });

    const data = await res.json();
    alert("Booking confirmed!(বুকিং নিশ্চিত হয়েছে!) Your Line number is(আপনার লাইন নম্বর হলো) " + data.appointment.queueNumber);

    showQueue();
  } catch (err) {
    console.error(err);
    alert("Error booking appointment");
  }
}

// Show current queue
async function showQueue() {
  try {
    const res = await fetch(API_URL);
    const appointments = await res.json();

    const active = appointments.filter(a => a.status !== "completed");

    document.getElementById("waitingInfo").innerText =
      `Currently ${active.length} people waiting`;

    const queueList = document.getElementById("queue");
    queueList.innerHTML = "";

    active.forEach(a => {
      const li = document.createElement("li");
      li.innerText = `#${a.queueNumber} - ${a.name} (${a.service}) [${a.status}]`;
      queueList.appendChild(li);
    });
  } catch (err) {
    console.error(err);
    alert("Error fetching queue");
  }
}

// Load queue on page start
showQueue();
// 🔄 Auto-refresh every 5 seconds
setInterval(showQueue, 5000);
