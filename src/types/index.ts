export interface Department {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

export interface Position {
  id: string;
  departmentId: string;
  departmentName: string;
  name: string; // "Backend Engineer", "Data Analyst"
  createdAt: string;
}

export interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  category: string;
  isRequired: boolean;
  order: number;
  source?: 'document' | 'additional'; // wiki source
}

export type OnboardingType = 'replacement' | 'new-hire';

export type AdditionalCategory = 'it-setup' | 'hr-admin' | 'team-intro';

export interface ChecklistTemplate {
  id: string;
  positionId: string;
  positionName: string;
  departmentId: string;
  departmentName: string;
  replacingPerson?: string;
  onboardingType: OnboardingType;
  additionalCategories: AdditionalCategory[];
  items: ChecklistItem[];
  generatedFrom?: string;
  model?: string;
  wikiRevisions?: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserChecklistItem extends ChecklistItem {
  completed: boolean;
  completedAt?: string;
  notes?: string;
  verified?: boolean;
  verifiedAt?: string;
}

export interface UserOnboarding {
  id: string;
  authUserId?: string;
  name: string;
  positionId: string;
  positionName: string;
  departmentId: string;
  departmentName: string;
  replacingPerson?: string;
  onboardingType: OnboardingType;
  startDate: string;
  items: UserChecklistItem[];
  createdAt: string;
}

export interface TeamMember {
  id: string;
  departmentId: string;
  departmentName: string;
  name: string;
  role: string;
  photoUrl?: string;
  createdAt: string;
}

export interface QuizQuestion {
  id: string;
  type: 'team' | 'handover';
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  memberId?: string;   // untuk team quiz
  photoUrl?: string;   // untuk eye-crop
}

// Assessment bank (tr_assessment / tr_question / tr_ongoing_test)
export const ONGOING_TEST_STATUS = { IN_PROGRESS: 0, PASSED: 1, FAILED: 2 } as const;
export type OngoingTestStatus = typeof ONGOING_TEST_STATUS[keyof typeof ONGOING_TEST_STATUS];

export interface Assessment {
  id: number;
  title: string;
  description: string;
  duration: number; // minutes
  threshold: number; // pass score, percent (0-100)
  createdAt: string;
}

export interface AssessmentQuestion {
  id: number;
  assessmentId: number;
  questionText: string;
  options: string[];
  correctAnswer: string;
  points: number;
  createdAt: string;
}

export interface OngoingTest {
  id: string;
  userId: string;
  assessmentId: number;
  startTime: string;
  endTime?: string;
  status: OngoingTestStatus;
  createdAt: string;
}

// Models
type GroqModelId = 'llama-3.3-70b-versatile' | 'llama-3.1-8b-instant' | 'mixtral-8x7b-32768' | 'qwen-qwq-32b';
type QwenModelId = 'qwen-plus' | 'qwen-turbo' | 'qwen-max' | 'qwq-32b';
export type ModelId = GroqModelId | QwenModelId;

export interface ModelOption {
  id: ModelId;
  name: string;
  provider: 'groq' | 'qwen';
  description: string;
  speed: 'fast' | 'medium' | 'slow';
}
