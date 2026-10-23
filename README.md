# CebuQueue

Smart queue and appointment system for barangay health centers and clinics.
Stack: MySQL + Node.js/Express (API) + React/Vite (web app).

## Setup (3 steps)

**1. Database**
```
mysql -u root -p < database/schema.sql
```

**2. API** (runs on http://localhost:4000)
```
cd server
cp .env.example .env      # then edit DB_PASSWORD and JWT_SECRET
npm install
npm run seed              # creates the admin login from ADMIN_EMAIL / ADMIN_PASSWORD
npm run dev
```
Needs Node.js 20.6 or newer (uses `--env-file`).

**3. Web app** (runs on http://localhost:5173)
```
cd client
npm install
npm run dev
```

## Roles and what they can do
- **Patient** (self-registers): get a queue number, track position and estimated wait, cancel.
- **Staff** (created by admin): call next patient, mark done / no-show, add walk-ins, register patients.
- **Admin**: everything staff can do, plus reports, services, and staff accounts.
- **Anyone**: the "Now serving" board at `/board` (put it on a TV in the waiting area).

## How the queue works
- Ticket numbers restart each day, per service (CHK001, CHK002, ...).
- Order of service: urgent, then priority lane (senior / PWD / pregnant), then regular, then by ticket number.
- "Call next" finishes the patient currently being served and calls the next one.
- Estimated wait = (people ahead + people being served) x the service's minutes per patient.

## SMS
`server/src/sms.js` logs every message to the `sms_log` table and the console. Patients get a text when
they are called and when 2 people are ahead of them. To send real texts, add your SMS gateway's API call
where the TODO is.

## Not built yet (good next steps)
- Offline mode for staff screens that syncs when the connection returns
- Real SMS gateway
- Appointment time slots (right now a booking is a queue number for a chosen date)
- Password reset, audit log, export reports to CSV/PDF
## Current milestone: User Registration & User Login

This release delivers two modules:

**User Registration**
- Server: `POST /api/auth/register` in `server/src/routes/auth.js`
- Client: `client/src/pages/Register.jsx`
- DB: `users` table in `database/schema.sql`
- Validation: duplicate email rejected, password hashed (bcrypt)

**User Login**
- Server: `POST /api/auth/login` in `server/src/routes/auth.js`
- Client: `client/src/pages/Login.jsx`
- Issues a JWT signed with `JWT_SECRET` (see `server/.env.example`)
- Token verified in `server/src/middleware/auth.js`

To test these two modules: register a new account, log out, log back in with the same credentials, and confirm the JWT is returned. Queue, SMS, and admin dashboard features are out of scope for this milestone.

---
