var container = document.querySelector(".container");
const manager = new Hammer.Manager(container);
const swipe = new Hammer.Swipe();

manager.add(swipe);

manager.on('swipe', (e) => {
    var direction = e.offsetDirection;
    var angle = e.angle;
    const dirStr = getSwipeDirectionFromAngle(angle);
    // console.log(`${dirStr}, ${angle}`);
    emitSwipeGesture(dirStr);
    e.target.innerText = `${dirStr}`;
});

/* right : 0, up: -90, left: 180, down: 90 */
var getSwipeDirectionFromAngle = (angle) => {
    let dir = '';
    if (angle < 22.5 && angle >= -22.5) {
        dir = 'right';
    } else if (angle < -22.5 && angle >= -67.5) {
        dir = 'upright';
    } else if (angle < -67.5 && angle >= -112.5) {
        dir = 'up';
    } else if (angle < -112.5 && angle >= -157.5) {
        dir = 'upleft';
    } else if (angle < -157.5 || angle > 157.5) {
        dir = 'left';
    } else if (angle > 112.5 && angle <= 157.5) {
        dir = 'downleft';
    } else if (angle > 67.5 && angle <= 112.5) {
        dir = 'down';
    } else {
        dir = 'downright';
    }
    return dir;
};