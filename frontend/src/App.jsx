import React, { useState, useEffect, useRef } from 'react';
import Draggable from 'react-draggable';
import InstrumentRenderer from './components/InstrumentRenderer';
import CreateModal from './components/CreateModal';
import simulationData from './simulationData.json';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

const DraggableInstrument = ({ inst, updatePosition, onOpenMenu }) => {
    const nodeRef = useRef(null);
    const lastTap = useRef(0);

    const handleTouchStart = (e) => {
        const now = Date.now();
        const DOUBLE_TAP_DELAY = 300;

        if (now - lastTap.current < DOUBLE_TAP_DELAY) {
            const touch = e.touches[0];
            onOpenMenu(inst.id, touch.clientX, touch.clientY);
            if (e.cancelable) e.preventDefault();
        }
        lastTap.current = now;
    };

    return (
        <Draggable
            nodeRef={nodeRef}
            distance={5}
            defaultPosition={{ x: inst.x || 0, y: inst.y || 0 }}
            bounds="parent"
            onStop={(e, data) => updatePosition(inst.id, data.x, data.y)}
        >
            <div
                ref={nodeRef}
                style={{
                    position: 'absolute',
                    touchAction: 'none',
                    userSelect: 'none',
                    WebkitTouchCallout: 'none'
                }}
                onTouchStart={handleTouchStart}
                onContextMenu={(e) => {
                    e.preventDefault();
                    onOpenMenu(inst.id, e.clientX, e.clientY);
                }}
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

    const [ownerId] = useState(() => {
        let id = localStorage.getItem('my_panel_id');
        if (!id) {
            id = Math.random().toString(36).substring(2, 9);
            localStorage.setItem('my_panel_id', id);
        }
        return id;
    });

    const getHeaders = () => ({
        'Content-Type': 'application/json',
        'X-Owner-ID': ownerId
    });

    useEffect(() => {
        window.addEventListener('click', closeContextMenu);

        fetch(`${API_URL}/instruments`, {
            method: 'GET',
            headers: getHeaders()
        })
            .then(res => res.json())
            .then(data => setInstruments(data))
            .catch(err => console.error("Помилка завантаження приладів:", err));

        return () => window.removeEventListener('click', closeContextMenu);
    }, []);

    const handleSaveInstrument = async (formData) => {
        try {
            const isEdit = !!editingInstrument;
            const url = isEdit
                ? `${API_URL}/instruments/${editingInstrument.id}`
                : `${API_URL}/instruments`;

            const response = await fetch(url, {
                method: isEdit ? 'PUT' : 'POST',
                headers: getHeaders(),
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                const savedInst = await response.json();
                if (isEdit) {
                    setInstruments(instruments.map(inst => inst.id === savedInst.id ? savedInst : inst));
                } else {
                    setInstruments([...instruments, savedInst]);
                }
                setIsModalOpen(false);
                setEditingInstrument(null);
            }
        } catch (error) {
            console.error("Помилка збереження:", error);
        }
    };

    const updatePosition = async (id, x, y) => {
        setInstruments(prev => prev.map(inst => inst.id === id ? { ...inst, x, y } : inst));

        try {
            await fetch(`${API_URL}/instruments/${id}/position?x=${x}&y=${y}`, {
                method: 'PUT',
                headers: getHeaders()
            });
        } catch (error) {
            console.error("Помилка збереження позиції:", error);
        }
    };

    const handleDeleteInstrument = async () => {
        const id = contextMenu.instrumentId;
        try {
            const response = await fetch(`${API_URL}/instruments/${id}`, {
                method: 'DELETE',
                headers: getHeaders()
            });
            if (response.ok) {
                setInstruments(prev => prev.filter(inst => inst.id !== id));
                setSimulatingIds(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(id);
                    return newSet;
                });
            }
            closeContextMenu();
        } catch (error) {
            console.error("Помилка видалення:", error);
        }
    };

    const clearAll = async () => {
        if (!window.confirm("Ви впевнені, що хочете видалити всі ВЛАДНІ прилади?")) return;
        try {
            await fetch(`${API_URL}/instruments`, {
                method: 'DELETE',
                headers: getHeaders()
            });
            setInstruments([]);
            setSimulatingIds(new Set());
        } catch (error) {
            console.error("Помилка очищення:", error);
        }
    };

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
            stepIndexRef.current = (stepIndexRef.current + 1) % simulationData.length;
        }, 1500);
        return () => clearInterval(interval);
    }, [simulatingIds]);

    const handleOpenMenu = (instrumentId, x, y) => setContextMenu({ visible: true, x, y, instrumentId });
    const closeContextMenu = () => setContextMenu({ visible: false, x: 0, y: 0, instrumentId: null });
    const handleEditClick = () => {
        const instToEdit = instruments.find(inst => inst.id === contextMenu.instrumentId);
        if (instToEdit) { setEditingInstrument(instToEdit); setIsModalOpen(true); }
        closeContextMenu();
    };
    const openCreateModal = () => { setEditingInstrument(null); setIsModalOpen(true); };
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
    const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

    const activeContextInst = instruments.find(inst => inst.id === contextMenu.instrumentId);

    return (
        <div className={`dashboard-container theme-${theme}`}>
            <header className="dashboard-header">
                <div className="header-title">Віртуальна панель приладів</div>
                <div className="header-controls">
                    <button className="theme-toggle" onClick={toggleTheme}>
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
                            if (sourceInst) displayInst.currentValue = sourceInst.currentValue;
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