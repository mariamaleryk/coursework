import React from 'react';
import './ColumnGauge.css';

const ColumnGauge = ({
                         name = 'Прилад',
                         min = 0,
                         max = 100,
                         value = 0,
                         unit = '',
                         height = 180
                     }) => {
    const numMin = Number(min);
    const numMax = Number(max);
    const numValue = Number(value);

    const numericHeight = Number(height) || 180;
    const heightInRem = numericHeight / 16;

    const safeValue = Math.min(Math.max(numValue, numMin), numMax);
    const range = numMax - numMin;
    const percentage = range <= 0 ? 0 : ((safeValue - numMin) / range) * 100;

    const leftTicks = [];
    const rightTicks = [];

    if (range > 0) {
        const uniqueMajorsSet = new Set();
        uniqueMajorsSet.add(numMin);
        uniqueMajorsSet.add(numMax);

        const tickSpacing = numericHeight < 250 ? 60 : 45;
        const targetTickCount = Math.max(2, Math.floor(numericHeight / tickSpacing));

        if (numMin < 0 && numMax > 0) {
            uniqueMajorsSet.add(0);
            const countPos = Math.max(1, Math.round((numMax / range) * targetTickCount));
            const countNeg = Math.max(1, Math.round((Math.abs(numMin) / range) * targetTickCount));

            for (let i = 1; i < countPos; i++) uniqueMajorsSet.add(Number(( (numMax / countPos) * i).toFixed(1)));
            for (let i = 1; i < countNeg; i++) uniqueMajorsSet.add(Number(( (numMin / countNeg) * i).toFixed(1)));
        } else {
            const step = range / targetTickCount;
            for (let i = 1; i < targetTickCount; i++) uniqueMajorsSet.add(Number((numMin + i * step).toFixed(1)));
        }

        const uniqueMajors = Array.from(uniqueMajorsSet).sort((a, b) => a - b);

        uniqueMajors.forEach((val, index) => {
            const tickPos = ((val - numMin) / range) * 100;
            const displayVal = Math.abs(val) < 0.001 ? 0 : val;

            const majorTick = (side) => (
                <div key={`${side}-maj-${val}`} className={`cg-tick-wrapper major ${side}`} style={{ bottom: `${tickPos}%` }}>
                    <div className="cg-tick-label">{displayVal}</div>
                    <div className="cg-tick-mark"></div>
                </div>
            );

            leftTicks.push(majorTick('left'));
            rightTicks.push(majorTick('right'));

            if (index > 0) {
                const prevVal = uniqueMajors[index - 1];
                const minorVal = prevVal + (val - prevVal) / 2;
                const minorPos = ((minorVal - numMin) / range) * 100;

                const minorTick = (side) => (
                    <div key={`${side}-min-${minorVal}`} className={`cg-tick-wrapper minor ${side}`} style={{ bottom: `${minorPos}%` }}>
                        <div className="cg-tick-mark" style={{ opacity: 0.3, width: '0.45rem', height: '0.1rem' }}></div>
                    </div>
                );

                leftTicks.push(minorTick('left'));
                rightTicks.push(minorTick('right'));
            }
        });
    }

    return (
        <div className="instrument-card" style={{ minWidth: '15rem' }}>
            <div className="instrument-header" style={{ alignItems: 'center', marginBottom: '0.5rem', gap: '1rem' }}>
                <div className="instrument-title">{name}</div>
                <div className="instrument-value-group">
                    <span className="instrument-value accent" style={{ textShadow: '0 0 10px rgba(168, 85, 247, 0.3)' }}>
                        {safeValue}
                    </span>
                    <span className="instrument-unit">{unit}</span>
                </div>
            </div>

            <div className="cg-body">
                <div className="cg-scale-column left" style={{ height: `${heightInRem}rem` }}>
                    {leftTicks}
                </div>

                <div className="cg-flask-container">
                    <div className="cg-flask-stem" style={{ height: `${heightInRem}rem` }}>
                        <div className="cg-flask-fill" style={{ height: `${Math.max(0, Math.min(100, percentage))}%` }}>
                            <div className="cg-flask-glow"></div>
                        </div>
                    </div>
                    <div className="cg-flask-bulb"></div>
                </div>

                <div className="cg-scale-column right" style={{ height: `${heightInRem}rem` }}>
                    {rightTicks}
                </div>
            </div>
        </div>
    );
};

export default ColumnGauge;