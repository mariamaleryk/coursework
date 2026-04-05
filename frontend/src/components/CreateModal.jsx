import React, { useState, useEffect } from 'react';
import DialGauge from './DialGauge';
import WarningBoard from './WarningBoard';
import './CreateModal.css';

const CreateModal = ({ isOpen, onClose, onSave, editingInstrument, availableInstruments = [] }) => {
    const defaultState = {
        type: 'DIAL_GAUGE',
        name: 'Температура води',
        unit: '°C',
        size: 200,
        width: 300,
        height: 100,
        min: 0,
        max: 120,
        colorTheme: 'light',
        fontFamily: 'standard',
        currentValue: 0,
        linkedInstrumentId: '',
        ranges: [
            { min: 0, max: 60, level: 'INFO', message: 'Система в нормі' }
        ]
    };

    const [formData, setFormData] = useState(defaultState);
    const [rangeError, setRangeError] = useState(null);

    useEffect(() => {
        if (editingInstrument) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setFormData({ ...defaultState, ...editingInstrument });
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
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setRangeError(errorMsg);
        } else {
            setRangeError(null);
        }
    }, [formData.ranges, formData.type]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        const parsedValue = ['min', 'max', 'size', 'width', 'height', 'currentValue'].includes(name) ? Number(value) : value;
        setFormData(prev => ({ ...prev, [name]: parsedValue }));
    };

    const handleRangeChange = (index, field, value) => {
        const newRanges = [...formData.ranges];
        newRanges[index][field] = (field === 'min' || field === 'max') ? Number(value) : value;
        setFormData(prev => ({ ...prev, ranges: newRanges }));
    };

    const addRange = () => {
        setFormData(prev => {
            const lastRange = prev.ranges.length > 0 ? prev.ranges[prev.ranges.length - 1] : null;
            const newMin = lastRange ? Number(lastRange.max) + 1 : 0;
            const newMax = newMin + 30;
            return {
                ...prev,
                ranges: [...prev.ranges, { min: newMin, max: newMax, level: 'WARNING', message: 'Нове попередження' }]
            };
        });
    };

    const removeRange = (index) => {
        setFormData(prev => ({ ...prev, ranges: prev.ranges.filter((_, i) => i !== index) }));
    };

    const handleSubmit = () => {
        if (rangeError) return;
        onSave(formData);
    };

    const dialGauges = availableInstruments.filter(inst => inst.type === 'DIAL_GAUGE');

    return (
        <div className="modal-overlay">
            <div className="modal-content large-modal">
                <button className="close-button" onClick={onClose} title="Закрити">&times;</button>
                <h3 style={{ marginTop: 0 }}>{editingInstrument ? 'Редагувати прилад' : 'Створити новий прилад'}</h3>

                <div className="modal-body-split">
                    <div className="modal-left-settings">

                        <div className="form-group">
                            <label>Вибір типу:</label>
                            <select name="type" value={formData.type} onChange={handleChange} disabled={!!editingInstrument}>
                                <option value="DIAL_GAUGE">Стрілочний манометр</option>
                                <option value="WARNING_BOARD">Табло попереджень</option>
                            </select>
                        </div>

                        <div className="settings-section-title">Загальні параметри</div>

                        <div className="form-group">
                            <label>Назва приладу:</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} />
                        </div>

                        <div className="form-group">
                            <label>Тестове значення (перевір, як працює прилад):</label>
                            <input type="number" name="currentValue" value={formData.currentValue} onChange={handleChange} />
                        </div>

                        {formData.type === 'DIAL_GAUGE' && (
                            <>
                                <div className="form-group" style={{ flexDirection: 'row', gap: '10px' }}>
                                    <div style={{ flex: 1 }}>
                                        <label>Одиниці виміру:</label>
                                        <input type="text" name="unit" value={formData.unit} onChange={handleChange} style={{ width: '100%' }} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <label>Діаметр (px):</label>
                                        <input type="number" name="size" value={formData.size} onChange={handleChange} style={{ width: '100%' }} step="10" min="100" max="800" />
                                    </div>
                                </div>
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

                        {formData.type === 'WARNING_BOARD' && (
                            <>
                                <div className="form-group" style={{ flexDirection: 'row', gap: '10px' }}>
                                    <div style={{ flex: 1 }}>
                                        <label>Ширина (px):</label>
                                        <input type="number" name="width" value={formData.width} onChange={handleChange} style={{ width: '100%' }} step="10" min="100" max="800" />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <label>Висота (px):</label>
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

                                {formData.ranges.map((range, index) => (
                                    <div key={index} className="range-setup-card" style={{ borderColor: rangeError ? '#ef4444' : 'var(--panel-border)' }}>
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

                                <button type="button" onClick={addRange} className="action-btn" style={{ marginTop: '10px'}}>
                                    + Додати діапазон
                                </button>
                            </>
                        )}
                    </div>

                    <div className="modal-right-preview">
                        <div className="preview-label">Live Preview</div>
                        <div style={{ margin: 'auto' }}>
                            {formData.type === 'DIAL_GAUGE' && (
                                <DialGauge name={formData.name} min={formData.min} max={formData.max} value={formData.currentValue} unit={formData.unit} size={formData.size} />
                            )}
                            {formData.type === 'WARNING_BOARD' && (
                                <WarningBoard name={formData.name} value={formData.currentValue} ranges={formData.ranges} width={formData.width} height={formData.height} />
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