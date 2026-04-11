import React, { useState, useEffect, useRef } from 'react';
import DialGauge from './DialGauge';
import WarningBoard from './WarningBoard';
import SliderControl from './SliderControl';
import ColumnGauge from './ColumnGauge';
import DigitalDisplay from './DigitalDisplay';
import './CreateModal.css';

// ============================================================================
// БАЗА ДАНИХ ПРИЛАДІВ (Для автоматичного заповнення)
// ============================================================================
const PREDEFINED_INSTRUMENTS = {
    'Температура води': { unit: '°C', min: 0, max: 120 },
    'Тиск': { unit: 'bar', min: 0, max: 100 },
    'Оберти двигуна': { unit: 'об/хв', min: 0, max: 8000 },
    'Швидкість': { unit: 'км/год', min: 0, max: 220 },
    'Рівень палива': { unit: '%', min: 0, max: 100 },
    'Напруга мережі': { unit: 'В', min: 8, max: 16 },
    'Температура масла': { unit: '°C', min: 0, max: 150 },
    'Тиск масла': { unit: 'bar', min: 0, max: 8 },
    'Заряд батареї': { unit: '%', min: 0, max: 100 },
    'Витрата палива': { unit: 'л/100км', min: 0, max: 30 },
    'Рівень антифризу': { unit: '%', min: 0, max: 100 },
    'Температура вихлопу': { unit: '°C', min: 0, max: 1000 },
    'Тиск турбіни': { unit: 'bar', min: -1, max: 3 },
    'Навантаження': { unit: '%', min: 0, max: 100 },
    'Крутний момент': { unit: 'Nm', min: 0, max: 600 },
    'Запас ходу': { unit: 'км', min: 0, max: 1000 },
    'Температура повітря': { unit: '°C', min: -30, max: 50 },
    'Вологість': { unit: '%', min: 0, max: 100 },
    'Атмосферний тиск': { unit: 'hPa', min: 950, max: 1050 },
    'Швидкість вітру': { unit: 'м/с', min: 0, max: 35 },
    'Напрямок вітру': { unit: '°', min: 0, max: 360 },
    'УФ-індекс': { unit: 'УФ', min: 0, max: 12 },
    'Якість повітря (AQI)': { unit: 'AQI', min: 0, max: 500 }
};

const nameOptions = [
    ...Object.keys(PREDEFINED_INSTRUMENTS).map(k => ({ value: k, label: k })),
    { value: 'CUSTOM', label: '✏️ Власна назва (Ввід вручну)...' }
];

// ============================================================================
// КАСТОМНИЙ СПИСОК
// ============================================================================
const CustomSelect = ({ name, value, options, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = options.find(opt => opt.value === value) || options.find(opt => opt.value === 'CUSTOM');

    const handleSelect = (val) => {
        onChange({ target: { name, value: val } });
        setIsOpen(false);
    };

    return (
        <div className="custom-select-container" ref={dropdownRef}>
            <div className="custom-select-header" onClick={() => setIsOpen(!isOpen)}>
                <span>{selectedOption ? selectedOption.label : 'Оберіть...'}</span>
                <span className={`custom-select-arrow ${isOpen ? 'open' : ''}`}>▼</span>
            </div>

            {isOpen && (
                <ul className="custom-select-list">
                    {options.map(option => (
                        <li
                            key={option.value}
                            className={`custom-select-item ${option.value === value ? 'selected' : ''}`}
                            onClick={() => handleSelect(option.value)}
                        >
                            {option.label}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

const CreateModal = ({ isOpen, onClose, onSave, editingInstrument, availableInstruments = [] }) => {
    const defaultState = {
        type: 'DIAL_GAUGE',
        name: 'Температура води',
        unit: '°C',
        size: 200,
        width: 300,
        height: 180,
        min: 0,
        max: 120,
        colorTheme: 'light',
        fontFamily: 'modern',
        currentValue: 0,
        linkedInstrumentId: '',
        ranges: [
            { min: 0, max: 60, level: 'INFO', message: 'Система в нормі' }
        ]
    };

    const [formData, setFormData] = useState(defaultState);
    const [rangeError, setRangeError] = useState(null);

    // Доступні прилади для підв'язки табла
    const dialGauges = availableInstruments.filter(inst => inst.type !== 'WARNING_BOARD');

    useEffect(() => {
        if (editingInstrument) {
            const safeInstrument = { ...editingInstrument };
            if (safeInstrument.type === 'WARNING_BOARD' && !safeInstrument.ranges) {
                safeInstrument.ranges = [];
            }
            setFormData({ ...defaultState, ...safeInstrument });
        } else {
            setFormData(defaultState);
        }
    }, [editingInstrument, isOpen]);

    useEffect(() => {
        if (formData.type === 'WARNING_BOARD' && formData.ranges) {
            let errorMsg = null;
            const ranges = formData.ranges;

            for (let i = 0; i < ranges.length; i++) {
                const r1 = ranges[i];
                if (Number(r1.min) >= Number(r1.max)) {
                    errorMsg = `Діапазон ${i + 1}: Мінімальне значення має бути меншим за максимальне!`;
                    break;
                }
                for (let j = i + 1; j < ranges.length; j++) {
                    const r2 = ranges[j];
                    if (Number(r1.min) <= Number(r2.max) && Number(r2.min) <= Number(r1.max)) {
                        errorMsg = `Конфлікт: Діапазони ${i + 1} та ${j + 1} перетинаються!`;
                        break;
                    }
                }
                if (errorMsg) break;
            }
            setRangeError(errorMsg);
        } else {
            setRangeError(null);
        }
    }, [formData.ranges, formData.type]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;

        // 1. Якщо змінюємо ТИП приладу на Табло
        if (name === 'type') {
            setFormData(prev => {
                const updates = { type: value };
                if (value === 'WARNING_BOARD') {
                    updates.name = prev.linkedInstrumentId
                        ? `Табло попереджень для ${dialGauges.find(i => String(i.id) === String(prev.linkedInstrumentId))?.name || ''}`.trim()
                        : 'Табло попереджень';
                }
                return { ...prev, ...updates };
            });
            return;
        }

        // 2. Якщо підв'язуємо табло до якогось приладу
        if (name === 'linkedInstrumentId') {
            setFormData(prev => {
                let newName = 'Табло попереджень';
                if (value) {
                    const linkedInst = dialGauges.find(inst => String(inst.id) === String(value));
                    if (linkedInst) {
                        newName = `Табло попереджень для ${linkedInst.name}`;
                    }
                }
                return { ...prev, linkedInstrumentId: value, name: newName };
            });
            return;
        }

        const parsedValue = ['min', 'max', 'size', 'width', 'height', 'currentValue'].includes(name) ? Number(value) : value;
        setFormData(prev => ({ ...prev, [name]: parsedValue }));
    };

    // ОБРОБНИК ДЛЯ РОЗУМНОГО СПИСКУ НАЗВ (Тільки для звичайних приладів)
    const handleNameSelect = (e) => {
        const val = e.target.value;
        if (val === 'CUSTOM') {
            setFormData(prev => ({ ...prev, name: 'Мій новий прилад' }));
        } else {
            const preset = PREDEFINED_INSTRUMENTS[val];
            setFormData(prev => ({
                ...prev,
                name: val,
                unit: preset.unit,
                min: preset.min,
                max: preset.max,
                currentValue: preset.min
            }));
        }
    };

    const handleRangeChange = (index, field, value) => {
        const newRanges = [...(formData.ranges || [])];
        newRanges[index][field] = (field === 'min' || field === 'max') ? Number(value) : value;
        setFormData(prev => ({ ...prev, ranges: newRanges }));
    };

    const addRange = () => {
        setFormData(prev => {
            const currentRanges = prev.ranges || [];
            const lastRange = currentRanges.length > 0 ? currentRanges[currentRanges.length - 1] : null;
            const newMin = lastRange ? Number(lastRange.max) + 1 : 0;
            const newMax = newMin + 30;
            return {
                ...prev,
                ranges: [...currentRanges, { min: newMin, max: newMax, level: 'WARNING', message: 'Нове попередження' }]
            };
        });
    };

    const removeRange = (index) => {
        setFormData(prev => ({ ...prev, ranges: (prev.ranges || []).filter((_, i) => i !== index) }));
    };

    const handleSubmit = () => {
        if (rangeError) return;
        onSave(formData);
    };

    const hasMinMax = ['DIAL_GAUGE', 'SLIDER_CONTROL', 'COLUMN_GAUGE'].includes(formData.type);
    const hasUnit = ['DIAL_GAUGE', 'SLIDER_CONTROL', 'COLUMN_GAUGE', 'DIGITAL_DISPLAY'].includes(formData.type);

    const sliderMin = hasMinMax ? formData.min : 0;
    const sliderMax = hasMinMax ? formData.max : 10000;

    const isPredefinedName = Object.keys(PREDEFINED_INSTRUMENTS).includes(formData.name);

    return (
        <div className="modal-overlay">
            <div className="modal-content large-modal">
                <button className="close-button" onClick={onClose} title="Закрити">&times;</button>
                <h3 style={{ marginTop: 0 }}>{editingInstrument ? '✏️ Редагувати прилад' : 'Створити новий прилад'}</h3>

                <div className="modal-body-split">
                    <div className="modal-left-settings">

                        <div className="form-group">
                            <label>Вибір типу:</label>
                            <CustomSelect
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                options={[
                                    { value: 'DIAL_GAUGE', label: 'Стрілочний манометр' },
                                    { value: 'WARNING_BOARD', label: 'Табло попереджень' },
                                    { value: 'SLIDER_CONTROL', label: 'Лінійний індикатор (Повзунок)' },
                                    { value: 'COLUMN_GAUGE', label: 'Стовпчиковий індикатор' },
                                    { value: 'DIGITAL_DISPLAY', label: 'Мінімалістичний дисплей' }
                                ]}
                            />
                        </div>

                        <div className="settings-section-title">Загальні параметри</div>

                        {/* ЛОГІКА ДЛЯ НАЗВИ */}
                        <div className="form-group">
                            <label>{formData.type === 'WARNING_BOARD' ? 'Назва табла:' : 'Назва приладу (Джерело даних):'}</label>

                            {formData.type === 'WARNING_BOARD' ? (
                                /* Якщо це Табло - показуємо звичайний інпут */
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                            ) : (
                                /* Якщо це звичайний прилад - показуємо розумний список */
                                <>
                                    <CustomSelect
                                        name="namePreset"
                                        value={isPredefinedName ? formData.name : 'CUSTOM'}
                                        onChange={handleNameSelect}
                                        options={nameOptions}
                                    />
                                    {!isPredefinedName && (
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="Введіть назву..."
                                            style={{ marginTop: '0.8rem' }}
                                        />
                                    )}
                                </>
                            )}
                        </div>

                        <div className="form-group">
                            <label>Тестове значення:</label>
                            <div className="slider-container">
                                <input
                                    type="range"
                                    name="currentValue"
                                    className="styled-slider"
                                    min={sliderMin}
                                    max={sliderMax}
                                    value={formData.currentValue}
                                    onChange={handleChange}
                                />
                                <span className="slider-value-display">
                                    {formData.currentValue} {hasUnit ? formData.unit : ''}
                                </span>
                            </div>
                        </div>

                        {hasUnit && (
                            <div className="form-group" style={{ flexDirection: 'row', gap: '10px' }}>
                                <div style={{ flex: 1 }}>
                                    <label>Одиниці виміру:</label>
                                    <input type="text" name="unit" value={formData.unit} onChange={handleChange} style={{ width: '100%' }} />
                                </div>

                                {formData.type === 'DIAL_GAUGE' && (
                                    <div style={{ flex: 1 }}>
                                        <label>Діаметр (умовні px):</label>
                                        <input type="number" name="size" value={formData.size} onChange={handleChange} style={{ width: '100%' }} step="10" min="100" max="800" />
                                    </div>
                                )}

                                {formData.type === 'COLUMN_GAUGE' && (
                                    <div style={{ flex: 1 }}>
                                        <label>Висота шкали:</label>
                                        <input type="number" name="height" value={formData.height} onChange={handleChange} style={{ width: '100%' }} step="10" min="100" max="600" />
                                    </div>
                                )}
                            </div>
                        )}

                        {hasMinMax && (
                            <>
                                <div className="settings-section-title">Межі шкали</div>
                                <div className="form-group" style={{ flexDirection: 'row', gap: '10px' }}>
                                    <div style={{ flex: 1 }}>
                                        <label>Min:</label>
                                        <input type="number" name="min" value={formData.min} onChange={handleChange} style={{ width: '100%' }} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <label>Max:</label>
                                        <input type="number" name="max" value={formData.max} onChange={handleChange} style={{ width: '100%' }} />
                                    </div>
                                </div>
                            </>
                        )}

                        {formData.type === 'DIGITAL_DISPLAY' && (
                            <>
                                <div className="settings-section-title">Геометрія та Стиль</div>
                                <div className="form-group" style={{ flexDirection: 'row', gap: '10px' }}>
                                    <div style={{ flex: 1 }}>
                                        <label>Ширина:</label>
                                        <input type="number" name="width" value={formData.width} onChange={handleChange} style={{ width: '100%' }} step="10" min="100" max="800" />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <label>Висота:</label>
                                        <input type="number" name="height" value={formData.height} onChange={handleChange} style={{ width: '100%' }} step="10" min="50" max="800" />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <label>Шрифт дисплею:</label>
                                        <select name="fontFamily" value={formData.fontFamily} onChange={handleChange} style={{ width: '100%' }}>
                                            <option value="modern">Сучасний</option>
                                            <option value="digital-7">Електронний</option>
                                            <option value="pixel">Піксельний</option>
                                        </select>
                                    </div>
                                </div>
                            </>
                        )}

                        {formData.type === 'WARNING_BOARD' && (
                            <>
                                <div className="form-group" style={{ flexDirection: 'row', gap: '10px' }}>
                                    <div style={{ flex: 1 }}>
                                        <label>Ширина (умовні px):</label>
                                        <input type="number" name="width" value={formData.width} onChange={handleChange} style={{ width: '100%' }} step="10" min="100" max="800" />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <label>Висота (умовні px):</label>
                                        <input type="number" name="height" value={formData.height} onChange={handleChange} style={{ width: '100%' }} step="10" min="50" max="800" />
                                    </div>
                                </div>

                                <div className="settings-section-title">Джерело даних</div>
                                <div className="form-group">
                                    <label>Підв'язати до датчика:</label>
                                    <select name="linkedInstrumentId" value={formData.linkedInstrumentId || ''} onChange={handleChange}>
                                        <option value="">-- Автономне табло (ручне введення) --</option>
                                        {dialGauges.map(gauge => (
                                            <option key={gauge.id} value={gauge.id}>{gauge.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="settings-section-title">Налаштування діапазонів</div>

                                {(formData.ranges || []).map((range, index) => (
                                    <div key={index} className="range-setup-card" style={{ borderColor: rangeError ? 'var(--danger-main)' : 'var(--panel-border)' }}>
                                        <button type="button" className="btn-remove-range" onClick={() => removeRange(index)} title="Видалити">×</button>

                                        <div className="range-setup-row">
                                            <div>
                                                <label>Від (Min):</label>
                                                <input type="number" value={range.min} onChange={(e) => handleRangeChange(index, 'min', e.target.value)} />
                                            </div>
                                            <div>
                                                <label>До (Max):</label>
                                                <input type="number" value={range.max} onChange={(e) => handleRangeChange(index, 'max', e.target.value)} />
                                            </div>
                                            <div>
                                                <label>Рівень:</label>
                                                <select value={range.level} onChange={(e) => handleRangeChange(index, 'level', e.target.value)}>
                                                    <option value="INFO">Норма (INFO)</option>
                                                    <option value="WARNING">Увага (WARNING)</option>
                                                    <option value="ALARM">Тривога (ALARM)</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="range-setup-row">
                                            <div style={{ flex: 1 }}>
                                                <label>Текст повідомлення:</label>
                                                <input type="text" value={range.message} onChange={(e) => handleRangeChange(index, 'message', e.target.value)} />
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <button type="button" onClick={addRange} className="action-btn" style={{ marginTop: '5px' }}>
                                    + Додати діапазон
                                </button>
                            </>
                        )}
                    </div>

                    <div className="modal-right-preview">
                        <div className="preview-label">Live Preview</div>
                        <div style={{ margin: 'auto' }}>
                            {formData.type === 'DIAL_GAUGE' && ( <DialGauge name={formData.name} min={formData.min} max={formData.max} value={formData.currentValue} unit={formData.unit} size={formData.size} colorTheme={formData.colorTheme} /> )}
                            {formData.type === 'WARNING_BOARD' && ( <WarningBoard name={formData.name} value={formData.currentValue} ranges={formData.ranges} width={formData.width} height={formData.height} /> )}
                            {formData.type === 'SLIDER_CONTROL' && ( <SliderControl name={formData.name} min={formData.min} max={formData.max} value={formData.currentValue} unit={formData.unit} /> )}
                            {formData.type === 'COLUMN_GAUGE' && ( <ColumnGauge name={formData.name} min={formData.min} max={formData.max} value={formData.currentValue} unit={formData.unit} height={formData.height} colorTheme={formData.colorTheme} /> )}
                            {formData.type === 'DIGITAL_DISPLAY' && (
                                <DigitalDisplay
                                    name={formData.name}
                                    value={formData.currentValue}
                                    unit={formData.unit}
                                    width={formData.width}
                                    height={formData.height}
                                    fontFamily={formData.fontFamily}
                                />
                            )}
                        </div>
                    </div>
                </div>

                <div className="modal-actions" style={{ marginTop: '25px', justifyContent: 'flex-start', flexDirection: 'column', alignItems: 'flex-start', gap: '10px' }}>
                    {rangeError && <div className="range-error-msg">⚠️ {rangeError}</div>}
                    <button type="button" onClick={handleSubmit} className="action-btn btn-add" disabled={!!rangeError}>
                        {editingInstrument ? 'Зберегти зміни' : 'Створити прилад'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateModal;