import React, { useState, useEffect, useRef } from 'react';
import Draggable from 'react-draggable';
import InstrumentRenderer from './components/InstrumentRenderer';
import CreateModal from './components/CreateModal';
import simulationData from './simulationData.json';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const DraggableInstrument = ({ inst, updatePosition, onOpenMenu }) => {
    const nodeRef = useRef(null);
    const pressTimer = useRef(null);
    const isDragging = useRef(false);

    const handleTouchStart = (e) => {
        isDragging.current = false;
        const touch = e.touches[0];
        const clientX = touch.clientX;
        const clientY = touch.clientY;

        pressTimer.current = setTimeout(() => {
            if (!isDragging.current) {
                onOpenMenu(inst.id, clientX, clientY);
            }
        }, 1000);
    };

    const handleTouchEnd = () => {
        if (pressTimer.current) clearTimeout(pressTimer.current);
    };

    const handleContextMenu = (e) => {
        e.preventDefault();
        e.stopPropagation();
        onOpenMenu(inst.id, e.clientX, e.clientY);
    };

    return (
        <Draggable
            nodeRef={nodeRef}
            distance={10}
            defaultPosition={{ x: inst.x || 0, y: inst.y || 0 }}
            bounds="parent"
            onDrag={() => {
                isDragging.current = true;
                if (pressTimer.current) clearTimeout(pressTimer.current);
            }}
            onStop={(e, data) => updatePosition(inst.id, data.x, data.y)}
        >
            <div
                ref={nodeRef}
                style={{ position: 'absolute', WebkitTouchCallout: 'none', userSelect: 'none', touchAction: 'none' }}
                onContextMenu={handleContextMenu}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                onTouchCancel={handleTouchEnd}
            >
                <InstrumentRenderer inst={inst} />
            </div>
        </Draggable>
    );
};

function App() {
    const stepIndexRef = useRef(0);

    const [instruments, setInstruments] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, instrumentId: null });
    const [editingInstrument, setEditingInstrument] = useState(null);
    const [theme, setTheme] = useState('dark');
    const [simulatingIds, setSimulatingIds] = useState(new Set());

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

    useEffect(() => {
        window.addEventListener('click', closeContextMenu);
        fetch(`${API_URL}/instruments`)
            .then(res => res.json())
            .then(data => setInstruments(data))
            .catch(err => console.error("Помилка завантаження приладів:", err));

        return () => window.removeEventListener('click', closeContextMenu);
    }, []);

    const handleSaveInstrument = async (formData) => {
        try {
            if (editingInstrument) {
                const response = await fetch(`${API_URL}/instruments/${editingInstrument.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
                if (response.ok) {
                    const updatedInst = await response.json();
                    setInstruments(instruments.map(inst => inst.id === updatedInst.id ? updatedInst : inst));
                }
            } else {
                const response = await fetch(`${API_URL}/instruments`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
                if (response.ok) {
                    const savedInstrument = await response.json();
                    setInstruments([...instruments, savedInstrument]);
                } else {
                    console.error("Бекенд повернув помилку:", await response.text());
                }
            }
            setIsModalOpen(false);
            setEditingInstrument(null);
        } catch (error) {
            console.error("Помилка мережі:", error);
        }
    };

    const updatePosition = async (id, x, y) => {
        setInstruments(prev => prev.map(inst => inst.id === id ? { ...inst, x, y } : inst));

        try {
            await fetch(`${API_URL}/instruments/${id}/position?x=${x}&y=${y}`, {
                method: 'PUT'
            });
        } catch (error) {
            console.error("Помилка збереження позиції:", error);
        }
    };

    const handleDeleteInstrument = async () => {
        const id = contextMenu.instrumentId;
        try {
            await fetch(`${API_URL}/instruments/${id}`, { method: 'DELETE' });
            setInstruments(prev => prev.filter(inst => inst.id !== id));
            setSimulatingIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(id);
                return newSet;
            });
            closeContextMenu();
        } catch (error) {
            console.error("Помилка видалення:", error);
        }
    };

    const clearAll = async () => {
        if (!window.confirm("Ви впевнені, що хочете видалити всі прилади?")) return;
        try {
            await fetch(`${API_URL}/instruments`, { method: 'DELETE' });
            setInstruments([]);
            setSimulatingIds(new Set());
        } catch (error) {
            console.error("Помилка очищення:", error);
        }
    };

    const handleOpenMenu = (instrumentId, x, y) => {
        setContextMenu({ visible: true, x, y, instrumentId });
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
                                onOpenMenu={handleOpenMenu}
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