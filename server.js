const fs = require('fs');
const moment = require('moment');
const express = require('express');
const app = express();
const path = require('path');
const resources = '/resources';
const swipeImages = {
    OPTION_1: `${resources}/arrow_up.png`,
    OPTION_2: `${resources}/arrow_down.png`,
    OPTION_3: `${resources}/arrow_left.png`,
    OPTION_4: `${resources}/arrow_right.png`
};
const tapImages = {
    OPTION_1: `${resources}/tap_topright.png`,
    OPTION_2: `${resources}/tap_bottomleft.png`,
    OPTION_3: `${resources}/tap_topleft.png`,
    OPTION_4: `${resources}/tap_bottomright.png`
};
const type = process.argv[2];
app.use(resources, express.static('resources'));
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.get('/', (req, res) => {
    res.render('index', loadImages());
});

app.get('/swipe', (req, res) => {
    res.sendFile(path.join(__dirname, 'swipe.html'));
    // res.render('swipe');
});

app.get('/tap', (req, res) => {
    res.sendFile(path.join(__dirname, 'tap.html'));
    // res.render('tap');
});

var http = require('http').Server(app);
var io = require('socket.io')(http);

var writeLog = ( msg ) => {
    var filename = 'tmp.log';
    var time = moment().format('MM/DD hh:mm:ss:SSS');
    msg = time + '\t' + msg + '\n';
    console.log(msg);
    fs.appendFile( filename , msg, function(err){
        if (err) console.error(err);
    });
};

var loadImages = () => {
    if(type === 'swipe')
        return swipeImages;
    else if (type === 'tap')
        return tapImages;
}

io.on('connection', function(socket){
    console.log('a user connected');

    // recieve eye-tracker position
    socket.on('eyemove', function(x, y){
        io.emit('eyemove', x, y);
    });

    // recieve swiping event
    if(type === 'swipe'){
        socket.on('swipe', function(dir){
            io.emit('swipe', dir);
        });
    }

    //recieve tap event
    if(type === 'tap'){
        socket.on('tap', (location) => {
            console.log(`location: ${location}`);
            io.emit('tap', location);
        });
    }

    // start a trial
    socket.on('start', function(){
        writeLog('trial start');
        io.emit('start');
    });

    // end of a trial
    socket.on('end', function(){
        writeLog('trial end');
        io.emit('end');
    });

    socket.on('log', function(cnt, gesture, clicked_btn, target){
        var msg = '#' + cnt;
        msg += '\tevent:' + gesture;
        msg += '\ttarget:' + target;
        msg += '\tclick:' + clicked_btn;
        writeLog(msg);
    });
});

// http.listen(3000, function(){
//     console.log('listening on *:3000');
// });


if(type==='swipe'){
    http.listen(3000, function(){
      console.log('listening on *:3000');
    });
}

else{
    http.listen(3001, function(){
      console.log('listening on *:3001');
    });
}
