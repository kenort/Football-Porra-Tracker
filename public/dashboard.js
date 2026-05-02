const PAGE_SIZE = 20;
const LEAGUE_STORAGE_KEY = "porra_active_league";
const CACHE_META_KEY = "porra_cache_meta_v1";
const CACHE_PREFIX = "porra_cache_v1";

const appShell = document.getElementById("app-shell");
const bootSplash = document.getElementById("boot-splash");

const leagueSwitcher = document.getElementById("league-switcher");
const viewerName = document.getElementById("viewer-name");
const viewerRole = document.getElementById("viewer-role");
const logoutBtn = document.getElementById("logout-btn");
const guideTrigger = document.getElementById("guide-trigger");
const adminNavBtn = document.getElementById("admin-nav-btn");
const betsNavBtn = document.getElementById("bets-nav-btn");
const mobileMenuToggle = document.getElementById("mobile-menu-toggle");
const topbarActions = document.getElementById("topbar-actions");
const topbarBackdrop = document.getElementById("topbar-backdrop");

const competitionSelect = document.getElementById("competition");
const seasonInput = document.getElementById("season");
const exactPointsInput = document.getElementById("exact-points");
const outcomePointsInput = document.getElementById("outcome-points");
const lockMinutesInput = document.getElementById("lock-minutes");
const leagueNameInput = document.getElementById("league-name");
const syncBtn = document.getElementById("sync-matches");
const syncStatus = document.getElementById("sync-status");
const leagueSettingsForm = document.getElementById("league-settings-form");
const leagueConfigCard = document.getElementById("league-config-card");
const loadingOverlay = document.getElementById("loading-overlay");
const loadingLabel = document.getElementById("loading-label");

const currentCompetitionLabel = document.getElementById("current-competition-label");
const lastSyncLabel = document.getElementById("last-sync-label");
const rulesSummaryEl = document.getElementById("rules-summary");
const leagueTitle = document.getElementById("league-title");
const leagueSubtitle = document.getElementById("league-subtitle");
const membersList = document.getElementById("members-list");
const membersCard = document.getElementById("members-card");

const teamFilterInput = document.getElementById("team-filter");
const stageFilter = document.getElementById("stage-filter");
const dateFromInput = document.getElementById("date-from");
const dateToInput = document.getElementById("date-to");
const clearFiltersBtn = document.getElementById("clear-filters");
const matchesFiltersPanel = document.getElementById("matches-filters-panel");
const matchesVisibleEl = document.getElementById("matches-visible");
const matchesGroups = document.getElementById("matches-groups");
const matchesTableWrap = document.getElementById("matches-table-wrap");
const prevPageBtn = document.getElementById("prev-page");
const nextPageBtn = document.getElementById("next-page");
const pageInfoEl = document.getElementById("page-info");

const predictionModal = document.getElementById("prediction-modal");
const predictionModalCloseBtn = document.getElementById("prediction-modal-close");
const predictionModalForm = document.getElementById("prediction-modal-form");
const predictionModalSubtitle = document.getElementById("prediction-modal-subtitle");
const predictionModalHomeTeam = document.getElementById("prediction-modal-home-team");
const predictionModalAwayTeam = document.getElementById("prediction-modal-away-team");
const predictionModalHomeInput = document.getElementById("prediction-modal-home");
const predictionModalAwayInput = document.getElementById("prediction-modal-away");
const predictionModalDeleteBtn = document.getElementById("prediction-modal-delete");
const predictionModalStatus = document.getElementById("prediction-modal-status");

const matchesBody = document.getElementById("matches-body");
const adminBetsMatch = document.getElementById("admin-bets-match");
const adminBetsUserFilter = document.getElementById("admin-bets-user-filter");
const adminBetsOutcomeFilter = document.getElementById("admin-bets-outcome-filter");
const adminBetsMeta = document.getElementById("admin-bets-meta");
const adminBetsTotal = document.getElementById("admin-bets-total");
const adminBetsHome = document.getElementById("admin-bets-home");
const adminBetsDraw = document.getElementById("admin-bets-draw");
const adminBetsAway = document.getElementById("admin-bets-away");
const adminBetsBody = document.getElementById("admin-bets-body");
const adminBetsPrevPageBtn = document.getElementById("admin-bets-prev-page");
const adminBetsNextPageBtn = document.getElementById("admin-bets-next-page");
const adminBetsPageInfo = document.getElementById("admin-bets-page-info");
const leaderboardBody = document.getElementById("leaderboard-body");
const leaderboardPrevPageBtn = document.getElementById("leaderboard-prev-page");
const leaderboardNextPageBtn = document.getElementById("leaderboard-next-page");
const leaderboardPageInfo = document.getElementById("leaderboard-page-info");
const standingsContainer = document.getElementById("standings-container");
const standingsMetaEl = document.getElementById("standings-meta");
const totalMatchesEl = document.getElementById("total-matches");
const finishedMatchesEl = document.getElementById("finished-matches");
const totalPredictionsEl = document.getElementById("total-predictions");
const stat1Icon = document.getElementById("stat-1-icon");
const stat1Tag = document.getElementById("stat-1-tag");
const stat1Name = document.getElementById("stat-1-name");
const stat2Icon = document.getElementById("stat-2-icon");
const stat2Tag = document.getElementById("stat-2-tag");
const stat2Name = document.getElementById("stat-2-name");
const stat3Icon = document.getElementById("stat-3-icon");
const stat3Tag = document.getElementById("stat-3-tag");
const stat3Name = document.getElementById("stat-3-name");
const stat4Card = document.getElementById("stat-4-card");
const stat4Icon = document.getElementById("stat-4-icon");
const stat4Tag = document.getElementById("stat-4-tag");
const stat4Name = document.getElementById("stat-4-name");
const totalMembersEl = document.getElementById("total-members");

const superadminPanel = document.getElementById("superadmin-panel");
const profileForm = document.getElementById("profile-form");
const profileDisplayNameInput = document.getElementById("profile-display-name");
const profileEmailInput = document.getElementById("profile-email");
const profileCurrentPasswordInput = document.getElementById("profile-current-password");
const profileNewPasswordInput = document.getElementById("profile-new-password");
const profileStatus = document.getElementById("profile-status");
const superadminAdminForm = document.getElementById("superadmin-admin-form");
const organizationSelect = document.getElementById("organization-select");
const organizationNameInput = document.getElementById("organization-name");
const adminNameInput = document.getElementById("admin-name");
const adminEmailInput = document.getElementById("admin-email");
const adminPasswordInput = document.getElementById("admin-password");
const superadminStatus = document.getElementById("superadmin-status");
const organizationsList = document.getElementById("organizations-list");
const adminsBody = document.getElementById("admins-body");
const auditOrgFilter = document.getElementById("audit-org-filter");
const auditRefreshBtn = document.getElementById("audit-refresh");
const auditExportBtn = document.getElementById("audit-export");
const auditStatus = document.getElementById("audit-status");
const auditBody = document.getElementById("audit-body");
const superadminNavButtons = [...document.querySelectorAll("[data-superadmin-view]")];
const superadminSections = [...document.querySelectorAll("[data-superadmin-section]")];

const adminPanel = document.getElementById("admin-panel");
const adminEmptyPanel = document.getElementById("admin-empty-panel");
const userForm = document.getElementById("user-form");
const userIdInput = document.getElementById("user-id");
const userNameInput = document.getElementById("user-name");
const userEmailInput = document.getElementById("user-email");
const userPasswordInput = document.getElementById("user-password");
const userLeaguesInput = document.getElementById("user-leagues");
const userActiveInput = document.getElementById("user-active");
const userStatus = document.getElementById("user-status");
const resetUserFormBtn = document.getElementById("reset-user-form");
const bulkImportForm = document.getElementById("bulk-import-form");
const bulkImportFileInput = document.getElementById("bulk-import-file");
const downloadImportTemplateBtn = document.getElementById("download-import-template");
const bulkImportPreviewBtn = document.getElementById("bulk-import-preview-btn");
const bulkImportOpenPreviewBtn = document.getElementById("bulk-import-open-preview");
const bulkImportConfirmBtn = document.getElementById("bulk-import-confirm-btn");
const bulkImportExportBtn = document.getElementById("bulk-import-export-btn");
const bulkImportStatus = document.getElementById("bulk-import-status");
const bulkImportLeagues = document.getElementById("bulk-import-leagues");
const bulkImportSummary = document.getElementById("bulk-import-summary");
const bulkImportModal = document.getElementById("bulk-import-modal");
const bulkImportModalCloseBtn = document.getElementById("bulk-import-modal-close");
const bulkImportModalSummary = document.getElementById("bulk-import-modal-summary");
const bulkImportPageSizeInput = document.getElementById("bulk-import-page-size");
const bulkImportPrevPageBtn = document.getElementById("bulk-import-prev-page");
const bulkImportNextPageBtn = document.getElementById("bulk-import-next-page");
const bulkImportPageInfo = document.getElementById("bulk-import-page-info");
const bulkImportPreviewBody = document.getElementById("bulk-import-preview-body");

const adminLeagueForm = document.getElementById("admin-league-form");
const adminLeagueNameInput = document.getElementById("admin-league-name");
const adminLeagueCompetitionInput = document.getElementById("admin-league-competition");
const adminLeagueSeasonInput = document.getElementById("admin-league-season");
const adminLeagueExactInput = document.getElementById("admin-league-exact");
const adminLeagueOutcomeInput = document.getElementById("admin-league-outcome");
const adminLeagueLockInput = document.getElementById("admin-league-lock");
const adminLeagueStatus = document.getElementById("admin-league-status");

const usersBody = document.getElementById("users-body");
const leaguesBody = document.getElementById("leagues-body");
const deleteAllUsersBtn = document.getElementById("delete-all-users");
const deleteAllLeaguesBtn = document.getElementById("delete-all-leagues");
const resetRequestsBody = document.getElementById("reset-requests-body");
const resetRequestStatus = document.getElementById("reset-request-status");
const passwordChangeModal = document.getElementById("password-change-modal");
const passwordChangeForm = document.getElementById("password-change-form");
const currentPasswordInput = document.getElementById("current-password");
const newPasswordInput = document.getElementById("new-password");
const passwordChangeStatus = document.getElementById("password-change-status");
const guideModal = document.getElementById("guide-modal");
const guideTitle = document.getElementById("guide-title");
const guideSubtitle = document.getElementById("guide-subtitle");
const guideSections = document.getElementById("guide-sections");
const guideDismissToggle = document.getElementById("guide-dismiss-toggle");
const guideAcceptBtn = document.getElementById("guide-accept");
const guideCloseBtn = document.getElementById("guide-close");
const confirmDeleteModal = document.getElementById("confirm-delete-modal");
const confirmDeleteTitle = document.getElementById("confirm-delete-title");
const confirmDeleteMessage = document.getElementById("confirm-delete-message");
const confirmDeleteSummary = document.getElementById("confirm-delete-summary");
const confirmDeletePrompt = document.getElementById("confirm-delete-prompt");
const confirmDeleteInput = document.getElementById("confirm-delete-input");
const confirmDeleteActionBtn = document.getElementById("confirm-delete-action");
const confirmDeleteCancelBtn = document.getElementById("confirm-delete-cancel");
const confirmDeleteCloseBtn = document.getElementById("confirm-delete-close");
const confirmDeleteStatus = document.getElementById("confirm-delete-status");

const menuButtons = [...document.querySelectorAll(".menu-btn")];
const viewPanels = [...document.querySelectorAll(".view-panel")];
const summaryButton = document.querySelector('.menu-btn[data-view="resumen"]');
const matchesButton = document.querySelector('.menu-btn[data-view="partidos"]');
const betsButton = document.querySelector('.menu-btn[data-view="porras"]');
const rankingButton = document.querySelector('.menu-btn[data-view="clasificacion"]');
const standingsButton = document.querySelector('.menu-btn[data-view="tabla"]');

