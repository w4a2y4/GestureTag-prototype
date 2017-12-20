
var OneEuroFilter = (freq, mincutoff, beta, dcutoff) => {
	var alpha = (cutoff) => {
		var te = 1 / freq;
		var tau = 1 / (2 * Math.PI * cutoff);
		return 1 / (1 + tau / te);
	};

	var that = {};
	var x = LowPassFilter(alpha(mincutoff));
	var dx = LowPassFilter(alpha(dcutoff));
	var lastTime = undefined;

	mincutoff = mincutoff || 1;
	beta = beta || 0;
	dcutoff = dcutoff || 1;

	that.filter = (v, timestamp) => {
		if(lastTime !== undefined && timestamp !== undefined)
			freq = 1 / (timestamp - lastTime);
		// console.log(`freq: ${freq}`);
		lastTime = timestamp;
		var dvalue = x.hasLastRawValue() ? (v - x.lastRawValue()) * freq : 0;
		var edvalue = dx.filterWithAlpha(dvalue, alpha(dcutoff));
		var cutoff = mincutoff + beta * Math.abs(edvalue);
		return x.filterWithAlpha(v, alpha(cutoff));
	}

	return that;
};



var LowPassFilter = (alpha, initval) => {
	var that = {};
	var y = initval || 0;
	var s = y;

	var lowpass = (v) => {
		y = v;
		s = alpha * v + (1 - alpha) * s;
		return s;
	}

	that.filter = (v) => {
		y = v;
		s = v;
		that.filter = lowpass;
		return s;
	}

	that.filterWithAlpha = (v, a) => {
		alpha = a;
		return that.filter(v);
	}

	that.hasLastRawValue = () => {
		return that.filter === lowpass;
	}

	that.lastRawValue = () => {
		return y;
	}

	return that;
};
