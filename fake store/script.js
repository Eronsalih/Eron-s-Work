function analyzeSite() {
  const url = document.getElementById("urlInput").value.trim();
  const resultBox = document.getElementById("resultBox");
  const messages = document.getElementById("messages");
  const riskLevel = document.getElementById("riskLevel");

  messages.innerHTML = "";
  riskLevel.innerHTML = "";
  resultBox.classList.remove("hidden");

  let score = 0;

  // HTTPS Check
  if (!url.startsWith("https://")) {
    score += 20;
    messages.innerHTML += `<p>❌ No HTTPS detected.</p>`;
  } else {
    messages.innerHTML += `<p>✅ Secure connection (HTTPS).</p>`;
  }

  // Suspicious domain check
  const badTLDs = [".xyz", ".shop", ".top", ".buzz"];
  badTLDs.forEach((tld) => {
    if (url.includes(tld)) {
      score += 15;
      messages.innerHTML += `<p>⚠️ Suspicious domain extension: ${tld}</p>`;
    }
  });

  // Keyword Check
  const scamWords = [
    "cheap",
    "outlet",
    "superdeal",
    "discount",
    "luxury",
    "replica",
  ];
  for (let word of scamWords) {
    if (url.toLowerCase().includes(word)) {
      score += 20;
      messages.innerHTML += `<p>⚠️ Found suspicious keyword: "${word}"</p>`;
    }
  }

  // Length & URL complexity
  if (url.length > 60) {
    score += 10;
    messages.innerHTML += `<p>⚠️ URL is unusually long or complex.</p>`;
  }

  // Contact info check (mock for now)
  const fakeContactMissing = true; // Simulate missing contact page
  if (fakeContactMissing) {
    score += 25;
    messages.innerHTML += `<p>❌ Contact or company info is missing.</p>`;
  }

  // Display Final Risk
  if (score <= 30) {
    riskLevel.innerHTML = `<p class="safe">✅ Low Risk. The site looks fine.</p>`;
  } else if (score <= 60) {
    riskLevel.innerHTML = `<p class="warning">⚠️ Medium Risk. Be cautious.</p>`;
  } else {
    riskLevel.innerHTML = `<p class="danger">❌ High Risk. This may be a scam site!</p>`;
  }
}
function resetForm() {
  document.getElementById("urlInput").value = "";
  document.getElementById("resultBox").classList.add("hidden");
  document.getElementById("messages").innerHTML = "";
  document.getElementById("riskLevel").innerHTML = "";
}
