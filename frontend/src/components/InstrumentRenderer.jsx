import React from 'react';
import DialGauge from './DialGauge';
import WarningBoard from './WarningBoard'; // ДОДАЛИ ІМПОРТ

const componentMap = {
    'DIAL_GAUGE': DialGauge,
    'WARNING_BOARD': WarningBoard,
};

const InstrumentRenderer = ({ inst }) => {
    const SpecificInstrument = componentMap[inst.type];

    if (!SpecificInstrument) {
        return <div className="instrument-card">Невідомий тип приладу: {inst.type}</div>;
    }

    return <SpecificInstrument {...inst} value={inst.currentValue || inst.min} />;
};

export default InstrumentRenderer;