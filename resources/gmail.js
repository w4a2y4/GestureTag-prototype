var socket = io.connect();
var button_left, button_right, button_up, button_down;
var show_left, show_right, show_up, show_down;

const DEFAULT_TRIAL_NUM = 20;
var trial_num = DEFAULT_TRIAL_NUM;

var clicked_button, target_btn, gesture;
var buttons = document.getElementsByTagName('button');

const img_prefix = 'http://localhost:3000/resources/';
const swipeImages = {
	up: img_prefix + 'arrow_up.png',
	down: img_prefix + 'arrow_down.png',
	left: img_prefix + 'arrow_left.png',
	right: img_prefix + 'arrow_right.png'
};

// recieve eye-tracker position
$(document).mousemove( function(e) {
	changePos(e.pageX, e.pageY);
});

socket.on('eyemove', function(x, y){
	changePos(x, y);
});

socket.on('swipe', function(dir){
	gesture = dir;
	if( dir == 'up' && show_up ) button_up.click();
	if( dir == 'down' && show_down ) button_down.click();
	if( dir == 'left' && show_left ) button_left.click();
	if( dir == 'right' && show_right ) button_right.click();
});

socket.on('start', function(){
	trial_num = DEFAULT_TRIAL_NUM;
	showTarget();
});

function log () {
	cnt = DEFAULT_TRIAL_NUM - trial_num;
	console.log(gesture + ' ' + clicked_btn + ' ' + target_btn);
	socket.emit('log', cnt, gesture, clicked_btn, target_btn);
}

function isUp( btn ) {
	return swipeImages["up"] == btn.children[0].src;
}

function isDown( btn ) {
	return swipeImages["down"] == btn.children[0].src;
}

function isLeft( btn ) {
	return swipeImages["left"] == btn.children[0].src;
}

function isRight( btn ) {
	return swipeImages["right"] == btn.children[0].src;
}

function overlap ( element, X, Y ) {
	var top = $(element).offset().top;
	var left = $(element).offset().left;
	var right = Number($(element).offset().left) + Number($(element).width());
	var bottom = Number($(element).offset().top) + Number($(element).height());

	// in the element
	if ( X >= left && X <= right && Y >= top && Y <= bottom ) return true;
	else if ( X < left && Y >= top && Y <= bottom ) return ( left - X ) <= RADIUS ;
	else if ( X > right && Y >= top && Y <= bottom ) return ( X - right ) <= RADIUS ;
	else if ( X >= left && X <= right && Y < top ) return ( top - Y ) <= RADIUS;
	else if ( X >= left && X <= right && Y > bottom ) return ( Y - bottom ) <= RADIUS;
	else if ( Math.pow((X - left), 2) + Math.pow((Y - top), 2) <= RADIUS*RADIUS )
		return true;
	else if ( Math.pow((X - left), 2) + Math.pow((Y - bottom), 2) <= RADIUS*RADIUS )
		return true;
	else if ( Math.pow((X - right), 2) + Math.pow((Y - top), 2) <= RADIUS*RADIUS )
		return true;
	else if ( Math.pow((X - right), 2) + Math.pow((Y - bottom), 2) <= RADIUS*RADIUS )
		return true;
	return false;
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

	var btn_num = buttons.length;
	for( var i=0; i < btn_num; i++) {
		var btn = buttons[i];
		if ( overlap( btn, eyeX, eyeY ) ) {
			$(btn).find('img').show();
			if( isUp(btn) ) { button_up = btn;	show_up = true; }
			else if( isDown(btn) ) { button_down = btn;	show_down = true; }
			else if( isLeft(btn) ) { button_left = btn;	show_left = true; }
			else if( isRight(btn) ) { button_right = btn;	show_right = true; }
		}
		else $(btn).find('img').hide();
	}

}

function showTarget () {
	if ( trial_num == 0 ) {
		socket.emit('end');
		return;
	}
	while( true ) {
		var btn_num = buttons.length;
		var rand = Math.floor( Math.random() * btn_num );
		console.log(trial_num+' '+rand);
		if ( !$(buttons[rand]).hasClass('clicked') ) break;
	}
	$(buttons[rand]).addClass('target');
	target_btn = $(buttons[rand]).parent().attr('id');
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
