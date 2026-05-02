const API_BASE = "https://api.football-data.org/v4";
const SESSION_COOKIE = "porra_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 14;
const SESSION_TOUCH_INTERVAL_MS = 1000 * 60 * 10;
const PASSWORD_ITERATIONS = 100_000;
const PASSWORD_KEY_LENGTH = 256;
const OPEN_PREDICTION_STATUSES = new Set(["SCHEDULED", "TIMED"]);
const BOOTSTRAP_CACHE_TTL_SECONDS = 60;
const COMPETITIONS_CACHE_TTL_SECONDS = 60 * 60;
const TEAM_ASSETS_CACHE_TTL_SECONDS = 60 * 60;
const STATIC_HTML_CACHE_CONTROL = "public, max-age=0, s-maxage=300, stale-while-revalidate=30";
const STATIC_ASSET_CACHE_CONTROL = "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800";
const GLOBAL_CACHE_VERSION_KEY = "version:global";
const FALLBACK_COMPETITIONS = [
  { id: 2000, code: "WC", name: "FIFA World Cup" },
  { id: 2001, code: "CL", name: "UEFA Champions League" },
  { id: 2021, code: "PL", name: "Premier League" },
  { id: 2014, code: "PD", name: "LaLiga" },
  { id: 2002, code: "BL1", name: "Bundesliga" },
  { id: 2019, code: "SA", name: "Serie A" },
  { id: 2015, code: "FL1", name: "Ligue 1" },
  { id: 2017, code: "PPL", name: "Primeira Liga" },
  { id: 2003, code: "DED", name: "Eredivisie" },
  { id: 2016, code: "ELC", name: "Championship" },
];
const PREFERRED_COMPETITION_CODES = ["WC", "CL", "PL", "PD", "BL1", "SA", "FL1", "PPL", "DED", "ELC"];

export default {
  async fetch(request, env) {
    try {
      const url = new URL(request.url);
      const isSecureRequest = shouldUseSecureCookie(url);
      const setupRequired = !(await hasAnySuperadmin(env.DB));
      const session = setupRequired ? null : await getSessionContext(request, env.DB);

      if (!url.pathname.startsWith("/api/")) {
        if (url.pathname === "/" || url.pathname === "/index.html") {
          return Response.redirect(new URL(session?.user ? "/dashboard" : "/login", url), 302);
        }

        if (url.pathname === "/login" || url.pathname === "/login.html") {
          return serveStaticAsset(request, env, "/login.html");
        }

        if (url.pathname === "/dashboard" || url.pathname === "/dashboard.html") {
          return serveStaticAsset(request, env, "/dashboard.html");
        }

        return serveStaticAsset(request, env);
      }

      if (request.method === "GET" && url.pathname === "/api/setup/status") {
        return jsonResponse({ setupRequired });
      }

      if (request.method === "GET" && url.pathname === "/api/competitions") {
        return respondWithPublicApiCache(request, env, "competitions", COMPETITIONS_CACHE_TTL_SECONDS, async () =>
          jsonResponse(
            { competitions: await getCompetitions(env) },
            200,
            { "cache-control": `public, max-age=${COMPETITIONS_CACHE_TTL_SECONDS}` },
          ));
      }

      if (request.method === "GET" && url.pathname.startsWith("/api/media/flag/")) {
        const flagCode = decodeURIComponent(url.pathname.slice("/api/media/flag/".length));
        return serveFlagAsset(env, flagCode);
      }

      if (request.method === "GET" && url.pathname === "/api/media/team-crest") {
        const leagueId = url.searchParams.get("leagueId") || "";
        const teamKey = url.searchParams.get("team") || "";
        return serveTeamCrestAsset(env, leagueId, teamKey);
      }

      if (request.method === "POST" && url.pathname === "/api/setup/superadmin") {
        if (!setupRequired) throw httpError("El sistema ya tiene un superadmin inicial.", 409);
        const payload = await readJson(request);
        const user = await createInitialSuperadmin(env.DB, payload);
        await createAuditLog(env.DB, {
          organizationId: null,
          actorUserId: user.id,
          actorRole: "superadmin",
          actorDisplayName: user.displayName,
          actionType: "superadmin_created",
          entityType: "user",
          entityId: user.id,
          entityLabel: user.email,
          details: { email: user.email },
        });
        await bumpGlobalCacheVersion(env);
        const sessionToken = await createSession(env.DB, user.id);
        return jsonResponse(
          { ok: true, user: sanitizeViewer(user) },
          201,
          appendCookie(null, buildSessionCookie(sessionToken, isSecureRequest)),
        );
      }

      if (request.method === "POST" && url.pathname === "/api/auth/login") {
        if (setupRequired) throw httpError("Primero debes crear el superadmin inicial.", 409);
        const payload = await readJson(request);
        const user = await authenticateUser(env.DB, payload?.email, payload?.password);
        await createAuditLog(env.DB, {
          organizationId: user.organizationId,
          actorUserId: user.id,
          actorRole: user.role,
          actorDisplayName: user.displayName,
          actionType: "login",
          entityType: "session",
          entityId: user.id,
          entityLabel: user.email,
          details: {},
        });
        const sessionToken = await createSession(env.DB, user.id);
        return jsonResponse(
          { ok: true, user: sanitizeViewer(user) },
          200,
          appendCookie(null, buildSessionCookie(sessionToken, isSecureRequest)),
        );
      }

      if (request.method === "POST" && url.pathname === "/api/auth/logout") {
        if (session?.user) {
          await createAuditLog(env.DB, {
            organizationId: session.user.organizationId,
            actorUserId: session.user.id,
            actorRole: session.user.role,
            actorDisplayName: session.user.displayName,
            actionType: "logout",
            entityType: "session",
            entityId: session.user.id,
            entityLabel: session.user.email,
            details: {},
          });
        }
        if (session?.sessionId) await deleteSession(env.DB, session.sessionId);
        return jsonResponse({ ok: true }, 200, appendCookie(null, buildExpiredCookie(isSecureRequest)));
      }

      if (request.method === "POST" && url.pathname === "/api/auth/forgot-password") {
        if (setupRequired) throw httpError("Primero debes crear el superadmin inicial.", 409);
        const payload = await readJson(request);
        await requestPasswordReset(env.DB, payload?.email);
        await createAuditLog(env.DB, {
          organizationId: null,
          actorUserId: null,
          actorRole: "anonymous",
          actorDisplayName: payload?.email || "anon",
          actionType: "password_reset_requested",
          entityType: "password_reset_request",
          entityId: null,
          entityLabel: payload?.email || "",
          details: { email: payload?.email || "" },
        });
        return jsonResponse({
          ok: true,
          message: "Si el correo existe, se registró una solicitud para que tu administrador restablezca la contraseña.",
        });
      }

      if (request.method === "GET" && url.pathname === "/api/bootstrap") {
        return jsonResponse(
          await buildBootstrapWithCache(env, session, setupRequired, url.searchParams.get("leagueId")),
        );
      }

      if (!session?.user) throw httpError("Debes iniciar sesión.", 401);

      if (request.method === "GET" && url.pathname.startsWith("/api/leagues/") && url.pathname.endsWith("/team-assets")) {
        const leagueId = decodeURIComponent(url.pathname.slice("/api/leagues/".length, -"/team-assets".length));
        return jsonResponse(await getLeagueTeamAssets(env, session.user, leagueId));
      }

      if (request.method === "PATCH" && url.pathname === "/api/auth/profile") {
        const payload = await readJson(request);
        const user = await updateOwnProfile(env.DB, session.user, payload);
        await createAuditLog(env.DB, {
          organizationId: user.organizationId,
          actorUserId: user.id,
          actorRole: user.role,
          actorDisplayName: user.displayName,
          actionType: "profile_updated",
          entityType: "user",
          entityId: user.id,
          entityLabel: user.email,
          details: { email: user.email, displayName: user.displayName },
        });
        await bumpGlobalCacheVersion(env);
        return jsonResponse({ ok: true, user: sanitizeViewer(user) });
      }

      if (request.method === "POST" && url.pathname === "/api/auth/change-password") {
        const payload = await readJson(request);
        const user = await changeOwnPassword(env.DB, session.user, payload);
        await createAuditLog(env.DB, {
          organizationId: user.organizationId,
          actorUserId: user.id,
          actorRole: user.role,
          actorDisplayName: user.displayName,
          actionType: "password_changed",
          entityType: "user",
          entityId: user.id,
          entityLabel: user.email,
          details: {},
        });
        await bumpGlobalCacheVersion(env);
        return jsonResponse({ ok: true, user: sanitizeViewer(user) });
      }

      if (request.method === "POST" && url.pathname === "/api/league/predictions") {
        requireRole(session.user, ["user"]);
        const payload = await readJson(request);
        const prediction = isPredictionQueueEnabled(env)
          ? await enqueueLeaguePrediction(env, session.user, payload)
          : await upsertLeaguePrediction(env.DB, session.user, payload);
        await createAuditLog(env.DB, {
          organizationId: session.user.organizationId,
          actorUserId: session.user.id,
          actorRole: session.user.role,
          actorDisplayName: session.user.displayName,
          actionType: "prediction_saved",
          entityType: "prediction",
          entityId: prediction.id,
          entityLabel: payload?.matchId || "",
          details: {
            matchId: payload?.matchId || "",
            homeGoals: payload?.homeGoals,
            awayGoals: payload?.awayGoals,
          },
        });
        await bumpLeagueCacheVersion(env, prediction.leagueId);
        await bumpGlobalCacheVersion(env);
        return jsonResponse({ prediction, queued: isPredictionQueueEnabled(env) }, isPredictionQueueEnabled(env) ? 202 : 201);
      }

      if (request.method === "DELETE" && url.pathname.startsWith("/api/league/predictions/")) {
        requireRole(session.user, ["user"]);
        const predictionId = decodeURIComponent(url.pathname.slice("/api/league/predictions/".length));
        const deleted = await deleteLeaguePrediction(env.DB, session.user, predictionId);
        await createAuditLog(env.DB, {
          organizationId: session.user.organizationId,
          actorUserId: session.user.id,
          actorRole: session.user.role,
          actorDisplayName: session.user.displayName,
          actionType: "prediction_deleted",
          entityType: "prediction",
          entityId: predictionId,
          entityLabel: predictionId,
          details: {},
        });
        await bumpLeagueCacheVersion(env, deleted.leagueId);
        await bumpGlobalCacheVersion(env);
        return jsonResponse({ ok: true });
      }

      if (request.method === "GET" && url.pathname === "/api/admin/users") {
        requireRole(session.user, ["superadmin", "admin"]);
        return jsonResponse({ users: await getManageableUsers(env.DB, session.user) });
      }

      if (request.method === "GET" && url.pathname === "/api/admin/users/import-template") {
        requireRole(session.user, ["admin"]);
        return textResponse(await buildUserImportTemplate(env.DB, session.user), 200, {
          "content-type": "text/csv; charset=utf-8",
          "cache-control": "no-store",
        });
      }

      if (request.method === "POST" && url.pathname === "/api/admin/users/import-preview") {
        requireRole(session.user, ["admin"]);
        const payload = await readJson(request);
        const preview = await buildUserImportPreview(env.DB, session.user, payload?.csvText);
        return jsonResponse(preview);
      }

      if (request.method === "POST" && url.pathname === "/api/admin/users/import-commit") {
        requireRole(session.user, ["admin"]);
        const payload = await readJson(request);
        const result = await commitUserImport(env.DB, session.user, payload?.csvText);
        for (const createdUser of result.createdUsers) {
          await createAuditLog(env.DB, {
            organizationId: session.user.organizationId,
            actorUserId: session.user.id,
            actorRole: session.user.role,
            actorDisplayName: session.user.displayName,
            actionType: "user_created",
            entityType: "user",
            entityId: createdUser.id,
            entityLabel: createdUser.email,
            details: {
              role: "user",
              displayName: createdUser.displayName,
              source: "bulk_import",
              leagues: createdUser.leagues.join(", "),
            },
          });
        }
        await createAuditLog(env.DB, {
          organizationId: session.user.organizationId,
          actorUserId: session.user.id,
          actorRole: session.user.role,
          actorDisplayName: session.user.displayName,
          actionType: "users_imported_bulk",
          entityType: "user",
          entityId: null,
          entityLabel: "bulk-import",
          details: {
            created: result.summary.created,
            skipped: result.summary.skipped,
            errors: result.summary.errors,
          },
        });
        await bumpGlobalCacheVersion(env);
        return jsonResponse(result, 201);
      }

      if (request.method === "GET" && url.pathname === "/api/admin/password-reset-requests") {
        requireRole(session.user, ["admin"]);
        return jsonResponse({ requests: await getPasswordResetRequests(env.DB, session.user.organizationId) });
      }

      if (request.method === "POST" && url.pathname === "/api/admin/users") {
        requireRole(session.user, ["superadmin", "admin"]);
        const payload = await readJson(request);
        const user = session.user.role === "superadmin"
          ? await createAdminForOrganization(env.DB, payload)
          : await createTenantUser(env.DB, session.user, payload);
        await createAuditLog(env.DB, {
          organizationId: user.organizationId,
          actorUserId: session.user.id,
          actorRole: session.user.role,
          actorDisplayName: session.user.displayName,
          actionType: "user_created",
          entityType: "user",
          entityId: user.id,
          entityLabel: user.email,
          details: { role: user.role, displayName: user.displayName },
        });
        await bumpGlobalCacheVersion(env);
        return jsonResponse({ user }, 201);
      }

      if (request.method === "PATCH" && url.pathname.startsWith("/api/admin/users/")) {
        requireRole(session.user, ["superadmin", "admin"]);
        const userId = decodeURIComponent(url.pathname.slice("/api/admin/users/".length));
        const payload = await readJson(request);
        const user = session.user.role === "superadmin"
          ? await updateAdminUser(env.DB, session.user, userId, payload)
          : await updateTenantUser(env.DB, session.user, userId, payload);
        await createAuditLog(env.DB, {
          organizationId: user.organizationId,
          actorUserId: session.user.id,
          actorRole: session.user.role,
          actorDisplayName: session.user.displayName,
          actionType: "user_updated",
          entityType: "user",
          entityId: user.id,
          entityLabel: user.email,
          details: { role: user.role, displayName: user.displayName },
        });
        await bumpGlobalCacheVersion(env);
        return jsonResponse({ user });
      }

      if (request.method === "DELETE" && url.pathname === "/api/admin/users") {
        requireRole(session.user, ["admin"]);
        const result = await deleteAllTenantUsers(env.DB, session.user);
        await createAuditLog(env.DB, {
          organizationId: session.user.organizationId,
          actorUserId: session.user.id,
          actorRole: session.user.role,
          actorDisplayName: session.user.displayName,
          actionType: "users_deleted_bulk",
          entityType: "user",
          entityId: null,
          entityLabel: "bulk",
          details: {
            deletedCount: result.deletedCount,
            deletedUsers: result.deletedUsers?.join(" | ") || "",
          },
        });
        await bumpGlobalCacheVersion(env);
        return jsonResponse(result);
      }

      if (request.method === "DELETE" && url.pathname.startsWith("/api/admin/users/")) {
        requireRole(session.user, ["admin"]);
        const userId = decodeURIComponent(url.pathname.slice("/api/admin/users/".length));
        const result = await deleteTenantUser(env.DB, session.user, userId);
        await createAuditLog(env.DB, {
          organizationId: session.user.organizationId,
          actorUserId: session.user.id,
          actorRole: session.user.role,
          actorDisplayName: session.user.displayName,
          actionType: "user_deleted",
          entityType: "user",
          entityId: result.userId,
          entityLabel: result.email || result.displayName || result.userId,
          details: {
            displayName: result.displayName,
            email: result.email,
            role: result.role,
            isActive: result.isActive,
            leagues: result.leagueNames?.join(", ") || "Sin ligas",
          },
        });
        await bumpGlobalCacheVersion(env);
        return jsonResponse(result);
      }

      if (request.method === "POST" && url.pathname === "/api/admin/leagues") {
        requireRole(session.user, ["admin"]);
        const payload = await readJson(request);
        const league = await createLeague(env.DB, session.user, payload);
        await createAuditLog(env.DB, {
          organizationId: session.user.organizationId,
          actorUserId: session.user.id,
          actorRole: session.user.role,
          actorDisplayName: session.user.displayName,
          actionType: "league_created",
          entityType: "league",
          entityId: league.id,
          entityLabel: league.name,
          details: { competitionCode: league.competitionCode, season: league.season },
        });
        await bumpGlobalCacheVersion(env);
        await bumpLeagueCacheVersion(env, league.id);
        return jsonResponse({ league }, 201);
      }

      if (request.method === "PATCH" && url.pathname.startsWith("/api/admin/leagues/")) {
        requireRole(session.user, ["admin"]);
        const leagueId = decodeURIComponent(url.pathname.slice("/api/admin/leagues/".length));
        const payload = await readJson(request);
        const league = await updateLeague(env.DB, session.user, leagueId, payload);
        await createAuditLog(env.DB, {
          organizationId: session.user.organizationId,
          actorUserId: session.user.id,
          actorRole: session.user.role,
          actorDisplayName: session.user.displayName,
          actionType: "league_updated",
          entityType: "league",
          entityId: league.id,
          entityLabel: league.name,
          details: { competitionCode: league.competitionCode, season: league.season },
        });
        await bumpGlobalCacheVersion(env);
        await bumpLeagueCacheVersion(env, league.id);
        return jsonResponse({ league });
      }

      if (request.method === "DELETE" && url.pathname === "/api/admin/leagues") {
        requireRole(session.user, ["admin"]);
        const result = await deleteAllTenantLeagues(env.DB, session.user);
        await createAuditLog(env.DB, {
          organizationId: session.user.organizationId,
          actorUserId: session.user.id,
          actorRole: session.user.role,
          actorDisplayName: session.user.displayName,
          actionType: "leagues_deleted_bulk",
          entityType: "league",
          entityId: null,
          entityLabel: "bulk",
          details: {
            deletedCount: result.deletedCount,
            deletedLeagues: result.deletedLeagues?.join(" | ") || "",
          },
        });
        await bumpGlobalCacheVersion(env);
        return jsonResponse(result);
      }

      if (request.method === "DELETE" && url.pathname.startsWith("/api/admin/leagues/")) {
        requireRole(session.user, ["admin"]);
        const leagueId = decodeURIComponent(url.pathname.slice("/api/admin/leagues/".length));
        const result = await deleteTenantLeague(env.DB, session.user, leagueId);
        await createAuditLog(env.DB, {
          organizationId: session.user.organizationId,
          actorUserId: session.user.id,
          actorRole: session.user.role,
          actorDisplayName: session.user.displayName,
          actionType: "league_deleted",
          entityType: "league",
          entityId: result.leagueId,
          entityLabel: result.name || result.leagueId,
          details: {
            name: result.name,
            competitionCode: result.competitionCode,
            competitionName: result.competitionName,
            season: result.season,
            isActive: result.isActive,
          },
        });
        await bumpGlobalCacheVersion(env);
        await bumpLeagueCacheVersion(env, result.leagueId);
        return jsonResponse(result);
      }

      if (request.method === "DELETE" && url.pathname.startsWith("/api/superadmin/organizations/")) {
        requireRole(session.user, ["superadmin"]);
        const organizationId = decodeURIComponent(url.pathname.slice("/api/superadmin/organizations/".length));
        const result = await deleteOrganization(env.DB, session.user, organizationId);
        await createAuditLog(env.DB, {
          organizationId,
          actorUserId: session.user.id,
          actorRole: session.user.role,
          actorDisplayName: session.user.displayName,
          actionType: "organization_deleted",
          entityType: "organization",
          entityId: organizationId,
          entityLabel: result.name || organizationId,
          details: {
            name: result.name,
            deletedUsers: result.deletedUsers,
            deletedLeagues: result.deletedLeagues,
            deletedAdmins: result.deletedAdmins,
            deletedEndUsers: result.deletedEndUsers,
          },
        });
        await bumpGlobalCacheVersion(env);
        return jsonResponse(result);
      }

      if (request.method === "PATCH" && url.pathname.startsWith("/api/superadmin/organizations/")) {
        requireRole(session.user, ["superadmin"]);
        const organizationId = decodeURIComponent(url.pathname.slice("/api/superadmin/organizations/".length));
        const payload = await readJson(request);
        const organization = await updateOrganizationState(env.DB, session.user, organizationId, payload);
        await createAuditLog(env.DB, {
          organizationId: organization.id,
          actorUserId: session.user.id,
          actorRole: session.user.role,
          actorDisplayName: session.user.displayName,
          actionType: organization.isActive ? "organization_activated" : "organization_deactivated",
          entityType: "organization",
          entityId: organization.id,
          entityLabel: organization.name,
          details: { isActive: organization.isActive },
        });
        await bumpGlobalCacheVersion(env);
        return jsonResponse({ organization });
      }

      if (request.method === "GET" && url.pathname === "/api/superadmin/audit-logs") {
        requireRole(session.user, ["superadmin"]);
        const organizationId = url.searchParams.get("organizationId") || "";
        const logs = await getAuditLogs(env.DB, organizationId);
        return jsonResponse({ logs });
      }

      if (request.method === "POST" && url.pathname.startsWith("/api/admin/sync/")) {
        requireRole(session.user, ["admin"]);
        const leagueId = decodeURIComponent(url.pathname.slice("/api/admin/sync/".length));
        const result = await syncLeague(env, session.user, leagueId);
        await createAuditLog(env.DB, {
          organizationId: session.user.organizationId,
          actorUserId: session.user.id,
          actorRole: session.user.role,
          actorDisplayName: session.user.displayName,
          actionType: "league_synced",
          entityType: "league",
          entityId: result.leagueId,
          entityLabel: result.leagueId,
          details: { matchesCount: result.matchesCount, standingsCount: result.standingsCount },
        });
        await bumpGlobalCacheVersion(env);
        await bumpLeagueCacheVersion(env, result.leagueId);
        return jsonResponse(result);
      }

      if (request.method === "POST" && url.pathname.startsWith("/api/admin/password-reset-requests/")) {
        requireRole(session.user, ["admin"]);
        const suffix = url.pathname.slice("/api/admin/password-reset-requests/".length);
        const [requestId, action] = suffix.split("/");
        if (action !== "issue-temporary") {
          return errorResponse("Ruta no encontrada.", 404);
        }
        const result = await issueTemporaryPassword(env.DB, session.user, decodeURIComponent(requestId));
        await createAuditLog(env.DB, {
          organizationId: session.user.organizationId,
          actorUserId: session.user.id,
          actorRole: session.user.role,
          actorDisplayName: session.user.displayName,
          actionType: "temporary_password_issued",
          entityType: "password_reset_request",
          entityId: requestId,
          entityLabel: requestId,
          details: {},
        });
        await bumpGlobalCacheVersion(env);
        return jsonResponse(result);
      }

      return errorResponse("Ruta no encontrada.", 404);
    } catch (error) {
      return errorResponse(error.message || "Error interno", error.status || 500);
    }
  },

  async scheduled(controller, env, ctx) {
    ctx.waitUntil(runScheduledLeagueSync(controller, env));
  },

  async queue(batch, env, ctx) {
    for (const message of batch.messages) {
      try {
        if (message.body?.type === "prediction_upsert") {
          await persistQueuedPrediction(env.DB, message.body);
          await bumpLeagueCacheVersion(env, message.body.leagueId);
          await bumpGlobalCacheVersion(env);
        }
        message.ack();
      } catch (error) {
        console.error("[queue] Error procesando mensaje", error);
        message.retry();
      }
    }
  },
};

