import React from 'react';
import './WarningBoard.css';

const WarningBoard = ({
                          name = 'Табло',
                          value = 0,
                          ranges = [],
                          message = '',
                          level = 'INFO',
                          width = 300,
                          height = 100
                      }) => {
    const numWidth = parseInt(width, 10) || 300;
    const numHeight = parseInt(height, 10) || 100;
    const widthRem = numWidth / 16;
    const heightRem = numHeight / 16;

    const activeRange = ranges && ranges.length > 0
        ? ranges.find(r => value >= r.min && value <= r.max)
        : null;

    const currentLevel = activeRange ? activeRange.level : level;
    const currentMessage = activeRange ? activeRange.message : message;

    const levelStyles = {
        INFO: { bg: 'var(--panel-bg)', color: 'var(--text-main)', icon: '', border: 'var(--panel-border)' },
        WARNING: { bg: 'rgba(180, 80, 0, 0.8)', color: '#fbbf24', icon: '⚠️', border: '#d97706' },
        ALARM: { bg: 'rgba(220, 38, 38, 0.8)', color: '#f87171', icon: '🚨', border: 'var(--danger-main)' }
    };

    const currentStyle = levelStyles[currentLevel] || levelStyles.INFO;
    const isOk = currentLevel === 'INFO';

    return (
        <div className="warning-board-container" style={{
            width: `${widthRem}rem`,
            height: `${heightRem}rem`,
            backgroundColor: currentStyle.bg,
            borderColor: currentStyle.border
        }}>
            <div className="warning-board-header" style={{ color: isOk ? 'var(--text-main)' : 'white' }}>
                {name} {ranges.length > 0 && <span style={{ opacity: 0.7, float: 'right' }}>[{value}]</span>}
            </div>

            <div className="warning-board-content" style={{ color: currentStyle.color, justifyContent: 'center' }}>
                {!isOk && (
                    <>
                        <span className="warning-icon">{currentStyle.icon}</span>
                        <span className="warning-message">{currentMessage}</span>
                    </>
                )}
            </div>
        </div>
    );
};

export default WarningBoard;
