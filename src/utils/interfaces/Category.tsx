import {TimerSession} from "./TimeSession.tsx";

export interface Category {
    id: number;
    name: string;
    sessions: TimerSession[];
}