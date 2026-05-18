const canvas = document.querySelector("#signalCanvas");
const ctx = canvas.getContext("2d");
const navLinks = [...document.querySelectorAll(".nav-links a")];
const sections = navLinks.map((link) => document.querySelector(link.getAttribute("href"))).filter(Boolean);
let width = 0;
let height = 0;
let nodes = [];
let pointer = { x: 0, y: 0, active: false };

const palette = ["#0a7c86", "#ff6b4a", "#87b64b", "#f3be32", "#6254c8"];

function resizeCanvas() {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width * ratio;
  canvas.height = height * ratio;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

  const count = width < 720 ? 34 : 64;
  nodes = Array.from({ length: count }, (_, index) => ({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.36,
    vy: (Math.random() - 0.5) * 0.36,
    color: palette[index % palette.length],
    size: 1.8 + Math.random() * 2.4
  }));
}

function drawSignalField() {
  ctx.clearRect(0, 0, width, height);
  ctx.globalCompositeOperation = "source-over";

  for (const node of nodes) {
    node.x += node.vx;
    node.y += node.vy;

    if (node.x < 0 || node.x > width) node.vx *= -1;
    if (node.y < 0 || node.y > height) node.vy *= -1;

    const pointerDistance = Math.hypot(node.x - pointer.x, node.y - pointer.y);
    if (pointer.active && pointerDistance < 150) {
      node.x += (node.x - pointer.x) * 0.003;
      node.y += (node.y - pointer.y) * 0.003;
    }
  }

  for (let i = 0; i < nodes.length; i += 1) {
    for (let j = i + 1; j < nodes.length; j += 1) {
      const a = nodes[i];
      const b = nodes[j];
      const distance = Math.hypot(a.x - b.x, a.y - b.y);
      if (distance < 138) {
        ctx.strokeStyle = `rgba(17, 19, 22, ${0.16 * (1 - distance / 138)})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }
  }

  for (const node of nodes) {
    ctx.fillStyle = node.color;
    ctx.beginPath();
    ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
    ctx.fill();
  }

  requestAnimationFrame(drawSignalField);
}

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.16 }
);

document.querySelectorAll("[data-reveal]").forEach((element) => revealObserver.observe(element));

const navObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      const link = navLinks.find((item) => item.getAttribute("href") === `#${entry.target.id}`);
      if (entry.isIntersecting && link) {
        navLinks.forEach((item) => item.classList.remove("active"));
        link.classList.add("active");
      }
    });
  },
  { rootMargin: "-42% 0px -48% 0px" }
);

sections.forEach((section) => navObserver.observe(section));

window.addEventListener("mousemove", (event) => {
  pointer = { x: event.clientX, y: event.clientY, active: true };
});

window.addEventListener("mouseleave", () => {
  pointer.active = false;
});

window.addEventListener("resize", resizeCanvas);

resizeCanvas();
drawSignalField();
