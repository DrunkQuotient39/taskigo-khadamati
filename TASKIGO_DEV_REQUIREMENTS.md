You are a full-stack developer working on the Taskigo (Khadamati) service marketplace.
Your task is to fix broken features, add missing modules, and prepare the app for testing.
Follow these requirements carefully:

🌍 Language & UI

Arabic should only appear in headers/titles.

All other text remains in English for now.

Ensure bilingual support is wired correctly.

🔑 Authentication

Fix sign-in bug: after successful login, the UI must show the user’s logged-in state (hide “login/sign up” buttons, show profile/logout instead).

Create an admin login with hardcoded credentials:

Email: taskigo.khadamati@gmail.com

Password: Taskigo@12345A

When these credentials are used, load the Admin Panel automatically.

🛠️ Admin Panel

Build an Admin Panel dashboard accessible only with the above credentials.

Features:

View all users, providers, and bookings.

Approve/reject provider applications.

Approve/reject new service listings.

See test analytics (bookings, services, active users).

📦 Services & Providers

Services page is currently empty → add sample services (cleaning, AC repair, delivery, events, etc.) with fake data so booking & analytics can be tested.

Enable provider sign-up:

Providers should be able to upload random images and details.

When submitted, an admin notification must appear in the Admin Panel to approve or reject.

📅 Booking Flow

Add a test booking system:

Users can book any of the test services.

Store booking status (pending → accepted → completed → cancelled).

Show booking history in the user dashboard.

Add dummy analytics to track number of bookings per service.

💬 AI Chat

The AI chat is currently just an empty chatbot.

Integrate a working placeholder AI:

It must be able to respond instantly (no long delay).

Load a set of sample services into its context so it can answer questions like:

“What’s the cheapest cleaning service?”

“Show me AC repair in Beirut.”

For now, keep it simple (no external API) but make sure the chat flow works.

💳 Payments

Set up dummy payments:

Show Apple Pay & Stripe options, but don’t process real transactions.

Store payment status as paid/unpaid/refunded in the DB.

⚙️ Configuration

Ensure Firebase and Neon DB are correctly configured (env variables loaded from .env).

Test authentication, storage, and DB queries end-to-end.

✅ Final Requirements

Provide dummy/test data for services, providers, and bookings so the platform can be fully tested without real users.

Ensure both user-facing flow and admin flow are functional.

Keep the code modular and production-ready.