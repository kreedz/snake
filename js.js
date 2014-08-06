(function() {
    var canvas = document.getElementById('canvas'),
        ctx = canvas.getContext('2d');
    canvas.width  = 640;
    canvas.height = 480;
    
    function Snake(speed, length) {
        var _speed, _length;
        Object.defineProperties(this, {
            'speed': {
                get: function() {return _speed},           
                set: function(value) {_speed = value ? value : 1},
            },
            'length': {
                get: function() {return _length},           
                set: function(value) {_length = value ? value : 1},
            },
        });
        this.speed = speed;
        this.length = length;
        this.body = {};
    }
    
    Snake.prototype.build = function() {
        var canvasWidthDivTwo = canvas.width / 2,
            canvasHeightDivTwo = canvas.height / 2;
        for (var i = 0; i < this.length; ++i) {
            this.body[i] = [canvasWidthDivTwo, canvasHeightDivTwo + i];
        } 
    }
    
    Snake.prototype.draw = function() {
        
    }
})()