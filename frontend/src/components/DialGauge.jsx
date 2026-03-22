import React from 'react';
import './DialGauge.css';

const DialGauge = ({ name = 'Прилад', min = 0, max = 100, value = 0, unit = '', size = 200 }) => {
    const numMin = Number(min) || 0;
    const numMax = Number(max) || 100;
    const numValue = Number(value) || 0;

    const numericSize = parseInt(size, 10) || 200;
    const scale = numericSize / 200;

    const cx = 100;
    const cy = 100;
    const radius = 88;

    const startAngle = -225;
    const totalSweep = 270;

    const safeValue = Math.min(Math.max(numValue, numMin), numMax);
    const range = numMax - numMin;
    const percentage = range === 0 ? 0 : (safeValue - numMin) / range;
    const rotation = startAngle + (percentage * totalSweep) + 90;

    const polarToCartesian = (angleInDegrees, r) => {
        const angleInRadians = (angleInDegrees) * Math.PI / 180.0;
        return {
            x: cx + (r * Math.cos(angleInRadians)),
            y: cy + (r * Math.sin(angleInRadians))
        };
    };

    const majorTicksCount = 8;
    const minorTicksPerMajor = 4;
    const ticks = [];
    const tickLabels = [];

    for (let i = 0; i <= majorTicksCount; i++) {
        const tickAngle = startAngle + (i * (totalSweep / majorTicksCount));
        const labelValue = Math.round(numMin + (i * range / majorTicksCount));

        const pStart = polarToCartesian(tickAngle, radius);
        const pEnd = polarToCartesian(tickAngle, radius - 12);

        ticks.push(<line key={`major-${i}`} x1={pStart.x} y1={pStart.y} x2={pEnd.x} y2={pEnd.y} stroke="white" strokeWidth="2.5" strokeLinecap="round" />);

        const pText = polarToCartesian(tickAngle, radius - 26);
        tickLabels.push(
            <text key={`label-${i}`} x={pText.x} y={pText.y + 4} fontSize="12" textAnchor="middle" fill="white" fontWeight="bold">{labelValue}</text>
        );

        if (i < majorTicksCount) {
            for (let j = 1; j < minorTicksPerMajor; j++) {
                const minorAngle = tickAngle + (j * (totalSweep / majorTicksCount / minorTicksPerMajor));
                const p1 = polarToCartesian(minorAngle, radius);
                const p2 = polarToCartesian(minorAngle, radius - 6);
                ticks.push(<line key={`minor-${i}-${j}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#8a8d91" strokeWidth="1" strokeLinecap="round" />);
            }
        }
    }

    const exactHeight = 230 * scale;

    return (
        <div style={{
            width: `${numericSize}px`,
            height: `${exactHeight}px`,
            position: 'relative'
        }}>
            <div className="instrument-wrapper" style={{
                transform: `scale(${scale})`,
                transformOrigin: 'top center',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '200px',
                height: '230px'
            }}>
                <div className="instrument-external-title">{name}</div>

                <div className="gauge-container" style={{ width: '200px', height: '200px' }}>
                    <div className="gauge-wrapper">
                        <svg width="200" height="200" viewBox="0 0 200 200">
                            {ticks}
                            {tickLabels}

                            <g transform={`translate(${cx}, ${cy}) rotate(${rotation || 0})`} style={{ transition: 'transform 0.5s ease-in-out' }}>
                                <polygon points="-3.5,0 3.5,0 0,-92" fill="#e74c3c" stroke="#e74c3c" strokeWidth="1" strokeLinejoin="round" />
                            </g>

                            <circle cx={cx} cy={cy} r="12" fill="#2c3e50" stroke="#b1b3b5" strokeWidth="3" />
                            <circle cx={cx} cy={cy} r="4" fill="#1a1a1a" />
                        </svg>

                        <div className="gauge-display-block">
                            <div className="gauge-value-display">{safeValue}</div>
                            <div className="gauge-unit">{unit}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DialGauge;