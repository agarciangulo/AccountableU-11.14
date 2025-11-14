

export interface Activity {
  id: string;
  userId: string;
  name: string;
  category: string;
  goal: number;
  unit: string;
}

export interface Log {
  id:string;
  userId: string;
  activityId: string;
  date: string; // YYYY-MM-DD
  value: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
}