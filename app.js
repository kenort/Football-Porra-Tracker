const STORAGE_KEY = "football_porra_state_v2";
const PAGE_SIZE = 20;

const syncForm = document.getElementById("sync-form");
const playerForm = document.getElementById("player-form");
const predictionForm = document.getElementById("prediction-form");

const competitionSelect = document.getElementById("competition");
const seasonInput = document.getElementById("season");
const syncBtn = document.getElementById("sync-matches");
const syncStatus = document.getElementById("sync-status");
const clearBtn = document.getElementById("clear-data");
const teamFilterInput = document.getElementById("team-filter");
const stageFilter = document.getElementById("stage-filter");
const dateFromInput = document.getElementById("date-from");
const dateToInput = document.getElementById("date-to");
const clearFiltersBtn = document.getElementById("clear-filters");
const matchesVisibleEl = document.getElementById("matches-visible");
const prevPageBtn = document.getElementById("prev-page");
const nextPageBtn = document.getElementById("next-page");
const pageInfoEl = document.getElementById("page-info");

const playerNameInput = document.getElementById("playerName");
const playersList = document.getElementById("players-list");

const predictionPlayer = document.getElementById("predictionPlayer");
const predictionMatch = document.getElementById("predictionMatch");
const predictionHome = document.getElementById("predictionHome");
const predictionAway = document.getElementById("predictionAway");

const matchesBody = document.getElementById("matches-body");
const leaderboardBody = document.getElementById("leaderboard-body");
const standingsContainer = document.getElementById("standings-container");
const standingsMetaEl = document.getElementById("standings-meta");

const totalMatchesEl = document.getElementById("total-matches");
const finishedMatchesEl = document.getElementById("finished-matches");
const totalPredictionsEl = document.getElementById("total-predictions");
const menuButtons = document.querySelectorAll(".menu-btn");
const viewPanels = document.querySelectorAll(".view-panel");

let state = loadState();
let competitions = [];
const filters = {
  teamQuery: "",
  stage: "",
  dateFrom: "",
  dateTo: "",
};
let currentPage = 1;
let activeView = "partidos";

initialize();

syncForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const competition = competitionSelect.value;
  const season = Number(seasonInput.value);

  if (!competition) {
    setStatus("Selecciona una competición.", true);
    return;
  }

  if (!Number.isInteger(season)) {
    setStatus("Temporada inválida.", true);
    return;
  }

  state.settings.competition = competition;
  state.settings.season = season;
  persist();

  syncBtn.disabled = true;
  setStatus("Cargando partidos desde el backend...");

  try {
    const [matchesPayload, standingsPayload] = await Promise.allSettled([
      fetchMatches(competition, season),
      fetchStandings(competition, season),
    ]);

    if (matchesPayload.status !== "fulfilled") {
      throw matchesPayload.reason;
    }

    const payload = matchesPayload.value;
    const matches = payload.matches.map((m) => normalizeMatch(m, competition)).filter(Boolean);

    state.matches = matches;
    const validIds = new Set(matches.map((m) => m.id));
    state.predictions = state.predictions.filter((p) => validIds.has(p.matchId));

    if (standingsPayload.status === "fulfilled") {
      state.standings = normalizeStandings(standingsPayload.value.standings);
    } else {
      state.standings = [];
    }

    currentPage = 1;

    persist();
    render();

    const standingsMsg =
      standingsPayload.status === "fulfilled"
        ? `Tabla: ${state.standings.length} grupo(s).`
        : "Tabla no disponible para esta competición/temporada.";

    setStatus(
      `Partidos cargados: ${matches.length} (${payload.apiVersion || "proxy"}) - ${competition} ${season}. ${standingsMsg}`,
    );
  } catch (error) {
    setStatus(`Error al sincronizar: ${error.message}`, true);
  } finally {
    syncBtn.disabled = false;
  }
});

playerForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = playerNameInput.value.trim();
  if (!name) return;

  if (state.players.includes(name)) {
    setStatus("Ese jugador ya existe.", true);
    return;
  }

  state.players.push(name);
  playerNameInput.value = "";
  persist();
  render();
});

playersList.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-player]");
  if (!btn) return;

  const player = btn.dataset.player;
  state.players = state.players.filter((p) => p !== player);
  state.predictions = state.predictions.filter((p) => p.player !== player);
  persist();
  render();
});

predictionForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const player = predictionPlayer.value;
  const matchId = predictionMatch.value;
  const home = Number(predictionHome.value);
  const away = Number(predictionAway.value);

  if (!player || !matchId) return;
  if (!Number.isInteger(home) || !Number.isInteger(away)) return;

  const existingIndex = state.predictions.findIndex(
    (p) => p.player === player && p.matchId === matchId,
  );

  const entry = {
    id: existingIndex >= 0 ? state.predictions[existingIndex].id : crypto.randomUUID(),
    player,
    matchId,
    home,
    away,
    updatedAt: new Date().toISOString(),
  };

  if (existingIndex >= 0) {
    state.predictions[existingIndex] = entry;
  } else {
    state.predictions.push(entry);
  }

  persist();
  predictionHome.value = "";
  predictionAway.value = "";
  render();
});

clearBtn.addEventListener("click", () => {
  const ok = confirm("¿Borrar todos los datos locales (jugadores y predicciones)?");
  if (!ok) return;

  state = defaultState();
  persist();
  render();
  setStatus("Datos locales limpiados.");
});

stageFilter.addEventListener("change", () => {
  filters.stage = stageFilter.value;
  currentPage = 1;
  render();
});

dateFromInput.addEventListener("change", () => {
  filters.dateFrom = dateFromInput.value;
  currentPage = 1;
  render();
});

dateToInput.addEventListener("change", () => {
  filters.dateTo = dateToInput.value;
  currentPage = 1;
  render();
});

teamFilterInput.addEventListener("input", () => {
  filters.teamQuery = teamFilterInput.value.trim();
  currentPage = 1;
  render();
});

clearFiltersBtn.addEventListener("click", () => {
  filters.teamQuery = "";
  filters.stage = "";
  filters.dateFrom = "";
  filters.dateTo = "";
  teamFilterInput.value = "";
  stageFilter.value = "";
  dateFromInput.value = "";
  dateToInput.value = "";
  currentPage = 1;
  render();
});

prevPageBtn.addEventListener("click", () => {
  if (currentPage <= 1) return;
  currentPage -= 1;
  renderMatches();
});

nextPageBtn.addEventListener("click", () => {
  const totalItems = getFilteredMatches().length;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  if (currentPage >= totalPages) return;
  currentPage += 1;
  renderMatches();
});

menuButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const view = btn.dataset.view;
    if (!view) return;
    setActiveView(view);
  });
});

async function initialize() {
  if (!state.settings.season) {
    state.settings.season = defaultSeason();
  }
  migrateStoredMatches();

  seasonInput.value = String(state.settings.season);

  try {
    competitions = await fetchCompetitions();
    renderCompetitionOptions();

    if (!state.settings.competition && competitions.length) {
      state.settings.competition = competitions[0].id
        ? String(competitions[0].id)
        : competitions[0].code;
      persist();
    }

    competitionSelect.value = state.settings.competition || "";
    if (!competitionSelect.value && competitions.length) {
      state.settings.competition = competitions[0].id
        ? String(competitions[0].id)
        : competitions[0].code;
      competitionSelect.value = state.settings.competition;
      persist();
    }
    setStatus("Backend listo. Selecciona torneo y pulsa Cargar partidos.");
  } catch (error) {
    setStatus(`No se pudieron cargar competiciones: ${error.message}`, true);
  }

  render();
  setActiveView(activeView);
}

function renderCompetitionOptions() {
  competitionSelect.innerHTML = "";

  if (!competitions.length) {
    competitionSelect.innerHTML = '<option value="">Sin competiciones</option>';
    return;
  }

  competitionSelect.innerHTML = '<option value="">Selecciona...</option>';

  for (const c of competitions) {
    const option = document.createElement("option");
    option.value = c.id ? String(c.id) : c.code;
    option.textContent = `${c.name} (${c.code})`;
    competitionSelect.appendChild(option);
  }
}

function render() {
  renderStageFilter();
  renderPlayers();
  renderPredictionSelectors();
  renderMatches();
  renderStandings();
  renderLeaderboard();
  renderStats();
}

