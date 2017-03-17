var updateMoonlanderView = (function(){

    var display = document.getElementById('display');

    var model = {
        "lander": {
            "x": 0, "y": 10000,
            "vx": 1, "vy": 0,
            "orientation": Math.PI/4,
            "angular-velocity": 0.05,
            "radius": 10,
            "fuel": 100,
            "thrusting": false,
            "hit_ground": false,
            "crash_speed": 0.0,
            "landed": false
        }
    };

    var view = new lander.View(model, display);
    window.theView = view; // For manual tests
    view.update();

    function copyTraceFrameToModel(frame, lander) {
        lander.x = frame.x;
        // Some scaling on the coordinates so there's more usable space on
        // screen
        lander.y = frame.y;
        lander.orientation = frame.o;
        lander.fuel = frame.fuel * 100;
        lander.thrusting = frame.thrusting;
        lander.hit_ground = frame.hit_ground;
        lander.crash_speed = frame.crash_speed;
        lander.landed = frame.landed;
    }

    function update(frame) {
        copyTraceFrameToModel(frame, model.lander);
        view.update();
   };

    return update;
})();
