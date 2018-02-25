var socket = io.connect();
var show_path = false;
var show_mouse = false;

var button_left, button_right, button_up, button_down;
var show_left, show_right, show_up, show_down;

var tester;
var type;
var platform;

const DEFAULT_TRIAL_NUM = 12;
var trial_num = DEFAULT_TRIAL_NUM;

var clicked_button, target_btn, gesture;
var buttons = document.getElementsByTagName('button');

var already = new Array(buttons.length).fill(0);
var TimeStart = new Date().getTime();
var TimeEnd = new Date().getTime();

var touch_timer, new_path, prevX, prevY;
var c = document.getElementById("canvas");
var cxt = c.getContext("2d");
var server_width = document.documentElement.clientWidth;
var server_height = document.documentElement.clientHeight;
var client_width, client_height;

var LockerTimeEnd = new Array(buttons.length).fill(0.0);
var LockerTimeStart = new Array(buttons.length).fill(0.0);

var UpbtnId = 0;
var DownbtnId = 0;
var LeftbtnId = 0;
var RightbtnId = 0;

var touchLock;

var imgSet;
const img_prefix = 'http://localhost:3000/resources/';
const swipeImages = {
    up: img_prefix + 'arrow_up.png',
    down: img_prefix + 'arrow_down.png',
    left: img_prefix + 'arrow_left.png',
    right: img_prefix + 'arrow_right.png'
};
const tapImages = {
    up: img_prefix + 'tap_topright.png',
    down: img_prefix + 'tap_bottomleft.png',
    left: img_prefix + 'tap_topleft.png',
    right: img_prefix + 'tap_bottomright.png'
};


$(document).keyup((e) => {
    // key "enter"
    if (e.which === 32) {
        socket.emit('start');
        trial_num = DEFAULT_TRIAL_NUM;
        showTarget();
    } else if (e.which === 69) // key "e"
        show_mouse = !show_mouse;
    else if (e.which === 80) // key "p"
        show_path = !show_path;
})

$(document).mousemove((e) => {
    if (show_mouse)
        changePos(e.pageX, e.pageY);
});

$(document).on('click', 'button', (function(e) {
    console.log("click!!");
    $(this).addClass('clicked');
    clicked_btn = $(this).parent().attr('id');
    log();
    if ($(this).hasClass('target')) {
        $(this).removeClass('target');
        showTarget();
    }
    setTimeout(() => {
        $(this).removeClass('clicked');
    }, 500);
}));


socket.on('eyemove', (x, y) => {
    changePos(x * 1.11, y * 1.11);
});

socket.on('swipe', (dir) => {
    gesture = dir;
    enableClick(dir);
    swipeAndUnlock(gesture);
});

socket.on('tap', (pos) => {
    gesture = pos;
    if (pos === 'topright' && show_up) button_up.click();
    if (pos === 'bottomleft' && show_down) button_down.click();
    if (pos === 'topleft' && show_left) button_left.click();
    if (pos === 'bottomright' && show_right) button_right.click();
});

socket.on('touch', (touch) => {
    touchLock=true
    if (show_path) {
        changePath(touch.x, touch.y);
        clearTimeout(touch_timer);
        touch_timer = setTimeout(clearCanvas, 300);
    }
});

socket.on('init', (method) => {
    type = method;
    console.log(type);
    if (type === 'swipe') imgSet = swipeImages;
    else if (type === 'tap') imgSet = tapImages;
});

socket.on('client_init', (width, height) => {
    client_width = width;
    client_height = height;
});

socket.on('user', (user) => {
    tester = user;
    console.log(tester);
});

socket.on('device', (device) => {
    platform = device;
    console.log(platform);
    enableSwipe();
});


function log() {
    cnt = DEFAULT_TRIAL_NUM - trial_num;
    console.log(gesture + ' ' + clicked_btn + ' ' + target_btn);
    socket.emit('log', cnt, gesture, clicked_btn, target_btn);
}

function isUp(btn) {
    return imgSet["up"] == btn.children[0].src;
}

function isDown(btn) {
    return imgSet["down"] == btn.children[0].src;
}

function isLeft(btn) {
    return imgSet["left"] == btn.children[0].src;
}

function isRight(btn) {
    return imgSet["right"] == btn.children[0].src;
}

