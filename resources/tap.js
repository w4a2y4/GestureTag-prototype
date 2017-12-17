var container = document.querySelector(".container");
const manager = new Hammer.Manager(container);
const tap = new Hammer.Tap({
    taps: 1
});

manager.add(tap);

manager.on('tap', (e) => {
    const pointer = e.center;
    const quadrant = getTapLocationStr(pointer);
    emitTapGesture(quadrant);
});

var getTapLocationStr = (pointer) => {
    const yAxis = window.innerWidth / 2;
    const xAxis = window.innerHeight / 2;
    const xLoc = pointer.x - yAxis;
    const yLoc = pointer.y - xAxis;
    var quadrant = 'unknown';
    if(xLoc > 0 && yLoc <= 0){
        quadrant = 'topright';
    } else if(xLoc <= 0 && yLoc <= 0){
        quadrant = 'topleft';
    } else if(xLoc <= 0 && yLoc > 0){
        quadrant = 'bottomleft';
    } else {
        quadrant = 'bottomright';
    }
    return quadrant;
};