async function buildBootstrap(env, session, setupRequired, requestedLeagueId) {
  if (setupRequired) {
    return {
      setupRequired: true,
      authenticated: false,
      viewer: null,
      organizations: [],
      leagues: [],
      currentLeague: null,
      adminData: null,
      superadminData: null,
    };
  }

  if (!session?.user) {
    return {
      setupRequired: false,
      authenticated: false,
      viewer: null,
      organizations: [],
      leagues: [],
      currentLeague: null,
      adminData: null,
      superadminData: null,
    };
  }

  const viewer = session.user;

  if (viewer.role === "superadmin") {
    return {
      setupRequired: false,
      authenticated: true,
      viewer: sanitizeViewer(viewer),
      organizations: await getOrganizations(env.DB, true),
      leagues: [],
      currentLeague: null,
      adminData: null,
      superadminData: {
        admins: await getSuperadminManagedAdmins(env.DB),
        organizations: await getOrganizations(env.DB, true),
      },
    };
  }

  const accessibleLeagues = await getAccessibleLeagues(env.DB, viewer);
  const selectedLeagueId =
    (requestedLeagueId && accessibleLeagues.some((league) => league.id === requestedLeagueId) && requestedLeagueId) ||
    accessibleLeagues[0]?.id ||
    null;
  const currentLeague = selectedLeagueId ? await getLeagueDashboard(env.DB, viewer, selectedLeagueId) : null;

  let adminData = null;
  if (viewer.role === "admin") {
    adminData = {
      users: await getTenantUsers(env.DB, viewer.organizationId),
      leagues: await getTenantLeagues(env.DB, viewer.organizationId),
      organization: await getOrganizationById(env.DB, viewer.organizationId),
      passwordResetRequests: await getPasswordResetRequests(env.DB, viewer.organizationId),
    };
  }

  return {
    setupRequired: false,
    authenticated: true,
    viewer: sanitizeViewer(viewer),
    organizations: viewer.organizationId ? [await getOrganizationById(env.DB, viewer.organizationId)] : [],
    leagues: accessibleLeagues,
    currentLeague,
    adminData,
    superadminData: null,
  };
}

async function buildBootstrapWithCache(env, session, setupRequired, requestedLeagueId) {
  if (setupRequired || !session?.user || !env.APP_CACHE) {
    return buildBootstrap(env, session, setupRequired, requestedLeagueId);
  }

  const cacheKey = await buildBootstrapCacheKey(env, session.user, requestedLeagueId);
  const cached = await cacheGetJson(env.APP_CACHE, cacheKey);
  if (cached) return cached;

  const payload = await buildBootstrap(env, session, setupRequired, requestedLeagueId);
  await cachePutJson(env.APP_CACHE, cacheKey, payload, BOOTSTRAP_CACHE_TTL_SECONDS);
  return payload;
}

async function buildBootstrapCacheKey(env, viewer, requestedLeagueId) {
  const globalVersion = await getCacheVersion(env, GLOBAL_CACHE_VERSION_KEY);
  if (viewer.role === "superadmin") {
    return `bootstrap:superadmin:${viewer.id}:v:${globalVersion}`;
  }
  const selectedLeagueId = requestedLeagueId || "default";
  const leagueVersion = requestedLeagueId ? await getCacheVersion(env, getLeagueVersionKey(requestedLeagueId)) : "0";
  return `bootstrap:${viewer.role}:${viewer.id}:league:${selectedLeagueId}:gv:${globalVersion}:lv:${leagueVersion}`;
}

