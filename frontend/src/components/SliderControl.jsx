import React from 'react';
import './SliderControl.css';

const SliderControl = ({ name = 'Рівень', min = 0, max = 100, value = 0, unit = '%' }) => {
    const numMin = Number(min) || 0;
    const numMax = Number(max) || 100;
    const numValue = Number(value) || 0;

    const safeValue = Math.min(Math.max(numValue, numMin), numMax);
    const percentage = ((safeValue - numMin) / (numMax - numMin)) * 100;

    return (
        <div className="slider-control-card">
            <div className="slider-header">
                <div className="slider-name">{name}</div>
                <div className="slider-value">{safeValue} <span className="slider-unit">{unit}</span></div>
            </div>

            <div className="slider-track-bg">
                <div
                    className="slider-fill"
                    style={{ width: `${Math.max(0, Math.min(100, percentage))}%` }}
                ></div>
                <div
                    className="slider-thumb-marker"
                    style={{ left: `${Math.max(0, Math.min(100, percentage))}%` }}
                ></div>
            </div>

            <div className="slider-labels">
                <span>{numMin}</span>
                <span>{numMax}</span>
            </div>
        </div>
    );
};

export default SliderControl;