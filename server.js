const fs = require('fs');
const moment = require('moment');
const express = require('express');
const app = express();
app.use(express.static(__dirname));

var http = require('http').Server(app);
var io = require('socket.io')(http);

function writeLog ( msg ) {
    var filename = 'tmp.log';
    var time = moment().format('MM/DD hh:mm:ss:SSS');
    msg = time + '\t' + msg + '\n';
    console.log(msg);
    fs.appendFile( filename , msg, function(err){
        if (err) console.error(err);
    });
}

io.on('connection', function(socket){
    console.log('a user connected');

    // recieve eye-tracker position
    socket.on('eyemove', function(x, y){
        io.emit('eyemove', x, y);
    });

    // recieve swiping event
    socket.on('swipe', function(dir){
        io.emit('swipe', dir);
    });

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
        msg += '\tswipe:' + gesture;
        msg += '\ttarget:' + target;
        msg += '\tclick:' + clicked_btn;
        writeLog(msg);
    });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
