(function() {
    var canvas = document.getElementById('canvas'),
        ctx = canvas.getContext('2d');
    canvas.width  = 640;
    canvas.height = 480;
    canvas.addEventListener('click', function() {
        start();
    }, false);
    
    var snake;
    
    Snake.prototype.path = {
        'left'  : 37,
        'up'    : 38,
        'right' : 39,
        'down'  : 40
    };
    
    function Snake(canvas, ctx, speed, length, width) {
        var _speed,
            _length, 
            _width;
        Object.defineProperties(this, {
            'speed': {
                get: function() {return _speed},
                set: function(value) {_speed = value > 0 ? value : 1;},
            },
            'length': {
                get: function() {return _length},           
                set: function(value) {_length = value > 0 ? value : 1;},
            },
            'width': {
                get: function() {return _width},
                set: function(value) {_width = value > 0 ? value : 1;},
            },
        });
        this.speed = speed;
        this.length = length;
        this.width = width;
        this.ctx = ctx;
        this.ctx.fillStyle = 'red';
        this.body = [];
        this.canvas = canvas;
        this.direction = this.path['up'];
    }
    
    Snake.prototype.build = function() {
        this.clearCanvas();
        var canvasWidthDivTwo = canvas.width / 2,
            canvasHeightDivTwo = canvas.height / 2;
        for (var i = 0; i < this.length; ++i) {
            this.body.push([canvasWidthDivTwo, canvasHeightDivTwo + i * this.width]);
        }
    }
    
    Snake.prototype.draw = function() {
        for (var i = 0; i < this.length; ++i) {
            var x = this.body[i][0],
                y = this.body[i][1];
            this.ctx.fillRect(x, y, this.width, this.width);
        }    
    }
    
    Snake.prototype.clearCanvas = function() {
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = 'red';
    }
    
    Snake.prototype.cleanTail = function() {
        var body = this.body;
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(body[body.length - 1][0], 
            body[body.length - 1][1],
            this.width,
            this.width);
        this.ctx.fillStyle = 'red';
    }
    
    Snake.prototype.move = function(keyCode) {
        var unshiftPop = function(x, y) {
            body.unshift([x, y]);
            body.pop();
            if (isCrash(body)) {
                this.die();
            }
        }.bind(this);
        function isCrash(body) {
            var hash = {};
            for (var i = 0; i < body.length; ++i) {
                hash[body[i]] = i;
            }
            return Object.keys(hash).length < body.length;
        }
        var unshiftPopWithEdge = function(x, y, path) {
            switch (path) {
                case pathNames.left:
                    if (x < 0) {
                        x = this.canvas.width - this.width;
                    }
                    break;
                case pathNames.up:
                    if (y < 0) {
                        y = this.canvas.height - this.width;
                    }
                    break;
                case pathNames.right:
                    if (x > this.canvas.width) {
                        x = 0;
                    }
                    break;
                case pathNames.down:
                    if (y >  this.canvas.height) {
                        y = 0;
                    }
                    break;
            }
            unshiftPop(x, y);
        }.bind(this);        
        var body = this.body,
            bodyFirstX = body[0][0],
            bodyFirstY = body[0][1],
            pathNames = {'left': 'left', 'up': 'up', 'right': 'right', 'down': 'down'};
        if (body.length > 1) {
            this.cleanTail();
        }
        switch (keyCode) {
            // left
            case this.path[pathNames.left]:
                unshiftPopWithEdge(bodyFirstX - this.width, bodyFirstY, pathNames.left);
                break;
            // up
            case this.path[pathNames.up]:
                unshiftPopWithEdge(bodyFirstX, bodyFirstY - this.width, pathNames.up);
                break;
            // right
            case this.path[pathNames.right]:
                unshiftPopWithEdge(bodyFirstX + this.width, bodyFirstY, pathNames.right);
                break;
            // down
            case this.path[pathNames.down]:
                unshiftPopWithEdge(bodyFirstX, bodyFirstY + this.width, pathNames.down);
                break;
        }
    }
    
    Snake.prototype.stop = function() {
        clearInterval(this.intervalID);
    }
    
    Snake.prototype.die = function() {
        this.stop();
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.font = '30pt Arial';
        this.ctx.fillStyle = 'white';
        this.ctx.textAlign = 'center';
        var text = 'YOU DIED!';
        this.ctx.fillText(text, canvas.width / 2, canvas.height / 2);
    }
    
    Snake.prototype.motion = function() {
        this.intervalID = setInterval(function() {
            this.draw();
            this.move(this.direction);
        }.bind(this), this.speed * 1000);
    }
    
    Snake.prototype.game = function() {
        function inPath(keycode) {
            for (k in this.path) {
                if (keycode === this.path[k]) {
                    return true;
                }
            }
            return false;
        }
        this.build();
        document.onkeydown = function(e) {
            if (inPath.call(this, e.keyCode)) {
                this.direction = e.keyCode;
            }
        }.bind(this);
        this.motion();
    }
    
    function start() {
        if (typeof snake != 'undefined') {
            snake.stop();
            delete snake;
        }
        snake = new Snake(canvas, ctx, 0.1, 5, 20);
        snake.game();
    }
    
    start();
})()