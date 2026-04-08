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
