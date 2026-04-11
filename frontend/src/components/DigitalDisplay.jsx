import React from 'react';

const DigitalDisplay = ({ name, value, unit, width, height, fontFamily }) => {
    const widthInRem = (Number(width) || 250) / 16;
    const heightInRem = (Number(height) || 100) / 16;

    const fontMap = {
        'digital-7': "'Courier New', Courier, monospace",
        'modern': "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        'pixel': "'Press Start 2P', system-ui, monospace"
    };

    const selectedFont = fontMap[fontFamily] || fontMap['modern'];

    return (
        <div className="instrument-card" style={{ width: `${widthInRem}rem`, height: `${heightInRem}rem` }}>
            <div className="instrument-header">
                <div className="instrument-title">{name}</div>
            </div>

            <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
                <div className="instrument-value-group">
                    <span
                        className="instrument-value large"
                        style={{
                            fontFamily: selectedFont,
                            textShadow: '0 2px 15px rgba(168, 85, 247, 0.4)'
                        }}
                    >
                        {value}
                    </span>
                    <span className="instrument-unit">{unit}</span>
                </div>
            </div>
        </div>
    );
};

export default DigitalDisplay;