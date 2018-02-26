const socket = io();

var emitMobileStart = () => {
    socket.emit('start');
};

var emitSwipeGesture = (gesture) => {
    socket.emit('swipe', gesture);
};

var emitTapGesture = (quadrant) => {
    socket.emit('tap', quadrant);
};

var emitTouchData = (event) => {
    socket.emit('touch', event);
};