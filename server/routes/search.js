const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Пути к файлам данных
const GROUPS_PATH = path.join(__dirname, '../data/groups.json');
const LECTURERS_PATH = path.join(__dirname, '../data/lecturers.json');

// Логируем загрузку файлов
console.log(`[Search] Загружаем группы из: ${GROUPS_PATH}`);
console.log(`[Search] Загружаем преподавателей из: ${LECTURERS_PATH}`);

// Безопасная загрузка JSON
function loadJsonFile(filePath) {
    try {
        if (!fs.existsSync(filePath)) {
            console.error(`[Search] Файл не найден: ${filePath}`);
            return {};
        }
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error(`[Search] Ошибка загрузки ${filePath}:`, err.message);
        return {};
    }
}

const groups = loadJsonFile(GROUPS_PATH);
const lecturers = loadJsonFile(LECTURERS_PATH);

// Логируем количество загруженных данных
console.log(`[Search] Загружено групп: ${Object.keys(groups).length}`);
console.log(`[Search] Загружено преподавателей: ${Object.keys(lecturers).length}`);

router.get('/', (req, res) => {
    const query = req.query.q?.trim().toLowerCase();
    console.log(`[Search] Поисковый запрос: "${query}"`);

    if (!query) {
        console.log('[Search] Пустой запрос');
        return res.status(400).json({ error: 'Пустой запрос' });
    }


    // Поиск группы (регистронезависимый)
    const groupMatch = Object.entries(groups).find(([name]) =>
        name.toLowerCase().includes(query)
    );
    if (groupMatch) {
        console.log(`[Search] Найдена группа: ${groupMatch[0]} (ID: ${groupMatch[1]})`);
        return res.json({
            type: 'group',
            id: groupMatch[1],
            name: groupMatch[0]
        });
    }

    // Поиск преподавателя (регистронезависимый)
    const lecturerMatch = Object.entries(lecturers).find(([name]) =>
        name.toLowerCase().includes(query)
    );
    if (lecturerMatch) {
        console.log(`[Search] Найден преподаватель: ${lecturerMatch[0]} (ID: ${lecturerMatch[1]})`);
        return res.json({
            type: 'teacher',
            id: lecturerMatch[1],
            name: lecturerMatch[0]
        });
    }

    console.log(`[Search] Ничего не найдено для "${query}"`);
    res.status(404).json({ error: 'Ничего не найдено' });
});

module.exports = router;