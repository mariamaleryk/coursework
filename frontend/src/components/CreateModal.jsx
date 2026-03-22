import React, { useState, useEffect } from 'react';
import DialGauge from './DialGauge';
import WarningBoard from './WarningBoard';
import './CreateModal.css';

const CreateModal = ({ isOpen, onClose, onSave, editingInstrument }) => {
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
        message: '',
        level: 'INFO'
    };

    const [formData, setFormData] = useState(defaultState);

    useEffect(() => {
        if (editingInstrument) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setFormData({ ...defaultState, ...editingInstrument });
        } else {
            setFormData(defaultState);
        }
    }, [editingInstrument, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        const parsedValue = ['min', 'max', 'size', 'width', 'height'].includes(name) ? Number(value) : value;
        setFormData(prev => ({ ...prev, [name]: parsedValue }));
    };

    const handleSubmit = () => {
        onSave(formData);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content large-modal">
                <button className="close-button" onClick={onClose} title="Закрити">&times;</button>

                {/* Змінюємо заголовок залежно від режиму */}
                <h3 style={{ marginTop: 0 }}>
                    {editingInstrument ? 'Редагувати прилад' : 'Створити новий прилад'}
                </h3>

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

                                <div className="settings-section-title">Специфічні параметри (Манометр)</div>
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
                        )}
                    </div>

                    <div className="modal-right-preview">
                        <div className="preview-label">Live Preview</div>
                        <div style={{
                            minWidth: `${formData.type === 'DIAL_GAUGE' ? formData.size : formData.width}px`,
                            minHeight: `${formData.type === 'DIAL_GAUGE' ? formData.size : formData.height}px`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            {formData.type === 'DIAL_GAUGE' && (
                                <DialGauge name={formData.name} min={formData.min} max={formData.max} value={(formData.max + formData.min) / 2} unit={formData.unit} size={formData.size} />
                            )}
                            {formData.type === 'WARNING_BOARD' && (
                                <WarningBoard name={formData.name} message={formData.message} level={formData.level} width={formData.width} height={formData.height} />
                            )}
                        </div>
                    </div>
                </div>

                <div className="modal-actions" style={{ marginTop: '25px', justifyContent: 'flex-start' }}>
                    <button onClick={handleSubmit} className="btn-add">
                        {editingInstrument ? 'Зберегти зміни' : 'Створити прилад'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateModal;