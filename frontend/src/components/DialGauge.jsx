import React from 'react';
import './DialGauge.css';

const DialGauge = ({ name = 'Прилад', min = 0, max = 100, value = 0, unit = '', size = 200 }) => {
    const numMin = Number(min) || 0;
    const numMax = Number(max) || 100;

    const numericSize = parseInt(size, 10) || 200;
    const sizeInRem = numericSize / 16;
    const scale = numericSize / 200;

    const cx = 100;
    const cy = 100;
    const radius = 88;
    const startAngle = -225;
    const totalSweep = 270;
    const safeValue = Math.min(Math.max(Number(value) || 0, numMin), numMax);
    const range = numMax - numMin;
    const percentage = range === 0 ? 0 : (safeValue - numMin) / range;
    const rotation = startAngle + (percentage * totalSweep) + 90;

    const polarToCartesian = (angleInDegrees, r) => {
        const angleInRadians = (angleInDegrees) * Math.PI / 180.0;
        return { x: cx + (r * Math.cos(angleInRadians)), y: cy + (r * Math.sin(angleInRadians)) };
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

        ticks.push(<line key={`major-${i}`} x1={pStart.x} y1={pStart.y} x2={pEnd.x} y2={pEnd.y} stroke="var(--text-main)" strokeWidth="2.5" strokeOpacity="0.8" strokeLinecap="round" />);
        const pText = polarToCartesian(tickAngle, radius - 26);
        tickLabels.push(<text key={`label-${i}`} x={pText.x} y={pText.y + 4} fontSize="12" textAnchor="middle" fill="var(--text-main)" fillOpacity="0.8" fontWeight="bold">{labelValue}</text>);

        if (i < majorTicksCount) {
            for (let j = 1; j < minorTicksPerMajor; j++) {
                const minorAngle = tickAngle + (j * (totalSweep / majorTicksCount / minorTicksPerMajor));
                const p1 = polarToCartesian(minorAngle, radius);
                const p2 = polarToCartesian(minorAngle, radius - 6);
                ticks.push(<line key={`minor-${i}-${j}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="var(--text-main)" strokeWidth="1" strokeOpacity="0.4" strokeLinecap="round" />);
            }
        }
    }

    const exactHeightInRem = (230 * scale) / 16;

    return (
        <div className="" style={{
            width: `${sizeInRem + 2}rem`,
            height: `${sizeInRem + 5}rem`,
            alignItems: 'center',
            justifyContent: 'flex-start',
            gap: '0.8rem'
        }}>
            <div style={{ width: `${sizeInRem}rem`, height: `${exactHeightInRem}rem`, position: 'relative' }}>
                <div className="instrument-wrapper" style={{
                    transform: `scale(${scale})`, transformOrigin: 'top left'
                }}>
                    <div className="instrument-title">{name}</div>

                    <div className="gauge-container" style={{ width: '12.5rem', height: '12.5rem' }}>
                        <div className="gauge-wrapper">
                            <svg width="100%" height="100%" viewBox="0 0 200 200" style={{ pointerEvents: 'none' }}>
                                {ticks}
                                {tickLabels}
                                <text x="100" y="180" className="gauge-dial-unit" textAnchor="middle" fill="var(--text-main)" fillOpacity="0.5">{unit}</text>

                                <g transform={`translate(${cx}, ${cy}) rotate(${rotation || 0})`} style={{ transition: 'transform 0.5s ease-in-out' }}>
                                    <polygon points="-3.5,0 3.5,0 0,-92" fill="var(--danger-main)" stroke="var(--danger-main)" strokeWidth="1" strokeLinejoin="round" />
                                </g>
                                <circle cx={cx} cy={cy} r="12" fill="#2c3e50" stroke="#b1b3b5" strokeWidth="3" />
                                <circle cx={cx} cy={cy} r="4" fill="#1a1a1a" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DialGauge;
