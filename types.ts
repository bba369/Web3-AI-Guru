
export type CourseCategory = 'tech' | 'entrepreneur' | 'abacus' | 'digital-literacy';
export type CourseLevel = 'easy' | 'intermediate' | 'hard' | 'kids' | 'teens' | 'youth';
export type UserRole = 'New Leader' | 'Mentor' | 'Senior Mentor' | 'Admin';

export interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface LessonContent {
  story?: string;
  script: string;
  vocabulary: { word: string; meaning: string }[];
  summary: string;
  captions: string[];
  quiz: Question[];
  sources?: { title: string; url: string }[];
  imageUrl?: string;
}

export interface Lesson {
  id: string;
  day: number;
  youtubeId: string;
  title: string;
  description: string;
  level: CourseLevel;
  category: CourseCategory;
  content?: LessonContent;
}

export interface LessonProgress {
  lessonId: string;
  completed: boolean;
  quizPassed: boolean;
  score: number; // 0-10
}

export interface UserStats {
  totalScore: number;
  streak: number;
  lastLoginDate: string; // ISO string
  completedLessonsCount: number;
  role: UserRole;
  referralCount: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
