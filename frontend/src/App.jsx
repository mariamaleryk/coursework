import React, { useState, useEffect, useRef } from 'react';
import Draggable from 'react-draggable';
import InstrumentRenderer from './components/InstrumentRenderer';
import CreateModal from './components/CreateModal';
import simulationData from './simulationData.json';
import './App.css';

const DraggableInstrument = ({ inst, updatePosition, onContextMenu, onTouchStart, onTouchEnd, onTouchMove }) => {
    const nodeRef = useRef(null);

    return (
        <Draggable
            nodeRef={nodeRef}
            defaultPosition={{ x: inst.x || 0, y: inst.y || 0 }}
            bounds="parent"
            onStop={(e, data) => updatePosition(inst.id, data.x, data.y)}
        >
            <div
                ref={nodeRef}
                style={{ position: 'absolute', WebkitTouchCallout: 'none', userSelect: 'none' }}
                onContextMenu={(e) => onContextMenu(e, inst.id)}
                onTouchStart={(e) => onTouchStart(e, inst.id)}
                onTouchEnd={onTouchEnd}
                onTouchMove={onTouchMove}
            >
                <InstrumentRenderer inst={inst} />
            </div>
        </Draggable>
    );
};

function App() {
    const pressTimer = useRef(null);
    const stepIndexRef = useRef(0);

    const [instruments, setInstruments] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, instrumentId: null });
    const [editingInstrument, setEditingInstrument] = useState(null);
    const [theme, setTheme] = useState('dark');
    const [simulatingIds, setSimulatingIds] = useState(new Set());

    // Головний двигун симуляції
    useEffect(() => {
        if (simulatingIds.size === 0 || !simulationData || simulationData.length === 0) return;

        const interval = setInterval(() => {
            const currentStep = simulationData[stepIndexRef.current];

            setInstruments(prevInstruments => prevInstruments.map(inst => {
                if (simulatingIds.has(inst.id) && currentStep[inst.name] !== undefined) {
                    return { ...inst, currentValue: currentStep[inst.name] };
                }
                return inst;
            }));

            stepIndexRef.current++;
            if (stepIndexRef.current >= simulationData.length) {
                stepIndexRef.current = 0;
            }
        }, 1500);

        return () => clearInterval(interval);
    }, [simulatingIds]);

    // ЗАВАНТАЖЕННЯ ДАНИХ З ПАМ'ЯТІ БРАУЗЕРА (БЕЗ LOCALHOST)
    useEffect(() => {
        // eslint-disable-next-line react-hooks/immutability
        window.addEventListener('click', closeContextMenu);
        const savedInstruments = localStorage.getItem('dashboard_instruments');
        if (savedInstruments) {
            try {
                setInstruments(JSON.parse(savedInstruments));
            } catch (e) {
                console.error("Помилка читання збережених приладів", e);
            }
        }
        return () => window.removeEventListener('click', closeContextMenu);
    }, []);

    // ЗБЕРЕЖЕННЯ ДАНИХ В ПАМ'ЯТЬ БРАУЗЕРА
    const saveToLocalStorage = (newInstruments) => {
        localStorage.setItem('dashboard_instruments', JSON.stringify(newInstruments));
    };

    const handleSaveInstrument = (formData) => {
        let updatedInstruments;
        if (editingInstrument) {
            updatedInstruments = instruments.map(inst =>
                inst.id === editingInstrument.id ? { ...inst, ...formData } : inst
            );
        } else {
            const newInstrument = { ...formData, id: Date.now().toString(), x: 50, y: 50 };
            updatedInstruments = [...instruments, newInstrument];
        }

        setInstruments(updatedInstruments);
        saveToLocalStorage(updatedInstruments);
        setIsModalOpen(false);
        setEditingInstrument(null);
    };

    const updatePosition = (id, x, y) => {
        setInstruments(prev => {
            const updated = prev.map(inst => inst.id === id ? { ...inst, x, y } : inst);
            saveToLocalStorage(updated);
            return updated;
        });
    };

    const clearAll = () => {
        if (!window.confirm("Ви впевнені, що хочете видалити всі прилади?")) return;
        setInstruments([]);
        saveToLocalStorage([]);
        setSimulatingIds(new Set());
    };

    const handleDeleteInstrument = () => {
        const id = contextMenu.instrumentId;
        const updatedInstruments = instruments.filter(inst => inst.id !== id);
        setInstruments(updatedInstruments);
        saveToLocalStorage(updatedInstruments);

        setSimulatingIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(id);
            return newSet;
        });
        closeContextMenu();
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

    const handleToggleSimulation = () => {
        const id = contextMenu.instrumentId;
        setSimulatingIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) newSet.delete(id);
            else newSet.add(id);
            return newSet;
        });
        closeContextMenu();
    };

    const handleTouchStart = (e, instrumentId) => {
        pressTimer.current = setTimeout(() => {
            if (e.touches && e.touches.length > 0) {
                const touch = e.touches[0];
                const syntheticEvent = { clientX: touch.clientX, clientY: touch.clientY, preventDefault: () => {} };
                handleContextMenu(syntheticEvent, instrumentId);
            }
        }, 500);
    };

    const handleTouchEnd = () => { if (pressTimer.current) clearTimeout(pressTimer.current); };
    const handleTouchMove = () => { if (pressTimer.current) clearTimeout(pressTimer.current); };

    const toggleTheme = () => { setTheme(prev => prev === 'dark' ? 'light' : 'dark'); };

    const activeContextInst = instruments.find(inst => inst.id === contextMenu.instrumentId);

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
                                onTouchStart={handleTouchStart}
                                onTouchEnd={handleTouchEnd}
                                onTouchMove={handleTouchMove}
                            />
                        );
                    })
                )}

                {contextMenu.visible && (
                    <div className="context-menu" style={{ left: contextMenu.x, top: contextMenu.y }}>
                        {activeContextInst && activeContextInst.type !== 'WARNING_BOARD' && (
                            <div
                                className="context-menu-item"
                                style={{ color: simulatingIds.has(activeContextInst.id) ? 'var(--danger-main)' : '#10b981' }}
                                onClick={handleToggleSimulation}
                            >
                                {simulatingIds.has(activeContextInst.id) ? '⏹ Зупинити симуляцію' : '▶ Старт симуляції'}
                            </div>
                        )}
                        <div className="context-menu-item" onClick={handleEditClick}>✏️ Редагувати</div>
                        <div className="context-menu-item delete" onClick={handleDeleteInstrument}>🗑 Видалити</div>
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