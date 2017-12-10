// var socket = io.connect();

// recieve eye-tracker position

var eyeX, eyeY;
var button_left, button_right, button_up, button_down;

$(document).mousemove( function(e) {

	eyeX = e.pageX;	eyeY = e.pageY;

	$('#eye_tracker').css({
		"left": eyeX,
		"top": eyeY 
	});

	for( var i=0; i<3; i++ ) 
		for( var j=0; j<4; j++) {
			var btn = $("#blk"+i+""+j+" button");
			var btnX = btn.offset().left + 100;
			var btnY = btn.offset().top + 50;

			var dist = ( btnX - eyeX )*( btnX - eyeX ) + ( btnY - eyeY )*( btnY - eyeY );
			if ( dist <= 64000 ) {
				btn.find('img').show();
				if( i%2 == 1 && j%2 == 1 ) button_down = btn;
				if( i%2 == 1 && j%2 == 0 ) button_left = btn;
				if( i%2 == 0 && j%2 == 1 ) button_right = btn;
				if( i%2 == 0 && j%2 == 0 ) button_up = btn;
			}
			else {
				btn.find('img').hide();
				if( i%2 == 1 && j%2 == 1 ) button_down = null;
				if( i%2 == 1 && j%2 == 0 ) button_left = null;
				if( i%2 == 0 && j%2 == 1 ) button_right = null;
				if( i%2 == 0 && j%2 == 0 ) button_up = null;
			}
		}
});

// recieve swiping event

$(document).on('click', 'button', ( function(e) {
	console.log("click!!");
	$(this).css({ "background": "pink" });
	setTimeout( () => {
		$(this).css({ "background": "#e7e7e7" });
	}, 500);
}));