async function serveStaticAsset(request, env, assetPath = null) {
  const url = new URL(request.url);
  const targetPath = assetPath || url.pathname;
  const assetRequest = assetPath
    ? new Request(new URL(assetPath, url), request)
    : request;
  const response = await env.ASSETS.fetch(assetRequest);
  const headers = new Headers(response.headers);
  const pathname = targetPath.toLowerCase();
  const isHtml = pathname.endsWith(".html") || pathname === "/login" || pathname === "/dashboard";
  headers.set("cache-control", isHtml ? STATIC_HTML_CACHE_CONTROL : STATIC_ASSET_CACHE_CONTROL);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

async function respondWithPublicApiCache(request, env, cacheKey, ttlSeconds, factory) {
  const cache = caches.default;
  const cacheUrl = new URL(request.url);
  cacheUrl.searchParams.set("__edge_cache", cacheKey);
  const cacheRequest = new Request(cacheUrl.toString(), request);
  const cached = await cache.match(cacheRequest);
  if (cached) return cached;

  const response = await factory();
  if (response.ok) {
    const headers = new Headers(response.headers);
    if (!headers.has("cache-control")) {
      headers.set("cache-control", `public, max-age=${ttlSeconds}`);
    }
    const cacheable = new Response(response.clone().body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
    await cache.put(cacheRequest, cacheable.clone());
    return cacheable;
  }
  return response;
}

async function getLeagueDashboard(db, viewer, leagueId) {
  const league = await getLeagueById(db, leagueId);
  if (!league) throw httpError("Liga no encontrada.", 404);
  await ensureLeagueAccess(db, viewer, leagueId);

  const { matches, standings, predictions, members } = await getLeagueDashboardPayload(db, league);

  const decoratedMatches = matches.map((match) => decorateMatch(match, league));
  const predictionsWithPoints = predictions.map((prediction) => {
    const match = decoratedMatches.find((entry) => entry.id === prediction.matchId);
    return {
      ...prediction,
      pointsAwarded: match ? pointsForPrediction(prediction, match, league) : 0,
    };
  });
  const visiblePredictions = viewer.role === "user"
    ? predictionsWithPoints.filter((prediction) => prediction.userId === viewer.id)
    : predictionsWithPoints;

  return {
    ...league,
    canAdminister: viewer.role === "admin",
    canPredict: viewer.role === "user",
    matches: decoratedMatches,
    standings,
    predictions: visiblePredictions,
    leaderboard: buildLeaderboard(members, decoratedMatches, predictionsWithPoints, league),
    members,
  };
}

async function getLeagueDashboardPayload(db, league) {
  const responses = await db.batch([
    db.prepare(
      `SELECT shared_matches.*, ?1 AS league_id
         FROM shared_matches
        WHERE competition_code = ?2 AND season = ?3
        ORDER BY utc_date ASC`,
    ).bind(league.id, league.competitionCode, league.season),
    db.prepare(
      `SELECT *
         FROM shared_standings
        WHERE competition_code = ?1 AND season = ?2
        ORDER BY sort_order ASC`,
    ).bind(league.competitionCode, league.season),
    db.prepare(
      `SELECT league_predictions.id,
              league_predictions.user_id AS userId,
              league_predictions.league_id AS leagueId,
              users.display_name AS displayName,
              users.email AS email,
              league_predictions.match_id AS matchId,
              league_predictions.home_goals AS homeGoals,
              league_predictions.away_goals AS awayGoals,
              league_predictions.created_at AS createdAt,
              league_predictions.updated_at AS updatedAt
         FROM league_predictions
         JOIN users ON users.id = league_predictions.user_id
        WHERE league_predictions.league_id = ?1
        ORDER BY league_predictions.updated_at DESC`,
    ).bind(league.id),
    db.prepare(
      `SELECT users.id, users.display_name, users.email, users.role, users.is_active
         FROM users
         JOIN league_memberships ON league_memberships.user_id = users.id
        WHERE league_memberships.league_id = ?1 AND users.is_active = 1
        ORDER BY users.display_name ASC`,
    ).bind(league.id),
  ]);

  return {
    matches: mapLeagueMatches((responses[0]?.results || [])),
    standings: mapLeagueStandings((responses[1]?.results || [])),
    predictions: mapLeaguePredictions((responses[2]?.results || [])),
    members: mapLeagueUsers((responses[3]?.results || [])),
  };
}

async function hasAnySuperadmin(db) {
  const row = await db.prepare("SELECT id FROM users WHERE role = 'superadmin' LIMIT 1").first();
  return Boolean(row);
}

async function createInitialSuperadmin(db, payload) {
  const displayName = normalizeRequiredString(payload?.displayName, "El nombre es obligatorio.");
  const email = normalizeEmail(payload?.email);
  const password = String(payload?.password || "");
  validatePassword(password);

  const hash = await hashPassword(password);
  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  await db.prepare(
    `INSERT INTO users (
       id, email, email_normalized, display_name, password_hash, password_salt, role, is_active, organization_id, created_at, updated_at
     ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, 'superadmin', 1, NULL, ?7, ?7)`,
  )
    .bind(id, email, email, displayName, hash.hash, hash.salt, now)
    .run();

  return {
    id,
    email,
    displayName,
    role: "superadmin",
    isActive: true,
    organizationId: null,
  };
}

async function authenticateUser(db, rawEmail, rawPassword) {
  const email = normalizeEmail(rawEmail);
  const password = String(rawPassword || "");
  if (!password) throw httpError("Introduce tu contraseña.", 400);

  const row = await db.prepare("SELECT * FROM users WHERE email_normalized = ?1").bind(email).first();
  if (!row || Number(row.is_active) !== 1) throw httpError("Credenciales inválidas.", 401);
  const valid = await verifyPassword(password, row.password_salt, row.password_hash);
  if (!valid) throw httpError("Credenciales inválidas.", 401);
  return normalizeUser(row);
}

async function changeOwnPassword(db, user, payload) {
  const currentPassword = String(payload?.currentPassword || "");
  const nextPassword = String(payload?.newPassword || "");
  if (!currentPassword) throw httpError("Debes escribir tu contraseña actual.", 400);
  validatePassword(nextPassword);

  const row = await db.prepare("SELECT * FROM users WHERE id = ?1").bind(user.id).first();
  if (!row) throw httpError("Usuario no encontrado.", 404);
  const valid = await verifyPassword(currentPassword, row.password_salt, row.password_hash);
  if (!valid) throw httpError("La contraseña actual no es correcta.", 401);

  const hash = await hashPassword(nextPassword);
  const now = new Date().toISOString();
  await db.prepare(
    `UPDATE users
        SET password_hash = ?2,
            password_salt = ?3,
            must_change_password = 0,
            password_changed_at = ?4,
            updated_at = ?4
      WHERE id = ?1`,
  )
    .bind(user.id, hash.hash, hash.salt, now)
    .run();

  return getUserById(db, user.id);
}

async function updateOwnProfile(db, user, payload) {
  const row = await db.prepare("SELECT * FROM users WHERE id = ?1").bind(user.id).first();
  if (!row) throw httpError("Usuario no encontrado.", 404);

  const nextDisplayName = payload?.displayName != null
    ? normalizeRequiredString(payload.displayName, "El nombre es obligatorio.")
    : row.display_name;
  const nextEmail = payload?.email != null ? normalizeEmail(payload.email) : row.email;
  const currentPassword = String(payload?.currentPassword || "");
  const nextPassword = payload?.newPassword ? String(payload.newPassword) : "";
  const emailChanged = nextEmail !== row.email;
  const wantsPasswordChange = Boolean(nextPassword);

  if (emailChanged || wantsPasswordChange) {
    if (!currentPassword) {
      throw httpError("Debes confirmar tu contraseña actual para cambiar correo o contraseña.", 400);
    }
    const valid = await verifyPassword(currentPassword, row.password_salt, row.password_hash);
    if (!valid) throw httpError("La contraseña actual no es correcta.", 401);
  }

  const emailOwner = await db.prepare("SELECT id FROM users WHERE email_normalized = ?1 AND id <> ?2")
    .bind(nextEmail, user.id)
    .first();
  if (emailOwner) throw httpError("Ese correo ya está en uso.", 409);

  const now = new Date().toISOString();
  const statements = [
    db.prepare(
      "UPDATE users SET display_name = ?2, email = ?3, email_normalized = ?4, updated_at = ?5 WHERE id = ?1",
    ).bind(user.id, nextDisplayName, nextEmail, nextEmail, now),
  ];

  if (wantsPasswordChange) {
    validatePassword(nextPassword);
    const hash = await hashPassword(nextPassword);
    statements.push(
      db.prepare(
        "UPDATE users SET password_hash = ?2, password_salt = ?3, must_change_password = 0, password_changed_at = ?4, updated_at = ?4 WHERE id = ?1",
      ).bind(user.id, hash.hash, hash.salt, now),
    );
  }

  await executeBatches(db, statements, 10);
  return getUserById(db, user.id);
}

async function requestPasswordReset(db, rawEmail) {
  const email = normalizeEmail(rawEmail);
  const user = await db.prepare("SELECT * FROM users WHERE email_normalized = ?1 AND is_active = 1").bind(email).first();
  if (!user) return;

  const existing = await db.prepare(
    "SELECT id FROM password_reset_requests WHERE user_id = ?1 AND status = 'pending' LIMIT 1",
  )
    .bind(user.id)
    .first();
  if (existing) return;

  const now = new Date().toISOString();
  await db.prepare(
    `INSERT INTO password_reset_requests (
       id, user_id, organization_id, email_normalized, status, requested_at
     ) VALUES (?1, ?2, ?3, ?4, 'pending', ?5)`,
  )
    .bind(crypto.randomUUID(), user.id, user.organization_id || null, email, now)
    .run();
}

async function createSession(db, userId) {
  const token = crypto.randomUUID();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_TTL_SECONDS * 1000).toISOString();
  await db.prepare(
    "INSERT INTO sessions (id, user_id, expires_at, created_at, last_seen_at) VALUES (?1, ?2, ?3, ?4, ?4)",
  )
    .bind(token, userId, expiresAt, now.toISOString())
    .run();
  return token;
}

async function getSessionContext(request, db) {
  const cookies = parseCookies(request.headers.get("cookie") || "");
  const token = cookies[SESSION_COOKIE];
  if (!token) return null;

  const row = await db.prepare(
    `SELECT sessions.id AS session_id, sessions.expires_at, sessions.last_seen_at, users.*
       FROM sessions
       JOIN users ON users.id = sessions.user_id
      WHERE sessions.id = ?1`,
  )
    .bind(token)
    .first();

  if (!row) return null;
  if (Date.now() >= new Date(row.expires_at).getTime() || Number(row.is_active) !== 1) {
    await deleteSession(db, token);
    return null;
  }

  const lastSeenAt = row.last_seen_at ? new Date(row.last_seen_at).getTime() : 0;
  if (!lastSeenAt || Date.now() - lastSeenAt >= SESSION_TOUCH_INTERVAL_MS) {
    await db.prepare("UPDATE sessions SET last_seen_at = ?2 WHERE id = ?1")
      .bind(token, new Date().toISOString())
      .run();
  }

  return {
    sessionId: token,
    user: normalizeUser(row),
  };
}

async function deleteSession(db, sessionId) {
  await db.prepare("DELETE FROM sessions WHERE id = ?1").bind(sessionId).run();
}

async function createAdminForOrganization(db, payload) {
  const displayName = normalizeRequiredString(payload?.displayName, "El nombre del admin es obligatorio.");
  const email = normalizeEmail(payload?.email);
  const password = String(payload?.password || "");
  const organizationId = payload?.organizationId ? String(payload.organizationId).trim() : "";
  validatePassword(password);

  const existing = await db.prepare("SELECT id FROM users WHERE email_normalized = ?1").bind(email).first();
  if (existing) throw httpError("Ya existe un usuario con ese correo.", 409);

  let org = null;
  if (organizationId) {
    org = await getOrganizationById(db, organizationId);
    if (!org) throw httpError("La organización seleccionada no existe.", 404);
  } else {
    const organizationName = normalizeRequiredString(payload?.organizationName, "Debes seleccionar una organización existente o crear una nueva.");
    org = await createOrganization(db, organizationName);
  }

  const hash = await hashPassword(password);
  const now = new Date().toISOString();
  const id = crypto.randomUUID();

  await db.prepare(
    `INSERT INTO users (
       id, email, email_normalized, display_name, password_hash, password_salt, role, is_active, organization_id, created_at, updated_at
     ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, 'admin', 1, ?7, ?8, ?8)`,
  )
    .bind(id, email, email, displayName, hash.hash, hash.salt, org.id, now)
    .run();

  await db.prepare("UPDATE users SET must_change_password = 1, updated_at = ?2 WHERE id = ?1")
    .bind(id, now)
    .run();

  return getUserById(db, id);
}

async function createOrganization(db, name) {
  const slug = await generateUniqueOrganizationSlug(db, name);
  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  await db.prepare(
    "INSERT INTO organizations (id, name, slug, is_active, created_at, updated_at) VALUES (?1, ?2, ?3, 1, ?4, ?4)",
  )
    .bind(id, name, slug, now)
    .run();
  return { id, name, slug, isActive: true };
}

async function createTenantUser(db, adminUser, payload) {
  requireRole(adminUser, ["admin"]);
  const displayName = normalizeRequiredString(payload?.displayName, "El nombre es obligatorio.");
  const email = normalizeEmail(payload?.email);
  const password = String(payload?.password || "");
  validatePassword(password);
  const role = normalizeRole(payload?.role);
  if (role !== "user") throw httpError("Un admin solo puede crear usuarios finales.", 403);

  const existing = await db.prepare("SELECT id FROM users WHERE email_normalized = ?1").bind(email).first();
  if (existing) throw httpError("Ya existe un usuario con ese correo.", 409);

  const leagueIds = Array.isArray(payload?.leagueIds) ? payload.leagueIds.map(String) : [];
  await validateLeagueIdsForOrganization(db, adminUser.organizationId, leagueIds);

  const hash = await hashPassword(password);
  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  const statements = [
    db.prepare(
      `INSERT INTO users (
         id, email, email_normalized, display_name, password_hash, password_salt, role, is_active, organization_id, must_change_password, created_at, updated_at
       ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, 'user', 1, ?7, 1, ?8, ?8)`,
    ).bind(id, email, email, displayName, hash.hash, hash.salt, adminUser.organizationId, now),
  ];

  leagueIds.forEach((leagueId) => {
    statements.push(
      db.prepare(
        "INSERT INTO league_memberships (user_id, league_id, created_at) VALUES (?1, ?2, ?3)",
      ).bind(id, leagueId, now),
    );
  });

  await executeBatches(db, statements, 25);
  return getUserById(db, id);
}

async function buildUserImportTemplate(db, adminUser) {
  const leagues = await getTenantLeagues(db, adminUser.organizationId, false);
  if (!leagues.length) {
    throw httpError("Primero crea al menos una liga para descargar la plantilla de carga masiva.", 400);
  }
  const sampleLeagues = leagues.slice(0, 2).map((league) => league.name).join(" | ");
  return [
    "nombre,email,ligas,activo",
    `"Ana Pérez","ana@example.com","${sampleLeagues}","si"`,
    `"Luis Gómez","luis@example.com","${leagues[0].name}","no"`,
  ].join("\n");
}

async function buildUserImportPreview(db, adminUser, csvText) {
  requireRole(adminUser, ["admin"]);
  const rows = parseUserImportCsv(csvText);
  if (!rows.length) throw httpError("La plantilla no contiene filas de usuarios.", 400);
  if (rows.length > 2000) throw httpError("La carga masiva admite máximo 2000 filas por archivo.", 400);

  const leagues = await getTenantLeagues(db, adminUser.organizationId, false);
  if (!leagues.length) {
    throw httpError("Primero crea al menos una liga para validar o importar usuarios.", 400);
  }
  const leagueMap = new Map();
  leagues.forEach((league) => {
    [league.name, league.slug, league.competitionCode].forEach((alias) => {
      const key = normalizeLookupKey(alias);
      if (key && !leagueMap.has(key)) {
        leagueMap.set(key, league);
      }
    });
  });

  const emails = rows
    .map((row) => normalizeImportEmail(row.email))
    .filter(Boolean);
  const existingEmails = await getExistingEmails(db, emails);
  const seenEmails = new Set();

  const previewRows = rows.map((row) => {
    const messages = [];
    const displayName = String(row.nombre || "").trim();
    const email = normalizeImportEmail(row.email);
    const requestedLeagues = splitImportLeagues(row.ligas);
    const resolvedLeagues = [];
    let status = "valid";

    if (!displayName) {
      status = "error";
      messages.push("Falta el nombre.");
    }

    if (!email) {
      status = "error";
      messages.push("Correo inválido.");
    }

    if (email && seenEmails.has(email)) {
      status = "error";
      messages.push("Correo duplicado dentro del archivo.");
    }
    if (email) seenEmails.add(email);

    if (email && existingEmails.has(email)) {
      status = "conflict";
      messages.push("Ese correo ya existe en el sistema.");
    }

    if (!requestedLeagues.length) {
      status = "error";
      messages.push("Debes asignar al menos una liga.");
    }

    requestedLeagues.forEach((leagueName) => {
      const league = leagueMap.get(normalizeLookupKey(leagueName));
      if (!league) {
        status = "error";
        messages.push(`Liga no encontrada: ${leagueName}`);
        return;
      }
      if (!resolvedLeagues.some((entry) => entry.id === league.id)) {
        resolvedLeagues.push(league);
      }
    });

    const isActive = parseImportActiveFlag(row.activo);

    return {
      lineNumber: row.__lineNumber,
      displayName,
      email: email || String(row.email || "").trim(),
      leagues: resolvedLeagues.map((league) => league.name),
      leagueIds: resolvedLeagues.map((league) => league.id),
      isActive,
      status,
      messages: messages.length ? messages : [status === "valid" ? "Listo para crear." : "Se omitirá en la importación."],
    };
  });

  return {
    rows: previewRows,
    summary: {
      total: previewRows.length,
      valid: previewRows.filter((row) => row.status === "valid").length,
      conflicts: previewRows.filter((row) => row.status === "conflict").length,
      errors: previewRows.filter((row) => row.status === "error").length,
    },
  };
}

async function commitUserImport(db, adminUser, csvText) {
  const preview = await buildUserImportPreview(db, adminUser, csvText);
  const validRows = preview.rows.filter((row) => row.status === "valid");
  if (!validRows.length) {
    throw httpError("No hay filas válidas para importar.", 400);
  }

  const createdUsers = [];
  const reportRows = [];
  const allStatements = [];

  for (const row of preview.rows) {
    if (row.status !== "valid") {
      reportRows.push({
        ...row,
        finalStatus: row.status === "conflict" ? "skipped" : "error",
        temporaryPassword: "",
      });
      continue;
    }

    const password = generateTemporaryPassword();
    const hash = await hashPassword(password);
    const now = new Date().toISOString();
    const userId = crypto.randomUUID();
    const statements = [
      db.prepare(
        `INSERT INTO users (
           id, email, email_normalized, display_name, password_hash, password_salt, role, is_active, organization_id, must_change_password, created_at, updated_at
         ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, 'user', ?7, ?8, 1, ?9, ?9)`,
      ).bind(userId, row.email, row.email, row.displayName, hash.hash, hash.salt, row.isActive ? 1 : 0, adminUser.organizationId, now),
    ];

    row.leagueIds.forEach((leagueId) => {
      statements.push(
        db.prepare(
          "INSERT INTO league_memberships (user_id, league_id, created_at) VALUES (?1, ?2, ?3)",
        ).bind(userId, leagueId, now),
      );
    });

    allStatements.push(...statements);
    createdUsers.push({
      id: userId,
      displayName: row.displayName,
      email: row.email,
      leagues: row.leagues,
    });
    reportRows.push({
      ...row,
      finalStatus: "created",
      temporaryPassword: password,
    });
  }

  await executeBatches(db, allStatements, 75);

  const reportCsv = buildUserImportReportCsv(reportRows);
  return {
    rows: reportRows.map((row) => ({
      lineNumber: row.lineNumber,
      displayName: row.displayName,
      email: row.email,
      leagues: row.leagues,
      status: row.finalStatus,
      messages: row.messages,
      temporaryPassword: row.temporaryPassword,
    })),
    createdUsers,
    reportCsv,
    summary: {
      total: reportRows.length,
      created: reportRows.filter((row) => row.finalStatus === "created").length,
      skipped: reportRows.filter((row) => row.finalStatus === "skipped").length,
      errors: reportRows.filter((row) => row.finalStatus === "error").length,
    },
  };
}

async function updateAdminUser(db, actingUser, userId, payload) {
  requireRole(actingUser, ["superadmin"]);
  const target = await getUserById(db, userId);
  if (!target || target.role !== "admin") throw httpError("Admin no encontrado.", 404);

  const displayName = payload?.displayName != null ? normalizeRequiredString(payload.displayName, "Nombre inválido.") : target.displayName;
  const email = payload?.email != null ? normalizeEmail(payload.email) : target.email;
  const isActive = payload?.isActive == null ? target.isActive : Boolean(payload.isActive);
  const organizationName = payload?.organizationName != null
    ? normalizeRequiredString(payload.organizationName, "Nombre de organización inválido.")
    : null;

  const emailOwner = await db.prepare("SELECT id FROM users WHERE email_normalized = ?1 AND id <> ?2")
    .bind(email, userId)
    .first();
  if (emailOwner) throw httpError("Ese correo ya está en uso.", 409);

  const now = new Date().toISOString();
  const statements = [
    db.prepare(
      "UPDATE users SET display_name = ?2, email = ?3, email_normalized = ?4, is_active = ?5, updated_at = ?6 WHERE id = ?1",
    ).bind(userId, displayName, email, email, isActive ? 1 : 0, now),
  ];

  if (payload?.password) {
    validatePassword(String(payload.password));
    const hash = await hashPassword(String(payload.password));
    statements.push(
      db.prepare("UPDATE users SET password_hash = ?2, password_salt = ?3, updated_at = ?4 WHERE id = ?1")
        .bind(userId, hash.hash, hash.salt, now),
    );
  }

  if (organizationName && target.organizationId) {
    statements.push(
      db.prepare("UPDATE organizations SET name = ?2, updated_at = ?3 WHERE id = ?1")
        .bind(target.organizationId, organizationName, now),
    );
  }

  await executeBatches(db, statements, 10);
  return getUserById(db, userId);
}

async function updateTenantUser(db, actingUser, userId, payload) {
  requireRole(actingUser, ["admin"]);
  const target = await getUserById(db, userId);
  if (!target || target.role !== "user" || target.organizationId !== actingUser.organizationId) {
    throw httpError("Usuario no encontrado.", 404);
  }

  const displayName = payload?.displayName != null ? normalizeRequiredString(payload.displayName, "Nombre inválido.") : target.displayName;
  const email = payload?.email != null ? normalizeEmail(payload.email) : target.email;
  const isActive = payload?.isActive == null ? target.isActive : Boolean(payload.isActive);
  const leagueIds = Array.isArray(payload?.leagueIds) ? payload.leagueIds.map(String) : target.leagueIds || [];

  const emailOwner = await db.prepare("SELECT id FROM users WHERE email_normalized = ?1 AND id <> ?2")
    .bind(email, userId)
    .first();
  if (emailOwner) throw httpError("Ese correo ya está en uso.", 409);

  await validateLeagueIdsForOrganization(db, actingUser.organizationId, leagueIds);
  const now = new Date().toISOString();
  const statements = [
    db.prepare(
      "UPDATE users SET display_name = ?2, email = ?3, email_normalized = ?4, is_active = ?5, updated_at = ?6 WHERE id = ?1",
    ).bind(userId, displayName, email, email, isActive ? 1 : 0, now),
    db.prepare("DELETE FROM league_memberships WHERE user_id = ?1").bind(userId),
  ];

  if (payload?.password) {
    validatePassword(String(payload.password));
    const hash = await hashPassword(String(payload.password));
    statements.push(
      db.prepare("UPDATE users SET password_hash = ?2, password_salt = ?3, updated_at = ?4 WHERE id = ?1")
        .bind(userId, hash.hash, hash.salt, now),
    );
  }

  leagueIds.forEach((leagueId) => {
    statements.push(
      db.prepare(
        "INSERT INTO league_memberships (user_id, league_id, created_at) VALUES (?1, ?2, ?3)",
      ).bind(userId, leagueId, now),
    );
  });

  await executeBatches(db, statements, 25);
  return getUserById(db, userId);
}

async function deleteTenantUser(db, actingUser, userId) {
  requireRole(actingUser, ["admin"]);
  const target = await getUserById(db, userId);
  if (!target || target.role !== "user" || target.organizationId !== actingUser.organizationId) {
    throw httpError("Usuario no encontrado.", 404);
  }

  const leagueNames = await getLeagueNamesByIds(db, target.leagueIds || []);
  await deleteUserRecords(db, userId);
  return {
    ok: true,
    deletedCount: 1,
    userId,
    displayName: target.displayName,
    email: target.email,
    role: target.role,
    isActive: target.isActive,
    leagueNames,
  };
}

async function deleteAllTenantUsers(db, actingUser) {
  requireRole(actingUser, ["admin"]);
  const users = await getTenantUsers(db, actingUser.organizationId);
  const deletedUsers = users.map((user) => `${user.displayName} <${user.email}>`);
  for (const user of users) {
    await deleteUserRecords(db, user.id);
  }
  return { ok: true, deletedCount: users.length, deletedUsers };
}

async function createLeague(db, adminUser, payload) {
  requireRole(adminUser, ["admin"]);
  const league = validateLeaguePayload(payload);
  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  const slug = await generateUniqueLeagueSlug(db, adminUser.organizationId, league.name);
  await db.prepare(
    `INSERT INTO leagues (
       id, organization_id, name, slug, competition_code, competition_id, competition_name, season,
       exact_points, outcome_points, lock_minutes, last_sync_at, is_active, created_by_user_id, created_at, updated_at
     ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, NULL, ?12, ?13, ?14, ?14)`,
  )
    .bind(
      id,
      adminUser.organizationId,
      league.name,
      slug,
      league.competitionCode,
      league.competitionId,
      league.competitionName,
      league.season,
      league.exactPoints,
      league.outcomePoints,
      league.lockMinutes,
      league.isActive ? 1 : 0,
      adminUser.id,
      now,
    )
    .run();
  return getLeagueById(db, id);
}

async function updateLeague(db, adminUser, leagueId, payload) {
  requireRole(adminUser, ["admin"]);
  const existing = await getLeagueById(db, leagueId);
  if (!existing || existing.organizationId !== adminUser.organizationId) throw httpError("Liga no encontrada.", 404);
  const next = { ...existing, ...validatePartialLeaguePayload(payload) };
  const now = new Date().toISOString();
  await db.prepare(
    `UPDATE leagues
        SET name = ?2,
            competition_code = ?3,
            competition_id = ?4,
            competition_name = ?5,
            season = ?6,
            exact_points = ?7,
            outcome_points = ?8,
            lock_minutes = ?9,
            is_active = ?10,
            updated_at = ?11
      WHERE id = ?1`,
  )
    .bind(
      leagueId,
      next.name,
      next.competitionCode,
      next.competitionId,
      next.competitionName,
      next.season,
      next.exactPoints,
      next.outcomePoints,
      next.lockMinutes,
      next.isActive ? 1 : 0,
      now,
    )
    .run();
  return getLeagueById(db, leagueId);
}

async function deleteTenantLeague(db, actingUser, leagueId) {
  requireRole(actingUser, ["admin"]);
  const league = await getLeagueById(db, leagueId);
  if (!league || league.organizationId !== actingUser.organizationId) throw httpError("Liga no encontrada.", 404);
  await deleteLeagueRecords(db, leagueId);
  return {
    ok: true,
    deletedCount: 1,
    leagueId,
    name: league.name,
    competitionCode: league.competitionCode,
    competitionName: league.competitionName,
    season: league.season,
    isActive: league.isActive,
  };
}

async function deleteAllTenantLeagues(db, actingUser) {
  requireRole(actingUser, ["admin"]);
  const leagues = await getTenantLeagues(db, actingUser.organizationId, false);
  const deletedLeagues = leagues.map((league) => `${league.name} (${league.competitionCode} ${league.season})`);
  for (const league of leagues) {
    await deleteLeagueRecords(db, league.id);
  }
  return { ok: true, deletedCount: leagues.length, deletedLeagues };
}

async function deleteOrganization(db, actingUser, organizationId) {
  requireRole(actingUser, ["superadmin"]);
  const organization = await getOrganizationById(db, organizationId);
  if (!organization) throw httpError("Organización no encontrada.", 404);

  const [usersResult, leagues] = await Promise.all([
    db.prepare("SELECT id, role FROM users WHERE organization_id = ?1").bind(organizationId).all(),
    getTenantLeagues(db, organizationId, false),
  ]);
  const userRows = usersResult.results || [];
  const userIds = userRows.map((row) => row.id);
  const deletedAdmins = userRows.filter((row) => row.role === "admin").length;
  const deletedEndUsers = userRows.filter((row) => row.role === "user").length;

  for (const league of leagues) {
    await deleteLeagueRecords(db, league.id);
  }

  for (const userId of userIds) {
    await deleteUserRecords(db, userId);
  }

  await executeBatches(db, [
    db.prepare("DELETE FROM password_reset_requests WHERE organization_id = ?1").bind(organizationId),
    db.prepare("DELETE FROM organizations WHERE id = ?1").bind(organizationId),
  ], 10);

  return {
    ok: true,
    organizationId,
    name: organization.name,
    deletedUsers: userIds.length,
    deletedLeagues: leagues.length,
    deletedAdmins,
    deletedEndUsers,
  };
}

async function updateOrganizationState(db, actingUser, organizationId, payload) {
  requireRole(actingUser, ["superadmin"]);
  const organization = await getOrganizationById(db, organizationId);
  if (!organization) throw httpError("Organización no encontrada.", 404);
  if (typeof payload?.isActive !== "boolean") {
    throw httpError("Debes indicar si la organización debe quedar activa o inactiva.", 400);
  }

  const now = new Date().toISOString();
  await db.prepare("UPDATE organizations SET is_active = ?2, updated_at = ?3 WHERE id = ?1")
    .bind(organizationId, payload.isActive ? 1 : 0, now)
    .run();

  return getOrganizationById(db, organizationId);
}

async function syncLeague(env, adminUser, leagueId) {
  requireRole(adminUser, ["admin"]);
  const league = await getLeagueById(env.DB, leagueId);
  if (!league || league.organizationId !== adminUser.organizationId) throw httpError("Liga no encontrada.", 404);
  return syncExistingLeague(env, league);
}

async function syncExistingLeague(env, league, competitionsCatalog = null) {
  const result = await syncCompetitionSeason(env, league, competitionsCatalog);
  await env.DB.prepare(
    "UPDATE leagues SET competition_id = ?2, competition_name = ?3, last_sync_at = ?4, updated_at = ?4 WHERE id = ?1",
  ).bind(league.id, result.competitionId, result.competitionName, result.syncedAt).run();
  return { ...result, leagueId: league.id };
}

async function syncCompetitionSeason(env, league, competitionsCatalog = null) {
  if (!env.FOOTBALL_DATA_API_TOKEN) throw httpError("Falta FOOTBALL_DATA_API_TOKEN.", 400);

  const competitions = competitionsCatalog || await getCompetitions(env);
  const catalogMatch = competitions.find((competition) => competition.code === league.competitionCode);
  const competitionId = league.competitionId || catalogMatch?.id || null;
  const competitionName = catalogMatch?.name || league.competitionName || league.competitionCode;
  const candidateKeys = [competitionId, league.competitionCode].filter(Boolean);

  const matchesPayload = await fetchCompetitionResource(
    env.FOOTBALL_DATA_API_TOKEN,
    candidateKeys,
    "matches",
    league.season,
  );
  const standingsPayload = await fetchCompetitionResource(
    env.FOOTBALL_DATA_API_TOKEN,
    candidateKeys,
    "standings",
    league.season,
    true,
  );

  const syncedAt = new Date().toISOString();
  const matches = (Array.isArray(matchesPayload?.matches) ? matchesPayload.matches : [])
    .map((match) => normalizeMatch(match, league.id, league.competitionCode, competitionName, league.season, syncedAt))
    .filter(Boolean);
  const standings = normalizeStandings(
    Array.isArray(standingsPayload?.standings) ? standingsPayload.standings : [],
    league.competitionCode,
    competitionName,
    league.season,
    syncedAt,
  );

  const existingRows = await env.DB.prepare(
    "SELECT id FROM shared_matches WHERE competition_code = ?1 AND season = ?2",
  ).bind(league.competitionCode, league.season).all();
  const existingIds = new Set((existingRows.results || []).map((row) => row.id));
  const nextIds = new Set(matches.map((match) => match.id));
  const idsToDelete = [...existingIds].filter((id) => !nextIds.has(id));

  const statements = [
    env.DB.prepare("DELETE FROM shared_standings WHERE competition_code = ?1 AND season = ?2")
      .bind(league.competitionCode, league.season),
  ];

  matches.forEach((match) => {
    statements.push(
      env.DB.prepare(
        `INSERT INTO shared_matches (
           id, source_match_id, competition_code, competition_name, season, utc_date, stage,
           status, home_team, away_team, score_home, score_away, matchday, last_synced_at
         ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14)
         ON CONFLICT(id) DO UPDATE SET
           source_match_id = excluded.source_match_id,
           competition_code = excluded.competition_code,
           competition_name = excluded.competition_name,
           season = excluded.season,
           utc_date = excluded.utc_date,
           stage = excluded.stage,
           status = excluded.status,
           home_team = excluded.home_team,
           away_team = excluded.away_team,
           score_home = excluded.score_home,
           score_away = excluded.score_away,
           matchday = excluded.matchday,
           last_synced_at = excluded.last_synced_at`,
      ).bind(
        match.id,
        match.sourceMatchId,
        match.competitionCode,
        match.competitionName,
        match.season,
        match.utcDate,
        match.stage,
        match.status,
        match.homeTeam,
        match.awayTeam,
        match.scoreHome,
        match.scoreAway,
        match.matchday,
        match.lastSyncedAt,
      ),
    );
  });

  standings.forEach((standing, index) => {
    statements.push(
      env.DB.prepare(
        `INSERT INTO shared_standings (
           id, competition_code, competition_name, season, label, sort_order, rows_json, last_synced_at
         ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)`,
      ).bind(
        `standing:${league.competitionCode}:${league.season}:${index}`,
        league.competitionCode,
        competitionName,
        league.season,
        standing.label,
        index,
        JSON.stringify(standing.rows),
        standing.lastSyncedAt,
      ),
    );
  });

  idsToDelete.forEach((matchId) => {
    statements.push(env.DB.prepare("DELETE FROM league_predictions WHERE match_id = ?1").bind(matchId));
    statements.push(env.DB.prepare("DELETE FROM shared_matches WHERE id = ?1").bind(matchId));
  });

  await executeBatches(env.DB, statements, 40);
  return {
    ok: true,
    competitionCode: league.competitionCode,
    competitionId,
    competitionName,
    season: league.season,
    matchesCount: matches.length,
    standingsCount: standings.length,
    syncedAt,
  };
}

async function getLeagueTeamAssets(env, viewer, leagueId) {
  const league = await getLeagueById(env.DB, leagueId);
  if (!league) throw httpError("Liga no encontrada.", 404);
  await ensureLeagueAccess(env.DB, viewer, leagueId);
  return getLeagueTeamAssetsData(env, league);
}

async function getLeagueTeamAssetsData(env, league, options = {}) {
  if (!env.FOOTBALL_DATA_API_TOKEN) return { assets: {}, matchGroups: {} };
  const bypassCache = Boolean(options?.bypassCache);

  const leagueVersion = await getCacheVersion(env, getLeagueVersionKey(league.id));
  const cacheKey = `team-assets:${league.id}:v:${leagueVersion}`;
  if (env.APP_CACHE && !bypassCache) {
    const cached = await cacheGetJson(env.APP_CACHE, cacheKey);
    if (cached) return cached;
  }

  const candidateKeys = [league.competitionId, league.competitionCode].filter(Boolean);
  const [matchesPayload, teamsPayload] = await Promise.all([
    fetchCompetitionResource(
      env.FOOTBALL_DATA_API_TOKEN,
      candidateKeys,
      "matches",
      league.season,
      true,
    ),
    fetchCompetitionResource(
      env.FOOTBALL_DATA_API_TOKEN,
      candidateKeys,
      "teams",
      league.season,
      true,
    ),
  ]);

  const matches = Array.isArray(matchesPayload?.matches) ? matchesPayload.matches : [];
  const teams = Array.isArray(teamsPayload?.teams) ? teamsPayload.teams : [];
  const result = {
    assets: buildTeamAssetsMap(matches, league.id, teams),
    matchGroups: buildMatchGroupsMap(matches),
  };
  if (env.APP_CACHE) {
    await cachePutJson(env.APP_CACHE, cacheKey, result, TEAM_ASSETS_CACHE_TTL_SECONDS);
  }
  return result;
}

function buildTeamAssetsMap(matches, leagueId, teams = []) {
  const assets = {};
  teams.forEach((team) => {
    const asset = normalizeTeamAsset(team, leagueId);
    if (!asset) return;
    [team.name, team.shortName, team.tla].forEach((alias) => {
      const key = normalizeLookupKey(alias);
      if (!key || assets[key]) return;
      assets[key] = asset;
    });
  });
  matches.forEach((match) => {
    [match?.homeTeam, match?.awayTeam].forEach((team) => {
      if (!team?.name) return;
      const asset = normalizeTeamAsset(team, leagueId);
      if (!asset) return;
      [team.name, team.shortName, team.tla].forEach((alias) => {
        const key = normalizeLookupKey(alias);
        if (!key || assets[key]) return;
        assets[key] = asset;
      });
    });
  });
  return assets;
}

function normalizeTeamAsset(team, leagueId) {
  const name = String(team?.name || "").trim();
  if (!name) return null;
  const teamKey = normalizeLookupKey(name);
  return {
    name,
    shortName: String(team?.shortName || "").trim() || name,
    tla: String(team?.tla || "").trim(),
    crestUrl: String(team?.crest || "").trim(),
    proxyUrl: teamKey && leagueId
      ? `/api/media/team-crest?leagueId=${encodeURIComponent(leagueId)}&team=${encodeURIComponent(teamKey)}`
      : "",
  };
}

function buildMatchGroupsMap(matches) {
  const groups = {};
  matches.forEach((match) => {
    const sourceId = Number(match?.id);
    if (!Number.isFinite(sourceId)) return;
    const label = normalizeMatchGroupLabel(match);
    if (!label) return;
    groups[String(sourceId)] = label;
  });
  return groups;
}

function normalizeMatchGroupLabel(match) {
  const rawGroup = String(match?.group || "").trim();
  if (!rawGroup) return "";
  const translated = translateStage(rawGroup);
  if (!translated || translated === "Fase de grupos" || translated === "Sin fase") return "";
  return translated;
}

function normalizeLookupKey(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

async function serveFlagAsset(env, rawFlagCode) {
  const flagCode = String(rawFlagCode || "").trim().toLowerCase();
  const subdivisionFlags = {
    "gb-eng": "https://flagcdn.com/gb-eng.svg",
    "gb-sct": "https://flagcdn.com/gb-sct.svg",
    "gb-wls": "https://flagcdn.com/gb-wls.svg",
    "gb-nir": "https://flagcdn.com/gb-nir.svg",
  };
  const isCountryFlag = /^[a-z]{2}$/.test(flagCode);
  const sourceUrl = subdivisionFlags[flagCode] || (isCountryFlag
    ? `https://hatscripts.github.io/circle-flags/flags/${flagCode}.svg`
    : "");
  if (!sourceUrl) {
    throw httpError("Bandera no válida.", 400);
  }
  return serveRemoteMediaAsset(
    env,
    `flags/${flagCode}.svg`,
    sourceUrl,
    "image/svg+xml; charset=utf-8",
  );
}

async function serveTeamCrestAsset(env, leagueId, teamKey) {
  if (!leagueId || !teamKey) throw httpError("Faltan parámetros para cargar el escudo.", 400);
  const league = await getLeagueById(env.DB, leagueId);
  if (!league) throw httpError("Liga no encontrada.", 404);
  const normalizedTeamKey = normalizeLookupKey(teamKey);
  let payload = await getLeagueTeamAssetsData(env, league);
  let asset = payload.assets?.[normalizedTeamKey];
  if (!asset?.crestUrl) {
    payload = await getLeagueTeamAssetsData(env, league, { bypassCache: true });
    asset = payload.assets?.[normalizedTeamKey];
  }
  if (!asset?.crestUrl) throw httpError("Escudo no disponible.", 404);

  const extension = asset.crestUrl.includes(".svg") ? "svg" : "png";
  return serveRemoteMediaAsset(
    env,
    `crests/${leagueId}/${normalizedTeamKey}.${extension}`,
    asset.crestUrl,
    extension === "svg" ? "image/svg+xml; charset=utf-8" : "image/png",
  );
}

async function serveRemoteMediaAsset(env, objectKey, sourceUrl, fallbackType) {
  if (env.MEDIA_BUCKET) {
    const cachedObject = await env.MEDIA_BUCKET.get(objectKey);
    if (cachedObject) {
      return new Response(cachedObject.body, {
        headers: {
          "content-type": cachedObject.httpMetadata?.contentType || fallbackType,
          "cache-control": "public, max-age=86400, stale-while-revalidate=604800",
        },
      });
    }
  }

  const response = await fetch(sourceUrl, {
    cf: { cacheEverything: true, cacheTtl: 86400 },
    headers: { "user-agent": "football-porra-tracker/1.0" },
  });
  if (!response.ok) {
    throw httpError("No se pudo cargar el recurso solicitado.", 502);
  }

  const buffer = await response.arrayBuffer();
  const contentType = response.headers.get("content-type") || fallbackType;
  if (env.MEDIA_BUCKET) {
    await env.MEDIA_BUCKET.put(objectKey, buffer, {
      httpMetadata: { contentType },
    });
  }

  return new Response(buffer, {
    headers: {
      "content-type": contentType,
      "cache-control": "public, max-age=86400, stale-while-revalidate=604800",
    },
  });
}

async function runScheduledLeagueSync(controller, env) {
  if (!env.FOOTBALL_DATA_API_TOKEN) {
    console.warn("[cron-sync] Sync omitido: falta FOOTBALL_DATA_API_TOKEN.");
    return;
  }

  const leagues = await getLeaguesForScheduledSync(env.DB);
  if (!leagues.length) {
    console.log("[cron-sync] No hay ligas activas creadas para sincronizar.");
    return;
  }

  const competitions = await getCompetitions(env);
  const results = [];
  const groups = new Map();

  for (const league of leagues) {
    const key = `${league.competitionCode}:${league.season}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(league);
  }

  for (const groupLeagues of groups.values()) {
    const [sourceLeague] = groupLeagues;
    try {
      const result = await syncCompetitionSeason(env, sourceLeague, competitions);
      const statements = groupLeagues.map((league) =>
        env.DB.prepare(
          "UPDATE leagues SET competition_id = ?2, competition_name = ?3, last_sync_at = ?4, updated_at = ?4 WHERE id = ?1",
        ).bind(league.id, result.competitionId, result.competitionName, result.syncedAt),
      );
      await executeBatches(env.DB, statements, 40);

      for (const league of groupLeagues) {
        await createAuditLog(env.DB, {
          organizationId: league.organizationId,
          actorUserId: null,
          actorRole: "system",
          actorDisplayName: "cron-sync",
          actionType: "league_synced_automatic",
          entityType: "league",
          entityId: league.id,
          entityLabel: league.name,
          details: { matchesCount: result.matchesCount, standingsCount: result.standingsCount },
        });
        await bumpLeagueCacheVersion(env, league.id);
        results.push({ leagueId: league.id, leagueName: league.name, ok: true, ...result });
      }
    } catch (error) {
      groupLeagues.forEach((league) => {
        results.push({
          leagueId: league.id,
          leagueName: league.name,
          ok: false,
          error: error.message || "Error desconocido",
        });
      });
    }
  }

  const okCount = results.filter((entry) => entry.ok).length;
  const failed = results.filter((entry) => !entry.ok);
  console.log(
    `[cron-sync] Ejecutado ${controller?.cron || "manual"}: ${okCount}/${results.length} ligas sincronizadas.`,
  );
  if (failed.length) {
    console.warn(`[cron-sync] Fallaron ${failed.length} ligas: ${failed.map((entry) => `${entry.leagueName}: ${entry.error}`).join(" | ")}`);
  }
}

async function upsertLeaguePrediction(db, user, payload) {
  const prepared = await preparePredictionWrite(db, user, payload);
  const { league, id, matchId, homeGoals, awayGoals, now } = prepared;
  await db.prepare(
    `INSERT INTO league_predictions (
       id, user_id, league_id, match_id, home_goals, away_goals, created_at, updated_at
     ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?7)
     ON CONFLICT(user_id, league_id, match_id) DO UPDATE SET
       id = excluded.id,
       home_goals = excluded.home_goals,
       away_goals = excluded.away_goals,
       updated_at = excluded.updated_at`,
  )
    .bind(id, user.id, league.id, matchId, homeGoals, awayGoals, now)
    .run();

  return {
    id,
    userId: user.id,
    displayName: user.displayName,
    email: user.email,
    leagueId: league.id,
    matchId,
    homeGoals,
    awayGoals,
    pointsAwarded: 0,
    createdAt: now,
    updatedAt: now,
  };
}

async function preparePredictionWrite(db, user, payload) {
  const leagueId = String(payload?.leagueId || "").trim();
  const matchId = String(payload?.matchId || "").trim();
  const homeGoals = Number(payload?.homeGoals);
  const awayGoals = Number(payload?.awayGoals);
  if (!leagueId) throw httpError("Selecciona una liga.", 400);
  if (!matchId) throw httpError("Selecciona un partido.", 400);
  if (!Number.isInteger(homeGoals) || homeGoals < 0 || !Number.isInteger(awayGoals) || awayGoals < 0) {
    throw httpError("Introduce un marcador válido.", 400);
  }

  const league = await getLeagueById(db, leagueId);
  if (!league) throw httpError("Liga no encontrada.", 404);
  await ensureLeagueAccess(db, user, league.id);
  const match = await db.prepare(
    `SELECT shared_matches.*, ?1 AS league_id
       FROM shared_matches
      WHERE id = ?2 AND competition_code = ?3 AND season = ?4`,
  ).bind(league.id, matchId, league.competitionCode, league.season).first();
  if (!match) throw httpError("Partido no encontrado.", 404);
  if (!canPredict(match, league)) throw httpError("Las apuestas para este partido ya están cerradas.", 409);

  const id = buildLeaguePredictionId(user.id, league.id, matchId);
  const now = new Date().toISOString();
  return { league, id, matchId, homeGoals, awayGoals, now };
}

async function enqueueLeaguePrediction(env, user, payload) {
  if (!env.PREDICTION_QUEUE) {
    return upsertLeaguePrediction(env.DB, user, payload);
  }

  const prepared = await preparePredictionWrite(env.DB, user, payload);
  await env.PREDICTION_QUEUE.send({
    type: "prediction_upsert",
    predictionId: prepared.id,
    userId: user.id,
    displayName: user.displayName,
    email: user.email,
    organizationId: user.organizationId,
    leagueId: prepared.league.id,
    matchId: prepared.matchId,
    homeGoals: prepared.homeGoals,
    awayGoals: prepared.awayGoals,
    createdAt: prepared.now,
  });

  return {
    id: prepared.id,
    userId: user.id,
    displayName: user.displayName,
    email: user.email,
    leagueId: prepared.league.id,
    matchId: prepared.matchId,
    homeGoals: prepared.homeGoals,
    awayGoals: prepared.awayGoals,
    pointsAwarded: 0,
    createdAt: prepared.now,
    updatedAt: prepared.now,
  };
}

async function persistQueuedPrediction(db, payload) {
  await db.prepare(
    `INSERT INTO league_predictions (
       id, user_id, league_id, match_id, home_goals, away_goals, created_at, updated_at
     ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?7)
     ON CONFLICT(user_id, league_id, match_id) DO UPDATE SET
       id = excluded.id,
       home_goals = excluded.home_goals,
       away_goals = excluded.away_goals,
       updated_at = excluded.updated_at`,
  )
    .bind(
      payload.predictionId,
      payload.userId,
      payload.leagueId,
      payload.matchId,
      payload.homeGoals,
      payload.awayGoals,
      payload.createdAt || new Date().toISOString(),
    )
    .run();
}

function isPredictionQueueEnabled(env) {
  return Boolean(env.PREDICTION_QUEUE) && String(env.ENABLE_PREDICTION_QUEUE || "").toLowerCase() === "true";
}

async function deleteLeaguePrediction(db, user, predictionId) {
  const row = await db.prepare(
    `SELECT league_predictions.id,
            league_predictions.user_id,
            league_predictions.league_id,
            league_predictions.match_id,
            shared_matches.utc_date,
            shared_matches.status
       FROM league_predictions
       JOIN shared_matches ON shared_matches.id = league_predictions.match_id
      WHERE league_predictions.id = ?1`,
  )
    .bind(predictionId)
    .first();

  if (!row || row.user_id !== user.id) throw httpError("Porra no encontrada.", 404);
  const league = await getLeagueById(db, row.league_id);
  if (!canPredict(row, league)) throw httpError("Ya no se puede eliminar esta porra.", 409);
  await db.prepare("DELETE FROM league_predictions WHERE id = ?1").bind(predictionId).run();
  return { ok: true, leagueId: league.id };
}

async function getManageableUsers(db, actingUser) {
  return actingUser.role === "superadmin"
    ? getSuperadminManagedAdmins(db)
    : getTenantUsers(db, actingUser.organizationId);
}

async function getSuperadminManagedAdmins(db) {
  const result = await db.prepare(
    `SELECT users.*, organizations.name AS organization_name
       FROM users
       LEFT JOIN organizations ON organizations.id = users.organization_id
      WHERE users.role = 'admin'
      ORDER BY users.created_at ASC`,
  ).all();

  return (result.results || []).map((row) => ({
    ...normalizeUser(row),
    organizationName: row.organization_name || "",
    leagueIds: [],
    leagues: [],
  }));
}

async function getTenantUsers(db, organizationId) {
  const usersResult = await db.prepare(
    "SELECT * FROM users WHERE organization_id = ?1 AND role = 'user' ORDER BY created_at ASC",
  )
    .bind(organizationId)
    .all();
  const memberships = await db.prepare(
    `SELECT league_memberships.user_id, league_memberships.league_id, leagues.name
       FROM league_memberships
       JOIN leagues ON leagues.id = league_memberships.league_id
      WHERE leagues.organization_id = ?1`,
  )
    .bind(organizationId)
    .all();

  const membershipsByUser = new Map();
  (memberships.results || []).forEach((row) => {
    const list = membershipsByUser.get(row.user_id) || [];
    list.push({ id: row.league_id, name: row.name });
    membershipsByUser.set(row.user_id, list);
  });

  return (usersResult.results || []).map((row) => ({
    ...normalizeUser(row),
    leagueIds: (membershipsByUser.get(row.id) || []).map((league) => league.id),
    leagues: membershipsByUser.get(row.id) || [],
  }));
}

async function getPasswordResetRequests(db, organizationId) {
  const result = await db.prepare(
    `SELECT password_reset_requests.*,
            users.display_name,
            users.email
       FROM password_reset_requests
       JOIN users ON users.id = password_reset_requests.user_id
      WHERE password_reset_requests.organization_id = ?1
        AND password_reset_requests.status = 'pending'
      ORDER BY password_reset_requests.requested_at DESC`,
  )
    .bind(organizationId)
    .all();

  return (result.results || []).map((row) => ({
    id: row.id,
    userId: row.user_id,
    displayName: row.display_name,
    email: row.email,
    requestedAt: row.requested_at,
    status: row.status,
  }));
}

async function issueTemporaryPassword(db, actingUser, requestId) {
  const row = await db.prepare(
    `SELECT password_reset_requests.*, users.organization_id, users.id AS user_id
       FROM password_reset_requests
       JOIN users ON users.id = password_reset_requests.user_id
      WHERE password_reset_requests.id = ?1`,
  )
    .bind(requestId)
    .first();

  if (!row || row.organization_id !== actingUser.organizationId || row.status !== "pending") {
    throw httpError("Solicitud no encontrada.", 404);
  }

  const temporaryPassword = generateTemporaryPassword();
  const hash = await hashPassword(temporaryPassword);
  const now = new Date().toISOString();
  await executeBatches(db, [
    db.prepare(
      `UPDATE users
          SET password_hash = ?2,
              password_salt = ?3,
              must_change_password = 1,
              updated_at = ?4
        WHERE id = ?1`,
    ).bind(row.user_id, hash.hash, hash.salt, now),
    db.prepare(
      `UPDATE password_reset_requests
          SET status = 'resolved',
              resolved_at = ?2,
              resolved_by_user_id = ?3
        WHERE id = ?1`,
    ).bind(requestId, now, actingUser.id),
  ], 10);

  return { ok: true, temporaryPassword };
}

async function createAuditLog(db, entry) {
  const now = new Date().toISOString();
  await db.prepare(
    `INSERT INTO audit_logs (
       id, organization_id, actor_user_id, actor_role, actor_display_name,
       action_type, entity_type, entity_id, entity_label, details_json, created_at
     ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)`,
  )
    .bind(
      crypto.randomUUID(),
      entry.organizationId || null,
      entry.actorUserId || null,
      entry.actorRole,
      entry.actorDisplayName || null,
      entry.actionType,
      entry.entityType,
      entry.entityId || null,
      entry.entityLabel || null,
      JSON.stringify(entry.details || {}),
      now,
    )
    .run();
}

async function getAuditLogs(db, organizationId = "") {
  const result = organizationId
    ? await db.prepare(
      `SELECT audit_logs.*, organizations.name AS organization_name
         FROM audit_logs
         LEFT JOIN organizations ON organizations.id = audit_logs.organization_id
        WHERE audit_logs.organization_id = ?1
        ORDER BY audit_logs.created_at DESC
        LIMIT 500`,
    ).bind(organizationId).all()
    : await db.prepare(
      `SELECT audit_logs.*, organizations.name AS organization_name
         FROM audit_logs
         LEFT JOIN organizations ON organizations.id = audit_logs.organization_id
        ORDER BY audit_logs.created_at DESC
        LIMIT 500`,
    ).all();

  return (result.results || []).map((row) => ({
    id: row.id,
    organizationId: row.organization_id || null,
    organizationName: row.organization_name || "Global",
    actorUserId: row.actor_user_id || null,
    actorRole: row.actor_role,
    actorDisplayName: row.actor_display_name || row.actor_role,
    actionType: row.action_type,
    entityType: row.entity_type,
    entityId: row.entity_id || null,
    entityLabel: row.entity_label || "",
    details: safeParseJson(row.details_json, {}),
    createdAt: row.created_at,
  }));
}

async function getOrganizations(db, includeInactive = false) {
  const result = await db.prepare(
    `SELECT organizations.*,
            (SELECT COUNT(*) FROM users WHERE users.organization_id = organizations.id AND users.role = 'admin') AS admin_count,
            (SELECT COUNT(*) FROM users WHERE users.organization_id = organizations.id AND users.role = 'user') AS user_count,
            (SELECT COUNT(*) FROM leagues WHERE leagues.organization_id = organizations.id) AS league_count
       FROM organizations
      ${includeInactive ? "" : "WHERE organizations.is_active = 1"}
      ORDER BY organizations.name ASC`,
  ).all();
  return (result.results || []).map(normalizeOrganization);
}

async function getOrganizationById(db, organizationId) {
  if (!organizationId) return null;
  const row = await db.prepare(
    `SELECT organizations.*,
            (SELECT COUNT(*) FROM users WHERE users.organization_id = organizations.id AND users.role = 'admin') AS admin_count,
            (SELECT COUNT(*) FROM users WHERE users.organization_id = organizations.id AND users.role = 'user') AS user_count,
            (SELECT COUNT(*) FROM leagues WHERE leagues.organization_id = organizations.id) AS league_count
       FROM organizations
      WHERE organizations.id = ?1`,
  ).bind(organizationId).first();
  return row ? normalizeOrganization(row) : null;
}

async function getAccessibleLeagues(db, user) {
  if (user.role === "admin") return getTenantLeagues(db, user.organizationId, true);

  const result = await db.prepare(
    `SELECT leagues.*
       FROM leagues
       JOIN league_memberships ON league_memberships.league_id = leagues.id
      WHERE league_memberships.user_id = ?1 AND leagues.is_active = 1
      ORDER BY leagues.name ASC`,
  )
    .bind(user.id)
    .all();
  return (result.results || []).map(normalizeLeague);
}

async function getTenantLeagues(db, organizationId, activeOnly = false) {
  const query = activeOnly
    ? "SELECT * FROM leagues WHERE organization_id = ?1 AND is_active = 1 ORDER BY name ASC"
    : "SELECT * FROM leagues WHERE organization_id = ?1 ORDER BY name ASC";
  const result = await db.prepare(query).bind(organizationId).all();
  return (result.results || []).map(normalizeLeague);
}

async function getLeaguesForScheduledSync(db) {
  const result = await db.prepare("SELECT * FROM leagues WHERE is_active = 1 ORDER BY updated_at ASC, name ASC").all();
  return (result.results || []).map(normalizeLeague);
}

async function getLeagueById(db, leagueId) {
  const row = await db.prepare("SELECT * FROM leagues WHERE id = ?1").bind(leagueId).first();
  return row ? normalizeLeague(row) : null;
}

async function ensureLeagueAccess(db, user, leagueId) {
  const league = await getLeagueById(db, leagueId);
  if (!league) throw httpError("Liga no encontrada.", 404);
  if (user.role === "admin" && league.organizationId === user.organizationId) return;
  if (user.role === "user") {
    const row = await db.prepare(
      "SELECT 1 FROM league_memberships WHERE user_id = ?1 AND league_id = ?2",
    )
      .bind(user.id, leagueId)
      .first();
    if (row) return;
  }
  throw httpError("No tienes acceso a esta liga.", 403);
}

async function getLeagueUsers(db, leagueId) {
  const result = await db.prepare(
    `SELECT users.id, users.display_name, users.email, users.role, users.is_active
       FROM users
       JOIN league_memberships ON league_memberships.user_id = users.id
      WHERE league_memberships.league_id = ?1 AND users.is_active = 1
      ORDER BY users.display_name ASC`,
  )
    .bind(leagueId)
    .all();
  return mapLeagueUsers(result.results || []);
}

async function getLeagueMatches(db, leagueId) {
  const league = await getLeagueById(db, leagueId);
  if (!league) return [];
  const result = await db.prepare(
    `SELECT shared_matches.*, ?1 AS league_id
       FROM shared_matches
      WHERE competition_code = ?2 AND season = ?3
      ORDER BY utc_date ASC`,
  )
    .bind(league.id, league.competitionCode, league.season)
    .all();
  return mapLeagueMatches(result.results || []);
}

async function getLeagueStandings(db, leagueId) {
  const league = await getLeagueById(db, leagueId);
  if (!league) return [];
  const result = await db.prepare(
    `SELECT *
       FROM shared_standings
      WHERE competition_code = ?1 AND season = ?2
      ORDER BY sort_order ASC`,
  )
    .bind(league.competitionCode, league.season)
    .all();
  return mapLeagueStandings(result.results || []);
}

async function getLeaguePredictions(db, leagueId) {
  const result = await db.prepare(
    `SELECT league_predictions.id,
            league_predictions.user_id AS userId,
            league_predictions.league_id AS leagueId,
            users.display_name AS displayName,
            users.email AS email,
            league_predictions.match_id AS matchId,
            league_predictions.home_goals AS homeGoals,
            league_predictions.away_goals AS awayGoals,
            league_predictions.created_at AS createdAt,
            league_predictions.updated_at AS updatedAt
       FROM league_predictions
       JOIN users ON users.id = league_predictions.user_id
      WHERE league_predictions.league_id = ?1
      ORDER BY league_predictions.updated_at DESC`,
  )
    .bind(leagueId)
    .all();
  return mapLeaguePredictions(result.results || []);
}

function mapLeagueUsers(rows) {
  return rows.map((row) => ({
    id: row.id,
    displayName: row.display_name,
    email: row.email,
    role: row.role,
    isActive: Number(row.is_active) === 1,
  }));
}

function mapLeagueMatches(rows) {
  return rows.map((row) => ({
    id: row.id,
    leagueId: row.league_id,
    sourceMatchId: Number(row.source_match_id),
    competitionCode: row.competition_code,
    competitionName: row.competition_name || row.competition_code,
    season: Number(row.season),
    utcDate: row.utc_date,
    stage: row.stage || "Sin fase",
    status: row.status,
    homeTeam: row.home_team,
    awayTeam: row.away_team,
    scoreHome: toNullableNumber(row.score_home),
    scoreAway: toNullableNumber(row.score_away),
    matchday: toNullableNumber(row.matchday),
    lastSyncedAt: row.last_synced_at,
  }));
}

function mapLeagueStandings(rows) {
  return rows.map((row) => ({
    id: row.id,
    label: row.label,
    rows: safeParseJson(row.rows_json, []),
    lastSyncedAt: row.last_synced_at,
  }));
}

function mapLeaguePredictions(rows) {
  return rows.map((row) => ({
    id: row.id,
    userId: row.userId,
    leagueId: row.leagueId,
    displayName: row.displayName,
    email: row.email,
    matchId: row.matchId,
    homeGoals: Number(row.homeGoals),
    awayGoals: Number(row.awayGoals),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }));
}

async function deleteUserRecords(db, userId) {
  await executeBatches(db, [
    db.prepare("DELETE FROM sessions WHERE user_id = ?1").bind(userId),
    db.prepare("DELETE FROM password_reset_requests WHERE user_id = ?1").bind(userId),
    db.prepare("DELETE FROM league_predictions WHERE user_id = ?1").bind(userId),
    db.prepare("DELETE FROM league_memberships WHERE user_id = ?1").bind(userId),
    db.prepare("DELETE FROM users WHERE id = ?1").bind(userId),
  ], 20);
}

async function deleteLeagueRecords(db, leagueId) {
  const statements = [
    db.prepare("DELETE FROM league_memberships WHERE league_id = ?1").bind(leagueId),
    db.prepare("DELETE FROM league_predictions WHERE league_id = ?1").bind(leagueId),
    db.prepare("DELETE FROM leagues WHERE id = ?1").bind(leagueId),
  ];

  await executeBatches(db, statements, 30);
}

async function getUserById(db, userId) {
  const row = await db.prepare("SELECT * FROM users WHERE id = ?1").bind(userId).first();
  if (!row) return null;
  const memberships = await db.prepare("SELECT league_id FROM league_memberships WHERE user_id = ?1")
    .bind(userId)
    .all();
  return {
    ...normalizeUser(row),
    leagueIds: (memberships.results || []).map((entry) => entry.league_id),
  };
}

async function getLeagueNamesByIds(db, leagueIds) {
  if (!leagueIds.length) return [];
  const placeholders = leagueIds.map((_, index) => `?${index + 1}`).join(", ");
  const result = await db.prepare(
    `SELECT name FROM leagues WHERE id IN (${placeholders}) ORDER BY name ASC`,
  ).bind(...leagueIds).all();
  return (result.results || []).map((row) => row.name).filter(Boolean);
}

async function validateLeagueIdsForOrganization(db, organizationId, leagueIds) {
  if (!leagueIds.length) return;
  const placeholders = leagueIds.map((_, index) => `?${index + 2}`).join(", ");
  const result = await db.prepare(
    `SELECT id FROM leagues WHERE organization_id = ?1 AND id IN (${placeholders})`,
  )
    .bind(organizationId, ...leagueIds)
    .all();
  const found = new Set((result.results || []).map((row) => row.id));
  const missing = leagueIds.filter((id) => !found.has(id));
  if (missing.length) throw httpError("Una o más ligas seleccionadas no pertenecen a este admin.", 400);
}

async function getCompetitions(env) {
  if (env.APP_CACHE) {
    const cached = await cacheGetJson(env.APP_CACHE, "competitions:index");
    if (cached) return cached;
  }
  if (!env.FOOTBALL_DATA_API_TOKEN) return FALLBACK_COMPETITIONS;
  const response = await fetch(`${API_BASE}/competitions`, {
    headers: { "X-Auth-Token": env.FOOTBALL_DATA_API_TOKEN },
  });
  const payload = await safeJson(response);
  if (!response.ok) return FALLBACK_COMPETITIONS;
  const competitions = Array.isArray(payload?.competitions) ? payload.competitions : [];
  const mapByCode = new Map(
    competitions
      .filter((competition) => competition?.code)
      .map((competition) => [String(competition.code).toUpperCase(), competition]),
  );
  const preferred = PREFERRED_COMPETITION_CODES
    .filter((code) => mapByCode.has(code))
    .map((code) => {
      const competition = mapByCode.get(code);
      return { id: competition.id, code, name: competition.name || competition.code };
    });
  const result = preferred.length
    ? preferred
    : competitions
        .filter((competition) => competition?.code)
        .map((competition) => ({
          id: competition.id,
          code: String(competition.code).toUpperCase(),
          name: competition.name || competition.code,
        }))
        .slice(0, 40);
  if (env.APP_CACHE) {
    await cachePutJson(env.APP_CACHE, "competitions:index", result, COMPETITIONS_CACHE_TTL_SECONDS);
  }
  return result;
}

async function fetchCompetitionResource(token, candidateKeys, resource, season, allowEmpty = false) {
  let lastError = null;
  for (const key of candidateKeys) {
    const withSeason = await fetch(`${API_BASE}/competitions/${key}/${resource}?season=${season}`, {
      headers: { "X-Auth-Token": token },
    });
    const payload = await safeJson(withSeason);
    if (withSeason.ok) return payload;

    if (withSeason.status === 404) {
      const fallback = await fetch(`${API_BASE}/competitions/${key}/${resource}`, {
        headers: { "X-Auth-Token": token },
      });
      const fallbackPayload = await safeJson(fallback);
      if (fallback.ok) return fallbackPayload;
      lastError = fallbackPayload;
      continue;
    }

    lastError = payload;
  }

  if (allowEmpty) return { [resource]: [] };
  throw httpError(lastError?.message || lastError?.error || `No se pudo cargar ${resource}.`, 502);
}

function normalizeMatch(raw, leagueId, competitionCode, competitionName, season, syncedAt) {
  if (!raw?.id || !raw?.utcDate) return null;
  return {
    id: buildSharedMatchId(competitionCode, season, raw.id),
    leagueId,
    sourceMatchId: Number(raw.id),
    competitionCode,
    competitionName: raw.competition?.name || competitionName || competitionCode,
    season: Number(season),
    utcDate: raw.utcDate,
    stage: translateStage(raw.stage || raw.group || ""),
    status: raw.status || "SCHEDULED",
    homeTeam: raw.homeTeam?.name || "Local",
    awayTeam: raw.awayTeam?.name || "Visitante",
    scoreHome: toNullableNumber(raw.score?.fullTime?.home ?? raw.score?.fullTime?.homeTeam),
    scoreAway: toNullableNumber(raw.score?.fullTime?.away ?? raw.score?.fullTime?.awayTeam),
    matchday: toNullableNumber(raw.matchday),
    lastSyncedAt: syncedAt,
  };
}

function normalizeStandings(standings, competitionCode, competitionName, season, syncedAt) {
  return standings
    .map((entry) => {
      const rows = Array.isArray(entry?.table)
        ? entry.table.map((row) => ({
            position: row.position ?? "-",
            team: row.team?.shortName || row.team?.tla || row.team?.name || "Equipo",
            playedGames: row.playedGames ?? 0,
            won: row.won ?? 0,
            draw: row.draw ?? 0,
            lost: row.lost ?? 0,
            goalsFor: row.goalsFor ?? 0,
            goalsAgainst: row.goalsAgainst ?? 0,
            goalDifference: row.goalDifference ?? 0,
            points: row.points ?? 0,
          }))
        : [];
      if (!rows.length) return null;
      const label = [translateStage(entry.group), translateStage(entry.stage), translateStandingType(entry.type)]
        .filter(Boolean)
        .filter((value, index, array) => array.indexOf(value) === index)
        .join(" · ");
      return {
        competitionCode,
        competitionName,
        season: Number(season),
        label: label || "Tabla general",
        rows,
        lastSyncedAt: syncedAt,
      };
    })
    .filter(Boolean);
}

function buildLeaderboard(members, matches, predictions, league) {
  const matchesById = new Map(matches.map((match) => [match.id, match]));
  return members
    .map((member) => {
      const ownPredictions = predictions.filter((prediction) => prediction.userId === member.id);
      let points = 0;
      let exactHits = 0;
      let trendHits = 0;
      ownPredictions.forEach((prediction) => {
        const match = matchesById.get(prediction.matchId);
        if (!match) return;
        const score = pointsForPrediction(prediction, match, league);
        points += score;
        if (score === league.exactPoints) exactHits += 1;
        if (score === league.outcomePoints) trendHits += 1;
      });
      return {
        userId: member.id,
        displayName: member.displayName,
        predictionsCount: ownPredictions.length,
        exactHits,
        trendHits,
        points,
      };
    })
    .sort(
      (left, right) =>
        right.points - left.points ||
        right.exactHits - left.exactHits ||
        right.trendHits - left.trendHits ||
        left.displayName.localeCompare(right.displayName),
    );
}

function pointsForPrediction(prediction, match, league) {
  if (!isFinished(match)) return 0;
  if (match.scoreHome == null || match.scoreAway == null) return 0;
  if (prediction.homeGoals === match.scoreHome && prediction.awayGoals === match.scoreAway) {
    return league.exactPoints;
  }
  return Math.sign(prediction.homeGoals - prediction.awayGoals) === Math.sign(match.scoreHome - match.scoreAway)
    ? league.outcomePoints
    : 0;
}

function decorateMatch(match, league) {
  const lockedAt = new Date(new Date(match.utcDate).getTime() - league.lockMinutes * 60_000).toISOString();
  return {
    ...match,
    isFinished: isFinished(match),
    canPredict: canPredict(match, league),
    lockedAt,
  };
}

function canPredict(match, league) {
  if (!OPEN_PREDICTION_STATUSES.has(String(match.status || "").toUpperCase())) return false;
  const lockTime = new Date(match.utc_date || match.utcDate).getTime() - league.lockMinutes * 60_000;
  return Date.now() < lockTime;
}

function isFinished(match) {
  return String(match.status || "").toUpperCase() === "FINISHED";
}

function parseCookies(value) {
  return Object.fromEntries(
    value
      .split(";")
      .map((chunk) => chunk.trim())
      .filter(Boolean)
      .map((chunk) => {
        const [name, ...rest] = chunk.split("=");
        return [name, decodeURIComponent(rest.join("="))];
      }),
  );
}

function buildSessionCookie(token, isSecure) {
  return `${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; ${isSecure ? "Secure; " : ""}SameSite=Lax; Max-Age=${SESSION_TTL_SECONDS}`;
}

function buildExpiredCookie(isSecure) {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; ${isSecure ? "Secure; " : ""}SameSite=Lax; Max-Age=0`;
}

function appendCookie(headersInit, cookieValue) {
  const headers = new Headers(headersInit || {});
  headers.append("Set-Cookie", cookieValue);
  return headers;
}

function shouldUseSecureCookie(url) {
  const hostname = String(url.hostname || "").trim().toLowerCase();
  if (!hostname) return url.protocol === "https:";
  if (
    hostname === "localhost" ||
    hostname === "0.0.0.0" ||
    hostname === "127.0.0.1" ||
    hostname.startsWith("192.168.") ||
    hostname.startsWith("10.") ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname)
  ) {
    return false;
  }
  return url.protocol === "https:";
}

async function hashPassword(password) {
  const saltBytes = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: saltBytes, iterations: PASSWORD_ITERATIONS, hash: "SHA-256" },
    key,
    PASSWORD_KEY_LENGTH,
  );
  return { salt: bytesToHex(saltBytes), hash: bytesToHex(new Uint8Array(bits)) };
}

async function verifyPassword(password, saltHex, expectedHashHex) {
  const key = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: hexToBytes(saltHex), iterations: PASSWORD_ITERATIONS, hash: "SHA-256" },
    key,
    PASSWORD_KEY_LENGTH,
  );
  return constantTimeEqual(new Uint8Array(bits), hexToBytes(expectedHashHex));
}

