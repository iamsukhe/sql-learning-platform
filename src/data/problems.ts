export interface TableColumn {
  name: string;
  type: string;
  key?: 'PK' | 'FK';
  references?: string; // e.g. "Employee.id"
}

export interface TableSchema {
  name: string;
  columns: TableColumn[];
}

export interface Problem {
  id: string;
  title: string;
  type: 'coding' | 'mcq';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  
  // For coding questions
  schema?: TableSchema[];
  seedSql?: string;
  expectedQuery?: string;
  defaultCode?: string;
  ordered?: boolean;
  testCases?: {
    name: string;
    seedSql: string;
  }[];

  // For MCQ questions
  question?: string;
  options?: string[];
  correctOptionIndex?: number;
  explanation?: string;
}

export interface Chapter {
  id: string;
  title: string;
  lessons: Problem[];
}

export const chapters: Chapter[] = [
  {
    id: 'ch1-intro',
    title: 'Chapter 1: Introduction',
    lessons: [
      {
        id: 'l1-welcome',
        title: 'L1: Welcome to Learn SQL',
        type: 'coding',
        difficulty: 'Easy',
        description: `SQL (Structured Query Language) is used to communicate with databases. The most basic command is \`SELECT\`, which lets you query and retrieve data.

You can select literal values (like text or numbers) directly without even referencing a table!
For example:
\`SELECT 'Hello' AS message;\`

**Your Task:**
Write a SQL query that selects the text \`'Welcome to SQL!'\` and names the result column \`greeting\`.`,
        schema: [],
        seedSql: `-- No tables needed`,
        expectedQuery: `SELECT 'Welcome to SQL!' AS greeting;`,
        defaultCode: `-- Write your SELECT query below\nSELECT `,
        ordered: false,
        testCases: [{ name: 'Default Run', seedSql: `-- No tables` }]
      },
      {
        id: 'l2-select-single',
        title: 'L2: Select Single Column',
        type: 'coding',
        difficulty: 'Easy',
        description: `To retrieve data from a table, we use \`SELECT\` followed by the column name, and then \`FROM\` followed by the table name.

For example, to get only names from a \`Users\` table:
\`SELECT name FROM Users;\`

**Your Task:**
Select only the \`name\` column of all users in the \`Users\` table.`,
        schema: [
          {
            name: 'Users',
            columns: [
              { name: 'id', type: 'INT', key: 'PK' },
              { name: 'name', type: 'VARCHAR(255)' },
              { name: 'email', type: 'VARCHAR(255)' },
              { name: 'age', type: 'INT' }
            ]
          }
        ],
        seedSql: `
          CREATE TABLE Users (id INT PRIMARY KEY, name VARCHAR(255), email VARCHAR(255), age INT);
          INSERT INTO Users VALUES (1, 'Alice', 'alice@gmail.com', 22);
          INSERT INTO Users VALUES (2, 'Bob', 'bob@yahoo.com', 28);
          INSERT INTO Users VALUES (3, 'Charlie', 'charlie@outlook.com', 19);
        `,
        expectedQuery: `SELECT name FROM Users;`,
        defaultCode: `-- Select the name column\nSELECT \nFROM Users;`,
        ordered: false,
        testCases: [
          {
            name: 'Default Run',
            seedSql: `
              CREATE TABLE Users (id INT PRIMARY KEY, name VARCHAR(255), email VARCHAR(255), age INT);
              INSERT INTO Users VALUES (1, 'Alice', 'alice@gmail.com', 22);
              INSERT INTO Users VALUES (2, 'Bob', 'bob@yahoo.com', 28);
              INSERT INTO Users VALUES (3, 'Charlie', 'charlie@outlook.com', 19);
            `
          }
        ]
      },
      {
        id: 'l3-select-multiple',
        title: 'L3: Select Multiple Columns',
        type: 'coding',
        difficulty: 'Easy',
        description: `To select multiple columns, separate them with commas:
\`SELECT name, email FROM Users;\`

**Your Task:**
Select the \`name\` and \`email\` columns of all users in the \`Users\` table.`,
        schema: [
          {
            name: 'Users',
            columns: [
              { name: 'id', type: 'INT', key: 'PK' },
              { name: 'name', type: 'VARCHAR(255)' },
              { name: 'email', type: 'VARCHAR(255)' },
              { name: 'age', type: 'INT' }
            ]
          }
        ],
        seedSql: `
          CREATE TABLE Users (id INT PRIMARY KEY, name VARCHAR(255), email VARCHAR(255), age INT);
          INSERT INTO Users VALUES (1, 'Alice', 'alice@gmail.com', 22);
          INSERT INTO Users VALUES (2, 'Bob', 'bob@yahoo.com', 28);
          INSERT INTO Users VALUES (3, 'Charlie', 'charlie@outlook.com', 19);
        `,
        expectedQuery: `SELECT name, email FROM Users;`,
        defaultCode: `-- Select name and email columns\nSELECT \nFROM Users;`,
        ordered: false,
        testCases: [
          {
            name: 'Default Run',
            seedSql: `
              CREATE TABLE Users (id INT PRIMARY KEY, name VARCHAR(255), email VARCHAR(255), age INT);
              INSERT INTO Users VALUES (1, 'Alice', 'alice@gmail.com', 22);
              INSERT INTO Users VALUES (2, 'Bob', 'bob@yahoo.com', 28);
            `
          }
        ]
      },
      {
        id: 'l4-what-is-sql',
        title: 'L4: What Is SQL?',
        type: 'mcq',
        difficulty: 'Easy',
        description: `Let's test your conceptual understanding of SQL. 

SQL is a standardized query language, originally developed at IBM in the 1970s. It stands for **Structured Query Language**.`,
        question: 'What does SQL stand for?',
        options: [
          'Structured Query Language',
          'Structured Question Language',
          'Strong Query Language',
          'Sequential Query Language'
        ],
        correctOptionIndex: 0,
        explanation: 'SQL stands for Structured Query Language. It is the global standard language for interacting with relational databases.'
      },
      {
        id: 'l5-sql-purpose',
        title: 'L5: SQL Purpose',
        type: 'mcq',
        difficulty: 'Easy',
        description: `SQL is designed specifically to perform operations such as creating schemas, inserting data, updating data, and retrieving filtered records from relational databases.`,
        question: 'Which of the following best describes the primary purpose of SQL?',
        options: [
          'Styling and designing web interfaces',
          'Managing and querying structured data in relational databases',
          'Compiling desktop applications into machine code',
          'Running scripts inside a web browser client'
        ],
        correctOptionIndex: 1,
        explanation: 'SQL is designed for database management. Web styling is done using CSS, desktop compilation is handled by compilers, and client-side web scripting is done by JavaScript.'
      },
      {
        id: 'l6-which-db-sql',
        title: 'L6: Which Databases Use SQL?',
        type: 'mcq',
        difficulty: 'Easy',
        description: `Most traditional databases use SQL as their primary query interface. These are called Relational Database Management Systems (RDBMS). Examples include PostgreSQL, MySQL, SQLite, and SQL Server.`,
        question: 'Which of the following databases primarily uses SQL for query operations?',
        options: [
          'MongoDB',
          'Redis',
          'PostgreSQL',
          'Neo4j'
        ],
        correctOptionIndex: 2,
        explanation: 'PostgreSQL is a classic relational database using SQL. MongoDB (document), Redis (key-value), and Neo4j (graph) are examples of NoSQL databases.'
      },
      {
        id: 'l7-nosql-vs-sql',
        title: 'L7: NoSQL vs. SQL',
        type: 'mcq',
        difficulty: 'Easy',
        description: `Relational SQL databases use a fixed schema where tables are predefined with columns, keys, and strict relationships. NoSQL databases are usually non-relational and support dynamic, flexible schemas.`,
        question: 'What is a core characteristic of SQL relational databases compared to NoSQL databases?',
        options: [
          'SQL databases store data as unstructured documents with no tables',
          'SQL databases use strict tabular structures with predefined columns and relationships',
          'SQL databases cannot support text, only numeric values',
          'SQL databases do not require keys or unique identifiers'
        ],
        correctOptionIndex: 1,
        explanation: 'SQL relational databases are characterized by strict tables with schemas, rows, columns, and relations, ensuring structured integrity.'
      },
      {
        id: 'l8-sql-strengths',
        title: 'L8: SQL Strengths',
        type: 'mcq',
        difficulty: 'Easy',
        description: `SQL databases excel at ensuring ACID compliance (Atomicity, Consistency, Isolation, Durability), which guarantees that data transactions are processed reliably, such as financial transactions.`,
        question: 'In which scenario is a relational SQL database highly recommended?',
        options: [
          'Storing raw, unformatted server logs with changing fields',
          'A transaction system (like banking or inventory) requiring strict data consistency and ACID properties',
          'A simple caching layer requiring fast key-value lookups with no relationships'
        ],
        correctOptionIndex: 1,
        explanation: 'Financial transactions require absolute reliability (ACID), making SQL databases the standard choice over NoSQL solutions.'
      },
      {
        id: 'l9-sqlite-features',
        title: 'L9: Comparing SQL Databases',
        type: 'mcq',
        difficulty: 'Easy',
        description: `SQLite is a highly unique database because it is serverless and self-contained in a single disk file. It does not require a running database server process, making it the most deployed database in the world.`,
        question: 'Which SQL database is a serverless, self-contained engine stored in a single file?',
        options: [
          'MySQL',
          'Microsoft SQL Server',
          'Oracle',
          'SQLite'
        ],
        correctOptionIndex: 3,
        explanation: 'SQLite is completely self-contained and serverless. This web app uses a SQLite WebAssembly compilation to run queries in your browser!'
      }
    ]
  },
  {
    id: 'ch2-tables',
    title: 'Chapter 2: Tables',
    lessons: [
      {
        id: 'l10-create-table',
        title: 'L10: Creating Tables',
        type: 'coding',
        difficulty: 'Easy',
        description: `To create a new table, we use the \`CREATE TABLE\` statement, defining the columns and their data types.

Example:
\`CREATE TABLE Users (id INT PRIMARY KEY, username VARCHAR(50));\`

**Your Task:**
Create a table named \`Products\` with two columns:
- \`id\` of type \`INT\` as the \`PRIMARY KEY\`
- \`price\` of type \`INT\``,
        schema: [],
        seedSql: `-- Sandbox empty`,
        expectedQuery: `CREATE TABLE Products (id INT PRIMARY KEY, price INT);`,
        defaultCode: `CREATE TABLE Products (\n  \n);`,
        ordered: false,
        testCases: [{ name: 'Default Run', seedSql: `` }]
      }
    ]
  },
  {
    id: 'ch3-constraints',
    title: 'Chapter 3: Constraints',
    lessons: [
      {
        id: 'l11-primary-keys',
        title: 'L11: Primary Keys',
        type: 'mcq',
        difficulty: 'Easy',
        description: `Constraints are rules applied to columns to limit the type of data that can go in. The \`PRIMARY KEY\` constraint uniquely identifies each record in a table and cannot contain \`NULL\` values.`,
        question: 'Which constraint enforces both uniqueness and non-null values for a column to uniquely identify records?',
        options: [
          'NOT NULL',
          'UNIQUE',
          'PRIMARY KEY',
          'FOREIGN KEY'
        ],
        correctOptionIndex: 2,
        explanation: 'A Primary Key is the unique identifier for a row, which implicitly carries both UNIQUE and NOT NULL rules.'
      }
    ]
  },
  {
    id: 'ch4-crud',
    title: 'Chapter 4: CRUD',
    lessons: [
      {
        id: 'l12-insert-rows',
        title: 'L12: Inserting Rows',
        type: 'coding',
        difficulty: 'Easy',
        description: `CRUD stands for Create, Read, Update, and Delete. To insert rows, we use the \`INSERT INTO\` statement.

Example:
\`INSERT INTO Users VALUES (1, 'Alice');\`

**Your Task:**
Insert a new row into the \`Customers\` table where:
- \`id\` is \`1\`
- \`name\` is \`'Frank'\``,
        schema: [
          {
            name: 'Customers',
            columns: [
              { name: 'id', type: 'INT', key: 'PK' },
              { name: 'name', type: 'VARCHAR(255)' }
            ]
          }
        ],
        seedSql: `CREATE TABLE Customers (id INT PRIMARY KEY, name VARCHAR(255));`,
        expectedQuery: `INSERT INTO Customers VALUES (1, 'Frank'); SELECT * FROM Customers;`,
        defaultCode: `INSERT INTO Customers \nVALUES ( );\n\n-- Keep this statement to display values\nSELECT * FROM Customers;`,
        ordered: false,
        testCases: [
          {
            name: 'Default Run',
            seedSql: `CREATE TABLE Customers (id INT PRIMARY KEY, name VARCHAR(255));`
          }
        ]
      }
    ]
  },
  {
    id: 'ch5-basic-queries',
    title: 'Chapter 5: Basic Queries',
    lessons: [
      {
        id: 'l13-filtering-where',
        title: 'L13: Filtering Rows',
        type: 'coding',
        difficulty: 'Easy',
        description: `We filter rows using the \`WHERE\` clause.

Example:
\`SELECT * FROM Products WHERE price > 100;\`

**Your Task:**
Select all columns from the \`Products\` table where the \`price\` is **greater than 50**.`,
        schema: [
          {
            name: 'Products',
            columns: [
              { name: 'id', type: 'INT', key: 'PK' },
              { name: 'productName', type: 'VARCHAR(255)' },
              { name: 'price', type: 'INT' }
            ]
          }
        ],
        seedSql: `
          CREATE TABLE Products (id INT PRIMARY KEY, productName VARCHAR(255), price INT);
          INSERT INTO Products VALUES (1, 'Desk', 120);
          INSERT INTO Products VALUES (2, 'Chair', 45);
          INSERT INTO Products VALUES (3, 'Lamp', 25);
          INSERT INTO Products VALUES (4, 'Laptop', 800);
        `,
        expectedQuery: `SELECT * FROM Products WHERE price > 50;`,
        defaultCode: `SELECT * \nFROM Products \nWHERE ;`,
        ordered: false,
        testCases: [
          {
            name: 'Default Run',
            seedSql: `
              CREATE TABLE Products (id INT PRIMARY KEY, productName VARCHAR(255), price INT);
              INSERT INTO Products VALUES (1, 'Desk', 120);
              INSERT INTO Products VALUES (2, 'Chair', 45);
              INSERT INTO Products VALUES (3, 'Lamp', 25);
              INSERT INTO Products VALUES (4, 'Laptop', 800);
            `
          }
        ]
      }
    ]
  },
  {
    id: 'ch6-structuring',
    title: 'Chapter 6: Structuring',
    lessons: [
      {
        id: 'l14-order-by-basic',
        title: 'L14: Sorting Rows',
        type: 'coding',
        difficulty: 'Easy',
        description: `To sort rows, we use the \`ORDER BY\` clause.

Example:
\`SELECT * FROM Users ORDER BY name ASC;\`

**Your Task:**
Select the \`name\` column of all users from the \`Users\` table, sorted alphabetically (**ascending**).`,
        schema: [
          {
            name: 'Users',
            columns: [
              { name: 'id', type: 'INT', key: 'PK' },
              { name: 'name', type: 'VARCHAR(255)' }
            ]
          }
        ],
        seedSql: `
          CREATE TABLE Users (id INT PRIMARY KEY, name VARCHAR(255));
          INSERT INTO Users VALUES (1, 'Charlie');
          INSERT INTO Users VALUES (2, 'Alice');
          INSERT INTO Users VALUES (3, 'Bob');
        `,
        expectedQuery: `SELECT name FROM Users ORDER BY name ASC;`,
        defaultCode: `SELECT name \nFROM Users \nORDER BY ;`,
        ordered: true,
        testCases: [
          {
            name: 'Default Run',
            seedSql: `
              CREATE TABLE Users (id INT PRIMARY KEY, name VARCHAR(255));
              INSERT INTO Users VALUES (1, 'Charlie');
              INSERT INTO Users VALUES (2, 'Alice');
              INSERT INTO Users VALUES (3, 'Bob');
            `
          }
        ]
      }
    ]
  },
  {
    id: 'ch7-aggregations',
    title: 'Chapter 7: Aggregations',
    lessons: [
      {
        id: 'l15-count-rows',
        title: 'L15: Counting Rows',
        type: 'coding',
        difficulty: 'Easy',
        description: `The \`COUNT()\` function returns the number of rows that match a specified criterion.

Example:
\`SELECT COUNT(*) AS total FROM Users;\`

**Your Task:**
Count the total number of rows in the \`Sales\` table. Name the resulting column \`total_sales\`.`,
        schema: [
          {
            name: 'Sales',
            columns: [
              { name: 'id', type: 'INT', key: 'PK' },
              { name: 'amount', type: 'INT' }
            ]
          }
        ],
        seedSql: `
          CREATE TABLE Sales (id INT PRIMARY KEY, amount INT);
          INSERT INTO Sales VALUES (1, 100);
          INSERT INTO Sales VALUES (2, 200);
          INSERT INTO Sales VALUES (3, 150);
        `,
        expectedQuery: `SELECT COUNT(*) AS total_sales FROM Sales;`,
        defaultCode: `SELECT COUNT( ) AS total_sales \nFROM Sales;`,
        ordered: false,
        testCases: [
          {
            name: 'Default Run',
            seedSql: `
              CREATE TABLE Sales (id INT PRIMARY KEY, amount INT);
              INSERT INTO Sales VALUES (1, 100);
              INSERT INTO Sales VALUES (2, 200);
              INSERT INTO Sales VALUES (3, 150);
            `
          }
        ]
      }
    ]
  },
  {
    id: 'ch8-subqueries',
    title: 'Chapter 8: Subqueries',
    lessons: [
      {
        id: 'l16-basic-subquery',
        title: 'L16: Filtering with Subqueries',
        type: 'coding',
        difficulty: 'Medium',
        description: `A subquery is a query nested inside another SQL statement.

Example:
\`SELECT * FROM Products WHERE price > (SELECT AVG(price) FROM Products);\`

**Your Task:**
Find all employees from the \`Employees\` table whose \`salary\` is **greater than the average salary** of all employees. Return all columns.`,
        schema: [
          {
            name: 'Employees',
            columns: [
              { name: 'id', type: 'INT', key: 'PK' },
              { name: 'name', type: 'VARCHAR(255)' },
              { name: 'salary', type: 'INT' }
            ]
          }
        ],
        seedSql: `
          CREATE TABLE Employees (id INT PRIMARY KEY, name VARCHAR(255), salary INT);
          INSERT INTO Employees VALUES (1, 'Alice', 60000);
          INSERT INTO Employees VALUES (2, 'Bob', 90000);
          INSERT INTO Employees VALUES (3, 'Charlie', 50000);
        `,
        expectedQuery: `SELECT * FROM Employees WHERE salary > (SELECT AVG(salary) FROM Employees);`,
        defaultCode: `SELECT * \nFROM Employees \nWHERE salary > (SELECT );`,
        ordered: false,
        testCases: [
          {
            name: 'Default Run',
            seedSql: `
              CREATE TABLE Employees (id INT PRIMARY KEY, name VARCHAR(255), salary INT);
              INSERT INTO Employees VALUES (1, 'Alice', 60000);
              INSERT INTO Employees VALUES (2, 'Bob', 90000);
              INSERT INTO Employees VALUES (3, 'Charlie', 50000);
            `
          }
        ]
      }
    ]
  },
  {
    id: 'ch9-normalization',
    title: 'Chapter 9: Normalization',
    lessons: [
      {
        id: 'l17-norm-definition',
        title: 'L17: Database Normalization',
        type: 'mcq',
        difficulty: 'Medium',
        description: `Database normalization is the process of structuring a database to reduce data redundancy and improve data integrity. It splits large tables into smaller tables and links them using relationships.`,
        question: 'What is the primary goal of database normalization?',
        options: [
          'To duplicate records across different locations to avoid data loss',
          'To minimize data redundancy and enforce relational integrity',
          'To format column names automatically in camelCase',
          'To optimize the load speed of static web pages'
        ],
        correctOptionIndex: 1,
        explanation: 'Normalization divides tables to eliminate duplicate entries (redundancy) and establishes logical foreign keys (relational integrity).'
      }
    ]
  },
  {
    id: 'ch10-joins',
    title: 'Chapter 10: Joins',
    lessons: [
      {
        id: 'l18-inner-join-basic',
        title: 'L18: INNER JOIN',
        type: 'coding',
        difficulty: 'Medium',
        description: `An \`INNER JOIN\` combines rows from tables based on matching values.

Example:
\`SELECT e.name, d.deptName FROM Employees e JOIN Departments d ON e.deptId = d.id;\`

**Your Task:**
Join \`Customers\` (\`c\`) and \`Orders\` (\`o\`) to retrieve the customer's \`name\` and the order's \`amount\`. 
Select columns: \`name\` and \`amount\`.`,
        schema: [
          {
            name: 'Customers',
            columns: [
              { name: 'id', type: 'INT', key: 'PK' },
              { name: 'name', type: 'VARCHAR(255)' }
            ]
          },
          {
            name: 'Orders',
            columns: [
              { name: 'id', type: 'INT', key: 'PK' },
              { name: 'customerId', type: 'INT', key: 'FK', references: 'Customers.id' },
              { name: 'amount', type: 'INT' }
            ]
          }
        ],
        seedSql: `
          CREATE TABLE Customers (id INT PRIMARY KEY, name VARCHAR(255));
          CREATE TABLE Orders (id INT PRIMARY KEY, customerId INT, amount INT);
          INSERT INTO Customers VALUES (1, 'Alice');
          INSERT INTO Customers VALUES (2, 'Bob');
          INSERT INTO Orders VALUES (1, 1, 100);
          INSERT INTO Orders VALUES (2, 2, 250);
        `,
        expectedQuery: `SELECT c.name, o.amount FROM Customers c JOIN Orders o ON c.id = o.customerId;`,
        defaultCode: `SELECT c.name, o.amount \nFROM Customers c \nJOIN Orders o ON ;`,
        ordered: false,
        testCases: [
          {
            name: 'Default Run',
            seedSql: `
              CREATE TABLE Customers (id INT PRIMARY KEY, name VARCHAR(255));
              CREATE TABLE Orders (id INT PRIMARY KEY, customerId INT, amount INT);
              INSERT INTO Customers VALUES (1, 'Alice');
              INSERT INTO Customers VALUES (2, 'Bob');
              INSERT INTO Orders VALUES (1, 1, 100);
              INSERT INTO Orders VALUES (2, 2, 250);
            `
          }
        ]
      }
    ]
  },
  {
    id: 'ch11-performance',
    title: 'Chapter 11: Performance',
    lessons: [
      {
        id: 'l19-indexes-perf',
        title: 'L19: Understanding Indexes',
        type: 'mcq',
        difficulty: 'Hard',
        description: `Indexes are special lookup tables that the database search engine can use to speed up data retrieval. Simply put, an index is like a pointer to data in a table, similar to an index in the back of a book.`,
        question: 'How does an index improve SQL query performance?',
        options: [
          'By performing mathematical equations on columns in background threads',
          'By allowing the database engine to find rows rapidly without scanning the entire table',
          'By compressing files automatically to decrease disk usage'
        ],
        correctOptionIndex: 1,
        explanation: 'Without an index, the database engine must perform a "Full Table Scan" (reading every row). An index creates a lookup structure (like a B-Tree) to jump directly to matching rows.'
      }
    ]
  }
];

export const problems: Problem[] = chapters.flatMap(ch => ch.lessons);
