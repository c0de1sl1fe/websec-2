import React from 'react';

const WeekNavigation = ({ currentWeek, onChangeWeek, disabled }) => {
    const handlePrevWeek = () => {
        if (!disabled) onChangeWeek(currentWeek - 1);
    };

    const handleNextWeek = () => {
        if (!disabled) onChangeWeek(currentWeek + 1);
    };

    return (
        <div className="week-navigation">
            <button
                onClick={handlePrevWeek}
                disabled={disabled}
            >
                Предыдущая неделя
            </button>

            <span>Текущая неделя: {currentWeek}</span>

            <button
                onClick={handleNextWeek}
                disabled={disabled}
            >
                Следующая неделя
            </button>
        </div>
    );
};

export default WeekNavigation;