function constantTimeEqual(left, right) {
  if (left.length !== right.length) return false;
  let result = 0;
  for (let index = 0; index < left.length; index += 1) {
    result |= left[index] ^ right[index];
  }
  return result === 0;
}

function bytesToHex(bytes) {
  return [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function hexToBytes(hex) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let index = 0; index < bytes.length; index += 1) {
    bytes[index] = Number.parseInt(hex.slice(index * 2, index * 2 + 2), 16);
  }
  return bytes;
}

function sanitizeViewer(user) {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    role: user.role,
    isActive: user.isActive,
    organizationId: user.organizationId,
    mustChangePassword: Boolean(user.mustChangePassword),
  };
}

function normalizeUser(row) {
  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name,
    role: row.role,
    isActive: Number(row.is_active) === 1,
    organizationId: row.organization_id || null,
    mustChangePassword: Number(row.must_change_password || 0) === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function normalizeLeague(row) {
  return {
    id: row.id,
    organizationId: row.organization_id || null,
    name: row.name,
    slug: row.slug,
    competitionCode: row.competition_code,
    competitionId: normalizeCompetitionId(row.competition_id),
    competitionName: row.competition_name || row.competition_code,
    season: Number(row.season),
    exactPoints: Number(row.exact_points),
    outcomePoints: Number(row.outcome_points),
    lockMinutes: Number(row.lock_minutes),
    lastSyncAt: row.last_sync_at || null,
    isActive: Number(row.is_active) === 1,
  };
}

function normalizeOrganization(row) {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    isActive: Number(row.is_active) === 1,
    adminCount: Number(row.admin_count || 0),
    userCount: Number(row.user_count || 0),
    leagueCount: Number(row.league_count || 0),
  };
}

