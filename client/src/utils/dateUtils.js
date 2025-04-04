export const formatDate = (dateString) => {
    console.log("Received date string:", dateString);

    const parsedDate = new Date(dateString.replace(/(\d{2})\.(\d{2})\.(\d{4})/, '$3-$2-$1'));

    if (isNaN(parsedDate.getTime())) {
        console.error("Invalid date:", dateString);
        return "Неверная дата";
    }

    return new Intl.DateTimeFormat('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    }).format(parsedDate);
};


// Остальные функции (убедитесь, что они экспортируются)
export const getCurrentAcademicWeek = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    let academicYearStart = new Date(currentYear, 8, 1);

    if (now < academicYearStart) {
        academicYearStart = new Date(currentYear - 1, 8, 1);
    }

    const diff = now - academicYearStart;
    const weeks = Math.floor(diff / 604800000) + 1;
    return weeks > 0 ? weeks : 1;
};

export const formatRussianDate = (date) => {
    const options = {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    };
    return date.toLocaleDateString('ru-RU', options);
};

export const getDateByAcademicWeek = (weekNumber) => {
    const currentYear = new Date().getFullYear();
    let academicYearStart = new Date(currentYear, 8, 1);

    if (new Date() < academicYearStart) {
        academicYearStart = new Date(currentYear - 1, 8, 1);
    }

    const targetDate = new Date(academicYearStart);
    targetDate.setDate(academicYearStart.getDate() + (weekNumber - 1) * 7);
    return targetDate;
};