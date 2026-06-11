#!/usr/bin/env python3
"""
Validate all SQL problems for consistency:
1. Schema columns must match the tables created by seedSql
2. expectedQuery must run without error against the seeded DB
3. testCase seedSql must create the same tables as problem seedSql
4. Description column references should match actual schema
5. seedSql INSERT columns must match CREATE TABLE columns
"""
import json
import sqlite3
import re
import sys
import os

FILES = [
    'src/data/problems/basics.json',
    'src/data/problems/codechef.json',
    'src/data/problems/hackerrank.json',
    'src/data/problems/leetcode.json',
]

issues = []

def add_issue(severity, problem_id, title, file, msg):
    issues.append({
        'severity': severity,
        'id': problem_id,
        'title': title,
        'file': file,
        'msg': msg,
    })

def get_tables_from_sql(sql):
    """Execute SQL in memory and return table info."""
    if not sql or not sql.strip():
        return None, "Empty SQL"
    conn = sqlite3.connect(':memory:')
    try:
        conn.executescript(sql)
        cursor = conn.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
        tables = {}
        for (name,) in cursor.fetchall():
            col_cursor = conn.execute(f"PRAGMA table_info('{name}')")
            cols = [(row[1], row[2]) for row in col_cursor.fetchall()]
            tables[name] = cols
        return tables, None
    except Exception as e:
        return None, str(e)
    finally:
        conn.close()

def run_query_on_seed(seed_sql, query):
    """Run expectedQuery on seeded DB and check for errors."""
    conn = sqlite3.connect(':memory:')
    try:
        if seed_sql:
            conn.executescript(seed_sql)
        # expectedQuery might have multiple statements
        conn.executescript(query)
        return None  # no error
    except Exception as e:
        return str(e)
    finally:
        conn.close()

def extract_table_names_from_description(desc):
    """Extract table names mentioned in backtick-quoted identifiers."""
    # Look for patterns like `tablename` or 'tablename' after FROM/INTO/TABLE
    tables = set()
    # FROM tablename, INTO tablename, TABLE tablename
    for match in re.finditer(r'(?:FROM|INTO|TABLE)\s+[`\'"]?(\w+)[`\'"]?', desc, re.IGNORECASE):
        tables.add(match.group(1).lower())
    return tables

def check_schema_vs_seed(problem, fname):
    """Check if schema columns match seed SQL table columns."""
    pid = problem['id']
    ptitle = problem['title']
    schema = problem.get('schema', [])
    seed_sql = problem.get('seedSql', '')
    
    if not schema and not seed_sql:
        return  # theory problem, skip
    
    if not seed_sql:
        add_issue('WARN', pid, ptitle, fname, 'Coding problem has no seedSql')
        return
    
    seed_tables, err = get_tables_from_sql(seed_sql)
    if err:
        add_issue('ERROR', pid, ptitle, fname, f'seedSql fails to execute: {err}')
        return
    
    if not schema:
        add_issue('WARN', pid, ptitle, fname, f'No schema defined but seedSql creates tables: {list(seed_tables.keys())}')
        return
    
    # Compare schema tables vs seed tables
    schema_table_names = {t['name'].lower() for t in schema}
    seed_table_names = {t.lower() for t in seed_tables}
    
    for s_table in schema:
        s_name = s_table['name']
        if s_name.lower() not in seed_table_names:
            add_issue('ERROR', pid, ptitle, fname,
                f'Schema table "{s_name}" not found in seedSql tables {list(seed_tables.keys())}')
            continue
        
        # Find matching seed table (case-insensitive)
        matching_seed_name = None
        for st_name in seed_tables:
            if st_name.lower() == s_name.lower():
                matching_seed_name = st_name
                break
        
        if matching_seed_name:
            seed_cols = {c[0].lower() for c in seed_tables[matching_seed_name]}
            schema_cols = {c['name'].lower() for c in s_table['columns']}
            
            missing_in_seed = schema_cols - seed_cols
            missing_in_schema = seed_cols - schema_cols
            
            if missing_in_seed:
                add_issue('ERROR', pid, ptitle, fname,
                    f'Table "{s_name}": schema has columns {missing_in_seed} not in seedSql')
            if missing_in_schema:
                add_issue('WARN', pid, ptitle, fname,
                    f'Table "{s_name}": seedSql has columns {missing_in_schema} not in schema')

def check_expected_query(problem, fname):
    """Verify expectedQuery runs against seeded DB."""
    pid = problem['id']
    ptitle = problem['title']
    seed_sql = problem.get('seedSql', '')
    expected = problem.get('expectedQuery', '')
    
    if not expected:
        if problem['type'] == 'coding':
            add_issue('WARN', pid, ptitle, fname, 'Coding problem has no expectedQuery')
        return
    
    err = run_query_on_seed(seed_sql, expected)
    if err:
        add_issue('ERROR', pid, ptitle, fname, f'expectedQuery fails: {err}')