let appState = createInitialState();
let currentPage = 1;
let adminBetsPage = 1;
let leaderboardPage = 1;
let activeView = "resumen";
let activeSuperadminSection = "organizations";
let pendingDeleteAction = null;
let auditLogs = [];
let temporaryPasswordNotice = "";
let activePredictionModalMatchId = "";
let predictionModalCloseTimer = null;
let predictionMutationInFlight = false;
let bulkImportPreviewState = null;
let bulkImportPage = 1;
let bulkImportPageSize = 10;
const filters = {
  teamQuery: "",
  stage: "",
  dateFrom: "",
  dateTo: "",
};
const adminBetsFilters = {
  matchId: "",
  userQuery: "",
  outcome: "",
};
const GUIDE_STORAGE_PREFIX = "porra_guide_seen";
const COUNTRY_CODES = [
  "AD", "AE", "AF", "AG", "AI", "AL", "AM", "AO", "AR", "AS", "AT", "AU", "AW", "AZ",
  "BA", "BB", "BD", "BE", "BF", "BG", "BH", "BI", "BJ", "BM", "BN", "BO", "BR", "BS",
  "BT", "BW", "BY", "BZ", "CA", "CD", "CF", "CG", "CH", "CI", "CL", "CM", "CN", "CO",
  "CR", "CU", "CV", "CW", "CY", "CZ", "DE", "DJ", "DK", "DM", "DO", "DZ", "EC", "EE",
  "EG", "EH", "ER", "ES", "ET", "FI", "FJ", "FM", "FO", "FR", "GA", "GB", "GD", "GE",
  "GF", "GH", "GI", "GL", "GM", "GN", "GQ", "GR", "GT", "GU", "GW", "GY", "HK", "HN",
  "HR", "HT", "HU", "ID", "IE", "IL", "IN", "IQ", "IR", "IS", "IT", "JM", "JO", "JP",
  "KE", "KG", "KH", "KI", "KM", "KN", "KP", "KR", "KW", "KY", "KZ", "LA", "LB", "LC",
  "LI", "LK", "LR", "LS", "LT", "LU", "LV", "LY", "MA", "MC", "MD", "ME", "MG", "MH",
  "MK", "ML", "MM", "MN", "MO", "MR", "MT", "MU", "MV", "MW", "MX", "MY", "MZ", "NA",
  "NE", "NG", "NI", "NL", "NO", "NP", "NR", "NZ", "OM", "PA", "PE", "PF", "PG", "PH",
  "PK", "PL", "PR", "PS", "PT", "PW", "PY", "QA", "RO", "RS", "RU", "RW", "SA", "SB",
  "SC", "SD", "SE", "SG", "SI", "SK", "SL", "SM", "SN", "SO", "SR", "SS", "ST", "SV",
  "SY", "SZ", "TC", "TD", "TG", "TH", "TJ", "TL", "TM", "TN", "TO", "TR", "TT", "TV",
  "TW", "TZ", "UA", "UG", "US", "UY", "UZ", "VA", "VC", "VE", "VG", "VI", "VN", "VU",
  "WS", "YE", "ZA", "ZM", "ZW",
];
const SPECIAL_TEAM_PRESENTATIONS = {
  england: { name: "Inglaterra", flag: "", flagCode: "gb-eng" },
  scotland: { name: "Escocia", flag: "", flagCode: "gb-sct" },
  wales: { name: "Gales", flag: "", flagCode: "gb-wls" },
  "northern ireland": { name: "Irlanda del Norte", flag: "", flagCode: "gb-nir" },
  kosovo: { name: "Kosovo", flag: "🇽🇰", flagCode: "xk" },
};
const COUNTRY_NAME_OVERRIDES = {
  CI: "Costa de Marfil",
  CV: "Cabo Verde",
  CZ: "República Checa",
  KR: "Corea del Sur",
  KP: "Corea del Norte",
  NL: "Países Bajos",
  NZ: "Nueva Zelanda",
  SA: "Arabia Saudita",
  TR: "Turquía",
  US: "Estados Unidos",
};
const COUNTRY_NAME_ALIASES = {
  usa: "US",
  usmnt: "US",
  "united states": "US",
  "united states of america": "US",
  "south korea": "KR",
  korea: "KR",
  "korea republic": "KR",
  "republic of korea": "KR",
  "north korea": "KP",
  "dpr korea": "KP",
  "saudi arabia": "SA",
  "costa rica": "CR",
  "czechia": "CZ",
  "czech republic": "CZ",
  "ivory coast": "CI",
  "cote d'ivoire": "CI",
  "côte d'ivoire": "CI",
  "new zealand": "NZ",
  "the netherlands": "NL",
  netherlands: "NL",
  holland: "NL",
  "bosnia and herzegovina": "BA",
  "bosnia-herzegovina": "BA",
  "cape verde": "CV",
  "cape verde islands": "CV",
  "cabo verde": "CV",
  "dr congo": "CD",
  "congo dr": "CD",
  "congo rd": "CD",
  "congo, dr": "CD",
  "congo, democratic republic of the": "CD",
  "democratic republic of the congo": "CD",
  "republic of the congo": "CG",
  "congo republic": "CG",
  "equatorial guinea": "GQ",
  "guinea bissau": "GW",
  "guinea-bissau": "GW",
  "uae": "AE",
  "uae national team": "AE",
  "united arab emirates": "AE",
  "north macedonia": "MK",
  macedonia: "MK",
  "ir iran": "IR",
  iran: "IR",
  "pr china": "CN",
  "china pr": "CN",
  "people's republic of china": "CN",
  "peoples republic of china": "CN",
  "chinese taipei": "TW",
  taiwan: "TW",
  "hong kong": "HK",
  "faroe islands": "FO",
  "saint kitts and nevis": "KN",
  "st kitts and nevis": "KN",
  "saint vincent and the grenadines": "VC",
  "st vincent and the grenadines": "VC",
  "saint lucia": "LC",
  "st lucia": "LC",
  "antigua and barbuda": "AG",
  "trinidad and tobago": "TT",
  palestine: "PS",
  "puerto rico": "PR",
  curacao: "CW",
  curaçao: "CW",
  "el salvador": "SV",
  "sao tome and principe": "ST",
  "são tomé and príncipe": "ST",
  "sao tome & principe": "ST",
  "eswatini": "SZ",
  swaziland: "SZ",
  "the gambia": "GM",
  turkey: "TR",
  "türkiye": "TR",
};
const TEAM_PRESENTATION_LOOKUP = buildTeamPresentationLookup();
const GUIDE_CONTENT = {
  superadmin: [
    {
      view: "Organizaciones",
      points: [
        "Revisa todas las organizaciones creadas, su estado, cuántos admins tienen y cuántas ligas manejan.",
        "Desde esta vista puedes activar, desactivar o eliminar una organización completa.",
        "Desactivar te permite pausar una operación sin borrar su historial; eliminar la remueve por completo.",
      ],
    },
    {
      view: "Admins",
      points: [
        "Crea un nuevo admin SaaS asignándole su propia organización desde un flujo separado.",
        "Consulta qué admins existen, a qué organización pertenecen y si están activos o inactivos.",
        "Usa esta vista para mantener el control operativo del modelo multi-tenant.",
      ],
    },
    {
      view: "Mi perfil",
      points: [
        "Actualiza tu nombre, correo principal y contraseña sin salir del panel.",
        "Si cambias el correo o la contraseña, primero confirma tu contraseña actual.",
        "Este perfil controla el acceso global a toda la plataforma.",
      ],
    },
    {
      view: "Logs",
      points: [
        "Consulta la auditoría global o filtra por una organización específica.",
        "Exporta los registros en CSV cuando necesites compartir trazabilidad o revisión operativa.",
        "Desde aquí puedes revisar quién creó usuarios, ligas, porras o eliminó información.",
      ],
    },
  ],
  admin: [
    {
      view: "Resumen",
      points: [
        "Verifica qué liga está activa, sus reglas, última sincronización y participantes autorizados.",
        "Desde aquí puedes sincronizar partidos y tabla oficial cuando lo necesites.",
        "Usa esta vista para confirmar rápidamente si la liga quedó bien configurada.",
      ],
    },
    {
      view: "Partidos",
      points: [
        "Consulta calendario, estado de los partidos y cantidad de porras registradas por encuentro.",
        "Cada fila resume el partido sin saturarte con cientos de apuestas al mismo tiempo.",
        "Desde aquí puedes saltar al detalle de apuestas del partido que te interese revisar.",
      ],
    },
    {
      view: "Porras",
      points: [
        "Explora las apuestas por partido con filtros por usuario y por tendencia.",
        "Revisa rápidamente cuántos apostaron local, empate o visita.",
        "Esta vista está pensada para manejar cientos de asociados sin perder claridad.",
      ],
    },
    {
      view: "Admin",
      points: [
        "Crea usuarios, asigna ligas, atiende recuperaciones y crea nuevas ligas para tu organización.",
        "Solo tú ves y administras a tus propios usuarios; no se mezclan con otros clientes.",
        "Usa esta vista para operar el día a día de tu fondo o empresa.",
      ],
    },
  ],
  user: [
    {
      view: "Resumen",
      points: [
        "Consulta rápidamente la liga activa, sus reglas y el estado general del torneo.",
        "Revisa partidos totales, finalizados y cuántas porras llevas registradas.",
        "Usa esta vista como punto de entrada antes de empezar a apostar.",
      ],
    },
    {
      view: "Partidos",
      points: [
        "Selecciona un partido, registra tu marcador y guárdalo antes del cierre.",
        "Los filtros te ayudan a encontrar partidos por equipo, fase o fecha.",
        "Solo verás tu propia porra dentro del listado de partidos.",
      ],
    },
    {
      view: "Ranking y tabla",
      points: [
        "En Ranking sigues tu posición frente a los demás participantes autorizados.",
        "En Tabla puedes revisar grupos, posiciones oficiales y estado deportivo del torneo.",
        "Cambia de liga desde el selector superior si tienes acceso a más de una.",
      ],
    },
  ],
};

initialize();
bindPasswordToggles();
bindMobileMenu();
bindGuide();
bindDeleteConfirmation();
bindSuperadminSections();
bindSuperadminAdminForm();

auditRefreshBtn?.addEventListener("click", async () => {
  await loadAuditLogs();
});

auditOrgFilter?.addEventListener("change", async () => {
  await loadAuditLogs();
});

auditExportBtn?.addEventListener("click", () => {
  exportAuditLogsCsv();
});

logoutBtn.addEventListener("click", async () => {
  try {
    setLoading(true, "Cerrando sesión...");
    await postJson("/api/auth/logout", {});
  } finally {
    clearSessionCache();
    window.location.replace("/login");
  }
});

leagueSwitcher.addEventListener("change", async () => {
  const leagueId = leagueSwitcher.value || "";
  if (!leagueId) return;
  localStorage.setItem(LEAGUE_STORAGE_KEY, leagueId);
  const cachedState = readCachedStateByLeagueId(leagueId);
  if (cachedState) {
    appState = cachedState;
    render();
  }
  await refreshApp(leagueId);
});

leagueSettingsForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (appState.viewer?.role !== "admin" || !appState.currentLeague) return;

  try {
    const payload = readLeagueSettingsForm();
    await patchJson(`/api/admin/leagues/${encodeURIComponent(appState.currentLeague.id)}`, payload);
    setStatus("Configuración de la liga guardada.");
    await refreshApp(appState.currentLeague.id);
  } catch (error) {
    setStatus(error.message, true);
  }
});

syncBtn.addEventListener("click", async () => {
  if (appState.viewer?.role !== "admin" || !appState.currentLeague) return;
  await syncLeagueById(appState.currentLeague.id);
});

async function syncLeagueById(leagueId) {
  if (appState.viewer?.role !== "admin" || !leagueId) return;
  try {
    setLoading(true, "Sincronizando partidos...");
    if (syncBtn) syncBtn.disabled = true;
    setStatus("Sincronizando partidos y tabla...");
    const response = await postJson(`/api/admin/sync/${encodeURIComponent(leagueId)}`, {});
    await refreshApp(leagueId);
    setStatus(`Sincronización completada. ${response.matchesCount} partidos y ${response.standingsCount} tabla(s).`);
  } catch (error) {
    setStatus(error.message, true);
  } finally {
    if (syncBtn) syncBtn.disabled = false;
  }
}

predictionModalForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const matchId = activePredictionModalMatchId;
  const homeGoals = Number(predictionModalHomeInput.value);
  const awayGoals = Number(predictionModalAwayInput.value);

  if (!matchId) {
    setPredictionModalMessage("Selecciona un partido.", true);
    return;
  }

  if (!Number.isInteger(homeGoals) || !Number.isInteger(awayGoals) || homeGoals < 0 || awayGoals < 0) {
    setPredictionModalMessage("Introduce un marcador válido.", true);
    return;
  }

  await savePrediction(matchId, homeGoals, awayGoals, setPredictionModalMessage, () => {
    syncPredictionModalState();
    window.clearTimeout(predictionModalCloseTimer);
    predictionModalCloseTimer = window.setTimeout(() => {
      closePredictionModal();
    }, 1000);
  });
});

predictionModalDeleteBtn?.addEventListener("click", async () => {
  const prediction = currentPredictionForMatch(activePredictionModalMatchId);
  if (!prediction) {
    setPredictionModalMessage("No tienes una porra guardada para ese partido.", true);
    return;
  }

  await deletePrediction(prediction, setPredictionModalMessage, () => {
    syncPredictionModalState();
  });
});

predictionModalCloseBtn?.addEventListener("click", closePredictionModal);
predictionModal?.addEventListener("click", (event) => {
  if (event.target === predictionModal) closePredictionModal();
});

teamFilterInput.addEventListener("input", () => {
  filters.teamQuery = teamFilterInput.value.trim();
  currentPage = 1;
  syncMatchesFilterPanel();
  renderMatches();
});

stageFilter.addEventListener("change", () => {
  filters.stage = stageFilter.value;
  currentPage = 1;
  syncMatchesFilterPanel();
  renderMatches();
});

dateFromInput.addEventListener("change", () => {
  filters.dateFrom = dateFromInput.value;
  currentPage = 1;
  syncMatchesFilterPanel();
  renderMatches();
});

dateToInput.addEventListener("change", () => {
  filters.dateTo = dateToInput.value;
  currentPage = 1;
  syncMatchesFilterPanel();
  renderMatches();
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
  syncMatchesFilterPanel();
  renderMatches();
});

prevPageBtn.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage -= 1;
    renderMatches();
  }
});

nextPageBtn.addEventListener("click", () => {
  const totalPages = Math.max(1, Math.ceil(getFilteredMatches().length / PAGE_SIZE));
  if (currentPage < totalPages) {
    currentPage += 1;
    renderMatches();
  }
});

leaderboardPrevPageBtn?.addEventListener("click", () => {
  if (leaderboardPage > 1) {
    leaderboardPage -= 1;
    renderLeaderboard();
  }
});

leaderboardNextPageBtn?.addEventListener("click", () => {
  const totalPages = Math.max(1, Math.ceil((appState.currentLeague?.leaderboard || []).length / PAGE_SIZE));
  if (leaderboardPage < totalPages) {
    leaderboardPage += 1;
    renderLeaderboard();
  }
});

matchesBody.addEventListener("click", (event) => {
  handleMatchInteraction(event);
});

matchesGroups?.addEventListener("click", (event) => {
  handleMatchInteraction(event);
});

function handleMatchInteraction(event) {
  const subgroupButton = event.target.closest("button[data-subgroup-tab]");
  if (subgroupButton) {
    const parentList = subgroupButton.closest(".match-group-list");
    if (parentList) {
      activateSubgroupTab(parentList, subgroupButton.dataset.subgroupTab || "");
    }
    return;
  }
  const adminButton = event.target.closest("button[data-open-bets-match]");
  if (adminButton) {
    adminBetsFilters.matchId = adminButton.dataset.openBetsMatch || "";
    adminBetsPage = 1;
    renderAdminBetsMatchOptions();
    renderAdminBetsExplorer();
    setActiveView("porras");
    return;
  }
  const modalButton = event.target.closest("button[data-open-prediction-modal]");
  if (!modalButton) return;
  openPredictionModal(modalButton.dataset.openPredictionModal || "");
}

superadminAdminForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (appState.viewer?.role !== "superadmin") return;

  try {
    setLoading(true, "Creando admin...");
    await postJson("/api/admin/users", {
      organizationId: organizationSelect?.value || "",
      organizationName: organizationNameInput.value.trim(),
      displayName: adminNameInput.value.trim(),
      email: adminEmailInput.value.trim(),
      password: adminPasswordInput.value,
    });
    superadminAdminForm.reset();
    syncSuperadminAdminForm();
    superadminStatus.textContent = "Admin creado correctamente.";
    setActiveSuperadminSection("admins");
    await refreshApp();
  } catch (error) {
    superadminStatus.textContent = error.message;
  }
});

adminsBody.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-edit-admin]");
  if (!button) return;
  const admin = appState.superadminData?.admins?.find((entry) => entry.id === button.dataset.editAdmin);
  if (!admin) return;

  if (organizationSelect) {
    organizationSelect.value = admin.organizationId || "";
  }
  syncSuperadminAdminForm();
  organizationNameInput.value = admin.organizationName || "";
  adminNameInput.value = admin.displayName || "";
  adminEmailInput.value = admin.email || "";
  adminPasswordInput.value = "";
  superadminStatus.textContent = `Editando a ${admin.displayName}. Vuelve a enviar el formulario si quieres crear otro admin.`;
  setActiveSuperadminSection("admins");
});

