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
- menos escrituras en `sessions.last_seen_at` gracias a un touch por intervalo
- consultas agrupadas para el dashboard de liga usando `db.batch(...)`
- guardado de porras preparado para activarse por Queue más adelante sin romper el cliente
- assets HTML/JS/CSS con cabeceras cacheables para aprovechar edge caching

## Lo que sigue dependiendo de configuración de cuenta

- Waiting Room no se activa por código del Worker; se configura en Cloudflare sobre tu dominio/zona
- las colas de predicciones quedaron preparadas por feature flag, pero no están activadas por defecto
- si más adelante quieres usar Queue en producción, habría que crear el binding real y poner `ENABLE_PREDICTION_QUEUE=true`

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
