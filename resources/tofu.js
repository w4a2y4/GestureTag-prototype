var socket = io.connect();
var show_path = false;
var show_mouse = false;

var BTN_SIZE;
var SPACING;

const UP = 0,
    DOWN = 1,
    LEFT = 2,
    RIGHT = 3;

var currBtn = new Array(4).fill(null);
var isShown = new Array(4).fill(false);

var tester;
var type;
var platform;
var dynamic = false;

const DEFAULT_TRIAL_NUM = 10;
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

const TOFU_WIDTH = server_width / COL_NUM;
const TOFU_HEIGHT = server_height / RAW_NUM;

var LockerTimeEnd = new Array(buttons.length).fill(0.0);
var LockerTimeStart = new Array(buttons.length).fill(0.0);

var postBtnId = new Array(4).fill(0);
var touchLock;

var JumpDistance = new Array(DEFAULT_TRIAL_NUM).fill(0);
var CandidateButtonArray = new Array(buttons.length).fill(0);
var CurrentTarX = 0.0;
var CurrentTarY = 0.0;
var oldbuttons = buttons;
var tar

var TrialTimeStart = new Date().getTime();
var TrialTimeEnd = new Date().getTime();
var TrialCompletionTime;
var trialTimer;
var ErrorCount = 0;
var clickedbutton;
var ready = true;

var pgBar = $('#circle');
pgBar.circleProgress({
    startAngle: -Math.PI / 4 * 2,
    value: 0.0,
    size: 50,
    lineCap: 'round',
    fill: { gradient: ['#0681c4', '#4ac5f8'] },
});
const timeTd = 330;
var outNum = 0;

var EyeErrorX = new Array(10).fill(0.0);
var EyeErrorY = new Array(10).fill(0.0);
var ErrorTimeStart = new Date().getTime();
var ErrorTimeEnd = new Date().getTime();
var ErrorIndex = 0;
var DwellSelectionCount = 0;
var MouseClickCount = 0;

var CalibrationLogmsg = ""
var CalibrationEndTime = new Date().getTime();
var CalibrationStartTime = new Date().getTime();
var CalibrationState = false;
var dwellcandidateID = 0;
var mostneardistance = 10000000000000000;

var EyeGestureX = new Array(10).fill(0.0);
var EyeGestureY = new Array(10).fill(0.0);
var EyeGestureOriX
var EyeGestureOriY
var GoEyeGesture = false;
var EyeGestureIndex = 0;
var EyeGestureTimeStart = new Array(buttons.length).fill(0.0);
var EyeGestureTimeEnd = new Array(buttons.length).fill(0.0);
var StayIndex = 0;
var EyeStayTimeEnd = new Date().getTime();
var EyeStayTimeStart = new Date().getTime();
var EyeStayX = new Array(10).fill(0.0);
var EyeStayY = new Array(10).fill(0.0);

var UserAlready = false;
var preTimeStamp = 0.0


var imgSet;
const img_prefix = 'http://localhost:3000/resources/';
const swipeImages = {
    up: img_prefix + 'arrow_0.png',
    down: img_prefix + 'arrow_1.png',
    left: img_prefix + 'arrow_2.png',
    right: img_prefix + 'arrow_3.png'
};
const tapImages = {
    up: img_prefix + 'tap_topright.png',
    down: img_prefix + 'tap_bottomleft.png',
    left: img_prefix + 'tap_topleft.png',
    right: img_prefix + 'tap_bottomright.png'
};

$(document).keyup((e) => {
    // key "enter"
    if (e.which === 32 && platform !== 'mobile') {
        e.preventDefault();
        socket.emit('start');
        trial_num = DEFAULT_TRIAL_NUM;
        JumpDistance = new Array(DEFAULT_TRIAL_NUM).fill(0); //have to set to zero

        AssignTargetAlgo();
        showTarget();
    } else if (e.which === 69) // key "e"
        show_mouse = !show_mouse;
    else if (e.which === 80) // key "p"
        show_path = !show_path;
    else if (e.which === 67) {
        CalibrationStartTime = Date.now()
        CalibrationState = true;
    }
})

$(document).mousemove((e) => {
    if (show_mouse)
        changePos(e.pageX, e.pageY);
});

$(document).mousedown((e) => {
    MouseClickCount++;
});

