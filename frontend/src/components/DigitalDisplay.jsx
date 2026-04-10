import React from 'react';
import './DigitalDisplay.css';

const DigitalDisplay = ({
                            name = 'Прилад',
                            value = 0,
                            unit = '',
                            width = 250,
                            height = 100,
                            fontFamily = 'modern'
                        }) => {
    return (
        <div
            className="digital-display-card"
            style={{ width: `${width}px`, height: `${height}px` }}
        >
            <div className="dd-header">
                <div className="dd-name">{name}</div>
            </div>

            <div className="dd-screen">
                <div className="dd-value-group">
                    <span className={`dd-value font-${fontFamily}`}>{value}</span>
                    <span className="dd-unit">{unit}</span>
                </div>
            </div>
        </div>
    );
};

export default DigitalDisplay;