export interface Option {
  id: number;
  text: string;
  score?: number;
}

export interface Question {
  id: number;
  question: string;
  inputType: "radio" | "checkbox";
  options: {
    id: number;
    text: string;
    score: number;
  }[];
  conditional?: boolean;
  dependsOn?: {
    questionId: number;
    optionIds: number[];
  };
}

export interface SelectedOption {
  name: string;
  value: string;
}

export interface OpenAIResponse {
  title: string;
  currentSkills: string;
  ladderPositionDescription: string;
  courseRecommendation: {
    name: string;
    benefits: string[];
  };
  learningOutcomes: string[];
  nextSteps: string;
}

export interface SubmissionAnswer {
  questionId: number;
  question: string;
  selectedOptionIds: number[];
  selectedOptionText: string[];
}

export interface Submission {
  id?: string;
  email: string;
  score: number;
  recommendedCourse: string;
  answersText: string;
  answers: SubmissionAnswer[];
  aiResponse: OpenAIResponse | string | null;
  createdAt: string;
}

export interface AdminUser {
  id?: string;
  email: string;
  name?: string;
  role?: "admin" | "user";
  createdAt: string;
  lastSubmissionAt?: string;
}

export interface AdminCourseDistribution {
  course: string;
  count: number;
}

export interface AdminDailyTrendPoint {
  date: string;
  count: number;
}

export interface AdminTopCategory {
  label: string;
  count: number;
}

export interface AdminNotificationHealth {
  sent: number;
  failed: number;
}

export interface AdminAnalyticsResponse {
  totals: {
    submissions: number;
    users: number;
    submissionsThisWeek: number;
  };
  recommendationDistribution: AdminCourseDistribution[];
  dailyTrend: AdminDailyTrendPoint[];
  topCategories: AdminTopCategory[];
  notificationHealth: AdminNotificationHealth;
}

export interface SmtpSettings {
  host: string;
  port: number;
  username: string;
  password: string;
  secure: boolean;
  fromEmail: string;
  notifyToEmail: string;
  notificationsEnabled: boolean;
}

export interface SmtpSettingsResponse {
  host: string;
  port: number;
  username: string;
  secure: boolean;
  fromEmail: string;
  notifyToEmail: string;
  notificationsEnabled: boolean;
  hasPassword: boolean;
}

export interface SmtpSettingsDocument {
  host: string;
  port: number;
  username: string;
  encryptedPassword: string;
  secure: boolean;
  fromEmail: string;
  notifyToEmail: string;
  notificationsEnabled: boolean;
  updatedAt: string;
}
