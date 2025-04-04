// const NodeCache = require('node-cache');
// const cache = new NodeCache({
//     stdTTL: 3600, // Кэш на 1 час
//     maxKeys: 1000, // Лимит записей
//     useClones: false // Для производительности
// });
//
// async function getOrSet(key, fetchData) {
//     const cached = cache.get(key);
//     if (cached) {
//         console.log(`[Cache] Hit for key: ${key}`);
//         return cached;
//     }
//
//     console.log(`[Cache] Miss for key: ${key}`);
//     const data = await fetchData();
//     cache.set(key, data);
//     return data;
// }
//
// function flushCache() {
//     cache.flushAll();
//     console.log('[Cache] Все данные очищены');
// }
//
// module.exports = {
//     getOrSet,
//     flushCache
// };
const NodeCache = require('node-cache');
const fs = require('fs');
const path = require('path');

const CACHE_FILE = path.join(__dirname, 'cache.json');
const cache = new NodeCache({
    stdTTL: 600, // 10 минут (в секундах)
    checkperiod: 300 // Проверка каждые 5 минут
});

// Загрузка кэша при старте
if (fs.existsSync(CACHE_FILE)) {
    const data = fs.readFileSync(CACHE_FILE, 'utf8');
    cache.mset(JSON.parse(data));
    console.log(`[Cache] Загружено ${cache.keys().length} записей из файла`);
}

// Сохранение кэша при выходе
process.on('SIGINT', () => {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(cache.mget(cache.keys())));
    process.exit();
});

async function getOrSet(key, fetchData) {
    const cached = cache.get(key);
    if (cached) {
        console.log(`[Cache] Использован кэш для ключа: ${key}`);
        return cached;
    }

    console.log(`[Cache] Кэш-промах для ключа: ${key}`);
    const data = await fetchData();
    cache.set(key, data);
    return data;
}

module.exports = { getOrSet, cache };