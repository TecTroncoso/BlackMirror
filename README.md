<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Black Mirror

Black Mirror is a futuristic, TV-inspired React application featuring a sleek, dark-themed OS interface. It provides interactive UI modules, a simulated streaming AI chat, and a system terminal log, all beautifully styled with modern web technologies.

## ✨ Features

- **Futuristic UI**: A premium dark-mode interface built with Tailwind CSS, featuring glassmorphism, dynamic animations, and flowing neon accents.
- **Simulated AI Assistant**: An interactive chat interface that mocks real-time streaming AI responses.
- **Dynamic Module System**: Toggle different "channels" or personas out of the box (e.g. Cinema, Dev Tools, Sports).
- **System Terminal**: A built-in terminal UI to display system logs and activities.

## 🛠️ Tech Stack

- **Framework:** React 19 (TypeScript)
- **Build Tool:** Vite
- **Styling:** Tailwind CSS (via CDN in `index.html`)
- **Icons:** Lucide React

## 🚀 Run Locally

**Prerequisites:**  Node.js (v18+ recommended)

1. Clone the repository:
   ```bash
   git clone https://github.com/TecTroncoso/BlackMirror.git
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

## 📂 Project Structure

- `App.tsx`: Main application container, view routing, and state management.
- `components/`: UI pieces like `NavBar`, `StatusCard`, `ModuleList`, and `Terminal`.
- `services/aiService.ts`: Mock AI streaming and connection service.
- `types.ts`: Core interfaces for Chat Messages, Logs, Modules, and App Views.
