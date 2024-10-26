// Обновленная структура TimerSession
export interface TimerSession {
  id: string;
  time: number;
  note: string;
  status: string;
  sets: { repetitions: number }[];
  categoryIds: string[]; // Массив ID категорий
}
