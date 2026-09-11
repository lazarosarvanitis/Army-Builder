# Army Builder

Army Builder is a full-stack Warhammer 40,000 army list builder created as the final project for Coding Factory 9.

The application allows users to register, log in, create faction-based army lists, add units, choose a Warlord, and validate an army against a small set of list-building rules. Administrators can manage the army catalog and user roles.

## Features

### Users

- Register and log in with JWT authentication
- View only their own army lists
- Create, rename, and delete armies
- Choose a faction and one of its detachments
- Add and remove units
- Select a Character as Warlord
- Search and sort army lists
- View live army validation and total points

### Army validation

An army is considered valid when:

- It has exactly one Warlord
- The Warlord is a Character
- A Character unit does not exceed 3 copies
- The army does not exceed its selected points limit
- Units belong to the same faction as the army

Invalid drafts are allowed so the user can continue editing before saving a valid list.

### Administrators

Administrators can:

- Create and delete factions
- Create and delete detachments
- Create, edit, and delete units
- Promote users to ADMIN
- Demote ADMIN users to USER

Administrators cannot delete user accounts. This is intentionally not implemented so account ownership and historical army data are preserved and destructive user-management actions remain outside the scope of the project.

## Screenshots

### My Armies and Admin Navigation

![My Armies and Admin Navigation](docs/screenshots/main-page.png)

### Create Army

![Create Army](docs/screenshots/create-army.png)

### Army Builder and Validation

![Army Builder and Validation](docs/screenshots/army-builder.png)

### Admin Panel

![Admin Panel](docs/screenshots/admin-panel.png)

## Technology Stack

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Lucide React

### Backend

- Python
- FastAPI
- SQLAlchemy
- Pydantic
- JWT authentication with PyJWT
- Argon2 password hashing with pwdlib

### Database

- PostgreSQL 17
- Docker Compose

## Architecture

The backend follows a layered structure:

```text
Router / Controller
        |
      Service
        |
    Repository
        |
   SQLAlchemy ORM
        |
    PostgreSQL
```

The main domain entities are:

```text
User
Faction
Detachment
Unit
Army
ArmyUnit
```

SQLAlchemy relationships and foreign keys connect the entities.

## Project Structure

```text
Army-Builder/
|
|-- backend/
|   |-- app/
|   |   |-- models/
|   |   |-- repositories/
|   |   |-- routers/
|   |   |-- schemas/
|   |   |-- services/
|   |   |-- database.py
|   |   |-- main.py
|   |   `-- seed.py
|   |-- .env.example
|   `-- requirements.txt
|
|-- postman/
|   `-- Army Builder API.postman_collection.json
|
|-- src/
|   |-- components/
|   |-- pages/
|   |-- services/
|   `-- ...
|
|-- docker-compose.yml
|-- package.json
`-- README.md
```

## Requirements

Install these before running the application:

- Python
- Node.js and npm
- Docker Desktop
- Git

## Setup

### 1. Clone the repository

```powershell
git clone https://github.com/lazarosarvanitis/Army-Builder.git
cd Army-Builder
```

### 2. Start PostgreSQL

From the project root:

```powershell
docker compose up -d
```

The Docker configuration creates a PostgreSQL database named `army_builder` on port `5432`.

### 3. Configure the backend environment

Go to the backend directory:

```powershell
cd backend
```

Create a local `.env` file based on `.env.example`.

```powershell
Copy-Item .env.example .env
```

Example:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/army_builder

JWT_SECRET_KEY=your_secret_key_here

SEED_ADMIN_USERNAME=superadmin
SEED_ADMIN_PASSWORD=superpassword
SEED_ADMIN_EMAIL=superadmin@armybuilder.gr
```

Generate a JWT secret with:

```powershell
python -c "import secrets; print(secrets.token_hex(32))"
```

And then copy the generated value into JWT_SECRET_KEY in your .env file.

The real `.env` file is excluded from Git.

### 4. Create and activate the Python virtual environment

Windows PowerShell:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

Install backend dependencies:

```powershell
pip install -r requirements.txt
```

### 5. Seed the database

From the `backend` directory:

```powershell
python -m app.seed
```

The seed is idempotent and can safely be run again without duplicating the seeded catalog data.

It creates:

- An administrator account using the values from `.env`
- Grey Knights
- Adeptus Custodes
- Eldar
- Example detachments and units
- Three sample army lists

### 6. Start the backend

From the `backend` directory, make sure the virtual environment is active:

```powershell
.\.venv\Scripts\Activate.ps1
```

Then start the backend:

```powershell
python -m uvicorn app.main:app --reload
```

Backend:

```text
http://127.0.0.1:8000
```

Swagger UI:

```text
http://127.0.0.1:8000/docs
```

### 7. Start the frontend

Open another terminal in the project root:

```powershell
npm install
npm run dev
```

Open Frontend:

```text
http://localhost:5173
```

### Production frontend build

To verify that the frontend can be successfully compiled and optimized for production:
```powershell
npm run build
```

## Authentication and Authorization

Passwords are hashed with Argon2 and are never stored as plain text.

Successful login returns a JWT access token. Protected backend routes require the token through Bearer authentication.

The application supports two roles:

```text
USER
ADMIN
```

A USER can manage only their own armies.

ADMIN-only routes are protected by backend authorization checks. The backend re-checks the user's current database role for protected administrator operations.

Army ownership is also checked by the backend, so a user cannot access another user's army by manually changing an army ID.

## Main API Groups

```text
/api/auth
/api/factions
/api/detachments
/api/units
/api/armies
/api/armies/{army_id}/units
```

Examples include:

- User registration and login
- Current-user lookup
- User role management
- Faction, detachment, and unit catalog management
- Army creation, retrieval, rename, validation, and deletion
- Adding and removing army units
- Setting and removing a Warlord

The full endpoint documentation and request schemas are available through Swagger UI.

Swagger documentation is intentionally publicly accessible for evaluation and development. In a production deployment, `/docs`, `/redoc`, and `/openapi.json` could be disabled or restricted. The application API endpoints are independently protected by authentication, authorization, role, and ownership checks where required.

## Testing

The project was manually regression tested through the React frontend and the REST API.

Integration testing was also performed with Postman, including:

- User registration
- Login and JWT retrieval
- Current-user authentication
- Public catalog retrieval
- Army creation
- Army retrieval
- Adding a unit
- Setting a Warlord
- Army validation
- Verification that a normal USER receives `403 Forbidden` when attempting to access an ADMIN-only endpoint

The exported Postman collection is included in the `postman/` directory.

Swagger UI can also be used to inspect and test the REST API.

## Seeded Demo Data

The seed provides three factions with example armies:

- Grey Knights — `Titan's Wraith`
- Adeptus Custodes — `Golden Host`
- Eldar — `Exodites`

The seed data gives the evaluator usable catalog and army data immediately after setup.

## Disclaimer

Warhammer 40,000 and related names are trademarks of Games Workshop Limited.

This project is an educational, non-commercial software project and is not affiliated with or endorsed by Games Workshop.
