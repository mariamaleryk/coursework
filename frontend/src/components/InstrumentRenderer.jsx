import React from 'react';
import DialGauge from './DialGauge';
import WarningBoard from './WarningBoard';
import SliderControl from './SliderControl';
import ColumnGauge from './ColumnGauge';
import DigitalDisplay from "./DigitalDisplay.jsx";

const InstrumentRenderer = ({ inst }) => {
    if (!inst) return null;

    if (inst.type === 'DIAL_GAUGE') {
        return <DialGauge name={inst.name} min={inst.min} max={inst.max} value={inst.currentValue || 0} unit={inst.unit} size={inst.size} colorTheme={inst.colorTheme} />;
    }

    if (inst.type === 'WARNING_BOARD') {
        return <WarningBoard name={inst.name} value={inst.currentValue || 0} ranges={inst.ranges || []} width={inst.width} height={inst.height} />;
    }

    if (inst.type === 'SLIDER_CONTROL') {
        return <SliderControl name={inst.name} min={inst.min} max={inst.max} value={inst.currentValue || 0} unit={inst.unit} />;
    }

    if (inst.type === 'COLUMN_GAUGE') {
        return (
            <ColumnGauge
                name={inst.name}
                min={inst.min}
                max={inst.max}
                value={inst.currentValue || 0}
                unit={inst.unit}
                height={inst.height}
                colorTheme={inst.colorTheme}
            />
        );
    }
    if (inst.type === 'DIGITAL_DISPLAY') {
        return (
            <DigitalDisplay
                name={inst.name}
                value={inst.currentValue || 0}
                unit={inst.unit}
                width={inst.width}
                height={inst.height}
                fontFamily={inst.fontFamily}
            />
        );
    }

    return null;
};

export default InstrumentRenderer;