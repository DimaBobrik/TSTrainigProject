import jsonServer from "json-server";
import express from 'express';

const server = express();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

server.use(middlewares);

// Настройка маршрутов
server.use(jsonServer.rewriter({
  "/api/categories": "/categories",
  "/api/categories/:categoryId/sessions": "/categories/:categoryId/sessions"
}));

server.use(router);

// Запуск сервера на порту 3001
server.listen(3001, () => {
  console.log('JSON Server is running on http://localhost:3001');
});
