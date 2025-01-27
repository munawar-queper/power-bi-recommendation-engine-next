export interface Option {
  id: number;
  text: string;
  score?: number;
}

export interface Question {
  id: number;
  question: string;
  inputType: 'radio' | 'checkbox';
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
  id: string;
  choices: {
    message: {
      content: string;
    };
  }[];
} 