# Invoice Management System

A robust, full-stack Invoice Management System built entirely with **Vanilla JavaScript** (Web Components) and **Node.js**, demonstrating that modern, scalable web applications can be built without heavy client-side frameworks like React, Vue, or Angular.

## 🚀 Features

*   **Zero Dependencies Frontend**: Built using native Web Components (`HTMLElement`), Shadow DOM, and Vanilla CSS.
*   **Dynamic SPA Routing**: Custom client-side router without any external library.
*   **State Management**: Simple, reactive state management implementation from scratch.
*   **Full Invoice Cycle**: Create invoices, manage customers, and track dynamic split debts (Cash vs Cheque).
*   **Payment Tracking**: Record partial payments, handle exceptions, and auto-calculate remaining balances.
*   **Real-time Reports**: Generate Statement of Account (SOA), Daily Performance, and Delegate Debt reports.
*   **PostgreSQL Backend**: Robust relational data model with raw SQL queries for maximum control and performance.

## 🛠️ Tech Stack

### Frontend
*   **Languages**: HTML5, CSS3, ES6+ JavaScript
*   **Architecture**: Web Components, Custom Elements
*   **Styling**: Vanilla CSS (Utility-first approach similar to Tailwind, but hand-written or minimal external dependency)

### Backend
*   **Runtime**: Node.js
*   **Framework**: Express.js
*   **Database**: PostgreSQL
*   **Driver**: `pg` (node-postgres)

## 📦 Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/invoice-management-vanilla.git
    cd invoice-management-vanilla
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Create a `.env` file in the root directory:
    ```env
    PORT=3000
    DATABASE_URL=postgresql://user:password@localhost:5432/invoice_db
    JWT_SECRET=your_secret_key
    ```

4.  **Database Migration**
    Initialize the database schema:
    ```bash
    # Ensure you have a running Postgres instance
    npm run init-db
    ```

5.  **Run the Application**
    ```bash
    # Development mode
    npm run dev
    
    # Start server
    npm start
    ```

## 🏗️ Project Structure

```
├── src/
│   ├── components/     # Reusable Web Components (ui-table, ui-dialog, etc.)
│   ├── pages/          # Page-level components (invoices, customers, reports)
│   ├── services/       # API clients and business logic
│   ├── router.js       # Custom vanilla router
│   └── app.js          # Main application entry point
├── server/
│   ├── controllers/    # Request handlers
│   ├── services/       # Business logic layer
│   ├── routes/         # API route definitions
│   └── config/         # Database and app config
└── package.json
```

## 💡 Why Vanilla JS?

This project proves that:
1.  **Performance**: No virtual DOM overhead or massive bundle sizes.
2.  **Simplicity**: Direct interaction with the DOM using standard APIs.
3.  **Longevity**: Standards-based code that won't become obsolete with the next framework update.
4.  **Learning**: Deep understanding of how browsers and JavaScript actually work.

## 📄 License

MIT
