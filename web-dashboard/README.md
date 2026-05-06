# Context-Aware System Design Recommendation Platform

A production-ready Next.js frontend for a decision support system that recommends software architecture and design choices by jointly analyzing application requirements and developer productivity context.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Navigate to the project directory:
   ```bash
   cd apps/next-web/system-design-webapp
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🛠 Tech Stack

- **Framework**: Next.js 15+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4 (Custom Design Tokens)
- **State Management**: Zustand (with Persistence)
- **Animations**: Framer Motion
- **Form Handling**: React Hook Form
- **Validation**: Zod
- **Icons**: Lucide React

## 🏗 Architecture

The project follows a modular, atomic-inspired architecture with clear separation of concerns:

- `src/app`: Next.js App Router pages and layouts.
- `src/components/PipelineTraceViewer.tsx`: High-fidelity horizontal flow chart for real-time process visualization.
- `src/components/views`: Complex, page-specific feature views (Recommendations, Benchmark, History).
- `src/components/ui`: Base primitive components built with Tailwind 4.
- `src/components/shared`: Reusable layout components (Navbar, Footer).
- `src/store`: Zustand stores for global state (Persisted).
- `src/types`: TypeScript interfaces and Zod schemas.
- `src/lib`: Utility functions and API clients.

## ✨ Key Features

- **Agentic Observability**: Real-time visualization of the recommendation pipeline using animated nodes and SignalR streaming.
- **Quantitative Benchmarking**: Side-by-side comparison of AI designs against expert baselines with Radar Chart overlays.
- **Active Feedback Widget**: Interactive interface for rating and correcting architectural decisions.
- **High-Fidelity Dashboard**: Modern SaaS aesthetic with glassmorphism, Framer Motion animations, and dark mode support.
- **Knowledge Base Explorer**: Browsable gallery of 40+ industry scenarios and their multi-dimensional ground truths.

## 📄 License

MIT
