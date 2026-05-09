# Informe tecnico de pruebas de carga y resiliencia

Proyecto: Football Porra Tracker

Fecha de elaboracion: 2026-05-02

Ambiente evaluado: Cloudflare Workers, D1, KV, R2 y Queues

URL evaluada: https://football-porra-tracker.kmilo-coder.workers.dev

Herramienta principal: k6 v1.7.1

## 1. Objetivo

El objetivo de esta evaluacion fue validar la estabilidad, fiabilidad y capacidad operativa de la aplicacion ante trafico concurrente, especialmente durante el momento critico esperado: usuarios ingresando masivamente cerca del cierre de apuestas y guardando predicciones para un partido.

El alcance de la certificacion tecnica cubre el escenario probado de hasta 1000 usuarios activos, con 200 usuarios virtuales concurrentes ejecutando login, carga inicial del dashboard y registro de una prediccion por usuario.

## 2. Alcance funcional probado

Se probaron los siguientes flujos:

- Inicio de sesion con usuarios sinteticos de prueba.
- Carga inicial del dashboard autenticado mediante `/api/bootstrap`.
- Carga de liga activa con partidos, reglas, tabla y predicciones propias.
- Guardado de porras mediante `/api/league/predictions`.
- Persistencia final en D1 de las porras aceptadas.
- Comportamiento bajo concurrencia antes y despues de activar Queue.
- Comportamiento del payload inicial antes y despues de diferir ranking y datos pesados.

No se incluyo en la prueba una validacion real de Cloudflare Waiting Room, porque Waiting Room se configura sobre una zona/hostname de Cloudflare y no directamente desde el codigo del Worker. Se dejo recomendacion tecnica documentada en `README.md`.

## 3. Datos de prueba usados

Se crearon usuarios sinteticos para carga:

- Organizacion de prueba: `e4773b05-e89a-41da-bf7e-252dbdb97da3`.
- Liga de prueba: `47a36de2-2fb1-4497-8b9c-61f2e436c27c`.
- Partido de prueba: `match:WC:2026:537327`.
- Usuarios generados: 1000.
- Archivo de usuarios: `tests/load/users.generated.json`.
- Password de usuarios de prueba: `LoadTest123!`.

Se confirmo en D1 que, al final de la prueba definitiva, existian 1000 predicciones persistidas para los usuarios de prueba en la liga evaluada.

## 4. Paquete de pruebas creado

Se implemento un paquete de pruebas en `tests/load/`:

- `tests/load/prepare-load-users.mjs`: genera usuarios sinteticos y SQL de carga.
- `tests/load/login-and-browse.js`: simula navegacion autenticada y carga de dashboard.
- `tests/load/prediction-spike.js`: simula usuarios guardando porras repetidamente durante una ventana de tiempo.
- `tests/load/prediction-once.js`: simula una avalancha realista donde muchos usuarios distintos guardan una sola porra.
- `tests/load/README.md`: documenta como ejecutar e interpretar las pruebas.

Tambien se agregaron scripts en `package.json`:

```bash
npm run load:prepare-users
npm run load:browse
npm run load:predictions
npm run load:predictions-once
```

## 5. Pruebas base antes de optimizaciones

### 5.1 Navegacion con 50 usuarios virtuales

Comando ejecutado:

```bash
BASE_URL=https://football-porra-tracker.kmilo-coder.workers.dev \
USERS_FILE=users.generated.json \
VUS=50 \
DURATION=2m \
k6 run tests/load/login-and-browse.js
```

Resultado:

- Iteraciones completadas: 1008.
- Requests HTTP: 5040.
- Fallos funcionales: 0.
- `http_req_duration` promedio: 718.59 ms.
- `http_req_duration` p95: 1622.06 ms.
- `bootstrap_duration` p95: 2057.69 ms.

Conclusion: la navegacion inicial no fallaba, pero el `bootstrap` ya mostraba latencia p95 superior al umbral objetivo de 1200 ms.

### 5.2 Navegacion con 100 usuarios virtuales

Comando ejecutado:

```bash
BASE_URL=https://football-porra-tracker.kmilo-coder.workers.dev \
USERS_FILE=users.generated.json \
VUS=100 \
DURATION=1m \
k6 run tests/load/login-and-browse.js
```

