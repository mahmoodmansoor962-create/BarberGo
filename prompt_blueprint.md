# BarberGo - Full Master Prompt

**Copy the text below and send it to the AI to build the application from scratch or continue development:**

***

**System Role:** You are an expert Full-Stack Developer and UI/UX Designer.
**Project Name:** BarberGo
**Objective:** Build a highly scalable, real-time, responsive Barber Booking Platform. It must support high traffic without double-booking and be extremely lightweight. 

### 1. Visual Aesthetics & UI
- **Theme:** "Luxurious Black & Gold" with a strictly "Box-based" (Pill-box) UI layout.
- **Navigation:** Floating bottom navigation bar.
- **Multilingual:** Built-in toggle to switch between Arabic and English instantly.

### 2. Client Experience (User Facing)
- **Home Page:** Features a sticky top search bar (Text & Voice Search enabled), and a 2-column grid displaying barber salon boxes. Incorporate location-based search capabilities.
- **Barber Profile Layout (Strict Order):** 
  1. Barber Photo & Bio.
  2. Services List (Name, Price, Duration) with "Book Now" buttons next to each.
  3. AI Smart Mirror (Allows users to try hairstyles via AR, snap a photo, and send it to the barber).
  4. Social & Contact Box (Location, WhatsApp, Call, Instagram, Facebook) + **Emergency Booking Button**.
  5. Content Tabs: Gallery (Images/Videos), Store (Products for sale), and Ratings/Reviews.
- **Booking Flow:** Users enter their full name, pick a date, and select an available time. Clients can cancel their booking *only* up to 1 hour before the exact appointment time.

### 3. Barber Dashboard
- **Authentication:** Private access code followed by Google OAuth Login.
- **Page 1 (Analytics):** Visual dashboard tracking daily/weekly booking volume, top products sold, and revenue.
- **Page 2 (Profile Setup):** Edit Bio, Social Media links, and contact numbers.
- **Page 3 (Store & Gallery):** Upload and manage store products (Image, Name, Price) and Gallery media.
- **Page 4 (Advanced Features):** Toggles to enable "House Call Services" and "Emergency/Immediate Bookings".
- **Page 5 (Services):** Add, edit, or delete haircut types and pricing.
- **Page 6 (Calendar/Time Management):** Flexible slot durations, define working hours, manual block/cancel slots, and overwrite bookings.

### 4. Admin (Master Dashboard)
- **Authentication:** Secure master password login followed by Google OAuth.
- **Analytics:** Complete platform overview (Total registered clients, active barbers, overall booking traffic, and load metrics).
- **Subscription Engine (30-Day Logic):** Tracks barbers' 30-day free trials. When a trial expires, the Admin receives an automated alert and can trigger a predefined, beautifully written subscription renewal message (options for monthly/yearly/multi-month plans).
- **Control Center:** Configure Bank Setup/Payment Gateways, resolve customer support tickets, and manually suspend or warn users/barbers.

### 5. Real-Time Notification Engine (Critical)
- **Zero Double-Bookings:** Robust database locking to ensure two clients cannot book the same slot simultaneously.
- **Booking Success:** Instant push notifications sent to both the Barber and the Client upon confirmation.
- **Smart Reminders:** Exactly 30 minutes before the appointment, the Client receives a push notification accompanied by an audible ring/vibration alert.
- **Cancellations:** If a Barber cancels, the Client receives an automated apology message.
- **Free Slot Broadcast:** If a booked slot opens up, an alert is broadcasted to all clients who follow or are interested in that Barber.

*Please build the UI, setup the Real-time Database schema (Firebase), and implement the core logic based on this exact blueprint.*
