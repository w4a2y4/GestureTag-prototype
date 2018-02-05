var socket = io.connect();
var show_path = false;
var show_mouse = false;

var button_left, button_right, button_up, button_down, button_upright, button_downright, button_downleft, button_upleft;
var show_left, show_right, show_up, show_down, show_upright, show_downright, show_downleft, show_upleft;
var type;

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

var imgSet;
const img_prefix = 'http://localhost:3000/resources/';
const swipeImages = {
    up: img_prefix + 'arrow_up.png',
    down: img_prefix + 'arrow_down.png',
    left: img_prefix + 'arrow_left.png',
    right: img_prefix + 'arrow_right.png',
    upright: img_prefix + 'arrow_upright.png',
    downright: img_prefix + 'arrow_downright.png',
    downleft: img_prefix + 'arrow_downleft.png',
    upleft: img_prefix + 'arrow_upleft.png'
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
    $(this).find('img').attr('src', swipeImages.up).show();
    log();
    if ($(this).hasClass('target')) {
        $(this).removeClass('target');
        showTarget();
    }
    setTimeout(() => {
        $(this).removeClass('clicked');
    }, 500);
}));

$(document).keypress((e) => {
    if(e.which === 13) {
        // enter pressed
        // check whether the user finish all trials for the current condition
        // if true
            // get or post to ask the server rerender the page with different conditions
            // clean all the vars
        // else
            // 
    }
});

socket.on('eyemove', (x, y) => {
    changePos(x * 1.11, y * 1.11);
});

socket.on('swipe', (dir) => {
    gesture = dir;
    if (dir == 'up' && show_up) button_up.click();
    if (dir == 'down' && show_down) button_down.click();
    if (dir == 'left' && show_left) button_left.click();
    if (dir == 'right' && show_right) button_right.click();
    if (dir == 'upright' && show_upright) button_upright.click();
    if (dir == 'downright' && show_downright) button_downright.click();
    if (dir == 'downleft' && show_downleft) button_downleft.click();
    if (dir == 'upleft' && show_upleft) button_upleft.click();
});

socket.on('tap', (pos) => {
    gesture = pos;
    if (pos === 'topright' && show_up) button_up.click();
    if (pos === 'bottomleft' && show_down) button_down.click();
    if (pos === 'topleft' && show_left) button_left.click();
    if (pos === 'bottomright' && show_right) button_right.click();
});

socket.on('touch', (touch) => {
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
    console.log(server_height + ' ' + server_width + ' ' + client_height + ' ' + client_width);
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

function isUpRight(btn) {
    return imgSet["upright"] == btn.children[0].src;
}

function isDownRight(btn) {
    return imgSet["downright"] == btn.children[0].src;
}

function isDownLeft(btn) {
    return imgSet["downleft"] == btn.children[0].src;
}

function isUpLeft(btn) {
    return imgSet["upleft"] == btn.children[0].src;
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
    show_upright = false;
    show_downright = false;
    show_downleft = false;
    show_upleft = false;


    var btn_num = buttons.length;

    for (var i = 0; i < btn_num; i++) {
        var btn = buttons[i];

        if (type === 'dwell') {
            if (overlap(btn, eyeX, eyeY)) {
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
            if (overlap(btn, eyeX, eyeY)) {
                $(btn).find('img').show();
                if (isUp(btn)) {
                    button_up = btn;
                    show_up = true;
                } else if (isDown(btn)) {
                    button_down = btn;
                    show_down = true;
                } else if (isLeft(btn)) {
                    button_left = btn;
                    show_left = true;
                } else if (isRight(btn)) {
                    button_right = btn;
                    show_right = true;
                } else if (isUpRight(btn)) {
                    button_upright = btn;
                    show_upright = true;
                } else if (isDownRight(btn)) {
                    button_downright = btn;
                    show_downright = true;
                } else if (isDownLeft(btn)) {
                    button_downleft = btn;
                    show_downleft = true;
                } else if (isUpLeft(btn)) {
                    button_upleft = btn;
                    show_upleft = true;
                }
            } else $(btn).find('img').hide();
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
