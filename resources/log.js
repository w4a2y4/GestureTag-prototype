var button = document.getElementById('normal');
var realtimeButton = document.getElementById('realtime');
const socket = io();
var optionStatus = document.getElementById('option');

socket.on('end', () => {
    button.style.display = "block";
});

var startTrial = () => {
    button.style.display = "none";
    realtimeButton.style.display = "none";
    socket.emit('start');
};


var startTrialWithTouchData = () => {
    button.style.display = "none";
    realtimeButton.style.display = "none";
    realtimeButton.dispatchEvent(new Event('trigger'));
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
