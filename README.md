# TaskFlow – Team Task Manager

A full-stack team task management application built with Next.js 14, PostgreSQL, and Prisma.

## 🚀 Live Demo

**Live URL:** _Add your Railway URL here after deployment_

**Demo Credentials:**
| Role   | Email              | Password     |
|--------|--------------------|--------------|
| Admin  | admin@demo.com     | password123  |
| Member | member@demo.com    | password123  |

---

## ✨ Features

- **Authentication** – Secure signup/login with JWT (stored in httpOnly cookies)
- **Project Management** – Create, view, update, and delete projects
- **Team Management** – Add/remove members per project with role-based access
- **Task Tracking** – Kanban board with TODO / In Progress / Done columns
- **Role-Based Access Control (RBAC)**
  - **Admin**: Full access – create/delete tasks, manage members, delete project
  - **Member**: Can update task status only
- **Dashboard** – Personal stats (total, in progress, done, overdue) + assigned task list
- **Overdue Detection** – Tasks past their due date are flagged automatically

---

## 🛠 Tech Stack

| Layer       | Technology                        |
|-------------|-----------------------------------|
| Framework   | Next.js 14 (App Router)           |
| Language    | TypeScript                        |
| Database    | PostgreSQL                        |
| ORM         | Prisma                            |
| Auth        | JWT (`jose`) + bcrypt             |
| Styling     | Tailwind CSS                      |
| Deployment  | Railway                           |

---

## 🗄 Database Schema

```
User           → id, name, email, password
Project        → id, name, description, ownerId
ProjectMember  → projectId, userId, role (ADMIN | MEMBER)
Task           → id, title, description, status, priority, dueDate, projectId, assigneeId, creatorId
```

---

## 🔗 REST API Endpoints

### Auth
| Method | Endpoint          | Description         |
|--------|-------------------|---------------------|
| POST   | /api/auth/signup  | Register new user   |
| POST   | /api/auth/login   | Login               |
| POST   | /api/auth/logout  | Logout              |
| GET    | /api/auth/me      | Get current user    |

### Projects
| Method | Endpoint                            | Auth Required | Role   |
|--------|-------------------------------------|---------------|--------|
| GET    | /api/projects                       | ✅            | Any    |
| POST   | /api/projects                       | ✅            | Any    |
| GET    | /api/projects/:id                   | ✅            | Member |
| PUT    | /api/projects/:id                   | ✅            | Admin  |
| DELETE | /api/projects/:id                   | ✅            | Owner  |
| POST   | /api/projects/:id/members           | ✅            | Admin  |
| DELETE | /api/projects/:id/members/:userId   | ✅            | Admin  |

### Tasks
| Method | Endpoint                     | Auth Required | Role                       |
|--------|------------------------------|---------------|----------------------------|
| GET    | /api/projects/:id/tasks      | ✅            | Member                     |
| POST   | /api/projects/:id/tasks      | ✅            | Admin                      |
| PUT    | /api/tasks/:id               | ✅            | Member (status only), Admin|
| DELETE | /api/tasks/:id               | ✅            | Admin                      |

### Dashboard
| Method | Endpoint        | Description                |
|--------|-----------------|----------------------------|
| GET    | /api/dashboard  | Stats + my tasks + projects|

---

## ⚙️ Local Setup

### Prerequisites
- Node.js 18+
- PostgreSQL database

### Steps

```bash
# 1. Clone the repo
git clone <your-repo-url>
cd team-task-manager

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your DATABASE_URL and JWT_SECRET

# 4. Push schema to database
npx prisma db push

# 5. Seed demo data
npm run db:seed

# 6. Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🚂 Railway Deployment

1. Push code to GitHub
2. Create a new project on [Railway](https://railway.app)
3. Add a **PostgreSQL** plugin to your project
4. Link your GitHub repo
5. Set environment variables:
   - `DATABASE_URL` → copied from Railway Postgres plugin (auto-set)
   - `JWT_SECRET` → any long random string
6. Railway will auto-build and deploy via `railway.toml`

The `startCommand` in `railway.toml` runs migrations and seeds data automatically on first deploy.

---

## 📁 Project Structure

```
team-task-manager/
├── app/
│   ├── (auth)/           # Login & Signup pages
│   ├── (app)/            # Protected app pages
│   │   ├── dashboard/    # Dashboard page
│   │   └── projects/     # Projects list + detail
│   ├── api/              # All REST API routes
│   └── globals.css
├── components/           # Reusable UI components
├── lib/                  # Prisma client, auth helpers
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Demo data seeder
├── middleware.ts          # JWT route protection
└── railway.toml           # Deployment config
```

---

## 👤 Author

Built as part of a full-stack assignment submission.
