import React, { useState } from 'react';

const SearchBar = ({ onSearch }) => {
    const [inputValue, setInputValue] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSearch(inputValue);
    };

    return (
        <form onSubmit={handleSubmit} className="search-bar">
            <input
                type="text"
                className="search-bar-input"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Введите номер группы или имя преподавателя"
            />
            <button className="week-button" type="submit">Найти</button>
        </form>
    );
};

export default SearchBar;