var socket = io.connect();
var button_left, button_right, button_up, button_down;
var show_left, show_right, show_up, show_down;

// recieve eye-tracker position
$(document).mousemove( function(e) {
	changePos(e.pageX, e.pageY);
});

socket.on('eyemove', function(x, y){
	changePos(x, y);
});

socket.on('swipe', function(dir){
	if( dir == 'up' && show_up ) button_up.click();
	if( dir == 'down' && show_down ) button_down.click();
	if( dir == 'left' && show_left ) button_left.click();
	if( dir == 'right' && show_right ) button_right.click();
});

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

// recieve swiping event

$(document).on('click', 'button', ( function(e) {
	console.log("click!!");
	$(this).css({ "background": "pink" });
	setTimeout( () => {
		$(this).css({ "background": "#e7e7e7" });
	}, 500);
}));
