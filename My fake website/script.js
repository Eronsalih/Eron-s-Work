async function analyzeSite() {
  const url = document.getElementById("urlInput").value.trim();
  const resultBox = document.getElementById("resultBox");
  const messages = document.getElementById("messages");
  const riskLevel = document.getElementById("riskLevel");

  messages.innerHTML = "";
  riskLevel.innerHTML = "";
  resultBox.classList.remove("hidden");

  // Show loader
  messages.innerHTML =
    '<div class="loader"></div><p>Analyzing... Please wait.</p>';
  riskLevel.innerHTML = "";

  let score = 0;

  // Basic checks
  if (!url.startsWith("https://")) {
    score += 20;
    messages.innerHTML += `<p>❌ No HTTPS detected.</p>`;
  } else {
    messages.innerHTML += `<p>✅ Secure HTTPS connection.</p>`;
  }

  const scamWords = ["cheap", "discount", "superdeal", "luxury", "replica"];
  for (let word of scamWords) {
    if (url.toLowerCase().includes(word)) {
      score += 20;
      messages.innerHTML += `<p>⚠️ Found suspicious keyword: ${word}</p>`;
    }
  }

  if (url.length > 50) {
    score += 10;
    messages.innerHTML += `<p>⚠️ URL is unusually long.</p>`;
  }

  // Encode URL for VirusTotal API
  const apiKeyVT = "YOUR_VIRUSTOTAL_API_KEY"; // Replace with your VirusTotal API key
  const encodedURL = btoa(url);

  // Fetch VirusTotal data
  try {
    const res = await fetch(
      `https://www.virustotal.com/api/v3/urls/${encodedURL}`,
      {
        headers: { "x-apikey": apiKeyVT },
      }
    );

    if (!res.ok) throw new Error(`VirusTotal API error: ${res.status}`);

    const data = await res.json();
    const stats = data.data.attributes.last_analysis_stats;

    if (stats.malicious > 0 || stats.suspicious > 0) {
      score += 40;
      messages.innerHTML += `<p>❌ VirusTotal flagged this site by ${
        stats.malicious + stats.suspicious
      } engines.</p>`;
    } else {
      messages.innerHTML += `<p>✅ VirusTotal shows no threat.</p>`;
    }
  } catch (error) {
    messages.innerHTML += `<p>⚠️ Could not connect to VirusTotal API.</p>`;
  }

  // WHOIS API example (using a public free API)
  try {
    const domain = new URL(url).hostname;
    const whoisRes = await fetch(
      `https://jsonwhoisapi.com/api/v1/whois?identifier=${domain}`,
      {
        headers: {
          Authorization: "Token YOUR_WHOIS_API_KEY", // Replace with your WHOIS API key
        },
      }
    );

    if (!whoisRes.ok) throw new Error(`WHOIS API error: ${whoisRes.status}`);

    const whoisData = await whoisRes.json();

    if (whoisData.created_date) {
      const creationDate = new Date(whoisData.created_date);
      const ageDays =
        (Date.now() - creationDate.getTime()) / (1000 * 3600 * 24);

      messages.innerHTML += `<p>📅 Domain age: ${Math.floor(ageDays)} days</p>`;

      if (ageDays < 180) {
        // less than 6 months is suspicious
        score += 20;
        messages.innerHTML += `<p>⚠️ Domain age is very recent.</p>`;
      }
    }
  } catch (error) {
    messages.innerHTML += `<p>⚠️ Could not connect to WHOIS API.</p>`;
  }

  // Final risk level output
  if (score <= 30) {
    riskLevel.innerHTML = `<p class="safe">✅ Low Risk</p>`;
  } else if (score <= 60) {
    riskLevel.innerHTML = `<p class="warning">⚠️ Medium Risk</p>`;
  } else {
    riskLevel.innerHTML = `<p class="danger">❌ High Risk</p>`;
  }
}

document.getElementById("menu-toggle").addEventListener("click", () => {
  document.getElementById("nav-links").classList.toggle("open");
});

// Animate on scroll
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  },
  { threshold: 0.1 }
);

document.querySelectorAll("[data-animate]").forEach((section) => {
  observer.observe(section);
});