Resultado:

- Iteraciones completadas: 984.
- Requests HTTP: 4920.
- Fallos funcionales: 0.
- `http_req_duration` promedio: 761.14 ms.
- `http_req_duration` p95: 1436.69 ms.
- `bootstrap_duration` p95: 2954.12 ms.

Conclusion: la aplicacion mantenia disponibilidad en lectura, pero el `bootstrap` era un cuello de botella claro para picos.

## 6. Pruebas iniciales de escritura antes de Queue

### 6.1 Guardado de porras con 50 usuarios virtuales

Comando ejecutado:

```bash
BASE_URL=https://football-porra-tracker.kmilo-coder.workers.dev \
USERS_FILE=users.generated.json \
LEAGUE_ID=47a36de2-2fb1-4497-8b9c-61f2e436c27c \
MATCH_ID=match:WC:2026:537327 \
VUS=50 \
DURATION=1m \
k6 run tests/load/prediction-spike.js
```

Resultado:

- Iteraciones completadas: 716.
- Predicciones exitosas: 646.
- Predicciones fallidas: 70.
- `prediction_duration` p95: 1854.75 ms.
- `http_req_duration` p95: 2402.40 ms.

Conclusion: con 50 usuarios virtuales guardando porras, el sistema empezo a devolver errores en escritura.

### 6.2 Guardado de porras con 100 usuarios virtuales

Comando ejecutado:

```bash
BASE_URL=https://football-porra-tracker.kmilo-coder.workers.dev \
USERS_FILE=users.generated.json \
LEAGUE_ID=47a36de2-2fb1-4497-8b9c-61f2e436c27c \
MATCH_ID=match:WC:2026:537327 \
VUS=100 \
DURATION=30s \
k6 run tests/load/prediction-spike.js
```

Resultado:

- Iteraciones completadas: 595.
- Predicciones exitosas: 502.
- Predicciones fallidas: 93.
- Respuestas HTTP 201: 502.
- Respuestas HTTP 500: 93.
- `prediction_duration` p95: 2472.48 ms.
- `http_req_duration` p95: 2746.66 ms.

Conclusion: el guardado directo contra D1 no era suficiente para soportar picos de escritura concurrente. El cuello de botella principal era la concurrencia de escrituras y operaciones auxiliares en el camino critico.

### 6.3 Avalancha inicial de 1000 usuarios antes de Queue

Comando ejecutado:

```bash
BASE_URL=https://football-porra-tracker.kmilo-coder.workers.dev \
USERS_FILE=users.generated.json \
LEAGUE_ID=47a36de2-2fb1-4497-8b9c-61f2e436c27c \
MATCH_ID=match:WC:2026:537327 \
VUS=200 \
ITERATIONS=1000 \
k6 run tests/load/prediction-once.js
```

Resultado:

- Iteraciones solicitadas: 1000.
- Predicciones exitosas: 617.
- Predicciones fallidas: 383.
- Respuestas HTTP 201: 617.
- Respuestas HTTP 500: 178.
- Otros fallos: 2.
- `http_req_duration` p95: 5213.72 ms.
- `prediction_duration` p95: 4691.91 ms.

Conclusion: antes de las optimizaciones, el sistema no podia certificarse para 1000 usuarios activos guardando porras, porque solo 617 de 1000 flujos completaban correctamente.

## 7. Cuellos de botella encontrados

### 7.1 Escrituras concurrentes en D1

Sintoma:

- Errores HTTP 500 durante el guardado de porras.
- Fallos crecientes al pasar de 50 a 100 usuarios virtuales.
- En avalancha de 1000 usuarios, solo 617 predicciones fueron exitosas.

Causa tecnica:

- El endpoint de porras escribia directamente en D1.
- Cada guardado tambien generaba auditoria e invalidaciones de cache.
- La experiencia del usuario quedaba acoplada a la escritura fisica final.

Ajuste implementado:

- Se creo y activo Cloudflare Queue `football-porra-predictions`.
- El endpoint `/api/league/predictions` ahora acepta la porra con HTTP 202.
- La escritura final en D1 se procesa en segundo plano por lotes.
- Se agregaron reintentos con backoff para errores transitorios.

