export interface Example {
  input: string;
  output: string;
  explanation?: string;
}

export type Category = 'Algorithm' | 'JavaScript' | 'Node.js' | 'React' | 'Design System' | 'Design Patterns' | 'System Design' | 'Behavioral' | 'AI' | 'Backend';
export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface TestCase {
  args: unknown[];
  expected: unknown;
  isHidden?: boolean;
}

export interface TestConfig {
  functionName: string;
  /** How to prepare specific args before calling: e.g. arg index 0 is a linked list */
  argTypes?: ArgType[];
  returnType?: DataStructureType;
  /** For problems where output order doesn't matter */
  compareType?: 'exact' | 'sorted' | 'setEqual';
  /**
   * Custom validator: given (actual result, original args), return true if correct.
   * When provided, `expected` is only used for display — validation uses this function.
   */
  validator?: (actual: unknown, args: unknown[]) => boolean;
  testCases: TestCase[];
}

export type DataStructureType = 'primitive' | 'array' | 'linkedList' | 'tree' | 'matrix';
export type ArgType = DataStructureType | 'linkedListCycle';

export type Priority = 'essential' | 'good-to-know' | 'nice-to-know';

export interface Question {
  id: string;
  title: string;
  category: Category;
  subcategory: string;
  difficulty: Difficulty;
  priority?: Priority;
  companies: string[];
  description: string;
  examples?: Example[];
  solution: string;
  solutionExplanation?: string;
  bruteForce?: string;
  bruteForceExplanation?: string;
  timeComplexity: string;
  spaceComplexity: string;
  diagram?: string;
  eli5?: string;
  keyTakeaway: string;
  similarProblems: string[];
  pattern: string;
  leetcodeUrl?: string;
}

export interface NoteVersion {
  id: string;
  content: string;
  createdAt: number;
}

export interface QuestionNotes {
  questionId: string;
  versions: NoteVersion[];
}

export interface StudyPlanItem {
  week: number;
  title: string;
  category: Category;
  topics: string[];
  questionIds: string[];
}

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface SavedConversation {
  id: string;
  questionId: string;
  title: string;
  messages: ConversationMessage[];
  createdAt: number;
  updatedAt: number;
}

export interface ArticleSection {
  slug: string;
  title: string;
  content: string;
}

export interface LearningPathCategory {
  slug: string;
  title: string;
  icon: string;
  description: string;
  article: string;
  eli5: string;
  poem: string;
  pattern: string;
  whenToUse: string[];
  keyInsights: string[];
  template: string;
  questionIds: string[];
  sections: ArticleSection[];
}
