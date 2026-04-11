import React from 'react';

const SliderControl = ({ name = 'Рівень', min = 0, max = 100, value = 0, unit = '%' }) => {
    const numMin = Number(min) || 0;
    const numMax = Number(max) || 100;
    const numValue = Number(value) || 0;

    const safeValue = Math.min(Math.max(numValue, numMin), numMax);
    const percentage = ((safeValue - numMin) / (numMax - numMin)) * 100;

    return (
        <div className="instrument-card" style={{ width: '100%', maxWidth: '20rem', minWidth: '10rem' }}>

            <div className="instrument-header" style={{ alignItems: 'center', marginBottom: '0.8rem', gap: '1rem', flexWrap: 'wrap' }}>
                <div className="instrument-title">{name}</div>
                <div className="instrument-value-group">
                    <span className="instrument-value accent" style={{ textShadow: '0 0 10px rgba(168, 85, 247, 0.3)' }}>
                        {safeValue}
                    </span>
                    <span className="instrument-unit">{unit}</span>
                </div>
            </div>

            <div style={{ width: '100%', height: '0.8rem', background: 'rgba(139, 92, 246, 0.15)', borderRadius: '0.4rem', position: 'relative', overflow: 'hidden', marginBottom: '0.5rem' }}>
                <div style={{ height: '100%', background: 'linear-gradient(90deg, #a855f7 0%, #d946ef 100%)', borderRadius: '0.4rem', transition: 'width 0.4s ease', width: `${Math.max(0, Math.min(100, percentage))}%` }}></div>

                <div style={{
                    position: 'absolute', top: 0, height: '100%', width: '0.25rem',
                    background: 'white', boxShadow: '0 0 10px rgba(255,255,255,0.8)',
                    transform: 'translateX(-50%)', transition: 'left 0.4s ease',
                    left: `${Math.max(0, Math.min(100, percentage))}%`
                }}></div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'bold', width: '100%' }}>
                <span>{numMin}</span>
                <span>{numMax}</span>
            </div>
        </div>
    );
};

export default SliderControl;