function setActiveView(view) {
  activeView = view;
  menuButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.view === view);
  });
  viewPanels.forEach((panel) => {
    panel.classList.toggle("active", panel.dataset.panel === view);
  });
}

function renderStageFilter() {
  const options = Array.from(
    new Set(
      state.matches
        .map((m) => getDisplayStage(m))
        .filter(Boolean),
    ),
  ).sort((a, b) => a.localeCompare(b));

  stageFilter.innerHTML = '<option value="">Todas</option>';
  for (const stage of options) {
    const option = document.createElement("option");
    option.value = stage;
    option.textContent = stage;
    stageFilter.appendChild(option);
  }

  stageFilter.value = options.includes(filters.stage) ? filters.stage : "";
  if (!options.includes(filters.stage)) {
    filters.stage = "";
  }
}

function renderPlayers() {
  playersList.innerHTML = "";

  if (!state.players.length) {
    playersList.innerHTML = '<span class="muted">Sin participantes aún.</span>';
    return;
  }

  for (const player of state.players) {
    const chip = document.createElement("span");
    chip.className = "chip";
    chip.innerHTML = `${escapeHtml(player)} <button type="button" data-player="${escapeHtml(player)}">x</button>`;
    playersList.appendChild(chip);
  }
}

function renderPredictionSelectors() {
  predictionPlayer.innerHTML = "";
  predictionMatch.innerHTML = "";

  if (!state.players.length) {
    predictionPlayer.innerHTML = '<option value="">Agrega jugadores</option>';
  } else {
    predictionPlayer.innerHTML = '<option value="">Selecciona...</option>';
    for (const p of state.players) {
      const option = document.createElement("option");
      option.value = p;
      option.textContent = p;
      predictionPlayer.appendChild(option);
    }
  }

  const openMatches = state.matches.filter((m) => m.status !== "FINISHED");
  const matchSource = openMatches.length ? openMatches : state.matches;

  if (!matchSource.length) {
    predictionMatch.innerHTML = '<option value="">Sin partidos cargados</option>';
    return;
  }

  predictionMatch.innerHTML = '<option value="">Selecciona...</option>';
  for (const m of matchSource) {
    const option = document.createElement("option");
    option.value = m.id;
    option.textContent = `${formatDateTime(m.utcDate)} - ${m.homeTeam} vs ${m.awayTeam}`;
    predictionMatch.appendChild(option);
  }
}

function renderMatches() {
  matchesBody.innerHTML = "";

  if (!state.matches.length) {
    matchesBody.innerHTML = '<tr><td colspan="7">No hay partidos cargados.</td></tr>';
    matchesVisibleEl.textContent = "Mostrando 0 de 0 partidos.";
    updatePagination(0, 1);
    return;
  }

  const filtered = getFilteredMatches();
  const ordered = [...filtered].sort((a, b) => a.utcDate.localeCompare(b.utcDate));
  const totalPages = Math.max(1, Math.ceil(ordered.length / PAGE_SIZE));
  if (currentPage > totalPages) currentPage = totalPages;
  if (currentPage < 1) currentPage = 1;

  const start = (currentPage - 1) * PAGE_SIZE;
  const pageMatches = ordered.slice(start, start + PAGE_SIZE);
  matchesVisibleEl.textContent = `Mostrando ${pageMatches.length} de ${ordered.length} partidos filtrados (${state.matches.length} totales).`;
  updatePagination(ordered.length, totalPages);

  if (!ordered.length) {
    matchesBody.innerHTML = '<tr><td colspan="7">No hay partidos con esos filtros.</td></tr>';
    return;
  }

  for (const match of pageMatches) {
    const row = document.createElement("tr");
    const predictions = state.predictions.filter((p) => p.matchId === match.id);

    const predictionsHtml = predictions.length
      ? `<ul class="pred-list">${predictions
          .map((p) => {
            const pts = pointsForPrediction(p, match);
            const suffix = pts >= 0 ? ` (${pts} pts)` : "";
            return `<li>${escapeHtml(p.player)}: ${p.home}-${p.away}${suffix}</li>`;
          })
          .join("")}</ul>`
      : '<span class="muted">Sin predicciones</span>';

    row.innerHTML = `
      <td>${formatDateTime(match.utcDate)}</td>
      <td>${escapeHtml(match.competition)}</td>
      <td>${escapeHtml(getDisplayStage(match))}</td>
      <td>${escapeHtml(match.homeTeam)} vs ${escapeHtml(match.awayTeam)}</td>
      <td>${formatRealScore(match)}</td>
      <td>${statusBadge(match.status)}</td>
      <td>${predictionsHtml}</td>
    `;
    matchesBody.appendChild(row);
  }
}

