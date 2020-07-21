// better ai - scalable
// optimization of code
// better collision detection

var canvas = document.querySelector("canvas");
var ctx = canvas.getContext("2d");

/////for gameBoard
const height = 500;
const width = 1000;
const fieldLineWidth = 2;
const fieldLineHeight = 20;
canvas.height = height;
canvas.width = width;

/////for ball
const ballSize = 20;
let ballPosX = width/2;
let ballPosY = height/2;
let ballSpeedX = -5;
let ballSpeedY = -5;
//for collisionDetection
let ballUpBorder = ballPosY - ballSize/2;
let ballDownBorder = ballPosY + ballSize/2;
let ballLeftBorder = ballPosX - ballSize/2;
let ballRightBorder = ballPosX + ballSize/2;

/////for rackets
const racketHeight = 100;
const racketWidth = 20;

/////for Player's collisionDetection and steering
let playerPosY = height/2;
let playerUpBorder = playerPosY - racketHeight/2;
let playerDownBorder = playerPosY + racketHeight/2;
let playerLeftBorder = 70;
let playerRightBorder = 70 + racketWidth;

/////for AI collisionDetection and steering
let aiPosY = height/2;
let aiLeftBorder = 930 - racketWidth;
let aiRightBorder = 930;
let aiUpBorder = aiPosY - racketHeight/2;
let aiDownBorder = aiPosY + racketHeight/2;

/////for AI's PID 
let lastError = 0; 
let iError = 0; 
let dError = 0; 
let pError = 0;

///// additional variables
let mousePosY = 0;
let collision = false;
let newStart = false;
let pointAI = 0;
let pointPlayer = 0;

//for continuous collisionDetection;
let prevPlayerPos = [70+racketWidth/2, playerPosY];
let prevAIPos = [930 - racketWidth/2, aiPosY];
let prevBallPos = [ballPosX, ballPosY];
let velocityPlayer = [0, 0];
let velocityBall  = [0, 0];
let velocityAI = [0, 0];


function boardDraw(width, height)
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

    ballUpBorder = ballPosY - ballSize/2;
    ballDownBorder = ballPosY + ballSize/2;
    ballLeftBorder = ballPosX - ballSize/2;
    ballRightBorder = ballPosX + ballSize/2;

    collisionDetection();
    speedUp(); 
}

function speedUp()
{
    if(collision)
    {
      //  debugger;
        if(Math.abs(ballSpeedX) < 15.0) 
        {
            if(ballSpeedX <= 0)
                ballSpeedX -= 0.5;
            else if(ballSpeedX > 0)
                ballSpeedX += 0.5;
        }
        if(Math.abs(ballSpeedY) < 15.0) 
        {
            if(ballSpeedY <= 0)
                ballSpeedY -= 0.5;
            else if (ballSpeedY > 0)
                ballSpeedY += 0.5;
        }
        collision = false;
        console.log(ballSpeedX + " " + ballSpeedY);
    }
}

function collisionDetection()
{
    borderCollision();

    playerUpBorder = playerPosY - racketHeight/2;
    playerDownBorder = playerPosY + racketHeight/2;

    aiUpBorder = aiPosY - racketHeight/2;
    aiDownBorder = aiPosY + racketHeight/2;

    minowskiCollision(aiUpBorder, aiRightBorder, aiDownBorder, aiLeftBorder);
    minowskiCollision(playerUpBorder, playerRightBorder, playerDownBorder, playerLeftBorder);
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
        newStart = true;
        if(ballPosX + ballSize/2 >= width) 
        {
            pointPlayer++;
            var pointTab = document.querySelector("#player span").textContent = pointPlayer;
        }
        else 
        {
            pointAI++;
            var pointTab = document.querySelector("#ai span").textContent = pointAI;
        }
        reset();
    }   
}


function minowskiCollision(racketUp, racketRight, racketDown, racketLeft)
{
    let leftMD = racketLeft - ballRightBorder;
    let topMD = racketUp - ballDownBorder;
    let widthMD = racketWidth + ballSize;
    let heightMD = racketHeight + ballSize;

    let mdMinX = leftMD;
    let mdMaxX = leftMD + widthMD;
    let mdMinY = topMD;
    let mdMaxY = topMD + heightMD;

    if(mdMinX <= 0 && mdMaxX >= 0 && mdMinY <= 0 && mdMaxY >= 0) // continuous time
    {
        let depthXY = depthOfCollision(0, 0, mdMinX, mdMaxX, mdMinY, mdMaxY);

        if(Math.abs(depthXY[0]) >= Math.abs(depthXY[1])) 
        {
            ballPosX += depthXY[0];
            ballSpeedX = -ballSpeedX;
            reboundAngle(racketUp);
        }
        else 
        {
            ballPosY += depthXY[1];
            ballSpeedY = -ballSpeedY;
        }
        collision = true;
    }
    ///// not workig corectly
    else // continuous time
    {
        let relativeMotionX = velocityPlayer[0] - velocityBall[0];
        let relativeMotionY = velocityPlayer[1] - velocityBall[1];

        // ray-cast the relativeMotion vector against the Minkowski AABB
        let h = getRayIntersection(mdMinX, mdMaxX, mdMinY, mdMaxY, relativeMotionX, relativeMotionY);

        if(h < Number.POSITIVE_INFINITY)
        {
            console.log("ULTIMATE COLLISION-----------------");

            playerPosY += velocityPlayer[1] * h;
            ballPosX += velocityBall[0] * h;
            ballPosY += velocityBall[1] * h;
        }
    }
}