function overlap(element, X, Y) {
    var top = $(element).offset().top;
    var left = $(element).offset().left;
    var right = Number($(element).offset().left) + Number($(element).width());
    var bottom = Number($(element).offset().top) + Number($(element).height());
    var threshold;

    if (type === 'dwell') threshold = 10;
    else threshold = RADIUS;
    // in the element
    if (X >= left && X <= right && Y >= top && Y <= bottom) return true;
    else if (X < left && Y >= top && Y <= bottom) return (left - X) <= threshold;
    else if (X > right && Y >= top && Y <= bottom) return (X - right) <= threshold;
    else if (X >= left && X <= right && Y < top) return (top - Y) <= threshold;
    else if (X >= left && X <= right && Y > bottom) return (Y - bottom) <= threshold;
    else if (Math.pow((X - left), 2) + Math.pow((Y - top), 2) <= threshold * threshold)
        return true;
    else if (Math.pow((X - left), 2) + Math.pow((Y - bottom), 2) <= threshold * threshold)
        return true;
    else if (Math.pow((X - right), 2) + Math.pow((Y - top), 2) <= threshold * threshold)
        return true;
    else if (Math.pow((X - right), 2) + Math.pow((Y - bottom), 2) <= threshold * threshold)
        return true;
    return false;
}

function distance (element, X, Y) {
    // use jQuery to get ABSOLUTE position
    var midX = $(element).offset().left + 0.5 * element.offsetWidth;
    var midY = $(element).offset().top  + 0.5 * element.offsetHeight;
    return (Math.pow((X - midX), 2) + Math.pow((Y - midY), 2));
}

function swap(x, y) {
    return [y,x];
}

function isIn(x, arr, len) {
    for (var i = 0; i < len; i++)
        if ( x == arr[i] ) return true;
    return false;
}

function changePos(eyeX, eyeY) {

    $('#eye_tracker').css({
        "left": eyeX,
        "top": eyeY
    });

    $('#canvas_container').css({
        "left": eyeX - 700,
        "top": eyeY - 500
    });

    show_up = false;
    show_down = false;
    show_left = false;
    show_right = false;

    // the candidates are the nearest [up, down, left, right]
    var btn_num = buttons.length;
    var candidate = new Array(4).fill(-1);
    var dist = new Array(4).fill(5000000);

    // for each type of gesture, put the nearest's index in candidate[]
    for (var i = 0; i < btn_num; i++) {
        var btn = buttons[i];
        if (overlap(btn, eyeX, eyeY)) {

            var curr_dist = distance(btn, eyeX, eyeY);

            if (isUp(btn)) {
                if (curr_dist < dist[0]) {
                    candidate[0] = i;
                    dist[0] = curr_dist;
                }
            } else if (isDown(btn)) {
                if (curr_dist < dist[1]) {
                    candidate[1] = i;
                    dist[1] = curr_dist;
                }
            } else if (isLeft(btn)) {
                if (curr_dist < dist[2]) {
                    candidate[2] = i;
                    dist[2] = curr_dist;
                }
            } else if (isRight(btn)) {
                if (curr_dist < dist[3]) {
                    candidate[3] = i;
                    dist[3] = curr_dist;
                }
            }
        }
    }

    for (var i = 0; i < btn_num; i++) {
        var btn = buttons[i];

        if (type === 'dwell') {
            if ( overlap(btn, eyeX, eyeY) ) {
                if (already[i]) { // Have already looked at the target
                    TimeEnd = Date.now(); // Record time then
                } else {
                    already[i] = 1; //First time to look at the target
                    TimeStart = Date.now(); // Record time then
                }

                if (already[i] == 1 && TimeEnd - TimeStart > 330.0) {
                    clickablebtn = btn;
                    clickablebtn.click();
                    console.log("Selection Success!!");
                    already[i] = 0; // reinitialize
                }
                // Showing image 
                $(btn).find('img').show();

            } else {
                $(btn).find('img').hide();
                already[i] = 0;
            }
        } else {
            if ( isIn(i, candidate, 4) ) {
                if (already[i]) { // Have already looked at the target
                    LockerTimeEnd[i] = Date.now(); // Record time then
                } else {
                    already[i] = 1; //First time to look at the target
                    LockerTimeStart[i] = Date.now(); // Record time then
                }
                var theTimeInterval = LockerTimeEnd[i] - LockerTimeStart[i];
                $(btn).find('img').show();
                if (theTimeInterval > 150.0 && touchLock == false) {
                        // $(btn).find('img').show();
                        if (isUp(btn)& LockerTimeEnd[UpbtnId] < LockerTimeEnd[i]) {
                            UpbtnId = i;
                            button_up = btn;
                            show_up = true;
                        } else if (isDown(btn)& LockerTimeEnd[DownbtnId] < LockerTimeEnd[i]) {
                            DownbtnId = i;
                            button_down = btn;
                            show_down = true;
                        } else if (isLeft(btn)& LockerTimeEnd[LeftbtnId] < LockerTimeEnd[i]) {
                            LeftbtnId = i;
                            button_left = btn;
                            show_left = true;
                        } else if (isRight(btn)& LockerTimeEnd[ RightbtnId] < LockerTimeEnd[i]) {
                            RightbtnId = i;
                            button_right = btn;
                            show_right = true;
                        }
                    }
            } else {
                $(btn).find('img').hide();
                show_up = true;
                show_down = true;
                show_left = true;
                show_right = true;
                button_up = buttons[UpbtnId];
                button_left = buttons[LeftbtnId];
                button_down = buttons[DownbtnId];
                button_right = buttons[RightbtnId];
                if ( i != LeftbtnId && i != RightbtnId && i != UpbtnId && i != DownbtnId) {
                    LockerTimeEnd[i] = 0.0; // Record time then
                    LockerTimeStart[i] = 0.0; // Record time then
                    already[i] = 0;
                }
            }
        }
    }
}

