import React from 'react';
import './WarningBoard.css';

const WarningBoard = ({ name = 'Табло', message = '', level = 'INFO', width = 300, height = 100 }) => {
    const numWidth = parseInt(width, 10) || 300;
    const numHeight = parseInt(height, 10) || 100;

    const levelStyles = {
        INFO: { bg: '#0d1117', color: '#1f2937', icon: '', border: '#1f2937' },
        WARNING: { bg: '#451a03', color: '#fbbf24', icon: '⚠️', border: '#d97706' },
        ALARM: { bg: '#450a0a', color: '#f87171', icon: '🚨', border: '#dc2626' }
    };

    const currentStyle = levelStyles[level] || levelStyles.INFO;
    const isOk = level === 'INFO';

    return (
        <div className="warning-board-container" style={{
            width: `${numWidth}px`,
            height: `${numHeight}px`,
            backgroundColor: currentStyle.bg,
            borderColor: currentStyle.border
        }}>
            <div className="warning-board-header" style={{ color: isOk ? '#4b5563' : 'white' }}>
                {name}
            </div>

            <div className="warning-board-content" style={{ color: currentStyle.color, justifyContent: 'center' }}>
                {!isOk && (
                    <>
                        <span className="warning-icon">{currentStyle.icon}</span>
                        <span className="warning-message">{message}</span>
                    </>
                )}
            </div>
        </div>
    );
};

export default WarningBoard;