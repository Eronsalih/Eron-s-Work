function openInNewTab(url) {
  window.open(url, "_blank", "noopener");
}
const yearEl = document.getElementById("year");
yearEl.textContent = new Date().getFullYear();

// ---------- Theme toggle ----------
const themeToggle = document.getElementById("themeToggle");
const root = document.documentElement;
(function initTheme() {
  const saved =
    localStorage.getItem("theme") ||
    (window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light");
  setTheme(saved);
})();
function setTheme(val) {
  if (val === "dark") {
    root.setAttribute("data-theme", "dark");
    themeToggle.textContent = "☀️ Light";
    themeToggle.setAttribute("aria-pressed", "true");
    localStorage.setItem("theme", "dark");
  } else {
    root.setAttribute("data-theme", "light");
    themeToggle.textContent = "🌙 Theme";
    themeToggle.setAttribute("aria-pressed", "false");
    localStorage.setItem("theme", "light");
  }
}
themeToggle.addEventListener("click", () =>
  setTheme(root.getAttribute("data-theme") === "dark" ? "light" : "dark")
);

// ---------- Responsive nav ----------
const burger = document.getElementById("burger");
const navList = document.getElementById("navList");
burger.addEventListener("click", () => navList.classList.toggle("show"));
// close menu on nav click in mobile
document
  .querySelectorAll(".nav-link")
  .forEach((a) =>
    a.addEventListener("click", () => navList.classList.remove("show"))
  );

// ---------- Smooth active nav ----------
const navLinks = document.querySelectorAll(".nav-link");
const sections = Array.from(document.querySelectorAll("main section"));
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        document
          .querySelectorAll(".nav-link")
          .forEach((l) =>
            l.classList.toggle(
              "active",
              l.getAttribute("href") === "#" + entry.target.id
            )
          );
      }
    });
  },
  { threshold: 0.45 }
);
sections.forEach((s) => observer.observe(s));

// ---------- Reveal on scroll ----------
const reveals = document.querySelectorAll(".reveal");
const revealObs = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("visible");
        revealObs.unobserve(e.target);
      }
    });
  },
  { threshold: 0.18 }
);
reveals.forEach((r) => revealObs.observe(r));

// ---------- Skills fill animation ----------
document.querySelectorAll(".skill-fill").forEach((el) => {
  const target = el.getAttribute("data-fill") || "70%";
  setTimeout(() => (el.style.width = target), 400);
});

// ---------- Projects data & rendering ----------
const projects = [
  {
    id: 1,
    title: "Portfolio Pro (This Site)",
    tags: ["web", "design"],
    desc: "Advanced portfolio combining projects + tutorials + playground.",
    img: "",
    links: { code: "#", live: "#" },
  },
  {
    id: 2,
    title: "FakeShop Detector (Demo)",
    tags: ["tool", "web"],
    desc: "Mock security checks for e-shops (WHOIS/SSL ideas).",
    img: "",
    links: { code: "#", live: "#" },
  },
  {
    id: 3,
    title: "Expense Tracker (Mini App)",
    tags: ["web", "tool"],
    desc: "Client-side expense tracker with charts.",
    img: "",
    links: { code: "#", live: "#" },
  },
  {
    id: 4,
    title: "Photo Gallery",
    tags: ["design"],
    desc: "Responsive gallery with modal viewer and lazy load.",
    img: "",
    links: { code: "#", live: "#" },
  },
];
const projectsGrid = document.getElementById("projectsGrid");
function renderProjects(filter = "all") {
  projectsGrid.innerHTML = "";
  const filtered = projects.filter((p) =>
    filter === "all" ? true : p.tags.includes(filter)
  );
  filtered.forEach((p) => {
    const el = document.createElement("article");
    el.className = "card project-card";
    el.setAttribute("tabindex", 0);
    el.innerHTML = `
          <div style="display:flex;justify-content:space-between;align-items:center">
            <div style="font-weight:700">${escapeHtml(p.title)}</div>
            <div class="project-meta small muted">${p.tags.join(" • ")}</div>
          </div>
          <div class="small muted" style="margin-top:8px">${escapeHtml(
            p.desc
          )}</div>
          <div style="margin-top:auto;display:flex;gap:8px;align-items:center;justify-content:flex-end">
            <button class="chip" onclick="openProject(${p.id})">Preview</button>
            <a class="chip" href="${
              p.links.code
            }" onclick="event.stopPropagation();openInNewTab('${
      p.links.code
    }')">Code</a>
          </div>
        `;
    el.addEventListener("click", () => openProject(p.id));
    projectsGrid.appendChild(el);
  });
}
renderProjects();

