(function() {
    var canvas = document.getElementById('canvas');

    function extend(Child, Parent) {
        var F = function() {}
        F.prototype = Parent.prototype;
        Child.prototype = new F();
        Child.prototype.constructor = Child;
        Child.superclass = Parent.prototype;
    }
    
    function Game(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.canvas.addEventListener('click', function() {
            this.start();
        }.bind(this), false);
    }
    
    Game.cfg = {
        'field': {
            'width' : 640,
            'height': 480,
            'color' : {
                'fon'    : 'white',
                'die'    : 'red',
                'message': 'white',
            }
        },
        'food': {
            'length': 1,
            'color' : 'red',
        },
        'snake': {
            'color' : 'red',
            'speed' : 0.1,
            'length': 5,
            'width' : 20,
            'path'  : {
                'left'  : 37,
                'up'    : 38,
                'right' : 39,
                'down'  : 40
            },
        },
    }
    
    Game.prototype.start = function() {
        var cfg = Game.cfg;
        if (typeof this.field != 'undefined') {
            delete this.field;
        }
        this.field = new Field(this.canvas, cfg.field);
        if (typeof this.food != 'undefined') {
            delete this.food;
        }
        this.food = new Food(this.canvas, this.ctx, cfg.food.length, cfg.snake.width);
        this.food.game();
        if (typeof this.snake != 'undefined') {
            this.snake.stop();
            delete this.snake;
        }
        this.snake = new Snake(this.canvas, this.ctx, cfg.snake.speed, cfg.snake.length, cfg.snake.width);
        this.snake.game();
    }
    
    Game.prototype.cleanCanvas = function() {
        this.ctx.fillStyle = Game.cfg.field.color.fon;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.width);
        //this.ctx.fillStyle = Game.cfg.colors.red;
    }

    function Field(canvas, sizes) {
        canvas.width  = sizes.width;
        canvas.height = sizes.height;
    }
    
    function Food(canvas, ctx, length, width) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.width = width > 0 ? width : 1;
        this.length = length > 0 ? length : 1;
        this.body = [];
    } 
    
    Food.prototype.game = function() {
        this.build('random');
        this.draw();
    }
    
    Food.prototype.build = function(place) {
        var getRandom = function(max) {
            var rand = Math.floor(Math.random() * max + this.width),
                sub = rand % this.width;
            return rand - sub;
        }.bind(this);
        var x = this.canvas.width / 2,
            y = this.canvas.height / 2;
        if (place == 'random') {
            x = getRandom(this.canvas.width);
            y = getRandom(this.canvas.height);
        }
        for (var i = 0; i < this.length; ++i) {
            this.body.push([x, y + i * this.width]);
        }        
    }
    
    Food.prototype.draw = function() {
        this.ctx.fillStyle = Game.cfg.food.color;
        for (var i = 0; i < this.length; ++i) {
            this.ctx.fillRect(this.body[i][0], this.body[i][1], this.width, this.width);
        }
    }
    
    Food.prototype.clean = function() {
        this.ctx.fillStyle = Game.cfg.field.color.fon;
        for(var i = 0; i < this.length; ++i) {
            this.ctx.fillRect(this.body[i][0], this.body[i][1], this.width, this.width);
        }
    }
    
    function Snake(canvas, ctx, speed, length, width) {
        Snake.superclass.constructor.call(this, canvas, ctx, width);
        this.speed = speed > 0 ? speed : 1;
        this.length = length > 0 ? length : 1;
        this.width = width > 0 ? width : 1;
        this.body = [];
        this.ctx = ctx;
        this.ctx.fillStyle = Game.cfg.snake.color;
        this.direction = Game.cfg.snake.path.up;
    }
    
    extend(Snake, Food);
    
    Snake.prototype.cleanTail = function() {
        var body = this.body;
        this.ctx.fillStyle = Game.cfg.field.color.fon;
        this.ctx.fillRect(
            body[body.length - 1][0], 
            body[body.length - 1][1],
            this.width,
            this.width
        );
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
            pathNames = {'left': 'left', 'up': 'up', 'right': 'right', 'down': 'down'},
            path = Game.cfg.snake.path;
        if (body.length > 1) {
            this.cleanTail();
        }
        switch (keyCode) {
            case path[pathNames.left]:
                unshiftPopWithEdge(bodyFirstX - this.width, bodyFirstY, pathNames.left);
                break;
            case path[pathNames.up]:
                unshiftPopWithEdge(bodyFirstX, bodyFirstY - this.width, pathNames.up);
                break;
            case path[pathNames.right]:
                unshiftPopWithEdge(bodyFirstX + this.width, bodyFirstY, pathNames.right);
                break;
            case path[pathNames.down]:
                unshiftPopWithEdge(bodyFirstX, bodyFirstY + this.width, pathNames.down);
                break;
        }
    }
    
    Snake.prototype.stop = function() {
        clearInterval(this.intervalID);
    }
    
    Snake.prototype.die = function() {
        this.stop();
        var ctx = this.ctx;
        ctx.fillStyle = Game.cfg.field.color.die;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        ctx.font = '30pt Arial';
        ctx.fillStyle = Game.cfg.field.color.fon;
        ctx.textAlign = 'center';
        var text = 'YOU DIED!';
        ctx.fillText(text, this.canvas.width / 2, this.canvas.height / 2);
    }
    
    Snake.prototype.motion = function() {
        this.intervalID = setInterval(function() {
            this.draw();
            this.move(this.direction);
        }.bind(this), this.speed * 1000);
    }
    
    Snake.prototype.game = function() {
        function inPath(keycode) {
            var path = Game.cfg.snake.path;
            for (k in path) {
                if (keycode === path[k]) {
                    return true;
                }
            }
            return false;
        }
        this.build('center');
        document.onkeydown = function(e) {
            if (inPath.call(this, e.keyCode)) {
                this.direction = e.keyCode;
            }
        }.bind(this);
        this.motion();
    }

    var game = new Game(canvas);
    game.start();
})()