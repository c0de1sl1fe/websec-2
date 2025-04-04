const axios = require('axios');
const cheerio = require('cheerio');

async function parseSchedule(type, id, week = null) {
    try {
        const url = `https://ssau.ru/rasp?${type}=${id}${week ? `&selectedWeek=${week}` : ''}`;
        console.log(`[PARSER] Запрашиваю URL: ${url}`); // Логируем URL

        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        console.log(`[PARSER] Получен ответ, статус: ${response.status}, длина HTML: ${response.data.length}`);

        if (!response.data || response.data.length < 1000) {
            throw new Error('Слишком короткий HTML-ответ, возможно страница не загрузилась');
        }

        const $ = cheerio.load(response.data);
        console.log('[PARSER] Cheerio инициализирован');

        // Парсинг основной информации
        const entityName = $('h1').text().trim().replace(/^Расписание,\s*/, '');
        console.log(`[PARSER] Название: ${entityName}`);

        const weekNumber = parseInt($('.week-nav-current_week').text().trim().match(/\d+/)?.[0] || 1);
        console.log(`[PARSER] Неделя: ${weekNumber}`);

        // Парсинг расписания
        const schedule = [];
        const days = [];

        // Получаем дни недели
        $('.schedule__head').each((i, el) => {
            const day = $(el).find('.schedule__head-weekday').text().trim();
            const date = $(el).find('.schedule__head-date').text().trim();
            if (day && date) days.push({ day, date });
        });
        console.log(`[PARSER] Найдено дней: ${days.length}`);

        // Парсим временные слоты
        const times = [];
        $('.schedule__time').each((i, el) => {
            times.push($(el).text().trim().replace(/\s+/g, ' '));
        });
        console.log(`[PARSER] Найдено временных слотов: ${times.length}`);

        // Парсим занятия
        let lessonsCount = 0;
        $('.schedule__item').not('.schedule__head').each((i, el) => {
            const dayIndex = i % days.length;
            const timeIndex = Math.floor(i / days.length);
            const $cell = $(el);

            $cell.find('.schedule__lesson').each((j, lessonEl) => {
                lessonsCount++;
                const $lesson = $(lessonEl);

                try {
                    const lessonData = {
                        day: days[dayIndex],
                        time: times[timeIndex],
                        type: $lesson.find('.schedule__lesson-type').text().trim(),
                        subject: $lesson.find('.schedule__discipline').text().trim(),
                        teacher: {
                            name: $lesson.find('.schedule__teacher').text().trim(),
                            id: $lesson.find('.schedule__teacher a').attr('href')?.match(/staffId=(\d+)/)?.[1]
                        },
                        room: $lesson.find('.schedule__place').text().trim(),
                        groups: []
                    };

                    // Парсинг групп
                    $lesson.find('.schedule__groups a').each((k, groupEl) => {
                        const $group = $(groupEl);
                        lessonData.groups.push({
                            name: $group.text().trim(),
                            id: $group.attr('href')?.match(/groupId=(\d+)/)?.[1]
                        });
                    });

                    schedule.push(lessonData);
                } catch (e) {
                    console.error(`[PARSER] Ошибка парсинга занятия ${lessonsCount}:`, e);
                }
            });
        });
        console.log(`[PARSER] Найдено занятий: ${lessonsCount}`);

        return {
            entity: {
                id,
                type: type === 'groupId' ? 'group' : 'teacher',
                name: entityName
            },
            week: weekNumber,
            days,
            schedule
        };

    } catch (error) {
        console.error(`[PARSER] Критическая ошибка парсинга ${type} ${id}:`, error);
        throw new Error(`Не удалось получить расписание: ${error.message}`);
    }
}

module.exports = { parseSchedule };