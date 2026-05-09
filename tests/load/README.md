# Pruebas de carga

Este paquete usa `k6` para medir si la app soporta picos de usuarios leyendo datos y guardando porras.

## 1. Instalar k6

macOS:

```bash
brew install k6
```

Verifica:

```bash
k6 version
```

## 2. Preparar usuarios de prueba

Crea usuarios reales de prueba desde el panel admin o con la carga masiva CSV. Después arma un archivo JSON con este formato:

```json
[
  { "email": "usuario1@example.com", "password": "ClaveTemporalOCambiada" },
  { "email": "usuario2@example.com", "password": "ClaveTemporalOCambiada" }
]
```

Recomendado:

- Usa usuarios de una organización de pruebas.
- Asegúrate de que puedan entrar sin quedar bloqueados por cambio obligatorio de contraseña.
- Usa una liga con partidos abiertos si vas a probar escrituras de porras.

## 3. Prueba de navegación

Simula usuarios entrando, autenticándose, cargando dashboard, assets de equipos y refrescando la liga activa.

```bash
BASE_URL=http://localhost:8787 \
USERS_FILE=./tests/load/users.sample.json \
VUS=100 \
DURATION=3m \
npm run load:browse
```

Para producción:

```bash
BASE_URL=https://football-porra-tracker.kmilo-coder.workers.dev \
USERS_FILE=./tests/load/users.real.json \
VUS=100 \
DURATION=3m \
npm run load:browse
```

## 4. Prueba de pico de porras

Simula usuarios guardando predicciones. Si no pasas `MATCH_ID`, el script toma el primer partido abierto de la liga activa.

```bash
BASE_URL=http://localhost:8787 \
USERS_FILE=./tests/load/users.sample.json \
VUS=100 \
DURATION=1m \
npm run load:predictions
```

## 5. Prueba de avalancha realista

Este escenario simula muchos usuarios distintos guardando una sola porra cada uno, que se parece más al pico real antes de un partido.

```bash
BASE_URL=https://football-porra-tracker.kmilo-coder.workers.dev \
USERS_FILE=./tests/load/users.generated.json \
LEAGUE_ID=tu_liga_id \
MATCH_ID=tu_match_id \
VUS=200 \
ITERATIONS=1000 \
npm run load:predictions-once
```

Con liga y partido específicos:

```bash
BASE_URL=https://football-porra-tracker.kmilo-coder.workers.dev \
USERS_FILE=./tests/load/users.real.json \
LEAGUE_ID=tu_liga_id \
MATCH_ID=tu_match_id \
VUS=500 \
DURATION=2m \
npm run load:predictions
```

## 6. Escalera recomendada

No empieces directo en 1000. Haz una escalera:

```text
50 usuarios por 2 minutos
100 usuarios por 3 minutos
250 usuarios por 3 minutos
500 usuarios por 5 minutos
1000 usuarios por 5 minutos
```

## 7. Cómo interpretar

Buena señal:

- `http_req_failed` menor a 1% en navegación.
- `http_req_failed` menor a 2% en pico de porras.
- `p(95)` de `bootstrap_duration` menor a 1200 ms.
- `p(95)` de `prediction_duration` menor a 2500 ms.
- Sin errores 500 repetidos.

Señal de que debemos revisar Queue, límites de cuenta o Waiting Room:

- Guardar porras sube consistentemente por encima de 3 a 5 segundos.
- Aparecen errores D1 por concurrencia.
- `prediction_ok` baja de 98%.

## 8. Notas de seguridad

- No uses usuarios reales de clientes para pruebas de carga.
- No corras 1000 usuarios contra producción durante horario de uso real.
- Si pruebas producción, hazlo en una ventana controlada y con usuarios de prueba.
