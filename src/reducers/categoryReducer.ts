import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Category } from '../utils/interfaces/Category';
import { TimerSession } from '../utils/interfaces/TimeSession';

interface CategoryState {
    categories: Category[];
}

const initialState: CategoryState = {
    categories: [],
};

// Базовый URL json-server
const API_BASE_URL = 'http://localhost:3001/categories';

// Асинхронные действия для получения, добавления, обновления и удаления категорий и сессий

export const fetchCategories = createAsyncThunk(
    'categories/fetchCategories',
    async (_, { rejectWithValue }) => {
        try {
            const response = await fetch(API_BASE_URL);
            if (!response.ok) {
                throw new Error('Failed to fetch categories');
            }
            const data = await response.json();
            return data.categories || data;
        } catch (error) {
            return rejectWithValue((error as Error).message);
        }
    }
);

export const createCategory = createAsyncThunk(
    'categories/createCategory',
    async (category: Category, { rejectWithValue }) => {
        try {
            const response = await fetch(API_BASE_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(category),
            });
            if (!response.ok) {
                throw new Error('Failed to create category');
            }
            const newCategory = await response.json();
            return newCategory;
        } catch (error) {
            return rejectWithValue((error as Error).message);
        }
    }
);

export const deleteCategory = createAsyncThunk(
    'categories/deleteCategory',
    async (categoryId: string, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_BASE_URL}/${categoryId}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error('Failed to delete category');
            }
            return categoryId;
        } catch (error) {
            return rejectWithValue((error as Error).message);
        }
    }
);

export const addSession = createAsyncThunk(
    'categories/addSession',
    async ({ categoryId, session }: { categoryId: string; session: TimerSession }, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_BASE_URL}/${categoryId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch category for adding session');
            }
            const category = await response.json();
            const updatedSessions = [...category.sessions, session];

            const updateResponse = await fetch(`${API_BASE_URL}/${categoryId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ...category, sessions: updatedSessions }),
            });

            if (!updateResponse.ok) {
                throw new Error('Failed to update category with new session');
            }

            return { categoryId, session };
        } catch (error) {
            return rejectWithValue((error as Error).message);
        }
    }
);

export const removeSessionFromCategory = createAsyncThunk(
    'categories/removeSessionFromCategory',
    async ({ categoryId, sessionId }: { categoryId: string; sessionId: string }, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_BASE_URL}/${categoryId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch category for removing session');
            }
            const category = await response.json();

            const updatedSessions = category.sessions.filter((sess: TimerSession) => sess.id !== sessionId);

            const updateResponse = await fetch(`${API_BASE_URL}/${categoryId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ...category, sessions: updatedSessions }),
            });

            if (!updateResponse.ok) {
                throw new Error('Failed to update category after removing session');
            }

            return { categoryId, sessionId };
        } catch (error) {
            return rejectWithValue((error as Error).message);
        }
    }
);

export const markSessionComplete = createAsyncThunk(
    'categories/markSessionComplete',
    async ({ categoryId, sessionId }: { categoryId: string; sessionId: string }, { rejectWithValue }) => {
        try {
            const response = await fetch(`${API_BASE_URL}/${categoryId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch category for marking session complete');
            }
            const category = await response.json();
            const updatedSessions = category.sessions.map((sess: TimerSession) =>
                sess.id === sessionId ? { ...sess, status: 'Completed' } : sess
            );

            const updateResponse = await fetch(`${API_BASE_URL}/${categoryId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ...category, sessions: updatedSessions }),
            });

            if (!updateResponse.ok) {
                throw new Error('Failed to update category after marking session complete');
            }

            return { categoryId, sessionId };
        } catch (error) {
            return rejectWithValue((error as Error).message);
        }
    }
);

// Создаем Slice для управления состоянием категорий
const categorySlice = createSlice({
    name: 'categories',
    initialState,
    reducers: {
        setCategories(state, action: PayloadAction<Category[]>) {
            state.categories = action.payload;
        },
        updateCategory(state, action: PayloadAction<Category>) {
            const index = state.categories.findIndex((cat) => cat.id === action.payload.id);
            if (index >= 0) {
                state.categories[index] = action.payload;
            }
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCategories.fulfilled, (state, action) => {
                state.categories = action.payload;
            })
            .addCase(createCategory.fulfilled, (state, action) => {
                state.categories.push(action.payload);
            })
            .addCase(deleteCategory.fulfilled, (state, action) => {
                state.categories = state.categories.filter((cat) => cat.id !== action.payload);
            })
            .addCase(addSession.fulfilled, (state, action) => {
                const category = state.categories.find((cat) => cat.id === action.payload.categoryId);
                if (category) {
                    category.sessions.push(action.payload.session);
                }
            })
            .addCase(removeSessionFromCategory.fulfilled, (state, action) => {
                const category = state.categories.find((cat) => cat.id === action.payload.categoryId);
                if (category) {
                    category.sessions = category.sessions.filter((sess) => sess.id !== action.payload.sessionId);
                }
            })
            .addCase(markSessionComplete.fulfilled, (state, action) => {
                const category = state.categories.find((cat) => cat.id === action.payload.categoryId);
                if (category) {
                    const session = category.sessions.find((sess) => sess.id === action.payload.sessionId);
                    if (session) {
                        session.status = 'Completed';
                    }
                }
            });
    },
});

// Экспортируем действия и редьюсер
export const {
    setCategories,
    updateCategory,
} = categorySlice.actions;
export default categorySlice.reducer;