organizationsList?.addEventListener("click", (event) => {
  const toggleButton = event.target.closest("button[data-toggle-organization]");
  if (toggleButton) {
    const organization = (appState.superadminData?.organizations || []).find(
      (entry) => entry.id === toggleButton.dataset.toggleOrganization,
    );
    if (!organization) return;
    const willActivate = toggleButton.dataset.nextState === "1";
    openDeleteConfirmation({
      title: willActivate ? "Activar organización" : "Desactivar organización",
      message: willActivate
        ? `Se activará la organización ${organization.name} para que su operación vuelva a estar disponible.`
        : `Se desactivará la organización ${organization.name}. Sus admins y usuarios ya no podrán operar hasta reactivarla.`,
      summary: [
        `Estado actual: ${organization.isActive ? "Activa" : "Inactiva"}`,
        `Admins asociados: ${organization.adminCount || 0}`,
        `Usuarios finales: ${organization.userCount || 0}`,
      ],
      confirmWord: "CONFIRMAR",
      actionLabel: willActivate ? "Activar organización" : "Desactivar organización",
      buttonClass: willActivate ? "btn btn-cyan" : "btn btn-ghost",
      run: async () => {
        await patchJson(`/api/superadmin/organizations/${encodeURIComponent(organization.id)}`, { isActive: willActivate });
        await refreshApp();
      },
    });
    return;
  }

  const button = event.target.closest("button[data-delete-organization]");
  if (!button) return;
  const organization = (appState.superadminData?.organizations || []).find((entry) => entry.id === button.dataset.deleteOrganization);
  if (!organization) return;

  openDeleteConfirmation({
    title: "Eliminar organización",
    message: `Se eliminará por completo la organización ${organization.name}. Esta acción no se puede deshacer.`,
    summary: [
      `Admins asociados: ${organization.adminCount || 0}`,
      `Usuarios finales: ${organization.userCount || 0}`,
      `Ligas creadas: ${organization.leagueCount || 0}`,
    ],
    actionLabel: "Eliminar organización",
    run: async () => {
      await deleteJson(`/api/superadmin/organizations/${encodeURIComponent(organization.id)}`);
      await refreshApp();
    },
  });
});

userForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (appState.viewer?.role !== "admin") return;

  try {
    setLoading(true, userIdInput.value ? "Actualizando usuario..." : "Creando usuario...");
    const payload = readUserForm();
    if (userIdInput.value) {
      await patchJson(`/api/admin/users/${encodeURIComponent(userIdInput.value)}`, payload);
      userStatus.textContent = "Usuario actualizado.";
    } else {
      await postJson("/api/admin/users", payload);
      userStatus.textContent = "Usuario creado.";
    }
    resetUserForm();
    await refreshApp(appState.currentLeague?.id || "");
  } catch (error) {
    userStatus.textContent = error.message;
  }
});

resetUserFormBtn.addEventListener("click", resetUserForm);

downloadImportTemplateBtn?.addEventListener("click", async () => {
  try {
    ensureBulkImportHasLeagues();
    setLoading(true, "Generando plantilla...");
    const csv = await getText("/api/admin/users/import-template");
    downloadCsvFile(csv, "plantilla-carga-usuarios.csv");
  } catch (error) {
    if (bulkImportStatus) bulkImportStatus.textContent = error.message;
  } finally {
    setLoading(false);
  }
});

bulkImportPreviewBtn?.addEventListener("click", async () => {
  if (appState.viewer?.role !== "admin") return;
  try {
    ensureBulkImportHasLeagues();
    const csvText = await readBulkImportFile();
    setLoading(true, "Validando archivo...");
    const result = await postJson("/api/admin/users/import-preview", { csvText });
    bulkImportPreviewState = { csvText, ...result };
    bulkImportPage = 1;
    renderBulkImportPreview();
    openBulkImportModal();
    if (bulkImportStatus) {
      bulkImportStatus.textContent = `Archivo validado. ${result.summary.valid} listo(s), ${result.summary.conflicts} en conflicto, ${result.summary.errors} con error.`;
    }
  } catch (error) {
    bulkImportPreviewState = null;
    renderBulkImportPreview();
    if (bulkImportStatus) bulkImportStatus.textContent = error.message;
  } finally {
    setLoading(false);
  }
});

bulkImportConfirmBtn?.addEventListener("click", async () => {
  if (appState.viewer?.role !== "admin" || !bulkImportPreviewState?.csvText) return;
  try {
    ensureBulkImportHasLeagues();
    setLoading(true, "Importando usuarios...");
    const result = await postJson("/api/admin/users/import-commit", { csvText: bulkImportPreviewState.csvText });
    if (result.reportCsv) {
      downloadCsvFile(result.reportCsv, `resultado-carga-usuarios-${new Date().toISOString().slice(0, 10)}.csv`);
    }
    closeBulkImportModal();
    clearBulkImportState();
    if (bulkImportStatus) {
      bulkImportStatus.textContent = `Importación completada. ${result.summary.created} usuario(s) creado(s), ${result.summary.skipped} omitido(s), ${result.summary.errors} con error. El reporte se descargó automáticamente.`;
    }
    await refreshApp(appState.currentLeague?.id || "");
  } catch (error) {
    if (bulkImportStatus) bulkImportStatus.textContent = error.message;
  } finally {
    setLoading(false);
  }
});

bulkImportExportBtn?.addEventListener("click", () => {
  if (!bulkImportPreviewState?.reportCsv) {
    if (bulkImportStatus) bulkImportStatus.textContent = "No hay resultado para exportar todavía.";
    return;
  }
  downloadCsvFile(bulkImportPreviewState.reportCsv, `resultado-carga-usuarios-${new Date().toISOString().slice(0, 10)}.csv`);
});

bulkImportOpenPreviewBtn?.addEventListener("click", () => {
  if (!bulkImportPreviewState?.rows?.length) {
    if (bulkImportStatus) bulkImportStatus.textContent = "Primero valida un archivo para ver el detalle.";
    return;
  }
  openBulkImportModal();
});

bulkImportModalCloseBtn?.addEventListener("click", closeBulkImportModal);

bulkImportModal?.addEventListener("click", (event) => {
  if (event.target === bulkImportModal) closeBulkImportModal();
});

bulkImportPageSizeInput?.addEventListener("change", () => {
  bulkImportPageSize = Number(bulkImportPageSizeInput.value) || 10;
  bulkImportPage = 1;
  renderBulkImportPreview();
});

bulkImportPrevPageBtn?.addEventListener("click", () => {
  bulkImportPage = Math.max(1, bulkImportPage - 1);
  renderBulkImportPreview();
});

bulkImportNextPageBtn?.addEventListener("click", () => {
  const totalRows = bulkImportPreviewState?.rows?.length || 0;
  const totalPages = Math.max(1, Math.ceil(totalRows / bulkImportPageSize));
  bulkImportPage = Math.min(totalPages, bulkImportPage + 1);
  renderBulkImportPreview();
});

usersBody.addEventListener("click", (event) => {
  const deleteButton = event.target.closest("button[data-delete-user]");
  if (deleteButton) {
    const user = appState.adminData?.users?.find((entry) => entry.id === deleteButton.dataset.deleteUser);
    if (!user) return;
    openDeleteConfirmation({
      title: "Eliminar usuario",
      message: `Se eliminará el usuario ${user.displayName} y todas sus porras registradas.`,
      summary: [
        `Correo: ${user.email}`,
        `Ligas asignadas: ${(user.leagues || []).length}`,
      ],
      actionLabel: "Eliminar usuario",
      run: async () => {
        await deleteJson(`/api/admin/users/${encodeURIComponent(user.id)}`);
        await refreshApp(appState.currentLeague?.id || "");
      },
    });
    return;
  }

  const button = event.target.closest("button[data-edit-user]");
  if (!button) return;

  const user = appState.adminData?.users?.find((entry) => entry.id === button.dataset.editUser);
  if (!user) return;

  userIdInput.value = user.id;
  userNameInput.value = user.displayName;
  userEmailInput.value = user.email;
  userPasswordInput.value = "";
  userActiveInput.checked = user.isActive;
  [...userLeaguesInput.options].forEach((option) => {
    option.selected = (user.leagueIds || []).includes(option.value);
  });
  userStatus.textContent = `Editando a ${user.displayName}.`;
  setActiveView("admin");
});

deleteAllUsersBtn?.addEventListener("click", () => {
  const users = appState.adminData?.users || [];
  openDeleteConfirmation({
    title: "Eliminar todos los usuarios",
    message: "Se eliminarán todos los usuarios finales de tu organización y todas sus porras registradas.",
    summary: [
      `Usuarios a eliminar: ${users.length}`,
      `Ligas existentes: ${(appState.adminData?.leagues || []).length}`,
    ],
    actionLabel: "Eliminar usuarios",
    run: async () => {
      await deleteJson("/api/admin/users");
      await refreshApp(appState.currentLeague?.id || "");
    },
  });
});

resetRequestsBody.addEventListener("click", async (event) => {
  const button = event.target.closest("button[data-issue-temporary]");
  if (!button) return;

  try {
    setLoading(true, "Generando contraseña temporal...");
    const result = await postJson(
      `/api/admin/password-reset-requests/${encodeURIComponent(button.dataset.issueTemporary)}/issue-temporary`,
      {},
    );
    temporaryPasswordNotice = `Contraseña temporal: ${result.temporaryPassword}`;
    resetRequestStatus.textContent = temporaryPasswordNotice;
    await refreshApp(appState.currentLeague?.id || "");
  } catch (error) {
    temporaryPasswordNotice = error.message;
    resetRequestStatus.textContent = temporaryPasswordNotice;
  }
});

adminLeagueForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (appState.viewer?.role !== "admin") return;

  try {
    setLoading(true, "Creando liga...");
    const payload = readAdminLeagueForm();
    const response = await postJson("/api/admin/leagues", payload);
    adminLeagueStatus.textContent = "Liga creada.";
    adminLeagueForm.reset();
    if (response?.league?.id) {
      localStorage.setItem(LEAGUE_STORAGE_KEY, response.league.id);
      await refreshApp(response.league.id);
    } else {
      await refreshApp(appState.currentLeague?.id || "");
    }
  } catch (error) {
    adminLeagueStatus.textContent = error.message;
  }
});

deleteAllLeaguesBtn?.addEventListener("click", () => {
  const leagues = appState.adminData?.leagues || [];
  openDeleteConfirmation({
    title: "Eliminar todas las ligas",
    message: "Se eliminarán todas las ligas de tu organización junto con membresías y porras. Los partidos/resultados compartidos se conservarán para otras organizaciones.",
    summary: [
      `Ligas a eliminar: ${leagues.length}`,
      `Usuarios actuales: ${(appState.adminData?.users || []).length}`,
    ],
    actionLabel: "Eliminar ligas",
    run: async () => {
      await deleteJson("/api/admin/leagues");
      await refreshApp("");
    },
  });
});

passwordChangeForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    setLoading(true, "Actualizando contraseña...");
    const result = await postJson("/api/auth/change-password", {
      currentPassword: currentPasswordInput.value,
      newPassword: newPasswordInput.value,
    });
    appState.viewer = {
      ...appState.viewer,
      ...(result.user || {}),
      mustChangePassword: false,
    };
    passwordChangeForm.reset();
    passwordChangeStatus.textContent = "";
    passwordChangeModal.hidden = true;
    render();
    await refreshApp(appState.currentLeague?.id || "");
  } catch (error) {
    passwordChangeStatus.textContent = error.message;
  }
});

profileForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
    setLoading(true, "Actualizando perfil...");
    const result = await patchJson("/api/auth/profile", {
      displayName: profileDisplayNameInput.value.trim(),
      email: profileEmailInput.value.trim(),
      currentPassword: profileCurrentPasswordInput.value,
      newPassword: profileNewPasswordInput.value,
    });
    appState.viewer = {
      ...appState.viewer,
      ...(result.user || {}),
    };
    profileCurrentPasswordInput.value = "";
    profileNewPasswordInput.value = "";
    profileStatus.textContent = "Perfil actualizado.";
    render();
    await refreshApp(appState.currentLeague?.id || "");
  } catch (error) {
    profileStatus.textContent = error.message;
  } finally {
    setLoading(false);
  }
});

adminBetsMatch?.addEventListener("change", () => {
  adminBetsFilters.matchId = adminBetsMatch.value;
  adminBetsPage = 1;
  renderAdminBetsExplorer();
});

adminBetsUserFilter?.addEventListener("input", () => {
  adminBetsFilters.userQuery = adminBetsUserFilter.value.trim();
  adminBetsPage = 1;
  renderAdminBetsExplorer();
});

adminBetsOutcomeFilter?.addEventListener("change", () => {
  adminBetsFilters.outcome = adminBetsOutcomeFilter.value;
  adminBetsPage = 1;
  renderAdminBetsExplorer();
});

adminBetsPrevPageBtn?.addEventListener("click", () => {
  if (adminBetsPage > 1) {
    adminBetsPage -= 1;
    renderAdminBetsExplorer();
  }
});

adminBetsNextPageBtn?.addEventListener("click", () => {
  const totalPages = Math.max(1, Math.ceil(getAdminVisiblePredictions().length / PAGE_SIZE));
  if (adminBetsPage < totalPages) {
    adminBetsPage += 1;
    renderAdminBetsExplorer();
  }
});

menuButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const view = button.dataset.view;
    if (!view || button.hidden) return;
    closeMobileMenu();
    setActiveView(view);
  });
});

async function initialize() {
  const cachedState = readCachedState();
  if (cachedState) {
    appState = cachedState;
    render();
  }
  await refreshApp(localStorage.getItem(LEAGUE_STORAGE_KEY) || "");
}

async function refreshApp(preferredLeagueId = "") {
  setLoading(true, "Cargando datos...");
  try {
    const query = preferredLeagueId ? `?leagueId=${encodeURIComponent(preferredLeagueId)}` : "";
    const bootstrap = await getJson(`/api/bootstrap${query}`);
    if (bootstrap.setupRequired || !bootstrap.authenticated) {
      window.location.replace("/login");
      return;
    }

    appState = {
      ...createInitialState(),
      ...bootstrap,
      competitions: [],
    };

    const cachedLeagueState = bootstrap.currentLeague?.id
      ? readCachedStateByLeagueId(bootstrap.currentLeague.id)
      : null;
    if (appState.currentLeague?.id && cachedLeagueState?.currentLeague) {
      if (cachedLeagueState.currentLeague.teamAssets) {
        appState.currentLeague.teamAssets = cachedLeagueState.currentLeague.teamAssets;
      }
      if (cachedLeagueState.currentLeague.matches?.length) {
        mergeCachedMatchMetadata(cachedLeagueState.currentLeague.matches);
      }
    }

    render();

    if (bootstrap.viewer?.role !== "superadmin" && !bootstrap.viewer?.mustChangePassword) {
      const competitionsPayload = await getJson("/api/competitions").catch(() => ({ competitions: [] }));
      appState.competitions = Array.isArray(competitionsPayload?.competitions) ? competitionsPayload.competitions : [];
    }

    if (bootstrap.viewer?.role === "superadmin") {
      await loadAuditLogs();
    } else {
      auditLogs = [];
    }

    if (appState.currentLeague?.id) {
      localStorage.setItem(LEAGUE_STORAGE_KEY, appState.currentLeague.id);
    } else if (appState.viewer?.role !== "superadmin") {
      localStorage.removeItem(LEAGUE_STORAGE_KEY);
    }
    persistCache();
  } catch (error) {
    console.error(error);
    window.location.replace("/login");
    return;
  } finally {
    setLoading(false);
    hideBootSplash();
  }

  render();
  void loadLeagueVisualAssets();
  maybeOpenGuide();
}

