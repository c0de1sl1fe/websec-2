const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

const { parseSchedule } = require('../parser');
const cache = require('../cache');

// Функция для безопасной загрузки JSON
function loadJsonFile(filename) {
    try {
        const filePath = path.join(__dirname, '..', 'data', filename);
        if (!fs.existsSync(filePath)) {
            console.warn(`Файл ${filename} не найден. Создан пустой объект.`);
            return {};
        }
        const content = fs.readFileSync(filePath, 'utf8');
        return content ? JSON.parse(content) : {};
    } catch (e) {
        console.error(`Ошибка загрузки ${filename}:`, e.message);
        return {};
    }
}

const lecturers = loadJsonFile('lecturers.json');
const groups = loadJsonFile('groups.json');

router.get('/', (req, res) => {
    const query = req.query.q?.toLowerCase();
    if (!query) return res.status(400).json({ error: 'Пустой запрос' });

    // Ищем группу
    const group = Object.entries(groups).find(([name]) => name.toLowerCase().includes(query));
    if (group) return res.json({ type: 'group', id: group[1], name: group[0] });

    // Ищем преподавателя
    const lecturer = Object.entries(lecturers).find(([name]) => name.toLowerCase().includes(query));
    if (lecturer) return res.json({ type: 'teacher', id: lecturer[1], name: lecturer[0] });

    res.status(404).json({ error: 'Ничего не найдено' });
});

module.exports = router;

// Явное указание метода GET
router.get('/group', async (req, res) => {
    const { groupId, week } = req.query;

    if (!groupId) {
        return res.status(400).json({
            error: 'Укажите параметр groupId',
            example: '/api/schedule/group?groupId=1282690279'
        });
    }

    try {
        const cacheKey = `groupId-${groupId}-${week || 'current'}`;
        const data = await cache.getOrSet(cacheKey, () =>
            parseSchedule('groupId', groupId, week)
        );

        if (!data || !data.schedule) {
            return res.status(404).json({
                error: 'Расписание не найдено',
                details: `Группа ${groupId} не существует или нет данных`
            });
        }

        res.json(data);
    } catch (error) {
        console.error('Ошибка:', error);
        res.status(500).json({
            error: 'Ошибка сервера',
            details: error.message
        });
    }
});

router.get('/teacher', async (req, res) => {
    const { staffId, week } = req.query;

    if (!staffId) {
        return res.status(400).json({
            error: 'Укажите параметр staffId',
            example: '/api/schedule/teacher?staffId=12345'
        });
    }

    try {
        const cacheKey = `staffId-${staffId}-${week || 'current'}`;
        const data = await cache.getOrSet(cacheKey, () =>
            parseSchedule('staffId', staffId, week)
        );

        if (!data?.schedule?.length) {
            return res.status(404).json({
                error: 'Расписание не найдено',
                details: `Преподаватель ${staffId} не существует или нет данных`
            });
        }

        res.json(data);
    } catch (error) {
        console.error('Ошибка:', error);
        res.status(500).json({
            error: 'Ошибка сервера',
            details: error.message
        });
    }
});

module.exports = router;
