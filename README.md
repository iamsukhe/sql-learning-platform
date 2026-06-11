# LeetDBMS - Interactive Database Learning Platform 📚💻

LeetDBMS is a premium, client-side interactive learning platform designed to help students master database management systems (DBMS) and SQL. Built with a cozy, book-inspired theme, it features comprehensive lecture note integration alongside hand-crafted practice exercises from LeetCode, HackerRank, and a dedicated Worker SQL database.

---

## 🌟 Key Features

*   **Cozy Book Aesthetic**: A gorgeous, reading-tailored sepia/warm dark mode styling, custom font selections, and micro-animations to enhance focused study sessions.
*   **Fully Interactive SQLite Sandbox**: Run, test, and submit query code entirely inside the browser. Powered by standard `sql.js` (WebAssembly version) for safe, zero-latency query execution.
*   **Multi-Document PDF Reader Deck**: Swaps dynamically between two text materials inside the Lecture Notes dashboard:
    *   *Class Textbook (Full Notes)*
    *   *50 SQL Practice Queries (by Code Help)*
*   **Comprehensive Practice Syllabus**: Over 100 hands-on practice problems grouped systematically into 18 chapters:
    *   **Chapters 1–10**: Fundamentals (Select, filters, aggregation, joins, sets, views, and DML).
    *   **Chapter 11**: Worker Database Practice Problems (50 progressive drills).
    *   **Chapters 12–13**: LeetCode SQL Practice Problems (16 standard challenges adapted for SQLite sandbox).
    *   **Chapters 14–18**: HackerRank SQL Practice Problems (52 classic challenges covering Basic Select, Advanced Select, Aggregations, Basic Join, and Advanced Join).
*   **Attribution Disclaimers**: Integrated credit attributions to Code Help inside both the sidebar footer and the notes reading panels.
*   **Robust Query Evaluation**: Instantly verifies queries, compares column headers, prints schema designs, runs customized validation test suites, and tracks individual progress using progress persistence in `localStorage`.

---

## 🛠️ Tech Stack

*   **Framework**: [Next.js](https://nextjs.org/) (React & App Router).
*   **Styling**: Custom CSS variables, responsive flexbox/grid layouts, and TailwindCSS utilities.
*   **Database Engine**: Client-side SQLite compiler running via [`sql.js`](https://github.com/sql-js/sql.js/) WASM.
*   **Components & Icons**: Lucide React icons, customized PDF canvas renders.

---

## 📂 Syllabus Outline

### Part 1: SQL Basics & Core Operations
*   **Chapter 1**: Introduction to SELECT (Literals, aliases, and expressions)
*   **Chapter 2**: Filtering with WHERE (Comparison, BETWEEN, IN, and LIKE patterns)
*   **Chapter 3**: Sorting Results (ORDER BY ascending/descending)
*   **Chapter 4**: Basic Aggregation (COUNT, SUM, AVG, MIN, MAX ranges)
*   **Chapter 5**: Grouping Rows (GROUP BY summaries & HAVING filters)
*   **Chapter 6**: Uniqueness (DISTINCT operators)
*   **Chapter 7**: Data Definition (CREATE & ALTER table schemas)
*   **Chapter 8**: Data Manipulation (INSERT, UPDATE, DELETE rows)
*   **Chapter 9**: Standard Joins (INNER, LEFT, emulated FULL OUTER, CROSS, and self-joins)
*   **Chapter 10**: Advanced Queries (Subqueries, correlated queries, and views)

### Part 2: Hands-on Practice Sets
*   **Chapter 11**: Worker Database Practice (50 classic queries targeting worker-bonus-title relational tables)
*   **Chapter 12**: LeetCode SQL Practice - Part 1 (Questions 1–8)
*   **Chapter 13**: LeetCode SQL Practice - Part 2 (Questions 9–16)
*   **Chapter 14**: HackerRank Basic Select (Q1–Q20)
*   **Chapter 15**: HackerRank Advanced Select (Q1–Q5)
*   **Chapter 16**: HackerRank Aggregations (Q1–Q17)
*   **Chapter 17**: HackerRank Basic Join (Q1–Q8)
*   **Chapter 18**: HackerRank Advanced Join (Q1–Q2)

---

## 🚀 Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) installed (v18+ recommended).

### Installation

1. Clone or navigate into the directory:
   ```bash
   cd sql-learning
   ```

2. Install the node packages:
   ```bash
   npm install
   ```

3. Run the hot-reloading development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) inside your browser.

### Verification and Building

Validate TypeScript cleanliness and prepare production bundles:
```bash
# Check code syntax & formatting
npm run lint

# Compile next.js build output
npm run build
```

---

## 💡 Acknowledgements

Special thanks to **Code Help** (visit [https://www.codehelp.in/](https://www.codehelp.in/) for their educational catalog) for the textbook lectures and 50 SQL queries practice notes integrated for student learning purposes.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
