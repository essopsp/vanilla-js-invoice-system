---
description: How to run the Inovices Managment System Manager v2.0
---

To run the project locally, follow these steps:

### 1. Prerequisites
- **Node.js**: Ensure you have Node.js installed.
- **PostgreSQL**: A running PostgreSQL database instance.

### 2. Environment Setup
The project uses a `.env` file for configuration. Ensure yours looks like this:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/your_db_name
PORT=3000
NODE_ENV=development
```

### 3. Installation
Install the necessary dependencies:
```bash
npm install
```

### 4. Database Initialization
Run the schema initialization script to create the necessary tables (Users, Customers, Invoices, Receipts):
```bash
node server/init-db.js
```

### 5. Start the Server
Run the development server. This will serve the frontend and the API:
```bash
npm run dev
```

### 6. Access the App
Open your browser and navigate to:
`http://localhost:3000`

---
**Note**: Since this is a Vanilla JS SPA, the frontend is served directly by the Express server. Any changes to the `.js` files will be reflected upon refreshing the browser.
