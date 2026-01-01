-- Inovices Managment System Manager v2.0 - Database Schema
-- Based on Prisma Schema provided by user

-- 1. Users
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name VARCHAR(255),
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    role VARCHAR(50) DEFAULT 'EMPLOYEE',
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT users_role_check CHECK (role IN ('ADMIN', 'ACCOUNTANT', 'EMPLOYEE'))
);

-- 2. Delegates
CREATE TABLE IF NOT EXISTS delegates (
    id TEXT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. Customers
CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    notes TEXT,
    "userId" TEXT REFERENCES users(id) ON DELETE SET NULL,
    "delegateId" TEXT REFERENCES delegates(id) ON DELETE SET NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. Invoices
CREATE TABLE IF NOT EXISTS invoices (
    id TEXT PRIMARY KEY,
    "invoiceNumber" VARCHAR(255) UNIQUE NOT NULL,
    "customerId" TEXT NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    "totalAmount" DOUBLE PRECISION NOT NULL,
    "cashAmount" DOUBLE PRECISION NOT NULL,
    "chequeAmount" DOUBLE PRECISION NOT NULL,
    "invoiceDate" TIMESTAMP(3) NOT NULL,
    notes TEXT,
    status VARCHAR(50) DEFAULT 'UNPAID',
    "userId" TEXT REFERENCES users(id) ON DELETE SET NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT invoices_status_check CHECK (status IN ('UNPAID', 'PARTIALLY_PAID', 'PAID'))
);

-- 5. Payments
CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY,
    amount DOUBLE PRECISION NOT NULL,
    method VARCHAR(50) NOT NULL,
    date TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    "invoiceId" TEXT REFERENCES invoices(id) ON DELETE SET NULL,
    "customerId" TEXT NOT NULL REFERENCES customers(id) ON DELETE RESTRICT,
    "userId" TEXT REFERENCES users(id) ON DELETE SET NULL,
    "bankName" VARCHAR(255),
    "isException" BOOLEAN DEFAULT FALSE,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT payments_method_check CHECK (method IN ('CASH', 'CHEQUE', 'BANK_TRANSFER'))
);
