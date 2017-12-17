var button = document.querySelector("button");
const socket = io();


socket.on('end', () => {
    button.style.display = "block";
});

var startTrial = () => {
    button.style.display = "none";
    socket.emit('start');
}

var emitSwipeGesture = (gesture) => {
    socket.emit('swipe', gesture);
}

var emitTapGesture = (quadrant) => {
    socket.emit('tap', quadrant);
}
