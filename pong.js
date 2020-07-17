var canvas = document.querySelector("canvas");
var ctx = canvas.getContext("2d");

const height = 500;
const width = 1000;
canvas.height = height;
canvas.width = width;

const ballSize = 20;
let ballPosX = width/2 - ballSize/2;
let ballPosY = height/2 - ballSize/2;
let ballSpeedX = 0.5;
let ballSpeedY = 0.5;

const playerHeight = 100;
const playerWidth = 20;
const fieldLineWidth = 2;
const fieldLineHeight = 20;
let mousePosY = 0;
let playerPosY = height/2 - playerHeight/2;
let collision = false;

function setup(width, height)
{
    ctx.fillStyle = 'black';
    ctx.fillRect(0,0,width, height);

    ctx.fillStyle = 'white';
    for(var line = 0; line < height; line+=40)
    {
        ctx.fillRect(width/2 - fieldLineWidth/2, 4 + line, fieldLineWidth, fieldLineHeight);
    }
}

function updateBall()
{
    ctx.fillStyle = 'white';
    ctx.fillRect(ballPosX, ballPosY, ballSize, ballSize);

    ballPosX += ballSpeedX;
    ballPosY += ballSpeedY;

    collisionDetection();
    /*
    if(collision)
    {
        if(ballSpeedX < 10.0) 
        {
            if(ballPosX <= 0)
                ballSpeedX -= 0.1;
            else if(ballPosX + ballSize >= width)
                ballSpeedX += 0.1;
        }
        if(ballSpeedY < 10.0) 
        {
            if(ballPosY <= 0)
                ballSpeedY -= 0.1;
            else if (ballPosY + ballSize >= height)
                ballSpeedY += 0.1;
        }
        collision = false;
    }
    */
}

function collisionDetection()
{
    if(ballPosY + ballSize >= height || ballPosY <= 0) 
    {
        ballSpeedY = -ballSpeedY;
        collision = true;
    }
    else if(ballPosX + ballSize >= width || ballPosX <= 0) 
    {
        ballSpeedX = -ballSpeedX;
        collision = true;
    }   
}

function updatePlayer()
{
    ctx.fillStyle = 'white';
    ctx.fillRect(70, playerPosY, playerWidth, playerHeight);
 
}

function updateAI()
{
    ctx.fillStyle = 'white';
    ctx.fillRect(width - 70 - playerWidth, height/2 - playerHeight/2, playerWidth, playerHeight);
}

function playerPosition(e)
{
    mousePosY = e.clientY - canvas.offsetTop;
    playerPosY = mousePosY - playerHeight/2;
    
    if(playerPosY < 0) playerPosY = 0; 
    else if(playerPosY > height - playerHeight) playerPosY = height - playerHeight;
}

function game()
{
    setup(width, height);
    updateBall();
    updatePlayer();
    updateAI(); 
}

canvas.addEventListener("mousemove", function(e){ playerPosition(e) }, false);

window.setInterval(game, 0.2);
