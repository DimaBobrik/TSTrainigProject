export interface TimerSession {
  id: number;
  time: number;
  note: string;
  status: string;
  sets: { repetitions: number; count: number }[];
}