// filter chips
document.querySelectorAll(".chip[data-filter]").forEach((ch) => {
  ch.addEventListener("click", () => {
    document
      .querySelectorAll(".chip[data-filter]")
      .forEach((c) => (c.style.boxShadow = "none"));
    ch.style.boxShadow = "inset 0 0 0 2px rgba(0,0,0,0.04)";
    renderProjects(ch.dataset.filter);
  });
});

// ---------- Modal logic ----------
const modalBackdrop = document.getElementById("modalBackdrop");
const modalTitle = document.getElementById("modalTitle");
const modalBody = document.getElementById("modalBody");
function openProject(id) {
  const p = projects.find((x) => x.id === id);
  if (!p) return;
  modalTitle.textContent = p.title;
  modalBody.innerHTML = `
        <div style="display:grid;gap:12px">
          <div style="font-weight:700">${escapeHtml(p.title)}</div>
          <div class="small muted">${escapeHtml(p.desc)}</div>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            ${p.tags.map((t) => `<div class="chip">${t}</div>`).join("")}
          </div>
          <div style="margin-top:12px">${renderProjectPreview(p)}</div>
        </div>
      `;
  showModal();
}
function renderProjectPreview(p) {
  // For demo, we show a code sample and quick links. Replace with screenshots or embed.
  return `<pre style="background:rgba(0,0,0,0.02);padding:10px;border-radius:8px;overflow:auto"><code>// Project: ${escapeHtml(
    p.title
  )}\n// Description: ${escapeHtml(
    p.desc
  )}\n// Add screenshots, live demo, or README here.</code></pre>
      <div style="display:flex;gap:8px;margin-top:10px"><a class="chip" href="${
        p.links.live
      }" onclick="openInNewTab('${
    p.links.live
  }')">Open Live</a><a class="chip" href="${
    p.links.code
  }" onclick="openInNewTab('${p.links.code}')">View Code</a></div>`;
}
function showModal() {
  modalBackdrop.classList.add("show");
  modalBackdrop.setAttribute("aria-hidden", "false");
}
function closeModal() {
  modalBackdrop.classList.remove("show");
  modalBackdrop.setAttribute("aria-hidden", "true");
}
modalBackdrop.addEventListener("click", (e) => {
  if (e.target === modalBackdrop) closeModal();
});

