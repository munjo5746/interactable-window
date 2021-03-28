import React from 'react';
import './App.scss';

const App: React.FC = () => {
    const isDragging = React.useRef<boolean>(false);
    const windowRef = React.useRef<HTMLDivElement>(null);
    React.useEffect(() => {
        const mousedown = (e: MouseEvent) => {
            isDragging.current = true;
        };

        const mousemove = (e: MouseEvent) => {
            if (!windowRef.current || !isDragging.current) return;

            windowRef.current.style.top = `${e.clientY}px`;
            windowRef.current.style.left = `${e.clientX}px`;
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
                className="window"
                style={{ width: '500px', height: '300px' }}
            >
                <div
                    className="draggable-section"
                    style={{
                        width: '100%',
                        height: '50px',
                        background: 'gray',
                    }}
                >
                    draggable
                </div>
                <div className="content">content</div>
            </div>
        </div>
    );
};

export default App;