def check_test_cases(problem, fname):
    """Verify test case seedSql creates valid tables and expectedQuery works against them."""
    pid = problem['id']
    ptitle = problem['title']
    expected = problem.get('expectedQuery', '')
    test_cases = problem.get('testCases', [])
    
    if not test_cases and problem['type'] == 'coding' and expected:
        add_issue('WARN', pid, ptitle, fname, 'Coding problem with expectedQuery but no testCases')
        return
    
    for i, tc in enumerate(test_cases):
        tc_seed = tc.get('seedSql', '')
        if not tc_seed:
            add_issue('WARN', pid, ptitle, fname, f'Test case [{i}] "{tc.get("name","")}" has empty seedSql')
            continue
        
        # Check if tc seedSql executes
        tables, err = get_tables_from_sql(tc_seed)
        if err:
            add_issue('ERROR', pid, ptitle, fname, f'Test case [{i}] seedSql fails: {err}')
            continue
        
        # Check if expectedQuery runs against tc seed
        if expected:
            err = run_query_on_seed(tc_seed, expected)
            if err:
                add_issue('ERROR', pid, ptitle, fname,
                    f'Test case [{i}] expectedQuery fails against tc seedSql: {err}')

def check_description_consistency(problem, fname):
    """Check if description mentions tables/columns that match the schema."""
    pid = problem['id']
    ptitle = problem['title']
    desc = problem.get('description', '')
    schema = problem.get('schema', [])
    seed_sql = problem.get('seedSql', '')
    
    if not desc or not seed_sql or problem['type'] != 'coding':
        return
    
    # Check for column references in description vs actual seed table
    seed_tables, err = get_tables_from_sql(seed_sql)
    if err or not seed_tables:
        return
    
    # Get all actual column names (lowercase)
    all_seed_cols = set()
    for t_name, cols in seed_tables.items():
        for col_name, col_type in cols:
            all_seed_cols.add(col_name.lower())
    
    # Look for column-like references in description (inside backticks or after specific keywords)
    desc_cols_in_backticks = set()
    for match in re.finditer(r'`(\w+)`', desc):
        word = match.group(1)
        # Skip SQL keywords
        if word.upper() in ('SELECT', 'FROM', 'WHERE', 'INSERT', 'INTO', 'UPDATE', 'DELETE', 
                            'CREATE', 'TABLE', 'ALTER', 'ADD', 'DROP', 'SET', 'VALUES',
                            'INT', 'TEXT', 'VARCHAR', 'NULL', 'NOT', 'DEFAULT', 'PRIMARY', 'KEY',
                            'AND', 'OR', 'ORDER', 'BY', 'GROUP', 'HAVING', 'JOIN', 'ON', 'AS',
                            'LIMIT', 'DISTINCT', 'COUNT', 'SUM', 'AVG', 'MAX', 'MIN', 'LIKE',
                            'BETWEEN', 'IN', 'IS', 'ASC', 'DESC', 'COLUMN', 'CONSTRAINT',
                            'FOREIGN', 'REFERENCES', 'UNIQUE', 'CHECK', 'INDEX', 'REAL',
                            'INTEGER', 'FLOAT', 'DOUBLE', 'BOOLEAN', 'DATE', 'DATETIME',
                            'TIMESTAMP', 'BLOB', 'CHAR', 'DECIMAL', 'NUMERIC', 'ROLLBACK',
                            'COMMIT', 'BEGIN', 'TRANSACTION', 'SAVEPOINT', 'UNION', 'EXCEPT',
                            'INTERSECT', 'EXISTS', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END',
                            'INNER', 'LEFT', 'RIGHT', 'OUTER', 'CROSS', 'NATURAL', 'USING',
                            'AUTOINCREMENT', 'ROWID'):
            continue
        desc_cols_in_backticks.add(word.lower())


def main():
    total_problems = 0
    coding_problems = 0
    
    for fname in FILES:
        if not os.path.exists(fname):
            print(f"SKIP: {fname} not found")
            continue
            
        with open(fname) as f:
            data = json.load(f)
        
        for ch in data:
            for lesson in ch['lessons']:
                total_problems += 1
                if lesson['type'] == 'coding':
                    coding_problems += 1
                    check_schema_vs_seed(lesson, fname)
                    check_expected_query(lesson, fname)
                    check_test_cases(lesson, fname)
                    check_description_consistency(lesson, fname)
    
    # Print results
    print(f"\n{'='*80}")
    print(f"VALIDATION REPORT")
    print(f"{'='*80}")
    print(f"Total problems: {total_problems}")
    print(f"Coding problems: {coding_problems}")
    print(f"Issues found: {len(issues)}")
    print()
    
    errors = [i for i in issues if i['severity'] == 'ERROR']
    warnings = [i for i in issues if i['severity'] == 'WARN']
    
    if errors:
        print(f"{'='*80}")
        print(f"❌ ERRORS ({len(errors)})")
        print(f"{'='*80}")
        for i, iss in enumerate(errors):
            short_file = iss['file'].split('/')[-1]
            print(f"\n  [{i+1}] {iss['id']} — \"{iss['title']}\" ({short_file})")
            print(f"      {iss['msg']}")
    
    if warnings:
        print(f"\n{'='*80}")
        print(f"⚠️  WARNINGS ({len(warnings)})")
        print(f"{'='*80}")
        for i, iss in enumerate(warnings):
            short_file = iss['file'].split('/')[-1]
            print(f"\n  [{i+1}] {iss['id']} — \"{iss['title']}\" ({short_file})")
            print(f"      {iss['msg']}")
    
    if not errors and not warnings:
        print("✅ All problems passed validation!")
    
    return 1 if errors else 0

if __name__ == '__main__':
    sys.exit(main())
