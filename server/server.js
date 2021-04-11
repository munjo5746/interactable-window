const httpServer = require('http').createServer();
const io = require('socket.io')(httpServer, {
    cors: {
        origin: "*"
    }
});

io.on('connection', (socket) => {
    console.log('connectedsocket id:', socket.id);

    socket.on("new-window", (arg) => {
        const sendingArg = {
            senderId: socket.id,
            window: arg
        };
        io.sockets.emit('new-window', sendingArg);
    });

    socket.on('move', (args) => {
        const sendingArgs = {
            senderId: socket.id,
            ...args
        };

        io.sockets.emit('move', sendingArgs);
    });
});

httpServer.listen(8080);