### 7.2 Escrituras innecesarias durante login

Sintoma:

- En picos, login y sesiones competian por escritura con las porras.

Causa tecnica:

- El login creaba una sesion nueva aun cuando el usuario ya tenia una sesion valida.
- La auditoria de login estaba en el camino critico.

Ajuste implementado:

- Si el usuario ya tiene sesion valida, el login reutiliza la sesion.
- La auditoria de login se difiere usando `ctx.waitUntil`.
- La creacion de sesion usa reintentos con backoff.

### 7.3 Error CPU 1102 en Cloudflare

Sintoma:

- Cloudflare devolvio `error code: 1102` en `/api/bootstrap`.

Causa tecnica:

- El ranking calculaba predicciones filtrando toda la lista por cada miembro.
- Con 1000 usuarios y muchas predicciones, esto elevaba el costo computacional.

Ajuste implementado:

- Se optimizo `buildLeaderboard` agrupando predicciones por usuario una sola vez mediante `Map`.
- Se evito el patron O(members * predictions).

### 7.4 Limite diario de escritura en KV

Sintoma:

- Error: `KV put() limit exceeded for the day`.
- El `bootstrap` fallaba si KV no podia escribir cache.

Causa tecnica:

- KV estaba en el camino critico.
- Cada cambio de porra podia invalidar cache y aumentar escrituras.

Ajuste implementado:

- KV se convirtio en best effort: si falla leer o escribir cache, la app responde igual usando D1.
- Se dejo de invalidar cache global por cada porra guardada.
- Se redujeron escrituras de cache durante picos.

### 7.5 Payload inicial pesado

Sintoma:

- Latencia p95 alta en `bootstrap`.
- En escenarios grandes, el dashboard inicial traia ranking completo y datos que no son necesarios para apostar inmediatamente.

Causa tecnica:

- El payload inicial incluia ranking completo, miembros y todas las predicciones necesarias para calculos agregados.

Ajuste implementado:

- Se implemento `getLeagueDashboardLite`.
- El `bootstrap` inicial ahora trae datos esenciales:
  - viewer autenticado.
  - ligas accesibles.
  - liga activa.
  - partidos.
  - tablas.
  - reglas.
  - conteos.
  - solo predicciones propias del usuario final.
- El ranking se carga posteriormente desde `/api/leagues/:id/leaderboard`.
- Se agrego versionado de cache de bootstrap con `BOOTSTRAP_PAYLOAD_VERSION = 2`.

## 8. Resultados despues de Queue, reintentos y cache resiliente

### 8.1 Guardado de porras con 100 usuarios virtuales

Comando ejecutado:

```bash
BASE_URL=https://football-porra-tracker.kmilo-coder.workers.dev \
USERS_FILE=users.generated.json \
LEAGUE_ID=47a36de2-2fb1-4497-8b9c-61f2e436c27c \
MATCH_ID=match:WC:2026:537327 \
VUS=100 \
DURATION=30s \
k6 run tests/load/prediction-spike.js
```

Resultado final con Queue:

- Iteraciones completadas: 680.
- Predicciones exitosas: 680.
- Predicciones fallidas: 0.
- Respuestas HTTP 202: 680.
- `prediction_duration` p95: 1917.93 ms.
- Fallos HTTP: 0%.

Comparacion contra el resultado previo:

- Antes: 502 exitosas y 93 fallidas.
- Despues: 680 exitosas y 0 fallidas.
- Mejora: eliminacion de errores 500 en el escenario de 100 VUs.

## 9. Resultado final con 1000 usuarios activos

### 9.1 Avalancha final con bootstrap optimizado

Comando ejecutado:

```bash
BASE_URL=https://football-porra-tracker.kmilo-coder.workers.dev \
USERS_FILE=users.generated.json \
LEAGUE_ID=47a36de2-2fb1-4497-8b9c-61f2e436c27c \
MATCH_ID=match:WC:2026:537327 \
VUS=200 \
ITERATIONS=1000 \
k6 run tests/load/prediction-once.js
```

Resultado final:

