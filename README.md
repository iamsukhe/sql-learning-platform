# DBMS Notes & SQL Learning Platform

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![SQLite Wasm](https://img.shields.io/badge/SQLite-Wasm-blue?style=flat-square&logo=sqlite)](https://github.com/sql-js/sql.js)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.org)
[![Vercel Deployment](https://img.shields.io/badge/Vercel-Deployment-black?style=flat-square&logo=vercel)](https://dbms-quest.vercel.app/)

An interactive, premium, client-side learning platform designed for **DBMS Notes** and **SQL Learning**. Practice database schemas, SQL queries, aggregate operations, normalization, and query optimization directly in your browser. Powered by client-side SQLite (via `sql.js` WebAssembly) with real-time evaluation and zero server round-trips.

**Live Platform**: [https://dbms-quest.vercel.app/](https://dbms-quest.vercel.app/)

---

## Key Features

*   **Zero-Latency SQL Sandbox**: Run and verify `SELECT`, `INSERT`, `UPDATE`, and `DELETE` queries instantly inside your browser.
*   **Comprehensive DBMS Syllabus**: Over 20 structured chapters spanning database theory, architecture models, and practice projects.
*   **Integrated Lecture Notes & Cheatsheets**: Access complete PDF guides (e.g., *50 SQL Queries*, *Full Database Notes*, *SQL Cheatsheet*) directly inside the application interface.
*   **Custom SQL Engines**: Native support for regular expressions (`REGEXP` filter) matching using custom Javascript extensions for SQLite.
*   **Premium UI/UX**: Built-in adjustable split-panes, draggable query layout, terminal error output, and fully persistent lesson progress.
*   **Privacy First**: All progress, solved states, and run history are saved directly to your browser's `localStorage` (fully backwards-compatible).

---

## DBMS & SQL Learning Curriculum

The platform covers an extensive educational roadmap from fundamentals to advanced database topics:

### 1. Database Architecture & Theory
*   **DBMS Basics**: Data vs Information, advantages over flat-file systems.
*   **Three-Schema Architecture**: Logical vs Physical data independence, External/View schema levels.
*   **Database Languages**: DDL (Data Definition Language) and DML (Data Manipulation Language).
*   **Application Tiers**: 1-Tier, 2-Tier, and 3-Tier database system architectures.

### 2. SQL Basics & Data Operations
*   **CRUD Operations**: Inserting rows (`INSERT INTO`), Updating (`UPDATE`), and Deleting (`DELETE FROM`) tables.
*   **Basic Queries**: Projection (`SELECT`), deduplication (`DISTINCT`), and selection (`WHERE` filtering).
*   **Comparison & Wildcards**: SQL comparison operators (`=`, `!=`, `>`, `<`, etc.), string patterns (`LIKE '%substring%'`), and regular expression patterns (`REGEXP`).

### 3. Aggregations & Query Structures
*   **Aggregate Functions**: `COUNT()`, `SUM()`, `AVG()`, `MIN()`, `MAX()`, and rounding values with `ROUND()`.
*   **Grouping & Filtering**: `GROUP BY` groupings and conditional group evaluations with `HAVING`.
*   **Sorting & Boundaries**: Sorting outputs (`ORDER BY`), limiting records (`LIMIT`), and handling `NULL` values.

### 4. Advanced Database Design & Operations
*   **Table Joins**: Querying across tables using `INNER JOIN`, `LEFT JOIN`, `RIGHT JOIN`, and `CROSS JOIN`.
*   **Set Operations & Subqueries**: Combining queries with `UNION`, `INTERSECT`, `EXCEPT`, and nesting database searches.
*   **Transactions & ACID**: Atomic operations, Consistency, Isolation, and Durability controls.
*   **Database Normalization**: Cleaning designs into First Normal Form (1NF), Second (2NF), Third (3NF), and Boyce-Codd Normal Form (BCNF).
*   **Database Indexing**: Tuning query performance, `SCAN TABLE` vs `SEARCH TABLE USING INDEX` execution plans.
*   **NoSQL Databases & Distributed Systems**: Graph models, document structures, and distributed database optimization.
*   **Window Functions**: Advanced analytical ordering using `ROW_NUMBER()`, `RANK()`, and `DENSE_RANK()`.

---

## Getting Started Locally

### Prerequisites

Ensure you have [Node.js](https://nodejs.org) installed on your system.

### Installation

```bash
# Clone the repository
git clone https://github.com/iamsukhe/sql-learning.git
cd sql-learning

# Install dependencies
npm install

# Start the local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

### Build & Production Deployment

```bash
# Build the production optimized Next.js bundle
npm run build

# Start the production server
npm run start
```

---

## License

This project is licensed under the [MIT License](LICENSE).
