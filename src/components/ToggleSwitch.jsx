import React from 'react';
import './ToggleSwitch.css';

const ToggleSwitch = ({ label, checked, onChange }) => {
    return (
        <div className="toggle-switch">
            <input
                type="checkbox"
                className="toggle-switch-checkbox"
                checked={checked}
                onChange={e => onChange(e.target.checked)}
                id={label}
            />
            <label className="toggle-switch-label" htmlFor={label}>
                <span className="toggle-switch-inner" />
                <span className="toggle-switch-switch" />
            </label>
            <span className="toggle-switch-text">{label}</span>
        </div>
    );
};

export default ToggleSwitch;
