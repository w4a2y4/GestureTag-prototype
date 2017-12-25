var button = document.querySelector("button");
const socket = io();

var emitSwipeGesture = (gesture) => {
    socket.emit('swipe', gesture);
}

var emitTapGesture = (quadrant) => {
    socket.emit('tap', quadrant);
}