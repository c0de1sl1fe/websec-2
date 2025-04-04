// Получаем ID группы/преподавателя
export const searchEntity = async (query) => {
    const response = await fetch(`http://localhost:3001/api/search?q=${encodeURIComponent(query)}`);

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText.includes('<html') ? 'Server returned HTML instead of JSON' : errorText);
    }

    return await response.json();
};

// Получаем расписание по ID
export const fetchSchedule = async (type, id, week = null) => {
    const endpoint = type === 'group' ? 'group' : 'teacher';
    const paramName = type === 'group' ? 'groupId' : 'staffId';

    const response = await fetch(
        `http://localhost:3001/api/schedule/${endpoint}?${paramName}=${id}${week ? `&week=${week}` : ''}`
    );

    if (!response.ok) {
        throw new Error('Ошибка при загрузке расписания');
    }

    return await response.json();
};