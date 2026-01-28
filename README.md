# MotoFit Garage App

A modern, full-stack workshop management system.

## Features
- **Dashboard**: Real-time analytics and widget-based overview.
- **Lead Management**: Kanban board and list view for sales leads.
- **Job Management**: Complete job card lifecycle.
- **Integrated Accounting**: Invoicing, payments, and estimates.
- **Security**: IP Whitelisting and Role-Based Access.
- **Cross-Platform**: Web, Tablet, and Mobile responsive.

## Tech Stack
- **Frontend**: React, Vite, Tailwind CSS, Framer Motion.
- **Backend**: Node.js, Express, TiDB (MySQL), Parse Server.
- **Deployment**: Vercel-ready (Serverless) or Self-Hosted.

## Getting Started

### Prerequisites
- Node.js 18+
- Git

### Installation
1.  Clone the repository.
    ```bash
    git clone https://github.com/your-username/motofit-garage-app.git
    ```
2.  Install dependencies.
    ```bash
    cd backend && npm install
    cd ../frontend && npm install
    ```
3.  Set up environment strings in `.env` (Backend).

### Running Locally
```bash
# Terminal 1 (Backend)
cd backend && npm run dev

# Terminal 2 (Frontend)
cd frontend && npm run dev
```

## Deployment
See [DEPLOY.md](DEPLOY.md) for production deployment instructions.
