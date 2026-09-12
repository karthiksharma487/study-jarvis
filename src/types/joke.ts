// Joke API Types
export interface JokeResponse {
  error: boolean;
  category: string;
  type: 'single' | 'twopart';
  joke?: string;
  setup?: string;
  delivery?: string;
}

export type JokeCategory = 'Any' | 'General' | 'Knock-Knock' | 'Programming' | 'Dark' | 'Spooky' | 'Christmas';

export interface JokeState {
  joke: string | null;
  loading: boolean;
  error: string | null;
  category: JokeCategory;
}
