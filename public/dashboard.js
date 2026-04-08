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
const matchesVisibleEl = document.getElementById("matches-visible");
const prevPageBtn = document.getElementById("prev-page");
const nextPageBtn = document.getElementById("next-page");
const pageInfoEl = document.getElementById("page-info");

const predictionCard = document.getElementById("prediction-card");
const predictionForm = document.getElementById("prediction-form");
const predictionMatch = document.getElementById("predictionMatch");
const predictionHome = document.getElementById("predictionHome");
const predictionAway = document.getElementById("predictionAway");
const predictionHomeLabel = document.getElementById("prediction-home-label");
const predictionAwayLabel = document.getElementById("prediction-away-label");
const deletePredictionBtn = document.getElementById("delete-prediction");
const predictionHelp = document.getElementById("prediction-help");

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

  try {
    setLoading(true, "Sincronizando partidos...");
    syncBtn.disabled = true;
    setStatus("Sincronizando partidos y tabla...");
    const response = await postJson(`/api/admin/sync/${encodeURIComponent(appState.currentLeague.id)}`, {});
    await refreshApp(appState.currentLeague.id);
    setStatus(`Sincronización completada. ${response.matchesCount} partidos y ${response.standingsCount} tabla(s).`);
  } catch (error) {
    setStatus(error.message, true);
  } finally {
    syncBtn.disabled = false;
  }
});

predictionForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (appState.viewer?.role !== "user" || !appState.currentLeague?.canPredict) return;

  const matchId = predictionMatch.value;
  const homeGoals = Number(predictionHome.value);
  const awayGoals = Number(predictionAway.value);

  if (!matchId) {
    setPredictionMessage("Selecciona un partido.", true);
    return;
  }

  if (!Number.isInteger(homeGoals) || !Number.isInteger(awayGoals) || homeGoals < 0 || awayGoals < 0) {
    setPredictionMessage("Introduce un marcador válido.", true);
    return;
  }

  try {
    setLoading(true, "Guardando porra...");
    const result = await postJson("/api/league/predictions", { matchId, homeGoals, awayGoals });
    upsertLocalPrediction(result.prediction);
    predictionMatch.value = matchId;
    renderMatches();
    renderStats();
    syncPredictionFormState();
    persistCache();
    setPredictionMessage("Porra guardada.");
  } catch (error) {
    setPredictionMessage(error.message, true);
  } finally {
    setLoading(false);
  }
});

deletePredictionBtn.addEventListener("click", async () => {
  const prediction = currentUserPrediction();
  if (!prediction) {
    setPredictionMessage("No tienes una porra guardada para ese partido.", true);
    return;
  }

  try {
    setLoading(true, "Eliminando porra...");
    await deleteJson(`/api/league/predictions/${encodeURIComponent(prediction.id)}`);
    removeLocalPrediction(prediction.id);
    predictionMatch.value = prediction.matchId;
    renderMatches();
    renderStats();
    syncPredictionFormState();
    persistCache();
    setPredictionMessage("Porra eliminada.");
  } catch (error) {
    setPredictionMessage(error.message, true);
  } finally {
    setLoading(false);
  }
});

predictionMatch.addEventListener("change", syncPredictionFormState);

teamFilterInput.addEventListener("input", () => {
  filters.teamQuery = teamFilterInput.value.trim();
  currentPage = 1;
  renderMatches();
});

stageFilter.addEventListener("change", () => {
  filters.stage = stageFilter.value;
  currentPage = 1;
  renderMatches();
});

dateFromInput.addEventListener("change", () => {
  filters.dateFrom = dateFromInput.value;
  currentPage = 1;
  renderMatches();
});

dateToInput.addEventListener("change", () => {
  filters.dateTo = dateToInput.value;
  currentPage = 1;
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
  const adminButton = event.target.closest("button[data-open-bets-match]");
  if (adminButton) {
    adminBetsFilters.matchId = adminButton.dataset.openBetsMatch || "";
    adminBetsPage = 1;
    renderAdminBetsMatchOptions();
    renderAdminBetsExplorer();
    setActiveView("porras");
    return;
  }
  const button = event.target.closest("button[data-edit-prediction]");
  if (!button) return;
  predictionMatch.value = button.dataset.matchId || "";
  syncPredictionFormState();
  setActiveView("partidos");
});

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
    message: "Se eliminarán todas las ligas de tu organización junto con partidos, tabla, membresías y porras.",
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
  maybeOpenGuide();
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
  renderPredictionArea();
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
  leagueConfigCard.hidden = role !== "admin";

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

  setLeagueSettingsEnabled(role === "admin");
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
    membersCard.hidden = appState.viewer?.role === "user";
  }
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

