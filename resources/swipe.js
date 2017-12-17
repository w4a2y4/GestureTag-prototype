var container = document.querySelector(".container");
const manager = new Hammer.Manager(container);
const swipe = new Hammer.Swipe();

manager.add(swipe);

manager.on('swipe', (e) => {
    var direction = e.offsetDirection;
    var directionStr = getSwipeDirectionStr(direction);
    emitSwipeGesture(directionStr);
    e.target.innerText = directionStr;
});

var getSwipeDirectionStr = (direction) => {
    var gesture = '';
    switch (direction) {
        case Hammer.DIRECTION_LEFT:
            gesture = 'left';
            break;
        case Hammer.DIRECTION_RIGHT:
            gesture = 'right';
            break;
        case Hammer.DIRECTION_UP:
            gesture = 'up'
            break;
        case Hammer.DIRECTION_DOWN:
            gesture = 'down';
            break;
        default:
            gesture = 'unknown';
            break;
    }
    return gesture;
}
