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

import chaptersData from './problems.json';

export const chapters: Chapter[] = chaptersData as Chapter[];
export const problems: Problem[] = chapters.flatMap(ch => ch.lessons);
