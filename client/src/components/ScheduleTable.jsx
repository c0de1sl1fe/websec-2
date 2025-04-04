import React from 'react';
import { formatDate } from '../utils/dateUtils';

const ScheduleTable = ({ schedule }) => {
    if (!schedule || !schedule.schedule || schedule.schedule.length === 0) {
        return <p>Нет данных о расписании на выбранную неделю</p>;
    }

    // Группируем занятия по дням
    const days = schedule.days || [];
    const timeSlots = [...new Set(schedule.schedule.map(lesson => lesson.time))].sort();

    return (
        <div className="schedule-table-container">
            <table className="schedule-table">
                <thead>
                <tr>
                    <th>Время</th>
                    {days.map(day => (
                        <th key={day.date}>
                            {formatDate(day.date)}
                        </th>
                    ))}
                </tr>
                </thead>
                <tbody>
                {timeSlots.map(time => (
                    <tr key={time}>
                        <td>{time}</td>
                        {days.map(day => {
                            const lesson = schedule.schedule.find(l =>
                                l.day.date === day.date && l.time === time
                            );
                            return (
                                <td key={`${day.date}-${time}`}>
                                    {lesson ? (
                                        <div className="lesson-card">
                                            <div className="lesson-type">{lesson.type}</div>
                                            <div className="lesson-subject">{lesson.subject}</div>
                                            <div className="lesson-teacher">{lesson.teacher?.name}</div>
                                            <div className="lesson-room">{lesson.room}</div>
                                            {lesson.groups?.length > 0 && (
                                                <div className="lesson-groups">
                                                    Группы: {lesson.groups.map(g => g.name).join(', ')}
                                                </div>
                                            )}
                                        </div>
                                    ) : null}
                                </td>
                            );
                        })}
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default ScheduleTable;