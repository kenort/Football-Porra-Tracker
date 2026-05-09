import http from "k6/http";
import { check, group, sleep } from "k6";
import { Counter, Rate, Trend } from "k6/metrics";
import exec from "k6/execution";
import { SharedArray } from "k6/data";

const BASE_URL = (__ENV.BASE_URL || "http://localhost:8787").replace(/\/$/, "");
const USERS_FILE = __ENV.USERS_FILE || "./users.sample.json";
const VUS = Number(__ENV.VUS || 50);
const DURATION = __ENV.DURATION || "2m";
const THINK_MIN = Number(__ENV.THINK_MIN || 1);
const THINK_MAX = Number(__ENV.THINK_MAX || 4);

const users = new SharedArray("users", () => JSON.parse(open(USERS_FILE)));
const failedLogins = new Counter("failed_logins");
const failedBootstraps = new Counter("failed_bootstraps");
const failedTeamAssets = new Counter("failed_team_assets");
const successfulJourneys = new Counter("successful_journeys");
const journeyOk = new Rate("journey_ok");
const bootstrapTrend = new Trend("bootstrap_duration");

export const options = {
  scenarios: {
    browsing: {
      executor: "constant-vus",
      vus: VUS,
      duration: DURATION,
    },
  },
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<1500", "p(99)<3000"],
    bootstrap_duration: ["p(95)<1200", "p(99)<2500"],
    journey_ok: ["rate>0.99"],
  },
};

function pickUser() {
  if (!users.length) {
    throw new Error("USERS_FILE no contiene usuarios.");
  }
  return users[(exec.vu.idInTest - 1) % users.length];
}

function jsonHeaders() {
  return { headers: { "content-type": "application/json" } };
}

function randomThinkTime() {
  return THINK_MIN + Math.random() * Math.max(0, THINK_MAX - THINK_MIN);
}

export default function () {
  const user = pickUser();
  let ok = true;

  group("open-login", () => {
    const response = http.get(`${BASE_URL}/login`);
    ok = check(response, {
      "login page 200": (res) => res.status === 200,
    }) && ok;
  });

  group("login", () => {
    const response = http.post(
      `${BASE_URL}/api/auth/login`,
      JSON.stringify({ email: user.email, password: user.password }),
      jsonHeaders(),
    );
    const loginOk = check(response, {
      "login api 200": (res) => res.status === 200,
      "login authenticated": (res) => Boolean(res.json("user.id")),
    });
    if (!loginOk) failedLogins.add(1);
    ok = loginOk && ok;
  });

  let currentLeagueId = "";
  group("bootstrap", () => {
    const response = http.get(`${BASE_URL}/api/bootstrap`);
    bootstrapTrend.add(response.timings.duration);
    const bootstrapOk = check(response, {
      "bootstrap 200": (res) => res.status === 200,
      "bootstrap authenticated": (res) => res.json("authenticated") === true,
    });
    if (bootstrapOk) {
      currentLeagueId = response.json("currentLeague.id") || "";
    } else {
      failedBootstraps.add(1);
    }
    ok = bootstrapOk && ok;
  });

  if (currentLeagueId) {
    group("team-assets", () => {
      const response = http.get(`${BASE_URL}/api/leagues/${encodeURIComponent(currentLeagueId)}/team-assets`);
      const assetsOk = check(response, {
        "team assets 200": (res) => res.status === 200,
      });
      if (!assetsOk) failedTeamAssets.add(1);
      ok = assetsOk && ok;
    });

    group("refresh-current-league", () => {
      const response = http.get(`${BASE_URL}/api/bootstrap?leagueId=${encodeURIComponent(currentLeagueId)}`);
      const refreshOk = check(response, {
        "league bootstrap 200": (res) => res.status === 200,
        "league has matches array": (res) => Array.isArray(res.json("currentLeague.matches")),
      });
      ok = refreshOk && ok;
    });
  }

  journeyOk.add(ok);
  if (ok) successfulJourneys.add(1);
  sleep(randomThinkTime());
}
