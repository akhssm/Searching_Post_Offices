const introSection = document.getElementById("intro-section");
const mainApp = document.getElementById("main-app");
const getStartedBtn = document.getElementById("getStartedBtn");
const introIP = document.getElementById("intro-ip");
const mainIP = document.getElementById("main-ip");
const latEl = document.getElementById("lat");
const lonEl = document.getElementById("lon");
const cityEl = document.getElementById("city");
const regionEl = document.getElementById("region");
const orgEl = document.getElementById("org");
const hostnameEl = document.getElementById("hostname");
const tzEl = document.getElementById("tz");
const postalEl = document.getElementById("postal");
const localTimeEl = document.getElementById("localTime");
const postCountEl = document.getElementById("postCount");
const postsContainer = document.getElementById("postsContainer");
const gmap = document.getElementById("gmap");
const searchBar = document.getElementById("searchBar");

let clientIP = null;
let postOffices = [];
let timeInterval = null;

// Safe value
const safe = (v) => (v ? v : "—");

// Get IP address
async function fetchClientIP() {
  try {
    const res = await fetch("https://api.ipify.org?format=json");
    const data = await res.json();
    clientIP = data.ip;
    introIP.textContent = clientIP;
    mainIP.textContent = clientIP;
  } catch {
    introIP.textContent = "Unavailable";
    mainIP.textContent = "Unavailable";
  }
}

// Fetch IP Info + Postal data
async function fetchIPDetails(ip) {
  try {
    const res = await fetch(`https://ipapi.co/${ip}/json/`);
    const data = await res.json();
    updateUI(data);
    await fetchPostOffices(data.postal);
  } catch {
    alert("Error fetching IP details");
  }
}

// Update UI with IP info
function updateUI(d) {
  latEl.textContent = safe(d.latitude);
  lonEl.textContent = safe(d.longitude);
  cityEl.textContent = safe(d.city);
  regionEl.textContent = safe(d.region);
  orgEl.textContent = safe(d.org);
  hostnameEl.textContent = safe(d.asn || "N/A");
  postalEl.textContent = safe(d.postal);
  tzEl.textContent = safe(d.timezone);

  gmap.src = `https://www.google.com/maps?q=${d.latitude},${d.longitude}&z=12&output=embed`;
  updateTime(d.timezone);
}

// Show local time
function updateTime(timezone) {
  if (!timezone) return;
  clearInterval(timeInterval);
  const tick = () => {
    const now = new Date();
    const options = {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      day: "2-digit",
      month: "short",
      year: "numeric",
    };
    localTimeEl.textContent = new Intl.DateTimeFormat("en-GB", options).format(now);
  };
  tick();
  timeInterval = setInterval(tick, 1000);
}

// Fetch post office list
async function fetchPostOffices(pincode) {
  postsContainer.innerHTML = "<p class='muted'>Loading post offices...</p>";
  try {
    const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
    const data = await res.json();
    const postData = data[0].PostOffice;
    postOffices = postData || [];
    postCountEl.textContent = postOffices.length;
    renderPostOffices(postOffices);
  } catch {
    postsContainer.innerHTML = "<p class='muted'>Failed to load post offices.</p>";
  }
}

// Render post offices
function renderPostOffices(list) {
  if (!list.length) {
    postsContainer.innerHTML = "<p class='muted'>No post offices found.</p>";
    return;
  }

  postsContainer.innerHTML = list
    .map(
      (p) => `
      <div class="post-item">
        <h5>${p.Name} <small>(${p.BranchType})</small></h5>
        <p>${p.District}, ${p.Division}</p>
        <p class="muted">PIN: ${p.Pincode}</p>
      </div>`
    )
    .join("");
}

// Filter search
searchBar.addEventListener("input", (e) => {
  const q = e.target.value.toLowerCase();
  const filtered = postOffices.filter(
    (p) =>
      p.Name.toLowerCase().includes(q) ||
      p.BranchType.toLowerCase().includes(q) ||
      p.District.toLowerCase().includes(q)
  );
  renderPostOffices(filtered);
});

// When user clicks "Get Started"
getStartedBtn.addEventListener("click", async () => {
  introSection.classList.add("hidden");
  mainApp.classList.remove("hidden");
  await fetchIPDetails(clientIP);
});

// Initialize
fetchClientIP();
