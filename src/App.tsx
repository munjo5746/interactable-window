import { Socket } from 'dgram';
import React from 'react';
import { io } from 'socket.io-client';
import { DefaultEventsMap } from 'socket.io-client/build/typed-events';
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
    const EXPANDING_AREA_WIDTH = 300;
    const rootRef = React.useRef<HTMLDivElement>(null);
    const isDragging = React.useRef<boolean>(false);
    const prevPositionRef = React.useRef<{
        div: HTMLDivElement;
        clientX: number;
        clientY: number;
        top: number;
        left: number;
    }>();
    const inExpadingArea = React.useCallback((e: MouseEvent) => {
        const { clientX } = e;
        if (clientX < EXPANDING_AREA_WIDTH) {
            return true;
        }
    }, []);

    const [showSidebarArea, toggleSidebarArea] = React.useState<boolean>(false);
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
            window.style.border = '2px solid gray';

            const { top, left } = window.getBoundingClientRect();

            prevPositionRef.current = {
                div: window,
                clientX: e.clientX,
                clientY: e.clientY,
                top,
                left,
            };
            isDragging.current = true;

            toggleSidebarArea(true);
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

            if (inExpadingArea(e)) {
                const { height } = rootRef.current?.getBoundingClientRect() || {
                    width: window.style.width,
                    height: window.style.height,
                };
                window.style.top = `${0}px`;
                window.style.left = `${0}px`;
                window.style.width = `${EXPANDING_AREA_WIDTH}px`;
                window.style.height = `${height}px`;

                return;
            }

            window.style.top = `${top + yDiff}px`;
            window.style.left = `${left + xDiff}px`;
            window.style.width = '500px';
            window.style.height = '500px';
        };

        const mouseup = (e: MouseEvent) => {
            const { div } = prevPositionRef.current || { div: null };
            if (!div) return;

            const window = div as HTMLDivElement;
            window.style.border = 'none';

            isDragging.current = false;
            toggleSidebarArea(false);
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
    const socket = React.useMemo(() => io('http://localhost:8080'), []);
    React.useEffect(() => {
        if (!socket) return;

        socket.on('connect', () => {
            console.log('connected socket id:', socket.id);
        });
        socket.on('new-window', (arg) => {
            console.log('received', arg);
            const { senderId } = arg;

            if (senderId === socket.id) {
                console.log('This client was sender... skipping the process!');
                return;
            }

            console.log('validating and adding...');

            setWindows((prev) => {
                const { window } = arg;
                const found = prev.some((win) => win.id === window.id);
                if (found) {
                    console.log(`The window (${window.id}) was found.`);
                    return [...prev];
                }
                return [...prev, window];
            });
        });
    }, [socket]);
    return (
        <>
            <div ref={rootRef} className="root">
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
                                                        prevWindow.id !==
                                                        window.id,
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

                {showSidebarArea && (
                    <div
                        className="side-bar-expanding-area"
                        style={{
                            width: EXPANDING_AREA_WIDTH,
                        }}
                    >
                        Drag here
                    </div>
                )}
            </div>

            <button
                style={{
                    width: '5em',
                    height: '3em',
                    margin: '1em 0',
                }}
                onClick={(e) => {
                    e.preventDefault();
                    const window: TWindow = {
                        id: `window-${windows.length}`,
                        dimension: {
                            width: 500,
                            height: 500,
                        },
                    };
                    socket.emit('new-window', window);

                    setWindows([...windows, window]);
                }}
            >
                Add
            </button>
        </>
    );
};

export default App;
