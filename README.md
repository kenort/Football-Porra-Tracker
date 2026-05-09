# Football Porra Tracker

Porra de fútbol preparada para desplegarse en Cloudflare con estas piezas:

- Cloudflare Workers para API y entrega de assets estáticos
- Cloudflare D1 para persistencia de participantes, partidos, predicciones y tabla
- `FOOTBALL_DATA_API_TOKEN` como secreto, sin exponerlo en frontend

## Arquitectura

- `public/`: frontend estático
- `src/worker.js`: API y lógica de negocio
- `migrations/`: esquema D1
- `wrangler.toml`: configuración del Worker, assets y binding a D1

## Configuración local

1. Instala dependencias:

```bash
npm install
```

2. Crea la base de datos D1 y copia el `database_id` al archivo `wrangler.toml`:

```bash
npx wrangler d1 create football-porra
```

3. Aplica migraciones locales:

```bash
npm run db:migrate
```

4. Copia `.dev.vars.example` a `.dev.vars` y añade tu token de football-data.

5. Arranca el proyecto:

```bash
npm run dev
```

## Probar local con la base remota actual

Si quieres probar la app local con los mismos usuarios y ligas que ya tienes en Cloudflare, usa:

```bash
npm run dev:remote
```

Esto deja:

- D1 remota para probar con los datos actuales
- cache KV real para lecturas calientes
- bucket R2 para servir banderas y escudos cacheados
- Worker local para iterar sin desplegar en cada cambio

## Escalabilidad aplicada

- cache corto de `bootstrap` en KV para bajar lecturas repetidas a D1
- cache de competiciones y assets de equipos para reducir llamadas a `football-data`
- escudos y banderas servidos desde el Worker y opcionalmente persistidos en R2
- partidos y tablas compartidos por competición/temporada para evitar duplicar datos entre organizaciones
- menos escrituras en `sessions.last_seen_at` gracias a un touch por intervalo
- consultas agrupadas para el dashboard de liga usando `db.batch(...)`
- guardado de porras preparado para activarse por Queue más adelante sin romper el cliente
- assets HTML/JS/CSS con cabeceras cacheables para aprovechar edge caching

## Pruebas de carga

El proyecto incluye scripts `k6` para validar estabilidad y fiabilidad bajo tráfico:

```bash
npm run load:browse
npm run load:predictions
```

La guía completa está en `tests/load/README.md`.

## Lo que sigue dependiendo de configuración de cuenta

- Waiting Room no se activa por código del Worker; se configura en Cloudflare sobre tu dominio/zona
- las colas de predicciones ya están configuradas y activadas con `ENABLE_PREDICTION_QUEUE=true`
- si creas otra cuenta o proyecto, debes crear la Queue antes del despliegue

```bash
npx wrangler queues create football-porra-predictions
```

Si apagas temporalmente la cola, el guardado directo mantiene reintentos con backoff para absorber errores transitorios de D1.

## Waiting Room recomendado

Cloudflare Waiting Room se configura en el dashboard de Cloudflare, sobre un hostname y path específicos. La documentación oficial indica que una sala de espera necesita al menos una combinación de `hostname` y `path`, y que el path cubre también sus subrutas.

Configuración sugerida para el pico de cierre de apuestas:

- Hostname: tu dominio final, por ejemplo `porra.tudominio.com`.
- Path protegido: `/dashboard`.
- Total active users: empezar con `1000` y ajustar con k6 + métricas reales.
- New users per minute: empezar con `300` a `500` para suavizar entradas masivas.
- Session duration: `15` a `30` minutos para que quien ya entró pueda terminar su porra.
- Excepciones: dejar fuera assets estáticos y, si aplica, endpoints públicos como `/login` para no afectar la carga de la pantalla inicial.

Referencias oficiales:

- https://developers.cloudflare.com/waiting-room/how-to/place-waiting-room/
- https://developers.cloudflare.com/waiting-room/reference/configuration-settings/

## Despliegue en Cloudflare

1. Crea la base D1 en tu cuenta.
2. Coloca el `database_id` real en `wrangler.toml`.
3. Aplica migraciones remotas:

```bash
npm run db:migrate:remote
```

4. Guarda el token como secreto:

```bash
npx wrangler secret put FOOTBALL_DATA_API_TOKEN
```

5. Despliega:

```bash
npm run deploy
```

## Buenas prácticas aplicadas

- La API key nunca vive en `public/` ni en el código cliente.
- Toda la lógica de puntuación y bloqueo de apuestas ocurre en servidor.
- La UI solo consume la API del Worker.
- La persistencia de la porra ya no depende de `localStorage`.
