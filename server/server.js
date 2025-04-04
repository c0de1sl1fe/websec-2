const express = require('express');
const cors = require('cors');
const scheduleRoutes = require('./routes/schedule');
const searchRoutes = require('./routes/search');

const app = express();
app.use(cors());
app.use(express.json());

// Правильное подключение роутов
app.use('/api/schedule', scheduleRoutes); // Префикс /api/schedule
app.use('/api/search', searchRoutes);

const PORT = 3001;
app.listen(PORT, () => console.log(`Сервер запущен на http://localhost:${PORT}`));

console.log('Подключенные роуты:');
console.log('- /api/schedule', !!scheduleRoutes);
console.log('- /api/search', !!searchRoutes);
