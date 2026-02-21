const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");

const HOST = "127.0.0.1";
const PORT = process.env.PORT || 3000;
const ROOT = __dirname;

// Configuracion privada del backend (no visible en el frontend)
// Recomendado: export FOOTBALL_DATA_API_TOKEN="tu_token"
const API_TOKEN = process.env.FOOTBALL_DATA_API_TOKEN || "";
const API_BASE = "https://api.football-data.org/v4";

const PREFERRED_COMPETITION_CODES = ["WC", "CL", "PL", "PD", "BL1", "SA", "FL1", "PPL", "DED", "ELC"];
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

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".ico": "image/x-icon",
};

const server = http.createServer(async (req, res) => {
  try {
    const reqUrl = new URL(req.url, `http://${req.headers.host}`);

    if (reqUrl.pathname === "/api/competitions") {
      await handleCompetitions(req, res);
      return;
    }

    if (reqUrl.pathname === "/api/matches") {
      await handleMatches(req, res, reqUrl);
      return;
    }

    if (reqUrl.pathname === "/api/standings") {
      await handleStandings(req, res, reqUrl);
      return;
    }

    serveStatic(reqUrl.pathname, res);
  } catch (error) {
    respondJson(res, 500, { error: "internal_error", message: error.message });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Servidor listo en http://${HOST}:${PORT}`);
  if (!API_TOKEN) {
    console.warn("[WARN] FOOTBALL_DATA_API_TOKEN no esta definido. La sincronizacion fallara.");
  }
});

async function handleCompetitions(req, res) {
  if (req.method !== "GET") {
    respondJson(res, 405, { error: "method_not_allowed" });
    return;
  }

  if (!API_TOKEN) {
    respondJson(res, 200, { competitions: FALLBACK_COMPETITIONS });
    return;
  }

  const response = await fetch(`${API_BASE}/competitions`, {
    headers: { "X-Auth-Token": API_TOKEN },
  });
  const payload = await safeJson(response);

  if (!response.ok) {
    const message = payload?.message || payload?.error || "No se pudieron cargar competiciones";
    respondJson(res, response.status, { error: "upstream_error", message });
    return;
  }

  const upstreamCompetitions = Array.isArray(payload?.competitions) ? payload.competitions : [];
  const mapByCode = new Map(
    upstreamCompetitions
      .filter((c) => c?.code)
      .map((c) => [String(c.code).toUpperCase(), c]),
  );

  const preferred = PREFERRED_COMPETITION_CODES
    .filter((code) => mapByCode.has(code))
    .map((code) => {
      const c = mapByCode.get(code);
      return { id: c.id, code, name: c.name || c.code };
    });

  const competitions = preferred.length
    ? preferred
    : upstreamCompetitions
        .filter((c) => c?.code)
        .map((c) => ({ id: c.id, code: String(c.code).toUpperCase(), name: c.name || c.code }))
        .slice(0, 30);

  respondJson(res, 200, { competitions });
}

async function handleMatches(req, res, reqUrl) {
  if (req.method !== "GET") {
    respondJson(res, 405, { error: "method_not_allowed" });
    return;
  }

  if (!API_TOKEN) {
    respondJson(res, 500, {
      error: "missing_backend_token",
      message: "Falta FOOTBALL_DATA_API_TOKEN en el backend.",
    });
    return;
  }

  const competition = (reqUrl.searchParams.get("competition") || "").trim();
  const season = reqUrl.searchParams.get("season");

  if (!season || !/^\d{4}$/.test(season)) {
    respondJson(res, 400, { error: "invalid_season", message: "Temporada inválida." });
    return;
  }

  if (!competition || !/^[A-Za-z0-9]{2,10}$/.test(competition)) {
    respondJson(res, 400, {
      error: "invalid_competition",
      message: "Código de competición inválido.",
    });
    return;
  }

  const normalized = competition.toUpperCase();
  const candidateCompetitionKeys = await resolveCompetitionCandidates(normalized);

  let lastPayload = null;
  let seasonFallbackTried = false;

  for (const key of candidateCompetitionKeys) {
    const upstream = `${API_BASE}/competitions/${key}/matches?season=${season}`;

    const upstreamRes = await fetch(upstream, {
      headers: {
        "X-Auth-Token": API_TOKEN,
      },
    });

    const payload = await safeJson(upstreamRes);
    const apiVersion = "v4";

    if (upstreamRes.ok) {
      respondJson(res, 200, {
        apiVersion,
        competition: key,
        matches: Array.isArray(payload?.matches) ? payload.matches : [],
      });
      return;
    }

    if (upstreamRes.status === 404) {
      seasonFallbackTried = true;
      const fallbackUpstream = `${API_BASE}/competitions/${key}/matches`;
      const fallbackRes = await fetch(fallbackUpstream, {
        headers: {
          "X-Auth-Token": API_TOKEN,
        },
      });
      const fallbackPayload = await safeJson(fallbackRes);
      if (fallbackRes.ok) {
        respondJson(res, 200, {
          apiVersion,
          competition: key,
          seasonFallback: true,
          matches: Array.isArray(fallbackPayload?.matches) ? fallbackPayload.matches : [],
        });
        return;
      }
    }

    lastPayload = {
      status: upstreamRes.status,
      body: payload,
      apiVersion,
      triedKey: key,
    };
  }

  const message =
    (lastPayload?.status === 404 && seasonFallbackTried
      ? `No hay datos para la temporada ${season} en ${normalized}. Prueba otra temporada o competición.`
      : null) ||
    (lastPayload?.status === 404
      ? `La competición ${normalized} no existe o no está disponible para tu token en v4.`
      : null) ||
    lastPayload?.body?.message ||
    lastPayload?.body?.error ||
    "No se pudo consultar football-data";

  respondJson(res, lastPayload?.status || 502, {
    error: "upstream_error",
    message,
    apiVersion: lastPayload?.apiVersion || "unknown",
    competition: lastPayload?.triedKey || normalized,
  });
}

async function handleStandings(req, res, reqUrl) {
  if (req.method !== "GET") {
    respondJson(res, 405, { error: "method_not_allowed" });
    return;
  }

  if (!API_TOKEN) {
    respondJson(res, 500, {
      error: "missing_backend_token",
      message: "Falta FOOTBALL_DATA_API_TOKEN en el backend.",
    });
    return;
  }

  const competition = (reqUrl.searchParams.get("competition") || "").trim();
  const season = reqUrl.searchParams.get("season");

  if (!season || !/^\d{4}$/.test(season)) {
    respondJson(res, 400, { error: "invalid_season", message: "Temporada inválida." });
    return;
  }

  if (!competition || !/^[A-Za-z0-9]{2,10}$/.test(competition)) {
    respondJson(res, 400, {
      error: "invalid_competition",
      message: "Código de competición inválido.",
    });
    return;
  }

  const normalized = competition.toUpperCase();
  const candidateCompetitionKeys = await resolveCompetitionCandidates(normalized);

  let lastPayload = null;
  let seasonFallbackTried = false;

  for (const key of candidateCompetitionKeys) {
    const upstream = `${API_BASE}/competitions/${key}/standings?season=${season}`;
    const upstreamRes = await fetch(upstream, {
      headers: {
        "X-Auth-Token": API_TOKEN,
      },
    });
    const payload = await safeJson(upstreamRes);

    if (upstreamRes.ok) {
      respondJson(res, 200, {
        apiVersion: "v4",
        competition: key,
        standings: Array.isArray(payload?.standings) ? payload.standings : [],
      });
      return;
    }

    if (upstreamRes.status === 404) {
      seasonFallbackTried = true;
      const fallbackUpstream = `${API_BASE}/competitions/${key}/standings`;
      const fallbackRes = await fetch(fallbackUpstream, {
        headers: {
          "X-Auth-Token": API_TOKEN,
        },
      });
      const fallbackPayload = await safeJson(fallbackRes);
      if (fallbackRes.ok) {
        respondJson(res, 200, {
          apiVersion: "v4",
          competition: key,
          seasonFallback: true,
          standings: Array.isArray(fallbackPayload?.standings) ? fallbackPayload.standings : [],
        });
        return;
      }
    }

    lastPayload = {
      status: upstreamRes.status,
      body: payload,
      apiVersion: "v4",
      triedKey: key,
    };
  }

  const message =
    (lastPayload?.status === 404 && seasonFallbackTried
      ? `No hay tabla para la temporada ${season} en ${normalized}.`
      : null) ||
    (lastPayload?.status === 404
      ? `La competición ${normalized} no existe o no está disponible para tu token en v4.`
      : null) ||
    lastPayload?.body?.message ||
    lastPayload?.body?.error ||
    "No se pudo consultar tabla de posiciones";

  respondJson(res, lastPayload?.status || 502, {
    error: "upstream_error",
    message,
    apiVersion: lastPayload?.apiVersion || "unknown",
    competition: lastPayload?.triedKey || normalized,
  });
}

async function resolveCompetitionCandidates(normalizedCompetition) {
  const candidates = [normalizedCompetition];
  if (!/^\d+$/.test(normalizedCompetition)) {
    const id = await resolveCompetitionIdByCode(normalizedCompetition);
    if (id) candidates.push(String(id));
  }
  return candidates;
}

async function resolveCompetitionIdByCode(code) {
  const response = await fetch(`${API_BASE}/competitions`, {
    headers: { "X-Auth-Token": API_TOKEN },
  });
  if (!response.ok) return null;
  const payload = await safeJson(response);
  const list = Array.isArray(payload?.competitions) ? payload.competitions : [];
  const found = list.find((c) => String(c?.code || "").toUpperCase() === code);
  return found?.id || null;
}

function serveStatic(pathname, res) {
  const clean = pathname === "/" ? "/index.html" : pathname;
  const filePath = path.join(ROOT, clean);

  if (!filePath.startsWith(ROOT)) {
    respondJson(res, 403, { error: "forbidden" });
    return;
  }

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === "ENOENT") {
        respondJson(res, 404, { error: "not_found" });
        return;
      }
      respondJson(res, 500, { error: "read_error" });
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
    res.end(content);
  });
}

function respondJson(res, status, body) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(body));
}

async function safeJson(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}
