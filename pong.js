// should use continuous collision detection (not discrete)

var canvas = document.querySelector("canvas");
var ctx = canvas.getContext("2d");

const height = 500;
const width = 1000;
const fieldLineWidth = 2;
const fieldLineHeight = 20;
canvas.height = height;
canvas.width = width;

const ballSize = 20;
let ballPosX = width/2;
let ballPosY = height/2;
let ballSpeedX = -5;
let ballSpeedY = -5;

const racketHeight = 100;
const racketWidth = 20;

let playerPosY = height/2;
let aiPosY = height/2;

let mousePosY = 0;
let collision = false;

let ballUpBorder = ballPosY - ballSize/2;
let ballDownBorder = ballPosY + ballSize/2;
let ballLeftBorder = ballPosX - ballSize/2;
let ballRightBorder = ballPosX + ballSize/2;

let playerUpBorder = playerPosY - racketHeight/2;
let playerDownBorder = playerPosY + racketHeight/2;
let playerLeftBorder = 70;
let playerRightBorder = 70 + racketWidth;
let aiLeftBorder = 930 - racketWidth;
let aiRightBorder = 930;

let lastError = 0; 
let iError = 0; 
let dError = 0; 
let pError = 0;

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
    borderCollision();
    racketCollision();
}

function borderCollision()
{
    if(ballPosY + ballSize/2 >= height || ballPosY - ballSize/2 <= 0) 
    {
        ballSpeedY = -ballSpeedY;
        collision = true;
    }
    else if(ballPosX + ballSize/2 >= width || ballPosX - ballSize/2 <= 0) 
    {
        ballSpeedX = -ballSpeedX;
        collision = true;
    }   
}

function AABBintersects(differenceValues)
{
    if(differenceValues[2] > 0.0 || differenceValues[1] > 0.0) return false;
    if(differenceValues[0] > 0.0 || differenceValues[3] > 0.0) return false;

    return true;
}

function racketCollision()
{
    ballUpBorder = ballPosY - ballSize/2;
    ballDownBorder = ballPosY + ballSize/2;
    ballLeftBorder = ballPosX - ballSize/2;
    ballRightBorder = ballPosX + ballSize/2;

    playerUpBorder = playerPosY - racketHeight/2;
    playerDownBorder = playerPosY + racketHeight/2;

    let depthCollision = 0.0;

    let differenceValues = [playerUpBorder - ballDownBorder,    //playerUpBallDown
                            ballUpBorder - playerDownBorder,    //playerDownBallUp
                            ballLeftBorder - playerRightBorder, //playerRightBallLeft
                            playerLeftBorder - ballRightBorder] //playerLeftBallRight

    if(AABBintersects(differenceValues)) 
    {
        let calculatedDepth = Math.max.apply(null,differenceValues);

        if(depthCollision >= calculatedDepth) depthCollision = calculatedDepth;

        if(depthCollision == differenceValues[0] || depthCollision == differenceValues[1]) ballSpeedY = -ballSpeedY;
        else if(depthCollision == differenceValues[2] || depthCollision == differenceValues[3]) ballSpeedX = -ballSpeedX;
    }
}

function drawBall()
{
    ctx.fillStyle = 'white';
    ctx.fillRect(ballPosX - ballSize/2, ballPosY - ballSize/2, ballSize, ballSize);
}

function drawPlayer()
{
    ctx.fillStyle = 'white';
    ctx.fillRect(70, playerPosY - racketHeight/2, racketWidth, racketHeight);
}

function drawAI()
{
    ctx.fillStyle = 'white';
    ctx.fillRect(width - 70 - racketWidth, aiPosY - racketHeight/2, racketWidth, racketHeight);
}

function updatePlayer(e)
{
    mousePosY = e.clientY - canvas.offsetTop;
    playerPosY = mousePosY;
    
    if(playerPosY - racketHeight/2 < 0) playerPosY = racketHeight/2; 
    else if(playerPosY + racketHeight/2 > height) playerPosY = height - racketHeight/2;
}

function updateAI()
{
    if(ballPosX < width/2)
    {
        aiPID(0.02, 50000, 100)//2000, 1000
    }
    else
    {
        aiPID(0.1, 10000, 1000)//2000, 1000
    }
}

function aiPID(kp, Ti, Kd)
{
    debugger;
    pError = (ballPosY - aiPosY);
    iError += pError * 1000/60;
    dError = (pError - lastError) / (1000 * 60);

    aiPosY += kp * pError + (1/Ti) * (iError) - Kd * dError;

    if(aiPosY - racketHeight/2 < 0) aiPosY = racketHeight/2; 
    else if(aiPosY + racketHeight/2 > height) aiPosY = height - racketHeight/2;
    lastError = pError;
    debugger;
}

function game()
{
    setup(width, height);
    updateBall();
    updateAI();
    drawPlayer();
    drawAI(); 
    drawBall();
}

canvas.addEventListener("mousemove", function(e){ updatePlayer(e) }, false);

window.setInterval(game, 1000/60);
