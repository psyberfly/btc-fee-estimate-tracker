import React from 'react';
import './dropdown.css'; // Import the CSS file for DropdownButton styling

const TimeUnitSelector = ({ options, onChange }) => {
  return (
    <div className="dropdown">
      <label htmlFor="timeRange">
        Range:
      </label>
      <select id="timeRange" onChange={onChange}>
        {options.map((option, index) => (
          <option key={index} value={option}>{option}</option>
        ))}
      </select>
    </div>
  );
}

export default TimeUnitSelector;
