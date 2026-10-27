# CampusConnect — MERN Stack Mini-Project

CampusConnect is a responsive student portal built with **MongoDB, Express.js, React.js, and Node.js**. It includes a home page and three database-backed forms with both browser-side and server-side validation.

## Features

- Responsive homepage with feature cards and links to each form.
- **Student registration:** name, email, roll number, department, academic year, and mobile number.
- **Event registration:** student details, event, and participant/volunteer selection. The same email cannot register for the same event twice.
- **Feedback and suggestions:** category, 1–5 rating, and a message.
- HTML5 constraints (`required`, `type=email`, `minLength`, `maxLength`, `pattern`) plus client-side form checks.
- Express API validation and MongoDB/Mongoose schema validation.
- Duplicate student email/roll-number checks, duplicate event-registration prevention, CORS configuration, Helmet security headers, JSON body-size limit, and API rate limiting.
- No mock success messages: each form displays success only when the API confirms the record was stored.

## Tech stack

| Layer | Technology |
|---|---|
| Structure | HTML5 |
| Styling | CSS, Bootstrap 5, responsive custom CSS |
| Frontend | JavaScript, React, Vite |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas with Mongoose |

## Folder structure

```text
campusconnect/
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── backend/
│   ├── src/
│   │   ├── models/
│   │   │   ├── Student.js
│   │   │   ├── EventRegistration.js
│   │   │   └── Feedback.js
│   │   ├── routes/forms.js
│   │   └── server.js
│   ├── .env.example
│   └── package.json
├── .gitignore
└── README.md
```

## Requirements

- Node.js 20 or newer and npm.
- A MongoDB database. MongoDB Atlas is suitable for a hosted demo; a local MongoDB server also works with a local connection string.
- Git is recommended for deployment.

## Run locally on Windows PowerShell

Open a terminal in the project folder. You will need one terminal for the backend and another for the frontend.

### 1. Configure MongoDB and the backend

1. Create a MongoDB Atlas project and cluster, create a **database user**, and copy the application connection string.
2. In the `backend` folder, copy `.env.example` to `.env`.
3. Edit `backend/.env` and replace `MONGODB_URI` with your actual connection string. Keep the database name `campusconnect` in the URI. Replace the username/password placeholders and URL-encode special characters in the database password if needed.
4. Keep `PORT=5000` and `CORS_ORIGIN=http://localhost:5173` for local development.
5. Install and start the backend:

```powershell
cd backend
npm install
npm run dev
```

The API starts at `http://localhost:5000` after connecting to MongoDB. Keep this terminal running.

### 2. Configure and start the frontend

Open a second terminal at the project root:

```powershell
cd frontend
Copy-Item .env.example .env
npm install
npm run dev
```

Vite prints the local URL, usually `http://localhost:5173`. Open it in your browser. The frontend `.env` should contain:

```dotenv
VITE_API_URL=http://localhost:5000
```

If you edit environment variables while a dev server is running, restart that server.

### 3. Verify the backend

Open `http://localhost:5000/api/health`. It should return JSON similar to:

```json
{"status":"ok","database":"connected"}
```

Submit a test record through each of the three forms. If you use the same student email or roll number twice, the API should return a duplicate-registration message. Event registrations are unique for each email/event combination.

## API endpoints

