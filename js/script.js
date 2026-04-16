const cursor = document.getElementById("cursor");
const ring = document.getElementById("cursor-ring");

function bindCursorTargets() {
  if (!ring || !window.matchMedia("(hover: hover)").matches) {
    return;
  }

  document
    .querySelectorAll("a, button, .skill-card, .interest-tag, .contact-link, .recordings-button, .recording-card")
    .forEach((element) => {
      if (element.dataset.cursorBound === "true") {
        return;
      }

      element.dataset.cursorBound = "true";
      element.addEventListener("mouseenter", () => {
        ring.style.width = "60px";
        ring.style.height = "60px";
        ring.style.opacity = "0.3";
      });
      element.addEventListener("mouseleave", () => {
        ring.style.width = "36px";
        ring.style.height = "36px";
        ring.style.opacity = "0.5";
      });
    });
}

if (cursor && ring && window.matchMedia("(hover: hover)").matches) {
  let mouseX = 0;
  let mouseY = 0;
  let ringX = 0;
  let ringY = 0;

  document.addEventListener("mousemove", (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
    cursor.style.left = `${mouseX}px`;
    cursor.style.top = `${mouseY}px`;
  });

  function animateRing() {
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    ring.style.left = `${ringX}px`;
    ring.style.top = `${ringY}px`;
    requestAnimationFrame(animateRing);
  }

  animateRing();
}

bindCursorTargets();

const waveform = document.getElementById("waveform");

if (waveform) {
  const heights = [8, 14, 22, 32, 40, 48, 44, 36, 28, 18, 10, 16, 28, 42, 52, 44, 34, 22, 14, 10, 18, 30, 46, 52, 42, 32, 20, 12, 8, 16, 26, 40, 50, 46, 36, 22, 12, 8];
  const delays = [0, 0.1, 0.2, 0.3, 0.2, 0.15, 0.25, 0.1, 0.2, 0.3, 0.1, 0.2, 0.15, 0.25, 0.05, 0.2, 0.3, 0.15, 0.1, 0.25, 0.2, 0.1, 0.3, 0.15, 0.25, 0.1, 0.2, 0.3, 0.2, 0.15, 0.1, 0.25, 0.05, 0.2, 0.15, 0.3, 0.1, 0.2];

  heights.forEach((height, index) => {
    const bar = document.createElement("div");
    bar.className = "bar";
    bar.style.setProperty("--h", `${height}px`);
    bar.style.setProperty("--d", `${0.6 + Math.random() * 0.8}s`);
    bar.style.animationDelay = `${delays[index % delays.length]}s`;
    waveform.appendChild(bar);
  });
}

const waveSvg = document.getElementById("wave-svg");

if (waveSvg) {
  function drawWave() {
    const time = Date.now() / 1000;
    const width = 1200;
    const height = 600;
    const points = [];

    for (let x = 0; x <= width; x += 6) {
      const y =
        height / 2 +
        Math.sin(x / 80 + time * 0.8) * 80 +
        Math.sin(x / 40 + time * 1.3) * 40 +
        Math.sin(x / 25 + time * 0.5) * 20;
      points.push(`${x},${y.toFixed(1)}`);
    }

    waveSvg.setAttribute("points", points.join(" "));
    requestAnimationFrame(drawWave);
  }

  drawWave();
}

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  },
  { threshold: 0.1, rootMargin: "0px 0px -60px 0px" }
);

document.querySelectorAll(".reveal, .exp-item").forEach((element) => observer.observe(element));

const languageObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.querySelectorAll(".lang-fill").forEach((fill) => fill.classList.add("animated"));
      }
    });
  },
  { threshold: 0.3 }
);

document.querySelectorAll("#langues").forEach((element) => languageObserver.observe(element));

const recordingsGrid = document.getElementById("recordings-grid");
const recordingsInput = document.getElementById("recordings-input");
const localRecordings = [];
const objectUrls = [];
let activePlayer = null;

const featuredRecordings = [
  // Pour publier des démos définitives, ajoutez vos fichiers dans assets/audio/
  // puis décommentez et adaptez les objets ci-dessous.
  {
    title: "Vision Exception",
    category: "Publicité",
    language: "Français",
    description: "Voix chaleureuse et sophistiquée pour Vision d'Exception.",
    src: "assets/audio/vision.mpeg"
  },
  {
    title: "Univers Patisserie",
    category: "Publicité",
    language: "Français",
    description: "Voix chaleureuse et sophistiquée pour la marque de pâtisserie fine .",
    src: "assets/audio/patisserie.mp3"
  },
  {
    title: "Flagrance World",
    category: "Publicité",
    language: "Français",
    description: "Voix chaleureuse et sophistiquée pour une marque de parfum.",
    src: "assets/audio/flagrance.mp3"
  }

];

function createIcon(iconId, className) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("class", className);

  const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
  use.setAttribute("href", `#${iconId}`);
  svg.appendChild(use);

  return svg;
}