// ---------- Tutorials data & rendering ----------
const lessons = [
  {
    id: 1,
    title: "HTML: Semantic & Accessible Layouts",
    tags: ["html", "beginner"],
    difficulty: "beginner",
    content:
      "<p>Learn how to use semantic elements: &lt;header&gt;, &lt;main&gt;, &lt;section&gt;, &lt;article&gt; and more. Include ARIA when necessary.</p>",
  },
  {
    id: 2,
    title: "CSS: Modern Responsive Layouts",
    tags: ["css", "intermediate"],
    difficulty: "intermediate",
    content:
      "<p>Flexbox, Grid, responsive units, container queries (where available), and practical patterns.</p>",
  },
  {
    id: 3,
    title: "JS: DOM & Event Patterns",
    tags: ["js", "intermediate"],
    difficulty: "intermediate",
    content:
      "<p>Event delegation, stateful components, and building small interactive UI patterns.</p>",
  },
  {
    id: 4,
    title: "React: Functional Components & Hooks",
    tags: ["react", "Advanced"],
    difficulty: "advanced",
    content:
      "<p>Building components with hooks, managing state, effects, and context.</p>",
  },
  {
    id: 5,
    title: "Quiz App: Building a Mini Project",
    tags: ["js", "Intermediate-Advanced"],
    difficulty: "intermediate-advanced",
    content:
      "<p>Step-by-step guide to building a quiz app with vanilla JS, focusing on structure, state management, and user feedback.</p>",
  },
  {
    id: 6,
    title: "Node.js: Simple REST API",
    tags: ["node", "beginner"],
    difficulty: "beginner",
    content:
      "<p>Setting up a basic Express server, defining routes, and handling JSON data.</p>",
  },
  {
    id: 7,
    title: "Version Control: Git Basics",
    tags: ["git", "intermediate"],
    difficulty: "intermediate",
    content:
      "<p>Core Git commands, branching strategies, and collaborating with GitHub.</p>",
  },
  {
    id: 8,
    title: "Full-Stack: Connecting Frontend & Backend",
    tags: ["full-stack", "advanced"],
    difficulty: "advanced",
    content:
      "<p>Building a simple full-stack app with a React frontend and Node.js backend, focusing on API integration and state management.</p>",
  },
  {
    id: 9,
    title: "Python: Basics for Web Dev",
    tags: ["python", "beginner"],
    difficulty: "beginner",
    content:
      "<p>Python syntax, data structures, and writing simple scripts for web tasks.</p>",
  },
];
const tutorialGrid = document.getElementById("tutorialGrid");
function renderLessons(filterText = "", difficulty = "all") {
  tutorialGrid.innerHTML = "";
  const ft = filterText.trim().toLowerCase();
  const list = lessons.filter((l) => {
    if (difficulty !== "all" && l.difficulty !== difficulty) return false;
    if (!ft) return true;
    return (l.title + " " + l.tags.join(" ")).toLowerCase().includes(ft);
  });
  list.forEach((l) => {
    const el = document.createElement("article");
    el.className = "card lesson-card";
    el.innerHTML = `
          <div style="display:flex;justify-content:space-between;align-items:center">
            <div style="font-weight:700">${escapeHtml(l.title)}</div>
            <div class="small muted">${escapeHtml(l.difficulty)}</div>
          </div>
          <div class="lesson-tags">${l.tags
            .map((t) => `<span class="chip">${t}</span>`)
            .join("")}</div>
          <div style="margin-top:auto;display:flex;justify-content:flex-end"><button class="chip" onclick="openLesson(${
            l.id
          })">Open Lesson</button></div>
        `;
    tutorialGrid.appendChild(el);
  });
}
renderLessons();

document
  .getElementById("lessonSearch")
  .addEventListener("input", (e) =>
    renderLessons(
      e.target.value,
      document.getElementById("difficultyFilter").value
    )
  );
document
  .getElementById("difficultyFilter")
  .addEventListener("change", (e) =>
    renderLessons(document.getElementById("lessonSearch").value, e.target.value)
  );

// open lesson in modal

function openLesson(id) {
  const l = lessons.find((x) => x.id === id);
  if (!l) return;
  modalTitle.textContent = l.title;
  modalBody.innerHTML = `
        <div style="display:grid;gap:12px">
          <div class="small muted">Difficulty: ${escapeHtml(l.difficulty)}</div>
          <div>${l.content}</div>
          <hr>
          <div style="font-weight:700">Live Example</div>
          <div style="font-size:13px" class="muted">Use the playground to the right to test code for this lesson.</div>
          <div style="margin-top:8px">
            <textarea id="lessonCode" style="width:100%;height:160px;border-radius:8px;border:1px solid rgba(0,0,0,0.06);padding:8px">// Try small HTML / JS for the lesson</textarea>
            <div style="display:flex;gap:8px;margin-top:8px">
              <button class="btn primary" onclick="runLessonPreview()">Run</button>
              <button class="btn ghost" onclick="document.getElementById('lessonCode').value = ''">Clear</button>
            </div>
            <iframe id="lessonPreview" style="width:100%;height:200px;border-radius:8px;border:1px solid rgba(0,0,0,0.06);margin-top:8px" sandbox="allow-scripts"></iframe>
          </div>
        </div>
      `;
  showModal();
}

