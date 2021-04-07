import React from 'react';
import './App.scss';
type TWindow = {
    id: string;
    dimension: TDimension;
};
type TDimension = {
    width: number;
    height: number;
};
const App: React.FC = () => {
    const isDragging = React.useRef<boolean>(false);
    const prevPositionRef = React.useRef<{
        div: HTMLDivElement;
        clientX: number;
        clientY: number;
        top: number;
        left: number;
    }>();
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

            const window = possibleWindowDiv as HTMLDivElement;
            window.style.border = '2px solid #FE2F2E';

            const { top, left } = window.getBoundingClientRect();

            prevPositionRef.current = {
                div: window,
                clientX: e.clientX,
                clientY: e.clientY,
                top,
                left,
            };
            isDragging.current = true;
        };

        const mousemove = (e: MouseEvent) => {
            if (!isDragging.current) return;

            const {
                div,
                top,
                left,
                clientX,
                clientY,
            } = prevPositionRef.current || {
                div: null,
                top: 0,
                left: 0,
                clientX: 0,
                clientY: 0,
            };
            if (!div) return;

            const xDiff = e.clientX - clientX;
            const yDiff = e.clientY - clientY;

            const window = div as HTMLDivElement;

            window.style.top = `${top + yDiff}px`;
            window.style.left = `${left + xDiff}px`;
        };

        const mouseup = (e: MouseEvent) => {
            const { div } = prevPositionRef.current || { div: null };
            if (!div) return;

            const window = div as HTMLDivElement;
            window.style.border = 'none';

            isDragging.current = false;
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
    const [windows, setWindows] = React.useState<TWindow[]>([]);
    return (
        <div className="root">
            <button
                onClick={(e) => {
                    e.preventDefault();
                    setWindows((prev) => {
                        const window: TWindow = {
                            id: `window-${prev.length}`,
                            dimension: {
                                width: 500,
                                height: 500,
                            },
                        };
                        return [...prev, window];
                    });
                }}
            >
                Add
            </button>
            {windows.map((window) => {
                return (
                    <div
                        key={window.id}
                        className="window"
                        data-type="window"
                        data-id={window.id}
                        style={{
                            width: `${window.dimension.width}px`,
                            height: `${window.dimension.height}px`,
                        }}
                    >
                        <div
                            data-type={'draggable'}
                            data-id={`${window.id}-draggable`}
                            className="draggable-header"
                        >
                            {window.id}
                            <div
                                className="close"
                                onClick={(e) => {
                                    e.preventDefault();

                                    setWindows((prev) => {
                                        return [
                                            ...prev.filter(
                                                (prevWindow) =>
                                                    prevWindow.id !== window.id,
                                            ),
                                        ];
                                    });
                                }}
                            >
                                x
                            </div>
                        </div>
                        <div className="content">content</div>
                    </div>
                );
            })}
        </div>
    );
};

export default App;
