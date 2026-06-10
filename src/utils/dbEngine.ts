import { Problem } from '../data/problems';

export type SqlValue = string | number | boolean | Uint8Array | null;

export interface QueryResult {
  columns: string[];
  rows: SqlValue[][];
  error?: string;
  timeMs?: number;
}

export interface TestCaseResult {
  name: string;
  passed: boolean;
  userResult: QueryResult;
  expectedResult: QueryResult;
  error?: string;
}

export interface EvaluationResult {
  success: boolean;
  testCases: TestCaseResult[];
}

export interface SqliteStatement {
  getColumnNames(): string[];
  step(): boolean;
  get(): SqlValue[];
  free(): void;
}

export interface SqliteDatabase {
  prepare(sql: string): SqliteStatement;
  run(sql: string): void;
  close(): void;
}

export interface SqlJsLib {
  Database: new () => SqliteDatabase;
}

interface SqlJsWindow extends Window {
  initSqlJs?: (config: { locateFile: (file: string) => string }) => Promise<SqlJsLib>;
}

let SQL: SqlJsLib | null = null;

/**
 * Loads and initializes sql.js from the CDN
 */
export async function getSqlLib(): Promise<SqlJsLib> {
  if (SQL) return SQL;
  if (typeof window === 'undefined') {
    throw new Error("Cannot initialize SQL engine on the server side.");
  }

  // Poll for global initSqlJs loaded via Next.js Script tag
  const win = window as unknown as SqlJsWindow;
  const maxWait = 15000;
  const start = Date.now();
  while (!win.initSqlJs) {
    if (Date.now() - start > maxWait) {
      throw new Error("Timeout waiting for sql.js CDN script to load. Please check your network connection.");
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  SQL = await win.initSqlJs({
    locateFile: (file: string) => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.12.0/${file}`
  });
  return SQL;
}

/**
 * Execute a single query on a database instance
 */
export function executeQuery(db: SqliteDatabase, sql: string): QueryResult {
  const start = performance.now();
  let stmt: SqliteStatement | null = null;
  try {
    stmt = db.prepare(sql);
    const columns = stmt.getColumnNames();
    const rows: SqlValue[][] = [];
    while (stmt.step()) {
      rows.push(stmt.get());
    }
    const end = performance.now();
    return {
      columns,
      rows,
      timeMs: Math.round((end - start) * 100) / 100
    };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      columns: [],
      rows: [],
      error: errorMsg
    };
  } finally {
    if (stmt) {
      try {
        stmt.free();
      } catch {}
    }
  }
}

/**
 * Lexicographical sort for table rows to check order-independent equality
 */
function sortRows(rows: SqlValue[][]): SqlValue[][] {
  return [...rows].sort((a, b) => {
    for (let i = 0; i < Math.min(a.length, b.length); i++) {
      const valA = a[i];
      const valB = b[i];
      if (valA === null && valB !== null) return -1;
      if (valA !== null && valB === null) return 1;
      if (valA === undefined && valB !== undefined) return -1;
      if (valA !== undefined && valB === undefined) return 1;
      
      if (typeof valA === 'number' && typeof valB === 'number') {
        if (valA < valB) return -1;
        if (valA > valB) return 1;
      } else {
        const strA = String(valA);
        const strB = String(valB);
        if (strA < strB) return -1;
        if (strA > strB) return 1;
      }
    }
    return a.length - b.length;
  });
}

/**
 * Compare user result vs expected result
 */
export function compareResults(
  user: QueryResult,
  expected: QueryResult,
  strictOrder: boolean = false
): { passed: boolean; error?: string } {
  if (user.error) {
    return { passed: false, error: `SQL Execution Error: ${user.error}` };
  }
  if (expected.error) {
    return { passed: false, error: `Expected Query Error: ${expected.error}` };
  }

  // 1. Column counts
  if (user.columns.length !== expected.columns.length) {
    return {
      passed: false,
      error: `Column count mismatch. Expected ${expected.columns.length} columns, got ${user.columns.length}.`
    };
  }

  // 2. Column names (case-insensitive check to be standard, but alerting if names mismatch)
  for (let i = 0; i < expected.columns.length; i++) {
    if (user.columns[i].toLowerCase() !== expected.columns[i].toLowerCase()) {
      return {
        passed: false,
        error: `Column name mismatch at position ${i + 1}. Expected: "${expected.columns[i]}", got: "${user.columns[i]}".`
      };
    }
  }

  // 3. Row count
  if (user.rows.length !== expected.rows.length) {
    return {
      passed: false,
      error: `Row count mismatch. Expected ${expected.rows.length} rows, got ${user.rows.length}.`
    };
  }

  // 4. Compare row values
  let userRows = user.rows;
  let expectedRows = expected.rows;

  if (!strictOrder) {
    userRows = sortRows(userRows);
    expectedRows = sortRows(expectedRows);
  }

  for (let r = 0; r < expectedRows.length; r++) {
    const uRow = userRows[r];
    const eRow = expectedRows[r];
    for (let c = 0; c < expectedRows[r].length; c++) {
      const uVal = uRow[c];
      const eVal = eRow[c];
      
      // Compare floats/numbers loosely, check nulls
      if (uVal === null && eVal !== null) return { passed: false, error: `Data mismatch at row ${r + 1}. Expected value, got NULL.` };
      if (uVal !== null && eVal === null) return { passed: false, error: `Data mismatch at row ${r + 1}. Expected NULL, got value.` };
      if (uVal !== eVal) {
        // Handle numeric values
        if (typeof uVal === 'number' && typeof eVal === 'number') {
          if (Math.abs(uVal - eVal) > 1e-6) {
            return { passed: false, error: `Data mismatch at row ${r + 1}. Expected: ${eVal}, got: ${uVal}.` };
          }
        } else if (String(uVal).trim() !== String(eVal).trim()) {
          return { passed: false, error: `Data mismatch at row ${r + 1}. Expected: "${eVal}", got: "${uVal}".` };
        }
      }
    }
  }

  return { passed: true };
}

/**
 * Runs user query against all test cases of a problem
 */
export async function evaluateSubmission(
  problem: Problem,
  userSql: string
): Promise<EvaluationResult> {
  const sqlLib = await getSqlLib();
  if (!sqlLib) {
    throw new Error("SQL library not initialized.");
  }

  const testCases = problem.testCases || [];
  const results: TestCaseResult[] = [];
  let allPassed = true;

  for (const tc of testCases) {
    let userDb: SqliteDatabase | null = null;
    let expectedDb: SqliteDatabase | null = null;
    try {
      userDb = new sqlLib.Database();
      expectedDb = new sqlLib.Database();

      // Seed databases
      userDb.run(tc.seedSql);
      expectedDb.run(tc.seedSql);

      // Execute both
      const userResult = executeQuery(userDb, userSql);
      const expectedResult = executeQuery(expectedDb, problem.expectedQuery || '');

      // Compare
      const comparison = compareResults(userResult, expectedResult, problem.ordered);
      results.push({
        name: tc.name,
        passed: comparison.passed,
        userResult,
        expectedResult,
        error: comparison.error
      });

      if (!comparison.passed) {
        allPassed = false;
      }
    } catch (e) {
      allPassed = false;
      const errorMsg = e instanceof Error ? e.message : String(e);
      results.push({
        name: tc.name,
        passed: false,
        userResult: { columns: [], rows: [], error: errorMsg },
        expectedResult: { columns: [], rows: [] },
        error: `System error running test case: ${errorMsg}`
      });
    } finally {
      if (userDb) userDb.close();
      if (expectedDb) expectedDb.close();
    }
  }

  return {
    success: allPassed,
    testCases: results
  };
}

/**
 * Fetches input tables and seed rows for rendering problem details
 */
export async function fetchSeedTables(problem: Problem): Promise<{ [tableName: string]: QueryResult }> {
  const sqlLib = await getSqlLib();
  if (!sqlLib) return {};

  const db = new sqlLib.Database();
  try {
    if (problem.seedSql) {
      db.run(problem.seedSql);
    }
    
    // Query sqlite_master to find user-created tables
    const tablesResult = executeQuery(db, "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';");
    const tableNames = tablesResult.rows.map(row => row[0]);

    const result: { [tableName: string]: QueryResult } = {};
    for (const name of tableNames) {
      if (typeof name === 'string') {
        result[name] = executeQuery(db, `SELECT * FROM ${name}`);
      }
    }
    return result;
  } catch (e) {
    console.error("Error fetching seed tables", e);
    return {};
  } finally {
    db.close();
  }
}
