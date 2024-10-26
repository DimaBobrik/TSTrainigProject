import { configureStore } from '@reduxjs/toolkit';
import categoryReducer from '../reducers/categoryReducer.ts';

// Middleware для синхронизации с Local Storage
const localStorageMiddleware = store => next => action => {
  const result = next(action);
  // Получаем актуальное состояние
  const state = store.getState();
  // Сохраняем категории в Local Storage
  localStorage.setItem('categories', JSON.stringify(state.categories.categories));
  return result;
};

// Загрузка данных из Local Storage при инициализации
const preloadedState = {
  categories: {
    categories: JSON.parse(localStorage.getItem('categories') || '[]'),
  },
};

// Создаем store с использованием configureStore
const storeConfig = configureStore({
  reducer: {
    categories: categoryReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(localStorageMiddleware),
  preloadedState,
});

// Экспортируем store
export type RootState = ReturnType<typeof storeConfig.getState>;
export type AppDispatch = typeof storeConfig.dispatch;
export { storeConfig };