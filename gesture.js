var container = document.querySelector(".container");
const manager = new Hammer.Manager(container);

const swipe = new Hammer.Swipe();

manager.add(swipe);

manager.on('swipe', (e) => {
    var direction = e.offsetDirection;
    switch (direction) {
        case Hammer.DIRECTION_LEFT:
            e.target.innerText = 'LEFT';
            break;
        case Hammer.DIRECTION_RIGHT:
            e.target.innerText = 'RIGHT';
            break;
        case Hammer.DIRECTION_UP:
            e.target.innerText = 'UP';
            break;
        case Hammer.DIRECTION_DOWN:
            e.target.innerText = 'DOWN';
            break;
        default:
            e.target.innerText = 'UNKNOWN';
            break;
    }
});
