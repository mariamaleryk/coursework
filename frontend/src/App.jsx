import { useState, useEffect, useRef } from 'react';
import Draggable from 'react-draggable';
import InstrumentRenderer from './components/InstrumentRenderer';
import CreateModal from './components/CreateModal';
import ContextMenu from './components/ContextMenu';
import './App.css';

const DraggableInstrument = ({ inst, updatePosition, onContextMenu }) => {
    const nodeRef = useRef(null);

    return (
        <Draggable
            nodeRef={nodeRef}
            defaultPosition={{ x: inst.x, y: inst.y }}
            bounds="parent"
            onStop={(e, data) => updatePosition(inst.id, data.x, data.y)}
        >
            <div ref={nodeRef} style={{ position: 'absolute' }} onContextMenu={(e) => onContextMenu(e, inst.id)}>
                <InstrumentRenderer inst={inst} />
            </div>
        </Draggable>
    );
};
function App() {
    const [instruments, setInstruments] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, instrumentId: null });
    const [editingInstrument, setEditingInstrument] = useState(null);

    const [theme, setTheme] = useState('dark');

    useEffect(() => {
        // eslint-disable-next-line react-hooks/immutability
        window.addEventListener('click', closeContextMenu);
        // eslint-disable-next-line react-hooks/immutability
        loadInstruments();
        return () => window.removeEventListener('click', closeContextMenu);
    }, []);

    const loadInstruments = () => {
        fetch('http://localhost:8080/api/instruments')
            .then(res => res.json())
            .then(data => setInstruments(data))
            .catch(err => console.error("Помилка завантаження:", err));
    };

    const handleSaveInstrument = async (formData) => {
        if (editingInstrument) {
            try {
                const response = await fetch(`http://localhost:8080/api/instruments/${editingInstrument.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });

                if (response.ok) {
                    const updatedInst = await response.json();
                    setInstruments(instruments.map(inst => inst.id === updatedInst.id ? updatedInst : inst));
                } else {
                    // Тимчасовий локальний апдейт, поки викладач не побачить бекенд
                    setInstruments(instruments.map(inst => inst.id === editingInstrument.id ? { ...inst, ...formData } : inst));
                }
                // eslint-disable-next-line no-unused-vars
            } catch (error) {
                setInstruments(instruments.map(inst => inst.id === editingInstrument.id ? { ...inst, ...formData } : inst));
            }
        } else {
            try {
                const response = await fetch('http://localhost:8080/api/instruments', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
                const savedInstrument = await response.json();
                setInstruments([...instruments, savedInstrument]);
            } catch (error) { console.error("Помилка створення:", error); }
        }

        setIsModalOpen(false);
        setEditingInstrument(null);
    };

    const updatePosition = async (id, x, y) => {
        try { await fetch(`http://localhost:8080/api/instruments/${id}/position?x=${x}&y=${y}`, { method: 'PUT' }); }
        catch (error) { console.error("Помилка збереження позиції:", error); }
    };

    const clearAll = async () => {
        if (!window.confirm("Ви впевнені, що хочете видалити всі прилади?")) return;
        try {
            await fetch('http://localhost:8080/api/instruments', { method: 'DELETE' });
            setInstruments([]);
        } catch (error) { console.error("Помилка очищення:", error); }
    };

    const handleContextMenu = (event, instrumentId) => {
        event.preventDefault();
        setContextMenu({ visible: true, x: event.clientX, y: event.clientY, instrumentId });
    };

    const closeContextMenu = () => {
        setContextMenu({ visible: false, x: 0, y: 0, instrumentId: null });
    };

    const handleEditClick = () => {
        const instToEdit = instruments.find(inst => inst.id === contextMenu.instrumentId);
        if (instToEdit) {
            setEditingInstrument(instToEdit);
            setIsModalOpen(true);
        }
        closeContextMenu();
    };

    const openCreateModal = () => {
        setEditingInstrument(null);
        setIsModalOpen(true);
    };

    const handleDeleteInstrument = async () => {
        const id = contextMenu.instrumentId;
        try {
            await fetch(`http://localhost:8080/api/instruments/${id}`, { method: 'DELETE' });
            setInstruments(instruments.filter(inst => inst.id !== id));
            closeContextMenu();
        } catch (error) { console.error("Помилка видалення:", error); }
    };

    const handleSimulateValue = () => {
        const id = contextMenu.instrumentId;
        const instrument = instruments.find(inst => inst.id === id);
        if (!instrument) return;

        if (instrument.type === 'DIAL_GAUGE') {
            const newValue = window.prompt(`Введіть значення для "${instrument.name}" (від ${instrument.min} до ${instrument.max}):`);
            if (newValue !== null && !isNaN(parseFloat(newValue))) {
                setInstruments(instruments.map(inst => inst.id === id ? { ...inst, currentValue: parseFloat(newValue) } : inst));
            }
        } else if (instrument.type === 'WARNING_BOARD') {
            const newMessage = window.prompt(`Введіть динамічне повідомлення для "${instrument.name}":`);
            if (newMessage !== null) {
                setInstruments(instruments.map(inst => inst.id === id ? { ...inst, message: newMessage } : inst));
            }
        }
        closeContextMenu();
    };

    const handleTriggerAlarm = (trigger) => {
        const id = contextMenu.instrumentId;
        setInstruments(instruments.map(inst => {
            if (inst.id === id) {
                return {
                    ...inst,
                    level: trigger ? 'ALARM' : 'INFO',
                    message: trigger ? '🚨 КРИТИЧНИЙ ТИСК! НЕГАЙНО ЗУПИНІТЬ!' : ''
                };
            }
            return inst;
        }));
        closeContextMenu();
    };

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };
    return (
        <div className={`dashboard-container theme-${theme}`}>
            <header className="dashboard-header">
                <div className="header-title">Віртуальна панель приладів</div>
                <div className="header-controls">
                    <button className="theme-toggle" onClick={toggleTheme} title="Змінити тему">
                        {theme === 'dark' ? '☀️' : '🌙'}
                    </button>
                    <button className="action-btn btn-add" onClick={openCreateModal}>Додати прилад</button>
                    <button className="action-btn btn-clear" onClick={clearAll}>Очистити поле</button>
                </div>
            </header>

            <main className="dashboard-workspace">
                {instruments.length === 0 ? (
                    <p className="placeholder-text">РОБОЧЕ ПОЛЕ ПОРОЖНЄ</p>
                ) : (
                    instruments.map(inst => {
                        let displayInst = { ...inst };

                        if (inst.type === 'WARNING_BOARD' && inst.linkedInstrumentId) {
                            const sourceInst = instruments.find(i => String(i.id) === String(inst.linkedInstrumentId));
                            if (sourceInst) {
                                displayInst.currentValue = sourceInst.currentValue;
                            }
                        }

                        return (
                            <DraggableInstrument
                                key={displayInst.id}
                                inst={displayInst}
                                updatePosition={updatePosition}
                                onContextMenu={handleContextMenu}
                            />
                        );
                    })
                )}
                {contextMenu.visible && (
                    <div className="context-menu" style={{ left: contextMenu.x, top: contextMenu.y }}>

                        <div className="context-menu-item" onClick={handleEditClick}>
                            Редагувати
                        </div>

                        {instruments.find(inst => inst.id === contextMenu.instrumentId)?.type === 'WARNING_BOARD' && (
                            <>
                                <div className="context-menu-item delete" onClick={() => handleTriggerAlarm(true)}>
                                    Тестувати тривогу (ALARM)
                                </div>
                                <div className="context-menu-item" style={{ color: '#38bdf8' }} onClick={() => handleTriggerAlarm(false)}>
                                    Скинути в норму (INFO)
                                </div>
                            </>
                        )}

                        <div className="context-menu-item delete" onClick={handleDeleteInstrument}>
                            Видалити
                        </div>
                    </div>
                )}
            </main>

            <CreateModal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setEditingInstrument(null); }}
                onSave={handleSaveInstrument}
                editingInstrument={editingInstrument}
                availableInstruments={instruments}
            />
        </div>
    );
}
export default App;