All write endpoints accept JSON and return JSON. The API does not expose a public endpoint for reading personal submissions.

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/api/health` | API and database health check |
| `POST` | `/api/students` | Validate and create a student record |
| `POST` | `/api/events` | Validate and create an event registration |
| `POST` | `/api/feedback` | Validate and save feedback |

Common status codes: `201` created, `400` invalid input, `409` duplicate record, `403` origin not allowed, and `500` unexpected server error.

## Deploy the website publicly

The recommended setup is **MongoDB Atlas for the database, Render for the Express API, and Vercel for the React frontend**. Create an empty GitHub repository (for example, `campusconnect-mern`), then run these commands from the extracted project folder after replacing the remote URL with your repository URL. Do not commit `.env` files or real connection strings.

```powershell
git init
git add .
git commit -m "Initial CampusConnect project"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/campusconnect-mern.git
git push -u origin main
```

### A. Create the database in MongoDB Atlas

1. Create an Atlas cluster and a database user with permissions limited to the project database.
2. Copy the application connection string. Use a strong password and keep the URI private.
3. Configure Atlas **Network Access** to allow the deployed backend to connect. Prefer restricting access to the backend's available outbound IP addresses where your hosting plan exposes them. For a short classroom demo only, if you cannot restrict the Render outbound IPs, an Atlas `0.0.0.0/0` access entry allows connections from any IP and increases exposure; use a strong, least-privilege database user and remove that entry when no longer needed.

### B. Deploy the backend on Render

1. Create a new **Web Service** in Render and connect your GitHub repository.
2. Set **Root Directory** to `backend`.
3. Set **Build Command** to `npm install` and **Start Command** to `npm start`.
4. Add these environment variables in Render's Environment settings:

```dotenv
MONGODB_URI=your_private_atlas_connection_string
CORS_ORIGIN=http://localhost:5173
NODE_ENV=production
```

`PORT` is supplied by Render; the server reads it automatically. After the first deployment, copy your Render service URL, for example `https://your-api-name.onrender.com` (use your actual service URL).

### C. Deploy the frontend on Vercel

1. Import the same GitHub repository into Vercel.
2. Set the **Root Directory** to `frontend`.
3. Set the build command to `npm run build` and the output directory to `dist` (Vercel normally detects Vite automatically).
4. Add the environment variable:

```dotenv
VITE_API_URL=https://your-api-name.onrender.com
```

Replace the example with the real Render URL; do not add `/api` at the end. Deploy and copy the public Vercel URL, such as `https://your-campusconnect.vercel.app`.

### D. Connect the live frontend to the API

1. In Render, update `CORS_ORIGIN` to the exact Vercel origin, for example `https://your-campusconnect.vercel.app` — no trailing slash. If your live frontend has a different domain, use that exact origin.
2. Save the change and redeploy/restart the backend if requested.
3. In Vercel, confirm `VITE_API_URL` points at the live Render service and trigger a new deployment if you changed it.
4. Open the Vercel website URL and submit one test entry in each form.
5. Check the API health URL: `https://your-api-name.onrender.com/api/health`. It should report `database: "connected"`.

The final website URL is the Vercel URL shown in your Vercel project. The backend URL is separate and is used by the website to save form data.

## Common deployment problems

- **`Could not reach the server`:** check the frontend `VITE_API_URL`, backend deployment status, and whether the Render service has started successfully.
- **CORS error in browser dev tools:** set `CORS_ORIGIN` to the exact deployed frontend origin, without a trailing slash, then redeploy the backend.
- **MongoDB connection timeout:** check Atlas Network Access, the database username/password, and the full URI.
- **MongoDB authentication fails:** ensure the URI uses a MongoDB database user, not your Atlas account login. URL-encode reserved characters in the password.
- **Form says email/roll number is already registered:** this is intentional duplicate protection. Try a new test email/roll number.
- **Frontend env variable seems ignored:** restart Vite locally or rebuild/redeploy the frontend; Vite environment variables are included at build time.

## Notes for the mini-project report / viva

- **Objective:** Develop a responsive MERN website with a home page, at least three validated forms, and database support, then deploy it to a public web server.
- **Database collections:** `students`, `eventregistrations`, and `feedback` (Mongoose creates collections when records are first saved).
- **Validation approach:** HTML form constraints improve user experience; Express validates every request independently so invalid client requests cannot bypass validation.
- **Test cases:** valid submission; missing required field; invalid email; invalid phone; invalid roll number; invalid rating/message; duplicate student; duplicate registration for the same event; database/API unavailable.
- **Privacy:** This educational app does not include an admin dashboard or public listing of submissions. Use sample data during demonstrations and never add real sensitive student data to a public demo.

## Useful official deployment guides

- Render Node/Express deployment: https://render.com/docs/deploy-node-express-app
- Render environment variables: https://render.com/docs/configure-environment-variables
- Vercel React deployment: https://vercel.com/kb/guide/deploying-react-with-vercel
- MongoDB Atlas driver connection: https://www.mongodb.com/docs/atlas/driver-connection/
