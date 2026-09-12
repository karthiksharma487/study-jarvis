# Study Jarvis

A unified academic operating system for serious students preparing for competitive exams and academics.

## Features

- **Dashboard**: Unified command center showing today's tasks, progress, and next actions
- **Course Management**: Organize courses, subjects, chapters, and lectures
- **Backlog Tracking**: Manage learning backlog with Phase-based progression
- **Study Planning**: Daily/weekly planner with study blocks and sessions
- **Progress Tracking**: Unified progress system across all academic activities
- **Practice & Revision**: Track practice sessions, accuracy, and revision due dates
- **Tests & Analytics**: Log tests, analyze performance, track mistakes
- **Calendar & Schedule**: Visualize academic events and deadlines
- **Quick Entry**: Fast logging of lectures, tasks, and study sessions
- **Search & Command Palette**: Professional productivity shortcuts

## Tech Stack

- **Frontend**: React 18 + Vite
- **State Management**: Zustand
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **Routing**: React Router v6
- **Date Utilities**: date-fns

## Getting Started

```bash
npm install
npm run dev
```

The application will open at `http://localhost:5173`

## Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Page components for routing
├── store/              # Zustand state management
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── types/              # TypeScript type definitions
├── App.jsx             # Main app component
└── main.jsx            # Entry point
```

## Building

```bash
npm run build
npm run preview
```

## License

MIT
