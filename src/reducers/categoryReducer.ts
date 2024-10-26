import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Category } from '../utils/interfaces/Category';
import { TimerSession } from '../utils/interfaces/TimeSession';

interface CategoryState {
  categories: Category[];
}

const initialState: CategoryState = {
  categories: [],
};

const categorySlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    setCategories(state, action: PayloadAction<Category[]>) {
      state.categories = action.payload;
    },
    addCategory(state, action: PayloadAction<Category>) {
      state.categories.push(action.payload);
    },
    updateCategory(state, action: PayloadAction<Category>) {
      const index = state.categories.findIndex(cat => cat.id === action.payload.id);
      if (index >= 0) {
        state.categories[index] = action.payload;
      }
    },
    removeCategory(state, action: PayloadAction<number>) {
      state.categories = state.categories.filter(cat => cat.id !== action.payload);
    },
    addSessionToCategory(
        state,
        action: PayloadAction<{ categoryId: number; session: TimerSession }>
    ) {
      const category = state.categories.find(cat => cat.id === action.payload.categoryId);
      if (category) {
        category.sessions.push(action.payload.session);
      }
    },
    updateSessionInCategory(
        state,
        action: PayloadAction<{ categoryId: number; session: TimerSession }>
    ) {
      const category = state.categories.find(cat => cat.id === action.payload.categoryId);
      if (category) {
        const sessionIndex = category.sessions.findIndex(sess => sess.id === action.payload.session.id);
        if (sessionIndex >= 0) {
          category.sessions[sessionIndex] = action.payload.session;
        }
      }
    },
    removeSessionFromCategory(
        state,
        action: PayloadAction<{ categoryId: number; sessionId: number }>
    ) {
      const category = state.categories.find(cat => cat.id === action.payload.categoryId);
      if (category) {
        category.sessions = category.sessions.filter(sess => sess.id !== action.payload.sessionId);
      }
    },
    updateSetsInSession(
        state,
        action: PayloadAction<{ categoryId: number; sessionId: number; sets: { repetitions: number; count: number }[] }>
    ) {
      const category = state.categories.find(cat => cat.id === action.payload.categoryId);
      if (category) {
        const session = category.sessions.find(sess => sess.id === action.payload.sessionId);
        if (session) {
          session.sets = action.payload.sets;
        }
      }
    },
    markSessionComplete(
        state,
        action: PayloadAction<{ categoryId: number; sessionId: number }>
    ) {
      const category = state.categories.find(cat => cat.id === action.payload.categoryId);
      if (category) {
        const session = category.sessions.find(sess => sess.id === action.payload.sessionId);
        if (session) {
          session.status = 'Completed';
        }
      }
    },
    deleteSession(state, action: PayloadAction<number>) {
      state.categories.forEach((category) => {
        category.sessions = category.sessions.filter((session) => session.id !== action.payload);
      });
    },
  },
});

export const {
  setCategories,
  addCategory,
  updateCategory,
  removeCategory,
  addSessionToCategory,
  updateSessionInCategory,
  removeSessionFromCategory,
  updateSetsInSession,
  markSessionComplete,
  deleteSession,
} = categorySlice.actions;
export default categorySlice.reducer;
