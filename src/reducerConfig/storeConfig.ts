import { configureStore, createAsyncThunk } from '@reduxjs/toolkit';
import categoryReducer from '../reducers/categoryReducer';
import axios from 'axios';

// Базовый URL JSON-сервера
const API_BASE_URL = 'http://localhost:3001/0';

// Асинхронные экшены для получения категорий с сервера
export const fetchCategories = createAsyncThunk(
    'categories/fetchCategories',
    async () => {
        const response = await axios.get(`${API_BASE_URL}`);
        return response.data.categories;
    }
);

// Асинхронные экшены для добавления сессий
export const addSessionToCategory = createAsyncThunk(
    'categories/addSession',
    async ({ categoryId, session }: { categoryId: number; session: any }) => {
        const response = await axios.get(`${API_BASE_URL}`);
        const categories = response.data.categories.map((cat: any) => {
            if (cat.id === categoryId) {
                return {
                    ...cat,
                    sessions: [...cat.sessions, session]
                };
            }
            return cat;
        });
        await axios.patch(`${API_BASE_URL}`, { categories });
        return { categoryId, session };
    }
);

// Асинхронные экшены для удаления сессии
export const deleteSession = createAsyncThunk(
    'categories/deleteSession',
    async ({ categoryId, sessionId }: { categoryId: number; sessionId: number }) => {
        const response = await axios.get(`${API_BASE_URL}`);
        const categories = response.data.categories.map((cat: any) => {
            if (cat.id === categoryId) {
                return {
                    ...cat,
                    sessions: cat.sessions.filter((sess: any) => sess.id !== sessionId)
                };
            }
            return cat;
        });
        await axios.patch(`${API_BASE_URL}`, { categories });
        return { categoryId, sessionId };
    }
);

// Создаем store с использованием configureStore
const storeConfig = configureStore({
    reducer: {
        categories: categoryReducer,
    },
});

// Экспортируем store
export type RootState = ReturnType<typeof storeConfig.getState>;
export type AppDispatch = typeof storeConfig.dispatch;
export { storeConfig };