$(document).on('click', 'button', (function(e) {

    clearTimeout(trialTimer);
    $(this).addClass('clicked');
    $('.gif').remove();
    TrialTimeEnd = Date.now();

    TrialCompletionTime = TrialTimeEnd - TrialTimeStart

    LockerTimeEnd = Array(buttons.length).fill(0.0);
    LockerTimeStart = Array(buttons.length).fill(0.0);
    EyeGestureOriX = null
    EyeGestureOriY = null //reset eyegesture origin
    clicked_btn = $(this).parent().attr('id');
    if (!$(this).hasClass('target')) {
        ErrorCount++;
        // setTimeout(() => { $(this).removeClass('clicked') }, 100);
    }
    log();
    //if ($(this).hasClass('target')) {

    setTimeout(() => {
        // $(this).removeClass('target');
        $('.target').removeClass('target');
        $(this).removeClass('clicked');
        showTarget();
    }, 200);

}));

socket.on('eyemove', (x, y, ts) => {
    UserState(ts)
        // please add some comments about where the magic number is
        // and the reason.
    let magicScale = 1; //surface pro should be 0.8
    changePos(x * magicScale, y * magicScale);
    Eyespacingerror(x * magicScale, y * magicScale);
});

socket.on('swipe', (dirStr) => {
    gesture = dir;
    var dir;
    if (dirStr == 'up') dir = UP;
    else if (dirStr == 'down') dir = DOWN;
    else if (dirStr == 'left') dir = LEFT;
    else if (dirStr == 'right') dir = RIGHT;
    swipeAndUnlock(dir);
});

socket.on('done', (str) => {
    alert("You already finished one input method! Take a break.");
    clearTimeout(trialTimer);
    $(document).off('keyup');
});

socket.on('tap', (pos) => {
    gesture = pos;
    if (pos === 'topright' && isShown[0]) currBtn[0].click();
    if (pos === 'bottomleft' && isShown[1]) currBtn[1].click();
    if (pos === 'topleft' && isShown[2]) currBtn[2].click();
    if (pos === 'bottomright' && isShown[3]) currBtn[3].click();
});

socket.on('touch', (touch) => {
    touchLock = true
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
    else if (type === 'EyeGesture') { imgSet = swipeImages; } else if (type === 'tap') imgSet = tapImages;
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
    if (platform === 'mobile') {
        socket.on('start_mobile', () => {
            console.log('START_MOBILE');
            trial_num = DEFAULT_TRIAL_NUM;
            AssignTargetAlgo();
            showTarget();
        });
        if (type === 'swipe') enableSwipe();
    }
});

socket.on('assign', (assign) => {
    if (assign === 'dynamic') dynamic = true;
});

socket.on('target_size', function(target_size) {
    BTN_SIZE = Number(target_size) / DP_RATIO;
});

socket.on('spacing', function(spacing) {
    SPACING = Number(spacing);
});

function log() {
    cnt = DEFAULT_TRIAL_NUM - trial_num;
    console.log(gesture + ' ' + clicked_btn + ' ' + target_btn);
    socket.emit('log', cnt, gesture, clicked_btn, target_btn, TrialCompletionTime, ErrorCount, DwellSelectionCount, MouseClickCount);
}

function getBtnType(btn, x, y) {

    if (!dynamic) {
        if (imgSet["up"] == btn.children[0].src) return UP;
        else if (imgSet["down"] == btn.children[0].src) return DOWN;
        else if (imgSet["left"] == btn.children[0].src) return LEFT;
        else if (imgSet["right"] == btn.children[0].src) return RIGHT;
        return -1;
    }

    var midX = $(btn).offset().left + 0.5 * btn.offsetWidth;
    var midY = $(btn).offset().top + 0.5 * btn.offsetHeight;
    var diffX = midX - x;
    var diffY = midY - y;
    var slope = diffY / diffX;

    if (diffX > 0 && slope < 1 && slope > -1) return RIGHT;
    else if (diffX < 0 && slope < 1 && slope > -1) return LEFT;
    else if (diffY > 0 && (slope > 1 || slope < -1)) return DOWN;
    return UP;
}

function Calibrationlog(x, y, CalibrateID, CalibrateBtnX, CalibrateBtnY) {
    socket.emit('Calibrationlog', x, y, CalibrateID, CalibrateBtnX, CalibrateBtnY);
}