- Iteraciones solicitadas: 1000.
- Iteraciones completadas: 1000.
- Flujos exitosos: 1000 de 1000.
- Predicciones aceptadas: 1000.
- Respuestas HTTP 202: 1000.
- Fallos HTTP: 0%.
- `http_req_duration` promedio: 2846.57 ms.
- `http_req_duration` p95: 4983.30 ms.
- `prediction_duration` p95: 3274.81 ms.
- Requests HTTP ejecutados: 3000.

Validacion de persistencia:

```sql
SELECT COUNT(*) AS test_predictions
FROM league_predictions
WHERE league_id = '47a36de2-2fb1-4497-8b9c-61f2e436c27c'
  AND user_id LIKE 'load-user-%';
```

Resultado:

```text
test_predictions = 1000
```

Conclusion: en el escenario final, la aplicacion acepto y persistio 1000 predicciones de usuarios de prueba sin errores HTTP.

## 10. Comparativo ejecutivo

| Escenario | Antes | Despues |
| --- | ---: | ---: |
| Guardado 100 VUs | 502 exitosas / 93 fallidas | 680 exitosas / 0 fallidas |
| Avalancha 1000 usuarios | 617 exitosas / 383 fallidas | 1000 exitosas / 0 fallidas |
| Errores HTTP 500 en escritura | Presentes | Eliminados en prueba final |
| Persistencia D1 final | No garantizada para todos | 1000/1000 confirmadas |
| Ranking en bootstrap | En camino critico | Diferido |
| KV en camino critico | Si | No, best effort |
| Queue de porras | No activa | Activa |

## 11. Waiting Room

Cloudflare Waiting Room debe configurarse desde el dashboard de Cloudflare sobre un dominio propio y un path. La documentacion oficial indica que la sala de espera requiere al menos una combinacion de hostname y path, y que el path cubre subrutas.

Configuracion recomendada para el momento de cierre de apuestas:

- Hostname: dominio final de la aplicacion, por ejemplo `porra.tudominio.com`.
- Path protegido: `/dashboard`.
- Total active users inicial: 1000.
- New users per minute inicial: 300 a 500.
- Session duration: 15 a 30 minutos.
- Excluir assets estaticos y recursos publicos cuando aplique.

Referencias:

- https://developers.cloudflare.com/waiting-room/how-to/place-waiting-room/
- https://developers.cloudflare.com/waiting-room/reference/configuration-settings/

## 12. Certificacion tecnica de capacidad

Con base en las pruebas ejecutadas, los ajustes implementados y la validacion final en ambiente Cloudflare, se certifica tecnicamente que la aplicacion respondio satisfactoriamente al escenario probado de 1000 usuarios activos, con 200 usuarios virtuales concurrentes, ejecutando login, carga inicial del dashboard y registro de una prediccion por usuario.

La prueba final alcanzo:

- 1000 de 1000 flujos completados.
- 1000 de 1000 predicciones aceptadas.
- 1000 de 1000 predicciones persistidas en D1.
- 0% de fallos HTTP en el escenario final.

Bajo estos parametros probados, la aplicacion se considera apta para soportar 1000 usuarios activos en condiciones normales de operacion y con la arquitectura actual de Cloudflare Workers, D1, KV best effort y Queues.

Esta certificacion no reemplaza una garantia absoluta ante trafico no probado, limites comerciales de la cuenta, cambios de plan, fallas regionales de proveedor o escenarios superiores a la carga evaluada. Para eventos reales del Mundial se recomienda mantener Waiting Room activo, monitorear metricas de Cloudflare y repetir k6 antes de cada fase critica.

## 13. Recomendaciones finales

- Activar Waiting Room cuando se tenga dominio propio configurado en Cloudflare.
- Mantener Queue activa para predicciones.
- No volver a poner ranking completo ni todas las predicciones en el bootstrap inicial.
- Mantener KV como cache no critico.
- Repetir prueba de 1000 usuarios antes del inicio del torneo.
- Ejecutar prueba adicional de 2000 usuarios si el numero esperado de asociados aumenta.
- Limpiar usuarios sinteticos o moverlos a una organizacion dedicada de pruebas antes de operacion real.

