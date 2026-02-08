# EventFlow

## Project Overview
EventFlow is a full‑stack event management platform built with Node.js and Express. It provides user authentication, event creation for organizers, ticket registration, favorites, and a responsive frontend with featured events and a calendar.

## Setup and Installation Instructions
1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a `.env` file in the project root with:
   ```
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   EMAIL_USER=your_email_for_smtp
   EMAIL_PASS=your_email_password_or_app_password
   TICKETMASTER_KEY=your_ticketmaster_api_key
   EVENTBRITE_TOKEN=your_eventbrite_token
   EVENTBRITE_ORG_ID=your_eventbrite_org_id
   ```
3. Run the server:
   ```bash
   npm run dev
   ```

## API Documentation
Auth
1. `POST /api/auth/register` — Public
2. `POST /api/auth/login` — Public

Events
1. `GET /api/events` — Public
2. `GET /api/events/:id` — Public
3. `POST /api/events` — Organizer/Admin
4. `POST /api/events/:id/register` — Authenticated
5. `DELETE /api/events/:id/register` — Authenticated
6. `DELETE /api/events/:id` — Organizer/Admin + Owner

Users
1. `GET /api/users/profile` — Authenticated
2. `GET /api/users/my-events` — Authenticated
3. `GET /api/users/created-events` — Authenticated
4. `POST /api/users/favorites/:id` — Authenticated
5. `DELETE /api/users/favorites/:id` — Authenticated
6. `GET /api/users/favorites` — Authenticated

External APIs
1. `GET /api/external/ticketmaster` — Public
2. `POST /api/external/ticketmaster/import` — Organizer/Admin
3. `GET /api/external/eventbrite` — Public

Contact
1. `POST /api/contact` — Public
