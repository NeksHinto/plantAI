# PlantAI

App web para organizar plantas por ambiente de la casa, escanearlas (especie + enfermedad) y guardar historial clínico.

Stack: HTML/CSS/JS (frontend) · Node/Express (backend) · Postgres local (Docker) o Supabase remoto · PlantNet + Gemini

## Integrantes
- Jesus Meza Caya — 113014
- Agustin Ezequiel Mazurkiewich — 112809
- Nicole Renée Hinojo Toré — 114011
- Dylan Laureano Rivas — 112701

## Arquitectura (resumen)
```
frontend/          UI estática + fetch al API
backend/app/       Express API
  api/             rutas
  db/local/        queries Postgres
  db/supabase/     mismas operaciones vía Supabase
  services/        PlantNet / Gemini
db-init/           schema + seeds (Postgres Docker)
```

## Variables de entorno

| Variable | Para qué |
|---|---|
| `DB_PROVIDER` | `local` (default) o `supabase` |
| `DB_HOST` / `DB_PORT` / `DB_USER` / `DB_PASS` / `DB_NAME` | Postgres local |
| `PLANTNET_API_KEY` | identificación de especie/enfermedad |
| `GEMINI_API_KEY` | notas de tratamiento (opcional; hay fallback) |
| `PUBLIC_SUPABASE_URL` | solo si `DB_PROVIDER=supabase` |
| `PUBLIC_SUPABASE_ANON_KEY` | solo si `DB_PROVIDER=supabase` |

## Cómo correrlo

### 1) Docker (backend + Postgres)

```bash
cp backend/.env.example backend/.env

docker compose --env-file backend/.env up --build
```

Backend: http://localhost:8000  
Health: http://localhost:8000/health

Frontend aparte (hace falta un server estático por los `fetch` de componentes):

```bash
cd frontend && python3 -m http.server 8765
```

Abrir http://localhost:8765

Login seed: usuario `dylan` / pass `1234` (ver `db-init/02-seeds.sql`)

### 2) Backend local + Postgres Docker

```bash
nvm use # Node >=22
docker compose --env-file backend/.env up db -d

cd backend/app
npm install
npm run dev
```

`npm start` / `npm run dev` cargan `backend/.env` con `--env-file` (sin librería dotenv).

En `backend/.env`: `DB_HOST=localhost`, `DB_PROVIDER=local`.

### 3) Backend local + Supabase

En `backend/.env`:

```
DB_PROVIDER=supabase
PUBLIC_SUPABASE_URL=...
PUBLIC_SUPABASE_ANON_KEY=...
```

```bash
nvm use
cd backend/app && npm install && npm run dev
```

### 4) Solo frontend

```bash
cd frontend && python3 -m http.server 8765
```

## Endpoints principales
- `POST /api/v1/auth/login` — `{ username, password }`
- `GET /api/v1/rooms?userId=`
- `GET /api/v1/rooms/:roomId/plants`
- `GET|PUT|DELETE /api/v1/plantas/:plantId`
- `POST /api/v1/plantas/add-plant`
- `POST /api/v1/plantas/identify-disease`