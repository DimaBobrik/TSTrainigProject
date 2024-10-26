import { TimerSession } from "./TimeSession";

export interface Category {
  id: number;
  name: string;
  sessions: TimerSession[];
}