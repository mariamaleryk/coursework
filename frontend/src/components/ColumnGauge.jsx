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
    const numMin = Number(min) || 0;
    const numMax = Number(max) || 100;
    const numValue = Number(value) || 0;
    const numericHeight = Number(height) || 180;

    const safeValue = Math.min(Math.max(numValue, numMin), numMax);
    const range = numMax - numMin;
    const percentage = range === 0 ? 0 : ((safeValue - numMin) / range) * 100;

    const leftTicks = [];
    const rightTicks = [];

    const targetTickCount = Math.max(2, Math.floor(numericHeight / 40));

    let rawStep = range / targetTickCount;
    const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep || 1)));
    const normalizedStep = rawStep / magnitude;

    const allowedSteps = [1, 2, 2.5, 4, 5, 10];
    let step = allowedSteps.find(s => s >= normalizedStep) * magnitude;
    if (!step) step = 10 * magnitude;

    const uniqueMajors = [];
    let startVal = Math.ceil(numMin / step) * step;
    let endVal = Math.floor(numMax / step) * step;

    for (let val = startVal; val <= endVal + 1e-9; val += step) {
        uniqueMajors.push(Math.round(val * 100) / 100);
    }

    const pxPerStep = (step / range) * numericHeight;
    let minorTicksPerSection = 0;
    if (pxPerStep >= 50) minorTicksPerSection = 4;
    else if (pxPerStep >= 20) minorTicksPerSection = 1;

    uniqueMajors.forEach((val, index) => {
        const tickPos = ((val - numMin) / range) * 100;
        const displayVal = Math.abs(val) < 0.001 ? 0 : val;

        leftTicks.push(
            <div key={`l-maj-${val}`} className="cg-tick-wrapper major left" style={{ bottom: `${tickPos}%` }}>
                <div className="cg-tick-label">{displayVal}</div>
                <div className="cg-tick-mark"></div>
            </div>
        );
        rightTicks.push(
            <div key={`r-maj-${val}`} className="cg-tick-wrapper major right" style={{ bottom: `${tickPos}%` }}>
                <div className="cg-tick-label">{displayVal}</div>
                <div className="cg-tick-mark"></div>
            </div>
        );

        if (index > 0 && minorTicksPerSection > 0) {
            const prevVal = uniqueMajors[index - 1];
            const valDiff = val - prevVal;

            for (let j = 1; j <= minorTicksPerSection; j++) {
                const minorVal = prevVal + (valDiff * j) / (minorTicksPerSection + 1);
                const minorPos = ((minorVal - numMin) / range) * 100;

                leftTicks.push(<div key={`l-min-${minorVal}`} className="cg-tick-wrapper minor left" style={{ bottom: `${minorPos}%` }}><div className="cg-tick-mark"></div></div>);
                rightTicks.push(<div key={`r-min-${minorVal}`} className="cg-tick-wrapper minor right" style={{ bottom: `${minorPos}%` }}><div className="cg-tick-mark"></div></div>);
            }
        }
    });

    return (
        <div className="column-gauge-card">
            <div className="cg-header">
                <div className="cg-name">{name}</div>
                <div className="cg-display-value">{safeValue}<span className="cg-unit">{unit}</span></div>
            </div>

            <div className="cg-body">
                <div className="cg-scale-column left" style={{ height: `${numericHeight}px` }}>
                    {leftTicks}
                </div>

                <div className="cg-flask-container">
                    <div className="cg-flask-stem" style={{ height: `${numericHeight}px` }}>
                        <div className="cg-flask-fill" style={{ height: `${Math.max(0, Math.min(100, percentage))}%` }}>
                            <div className="cg-flask-glow"></div>
                        </div>
                    </div>
                    <div className="cg-flask-bulb"></div>
                </div>

                <div className="cg-scale-column right" style={{ height: `${numericHeight}px` }}>
                    {rightTicks}
                </div>
            </div>
        </div>
    );
};

export default ColumnGauge;