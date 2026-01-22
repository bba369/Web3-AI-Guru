
export type CourseLevel = 'easy' | 'intermediate' | 'hard';
export type UserRole = 'New Leader' | 'Mentor' | 'Senior Mentor' | 'Admin';

export interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface LessonContent {
  script: string;
  vocabulary: { word: string; meaning: string }[];
  summary: string;
  captions: string[];
  quiz: Question[];
  sources?: { title: string; url: string }[];
}

export interface Lesson {
  id: string;
  day: number;
  youtubeId: string;
  title: string;
  description: string;
  level: CourseLevel;
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