function validateLeaguePayload(payload) {
  return {
    name: normalizeRequiredString(payload?.name, "El nombre de la liga es obligatorio."),
    competitionCode: normalizeCompetitionCode(payload?.competitionCode),
    competitionId: normalizeCompetitionId(payload?.competitionId),
    competitionName: String(payload?.competitionName || "").trim(),
    season: normalizeSeason(payload?.season),
    exactPoints: normalizePositiveInteger(payload?.exactPoints, "Los puntos exactos son obligatorios."),
    outcomePoints: normalizeNonNegativeInteger(payload?.outcomePoints, "Los puntos por tendencia son obligatorios."),
    lockMinutes: normalizeNonNegativeInteger(payload?.lockMinutes, "Los minutos de cierre son obligatorios."),
    isActive: payload?.isActive == null ? true : Boolean(payload.isActive),
  };
}

function validatePartialLeaguePayload(payload) {
  const next = {};
  if (payload?.name != null) next.name = normalizeRequiredString(payload.name, "Nombre inválido.");
  if (payload?.competitionCode != null) next.competitionCode = normalizeCompetitionCode(payload.competitionCode);
  if (payload?.competitionId !== undefined) next.competitionId = normalizeCompetitionId(payload.competitionId);
  if (payload?.competitionName != null) next.competitionName = String(payload.competitionName || "").trim();
  if (payload?.season != null) next.season = normalizeSeason(payload.season);
  if (payload?.exactPoints != null) next.exactPoints = normalizePositiveInteger(payload.exactPoints, "Puntos inválidos.");
  if (payload?.outcomePoints != null) {
    next.outcomePoints = normalizeNonNegativeInteger(payload.outcomePoints, "Puntos inválidos.");
  }
  if (payload?.lockMinutes != null) {
    next.lockMinutes = normalizeNonNegativeInteger(payload.lockMinutes, "Minutos inválidos.");
  }
  if (payload?.isActive != null) next.isActive = Boolean(payload.isActive);
  return next;
}

