var container = document.querySelector(".container");
const manager = new Hammer.Manager(container);
const swipe = new Hammer.Swipe();
var tester;
manager.add(swipe);

socket.on('user', function(user) {
    tester = user;
    console.log(tester);
});

socket.on('init', function(method) {
    width = document.documentElement.clientWidth;
    height = document.documentElement.clientHeight;
    console.log(width + ' ' + height);
    socket.emit('client_init', width, height);
});

/* send touch raw data */
manager.on('hammer.input', (ev) => {
    const touch = {
        type: ev.type,
        pos: {
            x: ev.center.x,
            y: ev.center.y
        }
    };
    emitTouchData(touch);
    console.log(touch.pos)

    console.log(ev);
    // If one can only do multi-touch swipe
    if (ev.maxPointers > 1) {
        if (ev.isFinal === true) {
            let multidir = ev.direction
            if (multidir === Hammer.DIRECTION_RIGHT) {
                dir = 'right';
            } else if (multidir === Hammer.DIRECTION_UP) {
                dir = 'up';
            } else if (multidir === Hammer.DIRECTION_LEFT) {
                dir = 'left';
            } else if (multidir === Hammer.DIRECTION_DOWN) {
                dir = 'down';
            }
            emitSwipeGesture(dir);
            console.log("M: " + dir);
            ev.target.innerText = `${dir}`
        }
    }
});

// If one can do single-touch swipe
manager.on('swipe', (e) => {
    var direction = e.offsetDirection;
    var angle = e.angle;
    const dirStr = getSwipeDirectionFromAngle(angle, direction);
    // console.log(`${dirStr}, ${angle}`);
    emitSwipeGesture(dirStr);
    e.target.innerText = `${dirStr}`;
});

/* right : 0, up: -90, left: 180, down: 90 */
var getSwipeDirectionFromAngle = (angle, direction) => {
    let dir = '';
    if (tester === 'motor') {
        console.log('motor tester');
        if (direction === Hammer.DIRECTION_RIGHT) {
            dir = 'right';
        } else if (direction === Hammer.DIRECTION_UP) {
            dir = 'up';
        } else if (direction === Hammer.DIRECTION_LEFT) {
            dir = 'left';
        } else if (direction === Hammer.DIRECTION_DOWN) {
            dir = 'down';
        }
    } else {
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
    }
    console.log("A: " + dir)
    return dir;
};