// ---------- Playground run ----------
function runPreview() {
  const code = document.getElementById("playJs").value;
  const iframe = document.getElementById("playPreview");
  const html = `<!doctype html><html><head><meta charset="utf-8"></head><body><script>try{${code}}catch(e){document.body.innerText = 'Error: '+e}</script></body></html>`;
  iframe.srcdoc = html;
}
function runLessonPreview() {
  const code = document.getElementById("lessonCode")?.value || "";
  const iframe = document.getElementById("lessonPreview");
  if (!iframe) return;
  iframe.srcdoc = `<!doctype html><html><head><meta charset="utf-8"></head><body><script>try{${code}}catch(e){document.body.innerText='Error: '+e}</script></body></html>`;
}
function openPlay(kind) {
  // sample starter code for quick demos
  const presets = {
    quiz: "const q = ['2+2=?','3+4=?']; document.body.innerHTML = '<h3>Mini Quiz</h3>';",
    expense:
      "document.body.innerHTML = '<h3>Expense Tracker (placeholder)</h3><p>Add items in code to test UI</p>'",
    custom:
      "// Write custom JS to render in preview\ndocument.body.innerHTML = '<h3>Hello sandbox</h3>';",
  };
  document.getElementById("playJs").value = presets[kind] || presets.custom;
  runPreview();
  window.scrollTo({
    top: document.getElementById("playground").offsetTop - 70,
    behavior: "smooth",
  });
}

// ---------- Contact (scaffold) ----------
document.getElementById("contactForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const f = new FormData(e.target);
  const data = Object.fromEntries(f.entries());
  // Replace with EmailJS / Formspree / your backend:
  // Example for Formspree: POST to https://formspree.io/f/{your_id} with JSON
  // Here we simulate success:
  document.getElementById("contactResult").textContent = "Sending...";
  try {
    await new Promise((r) => setTimeout(r, 700));
    document.getElementById("contactResult").textContent =
      "Message sent — I will get back to you soon.";
    e.target.reset();
  } catch (err) {
    document.getElementById("contactResult").textContent =
      "Error sending message. Try again later.";
  }
});

// ---------- CV / Download placeholder ----------
document.getElementById("downloadCv").addEventListener("click", (e) => {
  e.preventDefault();
  // Create a small PDF / text resume programmatically OR link to actual file in your repo
  // For demo, create and download a simple txt resume
  const resume = `Eron Salihu - Developer\nExperience: ...\nSkills: HTML, CSS, JS, React, Node\nPortfolio: https://github.com/yourname`;
  const blob = new Blob([resume], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "Eron_Salihu_Resume.txt";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
});

document
  .getElementById("cvBtn")
  .addEventListener("click", () =>
    document.getElementById("downloadCv").click()
  );

// ---------- Small helpers ----------
function escapeHtml(str) {
  return (str + "").replace(
    /[&<>"']/g,
    (m) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[
        m
      ])
  );
}

// Keyboard: Esc to close modal
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});

// ---------- Initial render tweaks ----------
// make certain elements reveal
document
  .querySelectorAll(".card")
  .forEach((c, i) => setTimeout(() => c.classList.add("reveal"), 120 * i));

function runCode() {
  const codeElement = document.getElementById("user-code");
  const code = codeElement.innerText;
  const output = document.getElementById("output");

  try {
    const result = eval(code);
    output.innerText =
      result !== undefined ? result : "✓ Code executed successfully";
  } catch (err) {
    output.innerText = "❌ Error: " + err.message;
  }
}
