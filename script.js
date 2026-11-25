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

// Page Tour button guides visitors through the main sections.
const tourSections = [
  ["#home", "Welcome — this is my engineering portfolio."],
  ["#about", "A little about my background and engineering approach."],
  ["#experience", "My professional journey at EPAM Systems and Infosys."],
  ["#skills", "The technologies I work with and the areas I'm learning."],
  ["#projects", "Selected projects and experiments."],
  ["#contact", "Thanks for visiting — let's connect."]
];
let tourIndex = 0;
const tourButton = document.getElementById("pageTour");
const toast = document.getElementById("tourToast");
tourButton.addEventListener("click", () => {
  const [selector, message] = tourSections[tourIndex];
  document.querySelector(selector).scrollIntoView({ behavior: "smooth" });
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(window.__tourToastTimer);
  window.__tourToastTimer = window.setTimeout(() => toast.classList.remove("show"), 2400);
  tourIndex = (tourIndex + 1) % tourSections.length;
  tourButton.innerHTML = `<span>⊕</span> Page Tour ${tourIndex === 0 ? "↻" : `${tourIndex}/${tourSections.length}`}`;
});

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
