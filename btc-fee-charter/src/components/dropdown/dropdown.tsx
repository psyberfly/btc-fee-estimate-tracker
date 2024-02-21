import React from 'react';
import './dropdown.css'; // Import the CSS file for DropdownButton styling

const TimerangeSelector = ({ options, onChange }) => {
  return (
    <div className="dropdown">
      <label htmlFor="timeRange">
        {/* <i className="material-icons">access_time</i> Clock icon */}
        Time Range:
      </label>
      <select id="timeRange" onChange={onChange}>
        {options.map((option, index) => (
          <option key={index} value={option}>{option}</option>
        ))}
      </select>
    </div>
  );
}

export default TimerangeSelector;
