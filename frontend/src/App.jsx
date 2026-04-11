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
            defaultPosition={{ x: inst.x, y: inst.y }}
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
    const stepIndexRef = useRef(0); // Відслідковує, на якому "кадрі" зараз симуляція

    const [instruments, setInstruments] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, instrumentId: null });
    const [editingInstrument, setEditingInstrument] = useState(null);
    const [theme, setTheme] = useState('dark');

    // Зберігаємо ID приладів, які зараз анімуються
    const [simulatingIds, setSimulatingIds] = useState(new Set());

    // Головний двигун симуляції
    useEffect(() => {
        if (simulatingIds.size === 0 || !simulationData || simulationData.length === 0) return;

        const interval = setInterval(() => {
            const currentStep = simulationData[stepIndexRef.current];

            setInstruments(prevInstruments => prevInstruments.map(inst => {
                // Якщо цей прилад запущено і в JSON є колонка з його назвою
                if (simulatingIds.has(inst.id) && currentStep[inst.name] !== undefined) {
                    return { ...inst, currentValue: currentStep[inst.name] };
                }
                return inst;
            }));

            // Перехід на наступний кадр (або на початок)
            stepIndexRef.current++;
            if (stepIndexRef.current >= simulationData.length) {
                stepIndexRef.current = 0;
            }
        }, 1500); // 1.5 секунди затримки між кадрами

        return () => clearInterval(interval);
    }, [simulatingIds]);

    useEffect(() => {
        window.addEventListener('click', closeContextMenu);
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
                    setInstruments(instruments.map(inst => inst.id === editingInstrument.id ? { ...inst, ...formData } : inst));
                }
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
            setSimulatingIds(new Set()); // Зупиняємо всі анімації
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

            // Якщо прилад видалили - прибираємо його і з симуляції
            setSimulatingIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(id);
                return newSet;
            });
            closeContextMenu();
        } catch (error) { console.error("Помилка видалення:", error); }
    };

    // --- Функція для увімкнення/вимкнення симуляції конкретного приладу ---
    const handleToggleSimulation = () => {
        const id = contextMenu.instrumentId;
        setSimulatingIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id); // Зупинити
            } else {
                newSet.add(id); // Запустити
            }
            return newSet;
        });
        closeContextMenu();
    };

    const handleTouchStart = (e, instrumentId) => {
        pressTimer.current = setTimeout(() => {
            if (e.touches && e.touches.length > 0) {
                const touch = e.touches[0];
                const syntheticEvent = {
                    clientX: touch.clientX,
                    clientY: touch.clientY,
                    preventDefault: () => {}
                };
                handleContextMenu(syntheticEvent, instrumentId);
            }
        }, 500);
    };

    const handleTouchEnd = () => {
        if (pressTimer.current) clearTimeout(pressTimer.current);
    };

    const handleTouchMove = () => {
        if (pressTimer.current) clearTimeout(pressTimer.current);
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

    // Знаходимо прилад, на який клікнули правою кнопкою (для меню)
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

                        // Табло Попереджень автоматично "слухає" свій прилад
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

                        {/* Кнопка "Старт / Стоп" (Не показуємо для табла попереджень) */}
                        {activeContextInst && activeContextInst.type !== 'WARNING_BOARD' && (
                            <div
                                className="context-menu-item"
                                style={{ color: simulatingIds.has(activeContextInst.id) ? 'var(--danger-main)' : '#10b981' }}
                                onClick={handleToggleSimulation}
                            >
                                {simulatingIds.has(activeContextInst.id) ? '⏹ Зупинити симуляцію' : '▶ Старт симуляції'}
                            </div>
                        )}

                        <div className="context-menu-item" onClick={handleEditClick}>
                            Редагувати
                        </div>

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

// import React, { useState, useEffect, useRef } from 'react';
// import Draggable from 'react-draggable';
// import InstrumentRenderer from './components/InstrumentRenderer';
// import CreateModal from './components/CreateModal';
// import './App.css';
//
// // Компонент обгортки (залишається зовні)
// const DraggableInstrument = ({ inst, updatePosition, onContextMenu, onTouchStart, onTouchEnd, onTouchMove }) => {
//     const nodeRef = useRef(null);
//
//     return (
//         <Draggable
//             nodeRef={nodeRef}
//             defaultPosition={{ x: inst.x, y: inst.y }}
//             bounds="parent"
//             onStop={(e, data) => updatePosition(inst.id, data.x, data.y)}
//         >
//             <div
//                 ref={nodeRef}
//                 style={{ position: 'absolute', WebkitTouchCallout: 'none', userSelect: 'none' }}
//                 onContextMenu={(e) => onContextMenu(e, inst.id)}
//                 onTouchStart={(e) => onTouchStart(e, inst.id)}
//                 onTouchEnd={onTouchEnd}
//                 onTouchMove={onTouchMove}
//             >
//                 <InstrumentRenderer inst={inst} />
//             </div>
//         </Draggable>
//     );
// };
//
// function App() {
//     // ВАЖЛИВО: pressTimer тепер ТУТ, всередині компонента!
//     const pressTimer = useRef(null);
//
//     const [instruments, setInstruments] = useState([]);
//     const [isModalOpen, setIsModalOpen] = useState(false);
//     const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, instrumentId: null });
//     const [editingInstrument, setEditingInstrument] = useState(null);
//     const [theme, setTheme] = useState('dark');
//
//     useEffect(() => {
//         window.addEventListener('click', closeContextMenu);
//         loadInstruments();
//         return () => window.removeEventListener('click', closeContextMenu);
//     }, []);
//
//     const loadInstruments = () => {
//         fetch('http://localhost:8080/api/instruments')
//             .then(res => res.json())
//             .then(data => setInstruments(data))
//             .catch(err => console.error("Помилка завантаження:", err));
//     };
//
//     const handleSaveInstrument = async (formData) => {
//         if (editingInstrument) {
//             try {
//                 const response = await fetch(`http://localhost:8080/api/instruments/${editingInstrument.id}`, {
//                     method: 'PUT',
//                     headers: { 'Content-Type': 'application/json' },
//                     body: JSON.stringify(formData)
//                 });
//
//                 if (response.ok) {
//                     const updatedInst = await response.json();
//                     setInstruments(instruments.map(inst => inst.id === updatedInst.id ? updatedInst : inst));
//                 } else {
//                     setInstruments(instruments.map(inst => inst.id === editingInstrument.id ? { ...inst, ...formData } : inst));
//                 }
//             } catch (error) {
//                 setInstruments(instruments.map(inst => inst.id === editingInstrument.id ? { ...inst, ...formData } : inst));
//             }
//         } else {
//             try {
//                 const response = await fetch('http://localhost:8080/api/instruments', {
//                     method: 'POST',
//                     headers: { 'Content-Type': 'application/json' },
//                     body: JSON.stringify(formData)
//                 });
//                 const savedInstrument = await response.json();
//                 setInstruments([...instruments, savedInstrument]);
//             } catch (error) { console.error("Помилка створення:", error); }
//         }
//
//         setIsModalOpen(false);
//         setEditingInstrument(null);
//     };
//
//     const updatePosition = async (id, x, y) => {
//         try { await fetch(`http://localhost:8080/api/instruments/${id}/position?x=${x}&y=${y}`, { method: 'PUT' }); }
//         catch (error) { console.error("Помилка збереження позиції:", error); }
//     };
//
//     const clearAll = async () => {
//         if (!window.confirm("Ви впевнені, що хочете видалити всі прилади?")) return;
//         try {
//             await fetch('http://localhost:8080/api/instruments', { method: 'DELETE' });
//             setInstruments([]);
//         } catch (error) { console.error("Помилка очищення:", error); }
//     };
//
//     const handleContextMenu = (event, instrumentId) => {
//         event.preventDefault();
//         setContextMenu({ visible: true, x: event.clientX, y: event.clientY, instrumentId });
//     };
//
//     const closeContextMenu = () => {
//         setContextMenu({ visible: false, x: 0, y: 0, instrumentId: null });
//     };
//
//     const handleEditClick = () => {
//         const instToEdit = instruments.find(inst => inst.id === contextMenu.instrumentId);
//         if (instToEdit) {
//             setEditingInstrument(instToEdit);
//             setIsModalOpen(true);
//         }
//         closeContextMenu();
//     };
//
//     const openCreateModal = () => {
//         setEditingInstrument(null);
//         setIsModalOpen(true);
//     };
//
//     const handleDeleteInstrument = async () => {
//         const id = contextMenu.instrumentId;
//         try {
//             await fetch(`http://localhost:8080/api/instruments/${id}`, { method: 'DELETE' });
//             setInstruments(instruments.filter(inst => inst.id !== id));
//             closeContextMenu();
//         } catch (error) { console.error("Помилка видалення:", error); }
//     };
//
//     // --- ЛОГІКА ДЛЯ ТЕЛЕФОНУ (ДОВГЕ НАТИСКАННЯ) ---
//     const handleTouchStart = (e, instrumentId) => {
//         pressTimer.current = setTimeout(() => {
//             if (e.touches && e.touches.length > 0) {
//                 const touch = e.touches[0];
//                 const syntheticEvent = {
//                     clientX: touch.clientX,
//                     clientY: touch.clientY,
//                     preventDefault: () => {}
//                 };
//                 handleContextMenu(syntheticEvent, instrumentId);
//             }
//         }, 500); // 500 мілісекунд
//     };
//
//     const handleTouchEnd = () => {
//         if (pressTimer.current) clearTimeout(pressTimer.current);
//     };
//
//     const handleTouchMove = () => {
//         if (pressTimer.current) clearTimeout(pressTimer.current);
//     };
//
//     const handleTriggerAlarm = (trigger) => {
//         const id = contextMenu.instrumentId;
//         setInstruments(instruments.map(inst => {
//             if (inst.id === id) {
//                 return {
//                     ...inst,
//                     level: trigger ? 'ALARM' : 'INFO',
//                     message: trigger ? '🚨 КРИТИЧНИЙ ТИСК! НЕГАЙНО ЗУПИНІТЬ!' : ''
//                 };
//             }
//             return inst;
//         }));
//         closeContextMenu();
//     };
//
//     const toggleTheme = () => {
//         setTheme(prev => prev === 'dark' ? 'light' : 'dark');
//     };
//
//     return (
//         <div className={`dashboard-container theme-${theme}`}>
//             <header className="dashboard-header">
//                 <div className="header-title">Віртуальна панель приладів</div>
//                 <div className="header-controls">
//                     <button className="theme-toggle" onClick={toggleTheme} title="Змінити тему">
//                         {theme === 'dark' ? '☀️' : '🌙'}
//                     </button>
//                     <button className="action-btn btn-add" onClick={openCreateModal}>Додати прилад</button>
//                     <button className="action-btn btn-clear" onClick={clearAll}>Очистити поле</button>
//                 </div>
//             </header>
//
//             <main className="dashboard-workspace">
//                 {instruments.length === 0 ? (
//                     <p className="placeholder-text">РОБОЧЕ ПОЛЕ ПОРОЖНЄ</p>
//                 ) : (
//                     instruments.map(inst => {
//                         let displayInst = { ...inst };
//
//                         if (inst.type === 'WARNING_BOARD' && inst.linkedInstrumentId) {
//                             const sourceInst = instruments.find(i => String(i.id) === String(inst.linkedInstrumentId));
//                             if (sourceInst) {
//                                 displayInst.currentValue = sourceInst.currentValue;
//                             }
//                         }
//
//                         return (
//                             <DraggableInstrument
//                                 key={displayInst.id}
//                                 inst={displayInst}
//                                 updatePosition={updatePosition}
//                                 onContextMenu={handleContextMenu}
//                                 onTouchStart={handleTouchStart}
//                                 onTouchEnd={handleTouchEnd}
//                                 onTouchMove={handleTouchMove}
//                             />
//                         );
//                     })
//                 )}
//
//                 {contextMenu.visible && (
//                     <div className="context-menu" style={{ left: contextMenu.x, top: contextMenu.y }}>
//                         <div className="context-menu-item" onClick={handleEditClick}>
//                             Редагувати
//                         </div>
//
//                         {instruments.find(inst => inst.id === contextMenu.instrumentId)?.type === 'WARNING_BOARD' && (
//                             <>
//                                 <div className="context-menu-item delete" onClick={() => handleTriggerAlarm(true)}>
//                                     Тестувати тривогу (ALARM)
//                                 </div>
//                                 <div className="context-menu-item" style={{ color: '#38bdf8' }} onClick={() => handleTriggerAlarm(false)}>
//                                     Скинути в норму (INFO)
//                                 </div>
//                             </>
//                         )}
//
//                         <div className="context-menu-item delete" onClick={handleDeleteInstrument}>
//                             Видалити
//                         </div>
//                     </div>
//                 )}
//             </main>
//
//             <CreateModal
//                 isOpen={isModalOpen}
//                 onClose={() => { setIsModalOpen(false); setEditingInstrument(null); }}
//                 onSave={handleSaveInstrument}
//                 editingInstrument={editingInstrument}
//                 availableInstruments={instruments}
//             />
//         </div>
//     );
// }
//
// export default App;