function normalizeEmail(value) {
  const email = String(value || "").trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw httpError("Correo inválido.", 400);
  return email;
}

function normalizeRole(value) {
  const role = String(value || "").trim().toLowerCase();
  if (!["superadmin", "admin", "user"].includes(role)) throw httpError("Rol inválido.", 400);
  return role;
}

function normalizeRequiredString(value, message) {
  const result = String(value || "").trim();
  if (!result) throw httpError(message, 400);
  return result;
}

function validatePassword(password) {
  if (!password || password.length < 8) {
    throw httpError("La contraseña debe tener al menos 8 caracteres.", 400);
  }
}

function normalizeCompetitionCode(value) {
  const code = String(value || "").trim().toUpperCase();
  if (!code || !/^[A-Z0-9]{2,10}$/.test(code)) throw httpError("Código de competición inválido.", 400);
  return code;
}

function normalizeCompetitionId(value) {
  const numeric = Number(value);
  return Number.isInteger(numeric) && numeric > 0 ? numeric : null;
}

function normalizeSeason(value) {
  const numeric = Number(value);
  if (!Number.isInteger(numeric) || numeric < 2000 || numeric > 2100) throw httpError("Temporada inválida.", 400);
  return numeric;
}

function normalizePositiveInteger(value, message) {
  const numeric = Number(value);
  if (!Number.isInteger(numeric) || numeric < 1) throw httpError(message, 400);
  return numeric;
}

