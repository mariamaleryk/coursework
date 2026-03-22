import React from 'react';

const ContextMenu = ({ menuState, onSimulate, onDelete }) => {
    if (!menuState.visible) return null;

    return (
        <div className="context-menu" style={{ left: menuState.x, top: menuState.y }}>
            <div className="context-menu-item" onClick={onSimulate}>
                Симулювати значення
            </div>
            <div className="context-menu-item delete" onClick={onDelete}>
                Видалити
            </div>
        </div>
    );
};

export default ContextMenu;