// app/admin/dashboard/types.ts
export interface Problem {
  id: number;
  problemID : number; 
  title: string;
  url?: string;
  statement: string;
  inputDescription: string;
  outputDescription: string;
  constraints: string;
  sampleTestCases: TestCase[];
  hiddenTestCasesCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface TestCase {
  id?: number;
  problemId: number;
  input: string;
  output: string;
  isSample: boolean;
}

export interface TestCaseFile {
  id: number;
  inputFile: string;
  outputFile: string;
  problemId: number;
}

export interface ProblemFormData {
  title: string;
  url?: string;
  statement: string;
  inputDescription: string;
  outputDescription: string;
  constraints: string;
  sampleTestCases: Omit<TestCase, 'problemId' | 'isSample'>[];
}