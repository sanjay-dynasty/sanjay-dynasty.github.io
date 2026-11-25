// Animated particle network in the hero, inspired by the supplied reference.
(() => {
  const canvas = document.getElementById("networkCanvas");
  const ctx = canvas.getContext("2d");
  let width = 0, height = 0, particles = [], dpr = 1;
  const colors = ["rgba(243,33,43,.78)", "rgba(75,72,68,.58)", "rgba(243,33,43,.42)"];
  const pointer = { x: -1000, y: -1000 };

  function resize() {
    const rect = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = rect.width; height = rect.height;
    canvas.width = width * dpr; canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.max(35, Math.min(85, Math.floor(width / 14)));
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * width, y: Math.random() * height,
      vx: (Math.random() - .5) * .24, vy: (Math.random() - .5) * .24,
      r: Math.random() * 1.7 + 1, color: colors[Math.floor(Math.random() * colors.length)]
    }));
  }
  function draw() {
    ctx.clearRect(0, 0, width, height);
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx; p.y += p.vy;
      if (p.x < -10 || p.x > width + 10) p.vx *= -1;
      if (p.y < -10 || p.y > height + 10) p.vy *= -1;
      const dx = p.x - pointer.x, dy = p.y - pointer.y;
      if (dx * dx + dy * dy < 12000) { p.x += dx * .0008; p.y += dy * .0008; }
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color; ctx.fill();
      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j], x = p.x - q.x, y = p.y - q.y, dist = Math.sqrt(x*x + y*y);
        if (dist < 135) {
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(115,105,94,${(1 - dist / 135) * .23})`;
          ctx.lineWidth = .7; ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }
  canvas.addEventListener("mousemove", e => { const r = canvas.getBoundingClientRect(); pointer.x = e.clientX-r.left; pointer.y = e.clientY-r.top; });
  canvas.addEventListener("mouseleave", () => { pointer.x = pointer.y = -1000; });
  window.addEventListener("resize", resize);
  resize(); draw();
})();

// Mobile navigation
const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");
menuToggle.addEventListener("click", () => {
  const open = mainNav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(open));
  menuToggle.textContent = open ? "×" : "☰";
});
mainNav.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
  mainNav.classList.remove("open"); menuToggle.setAttribute("aria-expanded", "false"); menuToggle.textContent = "☰";
}));

// Scroll reveal, active progress bar, and custom cursor.
const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
  if (entry.isIntersecting) { entry.target.classList.add("visible"); revealObserver.unobserve(entry.target); }
}), { threshold: .12 });
document.querySelectorAll(".reveal").forEach(el => revealObserver.observe(el));

const progress = document.getElementById("scrollProgress");
window.addEventListener("scroll", () => {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.width = `${max > 0 ? window.scrollY / max * 100 : 0}%`;
}, { passive: true });

const cursor = document.getElementById("cursorRing");
if (window.matchMedia("(pointer:fine)").matches) {
  cursor.style.display = "block";
  window.addEventListener("mousemove", e => { cursor.style.left = `${e.clientX}px`; cursor.style.top = `${e.clientY}px`; });
  document.querySelectorAll("a,button").forEach(el => {
    el.addEventListener("mouseenter", () => cursor.classList.add("hover"));
    el.addEventListener("mouseleave", () => cursor.classList.remove("hover"));
  });
}

// Build Tour: visual simulation of several specialist agents inspecting/building page blocks.
const tourButton = document.getElementById("pageTour");
const tourToast = document.getElementById("tourToast");
const agentStatusMessage = document.getElementById("agentStatusMessage");
const agentStatusCount = document.getElementById("agentStatusCount");
const tourSteps = [
  { selector: ".hero-content", label: "HERO / CONTENT AGENT", message: "Composing the introduction and call-to-action", section: "#home" },
  { selector: ".about-copy", label: "ABOUT / CONTENT AGENT", message: "Structuring profile content and story", section: "#about" },
  { selector: ".experience-list", label: "EXPERIENCE / DATA AGENT", message: "Arranging career timeline blocks", section: "#experience" },
  { selector: ".stack-track", label: "SKILLS / UI AGENT", message: "Grouping technologies into skill modules", section: "#skills" },
  { selector: ".projects-grid", label: "PROJECTS / BUILD AGENT", message: "Composing project cards and metadata", section: "#projects" },
  { selector: ".contact-actions", label: "CONTACT / INTEGRATION AGENT", message: "Connecting contact actions and profile links", section: "#contact" }
];
let tourRunning = false;
let tourTimers = [];
let activeHighlights = [];

function clearAgentTour() {
  tourTimers.forEach(t => clearTimeout(t));
  tourTimers = [];
  activeHighlights.forEach(el => {
    el.classList.remove("agent-highlight", "agent-done");
    el.removeAttribute("data-agent-label");
  });
  activeHighlights = [];
  document.body.classList.remove("agent-tour-active");
  tourRunning = false;
  tourButton.innerHTML = '<span>✣</span> Build Tour';
  agentStatusMessage.textContent = "Agents ready";
  agentStatusCount.textContent = "0 / 6";
}

function runAgentTour() {
  if (tourRunning) { clearAgentTour(); return; }
  tourRunning = true;
  document.body.classList.add("agent-tour-active");
  tourButton.innerHTML = '<span>×</span> Stop Tour';
  const allCursors = document.querySelectorAll(".agent-cursor");
  allCursors.forEach((cursor, i) => {
    cursor.style.animationPlayState = "running";
    cursor.style.animationDelay = `${i * .15}s`;
  });

  tourSteps.forEach((step, index) => {
    const timer = setTimeout(() => {
      if (!tourRunning) return;
      const el = document.querySelector(step.selector);
      if (!el) return;
      activeHighlights.forEach(previous => previous.classList.add("agent-done"));
      el.classList.add("agent-highlight");
      el.setAttribute("data-agent-label", step.label);
      activeHighlights.push(el);
      agentStatusMessage.textContent = step.message;
      agentStatusCount.textContent = `${index + 1} / ${tourSteps.length}`;
      tourToast.textContent = step.message;
      tourToast.classList.add("show");
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }, index * 2600 + 350);
    tourTimers.push(timer);
  });

  const finishTimer = setTimeout(() => {
    if (!tourRunning) return;
    agentStatusMessage.textContent = "Build sequence complete";
    agentStatusCount.textContent = "6 / 6";
    tourToast.textContent = "All portfolio sections assembled — tour complete.";
    tourToast.classList.add("show");
    const finalTimer = setTimeout(() => {
      if (!tourRunning) return;
      clearAgentTour();
      tourToast.classList.remove("show");
      document.querySelector("#home").scrollIntoView({ behavior: "smooth" });
    }, 2300);
    tourTimers.push(finalTimer);
  }, tourSteps.length * 2600 + 500);
  tourTimers.push(finishTimer);
}
tourButton.addEventListener("click", runAgentTour);

// Personalize links here before publishing.
const PROFILE = {
  linkedin: "",              // e.g. https://www.linkedin.com/in/your-profile/
  email: "",                 // e.g. sanjay@example.com
  resume: ""                 // e.g. ./Sanjay-Kumar-Resume.pdf
};
const setLink = (id, url, fallbackMessage) => {
  const el = document.getElementById(id);
  if (!el) return;
  if (url) el.href = url;
  else el.addEventListener("click", e => { e.preventDefault(); alert(fallbackMessage); });
};
["linkedinTop", "footerLinkedin"].forEach(id => setLink(id, PROFILE.linkedin, "Add your LinkedIn URL in script.js."));
["emailTop", "emailButton", "talkButton", "footerEmail"].forEach(id => setLink(id, PROFILE.email ? `mailto:${PROFILE.email}` : "", "Add your email address in script.js."));
["resumeButton", "footerResume"].forEach(id => setLink(id, PROFILE.resume, "Add your resume PDF path in script.js."));
if (PROFILE.email) document.getElementById("footerEmail").textContent = PROFILE.email;
document.getElementById("year").textContent = new Date().getFullYear();
