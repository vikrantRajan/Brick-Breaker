// The <canvas> element is generated automatically by the framework. We are initializing it by creating a new Phaser.Game object and assigning it to the game variable.The parameters are:
// 1. Width
// 2. Height
// 3. The rendering method. The three options are AUTO, CANVAS and WEBGL. We can set one of the latter two explicitly or use AUTO to let Phaser decide which one to use. It usually uses WebGL if available in the browser, falling back to Canvas 2D if not.
// 4. The id of the <canvas> to use for rendering if one already exists on the page (we've specified null because we want Phaser to create its own.)
var game = new Phaser.Game(480, 320, Phaser.AUTO, null, {preload: preload, create: create, update: update});

var ball;
var paddle;
// bricks will be used to create a group
var bricks;
// newBrick will be a new object added to the group on every iteration of the loop,
var newBrick;
//  brickInfo will store all the data we need
var brickInfo;
// Score details
var scoreText;
var score = 0;
// start the game with 3 lives
var lives = 3;
// lives that remain
var livesText;
// text label for when the player loses one of their lives
var lifeLostText;
// no moving objects until user clicks to start
var playing = false;
var startButton;
// preload takes care of preloading the image assets
function preload() {
    // scaleMode has a few different options available for how the Canvas can be scaled: SHOW_ALL — scales the canvas, but keeps the aspect ratio untouched, so images won't be skewed
    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true;
    game.stage.backgroundColor = '#eee';
    // To load images, we will use the game object created by Phaser, executing its load.image() method.
    // 2 Images --> paddle + brick
    game.load.image('paddle', 'img/paddle.png');
    game.load.image('brick', 'img/brick.png');
    // Instead of loading a single image of the ball and button We will show the sprites sequentially to create the illusion of animation. The spritesheet() method's two extra paremeters determine the width and height of each single frame in the given spritesheet file, indicating to the program how to chop it up to get the individual frames.
    // BALL = 20px X 20px
    // BUTTON = width 120px -- height 40px
    game.load.spritesheet('ball', 'img/wobble.png', 20, 20);
    game.load.spritesheet('button', 'img/button.png', 120, 40);
}
// create is executed once when everything is loaded and ready
function create() {
    // the physics.startSystem() method will initialize the Arcade Physics engine in our game. To enable proper collision detection between objects
    game.physics.startSystem(Phaser.Physics.ARCADE);
    
    // ********** BALL ****************
    // to show the ball on the screen we will use another Phaser method called add.sprite(); 
    // position the ball by 3 parameters: world.width and world.height values: game.world.width*0.5 will be right in the middle of the screen
   // the last parameter defines the DOM element that we defined as a varible ball
    // add() method binds the given function and causes it to be executed every time the event occurs
    ball = game.add.sprite(game.world.width*0.5, game.world.height-25, 'ball');
    
    // To add an animation to the object we use the animations.add() method, which contains the following parameters:
    // 1. The name we chose for the animation
    // 2. An array defining the order in which to display the frames during the animation. There are three frames on the ball sprite. Phaser extracts these and stores references to them in an array — positions 0, 1, and 2. They occur in the sequence inputed
    // 3. The framerate, in fps. Since we are running the animation at 24fps and there are 9 frames, the animation will display just under three times per second.
    ball.animations.add('wobble', [0,1,0,2,0,1,0,2,0], 24);
    ball.anchor.set(0.5);
    // enable our ball for the physics system
    game.physics.enable(ball, Phaser.Physics.ARCADE);
    // this sets the canvas boundaries as walls
    ball.body.collideWorldBounds = true;
    // To lose, we will disable the ball's collision with the bottom of the canvas.
    game.physics.arcade.checkCollision.down = false;
    // setting the bounce intensity for the ball
    ball.body.bounce.set(1);
    ball.checkWorldBounds = true;
    // This method runs if the ball falls out of the bottom section of the screen
    ball.events.onOutOfBounds.add(ballLeaveScreen, this);
    // *************** PADDLE ****************
    // we will init our paddle by adding the following method add.sprite()
    paddle = game.add.sprite(game.world.width*0.5, game.world.height-5, 'paddle');
    // the paddle is currently not exactly in the middle, because the anchor from which the position is calculated always starts from the top left edge of the object.
    paddle.anchor.set(0.5,1);
    // to make the paddle collide with the ball we have to enable physics for the paddle.
    game.physics.enable(paddle, Phaser.Physics.ARCADE);
    // To allow the ball to bounce off the paddle, We can set the body of the paddle to be immovable, so it won't move when the ball hits it.
    paddle.body.immovable = true;
    // Code that draws the bricks
    initBricks();
    // Choosing our font and color
    textStyle = { font: '14px Quicksand, sans-serif', fill: '#0095DD' };
    // The text() method can take four parameters:
    // The x and y coordinates to draw the text at.
    // The actual text that will be rendered.
    // The font style to render the text with.
    // --------------------- --------------------- //
    scoreText = game.add.text(10, 10, 'Points: 0', textStyle);
    livesText = game.add.text(game.world.width-10, 10, 'Lives: '+lives, textStyle);
    livesText.anchor.set(1,0);
    lifeLostText = game.add.text(game.world.width*0.5, game.world.height*0.5, 'Life lost, tap to continue', textStyle);
    lifeLostText.anchor.set(0.5);
    lifeLostText.visible = false;
    // The button() method's parameters are as follows:
    // 1. & 2. The button's x and y coordinates
    // 3. The name of the graphic asset to be displayed for the button
    // 4. A callback function that will be executed when the button is pressed
    // 5. A reference to this to specify the execution context
    // 6. The frames that will be used for the over, out and down events.
    startButton = game.add.button(game.world.width*0.5, game.world.height*0.5, 'button', startGame, this, 1, 0, 2);
    startButton.anchor.set(0.5);
}
// update is executed on every frame.

