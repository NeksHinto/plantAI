## PlantAI

Aplicación web para organizar tus plantas por ambientes del hogar, escanear e identificar especies y enfermedades mediante Inteligencia Artificial, y mantener un historial médico detallado de cada una.

---

## Integrantes
- **Jesus Meza Caya** — 113014
- **Agustin Ezequiel Mazurkiewich** — 112809
- **Nicole Renée Hinojo Toré** — 114011
- **Dylan Laureano Rivas** — 112701

---

## Funcionalidades Principales

### 1. Inicio de Sesión
![Pagina para inicio de sesion ](inicio-sesion.png)

### 2. Pagina principal
![Pagina principal de la app](pagina-principal.png)

### 3. Agregar Ambiente
![Formulario para agregar un nuevo ambiente](agregar-ambiente.png)

### 4. Escanear Planta (Identificación de especie)
![Interfaz para subir una imagen de la planta](escanear-planta.png)

### 5. Información de la planta identificada (Resultados del Escaneo)
![Informacion de la planta identificada](informacion-escaneo.png)

### 6. Resultado de escaneo con probabilidad de enfermedad
![Resultados del escaneo con probabilidad de enfermedad](resultado-escaneo.png)



## Requisitos Previos

Antes de comenzar, asegurate de tener instalados los siguientes programas en tu sistema:

1. **[Git](https://git-scm.com/)**: Para clonar el repositorio.
2. **[Node.js](https://nodejs.org/)** *(v20 o superior)*: Para ejecutar el servidor backend (`node` y `npm`).
3. **[Docker](https://www.docker.com/) y Docker Compose** *(Recomendado)*: Para levantar la base de datos PostgreSQL localmente sin instalar Postgres a mano.
4. **Python 3** *(o cualquier servidor estático como Live Server)*: Para servir los archivos de la interfaz web (Frontend).

---

## Cómo correr el proyecto

### 1. Cloná el repositorio y movete a la carpeta


Abre una terminal y ejecuta:

```bash
git clone https://github.com/NeksHinto/plantAI.git
cd plantAI
```

---

### 2. Copiá el archivo de ejemplo de variables de entorno
```bash
cp .env.example .env
```

Abrí `.env` y revisá los valores de configuración:

| Variable | Descripción | Valor por defecto / Requerido |
|---|---|---|
| `DB_PROVIDER` | Proveedor de Base de Datos (`local` para Postgres Docker o `supabase`) | `local` |
| `DB_HOST` | Host de PostgreSQL local | `localhost` (en Docker se usa `db`) |
| `DB_PORT` | Puerto de PostgreSQL | `5432` |
| `DB_USER` | Usuario de PostgreSQL | `postgres` |
| `DB_PASS` | Contraseña de PostgreSQL | `postgres` |
| `DB_NAME` | Nombre de la base de datos | `plantAI` |
| `PLANTNET_API_KEY` | API Key de PlantNet para escaneo de especies/enfermedades | *Opcional (para escaneo real)* |
| `GEMINI_API_KEY` | API Key de Google Gemini para recomendaciones de tratamiento con IA | *Opcional (para recomendaciones IA)* |
| `PUBLIC_SUPABASE_URL` | URL del proyecto de Supabase | *Solo si `DB_PROVIDER=supabase`* |
| `PUBLIC_SUPABASE_ANON_KEY` | Key pública anon de Supabase | *Solo si `DB_PROVIDER=supabase`* |
| `PRIVATE_SUPABASE_BUCKET_API_KEY` | Service role key para subida de imágenes a Supabase Storage | *Solo si `DB_PROVIDER=supabase`* |

---

### 3. Levantá los contenedores
```bash
docker compose up --build
```

Docker Compose iniciará automáticamente:
- **Frontend** (Servidor Nginx) en el puerto `3000`
- **Backend** (API Node.js / Express) en el puerto `8000`
- **Base de Datos** (PostgreSQL 16) en el puerto `5432` (con tablas y datos iniciales cargados automáticamente)

---

### 4. Abrí la aplicación
Una vez que los contenedores estén corriendo, abrí en tu navegador:

**[http://localhost:3000](http://localhost:3000)**

#### Credenciales de prueba
Podés registrar un usuario nuevo o iniciar sesión con el usuario de prueba predeterminado:
- **Usuario:** `dylan`
- **Contraseña:** `1234`

---

## Desarrollo Local (Sin Docker para backend/frontend)

Si preferís correr el backend o frontend en modo desarrollo directamente en tu máquina:

1. **Levantar solo la base de datos en Docker:**
   ```bash
   docker compose up db -d
   ```

2. **Ejecutar Backend:**
   ```bash
   cd backend/app
   npm install
   npm run dev
   ```
   *La API estará disponible en `http://localhost:8000`.*

3. **Ejecutar Frontend:**
   Podés servir la carpeta `frontend/` con cualquier servidor estático (ej: Live Server en VS Code o Python):
   ```bash
   cd frontend
   python3 -m http.server 3000
   ```

---

## Arquitectura del Proyecto

```text
plantAI/
├── frontend/             # UI en HTML5, CSS3 vanilla y JavaScript ES6+
│   ├── components/       # Componentes HTML modulares
│   ├── styles/           # Estilos CSS por pantalla y componentes
│   └── utils/            # Lógica de cliente, fetchers y escáner
├── backend/              # API REST en Node.js + Express
│   └── app/
│       ├── api/          # Controladores y rutas HTTP
│       ├── db/           # Adaptadores de base de datos (Local Postgres & Supabase)
│       └── services/     # Clientes de integración (PlantNet API y Gemini AI)
├── db-init/              # Scripts SQL de inicialización de esquema y datos (Seed)
├── docker-compose.yml    # Orquestación de servicios Docker
└── README.md
```

---

## Endpoints Principales de la API

- `POST /api/v1/auth/login` — Autenticación de usuario
- `POST /api/v1/auth/register` — Registro de nuevo usuario
- `GET /api/v1/rooms?userId=` — Obtener ambientes del hogar
- `GET /api/v1/rooms/:roomId/plants` — Obtener plantas de un ambiente
- `POST /api/v1/plantas/add-plant` — Agregar una nueva planta
- `POST /api/v1/plantas/identify-disease` — Diagnosticar salud / enfermedad con PlantNet y Gemini
- `GET /health` — Check de estado de la API backend
