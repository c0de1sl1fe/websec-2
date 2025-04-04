import React, { useState, useEffect } from 'react';
import SearchBar from '../components/SearchBar';
import WeekNavigation from '../components/WeekNavigation';
import ScheduleTable from '../components/ScheduleTable';
import { searchEntity, fetchSchedule } from '../services/api';

// Функции для работы с датами (можно вынести в отдельный файл)
const getCurrentAcademicWeek = () => {
    const now = new Date();
    const currentYear = now.getFullYear();

    // Дата начала учебного года (1 сентября текущего учебного года)
    let academicYearStart = new Date(currentYear, 8, 1); // 8 = сентябрь

    // Если сейчас январь-август, берем предыдущий учебный год
    if (now < academicYearStart) {
        academicYearStart = new Date(currentYear - 1, 8, 1);
    }

    // Разница в миллисекундах
    const diff = now - academicYearStart;

    // Переводим в недели (1 неделя = 604800000 мс)
    const weeks = Math.floor(diff / 604800000) + 1;

    return weeks > 0 ? weeks : 1; // Минимум 1 неделя
};

const formatRussianDate = (date) => {
    const options = {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    };
    return date.toLocaleDateString('ru-RU', options);
};

const getDateByAcademicWeek = (weekNumber) => {
    const currentYear = new Date().getFullYear();
    let academicYearStart = new Date(currentYear, 8, 1); // 1 сентября

    if (new Date() < academicYearStart) {
        academicYearStart = new Date(currentYear - 1, 8, 1);
    }

    const targetDate = new Date(academicYearStart);
    targetDate.setDate(academicYearStart.getDate() + (weekNumber - 1) * 7);
    return targetDate;
};

const SchedulePage = () => {
    const [query, setQuery] = useState('');
    const [entity, setEntity] = useState(null);
    const [schedule, setSchedule] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [week, setWeek] = useState(getCurrentAcademicWeek());
    const [weekDates, setWeekDates] = useState([]);

    // Обновляем даты недели при изменении номера недели
    useEffect(() => {
        const startDate = getDateByAcademicWeek(week);
        const dates = [];

        for (let i = 0; i < 7; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            dates.push({
                day: date.toLocaleDateString('ru-RU', { weekday: 'short' }),
                date: date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })
            });
        }

        setWeekDates(dates);
    }, [week]);

    const handleSearch = async (searchQuery) => {
        if (!searchQuery.trim()) return;

        setLoading(true);
        setError(null);
        try {
            // 1. Сначала ищем сущность (группу/преподавателя)
            const entityData = await searchEntity(searchQuery);
            setEntity(entityData);
            setQuery(searchQuery);

            // 2. Затем загружаем расписание
            const scheduleData = await fetchSchedule(entityData.type, entityData.id, week);
            setSchedule(scheduleData);
        } catch (err) {
            setError(err.message);
            setEntity(null);
            setSchedule(null);
        } finally {
            setLoading(false);
        }
    };

    const handleWeekChange = (newWeek) => {
        if (!entity || newWeek === week) return;
        setWeek(newWeek);
    };

    // Загружаем расписание при изменении недели
    useEffect(() => {
        if (!entity) return;

        const loadSchedule = async () => {
            setLoading(true);
            try {
                const scheduleData = await fetchSchedule(entity.type, entity.id, week);
                setSchedule(scheduleData);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        loadSchedule();
    }, [week, entity]);

    return (
        <div className="schedule-page">
            <h1 className="page-title">Расписание занятий</h1>

            <SearchBar onSearch={handleSearch} />

            {loading && <p className="loading">Загрузка...</p>}
            {error && <p className="error">{error}</p>}

            {entity && (
                <div className="week-info">
                    <div className="group-name">{entity.name}</div>
                    <div className="week-navigation">
                        <button className="week-button" onClick={() => handleWeekChange(week - 1)} disabled={week === 1}>
                            Назад
                        </button>
                        <div className="current-week">
                            {week} неделя
                            <div className="date-format">
                                {formatRussianDate(getDateByAcademicWeek(week))} - {formatRussianDate(new Date(getDateByAcademicWeek(week).setDate(getDateByAcademicWeek(week).getDate() + 6)))}
                            </div>
                        </div>
                        <button className="week-button" onClick={() => handleWeekChange(week + 1)}>
                            Вперед
                        </button>
                    </div>
                </div>
            )}

            {schedule && (
                <ScheduleTable
                    schedule={schedule}
                    weekDates={weekDates}
                />
            )}
        </div>
    );
};

export default SchedulePage;
