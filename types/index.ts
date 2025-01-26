export interface Option {
  id: number;
  text: string;
  score?: number;
}

export interface Question {
  id: number;
  question: string;
  options: Option[];
  inputType?: 'radio' | 'checkbox';
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