function overlap(element, X, Y) {
    if ($(element).is(':hidden')) return;
    var top = $(element).offset().top;
    var left = $(element).offset().left;
    var right = Number($(element).offset().left) + Number($(element).width());
    var bottom = Number($(element).offset().top) + Number($(element).height());
    var threshold;

    if (type === 'dwell') threshold = 0;
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

function distance(element, X, Y) {
    // use jQuery to get ABSOLUTE position
    var midX = $(element).offset().left + 0.5 * element.offsetWidth;
    var midY = $(element).offset().top + 0.5 * element.offsetHeight;
    return (Math.pow((X - midX), 2) + Math.pow((Y - midY), 2));
}

function swap(x, y) {
    return [y, x];
}

function isIn(x, arr, len) {
    for (var i = 0; i < len; i++)
        if (x == arr[i]) return true;
    return false;
}

function changePos(eyeX, eyeY) {

    if (GoEyeGesture) {
        var eyedir = EyeGesture(eyeX, eyeY, EyeGestureOriX, EyeGestureOriY)
        if (eyedir != null) {
            var dir;
            if (eyedir == 'up') dir = UP;
            else if (eyedir == 'down') dir = DOWN;
            else if (eyedir == 'left') dir = LEFT;
            else if (eyedir == 'right') dir = RIGHT;
            swipeAndUnlock(dir);
            $('.gif').remove();
            EyeGestureOriX = null;
            EyeGestureOriY = null;
        }
        return;
    }

    $('#eye_tracker').css({
        "left": eyeX,
        "top": eyeY
    });

    $('#canvas_container').css({
        "left": eyeX - 700,
        "top": eyeY - 500
    });

    if (!ready) return;

    if (CalibrationState) Calibration(eyeX, eyeY);
    else {

        // the candidates are the nearest [up, down, left, right]
        var btn_num = buttons.length;
        var candidate = new Array(4).fill(-1);
        var dist = new Array(4).fill(5000000);

        var mostneardistance = 100000000000000000;
        var dwellcandidateID = 0;

        // determine the index of gaze point
        var tofuX = Math.floor(eyeX / TOFU_WIDTH),
            tofuY = Math.floor(eyeY / TOFU_HEIGHT);
        var me = tofuX + tofuY * COL_NUM;
        var neighborhood = [me, me - 1, me + 1,
            me - COL_NUM, me - COL_NUM - 1, me - COL_NUM + 1,
            me + COL_NUM, me + COL_NUM - 1, me + COL_NUM + 1
        ];
        isShown.fill(false);
        $('img').hide();

        // the candidates are the nearest [up, down, left, right]
        var btn_num = buttons.length;
        var candidate = new Array(4).fill(-1);
        var dist = new Array(4).fill(5000000);

        // for each type of gesture, put the nearest's index in candidate[]
        if (type === 'swipe' || type === 'EyeGesture') {
            for (var k = 0; k < 9; k++) {
                var i = neighborhood[k];
                if (i < 0 || i >= btn_num) continue;
                var btn = buttons[i];
                if (overlap(btn, eyeX, eyeY)) {
                    var j = getBtnType(btn, eyeX, eyeY);
                    var curr_dist = distance(btn, eyeX, eyeY);
                    if (curr_dist < dist[j]) {
                        candidate[j] = i;
                        dist[j] = curr_dist;
                        if (dynamic) {
                            $(btn).find('img').attr('src', img_prefix + 'arrow_' + j + '.png');
                        }
                    }
                }
            }
        } else if (type === 'dwell') {
            if (outNum >= btn_num) {
                pgBar.circleProgress({ 'value': 0.0, animation: { duration: 10 } });
                outNum = 0;
            }
        }

        if (type !== 'tap') {
            for (var k = 0; k < 9; k++) {

                var i = neighborhood[k];
                if (i < 0 || i >= btn_num) continue;
                var btn = buttons[i];

                if (type === 'dwell') {
                    if (overlap(btn, eyeX, eyeY)) {
                        if (already[i]) { // Have already looked at the target
                            TimeEnd = Date.now(); // Record time then
                        } else {
                            already[i] = 1; //First time to look at the target
                            TimeStart = Date.now(); // Record time then
                            pgBar.circleProgress({ 'value': 1.0, animation: { duration: timeTd + 20 } });
                        }

                        if (already[i] == 1 && TimeEnd - TimeStart > 330.0) {
                            clickablebtn = btn;
                            clickablebtn.click();
                            console.log("Selection Success!!");
                            already[i] = 0; // reinitialize
                            pgBar.circleProgress({ 'value': 0.0, animation: { duration: 10 } });
                        }
                        // Showing image
                        $(btn).find('img').show();
                        outNum = 0;
                    } else {
                        $(btn).find('img').hide();
                        already[i] = 0;
                        outNum += 1;
                    }
                } else if (type === 'swipe') {
                    if (isIn(i, candidate, 4)) {
                        if (already[i]) { // Have already looked at the target
                            LockerTimeEnd[i] = Date.now(); // Record time then
                        } else {
                            already[i] = 1; //First time to look at the target
                            LockerTimeStart[i] = Date.now(); // Record time then
                        }
                        var theTimeInterval = LockerTimeEnd[i] - LockerTimeStart[i];
                        $(btn).find('img').show();
                        if (theTimeInterval > 150.0 && touchLock == false) {
                            for (var j = 0; j < 4; j++) {
                                if (getBtnType(btn) == j & LockerTimeEnd[postBtnId[j]] < LockerTimeEnd[i]) {
                                    postBtnId[j] = i;
                                    currBtn[j] = btn;
                                    isShown[j] = true;
                                }
                            }
                        }
                    } else {
                        isShown.fill(true);
                        for (var j = 0; j < 4; j++)
                            currBtn[j] = buttons[postBtnId[j]];
                        if (!isIn(i, postBtnId, 4)) {
                            LockerTimeEnd[i] = 0.0; // Record time then
                            LockerTimeStart[i] = 0.0; // Record time then
                            already[i] = 0;
                        }
                    }
                } else if (type === 'EyeGesture') {

                    if (isIn(i, candidate, 4)) {
                        if (already[i]) { // Have already looked at the target
                            LockerTimeEnd[i] = Date.now(); // Record time then
                            EyeGestureTimeEnd[i] = Date.now();
                        } else {
                            already[i] = 1; //First time to look at the target
                            LockerTimeStart[i] = Date.now(); // Record time then
                            EyeGestureTimeStart[i] = Date.now();
                        }
                        var theTimeInterval = LockerTimeEnd[i] - LockerTimeStart[i];
                        //console.log(theTimeInterval)
                        $(btn).find('img').show();

                        if (theTimeInterval > 600.0) {

                            if (!GoEyeGesture && EyeStay(eyeX, eyeY)) {
                                EyeGestureOriX = eyeX;
                                EyeGestureOriY = eyeY;
                                GoEyeGesture = true;
                                EyeGestureTimeStart = new Array(buttons.length).fill(0.0);
                                EyeGestureTimeEnd = new Array(buttons.length).fill(0.0);
                                console.log("StartX:" + eyeX + "StartY:" + eyeY)
                            }


                            for (var j = 0; j < 4; j++) {
                                if (getBtnType(btn) == j && LockerTimeEnd[postBtnId[j]] < LockerTimeEnd[i]) {
                                    postBtnId[j] = i;
                                    currBtn[j] = btn;
                                    isShown[j] = true;
                                }
                            }
                        }
                    } else {
                        isShown.fill(true);
                        for (var j = 0; j < 4; j++) { currBtn[j] = buttons[postBtnId[j]]; }
                        if (!isIn(i, postBtnId, 4)) {
                            LockerTimeEnd[i] = Date.now(); // Record time then
                            LockerTimeStart[i] = Date.now(); // Record time then
                            already[i] = 0;
                        }
                    }
                }
            }
        }

    }
}

function setBtnSize(element, size) {
    $(element).height(size);
    $(element).width(size);
    $(element).css('margin-top', -size / 2);
    $(element).css('margin-left', -size / 2);
    $(element).show();
}

function showTarget() {

    ready = false;
    clearTimeout(trialTimer);
    GoEyeGesture = false;
    $('.gif').remove();
    EyeGestureOriX = null
    EyeGestureOriY = null
    if (trial_num == 0) {
        socket.emit('end');
        alert(`You finished 10 trials. Please press space when you are ready for the next round.`);
        JumpDistance = new Array(10).fill(0);
        return;
    }

    trialTimer = setTimeout(() => {
        $('.target').removeClass('target');
        ErrorCount++;
        TrialCompletionTime = -1;
        clicked_btn = null;
        gesture = 'timeout';
        log();
        showTarget();
    }, 20000);

    // select target
    while (true) {
        var btn_num = buttons.length - 2 * (RAW_NUM + COL_NUM) - 4;
        var temptar;

        if (trial_num == DEFAULT_TRIAL_NUM)
            temptar = Math.floor(Math.random() * btn_num) + RAW_NUM + 1;
        else
            temptar = ButtonCandidate(CurrentTarX, CurrentTarY, trial_num, btn_num);

        if (!$(buttons[temptar]).hasClass('clicked')) {
            tar = temptar;
            break;
        }
    }

    // render target and its neighbor
    $(":button").hide();

    $(buttons[tar]).addClass('target');
    setBtnSize(buttons[tar], BTN_SIZE);
    target_btn = $(buttons[tar]).parent().attr('id');

    //reset preformance data
    TrialTimeStart = Date.now();
    ErrorCount = 0;
    DwellSelectionCount = 0;
    MouseClickCount = 0;

    // render neighbor
    // right
    setBtnSize(buttons[tar + 1], BTN_SIZE);
    $(buttons[tar + 1]).css('margin-left', (BTN_SIZE * (SPACING + 0.5) - BIGGEST_BTN));
    // left
    setBtnSize(buttons[tar - 1], BTN_SIZE);
    $(buttons[tar - 1]).css('margin-left', (BIGGEST_BTN - BTN_SIZE * (SPACING + 1.5)));
    // down
    setBtnSize(buttons[tar + COL_NUM], BTN_SIZE);
    $(buttons[tar + COL_NUM]).css('margin-top', (BTN_SIZE * (SPACING + 0.5) - BIGGEST_BTN));
    // up
    setBtnSize(buttons[tar - COL_NUM], BTN_SIZE);
    $(buttons[tar - COL_NUM]).css('margin-top', (BIGGEST_BTN - BTN_SIZE * (SPACING + 1.5)));

    var skip = [tar + 2, tar - 2, tar + 2 * COL_NUM, tar - 2 * COL_NUM,
        tar - COL_NUM - 1, tar - COL_NUM + 1, tar + COL_NUM - 1, tar + COL_NUM + 1
    ];

    // select distractors
    for (var cnt = 0; cnt < DISTRACT - 5;) {
        var rand = Math.floor(Math.random() * RAW_NUM * COL_NUM);
        if ($(buttons[rand]).is(':hidden') && !isIn(rand, skip, 8)) {
            var x = 16 * (Math.floor(Math.random() * 3) + BASE_BTN) / DP_RATIO;
            setBtnSize(buttons[rand], x);
            cnt++;
        }
    }

    CurrentTarX = $(buttons[tar]).offset().left + 0.5 * buttons[tar].offsetWidth;
    CurrentTarY = $(buttons[tar]).offset().top + 0.5 * buttons[tar].offsetHeight;
    trial_num -= 1;
    setTimeout(() => {
        ready = true;
    }, 200);
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

    if (direction === Hammer.DIRECTION_UP) return UP;
    else if (direction === Hammer.DIRECTION_DOWN) return DOWN;
    else if (direction === Hammer.DIRECTION_LEFT) return LEFT;
    else if (direction === Hammer.DIRECTION_RIGHT) return RIGHT;
    return -1;
};

function enableSwipe() {
    var container = document.getElementById("MobileContainer");
    const manager = new Hammer.Manager(container);
    const swipe = new Hammer.Swipe();
    manager.add(swipe);

    manager.on('swipe', (e) => {
        var direction = e.offsetDirection;
        var angle = e.angle;
        var dir = getSwipeDirectionFromAngle(angle, direction);
        swipeAndUnlock(dir);
    });

    manager.on('hammer.input', (ev) => {
        console.log(ev);
        // If one can only do multi-touch swipe
        if (ev.maxPointers > 1) {
            if (ev.isFinal === true) {
                let multidir = ev.direction;
                if (multidir === Hammer.DIRECTION_UP) swipeAndUnlock(UP);
                else if (multidir === Hammer.DIRECTION_DOWN) swipeAndUnlock(DOWN);
                else if (multidir === Hammer.DIRECTION_LEFT) swipeAndUnlock(LEFT);
                else if (multidir === Hammer.DIRECTION_RIGHT) swipeAndUnlock(RIGHT);
            }
        }
    });
};

var swipeAndUnlock = (dir) => {
    if (isShown[dir]) {
        currBtn[dir].click();
        already[postBtnId[dir]] = 0;
        touchLock = false;
        console.log("swipe " + dir + ":" + String(postBtnId[dir]));
    }
}

function AssignTargetAlgo() {
    var Res = 3000;

    while (Res > 0) {
        for (var i = 0; i < DEFAULT_TRIAL_NUM; i++) {
            while (true) {
                if (JumpDistance[i] < 600 && Res > 0) {
                    var randnum = Math.ceil(Math.random() * Res)
                    JumpDistance[i] = JumpDistance[i] + randnum
                    if (JumpDistance[i] <= 600) {
                        Res = Res - randnum;
                        break;
                    } else {
                        JumpDistance[i] = JumpDistance[i] - randnum
                    }
                } else break;
            }

        }
    }

    for (var i = JumpDistance.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var x = JumpDistance[i];
        JumpDistance[i] = JumpDistance[j];
        JumpDistance[j] = x;
    }

    for (var i = 0; i < JumpDistance.length; i++) {
        JumpDistance[i] = JumpDistance[i] + 200;
    }
    console.log(JumpDistance);
}

function ButtonCandidate(midX, midY, trialNum, btn_num) {
    CandidateButtonArray = new Array(buttons.length).fill(0);
    CandidateButtonDistance = new Array(buttons.length).fill(0.0);
    var CandidateBtnX = 0.0;

    var CandidateBtnY = 0.0;
    var CandidateNum = 0;
    var esilon = 100.0;
    var NextTargetIndex
    var dis = JumpDistance[trialNum - 1];

    //THIS TRIAL POSITION
    while (CandidateNum == 0 || CandidateButtonArray[NextTargetIndex] == 0) {
        CandidateButtonArray = new Array(buttons.length).fill(0);
        CandidateNum = 0;
        esilon = esilon + 100.0
        for (var i = 0; i < btn_num; i++) {
            CandidateBtnX = $(buttons[i]).offset().left + 0.5 * buttons[i].offsetWidth;
            CandidateBtnY = $(buttons[i]).offset().top + 0.5 * buttons[i].offsetHeight;
            var thisbtndistance = Math.pow((CandidateBtnX - midX), 2) + Math.pow((CandidateBtnY - midY), 2)
            var upbound = dis * dis + esilon;
            var lowbound = dis * dis - esilon;
            if (thisbtndistance < upbound && thisbtndistance > lowbound) {
                CandidateButtonArray[CandidateNum] = i;
                CandidateNum++;
            }
        }
        NextTargetIndex = Math.ceil(Math.random() * CandidateNum);
    }

    return CandidateButtonArray[NextTargetIndex];
}


function Eyespacingerror(x, y) {

    ErrorIndex = (ErrorIndex + 1) % 10;
    var XData = 0.0;
    var YData = 0.0;
    var kk = 0;
    while (kk <= 9) {
        XData += EyeErrorX[kk];
        YData += EyeErrorY[kk];
        kk++;
    }
    //Console.WriteLine(aveX);
    var EyeXave = XData / 10;
    var EyeYave = YData / 10;
    EyeErrorX[ErrorIndex] = x;
    EyeErrorY[ErrorIndex] = y;
    for (var i = 0; i < 10; i++) {
        if ((EyeXave - EyeErrorX[i]) * (EyeXave - EyeErrorX[i]) + (EyeYave - EyeErrorY[i]) * (EyeYave - EyeErrorY[i]) > BTN_SIZE * BTN_SIZE) {
            ErrorTimeStart = Date.now();
            ErrorTimeEnd = Date.now();
        }
    }
    ErrorTimeEnd = Date.now();

    if (ErrorTimeEnd - ErrorTimeStart > 330) {
        //console.log("Dwell Selection!!")
        DwellSelectionCount++;
        ErrorTimeStart = Date.now();
        ErrorTimeEnd = Date.now();
    }
}


function MouseClickEvent() {
    document.getElementById("MouseBox").style = "width:1400px;height:600px;";
    //  console.log("mouse go")
}



function EyeGesture(x, y, OriX, OriY) {

    if (OriX != null && OriY != null) {
        var EyeXave = x;
        var EyeYave = y;
        var vectorX = EyeXave - OriX;
        var vectorY = -(EyeYave - OriY);
        var VectorLength = Math.pow(vectorX * vectorX + vectorY * vectorY, 0.5);

        if (VectorLength > 200 || OntheEdge(x, y)) {

            var Theta;
            var CosTheta = vectorX / VectorLength;
            var SinTheta = vectorY / VectorLength;
            var CTheta = Math.acos(CosTheta) * 180 / 3.1415926;
            var STheta = Math.asin(SinTheta) * 180 / 3.1415926;
            if (vectorX > 0 && vectorY > 0) Theta = CTheta; //1 quagent
            else if (vectorX < 0 && vectorY > 0) Theta = CTheta; //2 quagent
            else if (vectorX < 0 && vectorY < 0) Theta = 360 - CTheta; //3 quagent
            else if (vectorX > 0 && vectorY < 0) Theta = 360 - CTheta; //4 quagent

            if (Theta > 45 && Theta < 135) return 'up';
            else if (Theta > 135 && Theta < 225) return 'left';
            else if (Theta > 225 && Theta < 315) return 'down';
            else return 'right';

        }
    }
    return null;
}

function OntheEdge(x, y) {
    var width = document.body.clientWidth;
    var height = document.body.clientHeight;
    if (x < 10) return true;
    else if (x > width - 10) return true;
    else if (y < 10) return true;
    else if (y > height - 10) return true;
    return false;
}

function UserState(ts) {
    var timestampinterval = ts - preTimeStamp;
    //console.log("interval: "+timestampinterval)
    if (ts - preTimeStamp > 1000) {
        preTimeStamp = ts;
        UserAlready = false;
        console.log("close eyes");
    } else UserAlready = true;
}

function Calibration(eyeX, eyeY) {
    CalibrationEndTime = Date.now();
    var CalibrateID;
    var CalibrateBtnX;
    var CalibrateBtnY;

    var i = Math.ceil((CalibrationEndTime - CalibrationStartTime) / 3000);
    console.log(i);
    if (i < 10) {
        var CalibrateID = i;
        var calibrateID = "Calibration" + i.toString();

        var c = document.getElementById(calibrateID);;
        $(c).show();
        console.log(c);

        CalibrateBtnX = $(c).offset().left + 0.5 * c.offsetWidth;
        CalibrateBtnY = $(c).offset().top + 0.5 * c.offsetHeight;
        for (var index = 0; index < 10; index++) {
            if (index != i) $(document.getElementById("Calibration" + index.toString())).hide();
        }
    } else {
        $(document.getElementById("Calibration9")).hide();
        CalibrationState = false;
    }

    console.log("CalibrateID" + CalibrateID);
    Calibrationlog(eyeX, eyeY, CalibrateID, CalibrateBtnX, CalibrateBtnY);
}

function EyeStay(x, y) {

    StayIndex = (StayIndex + 1) % 10;
    var XData = 0.0;
    var YData = 0.0;
    var kk = 0;
    while (kk <= 9) {
        XData += EyeStayX[kk];
        YData += EyeStayY[kk];
        kk++;
    }
    //Console.WriteLine(aveX);
    var EyeXave = XData / 10;
    var EyeYave = YData / 10;
    EyeStayX[StayIndex] = x;
    EyeStayY[StayIndex] = y;
    for (var i = 0; i < 10; i++) {
        if ((EyeXave - EyeStayX[i]) * (EyeXave - EyeStayX[i]) + (EyeYave - EyeStayY[i]) * (EyeYave - EyeStayY[i]) > BTN_SIZE * BTN_SIZE) {
            EyeStayTimeStart = Date.now();
            EyeStayTimeEnd = Date.now();
        }
    }
    EyeStayTimeEnd = Date.now();

    if (EyeStayTimeEnd - EyeStayTimeStart > 1000) {
        console.log("Dwell Stay!!");
        for ( var j = 0; j < 4; j++ ) {
            $(currBtn[j]).append(
                '<img class="gif" src="'
                + img_prefix + 'arrow_' + j + '.gif"/>'
            );
        }
        return true;
        EyeStayTimeEnd = Date.now();
    }

    return false;
}