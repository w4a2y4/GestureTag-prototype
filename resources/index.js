var socket = io();
var button_left, button_right, button_up, button_down;
var show_left, show_right, show_up, show_down;

const DEFAULT_TRIAL_NUM = 12;
var trial_num = DEFAULT_TRIAL_NUM;

var clicked_button, target, gesture;
var isCalibrated = false;
// recieve eye-tracker position
$(document).mousemove( function(e) {
	if(!isCalibrated)
		changePos(e.pageX, e.pageY);
});


const freq = 25;
const beta = 0.00001;
const fcmin = 0.01;
const dcutoff = 1;

var fx = OneEuroFilter(freq, fcmin, beta, dcutoff);
var fy = OneEuroFilter(freq, fcmin, beta, dcutoff);

var readGazePoint = () => {
	var getPoint = setInterval(() => {
		var point = webgazer.getCurrentPrediction();
		var timestamp = Date.now();
		var x = fx.filter(point.x, timestamp);
		var y = fy.filter(point.y, timestamp);
		changePos(x, y);
	}, 40);
}

// socket.on('eyemove', function(x, y, timestamp){
// 	// var x = fx.filter(x, timestamp);
// 	// var y = fy.filter(y, timestamp);
// 	console.log(`${x}, ${y}`);
// 	changePos(x, y);
// });

socket.on('swipe', function(dir){
	gesture = dir;
	if( dir == 'up' && show_up ) button_up.click();
	if( dir == 'down' && show_down ) button_down.click();
	if( dir == 'left' && show_left ) button_left.click();
	if( dir == 'right' && show_right ) button_right.click();
});

socket.on('tap', (pos) => {
	gesture = pos;
	if( pos === 'topright' && show_up ) button_up.click();
	if( pos === 'bottomleft' && show_down ) button_down.click();
	if( pos === 'topleft' && show_left ) button_left.click();
	if( pos === 'bottomright' && show_right ) button_right.click();
});

socket.on('start', function(){
	trial_num = DEFAULT_TRIAL_NUM;
	isCalibrated = true;
	readGazePoint();
	showTarget();
});

function log () {
	cnt = DEFAULT_TRIAL_NUM - trial_num;
	console.log(gesture + ' ' + clicked_btn + ' ' + target);
	socket.emit('log', cnt, gesture, clicked_btn, target);
}

function changePos (eyeX, eyeY) {

	$('#eye_tracker').css({
		"left": eyeX,
		"top": eyeY
	});

	show_up = false;
	show_down = false;
	show_left = false;
	show_right = false;


	for( var i=0; i < RAW_NUM; i++ )
		for( var j=0; j < COL_NUM; j++) {
			var btn = $("#blk"+i+""+j+" button");
			var btnX = btn.offset().left + 100;
			var btnY = btn.offset().top + 50;

			var dist = ( btnX - eyeX )*( btnX - eyeX ) + ( btnY - eyeY )*( btnY - eyeY );
			if ( dist <= 64000 ) {
				btn.find('img').show();
				if( i%2 == 0 && j%2 == 0 ) { button_up = btn;	show_up = true; }
				if( i%2 == 1 && j%2 == 1 ) { button_down = btn;	show_down = true; }
				if( i%2 == 1 && j%2 == 0 ) { button_left = btn;	show_left = true; }
				if( i%2 == 0 && j%2 == 1 ) { button_right = btn;	show_right = true; }
			}
			else btn.find('img').hide();
		}
}

window.onload = function() {
	webgazer.setRegression('ridge')
		.setTracker('clmtrackr')
		.begin()
		.showPredictionPoints(true);
};

var emitEyeMove = (data) => {
	// socket.emit('eyemove', data.x, data.y);
	// console.log(`x: ${data.x}, y: ${data.y}`);

	changePos(data.x, data.y);
}
window.onbeforeunload = () => {
	//webgazer.end(); //Uncomment if you want to save the data even if you reload the page.
	window.localStorage.clear(); //Comment out if you want to save data across different sessions
}

function showTarget () {
	if ( trial_num == 0 ) {
		socket.emit('end');
		return;
	}
	while( true ) {
		var rand_r = Math.floor( Math.random() * RAW_NUM );
		var rand_c = Math.floor( Math.random() * COL_NUM );
		console.log(trial_num+' '+rand_r+' '+rand_c);
		if ( !$('#blk' + rand_r + '' + rand_c + ' button').hasClass('clicked') )
			break;
	}
	$('#blk' + rand_r + '' + rand_c + ' button').addClass('target');
	target = 'blk' + rand_r + '' + rand_c;
	trial_num -= 1;
}


// recieve swiping event

$(document).on('click', 'button', ( function(e) {
	console.log("click!!");
	$(this).addClass('clicked');
	clicked_btn = $(this).parent().attr('id');
	log();
	if ( $(this).hasClass('target') ) {
		$(this).removeClass('target');
		showTarget();
	}
	setTimeout( () => {
		$(this).removeClass('clicked');
	}, 500);
}));
