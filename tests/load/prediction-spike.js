import http from "k6/http";
import { check, group, sleep } from "k6";
import { Counter, Rate, Trend } from "k6/metrics";
import exec from "k6/execution";
import { SharedArray } from "k6/data";

const BASE_URL = (__ENV.BASE_URL || "http://localhost:8787").replace(/\/$/, "");
const USERS_FILE = __ENV.USERS_FILE || "./users.sample.json";
const VUS = Number(__ENV.VUS || 100);
const DURATION = __ENV.DURATION || "1m";
const LEAGUE_ID = __ENV.LEAGUE_ID || "";
const MATCH_ID = __ENV.MATCH_ID || "";
const THINK_SECONDS = Number(__ENV.THINK_SECONDS || 0.2);

const users = new SharedArray("users", () => JSON.parse(open(USERS_FILE)));
const failedLogins = new Counter("failed_logins");
const failedPredictions = new Counter("failed_predictions");
const predictionStatus200 = new Counter("prediction_status_200");
const predictionStatus201 = new Counter("prediction_status_201");
const predictionStatus202 = new Counter("prediction_status_202");
const predictionStatus400 = new Counter("prediction_status_400");
const predictionStatus401 = new Counter("prediction_status_401");
const predictionStatus403 = new Counter("prediction_status_403");
const predictionStatus404 = new Counter("prediction_status_404");
const predictionStatus409 = new Counter("prediction_status_409");
const predictionStatus429 = new Counter("prediction_status_429");
const predictionStatus500 = new Counter("prediction_status_500");
const predictionStatusOther = new Counter("prediction_status_other");
const successfulPredictions = new Counter("successful_predictions");
const predictionOk = new Rate("prediction_ok");
const predictionTrend = new Trend("prediction_duration");

export const options = {
  scenarios: {
    prediction_spike: {
      executor: "constant-vus",
      vus: VUS,
      duration: DURATION,
    },
  },
  thresholds: {
    http_req_failed: ["rate<0.02"],
    http_req_duration: ["p(95)<2500", "p(99)<5000"],
    prediction_duration: ["p(95)<2500", "p(99)<5000"],
    prediction_ok: ["rate>0.98"],
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

function randomGoals() {
  return Math.floor(Math.random() * 5);
}

function countPredictionStatus(status) {
  switch (status) {
    case 200:
      predictionStatus200.add(1);
      break;
    case 201:
      predictionStatus201.add(1);
      break;
    case 202:
      predictionStatus202.add(1);
      break;
    case 400:
      predictionStatus400.add(1);
      break;
    case 401:
      predictionStatus401.add(1);
      break;
    case 403:
      predictionStatus403.add(1);
      break;
    case 404:
      predictionStatus404.add(1);
      break;
    case 409:
      predictionStatus409.add(1);
      break;
    case 429:
      predictionStatus429.add(1);
      break;
    case 500:
      predictionStatus500.add(1);
      break;
    default:
      predictionStatusOther.add(1);
  }
}

function findTargetMatch(league) {
  if (!league) return null;
  if (MATCH_ID) {
    return (league.matches || []).find((match) => match.id === MATCH_ID) || { id: MATCH_ID };
  }
  return (league.matches || []).find((match) => match.canPredict) || null;
}

export default function () {
  const user = pickUser();
  let ok = true;

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

  let league = null;
  group("bootstrap", () => {
    const query = LEAGUE_ID ? `?leagueId=${encodeURIComponent(LEAGUE_ID)}` : "";
    const response = http.get(`${BASE_URL}/api/bootstrap${query}`);
    const bootstrapOk = check(response, {
      "bootstrap 200": (res) => res.status === 200,
      "has current league": (res) => Boolean(res.json("currentLeague.id")),
    });
    if (bootstrapOk) {
      league = response.json("currentLeague");
    }
    ok = bootstrapOk && ok;
  });

  const match = findTargetMatch(league);
  if (!match?.id) {
    failedPredictions.add(1);
    predictionOk.add(false);
    return;
  }

  group("save-prediction", () => {
    const payload = {
      leagueId: league.id,
      matchId: match.id,
      homeGoals: randomGoals(),
      awayGoals: randomGoals(),
    };
    const response = http.post(`${BASE_URL}/api/league/predictions`, JSON.stringify(payload), jsonHeaders());
    countPredictionStatus(response.status);
    predictionTrend.add(response.timings.duration);
    const saveOk = check(response, {
      "prediction accepted": (res) => res.status === 201 || res.status === 202,
      "prediction has id": (res) => Boolean(res.json("prediction.id")),
    });
    if (saveOk) successfulPredictions.add(1);
    if (!saveOk) failedPredictions.add(1);
    ok = saveOk && ok;
  });

  predictionOk.add(ok);
  sleep(THINK_SECONDS);
}