function getRayIntersection(mdMinX, mdMaxX, mdMinY, mdMaxY, relativeMotionX, relativeMotionY)
{
    let endPos = [0 + relativeMotionX, 0 + relativeMotionY];

    // for each of the AABB's four edges
    // calculate the minimum fraction of "direction"
    // in order to find where the ray FIRST intersects
    // the AABB (if it ever does)

    let minT = getRayIntersectionOfFirstRay(endPos, mdMinX, mdMinY, mdMinX, mdMaxY);
    let x;
    x = getRayIntersectionOfFirstRay(endPos, mdMinX, mdMaxY, mdMaxX, mdMaxY);
    if(x < minT) minT = x;
    x = getRayIntersectionOfFirstRay(endPos, mdMaxX, mdMaxY, mdMaxX, mdMinY);
    if(x < minT) minT = x;
    x = getRayIntersectionOfFirstRay(endPos, mdMaxX, mdMinY, mdMinX, mdMinY);
    if(x < minT) minT = x;

    return minT;
}

function getRayIntersectionOfFirstRay(endPos, originBX, originBY, endBX, endBY)
{
    let r = [endPos[0] - 0, endPos[1] - 0];
    let s = [endBX - originBX, endBY - originBY];
    
    let numerator = ((originBX - 0) * r[0]) + ((originBY - 0) * r[1]);
    let denominator = r[0]*s[0] + r[1]*s[1];

    if(numerator == 0 && denominator == 0)
    {
        return Number.POSITIVE_INFINITY;
    }
    if(denominator == 0)
    {
        return Number.POSITIVE_INFINITY;
    }

    let u = numerator/denominator;
    let t = ((originBX * s[0]) + (originBY * s[1])) / denominator;

    if((t >= 0) && (t <= 1) && (u >= 0) && (u <= 1))
    {
        return t;
    } 

    return Number.POSITIVE_INFINITY;
}

function reboundAngle(racketUp)
{
    let angleY = Math.PI/4 * (Math.abs(racketUp - ballPosY) / racketHeight) - Math.PI/8;
    let speed = Math.sqrt(Math.pow(ballSpeedX,2) + Math.pow(ballSpeedY,2));
    ballSpeedY = Math.sin(angleY) * speed;
}

function depthOfCollision(PointX, PointY, minX, maxX, minY, maxY)
{
    let minDist = Math.abs(PointX - minX);
    let depthXY = [minX, PointY];

    if(Math.abs(maxX - PointX) < minDist)
    {
        minDist = Math.abs(maxX - PointX);
        depthXY = [maxX, PointY];
    }
    if(Math.abs(maxY - PointY) < minDist)
    {
        minDist = Math.abs(maxY - PointY);
        depthXY = [PointX, maxY];
    }
    if(Math.abs(minY - PointY) < minDist)
    {
        minDist = Math.abs(minY - PointY);
        depthXY = [PointX, minY];
    }
    return depthXY;
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
        aiPID(0.2, 70000, 1500)//2000, 1000
    }
}

function aiPID(kp, Ti, Kd)
{
    let fullError = 0.0;
    pError = (ballPosY - aiPosY);
    iError += pError * 1000/60;
    dError = (pError - lastError) / (1000 * 60);

    fullError += kp * pError + (1/Ti) * (iError) - Kd * dError;
    if(fullError >= 5.0) fullError = 5.0;
    else if(fullError <= -5.0) fullError = -5.0;
    aiPosY += fullError;

    if(aiPosY - racketHeight/2 < 0) aiPosY = racketHeight/2; 
    else if(aiPosY + racketHeight/2 > height) aiPosY = height - racketHeight/2;
    lastError = pError;
}

function game()
{
    if(newStart == false)
    {
        boardDraw(width, height);
        updateBall();
        updateAI();

        velocityPlayer = [70 + racketWidth/2, (playerPosY - prevPlayerPos[1])];
        velocityAI = [930 - racketWidth/2, (aiPosY - prevAIPos[1])];
        velocityBall = [ballPosX - prevBallPos[0], ballPosY - prevBallPos[1]];

        //console.log(velocityPlayer[1]);
        drawPlayer();
        drawAI(); 
        drawBall();

        prevPlayerPos = [70 + racketWidth/2, playerPosY];
        prevBallPos = [ballPosX, ballPosY];
        prevAIPos = [930 - racketWidth/2, aiPosY];
    }
}

function initializeGame()
{
    ballPosX = width/2;
    ballPosY = Math.random()*height; 

    ballSpeedX = -(Math.random() + 5); // -5 / -6
    ballSpeedY = (Math.random() * 11 - 5);   
    ///console.log(ballSpeedY);
    newStart = false;
}

function reset()
{
    if(newStart == true)
    {
        setTimeout(function() {initializeGame()}, 1000);
    }
}

canvas.addEventListener("mousemove", function(e){ updatePlayer(e) }, false);

window.setInterval(game, 1000/60);
