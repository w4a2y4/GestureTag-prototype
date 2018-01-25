const fs = require('fs');
const moment = require('moment');
const express = require('express');
const app = express();
const path = require('path');
const resources = '/resources';
const logfile = 'log/' + moment().format('MMDD-HHmm') + '.log';

// Tap or Swipe
const type = process.argv[2];

// motor or normal
const user = process.argv[3];

const swipeOptions = {
    OPTION_1: `${resources}/arrow_up.png`,
    OPTION_2: `${resources}/arrow_down.png`,
    OPTION_3: `${resources}/arrow_left.png`,
    OPTION_4: `${resources}/arrow_right.png`,
    OPTION_5: `${resources}/arrow_upright.png`,
    OPTION_6: `${resources}/arrow_downright.png`,
    OPTION_7: `${resources}/arrow_downleft.png`,
    OPTION_8: `${resources}/arrow_upleft.png`,
    EYETRACKER: `gesturetag`
};
const tapOptions = {
    OPTION_1: `${resources}/tap_topright.png`,
    OPTION_2: `${resources}/tap_bottomleft.png`,
    OPTION_3: `${resources}/tap_topleft.png`,
    OPTION_4: `${resources}/tap_bottomright.png`,
    EYETRACKER: `gesturetag`
};
const dwellOptions = {
    OPTION_1: `//:0`,
    OPTION_2: `//:0`,
    OPTION_3: `//:0`,
    OPTION_4: `//:0`,
    EYETRACKER: `dwell`
};

app.use(resources, express.static('resources'));
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.get('/', (req, res) => {
    res.render('index', loadImages());
});

app.get('/gmail', (req, res) => {
    res.render('gmail', loadImages());
});

app.get('/gmail8', (req, res) => {
    res.render('gmail8', loadImages());
})

app.get('/block8', (req, res) => {
    res.render('block8', loadImages());
})

app.get('/swipe', (req, res) => {
    res.sendFile(path.join(__dirname, 'swipe.html'));
});

app.get('/tap', (req, res) => {
    res.sendFile(path.join(__dirname, 'tap.html'));
});

var http = require('http').Server(app);
var io = require('socket.io')(http);

var writeLog = (msg) => {
    var time = moment().format('MM/DD HH:mm:ss:SSS');
    msg = time + '\t' + msg + '\n';
    console.log(msg);
    fs.appendFile(logfile, msg, function(err) {
        if (err) console.error(err);
    });
};

var loadImages = () => {
    if (type === 'swipe')
        return swipeOptions;
    else if (type === 'tap')
        return tapOptions;
    else
        return dwellOptions;
}

io.on('connection', function(socket) {
    console.log('a user connected');
    io.emit('init', type);

    io.emit('user', user);

    // recieve eye-tracker position
    socket.on('eyemove', function(x, y) {
        io.emit('eyemove', x, y);
    });

    // recieve swiping event
    if (type === 'swipe') {
        socket.on('swipe', function(dir) {
            io.emit('swipe', dir);
        });
    }

    //recieve tap event
    if (type === 'tap') {
        socket.on('tap', (location) => {
            console.log(`location: ${location}`);
            io.emit('tap', location);
        });
    }

    // receive touch raw data
    socket.on('touch', (event) => {
        if (event.type === 'hammer.input') {
            console.log(event.pos);
            io.emit('touch', event.pos);
        }
    });

    // start a trial
    socket.on('start', function() {
        writeLog('trial start (' + type + ')');
    });

    // end of a trial
    socket.on('end', function() {
        writeLog('trial end');
        io.emit('end');
    });

    // log data
    socket.on('log', function(cnt, gesture, clicked_btn, target) {
        var msg = '#' + cnt;
        msg += '\tevent:' + gesture;
        msg += '\ttarget:' + target;
        msg += '\tclick:' + clicked_btn;
        writeLog(msg);
    });


});

http.listen(3000, function() {
    console.log('listening on *:3000');
});