function createBadge(text) {
  const badge = document.createElement("span");
  badge.className = "recording-badge";
  badge.textContent = text;
  return badge;
}

function formatDuration(durationInSeconds) {
  if (!Number.isFinite(durationInSeconds) || durationInSeconds <= 0) {
    return "Audio";
  }

  const minutes = Math.floor(durationInSeconds / 60);
  const seconds = Math.floor(durationInSeconds % 60)
    .toString()
    .padStart(2, "0");

  return `${minutes}:${seconds}`;
}

function formatFileSize(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "";
  }

  const sizeInMb = bytes / (1024 * 1024);
  if (sizeInMb >= 1) {
    return `${sizeInMb.toFixed(1)} Mo`;
  }

  return `${Math.round(bytes / 1024)} Ko`;
}

function createEmptyState() {
  const empty = document.createElement("article");
  empty.className = "recordings-empty";

  const iconShell = document.createElement("div");
  iconShell.className = "recording-icon";
  iconShell.appendChild(createIcon("icon-folder-audio", ""));

  const title = document.createElement("h3");
  title.className = "empty-title";
  title.textContent = "Vos enregistrements apparaîtront ici";

  const text = document.createElement("p");
  text.className = "empty-text";
  text.textContent = "Utilisez le bouton ci-dessus pour charger vos fichiers audio déjà réalisés et afficher immédiatement des cartes d'écoute dans cette section. Vous pourrez ensuite garder uniquement les meilleures démos pour la version finale du portfolio.";

  empty.append(iconShell, title, text);
  return empty;
}

function createRecordingCard(recording) {
  const card = document.createElement("article");
  card.className = `recording-card${recording.local ? " local-preview" : ""}`;

  const top = document.createElement("div");
  top.className = "recording-top";

  const content = document.createElement("div");
  const badges = document.createElement("div");
  badges.className = "recording-badges";

  if (recording.category) {
    badges.appendChild(createBadge(recording.category));
  }

  if (recording.language) {
    badges.appendChild(createBadge(recording.language));
  }

  if (recording.label) {
    badges.appendChild(createBadge(recording.label));
  }

  const durationBadge = createBadge(recording.local ? "Prévisualisation" : "Démo audio");
  badges.appendChild(durationBadge);

  const title = document.createElement("h3");
  title.className = "recording-title";
  title.textContent = recording.title;

  const description = document.createElement("p");
  description.className = "recording-desc";
  description.textContent = recording.description;

  content.append(badges, title, description);

  const iconShell = document.createElement("div");
  iconShell.className = "recording-icon";
  iconShell.appendChild(createIcon("icon-waveform", ""));

  top.append(content, iconShell);

  const playerShell = document.createElement("div");
  playerShell.className = "recording-player-shell";

  const player = document.createElement("audio");
  player.className = "recording-player";
  player.controls = true;
  player.preload = "metadata";
  player.src = recording.src;

  player.addEventListener("loadedmetadata", () => {
    durationBadge.textContent = formatDuration(player.duration);
  });

  player.addEventListener("error", () => {
    durationBadge.textContent = "Audio indisponible";
  });

  player.addEventListener("play", () => {
    if (activePlayer && activePlayer !== player) {
      activePlayer.pause();
    }

    activePlayer = player;
  });

  player.addEventListener("pause", () => {
    if (activePlayer === player) {
      activePlayer = null;
    }
  });

  player.addEventListener("ended", () => {
    if (activePlayer === player) {
      activePlayer = null;
    }
  });

  playerShell.appendChild(player);
  card.append(top, playerShell);

  return card;
}

function renderRecordings() {
  if (!recordingsGrid) {
    return;
  }

  recordingsGrid.innerHTML = "";

  const allRecordings = [...localRecordings, ...featuredRecordings];

  if (!allRecordings.length) {
    recordingsGrid.appendChild(createEmptyState());
  } else {
    allRecordings.forEach((recording) => {
      recordingsGrid.appendChild(createRecordingCard(recording));
    });
  }

  bindCursorTargets();
}

if (recordingsInput) {
  recordingsInput.addEventListener("change", (event) => {
    const files = Array.from(event.target.files || []).filter((file) => file.type.startsWith("audio/"));

    files.forEach((file) => {
      const objectUrl = URL.createObjectURL(file);
      objectUrls.push(objectUrl);

      localRecordings.unshift({
        title: file.name.replace(/\.[^.]+$/, ""),
        category: "Enregistrement",
        language: "Import local",
        label: formatFileSize(file.size),
        description: "Prévisualisation locale ajoutée depuis votre appareil. Gardez cette carte comme référence puis remplacez-la plus tard par un fichier publié sur le portfolio.",
        src: objectUrl,
        local: true
      });
    });

    renderRecordings();
    recordingsInput.value = "";
  });
}

window.addEventListener("beforeunload", () => {
  objectUrls.forEach((url) => URL.revokeObjectURL(url));
});

renderRecordings();
