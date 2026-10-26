# TMS Mobile App (React Native & Expo) 🚀

This project now includes a **React Native (Expo)** mobile application located in the [`mobile/`](file:///d:/3rd_Sem/TMS-APP/mobile) directory. It connects directly to your existing Node.js & MongoDB backend.

---

## 📱 Features Included in the Mobile App

1. **Authentication & Roles**:
   - JWT token authentication persisted via `@react-native-async-storage/async-storage`.
   - Role-based interface for **SuperAdmin**, **Staff/Technicians**, and **Users**.

2. **Dashboard / Home**:
   - Real-time statistics counters (Total, Pending, Assigned, In-Progress, On Hold, Resolved).
   - Tap any stat card to view filtered complaints.
   - Quick navigation shortcuts.

3. **Raise Complaint Ticket (`NewComplaintScreen`)**:
   - Dynamic cascading dropdowns: **Department** ➔ **Block** ➔ **Room**.
   - Custom room number input option.
   - Complaint category selection chips (PC Hardware, PC Software, Network, Electronics, Plumbing, etc.).
   - Issue description / remarks.
   - **Camera & Gallery Photo Attachment** using `expo-image-picker`.

4. **My Complaints (`MyComplaintsScreen`)**:
   - Status filters (`All`, `Pending`, `Assigned`, `In-Progress`, `Onhold`, `Closed`).
   - Search bar by keyword, block, room, or issue.
   - Tap any card to open the **Complaint Details Modal**.
   - View photo attachment and change ticket progress status.

5. **All Complaints - Staff & Admin Hub (`AllComplaintsScreen`)**:
   - Assign / Reassign technicians and staff to complaint tickets.
   - Update complaint lifecycle status with one tap.

6. **Reports & Analytics (`ReportsScreen`)**:
   - Filter complaints by Department, Programme, Category, Status, and Assignee.
   - Visual metrics and filtered record lists.

7. **Masters Directory (`MastersScreen` & `MasterListScreen`)**:
   - Complete CRUD management for **Departments**, **Programmes**, **Blocks**, **Rooms**, **Roles**, and **Users**.

8. **Server IP Configurator (`ServerConfigModal` & `ProfileScreen`)**:
   - Built-in network switcher to change the backend API IP address directly inside the app without editing code!
   - Built-in live connection tester.

---

## 🏃 How to Run the Mobile App

### Step 1: Start the Backend Server
Make sure MongoDB and your Express backend are running:
```bash
cd backend
npm run dev
```
*(Backend runs on `http://localhost:5000`)*

---

### Step 2: Start the Expo Mobile App

Open a new terminal in the project root:
```bash
npm run mobile
```
*Or:*
```bash
cd mobile
npx expo start
```

---

### Step 3: View on your Mobile Device or Emulator

#### Option A: Real Mobile Phone (Android or iPhone) - **Recommended**
1. Install **Expo Go** from Google Play Store or Apple App Store.
2. Connect your mobile phone to the **same Wi-Fi network** as your computer.
3. Scan the QR code shown in the terminal:
   - **Android**: Scan with the Expo Go app.
   - **iOS**: Scan with the default Camera app.
4. The app will load onto your phone!

#### Option B: Android Emulator
Press `a` in the Expo terminal or run:
```bash
npm run mobile:android
```

#### Option C: Web Browser
Press `w` in the Expo terminal or run:
```bash
npm run mobile:web
```

---

## ⚙️ Backend Server Connection Configuration

By default, the mobile app is configured to connect to your PC's Wi-Fi IP address:
```
http://192.168.209.9:5000/api
```

If your Wi-Fi network changes or you need to switch:
1. Tap the **Server Pill** on the Login screen or go to **Profile ➔ Change Server Address**.
2. Select a quick preset or type your computer's new IP address.
3. Tap **Test Connection** to confirm connectivity, then tap **Save & Apply**.
