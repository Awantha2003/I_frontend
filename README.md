# Inventory Management – Frontend

Next.js + TypeScript + Tailwind CSS frontend for the Inventory module of the Inventory Management Dashboard (KANBAN design).

Backend repository: https://github.com/Awantha2003/I_backend

## Features

- **Login**: calls the API and goes to Inventory on success. Errors from the API are shown on failure.
- **Sign Up**: checks name, email and password (at least 8 characters) on the client and the server. Duplicate emails are rejected. Logs the user in after sign up.
- **Protected routes**: Inventory requires a token. Users who are not logged in, or whose token has expired, are sent to Login.
- **Inventory list**:
  - Products are loaded from the API, with search by name (debounced and done on the server).
  - Includes the Overall Inventory summary, a filter by availability, 10 rows per page and a CSV download.
- **Add / Edit product modal**:
  - The same form handles both add and edit. It checks required fields and that price, quantity and threshold are not negative.
  - Server errors are shown in the modal. The table and summary refresh after a save without reloading the page.

## Setup

Requires Node.js 20 or newer. Start the backend first (see the backend README).

```bash
git clone https://github.com/Awantha2003/I_frontend.git
cd I_frontend
npm install
cp .env.example .env.local   # set NEXT_PUBLIC_API_URL if the API isn't on localhost:5000
npm run dev
```

Open http://localhost:3000. You'll be sent to `/login`. Create an account at `/signup`.

### Environment variables

| Name                  | Description          | Default                 |
| --------------------- | -------------------- | ----------------------- |
| `NEXT_PUBLIC_API_URL` | Base URL of the API  | `http://localhost:5000` |

### Scripts

| Command         | Description              |
| --------------- | ------------------------ |
| `npm run dev`   | Development server       |
| `npm run build` | Production build         |
| `npm start`     | Run the production build |
| `npm run lint`  | ESLint                   |

## Project structure

```
app/
  login/page.tsx              Login screen
  signup/page.tsx             Sign Up screen
  (dashboard)/layout.tsx      Protected layout (auth guard + sidebar)
  (dashboard)/inventory/      Inventory route
components/
  AuthGuard.tsx               Redirects to /login when there is no token
  InventoryView.tsx           Products table, search, filters, pagination
  ProductModal.tsx            Add / edit product form with validation
  OverallInventory.tsx        Summary card computed from API data
  Sidebar.tsx, Topbar.tsx     Layout pieces from the design
lib/
  api.ts                      Fetch wrapper (adds the token, handles API errors)
  auth.ts                     Token / user stored in localStorage
  types.ts                    Product types and availability rules
```
