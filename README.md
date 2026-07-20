# DGCI Graduation Ceremony 2026
## Digital Graduation Companion

This platform is a luxury mobile-first web companion designed for guests attending the graduation ceremony. It is accessible by scanning a QR code and allows guests to track the schedule timeline, search student stage walk numbers, leave congratulations messages, and upload live snapshots from the seats.

The platform is designed to run in two modes:
1. **Local Demo Mode**: Works immediately without database configuration. All edits and moderation features run inside the browser's `localStorage` and read templates from the `/data` folder.
2. **Production Mode**: Connects to a Supabase database for live multi-user synchronization.

---

## 📂 Easy Editing Guide (No Code Required)

If you do not understand code, you can easily customize the site contents by editing simple text files or replacing files inside these specific folders:

### 1. Change Ceremony Details (Title, Date, Venue, Venue Map)
* Open the file: `data/ceremony-info.json`
* Change the values inside the quotes:
  ```json
  {
    "title": "DGCI Graduation Ceremony",
    "classYear": "2026",
    "date": "Sunday, July 26, 2026",
    "time": "6:00 PM",
    "venue": "The Glass House",
    "locationUrl": "https://maps.google.com/?q=The+Glass+House",
    "subtitle": "The Graduating Class of 2026 would like to invite you to their Graduation Ceremony",
    "closingMessage": "Your presence will honor this special milestone."
  }
  ```

### 2. Replace University / Ceremony Logos
* Go to the folder: `public/logos/`
* Replace the images inside with your own images. **Keep the exact same file names**:
  * `iae-logo.png`
  * `dgci-logo.png`
  * `ainshams-logo.png`

### 3. Replace Graduate Photos
* Go to the folder: `public/graduates/`
* Paste your student photos here. Rename them to match the student slugs, for example: `student-001.jpg`, `student-002.jpg`, or `youhanna-maher.jpg`.
* In `data/graduates.json`, ensure the `"photo"` property matches this path: e.g. `"/graduates/student-001.jpg"`.

### 4. Edit Graduates List and Walk Order
* Open the file: `data/graduates.json`
* You can add, edit, or delete students. Keep the JSON structure intact:
  ```json
  {
    "id": "youhanna-maher",
    "order": 1,
    "fullName": "Youhanna Maher",
    "displayName": "Youhanna",
    "photo": "/graduates/youhanna-maher.jpg",
    "quote": "Proud DGCI graduate, Class of 2026.",
    "linkedin": "https://linkedin.com",
    "instagram": "",
    "showProfile": true
  }
  ```
  *(Alternatively, use the CSV upload template inside the Admin Panel).*

### 5. Edit Ceremony Schedule/Program
* Open the file: `data/program.json`
* Change times, titles, and descriptions. Set `"isCurrent": true` for whichever event is currently happening to show a pulsing gold badge on the timeline.

---

## 👑 Admin Panel Guide

To manage the ceremony live from your laptop:
1. Go to: **`https://your-website.com/admin`** (or `http://localhost:3000/admin` on local dev).
2. Enter the administrator password (default is `admin2026`, or whatever you set in your Vercel Environment Variables).
3. **Features available:**
   * **Ceremony Info**: Instantly edit titles, date, and maps.
   * **Ceremony Program**: Add/edit schedule stages and toggle the "Now Happening" event.
   * **Graduates Wall**: Create profiles, upload walk numbers, download a CSV list, or upload a CSV file in bulk.
   * **Guest Messages**: Approve or reject greetings left by guests before they go live. Export messages as a CSV sheet.
   * **Guest Photos**: Moderate guest uploads. Approve clean photos to make them visible in the public gallery.
   * **Media Links**: Paste your final Google Drive photos folder or YouTube recap stream.

---

## 🚀 How to Deploy on Vercel (Step-by-Step)

### Step 1: Push Code to GitHub
1. Upload this folder to a repository on your GitHub account.

### Step 2: Create a Vercel Account & Import Project
1. Log in to [Vercel](https://vercel.com).
2. Click **Add New** > **Project**.
3. Import your GitHub repository.

### Step 3: Add Environment Variables
Before clicking Deploy, click on **Environment Variables** and add:
* `ADMIN_PASSWORD` = `set-your-secret-password-here`
* *(Optional)* `NEXT_PUBLIC_SUPABASE_URL` = `your-supabase-url`
* *(Optional)* `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `your-supabase-anon-key`

Click **Deploy**! Once deployment completes, Vercel will give you a public `.vercel.app` URL.

---

## ⚡ Supabase SQL Table Setup (For Live Sync)

If you connect a Supabase database, copy and paste the code from [supabase-schema.sql](file:///y:/Grad%202026%20web/supabase-schema.sql) into the **Supabase SQL Editor** and run it. This will automatically seed all default schedule data.