function renderPredictionArea() {
  const role = appState.viewer?.role;
  const league = appState.currentLeague;
  const canPredict = role === "user" && Boolean(league?.canPredict);
  predictionCard.hidden = !canPredict;

  if (!canPredict || !league) {
    predictionMatch.innerHTML = '<option value="">Selecciona...</option>';
    deletePredictionBtn.disabled = true;
    predictionHomeLabel.textContent = "LOCAL";
    predictionAwayLabel.textContent = "VISITA";
    predictionHelp.textContent = role === "admin"
      ? "Los admins gestionan reglas y ligas; las porras solo las hacen los usuarios."
      : "";
    return;
  }

  predictionMatch.innerHTML = "";
  const playableMatches = league.matches.filter((match) => match.canPredict);
  const source = playableMatches.length ? playableMatches : league.matches;

  if (!source.length) {
    predictionMatch.innerHTML = '<option value="">Sin partidos cargados</option>';
    predictionHome.value = "";
    predictionAway.value = "";
    predictionHomeLabel.textContent = "LOCAL";
    predictionAwayLabel.textContent = "VISITA";
    deletePredictionBtn.disabled = true;
    setPredictionMessage("Esta liga aún no tiene partidos disponibles.");
    return;
  }

  predictionMatch.innerHTML = '<option value="">Selecciona...</option>';
  source.forEach((match) => {
    const option = document.createElement("option");
    option.value = match.id;
    option.textContent = `${formatDateTime(match.utcDate)} - ${match.homeTeam} vs ${match.awayTeam}`;
    predictionMatch.appendChild(option);
  });

  const previousValue = predictionMatch.dataset.selectedMatchId;
  if (previousValue && source.some((match) => match.id === previousValue)) {
    predictionMatch.value = previousValue;
  }

  syncPredictionFormState();
}

function syncPredictionFormState() {
  const league = appState.currentLeague;
  if (!league || appState.viewer?.role !== "user") {
    predictionHelp.textContent = "";
    return;
  }

  predictionMatch.dataset.selectedMatchId = predictionMatch.value || "";
  const match = league.matches.find((entry) => entry.id === predictionMatch.value);
  const prediction = currentUserPrediction();
  deletePredictionBtn.disabled = !prediction;

  if (!match) {
    predictionHome.value = "";
    predictionAway.value = "";
    predictionHomeLabel.textContent = "LOCAL";
    predictionAwayLabel.textContent = "VISITA";
    setPredictionMessage("Selecciona un partido para hacer tu porra.");
    return;
  }

  predictionHomeLabel.textContent = match.homeTeam || "LOCAL";
  predictionAwayLabel.textContent = match.awayTeam || "VISITA";

  if (prediction) {
    predictionHome.value = String(prediction.homeGoals);
    predictionAway.value = String(prediction.awayGoals);
    setPredictionMessage("Ya tienes una porra guardada. Puedes modificarla.");
    return;
  }

  predictionHome.value = "";
  predictionAway.value = "";
  setPredictionMessage(match.canPredict
    ? `Puedes apostar hasta ${formatDateTime(match.lockedAt)}.`
    : "Este partido ya cerró las apuestas.");
}

function currentUserPrediction() {
  const matchId = predictionMatch.value;
  return (appState.currentLeague?.predictions || []).find(
    (prediction) => prediction.userId === appState.viewer?.id && prediction.matchId === matchId,
  );
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
}