function normalizeNonNegativeInteger(value, message) {
  const numeric = Number(value);
  if (!Number.isInteger(numeric) || numeric < 0) throw httpError(message, 400);
  return numeric;
}

function toNullableNumber(value) {
  return typeof value === "number" ? value : value == null ? null : Number(value);
}

function translateStage(value) {
  const raw = String(value || "").trim();
  if (!raw) return "Sin fase";
  const normalized = raw.toLowerCase();
  const phraseMap = {
    "group stage": "Fase de grupos",
    "league phase": "League Phase",
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
  if (phraseMap[normalized]) return phraseMap[normalized];
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
  if (groupMatch) return `Grupo ${groupMatch[1]}`;
  const matchdayMatch = key.match(/^MATCHDAY_(\d+)$/);
  if (matchdayMatch) return `Jornada ${matchdayMatch[1]}`;
  return raw.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
}

function translateStandingType(value) {
  const key = String(value || "").toUpperCase();
  return { TOTAL: "General", HOME: "Local", AWAY: "Visitante" }[key] || "";
}

function slugify(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function buildPredictionId(userId, matchId) {
  return `prediction:${userId}:${matchId}`;
}

function buildLeaguePredictionId(userId, leagueId, matchId) {
  return `prediction:${userId}:${leagueId}:${matchId}`;
}

function buildSharedMatchId(competitionCode, season, sourceMatchId) {
  return `match:${competitionCode}:${Number(season)}:${Number(sourceMatchId)}`;
}

async function generateUniqueOrganizationSlug(db, name) {
  const base = slugify(name) || "organizacion";
  let slug = base;
  let counter = 2;
  while (await db.prepare("SELECT id FROM organizations WHERE slug = ?1").bind(slug).first()) {
    slug = `${base}-${counter}`;
    counter += 1;
  }
  return slug;
}

async function generateUniqueLeagueSlug(db, organizationId, name) {
  const base = slugify(name) || "liga";
  let slug = base;
  let counter = 2;
  while (await db.prepare("SELECT id FROM leagues WHERE organization_id = ?1 AND slug = ?2").bind(organizationId, slug).first()) {
    slug = `${base}-${counter}`;
    counter += 1;
  }
  return slug;
}

function requireRole(user, roles) {
  if (!user || !roles.includes(user.role)) throw httpError("No autorizado.", 403);
}

function generateTemporaryPassword() {
  return `Tmp${Math.random().toString(36).slice(-4)}${Math.random().toString(36).slice(-4).toUpperCase()}9!`;
}

async function readJson(request) {
  try {
    return await request.json();
  } catch {
    throw httpError("JSON inválido.", 400);
  }
}

async function safeJson(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function safeParseJson(value, fallback) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

async function executeBatches(db, statements, chunkSize = 40) {
  for (let index = 0; index < statements.length; index += chunkSize) {
    const chunk = statements.slice(index, index + chunkSize);
    if (chunk.length) await db.batch(chunk);
  }
}

function parseUserImportCsv(csvText) {
  const matrix = parseCsvMatrix(csvText);
  if (!matrix.length) return [];

  const [headerRow, ...dataRows] = matrix;
  const headers = headerRow.map((value) => normalizeLookupKey(value));
  const requiredHeaders = ["nombre", "email", "ligas"];
  requiredHeaders.forEach((header) => {
    if (!headers.includes(header)) {
      throw httpError(`La plantilla debe incluir la columna "${header}".`, 400);
    }
  });

  const rows = [];
  dataRows.forEach((row, index) => {
    const values = [...row];
    while (values.length < headers.length) values.push("");
    const isEmpty = values.every((value) => !String(value || "").trim());
    if (isEmpty) return;

    const entry = { __lineNumber: index + 2 };
    headers.forEach((header, columnIndex) => {
      entry[header] = String(values[columnIndex] || "").trim();
    });
    rows.push(entry);
  });
  return rows;
}

function parseCsvMatrix(csvText) {
  const source = String(csvText || "").replace(/^\uFEFF/, "");
  if (!source.trim()) return [];

  const rows = [];
  let row = [];
  let value = "";
  let inQuotes = false;

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    const next = source[index + 1];

    if (char === "\"") {
      if (inQuotes && next === "\"") {
        value += "\"";
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(value);
      value = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(value);
      rows.push(row);
      row = [];
      value = "";
      continue;
    }

    value += char;
  }

  row.push(value);
  rows.push(row);
  return rows;
}

function normalizeImportEmail(value) {
  try {
    return normalizeEmail(value);
  } catch {
    return "";
  }
}

function splitImportLeagues(value) {
  return String(value || "")
    .split(/[|;,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseImportActiveFlag(value) {
  const normalized = normalizeLookupKey(value);
  if (!normalized) return true;
  if (["si", "sí", "s", "true", "1", "activo", "activa", "yes"].includes(normalized)) return true;
  if (["no", "n", "false", "0", "inactivo", "inactiva"].includes(normalized)) return false;
  return true;
}

async function getExistingEmails(db, emails) {
  const uniqueEmails = [...new Set(emails.filter(Boolean))];
  if (!uniqueEmails.length) return new Set();

  const existingEmails = new Set();
  const chunkSize = 200;

  for (let index = 0; index < uniqueEmails.length; index += chunkSize) {
    const chunk = uniqueEmails.slice(index, index + chunkSize);
    const placeholders = chunk.map((_, chunkIndex) => `?${chunkIndex + 1}`).join(", ");
    const statement = db.prepare(
      `SELECT email_normalized FROM users WHERE email_normalized IN (${placeholders})`,
    ).bind(...chunk);
    const result = await statement.all();
    (result.results || []).forEach((row) => existingEmails.add(row.email_normalized));
  }

  return existingEmails;
}

function buildUserImportReportCsv(rows) {
  const lines = [[
    "fila",
    "estado",
    "nombre",
    "correo",
    "ligas",
    "detalle",
    "contrasena_temporal",
  ]];

  rows.forEach((row) => {
    lines.push([
      row.lineNumber,
      row.finalStatus || row.status || "",
      row.displayName || "",
      row.email || "",
      Array.isArray(row.leagues) ? row.leagues.join(" | ") : "",
      Array.isArray(row.messages) ? row.messages.join(" | ") : "",
      row.temporaryPassword || "",
    ]);
  });

  return lines
    .map((line) => line.map((value) => escapeCsvValue(value)).join(","))
    .join("\n");
}

function escapeCsvValue(value) {
  const text = String(value ?? "");
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, "\"\"")}"`;
  }
  return text;
}

function getLeagueVersionKey(leagueId) {
  return `version:league:${leagueId}`;
}

async function getCacheVersion(env, key) {
  if (!env.APP_CACHE) return "0";
  return (await env.APP_CACHE.get(key)) || "0";
}

async function bumpCacheVersion(env, key) {
  if (!env.APP_CACHE) return;
  await env.APP_CACHE.put(key, String(Date.now()));
}

async function bumpGlobalCacheVersion(env) {
  await bumpCacheVersion(env, GLOBAL_CACHE_VERSION_KEY);
}

async function bumpLeagueCacheVersion(env, leagueId) {
  if (!leagueId) return;
  await bumpCacheVersion(env, getLeagueVersionKey(leagueId));
}

async function cacheGetJson(cache, key) {
  const value = await cache.get(key, "text");
  if (!value) return null;
  return safeParseJson(value, null);
}

async function cachePutJson(cache, key, body, ttlSeconds) {
  await cache.put(key, JSON.stringify(body), { expirationTtl: ttlSeconds });
}

function textResponse(body, status = 200, headersInit) {
  const headers = new Headers(headersInit || {});
  if (!headers.has("content-type")) {
    headers.set("content-type", "text/plain; charset=utf-8");
  }
  if (!headers.has("cache-control")) {
    headers.set("cache-control", "no-store");
  }
  return new Response(String(body), { status, headers });
}

function jsonResponse(body, status = 200, headersInit) {
  const headers = new Headers(headersInit || {});
  headers.set("content-type", "application/json; charset=utf-8");
  if (!headers.has("cache-control")) {
    headers.set("cache-control", "no-store");
  }
  return new Response(JSON.stringify(body), { status, headers });
}

function errorResponse(message, status = 500) {
  return jsonResponse({ error: "request_failed", message }, status);
}

function httpError(message, status = 400) {
  const error = new Error(message);
  error.status = status;
  return error;
}

const encoder = new TextEncoder();
