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
            },
            'message': {
                'color': 'white',
                'font' : '30pt Arial',
                'align': 'center',
                'text'  : 'YOU DIED!',
            }
        },
        'food': {
            'length': 1,
            'color' : 'black',
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
            'space' : 32,
        },
    }
    
    Game.prototype.start = function() {
        var cfg = Game.cfg;
        if (typeof this.field != 'undefined') {
            delete this.field;
        }
        this.field = new Field(this.canvas, cfg.field);
        this.field.parent = this;
        if (typeof this.food != 'undefined') {
            delete this.food;
        }
        this.food = new Food(this.canvas, this.ctx, cfg.food.length, cfg.snake.width);
        this.food.parent = this;
        if (typeof this.snake != 'undefined') {
            this.snake.stop();
            delete this.snake;
        }
        this.snake = new Snake(this.canvas, this.ctx, cfg.snake.speed, cfg.snake.length, cfg.snake.width);
        this.snake.parent = this;
        this.snake.game();
        this.food.game();
    }
    
    Game.prototype.cleanCanvas = function() {
        this.ctx.fillStyle = Game.cfg.field.color.fon;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.width);
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
        var getRandomForXY = function(maxX, maxY, multiplicity) {
            function getRandom(max) {
                return Math.floor(Math.random() * max + multiplicity);
            }
            function getRandomX() {
                return correctValueWithMultiplicity(getRandom(maxX), multiplicity);
            }
            function getRandomY() {
                return correctValueWithMultiplicity(getRandom(maxY), multiplicity);
            }
            function getTrueXY() {
                var x = getRandomX(),
                    y = getRandomY();
                if (this.isFoodInSnake(x, y)) {
                    return getTrueXY.call(this);
                }
                return {'x': x, 'y': y}
            }
            return getTrueXY.call(this);
        }.bind(this);
        function correctValueWithMultiplicity(value, multiplicity) {
            return value - value % multiplicity;
        }
        var width = this.width,
            x = correctValueWithMultiplicity(this.canvas.width / 2, width),
            y = correctValueWithMultiplicity(this.canvas.height / 2, width);
        if (place == 'random' && this.constructor.name == Food.name) {
            var xy = getRandomForXY(this.canvas.width - width, this.canvas.height - width, width);
            x = xy.x;
            y = xy.y;
        }
        for (var i = 0; i < this.length; ++i) {
            this.body.push([x, y + i * this.width]);
        }
    }
    
    Food.prototype.draw = function() {
        var cfg = Game.cfg;
        this.ctx.fillStyle = this.constructor.name == Food.name ? cfg.food.color : cfg.snake.color;
        for (var i = 0; i < this.length; ++i) {
            this.ctx.fillRect(this.body[i][0], this.body[i][1], this.width, this.width);
        }
    }
    
    Food.prototype.deleteBodyElements = function() {
        var body = this.body;
        while(body.length) {body.pop()}
    }
    
    Food.prototype.clean = function() {
        this.ctx.fillStyle = Game.cfg.field.color.fon;
        for(var i = 0; i < this.length; ++i) {
            this.ctx.fillRect(this.body[i][0], this.body[i][1], this.width, this.width);
        }
    }
    
    Food.prototype.reborn = function() {
        this.deleteBodyElements();
        this.build('random');
        this.draw();
    }
    
    Food.prototype.isFoodInSnake = function(x, y) {
        var getXorYFromBody = function(xOrY) {
            xOrY = xOrY == 'x' ? 0 : 1;
            return this.parent.snake.body.map(function(a) {return a[xOrY]});
        }.bind(this);
        var isXYinBody = function(xy) {
            return this.parent.snake.body.some(function(item) {
                return item[0] == this.x && item[1] == this.y;
            }, xy);
        }.bind(this);
        var food = this.parent.food.body,
            foodX,
            foodY;
        if (food.length) {
            foodX = food[0][0];
            foodY = food[0][1];
        }
        var x = typeof x != 'undefined' ? x : foodX,
            y = typeof y != 'undefined' ? y : foodY;
        return isXYinBody({'x': x, 'y': y});
    }
    
    function Snake(canvas, ctx, speed, length, width) {
        Snake.superclass.constructor.call(this, canvas, ctx, width);
        this.speed = speed > 0 ? speed : 1;
        this.length = length > 0 ? length : 1;
        this.width = width > 0 ? width : 1;
        this.body = [];
        this.ctx = ctx;
        var cfg = Game.cfg.snake;
        this.ctx.fillStyle = cfg.color;
        this.direction = cfg.path.up;
        this.doReverse = false;
        this.goneTail = {};
    }
    
    extend(Snake, Food);
    
    Snake.prototype.cleanTail = function() {
        this.ctx.fillStyle = Game.cfg.field.color.fon;
        this.ctx.fillRect(
            this.goneTail.x, 
            this.goneTail.y,
            this.width,
            this.width
        );
    }
    
    Snake.prototype.grow = function() {
        var cfg = Game.cfg.snake.path,
            body = this.body,
            lastIndex = body.length - 1,
            x = body[lastIndex][0],
            y = body[lastIndex][1],
            width = this.width;
        switch (this.direction) {
            case cfg.up:
                body.push([x, y + width]);
                break;
            case cfg.left:
                body.push([x + width, y]);
                break;
            case cfg.right:
                body.push([x - width, y]);
                break;
            case cfg.down:
                body.push([x, y - width]);
                break;
        }
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
            var growAndFoodReborn = function() {
                this.grow();
                this.parent.food.reborn();
            }.bind(this);
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
                    if (x >= this.canvas.width) {
                        x = 0;
                    }
                    break;
                case pathNames.down:
                    if (y >= this.canvas.height) {
                        y = 0;
                    }
                    break;
            }
            unshiftPop(x, y);
            if (this.isFoodInSnake()) {
                growAndFoodReborn();
            }
        }.bind(this);
        if (this.doReverse) {
            this.body.reverse();
            this.doReverse = false;
        }
        var body = this.body,
            bodyFirstX = body[0][0],
            bodyFirstY = body[0][1],
            pathNames = {'left': 'left', 'up': 'up', 'right': 'right', 'down': 'down'},
            path = Game.cfg.snake.path,
            length = body.length,
            bodyLast = body[length - 1];
        this.goneTail = {'x': bodyLast[0], 'y': bodyLast[1]};
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
    
    Snake.prototype.draw = function() {
        Snake.superclass.draw.call(this);
        this.cleanTail();
    }
    
    Snake.prototype.stop = function() {
        clearInterval(this.intervalID);
    }
    
    Snake.prototype.die = function() {
        this.stop();
        var ctx = this.ctx,
            cfg = Game.cfg.field.message;
            width = this.canvas.width,
            height = this.canvas.height;
        ctx.fillStyle = Game.cfg.field.color.die;
        ctx.fillRect(0, 0, width, height);
        ctx.font = cfg.font;
        ctx.fillStyle = cfg.color;
        ctx.textAlign = cfg.align;
        ctx.fillText(cfg.text, width / 2, height / 2);
    }
    
    Snake.prototype.motion = function() {
        this.intervalID = setInterval(function() {
            this.draw();
            this.move(this.direction);
        }.bind(this), this.speed * 1000);
    }
    
    Snake.prototype.game = function() {
        var path = Game.cfg.snake.path;
        function inPath(key) {
            for (k in path) {
                if (key === path[k]) {
                    return true;
                }
            }
            return false;
        }
        function setTrueDirection(key) {
            if (this.body.length > 1) {
                var body = this.body,
                    length = body.length
                    last = body[length - 1],
                    penult = body[body.length - 2],
                    fieldWidth = Game.cfg.field.width,
                    fieldHeight = Game.cfg.field.height;
                if (last[0] > penult[0] || last[0] == 0 && penult[0] == fieldWidth - this.width) {
                    this.direction = path.right;
                } else if (last[0] < penult[0] || last[0] == fieldWidth - this.width && penult[0] == 0) {
                    this.direction = path.left;
                } else if (last[1] > penult[1] || last[1] == 0 && penult[1] == fieldHeight - this.width) {
                    this.direction = path.down;
                } else if (last[1] < penult[1] || last[1] == fieldHeight - this.width && penult[1] == 0) {
                    this.direction = path.up;
                }
            } else {
                this.direction = key;
            }
        }
        function isPossibleToReverse(key) {
            var dir = this.direction;
            return key == path.left  && dir == path.right || key == path.right && dir == path.left
                || key == path.up    && dir == path.down  || key == path.down  && dir == path.up;
        }
        this.build('center');
        document.onkeydown = function(e) {
            var key = e.keyCode;
            if (inPath.call(this, key)) {
                if (isPossibleToReverse.call(this, key)) {
                    setTrueDirection.call(this, key);
                    this.doReverse = true;
                } else {
                    this.direction = key;
                }
            } else if (key == Game.cfg.snake.space) {
                this.parent.start();
            }
        }.bind(this);
        this.motion();
    }

    var game = new Game(canvas);
    game.start();
})()