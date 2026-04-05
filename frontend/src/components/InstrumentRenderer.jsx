import React from 'react';
import DialGauge from './DialGauge';
import WarningBoard from './WarningBoard';

const InstrumentRenderer = ({ inst }) => {
    if (inst.type === 'DIAL_GAUGE') {
        return (
            <DialGauge
                name={inst.name}
                min={inst.min}
                max={inst.max}
                value={inst.currentValue || 0}
                unit={inst.unit}
                size={inst.size}
            />
        );
    }

    if (inst.type === 'WARNING_BOARD') {
        return (
            <WarningBoard
                name={inst.name}
                value={inst.currentValue || 0}
                ranges={inst.ranges || []}
                message={inst.message}
                level={inst.level}
                width={inst.width}
                height={inst.height}
            />
        );
    }

    return null;
};

export default InstrumentRenderer;