async function loadLeagueVisualAssets() {
  const leagueId = appState.currentLeague?.id;
  if (!leagueId || appState.viewer?.role === "superadmin") return;
  try {
    const payload = await getJson(`/api/leagues/${encodeURIComponent(leagueId)}/team-assets`);
    if (!appState.currentLeague || appState.currentLeague.id !== leagueId) return;
    appState.currentLeague.teamAssets = payload?.assets && typeof payload.assets === "object" ? payload.assets : {};
    mergeMatchGroups(payload?.matchGroups);
    renderMatches();
    persistCache();
  } catch (error) {
    console.warn("No se pudieron cargar assets de equipos:", error);
  }
}

async function loadAuditLogs() {
  if (appState.viewer?.role !== "superadmin") return;
  try {
    const organizationId = auditOrgFilter?.value || "";
    const query = organizationId ? `?organizationId=${encodeURIComponent(organizationId)}` : "";
    const payload = await getJson(`/api/superadmin/audit-logs${query}`);
    auditLogs = Array.isArray(payload?.logs) ? payload.logs : [];
    if (auditStatus) {
      auditStatus.textContent = `Mostrando ${auditLogs.length} registros${organizationId ? " de la organización seleccionada" : ""}.`;
    }
    renderAuditLogs();
  } catch (error) {
    auditLogs = [];
    if (auditStatus) auditStatus.textContent = error.message;
    renderAuditLogs();
  }
}

