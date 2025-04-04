const express = require('express');
const fs = require('fs');
const path = require('path');
const { parseSchedule } = require('../parser'); // Импорт парсера расписания

const router = express.Router();

// Загрузка данных
const groups = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/groups.json')));
const lecturers = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/lecturers.json')));

router.get('/', async (req, res) => {
    const query = req.query.q?.trim().toLowerCase();
    const week = req.query.week || 1;

    if (!query) {
        return res.status(400).json({ error: 'Пустой запрос' });
    }

    // Поиск группы
    const groupEntry = Object.entries(groups).find(([name]) =>
        name.toLowerCase().includes(query)
    );

    if (groupEntry) {
        const [groupName, groupId] = groupEntry;
        try {
            const schedule = await parseSchedule('group', groupId, week);
            return res.json({
                type: 'group',
                id: groupId,
                name: groupName,
                schedule,
                week: parseInt(week)
            });
        } catch (error) {
            return res.status(500).json({
                error: 'Ошибка загрузки расписания',
                details: error.message
            });
        }
    }

    // Поиск преподавателя
    const lecturerEntry = Object.entries(lecturers).find(([name]) =>
        name.toLowerCase().includes(query)
    );

    if (lecturerEntry) {
        const [lecturerName, lecturerId] = lecturerEntry;
        try {
            const schedule = await parseSchedule('teacher', lecturerId, week);
            return res.json({
                type: 'teacher',
                id: lecturerId,
                name: lecturerName,
                schedule,
                week: parseInt(week)
            });
        } catch (error) {
            return res.status(500).json({
                error: 'Ошибка загрузки расписания',
                details: error.message
            });
        }
    }

    res.status(404).json({ error: 'Ничего не найдено' });
});

module.exports = router;