function showTarget() {
    if (trial_num == 0) {
        socket.emit('end');
        return;
    }
    while (true) {
        var btn_num = buttons.length;
        var rand = Math.floor(Math.random() * btn_num);
        console.log(trial_num + ' ' + rand);
        if (!$(buttons[rand]).hasClass('clicked')) break;
    }
    $(buttons[rand]).addClass('target');
    target_btn = $(buttons[rand]).parent().attr('id');
    trial_num -= 1;
}

function changePath(pathX, pathY) {
    cxt.fillStyle = "#FF2345";
    pathX = pathX * server_width / client_width;
    pathY = pathY * server_height / client_height;
    if (!new_path) {
        cxt.moveTo(prevX, prevY);
        cxt.lineTo(pathX, pathY);
        cxt.stroke();
    }
    prevX = pathX;
    prevY = pathY;
    new_path = false;
}

function clearCanvas() {
    cxt.clearRect(0, 0, 1400, 1000);
    cxt.beginPath();
    new_path = true;
}

var getSwipeDirectionFromAngle = (angle, direction) => {
    let dir = '';
    if (direction === Hammer.DIRECTION_RIGHT) {
        dir = 'right';
    } else if (direction === Hammer.DIRECTION_UP) {
        dir = 'up';
    } else if (direction === Hammer.DIRECTION_LEFT) {
        dir = 'left';
    } else if (direction === Hammer.DIRECTION_DOWN) {
        dir = 'down';
    }
    return dir;
};

function enableSwipe() {
    if (platform === 'mobile') {
        var container = document.getElementById("MobileContainer");
        const manager = new Hammer.Manager(container);
        const swipe = new Hammer.Swipe();
        manager.add(swipe);

        manager.on('swipe', (e) => {
            var direction = e.offsetDirection;
            var angle = e.angle;
            const dirStr = getSwipeDirectionFromAngle(angle, direction);
            enableClick(dirStr);
            swipeAndUnlock(dirStr);
        });

        manager.on('hammer.input', (ev) => {
            console.log(ev);
            // If one can only do multi-touch swipe
            if (ev.maxPointers > 1) {
                if (ev.isFinal === true) {
                    let multidir = ev.direction;
                    if (multidir === Hammer.DIRECTION_RIGHT) {
                        dir = 'right';
                    } else if (multidir === Hammer.DIRECTION_UP) {
                        dir = 'up';
                    } else if (multidir === Hammer.DIRECTION_LEFT) {
                        dir = 'left';
                    } else if (multidir === Hammer.DIRECTION_DOWN) {
                        dir = 'down';
                    }
                    enableClick(dir);
                    console.log("M: " + dir);
                }
            }
        });

    }
};

function enableClick(dirStr) {
    if (dirStr == 'up' && show_up) buttons[UpbtnId].click();
    if (dirStr == 'down' && show_down) buttons[DownbtnId].click();
    if (dirStr == 'left' && show_left) buttons[LeftbtnId].click();
    if (dirStr == 'right' && show_right) buttons[RightbtnId].click();
}


var swipeAndUnlock = (dir) => {
    if (dir == 'up' && show_up) {
        button_up.click();
        already[UpbtnId] = 0;
        touchLock = false;
        console.log("swipe up:" + String(UpbtnId))
    } else if (dir == 'down' && show_down) {
        button_down.click();
        already[DownbtnId] = 0;
        touchLock = false;
        console.log("swipe down:" + String(DownbtnId))
    } else if (dir == 'left' && show_left) {
        button_left.click();
        already[LeftbtnId] = 0;
        touchLock = false;
        console.log("swipe left:" + String(LeftbtnId))
    } else if (dir == 'right' && show_right) {
        button_right.click();
        already[RightbtnId] = 0;
        touchLock = false;
        console.log("swipe right:" + String(RightbtnId))
    }
}