function exportAuditLogsCsv() {
  if (!auditLogs.length) {
    if (auditStatus) auditStatus.textContent = "No hay registros para exportar.";
    return;
  }

  const rows = [
    ["fecha", "organizacion", "actor", "rol_actor", "accion", "entidad", "detalle"],
    ...auditLogs.map((log) => [
      log.createdAt,
      log.organizationName || "Global",
      log.actorDisplayName || "",
      log.actorRole || "",
      formatAuditAction(log.actionType),
      `${log.entityType}${log.entityLabel ? `: ${log.entityLabel}` : ""}`,
      formatAuditDetails(log.details),
    ]),
  ];

  const csv = rows.map((row) => row.map(toCsvCell).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function render() {
  const role = appState.viewer?.role || null;
  const superadminMode = role === "superadmin";
  const adminMode = role === "admin";
  const userMode = role === "user";
  const leagueMode = adminMode || userMode;

  appShell.hidden = false;

  if (superadminMode) {
    activeView = "admin";
  } else if (activeView === "admin" && !adminMode) {
    activeView = "resumen";
  }

  viewerName.textContent = appState.viewer.displayName;
  viewerRole.textContent = role.toUpperCase();
  if (guideTrigger) guideTrigger.hidden = !role;

  leagueSwitcher.closest(".topbar-select").hidden = !leagueMode;
  leagueSwitcher.disabled = !leagueMode || !appState.leagues.length;
  summaryButton.hidden = !leagueMode;
  matchesButton.hidden = !leagueMode;
  betsButton.hidden = !adminMode;
  rankingButton.hidden = !leagueMode;
  standingsButton.hidden = !leagueMode;
  adminNavBtn.hidden = !(superadminMode || adminMode);
  if (betsNavBtn) betsNavBtn.hidden = !adminMode;

  renderLeagueSwitcher();
  renderCompetitionOptions();
  renderLeagueSummary();
  renderMembers();
  renderProfileForm();
  renderStageFilter();
  renderMatches();
  renderAdminBetsMatchOptions();
  renderAdminBetsExplorer();
  renderLeaderboard();
  renderStandings();
  renderStats();
  renderAdmin();
  renderForcedPasswordChange();
  renderSuperadminSections();
  syncMobileMenuVisibility();
  setActiveView(activeView);
}

function setActiveView(view) {
  const allowed = getAllowedViews();
  const nextView = allowed.includes(view) ? view : allowed[0];
  activeView = nextView;

  menuButtons.forEach((button) => {
    const isActive = button.dataset.view === activeView;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  viewPanels.forEach((panel) => {
    panel.classList.toggle("active", panel.dataset.panel === activeView);
  });
}

function getAllowedViews() {
  const role = appState.viewer?.role;
  if (role === "superadmin") return ["admin"];
  if (role === "admin") return ["resumen", "partidos", "porras", "clasificacion", "tabla", "admin"];
  if (role === "user") return ["resumen", "partidos", "clasificacion", "tabla"];
  return ["resumen"];
}

function renderLeagueSwitcher() {
  leagueSwitcher.innerHTML = "";
  if (appState.viewer?.role === "superadmin") return;

  if (!appState.leagues.length) {
    leagueSwitcher.innerHTML = '<option value="">Sin ligas</option>';
    return;
  }

  appState.leagues.forEach((league) => {
    const option = document.createElement("option");
    option.value = league.id;
    option.textContent = league.name;
    leagueSwitcher.appendChild(option);
  });

  leagueSwitcher.value = appState.currentLeague?.id || appState.leagues[0]?.id || "";
}

function renderCompetitionOptions() {
  const selects = [competitionSelect, adminLeagueCompetitionInput];
  selects.forEach((select) => {
    select.innerHTML = '<option value="">Selecciona...</option>';
    appState.competitions.forEach((competition) => {
      const option = document.createElement("option");
      option.value = competition.code;
      option.textContent = `${competition.name} (${competition.code})`;
      option.dataset.competitionId = String(competition.id || "");
      option.dataset.competitionName = competition.name || competition.code;
      select.appendChild(option);
    });
  });

  if (appState.currentLeague) {
    competitionSelect.value = appState.currentLeague.competitionCode || "";
  }
}

function renderLeagueSummary() {
  const league = appState.currentLeague;
  const role = appState.viewer?.role;
  leagueConfigCard.hidden = true;

  if (role === "superadmin") {
    const activeOrganizations = (appState.organizations || []).filter((organization) => organization.isActive);
    leagueTitle.textContent = "Panel SaaS";
    leagueSubtitle.textContent = "Gestiona la operación multi-tenant desde vistas separadas para organizaciones, admins, perfil y auditoría.";
    currentCompetitionLabel.textContent = `${activeOrganizations.length} organizaciones activas`;
    lastSyncLabel.textContent = `${appState.superadminData?.admins?.length || 0} admins creados`;
    rulesSummaryEl.textContent = "Cada admin trabaja solo dentro de su propia organización.";
    leagueSettingsForm.reset();
    setLeagueSettingsEnabled(false);
    return;
  }

  if (!league) {
    const organizationName = appState.adminData?.organization?.name || appState.organizations[0]?.name || "tu organización";
    leagueTitle.textContent = "Sin ligas disponibles";
    leagueSubtitle.textContent = role === "admin"
      ? `Crea tu primera liga para ${organizationName}.`
      : "Tu admin aún no te ha autorizado a una liga.";
    currentCompetitionLabel.textContent = "Sin competición";
    lastSyncLabel.textContent = "Sin sincronización";
    rulesSummaryEl.textContent = "Sin reglas activas";
    leagueSettingsForm.reset();
    setLeagueSettingsEnabled(false);
    return;
  }

  leagueTitle.textContent = league.name;
  leagueSubtitle.textContent = `${league.competitionName} · Temporada ${league.season}`;
  currentCompetitionLabel.textContent = `${league.competitionName} (${league.competitionCode})`;
  lastSyncLabel.textContent = league.lastSyncAt
    ? `Última sincronización: ${formatDateTime(league.lastSyncAt)}`
    : "Sin sincronización todavía";
  rulesSummaryEl.textContent =
    `Exacto ${league.exactPoints} pts · tendencia ${league.outcomePoints} pts · cierre ${league.lockMinutes} min`;

  leagueNameInput.value = league.name || "";
  competitionSelect.value = league.competitionCode || "";
  seasonInput.value = String(league.season || "");
  exactPointsInput.value = String(league.exactPoints || "");
  outcomePointsInput.value = String(league.outcomePoints || "");
  lockMinutesInput.value = String(league.lockMinutes || "");

  setLeagueSettingsEnabled(false);
}

function renderProfileForm() {
  if (!profileForm || !appState.viewer) return;
  profileDisplayNameInput.value = appState.viewer.displayName || "";
  profileEmailInput.value = appState.viewer.email || "";
}

function setLeagueSettingsEnabled(enabled) {
  [leagueNameInput, competitionSelect, seasonInput, exactPointsInput, outcomePointsInput, lockMinutesInput].forEach(
    (input) => {
      input.disabled = true;
      input.readOnly = true;
    },
  );
  syncBtn.disabled = !enabled;
}

function renderMembers() {
  if (membersCard) {
    membersCard.hidden = appState.viewer?.role !== "superadmin";
  }
  if (membersCard?.hidden) return;
  membersList.innerHTML = "";
  if (appState.viewer?.role === "superadmin") {
    appState.organizations.forEach((organization) => {
      const chip = document.createElement("span");
      chip.className = "chip";
      chip.textContent = organization.name;
      membersList.appendChild(chip);
    });
    return;
  }

  const members = appState.currentLeague?.members || [];
  if (!members.length) {
    membersList.innerHTML = '<span class="muted">No hay usuarios asignados a esta liga.</span>';
    return;
  }

  members.forEach((member) => {
    const chip = document.createElement("span");
    chip.className = "chip";
    chip.dataset.initial = member.displayName.charAt(0).toUpperCase();
    chip.innerHTML = `${escapeHtml(member.displayName)} <small>${escapeHtml(member.role.toUpperCase())}</small>`;
    membersList.appendChild(chip);
  });
}

function currentPredictionForMatch(matchId) {
  return (appState.currentLeague?.predictions || []).find(
    (prediction) => prediction.userId === appState.viewer?.id && prediction.matchId === matchId,
  );
}

async function savePrediction(matchId, homeGoals, awayGoals, setMessage, onSuccess) {
  if (predictionMutationInFlight) return;
  try {
    predictionMutationInFlight = true;
    setPredictionModalPending(true);
    setLoading(true, "Guardando porra...");
    const result = await postJson("/api/league/predictions", {
      leagueId: appState.currentLeague?.id,
      matchId,
      homeGoals,
      awayGoals,
    });
    upsertLocalPrediction(result.prediction);
    renderMatches();
    renderStats();
    persistCache();
    if (typeof onSuccess === "function") onSuccess(result.prediction);
    setMessage("Porra guardada.");
  } catch (error) {
    setMessage(error.message, true);
  } finally {
    predictionMutationInFlight = false;
    setPredictionModalPending(false);
    setLoading(false);
  }
}

async function deletePrediction(prediction, setMessage, onSuccess) {
  if (predictionMutationInFlight) return;
  try {
    predictionMutationInFlight = true;
    setPredictionModalPending(true);
    setLoading(true, "Eliminando porra...");
    await deleteJson(`/api/league/predictions/${encodeURIComponent(prediction.id)}`);
    removeLocalPrediction(prediction.id);
    renderMatches();
    renderStats();
    persistCache();
    if (typeof onSuccess === "function") onSuccess();
    setMessage("Porra eliminada.");
  } catch (error) {
    setMessage(error.message, true);
  } finally {
    predictionMutationInFlight = false;
    setPredictionModalPending(false);
    setLoading(false);
  }
}

function openPredictionModal(matchId) {
  if (appState.viewer?.role !== "user" || !predictionModal) return;
  window.clearTimeout(predictionModalCloseTimer);
  activePredictionModalMatchId = matchId;
  predictionModal.hidden = false;
  syncPredictionModalState();
}

function closePredictionModal() {
  window.clearTimeout(predictionModalCloseTimer);
  activePredictionModalMatchId = "";
  predictionMutationInFlight = false;
  setPredictionModalPending(false);
  if (predictionModal) predictionModal.hidden = true;
}

function setPredictionModalMessage(message, isError = false) {
  if (!predictionModalStatus) return;
  predictionModalStatus.textContent = message;
  predictionModalStatus.style.color = isError ? "var(--danger)" : "";
}

function syncPredictionModalState() {
  if (!predictionModal || !appState.currentLeague) return;
  const match = appState.currentLeague.matches.find((entry) => entry.id === activePredictionModalMatchId);
  const prediction = currentPredictionForMatch(activePredictionModalMatchId);

  if (!match) {
    predictionModalHomeTeam.innerHTML = "";
    predictionModalAwayTeam.innerHTML = "";
    predictionModalHomeInput.value = "";
    predictionModalAwayInput.value = "";
    predictionModalDeleteBtn.disabled = true;
    predictionModalSubtitle.textContent = "Selecciona un partido para registrar tu apuesta.";
    setPredictionModalMessage("Selecciona un partido para hacer tu porra.");
    return;
  }

  predictionModalSubtitle.textContent = `${formatDateTime(match.utcDate)} · ${match.canPredict ? "Apuestas abiertas" : "Apuestas cerradas"}`;
  predictionModalHomeTeam.innerHTML = renderTeamLineHtml(match.homeTeam, "home");
  predictionModalAwayTeam.innerHTML = renderTeamLineHtml(match.awayTeam, "away");
  predictionModalDeleteBtn.disabled = !prediction;

  if (prediction) {
    predictionModalHomeInput.value = String(prediction.homeGoals);
    predictionModalAwayInput.value = String(prediction.awayGoals);
    setPredictionModalMessage("Ya tienes una porra guardada. Puedes modificarla.");
    return;
  }

  predictionModalHomeInput.value = "";
  predictionModalAwayInput.value = "";
  setPredictionModalMessage(match.canPredict
    ? `Puedes apostar hasta ${formatDateTime(match.lockedAt)}.`
    : "Este partido ya cerró las apuestas.");
}

function setPredictionModalPending(isPending) {
  if (!predictionModalForm) return;
  predictionModalForm.querySelectorAll("input, button").forEach((element) => {
    if (element === predictionModalCloseBtn) return;
    element.disabled = isPending;
  });
}

function upsertLocalPrediction(prediction) {
  if (!prediction || !appState.currentLeague) return;
  const predictions = appState.currentLeague.predictions || [];
  const nextPrediction = {
    ...prediction,
    userId: prediction.userId || appState.viewer?.id,
    displayName: prediction.displayName || appState.viewer?.displayName || "Usuario",
    email: prediction.email || appState.viewer?.email || "",
    pointsAwarded: Number(prediction.pointsAwarded || 0),
  };
  const existingIndex = predictions.findIndex((entry) => (
    entry.id === nextPrediction.id ||
    (entry.userId === nextPrediction.userId && entry.matchId === nextPrediction.matchId)
  ));
  if (existingIndex >= 0) {
    predictions[existingIndex] = { ...predictions[existingIndex], ...nextPrediction };
  } else {
    predictions.unshift(nextPrediction);
  }
  appState.currentLeague.predictions = predictions;
}

function removeLocalPrediction(predictionId) {
  if (!predictionId || !appState.currentLeague) return;
  appState.currentLeague.predictions = (appState.currentLeague.predictions || []).filter(
    (prediction) => prediction.id !== predictionId,
  );
}

function renderStageFilter() {
  stageFilter.innerHTML = '<option value="">Todas</option>';
  const stages = Array.from(new Set((appState.currentLeague?.matches || []).map((match) => match.stage).filter(Boolean))).sort();
  stages.forEach((stage) => {
    const option = document.createElement("option");
    option.value = stage;
    option.textContent = stage;
    stageFilter.appendChild(option);
  });
  stageFilter.value = stages.includes(filters.stage) ? filters.stage : "";
  syncMatchesFilterPanel();
}

function hasActiveMatchFilters() {
  return Boolean(filters.teamQuery || filters.stage || filters.dateFrom || filters.dateTo);
}

function syncMatchesFilterPanel() {
  if (!matchesFiltersPanel) return;
  matchesFiltersPanel.open = hasActiveMatchFilters();
}

function renderMobileMatchGroups(matches, isAdmin) {
  if (!matchesGroups) return;
  if (!matches.length) {
    matchesGroups.innerHTML = '<div class="config-card"><p class="status-msg">No hay partidos con esos filtros.</p></div>';
    return;
  }

  const groups = buildStageGroups(matches);

  matchesGroups.innerHTML = "";
  groups.forEach((group, index) => {
    const block = document.createElement("details");
    block.className = "match-group";
    block.open = index === 0;
    block.innerHTML = `
      <summary class="match-group-summary">
        <div>
          <strong>${escapeHtml(group.label)}</strong>
          <span>${group.matches.length} ${group.matches.length === 1 ? "partido" : "partidos"}</span>
        </div>
      </summary>
      <div class="match-group-list"></div>
    `;
    const list = block.querySelector(".match-group-list");
    if (group.subgroups?.length) {
      list.innerHTML = renderSubgroupButtons(group.subgroups);
      group.subgroups.forEach((subgroup, subgroupIndex) => {
        const panel = document.createElement("div");
        panel.className = `match-subgroup-panel ${getStageLayoutClass(group.label)}`.trim();
        panel.dataset.subgroupPanel = subgroup.id;
        panel.hidden = subgroupIndex !== 0;
        subgroup.matches.forEach((match) => {
          panel.appendChild(createMobileMatchCard(match, isAdmin));
        });
        list.appendChild(panel);
      });
    } else {
      const panel = document.createElement("div");
      panel.className = `match-subgroup-panel ${getStageLayoutClass(group.label)}`.trim();
      group.matches.forEach((match) => {
        panel.appendChild(createMobileMatchCard(match, isAdmin));
      });
      list.appendChild(panel);
    }
    matchesGroups.appendChild(block);
  });
}

function createMobileMatchCard(match, isAdmin) {
  const predictions = (appState.currentLeague?.predictions || []).filter((prediction) => prediction.matchId === match.id);
  const card = document.createElement("article");
  card.className = "match-card-mobile";
  card.innerHTML = `
    <div class="match-card-head">
      <span class="match-card-date">${formatDateTime(match.utcDate)}</span>
      <span class="match-card-status">${escapeHtml(statusBadge(match))}</span>
    </div>
    <div class="match-card-teams">
      ${renderTeamLineHtml(match.homeTeam, "home")}
      <div class="match-card-score">${escapeHtml(formatRealScore(match))}</div>
      ${renderTeamLineHtml(match.awayTeam, "away")}
    </div>
    <div class="match-card-footer">
      ${renderMatchPredictionSummary(match, predictions, isAdmin)}
    </div>
  `;
  return card;
}

function renderSubgroupButtons(subgroups) {
  return `
    <div class="match-subgroup-tabs" role="tablist" aria-label="Grupos de la fase">
      ${subgroups.map((subgroup, index) => `
        <button
          type="button"
          class="match-subgroup-tab${index === 0 ? " is-active" : ""}"
          data-subgroup-tab="${escapeHtml(subgroup.id)}"
          aria-pressed="${index === 0 ? "true" : "false"}"
        >
          ${escapeHtml(subgroup.label)}
        </button>
      `).join("")}
    </div>
  `;
}

function activateSubgroupTab(container, subgroupId) {
  if (!container || !subgroupId) return;
  container.querySelectorAll("[data-subgroup-tab]").forEach((button) => {
    const isActive = button.dataset.subgroupTab === subgroupId;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
  container.querySelectorAll("[data-subgroup-panel]").forEach((panel) => {
    panel.hidden = panel.dataset.subgroupPanel !== subgroupId;
  });
}

function buildStageGroups(matches) {
  const teamGroups = buildStandingTeamGroups();
  const stages = new Map();

  matches.forEach((match) => {
    const stageLabel = match.stage || "Sin fase";
    const stageEntry = stages.get(stageLabel) || {
      label: stageLabel,
      matches: [],
      subgroupMap: new Map(),
    };
    stageEntry.matches.push(match);

    const subgroupLabel = resolveMatchSubgroupLabel(match, teamGroups);
    if (subgroupLabel) {
      const subgroupKey = normalizeText(subgroupLabel);
      const subgroupEntry = stageEntry.subgroupMap.get(subgroupKey) || {
        id: subgroupKey,
        label: subgroupLabel,
        matches: [],
      };
      subgroupEntry.matches.push(match);
      stageEntry.subgroupMap.set(subgroupKey, subgroupEntry);
    }

    stages.set(stageLabel, stageEntry);
  });

  return [...stages.values()].map((stage) => ({
    label: stage.label,
    matches: stage.matches,
    subgroups: stage.subgroupMap.size > 1
      ? [...stage.subgroupMap.values()].sort((left, right) => left.label.localeCompare(right.label, "es"))
      : null,
  }));
}

function buildStandingTeamGroups() {
  const lookup = [];
  (appState.currentLeague?.standings || []).forEach((standing) => {
    const match = String(standing.label || "").match(/Grupo\s+([A-Z0-9]+)/i);
    if (!match) return;
    const label = `Grupo ${String(match[1]).toUpperCase()}`;
    const teams = new Set();
    (standing.rows || []).forEach((row) => {
      const raw = String(row.team || "").trim();
      if (!raw) return;
      teams.add(normalizeText(raw));
      teams.add(normalizeText(formatTeamName(raw)));
    });
    if (teams.size) {
      lookup.push({ label, teams });
    }
  });
  return lookup;
}

function mergeMatchGroups(matchGroups) {
  if (!appState.currentLeague?.matches?.length || !matchGroups || typeof matchGroups !== "object") return;
  appState.currentLeague.matches = appState.currentLeague.matches.map((match) => ({
    ...match,
    subgroupLabel: matchGroups[String(match.sourceMatchId)] || match.subgroupLabel || "",
  }));
}

function mergeCachedMatchMetadata(cachedMatches) {
  if (!appState.currentLeague?.matches?.length || !Array.isArray(cachedMatches)) return;
  const cachedById = new Map(cachedMatches.map((match) => [match.id, match]));
  appState.currentLeague.matches = appState.currentLeague.matches.map((match) => {
    const cached = cachedById.get(match.id);
    if (!cached) return match;
    return {
      ...match,
      subgroupLabel: cached.subgroupLabel || match.subgroupLabel || "",
    };
  });
}

function resolveMatchSubgroupLabel(match, teamGroups) {
  if (String(match.stage || "").toLowerCase() !== "fase de grupos") return "";
  if (match.subgroupLabel) return match.subgroupLabel;
  const homeTokens = [
    normalizeText(match.homeTeam),
    normalizeText(formatTeamName(match.homeTeam)),
  ];
  const awayTokens = [
    normalizeText(match.awayTeam),
    normalizeText(formatTeamName(match.awayTeam)),
  ];

  const found = teamGroups.find((group) => (
    homeTokens.some((token) => token && group.teams.has(token)) &&
    awayTokens.some((token) => token && group.teams.has(token))
  ));

  return found?.label || "";
}

function getStageLayoutClass(stageLabel) {
  const normalized = normalizeText(stageLabel);
  if (normalized === "semifinal" || normalized === "final" || normalized === "tercer puesto") {
    return "match-subgroup-panel--single";
  }
  return "match-subgroup-panel--compact";
}

function renderMatchPredictionSummary(match, predictions, isAdmin) {
  if (isAdmin) {
    return `
      <div class="match-bets-cell">
        <strong>${predictions.length}</strong>
        <span>${predictions.length === 1 ? "porra registrada" : "porras registradas"}</span>
        <button type="button" class="mini-link" data-open-bets-match="${escapeHtml(match.id)}">Ver detalle</button>
      </div>
    `;
  }

  if (!predictions.length) {
    return `
      <div class="match-card-cta">
        <span class="muted">${match.canPredict ? "Aún no has hecho tu porra." : "Sin porra registrada."}</span>
        ${match.canPredict
          ? `<button type="button" class="btn btn-ghost btn-xs match-card-action" data-open-prediction-modal="${escapeHtml(match.id)}">Apostar</button>`
          : ""}
      </div>
    `;
  }

  return predictions.map((prediction) => {
    const pointsText = match.isFinished ? ` · ${prediction.pointsAwarded} pts` : "";
    const edit = appState.viewer?.role === "user" && match.canPredict
      ? `<button type="button" class="btn btn-ghost btn-xs match-card-action" data-open-prediction-modal="${escapeHtml(match.id)}">Editar porra</button>`
      : "";
    return `
      <div class="match-card-cta">
        <span class="match-card-bet">Tu porra: ${prediction.homeGoals}-${prediction.awayGoals}${pointsText}</span>
        ${edit}
      </div>
    `;
  }).join("");
}

function renderMatches() {
  matchesBody.innerHTML = "";
  if (matchesGroups) matchesGroups.innerHTML = "";
  const matches = appState.currentLeague?.matches || [];
  const isAdmin = appState.viewer?.role === "admin";

  if (!matches.length) {
    matchesBody.innerHTML = '<tr><td colspan="6">No hay partidos cargados para esta liga.</td></tr>';
    if (matchesGroups) matchesGroups.innerHTML = '<div class="config-card"><p class="status-msg">No hay partidos cargados para esta liga.</p></div>';
    matchesVisibleEl.textContent = "Mostrando 0 de 0 partidos.";
    if (matchesTableWrap) matchesTableWrap.hidden = true;
    if (matchesGroups) matchesGroups.hidden = false;
    if (prevPageBtn) prevPageBtn.closest(".pagination").hidden = true;
    updatePagination(0, 1);
    return;
  }

  const filtered = getFilteredMatches();
  if (matchesTableWrap) matchesTableWrap.hidden = true;
  if (matchesGroups) matchesGroups.hidden = false;
  if (prevPageBtn) prevPageBtn.closest(".pagination").hidden = true;

  matchesVisibleEl.textContent = filtered.length
    ? `Mostrando ${filtered.length} partidos agrupados por fase.`
    : "No hay partidos con esos filtros.";
  renderMobileMatchGroups(filtered, isAdmin);
  updatePagination(0, 1);
}

function renderMatchTitleHtml(match) {
  return `
    <div class="match-title-inline">
      ${renderTeamLineHtml(match.homeTeam, "home")}
      <span class="match-title-separator">vs</span>
      ${renderTeamLineHtml(match.awayTeam, "away")}
    </div>
  `;
}

function formatMatchTitle(match) {
  return `${formatTeamName(match.homeTeam)} vs ${formatTeamName(match.awayTeam)}`;
}

function renderTeamLineHtml(name, side) {
  const team = getTeamPresentation(name);
  const teamAsset = getCurrentLeagueTeamAsset(name);
  const useNationalVisual = isNationalTeam(name);
  const visualUrl = !useNationalVisual && (teamAsset?.crestUrl || teamAsset?.proxyUrl)
    ? (teamAsset?.crestUrl || teamAsset?.proxyUrl)
    : team.flagCode
      ? getFlagAssetUrl(team.flagCode)
      : "";
  return `
    <div class="team-line team-line--${side}">
      ${visualUrl
        ? `<img class="team-flag-image" src="${escapeHtml(visualUrl)}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.hidden=true; if (this.nextElementSibling) this.nextElementSibling.hidden=false;">`
        : ""}
      <span class="team-flag"${team.flag ? "" : ' hidden'}${visualUrl ? ' hidden' : ""}>${team.flag || ""}</span>
      <span class="team-name">${escapeHtml(team.name)}</span>
    </div>
  `;
}

function renderAdminBetsMatchOptions() {
  if (appState.viewer?.role !== "admin" || !adminBetsMatch) return;
  const matches = getMatchesSortedForBets();
  adminBetsMatch.innerHTML = "";

  if (!matches.length) {
    adminBetsMatch.innerHTML = '<option value="">Sin partidos disponibles</option>';
    adminBetsFilters.matchId = "";
    return;
  }

  adminBetsMatch.innerHTML = '<option value="">Selecciona un partido</option>';
  matches.forEach((match) => {
    const option = document.createElement("option");
    option.value = match.id;
    option.textContent = `${formatDateTime(match.utcDate)} - ${formatMatchTitle(match)}`;
    adminBetsMatch.appendChild(option);
  });

  if (!adminBetsFilters.matchId || !matches.some((match) => match.id === adminBetsFilters.matchId)) {
    adminBetsFilters.matchId = matches[0]?.id || "";
  }
  adminBetsMatch.value = adminBetsFilters.matchId;
}

function renderAdminBetsExplorer() {
  if (!adminBetsBody || appState.viewer?.role !== "admin") return;

  const matches = appState.currentLeague?.matches || [];
  const selectedMatch = matches.find((match) => match.id === adminBetsFilters.matchId);
  const predictions = getAdminVisiblePredictions();
  const summary = summarizePredictions(predictions);

  adminBetsTotal.textContent = String(predictions.length);
  adminBetsHome.textContent = String(summary.home);
  adminBetsDraw.textContent = String(summary.draw);
  adminBetsAway.textContent = String(summary.away);

  adminBetsBody.innerHTML = "";

  if (!selectedMatch) {
    adminBetsMeta.textContent = "Selecciona un partido para revisar cómo apostaron tus usuarios.";
    adminBetsBody.innerHTML = '<tr><td colspan="5">No hay un partido seleccionado.</td></tr>';
    adminBetsPageInfo.textContent = "Página 1 de 1";
    adminBetsPrevPageBtn.disabled = true;
    adminBetsNextPageBtn.disabled = true;
    return;
  }

  adminBetsMeta.textContent = `${formatMatchTitle(selectedMatch)} · ${formatDateTime(selectedMatch.utcDate)}`;

  if (!predictions.length) {
    adminBetsBody.innerHTML = '<tr><td colspan="5">Aún no hay porras para este partido.</td></tr>';
    adminBetsPageInfo.textContent = "Página 1 de 1";
    adminBetsPrevPageBtn.disabled = true;
    adminBetsNextPageBtn.disabled = true;
    return;
  }

  const totalPages = Math.max(1, Math.ceil(predictions.length / PAGE_SIZE));
  if (adminBetsPage > totalPages) adminBetsPage = totalPages;
  const pageRows = predictions.slice((adminBetsPage - 1) * PAGE_SIZE, adminBetsPage * PAGE_SIZE);

  pageRows.forEach((prediction) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${escapeHtml(prediction.displayName)}</td>
      <td>${escapeHtml(prediction.email || "Sin correo")}</td>
      <td>${prediction.homeGoals}-${prediction.awayGoals}</td>
      <td>${predictionOutcomeLabel(prediction)}</td>
      <td>${selectedMatch.isFinished ? prediction.pointsAwarded : "-"}</td>
    `;
    adminBetsBody.appendChild(row);
  });

  adminBetsPageInfo.textContent = `Página ${adminBetsPage} de ${totalPages}`;
  adminBetsPrevPageBtn.disabled = adminBetsPage <= 1;
  adminBetsNextPageBtn.disabled = adminBetsPage >= totalPages;
}

function getMatchesSortedForBets() {
  return [...(appState.currentLeague?.matches || [])].sort(compareMatchesForDisplay);
}

function getAdminVisiblePredictions() {
  if (appState.viewer?.role !== "admin" || !adminBetsFilters.matchId) return [];
  const query = normalizeText(adminBetsFilters.userQuery);
  return [...(appState.currentLeague?.predictions || [])]
    .filter((prediction) => prediction.matchId === adminBetsFilters.matchId)
    .filter((prediction) => {
      if (!query) return true;
      return normalizeText(prediction.displayName).includes(query) || normalizeText(prediction.email || "").includes(query);
    })
    .filter((prediction) => {
      if (!adminBetsFilters.outcome) return true;
      return predictionOutcome(prediction) === adminBetsFilters.outcome;
    })
    .sort((left, right) => normalizeText(left.displayName).localeCompare(normalizeText(right.displayName)));
}

function summarizePredictions(predictions) {
  return predictions.reduce((summary, prediction) => {
    const outcome = predictionOutcome(prediction);
    summary[outcome] += 1;
    return summary;
  }, { home: 0, draw: 0, away: 0 });
}

function predictionOutcome(prediction) {
  if (prediction.homeGoals > prediction.awayGoals) return "home";
  if (prediction.homeGoals < prediction.awayGoals) return "away";
  return "draw";
}

function predictionOutcomeLabel(prediction) {
  const outcome = predictionOutcome(prediction);
  if (outcome === "home") return "Gana local";
  if (outcome === "away") return "Gana visita";
  return "Empate";
}

function getFilteredMatches() {
  return [...(appState.currentLeague?.matches || [])]
    .filter((match) => {
      if (filters.stage && match.stage !== filters.stage) return false;
      const matchDate = formatDateInput(match.utcDate);
      if (filters.dateFrom && matchDate < filters.dateFrom) return false;
      if (filters.dateTo && matchDate > filters.dateTo) return false;
      if (filters.teamQuery) {
        const query = normalizeText(filters.teamQuery);
        const homeSearch = `${normalizeText(match.homeTeam)} ${normalizeText(formatTeamName(match.homeTeam))}`;
        const awaySearch = `${normalizeText(match.awayTeam)} ${normalizeText(formatTeamName(match.awayTeam))}`;
        if (!homeSearch.includes(query) && !awaySearch.includes(query)) {
          return false;
        }
      }
      return true;
    })
    .sort(compareMatchesForDisplay);
}

function renderLeaderboard() {
  leaderboardBody.innerHTML = "";
  const leaderboard = appState.currentLeague?.leaderboard || [];
  if (!leaderboard.length) {
    leaderboardBody.innerHTML = '<tr><td colspan="5">No hay ranking disponible aún.</td></tr>';
    if (leaderboardPageInfo) leaderboardPageInfo.textContent = "Página 1 de 1";
    if (leaderboardPrevPageBtn) leaderboardPrevPageBtn.disabled = true;
    if (leaderboardNextPageBtn) leaderboardNextPageBtn.disabled = true;
    return;
  }

  const totalPages = Math.max(1, Math.ceil(leaderboard.length / PAGE_SIZE));
  if (leaderboardPage > totalPages) leaderboardPage = totalPages;
  const pageEntries = leaderboard.slice((leaderboardPage - 1) * PAGE_SIZE, leaderboardPage * PAGE_SIZE);

  pageEntries.forEach((entry, index) => {
    const absoluteIndex = (leaderboardPage - 1) * PAGE_SIZE + index;
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${absoluteIndex + 1}</td>
      <td>${escapeHtml(entry.displayName)}</td>
      <td>${entry.predictionsCount}</td>
      <td>${entry.exactHits}</td>
      <td>${entry.points}</td>
    `;
    leaderboardBody.appendChild(row);
  });

  if (leaderboardPageInfo) leaderboardPageInfo.textContent = `Página ${leaderboardPage} de ${totalPages}`;
  if (leaderboardPrevPageBtn) leaderboardPrevPageBtn.disabled = leaderboardPage <= 1;
  if (leaderboardNextPageBtn) leaderboardNextPageBtn.disabled = leaderboardPage >= totalPages;
}

function renderStandings() {
  standingsContainer.innerHTML = "";
  standingsMetaEl.textContent = "";
  const standings = appState.currentLeague?.standings || [];

  if (!standings.length) {
    standingsContainer.innerHTML = '<p class="muted">No hay tabla disponible para esta liga.</p>';
    return;
  }

  standingsMetaEl.textContent = `${standings.length} tabla(s) disponibles`;
  standings.forEach((standing) => {
    const group = document.createElement("div");
    group.className = "standings-group";
    group.innerHTML = `<h3>${escapeHtml(standing.label)}</h3>`;

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
            .map((row) => `
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
              </tr>`)
            .join("")}
        </tbody>
      </table>
    `;
    group.appendChild(wrap);
    standingsContainer.appendChild(group);
  });
}

function renderStats() {
  const matches = appState.currentLeague?.matches || [];
  const predictions = appState.currentLeague?.predictions || [];
  const role = appState.viewer?.role;
  if (stat4Card) stat4Card.hidden = true;
  if (totalMembersEl) totalMembersEl.textContent = "0";

  applyStatsConfig([
    { icon: "L", tag: "LIGA", name: "Partidos", tone: "cyan" },
    { icon: "F", tag: "FINAL", name: "Finalizados", tone: "green" },
    { icon: "P", tag: "PORRAS", name: "Predicciones", tone: "orange" },
  ]);

  if (role === "superadmin") {
    totalMatchesEl.textContent = String(appState.organizations.length);
    finishedMatchesEl.textContent = String(appState.superadminData?.admins?.filter((admin) => admin.isActive).length || 0);
    totalPredictionsEl.textContent = String(appState.superadminData?.admins?.length || 0);
    return;
  }

  if (role === "user") {
    const leaderboard = appState.currentLeague?.leaderboard || [];
    const position = leaderboard.findIndex((entry) => entry.userId === appState.viewer?.id);
    const currentEntry = position >= 0 ? leaderboard[position] : null;
    const openMatches = matches.filter((match) => match.canPredict).length;
    applyStatsConfig([
      { icon: "PT", tag: "PUNTOS", name: "Puntos totales", tone: "cyan" },
      { icon: "#", tag: "RANK", name: "Posición actual", tone: "green" },
      { icon: "A", tag: "ABIERTAS", name: "Partidos por apostar", tone: "orange" },
    ]);
    totalMatchesEl.textContent = String(currentEntry?.points || 0);
    finishedMatchesEl.textContent = position >= 0 ? String(position + 1) : "-";
    totalPredictionsEl.textContent = String(openMatches);
    return;
  }

  if (role === "admin") {
    if (stat4Card) stat4Card.hidden = false;
    if (totalMembersEl) totalMembersEl.textContent = String(appState.currentLeague?.members?.length || 0);
    applyStatsConfig([
      { icon: "L", tag: "LIGA", name: "Partidos", tone: "cyan" },
      { icon: "F", tag: "FINAL", name: "Finalizados", tone: "green" },
      { icon: "P", tag: "PORRAS", name: "Predicciones", tone: "orange" },
      { icon: "U", tag: "USERS", name: "Participantes autorizados", tone: "cyan" },
    ]);
  }

  totalMatchesEl.textContent = String(matches.length);
  finishedMatchesEl.textContent = String(matches.filter((match) => match.isFinished).length);
  totalPredictionsEl.textContent = String(predictions.length);
}

function applyStatsConfig(config) {
  const nodes = [
    { icon: stat1Icon, tag: stat1Tag, name: stat1Name },
    { icon: stat2Icon, tag: stat2Tag, name: stat2Name },
    { icon: stat3Icon, tag: stat3Tag, name: stat3Name },
    { icon: stat4Icon, tag: stat4Tag, name: stat4Name },
  ];

  nodes.forEach((node, index) => {
    const entry = config[index];
    if (!node.icon || !node.tag || !node.name || !entry) return;
    node.icon.textContent = entry.icon;
    node.tag.textContent = entry.tag;
    node.name.textContent = entry.name;
    node.icon.className = `stat-icon stat-icon--${entry.tone}`;
  });
}

function renderAdmin() {
  const role = appState.viewer?.role;
  superadminPanel.hidden = role !== "superadmin";
  adminPanel.hidden = role !== "admin";
  adminEmptyPanel.hidden = role === "superadmin" || role === "admin";
  resetRequestStatus.textContent = temporaryPasswordNotice;

  if (role === "superadmin") {
    renderOrganizations();
    renderAdminsTable();
    renderAuditFilter();
    renderAuditLogs();
    renderSuperadminOrganizationOptions();
    renderSuperadminSections();
    return;
  }

  if (role === "admin") {
    renderUserLeagueOptions();
    renderBulkImportPreview();
    renderUsersTable();
    renderResetRequestsTable();
    renderLeaguesTable();
  }
}

function bindSuperadminSections() {
  superadminNavButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const nextSection = button.dataset.superadminView;
      if (!nextSection) return;
      setActiveSuperadminSection(nextSection);
    });
  });
}

function bindSuperadminAdminForm() {
  organizationSelect?.addEventListener("change", syncSuperadminAdminForm);
}

function setActiveSuperadminSection(section) {
  const allowed = superadminSections.map((entry) => entry.dataset.superadminSection).filter(Boolean);
  activeSuperadminSection = allowed.includes(section) ? section : "organizations";
  renderSuperadminSections();
}

function renderSuperadminSections() {
  if (appState.viewer?.role !== "superadmin") return;
  superadminNavButtons.forEach((button) => {
    const isActive = button.dataset.superadminView === activeSuperadminSection;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
  superadminSections.forEach((section) => {
    const isActive = section.dataset.superadminSection === activeSuperadminSection;
    section.hidden = !isActive;
    section.classList.toggle("active", isActive);
  });
}

function renderSuperadminOrganizationOptions() {
  if (!organizationSelect) return;
  const organizations = appState.superadminData?.organizations || [];
  const currentValue = organizationSelect.value;
  organizationSelect.innerHTML = '<option value="">Crear una organización nueva</option>';
  organizations.forEach((organization) => {
    const option = document.createElement("option");
    option.value = organization.id;
    option.textContent = `${organization.name}${organization.isActive ? "" : " · Inactiva"}`;
    organizationSelect.appendChild(option);
  });
  organizationSelect.value = organizations.some((entry) => entry.id === currentValue) ? currentValue : "";
  syncSuperadminAdminForm();
}

function syncSuperadminAdminForm() {
  if (!organizationNameInput) return;
  const usingExistingOrganization = Boolean(organizationSelect?.value);
  organizationNameInput.disabled = usingExistingOrganization;
  organizationNameInput.readOnly = usingExistingOrganization;
  organizationNameInput.placeholder = usingExistingOrganization
    ? "Se usará la organización seleccionada"
    : "Solo si vas a crear una nueva";
  if (usingExistingOrganization) {
    organizationNameInput.value = "";
  }
}

function renderOrganizations() {
  organizationsList.innerHTML = "";
  const organizations = appState.superadminData?.organizations || [];
  if (!organizations.length) {
    organizationsList.innerHTML = '<span class="muted">Aún no hay organizaciones creadas.</span>';
    return;
  }

  organizations.forEach((organization) => {
    const chip = document.createElement("div");
    chip.className = "chip organization-card";
    chip.dataset.initial = organization.name.charAt(0).toUpperCase();
    chip.innerHTML = `
      <div class="chip-body">
        <span>${escapeHtml(organization.name)}</span>
        <small>${organization.adminCount || 0} admin · ${organization.userCount || 0} usuarios · ${organization.leagueCount || 0} ligas · ${organization.isActive ? "Activa" : "Inactiva"}</small>
      </div>
      <div class="table-actions">
        <button
          type="button"
          class="btn ${organization.isActive ? "btn-ghost" : "btn-cyan"} btn-xs"
          data-toggle-organization="${escapeHtml(organization.id)}"
          data-next-state="${organization.isActive ? "0" : "1"}"
        >
          ${organization.isActive ? "Desactivar" : "Activar"}
        </button>
        <button type="button" class="btn btn-ghost-danger btn-xs" data-delete-organization="${escapeHtml(organization.id)}">Eliminar</button>
      </div>
    `;
    organizationsList.appendChild(chip);
  });
}

function renderAuditFilter() {
  if (!auditOrgFilter) return;
  const organizations = appState.superadminData?.organizations || [];
  const currentValue = auditOrgFilter.value;
  auditOrgFilter.innerHTML = '<option value="">Todas las organizaciones</option>';
  organizations.forEach((organization) => {
    const option = document.createElement("option");
    option.value = organization.id;
    option.textContent = organization.name;
    auditOrgFilter.appendChild(option);
  });
  auditOrgFilter.value = organizations.some((entry) => entry.id === currentValue) ? currentValue : "";
}

function renderAuditLogs() {
  if (!auditBody) return;
  auditBody.innerHTML = "";
  if (!auditLogs.length) {
    auditBody.innerHTML = '<tr><td colspan="6">No hay registros de auditoría para este filtro.</td></tr>';
    return;
  }

  auditLogs.forEach((log) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${formatDateTime(log.createdAt)}</td>
      <td>${escapeHtml(log.organizationName || "Global")}</td>
      <td>${escapeHtml(log.actorDisplayName)} <small>${escapeHtml(String(log.actorRole).toUpperCase())}</small></td>
      <td>${escapeHtml(formatAuditAction(log.actionType))}</td>
      <td>${escapeHtml(log.entityType)}${log.entityLabel ? ` · ${escapeHtml(log.entityLabel)}` : ""}</td>
      <td>${escapeHtml(formatAuditDetails(log.details))}</td>
    `;
    auditBody.appendChild(row);
  });
}

function renderAdminsTable() {
  adminsBody.innerHTML = "";
  const admins = appState.superadminData?.admins || [];
  if (!admins.length) {
    adminsBody.innerHTML = '<tr><td colspan="5">Aún no hay admins creados.</td></tr>';
    return;
  }

  admins.forEach((admin) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${escapeHtml(admin.organizationName || "Sin organización")}</td>
      <td>${escapeHtml(admin.displayName)}</td>
      <td>${escapeHtml(admin.email)}</td>
      <td>${admin.isActive ? "Activo" : "Inactivo"}</td>
      <td><button type="button" class="btn btn-ghost btn-sm" data-edit-admin="${escapeHtml(admin.id)}">Ver</button></td>
    `;
    adminsBody.appendChild(row);
  });
}

function renderUserLeagueOptions() {
  userLeaguesInput.innerHTML = "";
  (appState.adminData?.leagues || []).forEach((league) => {
    const option = document.createElement("option");
    option.value = league.id;
    option.textContent = league.name;
    userLeaguesInput.appendChild(option);
  });
}

function renderBulkImportPreview() {
  if (!bulkImportPreviewBody || appState.viewer?.role !== "admin") return;
  const hasLeagues = Boolean(appState.adminData?.leagues?.length);
  const rows = bulkImportPreviewState?.rows || [];
  const summary = bulkImportPreviewState?.summary || null;

  renderBulkImportLeagueHelp();

  if (downloadImportTemplateBtn) {
    downloadImportTemplateBtn.disabled = !hasLeagues;
  }
  if (bulkImportPreviewBtn) {
    bulkImportPreviewBtn.disabled = !hasLeagues;
  }
  if (bulkImportOpenPreviewBtn) {
    bulkImportOpenPreviewBtn.disabled = !hasLeagues || !rows.length;
  }
  if (bulkImportFileInput) {
    bulkImportFileInput.disabled = !hasLeagues;
  }

  if (bulkImportSummary) {
    bulkImportSummary.hidden = !summary;
    if (summary) {
      const isCommitted = Number(summary.created || 0) > 0 || Number(summary.skipped || 0) > 0;
      bulkImportSummary.innerHTML = `
        <div class="quick-item quick-item--static">
          <div class="quick-icon">${isCommitted ? "C" : "V"}</div>
          <div class="quick-body">
            <span class="quick-title">${isCommitted ? "Creados" : "Válidos"}</span>
            <span class="quick-sub">${isCommitted ? (summary.created ?? 0) : (summary.valid ?? 0)}</span>
          </div>
        </div>
        <div class="quick-item quick-item--static">
          <div class="quick-icon">${isCommitted ? "O" : "C"}</div>
          <div class="quick-body">
            <span class="quick-title">${isCommitted ? "Omitidos" : "Conflictos"}</span>
            <span class="quick-sub">${isCommitted ? (summary.skipped ?? 0) : (summary.conflicts ?? 0)}</span>
          </div>
        </div>
        <div class="quick-item quick-item--static">
          <div class="quick-icon">E</div>
          <div class="quick-body">
            <span class="quick-title">Errores</span>
            <span class="quick-sub">${summary.errors ?? 0}</span>
          </div>
        </div>
      `;
    } else {
      bulkImportSummary.innerHTML = "";
    }
  }

  if (bulkImportConfirmBtn) {
    bulkImportConfirmBtn.disabled = !hasLeagues || !summary || !(summary.valid > 0) || Boolean(summary.created);
  }
  if (bulkImportExportBtn) {
    bulkImportExportBtn.disabled = !bulkImportPreviewState?.reportCsv;
  }

  if (bulkImportModalSummary) {
    bulkImportModalSummary.textContent = summary
      ? `${rows.length} fila(s) revisadas. ${summary.valid ?? 0} lista(s), ${summary.conflicts ?? 0} conflicto(s), ${summary.errors ?? 0} error(es).`
      : "Valida un archivo para revisar el detalle.";
  }

  bulkImportPreviewBody.innerHTML = "";
  if (!hasLeagues) {
    bulkImportPreviewBody.innerHTML = '<tr><td colspan="7">Primero crea al menos una liga para poder importar usuarios.</td></tr>';
    renderBulkImportPagination(0);
    return;
  }
  if (!rows.length) {
    bulkImportPreviewBody.innerHTML = '<tr><td colspan="7">Todavía no has cargado un archivo.</td></tr>';
    renderBulkImportPagination(0);
    return;
  }

  const totalPages = Math.max(1, Math.ceil(rows.length / bulkImportPageSize));
  bulkImportPage = Math.min(Math.max(1, bulkImportPage), totalPages);
  const start = (bulkImportPage - 1) * bulkImportPageSize;
  const visibleRows = rows.slice(start, start + bulkImportPageSize);

  visibleRows.forEach((row) => {
    const leagues = Array.isArray(row.leagues) ? row.leagues.join(", ") : "";
    const detail = Array.isArray(row.messages) ? row.messages.join(" · ") : "";
    const temporaryPassword = row.temporaryPassword || "—";
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${row.lineNumber}</td>
      <td>${escapeHtml(formatBulkImportStatus(row.status))}</td>
      <td>${escapeHtml(row.displayName || "")}</td>
      <td>${escapeHtml(row.email || "")}</td>
      <td>${escapeHtml(leagues || "—")}</td>
      <td>${escapeHtml(detail || "Sin novedades")}</td>
      <td>${escapeHtml(temporaryPassword)}</td>
    `;
    bulkImportPreviewBody.appendChild(tr);
  });

  renderBulkImportPagination(rows.length);
}

function renderBulkImportPagination(totalRows) {
  const totalPages = Math.max(1, Math.ceil(totalRows / bulkImportPageSize));
  bulkImportPage = Math.min(Math.max(1, bulkImportPage), totalPages);

  if (bulkImportPageSizeInput) {
    bulkImportPageSizeInput.value = String(bulkImportPageSize);
  }
  if (bulkImportPageInfo) {
    bulkImportPageInfo.textContent = totalRows
      ? `Página ${bulkImportPage} de ${totalPages} · ${totalRows} fila(s)`
      : "Sin filas para mostrar";
  }
  if (bulkImportPrevPageBtn) {
    bulkImportPrevPageBtn.disabled = !totalRows || bulkImportPage <= 1;
  }
  if (bulkImportNextPageBtn) {
    bulkImportNextPageBtn.disabled = !totalRows || bulkImportPage >= totalPages;
  }
}

function openBulkImportModal() {
  if (!bulkImportModal) return;
  bulkImportModal.hidden = false;
  renderBulkImportPreview();
}

function closeBulkImportModal() {
  if (!bulkImportModal) return;
  bulkImportModal.hidden = true;
}

function clearBulkImportState() {
  bulkImportPreviewState = null;
  bulkImportPage = 1;
  if (bulkImportFileInput) bulkImportFileInput.value = "";
  renderBulkImportPreview();
}

function renderBulkImportLeagueHelp() {
  if (!bulkImportLeagues) return;
  const leagues = appState.adminData?.leagues || [];
  if (!leagues.length) {
    bulkImportLeagues.innerHTML = `
      <div class="import-league-empty">
        Primero crea una liga. Después podrás descargar una plantilla con nombres reales y validar usuarios para esa organización.
      </div>
    `;
    if (bulkImportStatus && !bulkImportStatus.textContent) {
      bulkImportStatus.textContent = "La carga masiva se habilita cuando exista al menos una liga.";
    }
    return;
  }

  bulkImportLeagues.innerHTML = `
    <div class="import-league-title">Ligas disponibles para la columna "ligas"</div>
    <div class="import-league-chips">
      ${leagues.map((league) => `
        <span class="import-league-chip">
          ${escapeHtml(league.name)}
          <small>${escapeHtml([league.slug, league.competitionCode].filter(Boolean).join(" · "))}</small>
        </span>
      `).join("")}
    </div>
  `;
}

function ensureBulkImportHasLeagues() {
  if (appState.adminData?.leagues?.length) return;
  throw new Error("Primero crea al menos una liga para poder descargar la plantilla o importar usuarios.");
}

function formatBulkImportStatus(status) {
  return {
    valid: "Listo",
    conflict: "Conflicto",
    error: "Error",
    created: "Creado",
    skipped: "Omitido",
  }[status] || status;
}

async function readBulkImportFile() {
  const file = bulkImportFileInput?.files?.[0];
  if (!file) throw new Error("Selecciona un archivo CSV.");
  const text = await file.text();
  if (!text.trim()) throw new Error("El archivo está vacío.");
  return text;
}

function downloadCsvFile(csv, filename) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function renderUsersTable() {
  usersBody.innerHTML = "";
  const users = appState.adminData?.users || [];
  const compact = isSmallScreen();
  if (deleteAllUsersBtn) deleteAllUsersBtn.disabled = !users.length;
  if (!users.length) {
    usersBody.innerHTML = '<tr><td colspan="5">No hay usuarios creados.</td></tr>';
    return;
  }

  users.forEach((user) => {
    const leagues = (user.leagues || []).map((league) => league.name).join(", ") || "Sin ligas";
    const row = document.createElement("tr");
    row.innerHTML = compact
      ? `
        <td>
          <div class="compact-row">
            <strong>${escapeHtml(user.displayName)}</strong>
            <span>${escapeHtml(user.email)}</span>
            <small>${escapeHtml(leagues)}</small>
          </div>
        </td>
        <td>${user.isActive ? "Activo" : "Inactivo"}</td>
        <td>
          <div class="table-actions">
            <button type="button" class="btn btn-ghost btn-sm" data-edit-user="${escapeHtml(user.id)}">Editar</button>
            <button type="button" class="btn btn-ghost-danger btn-sm" data-delete-user="${escapeHtml(user.id)}">Eliminar</button>
          </div>
        </td>
      `
      : `
        <td>${escapeHtml(user.displayName)}</td>
        <td>${escapeHtml(user.email)}</td>
        <td>${escapeHtml(leagues)}</td>
        <td>${user.isActive ? "Activo" : "Inactivo"}</td>
        <td>
          <div class="table-actions">
            <button type="button" class="btn btn-ghost btn-sm" data-edit-user="${escapeHtml(user.id)}">Editar</button>
            <button type="button" class="btn btn-ghost-danger btn-sm" data-delete-user="${escapeHtml(user.id)}">Eliminar</button>
          </div>
        </td>
      `;
    usersBody.appendChild(row);
  });
}

function renderLeaguesTable() {
  leaguesBody.innerHTML = "";
  const leagues = appState.adminData?.leagues || [];
  const compact = isSmallScreen();
  if (deleteAllLeaguesBtn) deleteAllLeaguesBtn.disabled = !leagues.length;
  if (!leagues.length) {
    leaguesBody.innerHTML = '<tr><td colspan="6">No hay ligas creadas.</td></tr>';
    return;
  }

  leagues.forEach((league) => {
    const row = document.createElement("tr");
    row.innerHTML = compact
      ? `
        <td>
          <div class="compact-row">
            <strong>${escapeHtml(league.name)}</strong>
            <span>${escapeHtml(league.competitionCode)} · ${league.season}</span>
            <small>Exacto ${league.exactPoints} · Tendencia ${league.outcomePoints}</small>
          </div>
        </td>
        <td>${league.isActive ? "Activa" : "Inactiva"}</td>
        <td>
          <div class="table-actions">
            <button type="button" class="btn btn-ghost btn-sm" data-sync-league="${escapeHtml(league.id)}">Sincronizar</button>
            <button type="button" class="btn btn-ghost-danger btn-sm" data-delete-league="${escapeHtml(league.id)}">Eliminar</button>
          </div>
        </td>
      `
      : `
        <td>${escapeHtml(league.name)}</td>
        <td>${escapeHtml(league.competitionName)} (${escapeHtml(league.competitionCode)})</td>
        <td>${league.season}</td>
        <td>Exacto ${league.exactPoints} · Tendencia ${league.outcomePoints} · Cierre ${league.lockMinutes}m</td>
        <td>${league.isActive ? "Activa" : "Inactiva"}</td>
        <td>
          <div class="table-actions">
            <button type="button" class="btn btn-ghost btn-sm" data-sync-league="${escapeHtml(league.id)}">Sincronizar</button>
            <button type="button" class="btn btn-ghost-danger btn-sm" data-delete-league="${escapeHtml(league.id)}">Eliminar</button>
          </div>
        </td>
      `;
    leaguesBody.appendChild(row);
  });
}

leaguesBody?.addEventListener("click", (event) => {
  const syncButton = event.target.closest("button[data-sync-league]");
  if (syncButton) {
    const league = appState.adminData?.leagues?.find((entry) => entry.id === syncButton.dataset.syncLeague);
    if (!league) return;
    syncLeagueById(league.id);
    return;
  }

  const button = event.target.closest("button[data-delete-league]");
  if (!button) return;
  const league = appState.adminData?.leagues?.find((entry) => entry.id === button.dataset.deleteLeague);
  if (!league) return;
  openDeleteConfirmation({
    title: "Eliminar liga",
    message: `Se eliminará la liga ${league.name} junto con membresías y porras asociadas. Los partidos/resultados compartidos se conservarán para otras organizaciones que usen el mismo torneo.`,
    summary: [
      `Competición: ${league.competitionName} (${league.competitionCode})`,
      `Temporada: ${league.season}`,
    ],
    actionLabel: "Eliminar liga",
    run: async () => {
      await deleteJson(`/api/admin/leagues/${encodeURIComponent(league.id)}`);
      await refreshApp("");
    },
  });
});

function renderResetRequestsTable() {
  resetRequestsBody.innerHTML = "";
  const requests = appState.adminData?.passwordResetRequests || [];
  const compact = isSmallScreen();
  if (!requests.length && !temporaryPasswordNotice) {
    resetRequestStatus.textContent = "";
  }
  if (!requests.length) {
    resetRequestsBody.innerHTML = '<tr><td colspan="4">No hay solicitudes pendientes.</td></tr>';
    return;
  }

  requests.forEach((request) => {
    const row = document.createElement("tr");
    row.innerHTML = compact
      ? `
        <td>
          <div class="compact-row">
            <strong>${escapeHtml(request.displayName)}</strong>
            <span>${escapeHtml(request.email)}</span>
            <small>${formatDateTime(request.requestedAt)}</small>
          </div>
        </td>
        <td><button type="button" class="btn btn-ghost btn-sm" data-issue-temporary="${escapeHtml(request.id)}">Emitir temporal</button></td>
      `
      : `
        <td>${escapeHtml(request.displayName)}</td>
        <td>${escapeHtml(request.email)}</td>
        <td>${formatDateTime(request.requestedAt)}</td>
        <td><button type="button" class="btn btn-ghost btn-sm" data-issue-temporary="${escapeHtml(request.id)}">Emitir temporal</button></td>
      `;
    resetRequestsBody.appendChild(row);
  });
}

function renderForcedPasswordChange() {
  const mustChange = Boolean(appState.viewer?.mustChangePassword);
  passwordChangeModal.hidden = !mustChange;
}

function readUserForm() {
  return {
    displayName: userNameInput.value.trim(),
    email: userEmailInput.value.trim(),
    password: userPasswordInput.value,
    role: "user",
    isActive: userActiveInput.checked,
    leagueIds: [...userLeaguesInput.selectedOptions].map((option) => option.value),
  };
}

function resetUserForm() {
  userForm.reset();
  userIdInput.value = "";
  userActiveInput.checked = true;
  [...userLeaguesInput.options].forEach((option) => {
    option.selected = false;
  });
  userStatus.textContent = "";
}

function readAdminLeagueForm() {
  const selectedOption = adminLeagueCompetitionInput.selectedOptions[0];
  return {
    name: adminLeagueNameInput.value.trim(),
    competitionCode: adminLeagueCompetitionInput.value,
    competitionId: Number(selectedOption?.dataset.competitionId || 0) || null,
    competitionName: selectedOption?.dataset.competitionName || adminLeagueCompetitionInput.value,
    season: Number(adminLeagueSeasonInput.value),
    exactPoints: Number(adminLeagueExactInput.value),
    outcomePoints: Number(adminLeagueOutcomeInput.value),
    lockMinutes: Number(adminLeagueLockInput.value),
    isActive: true,
  };
}

function readLeagueSettingsForm() {
  const selectedOption = competitionSelect.selectedOptions[0];
  return {
    name: leagueNameInput.value.trim(),
    competitionCode: competitionSelect.value,
    competitionId: Number(selectedOption?.dataset.competitionId || 0) || null,
    competitionName: selectedOption?.dataset.competitionName || competitionSelect.value,
    season: Number(seasonInput.value),
    exactPoints: Number(exactPointsInput.value),
    outcomePoints: Number(outcomePointsInput.value),
    lockMinutes: Number(lockMinutesInput.value),
    isActive: true,
  };
}

function updatePagination(totalItems, totalPages) {
  pageInfoEl.textContent = `Página ${currentPage} de ${totalPages}`;
  prevPageBtn.disabled = totalItems === 0 || currentPage <= 1;
  nextPageBtn.disabled = totalItems === 0 || currentPage >= totalPages;
}

function setStatus(message, isError = false) {
  syncStatus.textContent = message;
  syncStatus.style.color = isError ? "var(--danger)" : "";
}

function setLoading(isLoading, message = "Cargando datos...") {
  if (!loadingOverlay) return;
  loadingOverlay.hidden = !isLoading;
  if (loadingLabel) loadingLabel.textContent = message;
}

function clearSessionCache() {
  localStorage.removeItem(LEAGUE_STORAGE_KEY);
  localStorage.removeItem(CACHE_META_KEY);
}

function bindMobileMenu() {
  if (!mobileMenuToggle) return;
  mobileMenuToggle.addEventListener("click", () => {
    const willOpen = !topbarActions.classList.contains("open");
    topbarActions.classList.toggle("open", willOpen);
    if (topbarBackdrop) topbarBackdrop.hidden = !willOpen;
    mobileMenuToggle.classList.toggle("active", willOpen);
    mobileMenuToggle.setAttribute("aria-expanded", String(willOpen));
  });

  topbarBackdrop?.addEventListener("click", closeMobileMenu);

  window.addEventListener("resize", syncMobileMenuVisibility);
}

function bindGuide() {
  guideTrigger?.addEventListener("click", () => openGuide(true));
  guideCloseBtn?.addEventListener("click", closeGuide);
  guideAcceptBtn?.addEventListener("click", () => {
    if (guideDismissToggle?.checked) {
      markGuideSeen();
    }
    closeGuide();
  });
}

function bindDeleteConfirmation() {
  confirmDeleteInput?.addEventListener("input", () => {
    const expected = String(pendingDeleteAction?.confirmWord || "ELIMINAR").toUpperCase();
    confirmDeleteActionBtn.disabled = confirmDeleteInput.value.trim().toUpperCase() !== expected;
  });
  confirmDeleteCancelBtn?.addEventListener("click", closeDeleteConfirmation);
  confirmDeleteCloseBtn?.addEventListener("click", closeDeleteConfirmation);
  confirmDeleteActionBtn?.addEventListener("click", async () => {
    if (!pendingDeleteAction) return;
    try {
      confirmDeleteActionBtn.disabled = true;
      confirmDeleteStatus.textContent = "";
      setLoading(true, "Eliminando datos...");
      await pendingDeleteAction.run();
      closeDeleteConfirmation();
    } catch (error) {
      confirmDeleteStatus.textContent = error.message;
      confirmDeleteActionBtn.disabled = false;
    } finally {
      setLoading(false);
    }
  });
}

function openDeleteConfirmation(config) {
  pendingDeleteAction = config;
  const confirmWord = String(config.confirmWord || "ELIMINAR").toUpperCase();
  confirmDeleteTitle.textContent = config.title;
  confirmDeleteMessage.textContent = config.message;
  confirmDeleteSummary.innerHTML = `
    <strong>${escapeHtml(config.actionLabel)}</strong>
    <ul class="guide-points">
      ${(config.summary || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
    </ul>
  `;
  if (confirmDeletePrompt) {
    confirmDeletePrompt.textContent = `Escribe ${confirmWord} para confirmar`;
  }
  confirmDeleteInput.value = "";
  confirmDeleteStatus.textContent = "";
  confirmDeleteActionBtn.textContent = config.actionLabel;
  confirmDeleteActionBtn.className = config.buttonClass || "btn btn-ghost-danger";
  confirmDeleteActionBtn.disabled = true;
  confirmDeleteModal.hidden = false;
}

function closeDeleteConfirmation() {
  pendingDeleteAction = null;
  confirmDeleteModal.hidden = true;
}

function formatAuditAction(actionType) {
  return String(actionType || "")
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatAuditDetails(details) {
  if (!details || typeof details !== "object") return "";
  const entries = Object.entries(details).filter(([, value]) => value != null && value !== "");
  return entries.map(([key, value]) => `${key}: ${value}`).join(" · ");
}

function toCsvCell(value) {
  const text = String(value ?? "");
  return `"${text.replaceAll('"', '""')}"`;
}

function getGuideSections() {
  return GUIDE_CONTENT[appState.viewer?.role] || [];
}

function maybeOpenGuide() {
  const role = appState.viewer?.role;
  if (!role) return;
  const storageKey = `${GUIDE_STORAGE_PREFIX}:${role}`;
  if (localStorage.getItem(storageKey)) return;
  openGuide(false);
}

function openGuide(forceReset) {
  const sections = getGuideSections();
  if (!sections.length || !guideModal) return;
  if (forceReset && guideDismissToggle) {
    guideDismissToggle.checked = false;
  }
  renderGuide();
  guideModal.hidden = false;
}

function closeGuide() {
  if (!guideModal) return;
  guideModal.hidden = true;
}

function renderGuide() {
  const role = appState.viewer?.role;
  const sections = getGuideSections();
  if (!sections.length) return;

  guideTitle.textContent = role === "admin" ? "Guía del administrador" : role === "user" ? "Guía del usuario" : "Guía del superadmin";
  guideSubtitle.textContent = role === "admin"
    ? "Aquí tienes una guía clara por vistas para operar ligas, usuarios y revisiones de porras."
    : role === "user"
      ? "Aquí tienes una guía por vistas para apostar y seguir tu desempeño dentro de la liga."
      : "Aquí tienes una guía por vistas para administrar la plataforma SaaS y sus organizaciones.";
  guideSections.innerHTML = sections
    .map((section) => `
      <article class="guide-section">
        <div class="guide-section-top">
          <span class="guide-view-badge">${escapeHtml(section.view)}</span>
        </div>
        <ul class="guide-points">
          ${section.points.map((point) => `<li>${escapeHtml(point)}</li>`).join("")}
        </ul>
      </article>
    `)
    .join("");
}

function markGuideSeen() {
  const role = appState.viewer?.role;
  if (!role) return;
  localStorage.setItem(`${GUIDE_STORAGE_PREFIX}:${role}`, "1");
}

function hideBootSplash() {
  if (!bootSplash) return;
  bootSplash.hidden = true;
}

function isSmallScreen() {
  return window.innerWidth <= 899;
}

function closeMobileMenu() {
  if (!mobileMenuToggle) return;
  topbarActions.classList.remove("open");
  if (topbarBackdrop) topbarBackdrop.hidden = true;
  mobileMenuToggle.classList.remove("active");
  mobileMenuToggle.setAttribute("aria-expanded", "false");
}

function syncMobileMenuVisibility() {
  if (!mobileMenuToggle) return;
  if (window.innerWidth > 899) {
    topbarActions.classList.remove("open");
    mobileMenuToggle.classList.remove("active");
    mobileMenuToggle.setAttribute("aria-expanded", "false");
  }
  if (appState.viewer?.role) {
    renderMatches();
    renderAdmin();
    renderLeaderboard();
  }
}

function bindPasswordToggles() {
  document.querySelectorAll("[data-toggle-password]").forEach((button) => {
    button.addEventListener("click", () => {
      const input = document.getElementById(button.dataset.togglePassword || "");
      if (!input) return;
      const show = input.type === "password";
      input.type = show ? "text" : "password";
      button.textContent = show ? "Ocultar" : "Ver";
    });
  });
}

function createInitialState() {
  return {
    setupRequired: false,
    authenticated: false,
    viewer: null,
    organizations: [],
    leagues: [],
    currentLeague: null,
    adminData: null,
    superadminData: null,
    competitions: [],
  };
}

async function getJson(url) {
  const response = await fetch(url, { credentials: "same-origin" });
  return handleResponse(response);
}

async function getText(url) {
  const response = await fetch(url, { credentials: "same-origin" });
  if (!response.ok) {
    let payload = null;
    try {
      payload = await response.json();
    } catch {
      payload = null;
    }
    throw new Error(payload?.error || payload?.message || "Ocurrió un error.");
  }
  return response.text();
}

async function postJson(url, payload) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    credentials: "same-origin",
  });
  return handleResponse(response);
}

async function patchJson(url, payload) {
  const response = await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    credentials: "same-origin",
  });
  return handleResponse(response);
}

