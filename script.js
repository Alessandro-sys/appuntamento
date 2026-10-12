// Personalizza qui i tre film e i dettagli dell’appuntamento.
// Per le immagini usa percorsi relativi, ad esempio: "./images/film-1.jpg".
const CONFIG = {
  films: [
    { title: "Parto Col Folle", image: "https://m.media-amazon.com/images/I/71zxwIVg4DL._AC_UF894,1000_QL80_.jpg", description: "Per un paio di risate", symbol: "♡", caption: "" },
    { title: "Shrek", image: "https://m.media-amazon.com/images/M/MV5BN2FkMTRkNTUtYTI0NC00ZjI4LWI5MzUtMDFmOGY0NmU2OGY1XkEyXkFqcGc@._V1_.jpg", description: "C'era una volta una principessa bellissima...", symbol: "✧", caption: "" },
    { title: "Indiana Jones", image: "https://play-lh.googleusercontent.com/ydQZbf4GngsHvP4IbT_uo5ad-Q5V3aNj91crxK7Pm6r00d5RL0sxmy7F7xsbx0bHszskwQ", description: "Devo farmi una cultura", symbol: "☾", caption: "" },
  ],
  date: "2026-10-16", // Formato AAAA-MM-GG, ad esempio "2026-11-14".
  time: "21:00", // Formato HH:MM, ad esempio "20:30".
  greeting: "Non vedo l’ora. A presto.",
};

const screens = [...document.querySelectorAll("main > section")];
const steps = [...document.querySelectorAll(".progress li")];
const noButton = document.querySelector("#no-button");
const yesButton = document.querySelector("#yes-button");
const answerArea = document.querySelector("#answer-area");

function showScreen(id, step) {
  screens.forEach((screen) => { screen.hidden = screen.id !== id; });
  steps.forEach((item, index) => {
    item.classList.toggle("active", index === step);
    item.classList.toggle("completed", index < step);
    if (index === step) item.setAttribute("aria-current", "step");
    else item.removeAttribute("aria-current");
  });
  document.querySelector(`#${id} h1`).focus({ preventScroll: true });
  window.scrollTo({ top: 0, behavior: "instant" });
}

// Il “No” resta nell’area dei pulsanti e non copre mai il “Sì”.
function dodgeNo(event) {
  if (event) event.preventDefault();
  const area = answerArea.getBoundingClientRect();
  const yes = yesButton.getBoundingClientRect();
  const no = noButton.getBoundingClientRect();
  const maxX = Math.max(0, area.width - no.width);
  const maxY = Math.max(0, area.height - no.height);
  const candidates = [];

  for (let x = 0; x <= maxX; x += 8) {
    for (let y = 0; y <= maxY; y += 8) {
      const left = area.left + x;
      const top = area.top + y;
      const overlapsYes = left < yes.right + 8 && left + no.width > yes.left - 8 && top < yes.bottom + 8 && top + no.height > yes.top - 8;
      const underPointer = event && Number.isFinite(event.clientX) && event.clientX >= left - 12 && event.clientX <= left + no.width + 12 && event.clientY >= top - 12 && event.clientY <= top + no.height + 12;
      if (!overlapsYes && !underPointer) {
        candidates.push({ x, y, distance: Math.hypot(left - no.left, top - no.top) });
      }
    }
  }

  candidates.sort((a, b) => b.distance - a.distance);
  const farthest = candidates.slice(0, Math.max(1, Math.ceil(candidates.length / 5)));
  const position = farthest[Math.floor(Math.random() * farthest.length)];
  if (!position) return;
  noButton.style.left = `${position.x}px`;
  noButton.style.top = `${position.y}px`;
  noButton.style.right = "auto";
}

noButton.addEventListener("pointerenter", dodgeNo);
noButton.addEventListener("pointerdown", dodgeNo);
noButton.addEventListener("click", dodgeNo);
noButton.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") dodgeNo(event);
});
window.addEventListener("resize", () => {
  noButton.style.removeProperty("left");
  noButton.style.removeProperty("top");
  noButton.style.removeProperty("right");
});

yesButton.addEventListener("click", () => showScreen("films", 1));
document.querySelector("#continue-button").addEventListener("click", () => showScreen("date", 2));

const posterStyles = ["one", "two", "three"];
CONFIG.films.forEach((film, index) => {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "film-option";
  button.setAttribute("aria-label", `Scegli ${film.title}`);

  const poster = document.createElement("span");
  poster.className = `poster poster-${posterStyles[index]}`;
  poster.setAttribute("aria-hidden", "true");
  const symbol = document.createElement("span");
  symbol.className = "poster-symbol";
  symbol.textContent = film.symbol;
  const caption = document.createElement("span");
  caption.className = "poster-caption";
  caption.textContent = film.caption;
  poster.append(symbol, caption);

  if (film.image) {
    const image = document.createElement("img");
    image.src = film.image;
    image.alt = "";
    image.addEventListener("error", () => image.remove());
    poster.append(image);
  }

  const title = document.createElement("span");
  title.className = "film-title";
  title.textContent = film.title;
  const arrow = document.createElement("span");
  arrow.textContent = "↗";
  arrow.setAttribute("aria-hidden", "true");
  title.append(arrow);
  const description = document.createElement("span");
  description.className = "film-description";
  description.textContent = film.description;
  button.append(poster, title, description);
  button.addEventListener("click", () => {
    document.querySelector("#chosen-film").textContent = `La tua scelta: ${film.title}`;
    document.querySelector("#film-summary").textContent = film.title;
    showScreen("reaction", 1);
  });
  document.querySelector("#film-grid").append(button);
});

if (CONFIG.date) {
  const date = new Date(`${CONFIG.date}T12:00:00`);
  if (!Number.isNaN(date.getTime())) {
    document.querySelector("#date-value").textContent = new Intl.DateTimeFormat("it-IT", {
      day: "numeric", month: "long", year: "numeric",
    }).format(date);
  }
}
if (CONFIG.time) document.querySelector("#time-value").textContent = CONFIG.time;
document.querySelector("#greeting").textContent = CONFIG.greeting;