function renderMatches() {
  matchesBody.innerHTML = "";
  const matches = appState.currentLeague?.matches || [];
  const isAdmin = appState.viewer?.role === "admin";

  if (!matches.length) {
    matchesBody.innerHTML = '<tr><td colspan="6">No hay partidos cargados para esta liga.</td></tr>';
    matchesVisibleEl.textContent = "Mostrando 0 de 0 partidos.";
    updatePagination(0, 1);
    return;
  }

  const filtered = getFilteredMatches();
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  if (currentPage > totalPages) currentPage = totalPages;
  const pageMatches = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  matchesVisibleEl.textContent = `Mostrando ${pageMatches.length} de ${filtered.length} partidos filtrados.`;
  updatePagination(filtered.length, totalPages);

  if (!filtered.length) {
    matchesBody.innerHTML = '<tr><td colspan="6">No hay partidos con esos filtros.</td></tr>';
    return;
  }

  pageMatches.forEach((match) => {
    const predictions = (appState.currentLeague?.predictions || []).filter((prediction) => prediction.matchId === match.id);
    const predictionsHtml = isAdmin
      ? `<div class="match-bets-cell">
          <strong>${predictions.length}</strong>
          <span>${predictions.length === 1 ? "porra registrada" : "porras registradas"}</span>
          <button type="button" class="mini-link" data-open-bets-match="${escapeHtml(match.id)}">Ver detalle</button>
        </div>`
      : predictions.length
        ? `<ul class="pred-list">${predictions
            .map((prediction) => {
              const mine = prediction.userId === appState.viewer?.id;
              const predictionOwner = appState.viewer?.role === "user" ? "Tu porra" : escapeHtml(prediction.displayName);
              const pointsText = match.isFinished ? ` (${prediction.pointsAwarded} pts)` : "";
              const edit = mine && appState.viewer?.role === "user" && match.canPredict
                ? ` <button type="button" class="mini-link" data-edit-prediction="1" data-match-id="${escapeHtml(match.id)}">Editar</button>`
                : "";
              return `<li>${predictionOwner}: ${prediction.homeGoals}-${prediction.awayGoals}${pointsText}${edit}</li>`;
            })
            .join("")}</ul>`
        : '<span class="muted">Sin porras</span>';

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${formatDateTime(match.utcDate)}</td>
      <td>${escapeHtml(match.stage)}</td>
      <td>${escapeHtml(match.homeTeam)} vs ${escapeHtml(match.awayTeam)}</td>
      <td>${formatRealScore(match)}</td>
      <td>${statusBadge(match)}</td>
      <td>${predictionsHtml}</td>
    `;
    matchesBody.appendChild(row);
  });
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
    option.textContent = `${formatDateTime(match.utcDate)} - ${match.homeTeam} vs ${match.awayTeam}`;
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

  adminBetsMeta.textContent = `${selectedMatch.homeTeam} vs ${selectedMatch.awayTeam} · ${formatDateTime(selectedMatch.utcDate)}`;

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
        if (!normalizeText(match.homeTeam).includes(query) && !normalizeText(match.awayTeam).includes(query)) {
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

  totalMatchesEl.textContent = String(matches.length);
  finishedMatchesEl.textContent = String(matches.filter((match) => match.isFinished).length);
  totalPredictionsEl.textContent = String(predictions.length);
}

function applyStatsConfig(config) {
  const nodes = [
    { icon: stat1Icon, tag: stat1Tag, name: stat1Name },
    { icon: stat2Icon, tag: stat2Tag, name: stat2Name },
    { icon: stat3Icon, tag: stat3Tag, name: stat3Name },
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
        <td><button type="button" class="btn btn-ghost-danger btn-sm" data-delete-league="${escapeHtml(league.id)}">Eliminar</button></td>
      `
      : `
        <td>${escapeHtml(league.name)}</td>
        <td>${escapeHtml(league.competitionName)} (${escapeHtml(league.competitionCode)})</td>
        <td>${league.season}</td>
        <td>Exacto ${league.exactPoints} · Tendencia ${league.outcomePoints} · Cierre ${league.lockMinutes}m</td>
        <td>${league.isActive ? "Activa" : "Inactiva"}</td>
        <td><button type="button" class="btn btn-ghost-danger btn-sm" data-delete-league="${escapeHtml(league.id)}">Eliminar</button></td>
      `;
    leaguesBody.appendChild(row);
  });
}

leaguesBody?.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-delete-league]");
  if (!button) return;
  const league = appState.adminData?.leagues?.find((entry) => entry.id === button.dataset.deleteLeague);
  if (!league) return;
  openDeleteConfirmation({
    title: "Eliminar liga",
    message: `Se eliminará la liga ${league.name} junto con partidos, tabla, membresías y porras asociadas.`,
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

function setPredictionMessage(message, isError = false) {
  predictionHelp.textContent = message;
  predictionHelp.style.color = isError ? "var(--danger)" : "";
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