async function deleteJson(url) {
  const response = await fetch(url, {
    method: "DELETE",
    credentials: "same-origin",
  });
  return handleResponse(response);
}

async function handleResponse(response) {
  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    throw new Error(payload?.error || payload?.message || "Ocurrió un error.");
  }

  return payload;
}

function cacheKey(viewerId, leagueId, role) {
  return `${CACHE_PREFIX}:${viewerId}:${role}:${leagueId || "default"}`;
}

function persistCache() {
  if (!appState.authenticated || !appState.viewer?.id) return;

  const activeLeagueId = appState.currentLeague?.id || "";
  localStorage.setItem(
    cacheKey(appState.viewer.id, activeLeagueId, appState.viewer.role),
    JSON.stringify({
      appState,
      activeView,
      currentPage,
      cachedAt: new Date().toISOString(),
    }),
  );
  localStorage.setItem(
    CACHE_META_KEY,
    JSON.stringify({
      viewerId: appState.viewer.id,
      role: appState.viewer.role,
      leagueId: activeLeagueId,
    }),
  );
}

function readCachedState() {
  try {
    const meta = JSON.parse(localStorage.getItem(CACHE_META_KEY) || "null");
    if (!meta?.viewerId) return null;
    const snapshot = JSON.parse(localStorage.getItem(cacheKey(meta.viewerId, meta.leagueId || "", meta.role || "user")) || "null");
    if (!snapshot?.appState?.viewer?.id) return null;
    activeView = snapshot.activeView || activeView;
    currentPage = snapshot.currentPage || currentPage;
    return snapshot.appState;
  } catch {
    return null;
  }
}

