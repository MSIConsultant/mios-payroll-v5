# MIOS Payroll

MIOS Payroll is a high-end, multi-tenant tax and payroll management system designed for accountants and tax consultants. 

## 🚀 Deployment & Setup Guide

### 1. Supabase Infrastructure
MIOS Payroll uses Supabase for Authentication (Email/Password) and PostgreSQL storage.

#### Database Provisioning
Run the SQL DDL provided in the **Dashboard** within your Supabase SQL Editor. This will create the `companies`, `employees`, and `payroll_runs` tables with Row Level Security (RLS) enabled.

#### URL Configuration (Crucial for Auth)
To fix "localhost" redirect issues on Vercel:
1. Go to **Authentication -> URL Configuration**.
2. **Site URL**: `https://your-app-name.vercel.app`
3. **Redirect URIs**: `https://your-app-name.vercel.app/auth/callback`

### 2. Environment Variables
Add these to your **Vercel Project Settings -> Environment Variables**:

| Variable | Source |
|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard > Settings > API > Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard > Settings > API > `anon` `public` key |

*Note: Use your newly provided Publishable API Key `sb_publishable_...` for the `NEXT_PUBLIC_SUPABASE_ANON_KEY` if you are using the newest Supabase architecture.*

## 🏗️ Architecture

- **Auth**: Supabase Auth (SSR) with PKCE flow.
- **Database**: PostgreSQL with multi-tenant RLS (User -> Companies -> Employees).
- **Engine**: Ported 2026 Indonesian Tax Logic (PPh 21 TER).
- **UI**: Brutalist Gold-on-Black aesthetic for a premium professional feel.

## 🛠️ Usage
1. **Manage Companies**: First, register your client companies in the "Companies" tab.
2. **Add Employees**: Assign employees to their respective companies.
3. **Run Payroll**: Calculate monthly payroll for a specific company or all clients at once.
4. **Save & Export**: Download the results as a CSV for your records or save the Run directly to your Supabase database.

## 🔄 GitHub + Vercel + Supabase Workflow (Best Practices)

Since your project is living in GitHub and deployed to Vercel, this is the optimal way to manage your app moving forward:

### 1. Local Development
- Clone the repository from GitHub to your local machine.
- To test locally, you need the same environment variables. Copy your Vercel/Supabase variables into a `.env.local` file at the root of your project:
  ```env
  NEXT_PUBLIC_SUPABASE_URL=your-project-url
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
  ```
- Run `npm install` and then `npm run dev` to test changes locally.

### 2. Pushing Changes
- Whenever you make changes locally (or through an AI tool connecting to your repo), commit and push them to the `main` branch (or via a PR).
- Vercel is connected to your GitHub repo. It will automatically detect pushes to `main` and trigger a **Production Build**.
- Vercel handles all the DNS and serving, meaning your app will update continuously within a few minutes of pushing.

### 3. Database Changes (Supabase migrations)
- If you ever need to change the database schema (like adding a new column to `employees`), **do it in the Supabase SQL Editor** directly if you are moving fast, OR use Supabase CLI to generate migrations locally.
- For this app, simply running `ALTER TABLE` commands in the Supabase SQL editor is the easiest way. If you do that, remember to also update your `lib/supabase/types.ts` file in the codebase and push to GitHub!

### 4. Backups and Security
- **Never expose your Service Role Key** into `NEXT_PUBLIC_...` variables. Use the `anon` key.
- Supabase has built-in database backups (Pro plan), but for the free tier, occasionally export your Supabase tables to CSV as a backup.
