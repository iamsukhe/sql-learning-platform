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
  type: 'coding' | 'theory';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  
  // For theory / study lessons
  takeaways?: string[];
  selfCheck?: string[];

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

  // Deprecated/Optional (MCQ support)
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

import basicsChapters from './problems/basics.json';
import codechefChapters from './problems/codechef.json';
import hackerrankChapters from './problems/hackerrank.json';
import leetcodeChapters from './problems/leetcode.json';

export const chapters: Chapter[] = [
  ...(basicsChapters as Chapter[]),
  ...(codechefChapters as Chapter[]),
  ...(hackerrankChapters as Chapter[]),
  ...(leetcodeChapters as Chapter[])
];

export const problems: Problem[] = chapters.flatMap(ch => ch.lessons);