function readCachedStateByLeagueId(leagueId) {
  try {
    const meta = JSON.parse(localStorage.getItem(CACHE_META_KEY) || "null");
    if (!meta?.viewerId || !leagueId) return null;
    const snapshot = JSON.parse(localStorage.getItem(cacheKey(meta.viewerId, leagueId, meta.role || "user")) || "null");
    return snapshot?.appState || null;
  } catch {
    return null;
  }
}

function compareMatchesForDisplay(left, right) {
  const now = Date.now();
  const leftTime = new Date(left.utcDate).getTime();
  const rightTime = new Date(right.utcDate).getTime();
  const leftUpcoming = !left.isFinished && leftTime >= now;
  const rightUpcoming = !right.isFinished && rightTime >= now;

  if (leftUpcoming && !rightUpcoming) return -1;
  if (!leftUpcoming && rightUpcoming) return 1;
  if (leftUpcoming && rightUpcoming) return leftTime - rightTime;
  if (!left.isFinished && right.isFinished) return -1;
  if (left.isFinished && !right.isFinished) return 1;
  return rightTime - leftTime;
}

function formatDateTime(value) {
  if (!value) return "Sin fecha";
  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatDateInput(value) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

function formatRealScore(match) {
  return match.scoreHome == null || match.scoreAway == null ? "Por jugar" : `${match.scoreHome} - ${match.scoreAway}`;
}

function statusBadge(match) {
  if (match.isFinished) return "Finalizado";
  if (match.canPredict) return "Abierto";
  return "Cerrado";
}

function buildTeamPresentationLookup() {
  const lookup = {};
  const englishNames = createRegionDisplayNames("en");
  const spanishNames = createRegionDisplayNames("es");

  Object.entries(SPECIAL_TEAM_PRESENTATIONS).forEach(([alias, presentation]) => {
    registerPresentationAlias(lookup, alias, presentation);
  });

  COUNTRY_CODES.forEach((countryCode) => {
    const englishName = englishNames?.of(countryCode) || countryCode;
    const spanishName = COUNTRY_NAME_OVERRIDES[countryCode] || spanishNames?.of(countryCode) || englishName;
    const presentation = {
      name: spanishName,
      flag: countryCodeToFlagEmoji(countryCode),
      flagCode: countryCode.toLowerCase(),
    };

    registerPresentationAlias(lookup, countryCode, presentation);
    registerPresentationAlias(lookup, englishName, presentation);
    registerPresentationAlias(lookup, spanishName, presentation);
  });

  Object.entries(COUNTRY_NAME_ALIASES).forEach(([alias, countryCode]) => {
    const presentation = lookup[countryCode] || createPresentationFromCode(countryCode, englishNames, spanishNames);
    if (presentation) {
      registerPresentationAlias(lookup, alias, presentation);
      registerPresentationAlias(lookup, countryCode, presentation);
    }
  });

  return lookup;
}

function createPresentationFromCode(countryCode, englishNames, spanishNames) {
  const normalizedCode = String(countryCode || "").trim().toUpperCase();
  if (!normalizedCode) return null;
  const englishName = englishNames?.of(normalizedCode) || normalizedCode;
  const spanishName = COUNTRY_NAME_OVERRIDES[normalizedCode] || spanishNames?.of(normalizedCode) || englishName;
  return {
    name: spanishName,
    flag: countryCodeToFlagEmoji(normalizedCode),
    flagCode: normalizedCode.toLowerCase(),
  };
}

function registerPresentationAlias(lookup, alias, presentation) {
  const normalizedAlias = normalizeText(alias);
  if (!normalizedAlias || !presentation) return;
  lookup[normalizedAlias] = presentation;
}

function createRegionDisplayNames(locale) {
  try {
    return new Intl.DisplayNames([locale], { type: "region" });
  } catch {
    return null;
  }
}

function countryCodeToFlagEmoji(countryCode) {
  const normalizedCode = String(countryCode || "").trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(normalizedCode)) return "";
  return [...normalizedCode]
    .map((char) => String.fromCodePoint(127397 + char.charCodeAt(0)))
    .join("");
}

function getFlagAssetUrl(flagCode) {
  const normalized = String(flagCode || "").trim().toLowerCase();
  if (!normalized) return "";
  if (!/^[a-z]{2}$/.test(normalized) && !/^gb-(eng|sct|wls|nir)$/.test(normalized)) return "";
  return `/api/media/flag/${normalized}`;
}

function getTeamPresentation(name) {
  const raw = String(name || "").trim();
  if (!raw) return { name: "Equipo", flag: "" };
  const normalized = normalizeText(raw);
  const mapped = TEAM_PRESENTATION_LOOKUP[normalized];
  if (!mapped) return { name: raw, flag: "" };
  return mapped;
}

function getCurrentLeagueTeamAsset(name) {
  const key = normalizeText(name);
  if (!key) return null;
  return appState.currentLeague?.teamAssets?.[key] || null;
}

function isNationalTeam(name) {
  const key = normalizeText(name);
  return Boolean(TEAM_PRESENTATION_LOOKUP[key]);
}

function formatTeamName(name) {
  return getTeamPresentation(name).name;
}

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
