import http from "k6/http";
import { check, group } from "k6";
import { Counter, Rate, Trend } from "k6/metrics";
import exec from "k6/execution";
import { SharedArray } from "k6/data";

const BASE_URL = (__ENV.BASE_URL || "http://localhost:8787").replace(/\/$/, "");
const USERS_FILE = __ENV.USERS_FILE || "./users.sample.json";
const VUS = Number(__ENV.VUS || 200);
const LEAGUE_ID = __ENV.LEAGUE_ID || "";
const MATCH_ID = __ENV.MATCH_ID || "";

const users = new SharedArray("users", () => JSON.parse(open(USERS_FILE)));
const ITERATIONS = Number(__ENV.ITERATIONS || users.length);

const failedPredictions = new Counter("failed_predictions");
const successfulPredictions = new Counter("successful_predictions");
const predictionStatus201 = new Counter("prediction_status_201");
const predictionStatus202 = new Counter("prediction_status_202");
const predictionStatus500 = new Counter("prediction_status_500");
const predictionStatusOther = new Counter("prediction_status_other");
const predictionOk = new Rate("prediction_ok");
const predictionTrend = new Trend("prediction_duration");

export const options = {
  scenarios: {
    prediction_once: {
      executor: "shared-iterations",
      vus: VUS,
      iterations: ITERATIONS,
      maxDuration: "5m",
    },
  },
  thresholds: {
    http_req_failed: ["rate<0.02"],
    http_req_duration: ["p(95)<3000", "p(99)<6000"],
    prediction_duration: ["p(95)<3000", "p(99)<6000"],
    prediction_ok: ["rate>0.98"],
  },
};

function pickUser() {
  if (!users.length) {
    throw new Error("USERS_FILE no contiene usuarios.");
  }
  return users[exec.scenario.iterationInTest % users.length];
}

function jsonHeaders() {
  return { headers: { "content-type": "application/json" } };
}

function randomGoals() {
  return Math.floor(Math.random() * 5);
}

function findTargetMatch(league) {
  if (!league) return null;
  if (MATCH_ID) {
    return (league.matches || []).find((match) => match.id === MATCH_ID) || { id: MATCH_ID };
  }
  return (league.matches || []).find((match) => match.canPredict) || null;
}

function countPredictionStatus(status) {
  if (status === 201) {
    predictionStatus201.add(1);
    return;
  }
  if (status === 202) {
    predictionStatus202.add(1);
    return;
  }
  if (status === 500) {
    predictionStatus500.add(1);
    return;
  }
  predictionStatusOther.add(1);
}

export default function () {
  const user = pickUser();
  let ok = true;
  let league = null;

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
    ok = loginOk && ok;
  });

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
}