function getFilteredMatches() {
  return state.matches.filter((match) => {
    const stageLabel = getDisplayStage(match);
    if (filters.stage && stageLabel !== filters.stage) return false;

    const matchDate = formatDateInput(match.utcDate);
    if (filters.dateFrom && matchDate < filters.dateFrom) return false;
    if (filters.dateTo && matchDate > filters.dateTo) return false;

    if (filters.teamQuery) {
      const query = normalizeText(filters.teamQuery);
      const home = normalizeText(match.homeTeam);
      const away = normalizeText(match.awayTeam);
      if (!home.includes(query) && !away.includes(query)) return false;
    }

    return true;
  });
}

function renderLeaderboard() {
  leaderboardBody.innerHTML = "";

  if (!state.players.length) {
    leaderboardBody.innerHTML = '<tr><td colspan="5">Agrega jugadores para ver ranking.</td></tr>';
    return;
  }

  const ranking = state.players
    .map((player) => {
      const own = state.predictions.filter((p) => p.player === player);
      let points = 0;
      let exact = 0;
      let trend = 0;

      for (const p of own) {
        const match = state.matches.find((m) => m.id === p.matchId);
        if (!match || match.status !== "FINISHED") continue;

        const score = pointsForPrediction(p, match);
        points += score;
        if (score === 3) exact += 1;
        if (score === 1) trend += 1;
      }

      return { player, points, exact, trend };
    })
    .sort((a, b) => b.points - a.points || b.exact - a.exact || a.player.localeCompare(b.player));

  ranking.forEach((r, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${index + 1}</td>
      <td>${escapeHtml(r.player)}</td>
      <td>${r.points}</td>
      <td>${r.exact}</td>
      <td>${r.trend}</td>
    `;
    leaderboardBody.appendChild(tr);
  });
}

function renderStandings() {
  standingsContainer.innerHTML = "";
  standingsMetaEl.textContent = "";

  if (!state.standings?.length) {
    standingsContainer.innerHTML = '<p class="muted">No hay tabla disponible para la selección actual.</p>';
    return;
  }

  standingsMetaEl.textContent = `${state.standings.length} grupo(s) / tabla(s)`;

  for (const standing of state.standings) {
    const group = document.createElement("div");
    group.className = "standings-group";

    const title = document.createElement("h3");
    title.textContent = standing.label;
    group.appendChild(title);

    const wrap = document.createElement("div");
    wrap.className = "table-wrap";
    wrap.innerHTML = `
      <table>
        <thead>
          <tr>
            <th>Pos</th>
            <th>Equipo</th>
            <th>PJ</th>
            <th>PG</th>
            <th>PE</th>
            <th>PP</th>
            <th>GF</th>
            <th>GC</th>
            <th>DG</th>
            <th>Pts</th>
          </tr>
        </thead>
        <tbody>
          ${standing.rows
            .map(
              (row) => `
            <tr>
              <td>${row.position}</td>
              <td>${escapeHtml(row.team)}</td>
              <td>${row.playedGames}</td>
              <td>${row.won}</td>
              <td>${row.draw}</td>
              <td>${row.lost}</td>
              <td>${row.goalsFor}</td>
              <td>${row.goalsAgainst}</td>
              <td>${row.goalDifference}</td>
              <td>${row.points}</td>
            </tr>`,
            )
            .join("")}
        </tbody>
      </table>
    `;

    group.appendChild(wrap);
    standingsContainer.appendChild(group);
  }
}

function renderStats() {
  const totalMatches = state.matches.length;
  const finished = state.matches.filter((m) => m.status === "FINISHED").length;

  totalMatchesEl.textContent = String(totalMatches);
  finishedMatchesEl.textContent = String(finished);
  totalPredictionsEl.textContent = String(state.predictions.length);
}

function pointsForPrediction(prediction, match) {
  if (match.status !== "FINISHED") return -1;
  if (match.scoreHome == null || match.scoreAway == null) return 0;

  if (prediction.home === match.scoreHome && prediction.away === match.scoreAway) {
    return 3;
  }

  const predDiff = Math.sign(prediction.home - prediction.away);
  const realDiff = Math.sign(match.scoreHome - match.scoreAway);
  return predDiff === realDiff ? 1 : 0;
}

function formatRealScore(match) {
  if (match.scoreHome == null || match.scoreAway == null) {
    return "Pendiente";
  }
  return `${match.scoreHome} - ${match.scoreAway}`;
}

function statusBadge(status) {
  if (status === "FINISHED") {
    return '<span class="badge ok">Finalizado</span>';
  }
  return `<span class="badge wait">${escapeHtml(status)}</span>`;
}

async function fetchCompetitions() {
  const response = await fetch("/api/competitions");
  const payload = await safeJson(response);

  if (!response.ok) {
    throw new Error(payload?.message || payload?.error || `HTTP ${response.status}`);
  }

  return Array.isArray(payload?.competitions) ? payload.competitions : [];
}

async function fetchMatches(competition, season) {
  const url = `/api/matches?competition=${encodeURIComponent(competition)}&season=${encodeURIComponent(season)}`;
  const response = await fetch(url);
  const payload = await safeJson(response);

  if (!response.ok) {
    const message = payload?.message || payload?.error || `HTTP ${response.status}`;
    throw new Error(`${message} [${response.status}]`);
  }

  const matches = Array.isArray(payload?.matches) ? payload.matches : [];
  if (!matches.length) {
    throw new Error("La API respondió sin partidos para esa competición/temporada.");
  }

  return {
    apiVersion: payload?.apiVersion || "proxy",
    matches,
  };
}

async function fetchStandings(competition, season) {
  const url = `/api/standings?competition=${encodeURIComponent(competition)}&season=${encodeURIComponent(season)}`;
  const response = await fetch(url);
  const payload = await safeJson(response);

  if (!response.ok) {
    const message = payload?.message || payload?.error || `HTTP ${response.status}`;
    throw new Error(`${message} [${response.status}]`);
  }

  return {
    apiVersion: payload?.apiVersion || "proxy",
    standings: Array.isArray(payload?.standings) ? payload.standings : [],
  };
}

function normalizeMatch(raw, competition) {
  if (!raw || !raw.id || !raw.utcDate) return null;

  const rawStage = raw.stage || raw.group || "";
  const competitionLabel = raw.competition?.code || raw.competition?.name || competition;
  return {
    id: `${competition}:${raw.id}`,
    sourceMatchId: raw.id,
    competition: String(competitionLabel),
    utcDate: raw.utcDate,
    stage: translateStage(rawStage),
    status: raw.status || "SCHEDULED",
    homeTeam: raw.homeTeam?.name || "Local",
    awayTeam: raw.awayTeam?.name || "Visitante",
    scoreHome: toNullableNumber(raw.score?.fullTime?.home ?? raw.score?.fullTime?.homeTeam),
    scoreAway: toNullableNumber(raw.score?.fullTime?.away ?? raw.score?.fullTime?.awayTeam),
  };
}

function updatePagination(totalItems, totalPages) {
  pageInfoEl.textContent = `Página ${currentPage} de ${totalPages}`;
  prevPageBtn.disabled = currentPage <= 1 || totalItems === 0;
  nextPageBtn.disabled = currentPage >= totalPages || totalItems === 0;
}

function normalizeStandings(standingsList) {
  if (!Array.isArray(standingsList)) return [];

  return standingsList
    .map((entry) => {
      const rows = Array.isArray(entry?.table)
        ? entry.table.map((r) => ({
            position: r.position ?? "-",
            team: r.team?.shortName || r.team?.tla || r.team?.name || "Equipo",
            playedGames: r.playedGames ?? 0,
            won: r.won ?? 0,
            draw: r.draw ?? 0,
            lost: r.lost ?? 0,
            goalsFor: r.goalsFor ?? 0,
            goalsAgainst: r.goalsAgainst ?? 0,
            goalDifference: r.goalDifference ?? 0,
            points: r.points ?? 0,
          }))
        : [];

      if (!rows.length) return null;

      const labelParts = [
        translateStage(entry.group),
        translateStage(entry.stage),
        translateStandingType(entry.type),
      ]
        .filter(Boolean)
        .filter((v, i, arr) => arr.indexOf(v) === i);

      return {
        label: labelParts.length ? labelParts.join(" · ") : "Tabla general",
        rows,
      };
    })
    .filter(Boolean);
}

function migrateStoredMatches() {
  let changed = false;
  state.matches = state.matches.map((match) => {
    const translated = getDisplayStage(match);
    if (translated !== match.stage) {
      changed = true;
      return { ...match, stage: translated };
    }
    return match;
  });

  if (changed) persist();
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();

    const parsed = JSON.parse(raw);
    return {
      settings: {
        competition: parsed?.settings?.competition || "",
        season: Number(parsed?.settings?.season) || defaultSeason(),
      },
      players: Array.isArray(parsed?.players) ? parsed.players : [],
      matches: Array.isArray(parsed?.matches) ? parsed.matches : [],
      standings: Array.isArray(parsed?.standings) ? parsed.standings : [],
      predictions: Array.isArray(parsed?.predictions) ? parsed.predictions : [],
    };
  } catch {
    return defaultState();
  }
}

function defaultState() {
  return {
    settings: {
      competition: "",
      season: defaultSeason(),
    },
    players: [],
    matches: [],
    standings: [],
    predictions: [],
  };
}

function defaultSeason() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  return month >= 7 ? year : year - 1;
}

function setStatus(message, isError = false) {
  syncStatus.textContent = message;
  syncStatus.style.color = isError ? "#b91c1c" : "#6b7280";
}

function formatDateTime(value) {
  const d = new Date(value);
  return d.toLocaleString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateInput(value) {
  const d = new Date(value);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function translateStage(stageValue) {
  const raw = String(stageValue || "").trim();
  if (!raw) return "Sin fase";
  const normalizedRaw = raw.toLowerCase();
  const phraseMap = {
    "group stage": "Fase de grupos",
    "semi finals": "Semifinal",
    "semi-finals": "Semifinal",
    "quarter finals": "Cuartos de final",
    "quarter-finals": "Cuartos de final",
    "round of 16": "Octavos de final",
    "round of 32": "Dieciseisavos de final",
    "round of 64": "Ronda de 64",
    "regular season": "Liga regular",
    playoffs: "Playoffs",
    qualification: "Clasificación",
    relegation: "Descenso",
    final: "Final",
  };
  if (phraseMap[normalizedRaw]) return phraseMap[normalizedRaw];

  const looksLikeCode = /^[A-Z0-9_]+$/.test(raw);
  if (!looksLikeCode) return raw;

  const key = raw.toUpperCase();
  const directMap = {
    FINAL: "Final",
    THIRD_PLACE: "Tercer puesto",
    SEMI_FINALS: "Semifinal",
    QUARTER_FINALS: "Cuartos de final",
    LAST_16: "Octavos de final",
    ROUND_OF_16: "Octavos de final",
    LAST_32: "Dieciseisavos de final",
    ROUND_OF_32: "Dieciseisavos de final",
    ROUND_OF_64: "Ronda de 64",
    GROUP_STAGE: "Fase de grupos",
    PRELIMINARY_ROUND: "Ronda preliminar",
    QUALIFICATION: "Clasificación",
    PLAYOFFS: "Playoffs",
    REGULAR_SEASON: "Liga regular",
    RELEGATION: "Descenso",
  };

  if (directMap[key]) return directMap[key];

  const groupMatch = key.match(/^GROUP_([A-Z0-9]+)$/);
  if (groupMatch) {
    return `Grupo ${groupMatch[1]}`;
  }

  const matchdayMatch = key.match(/^MATCHDAY_(\d+)$/);
  if (matchdayMatch) {
    return `Jornada ${matchdayMatch[1]}`;
  }

  return raw
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function translateStandingType(typeValue) {
  const key = String(typeValue || "").toUpperCase();
  const map = {
    TOTAL: "General",
    HOME: "Local",
    AWAY: "Visitante",
  };
  return map[key] || "";
}

function getDisplayStage(match) {
  return translateStage(match?.stage || "");
}

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function toNullableNumber(value) {
  return typeof value === "number" ? value : null;
}

async function safeJson(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
