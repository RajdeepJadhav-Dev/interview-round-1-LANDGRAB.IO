# 🏰 Landgrab.io

**Landgrab.io** is a real-time multiplayer territory capture game built with modern web technologies. Players compete on a shared grid to capture tiles, climb the leaderboard, and dominate the map in fast-paced rounds.

🔗 **Live Demo:** [https://landgrabio-frontend.onrender.com](https://landgrabio-frontend.onrender.com)

---
## ScreenShots:
<img width="1917" height="932" alt="image" src="https://github.com/user-attachments/assets/1b47081d-7b62-4eb4-acab-f7bcac1468d0" />

## ✨ Key Features

* **Real-time Multiplayer Gameplay**
  Seamless, low-latency interactions powered by WebSockets.

* **Infinite Grid Landing Experience**
  Interactive scrolling grid with a dynamic flashlight effect for an engaging first impression.

* **Live Game State Synchronization**
  Instant updates for territory ownership, leaderboard rankings, and round timers.

* **Modern, Polished UI**
  Dark-themed interface built with Tailwind CSS, Shadcn-inspired components, and smooth Framer Motion animations.

* **Fully Responsive Design**
  Optimized for both desktop and mobile gameplay.

---

## 🧱 Tech Stack

### Frontend

* **React (Vite)** – Fast development and optimized builds
* **Tailwind CSS** – Utility-first styling
* **Framer Motion** – Animations and transitions
* **Socket.io Client** – Real-time communication
* **Zustand** – Lightweight global state management
* **Lucide React** – Icon system

### Backend

* **Node.js** – Server runtime
* **Express** – API and server setup
* **Socket.io** – WebSocket-based real-time engine
* **CORS** – Cross-origin request handling

---

## 🚀 Getting Started

### Prerequisites

* Node.js **v18+** (recommended)
* npm

---

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/landgrab-io.git
   cd landgrab-io
   ```

2. **Install frontend dependencies**

   ```bash
   cd frontend
   npm install
   # Requires Node 20.19+ or 22.12+ for Vite 6
   ```

3. **Install backend dependencies**

   ```bash
   cd ../backend
   npm install
   ```

---

### Running Locally

1. **Start the backend server**

   ```bash
   cd backend
   node index.js
   # Server runs on http://localhost:3000
   ```

2. **Start the frontend client**

   ```bash
   cd frontend
   npm run dev
   # Client runs on http://localhost:5173
   ```

3. Open **[http://localhost:5173](http://localhost:5173)** in your browser.

---

## 🌍 Deployment

* **Frontend:** Render
  [https://landgrabio-frontend.onrender.com](https://landgrabio-frontend.onrender.com)

* **Backend:** Render
  [https://landgrab-backend.onrender.com](https://landgrab-backend.onrender.com)

### Switching Backend Environments

Update the Socket.io endpoint in:
`frontend/src/services/socketService.js`

```js
// Local development
this.socket = io('http://localhost:3000');

// Production
this.socket = io('https://landgrab-backend.onrender.com/');
```

---

## 🎮 How to Play

1. Open the landing page and click **Start Playing**.
2. Capture adjacent tiles to expand your territory.
3. Monitor the round timer — each round lasts **10 minutes**.
4. The game ends when time runs out or a player reaches **1000 tiles**.
5. The player with the highest tile count wins.

---

## 📌 Project Highlights

* Designed for scalability with real-time state synchronization
* Clean separation of frontend and backend architecture
* Focus on performance, responsiveness, and user experience

---

## 📄 License

This project is open-source and available under the **MIT License**.

---

If you’re a recruiter or developer reviewing this project: feedback and contributions are welcome!