function update() {
    // To enable collision detection the collide() method is used.
    // The first two parameters define the two objects that are in context
    // The third, optional parameter is the wobble animation function executed on the ball sprite when a collision occurs
    // --------------------------------------------------------------
    // checks for collision detection between the paddle and ball
    game.physics.arcade.collide(ball, paddle, ballHitPaddle);
    // checks for collision detection between ball and bricks
    game.physics.arcade.collide(ball, bricks, ballHitBrick);
    // set the default position of the paddle if the playing variable is true
    if(playing) {
        paddle.x = game.input.x || game.world.width*0.5;
    }
}
function initBricks() {
    brickInfo = {
        // width and height of each brick
        width: 50,
        height: 20,
        // number of rows and columns of all bricks
        count: {
            row: 7,
            col: 3
        },
        // location on the canvas where the bricks will be drawn
        offset: {
            top: 50,
            left: 60
        },
        // adding space between each brick
        padding: 10
    }
    // adding an empty group first, in order to contain the bricks
    // loop through the columns and rows to create new brick on each iteration
    // This way we will create the exact number of bricks we need and have them all contained in a group.
    bricks = game.add.group();
    for(c=0; c<brickInfo.count.col; c++) {
        for(r=0; r<brickInfo.count.row; r++) {
            // To ensure all bricks are not drawn at one single spot
            // multiply row with width + padding of brick 
            // result is added with the X axis offset
            var brickX = (r*(brickInfo.width+brickInfo.padding))+brickInfo.offset.left;
             // multiply column with height + padding of brick 
            // result is added with the Y axis top
            var brickY = (c*(brickInfo.height+brickInfo.padding))+brickInfo.offset.top;
            newBrick = game.add.sprite(brickX, brickY, 'brick');
            //  // The newly created brick is enabled for the Arcade physics engine,
            game.physics.enable(newBrick, Phaser.Physics.ARCADE);
            // it's body is set to be immovable (so it won't move when hit by the ball)
            newBrick.body.immovable = true;
            // setting the anchor to be in the middle 
            newBrick.anchor.set(0.5);
            // adding the brick to the group.
            bricks.add(newBrick);
        }
    }
}
// Functions that will run when the ball hits a brick.
function ballHitBrick(ball, brick) {
    var killTween = game.add.tween(brick.scale);
    killTween.to({x:0,y:0}, 200, Phaser.Easing.Linear.None);
    // addOnce() method is executed only once and then unbound so it is not executed again.
    killTween.onComplete.addOnce(function(){
        brick.kill();
    }, this);
    killTween.start();
    // increase the number of points every time the ball hits a brick and update the scoreText to display the current score. This can be done using the setText() method
    score += 10;
    scoreText.setText('Points: '+score);
    if(score === brickInfo.count.row*brickInfo.count.col*10) {
        alert('You won the game, congratulations!');
        location.reload();
    }
}
// Run this function everytime the ball leaves the screen from bottom
function ballLeaveScreen() {
    // lose 1 life everytime this function runs [TOTAL LIVES: 3]
    lives--;
    // Check to see if any lives are left 
    if(lives) {
        // setting text to new remaining lives 
        livesText.setText('Lives: '+lives);
        // Alert that a life was lost is now true
        lifeLostText.visible = true;
        // Ball and Paddle positions are reset to default
        ball.reset(game.world.width*0.5, game.world.height-25);
        paddle.reset(game.world.width*0.5, game.world.height-5);
        // function that runs upon next input (touch/click)
        // addOnce() = function executed only once and then unbound so it is not executed again.
        game.input.onDown.addOnce(function(){
            // removing the lifelost alert message
            lifeLostText.visible = false;
            // defines the speed of the balls movement
            ball.body.velocity.set(150, -150);
        }, this);
    }
    // If lives == 0 == false || then alert message game over
    else {
        alert('You lost, game over!');
        location.reload();
    }
}
// Animation + random speed when ball hits paddle
function ballHitPaddle(ball, paddle) {
    // calling the animation sprite sequence to play
    ball.animations.play('wobble');
    // We can change the ball's velocity depending on the exact spot it hits the paddle, by modifying the x velocity each time the ballHitPaddle() function is run. 
    // This makes the gameplay more unpredictable
    ball.body.velocity.x = -1*5*(paddle.x-ball.x);
}
// When the user clicks/touches screen to start
function startGame() {
    // destroy() removes the startButton from screen
    // velocity.set gets the ball moving with speed and direction of movement
    // playing now = true
    startButton.destroy();
    ball.body.velocity.set(150, -150);
    playing = true;
}
