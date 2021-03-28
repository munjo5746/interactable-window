import React from 'react';
import './App.scss';

const App: React.FC = () => {
    const isDragging = React.useRef<boolean>(false);
    const windowRef = React.useRef<HTMLDivElement>(null);
    React.useEffect(() => {
        const mousedown = (e: MouseEvent) => {
            // Determin if window dragging started
            // 1. Check if clicked on window element
            // 2. Check if dragging area clicked

            const target = e.target as HTMLDivElement;
            const possibleWindowDiv = target.parentElement;
            const { type } = possibleWindowDiv?.dataset || {
                id: possibleWindowDiv?.getAttribute('type') || 'none',
            };
            if (type !== 'window') return;

            const { type: possibleDraggableDivType } = target.dataset;
            if (possibleDraggableDivType !== 'draggable') return;

            isDragging.current = true;
        };

        const mousemove = (e: MouseEvent) => {
            if (!windowRef.current || !isDragging.current) return;

            const window = windowRef.current as HTMLDivElement;

            window.style.top = `${e.clientY}px`;
            window.style.left = `${e.clientX}px`;
        };

        const mouseup = (e: MouseEvent) => {
            isDragging.current = false;
            console.log('mouse up');
        };

        window.addEventListener('mousedown', mousedown);

        window.addEventListener('mousemove', mousemove);

        window.addEventListener('mouseup', mouseup);

        return () => {
            window.removeEventListener('mousedown', mousedown);
            window.removeEventListener('click', mousemove);
            window.removeEventListener('mouseup', mouseup);
        };
    }, []);
    return (
        <div className="root">
            <div
                ref={windowRef}
                data-type={'window'}
                data-id={'window-1'}
                className="window"
                style={{ width: '500px', height: '300px' }}
            >
                <div
                    data-type={'draggable'}
                    data-id={`window-1-draggable`}
                    className="draggable-header"
                >
                    Header
                </div>
                <div className="content">content</div>
            </div>
        </div>
    );
};

export default App;
