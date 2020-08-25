//SELECT CVS
var cvs = document.getElementById("bird");
var ctx = cvs.getContext("2d");

//Game vars and constants
let frames = 0;
const DEGREE = Math.PI / 180;

//Load sprite images
const sprite = new Image();
sprite.src = "img/sprite.png";

// LOAD SOUNDS
const SCORE_S = new Audio();
SCORE_S.src = "audio/sfx_point.wav";

const FLAP = new Audio();
FLAP.src = "audio/sfx_flap.wav";

const HIT = new Audio();
HIT.src = "audio/sfx_hit.wav";

const SWOOSHING = new Audio();
SWOOSHING.src = "audio/sfx_swooshing.wav";

const DIE = new Audio();
DIE.src = "audio/sfx_die.wav";


//Game state
const state = {
    current: 0,
    getReady: 0,
    game: 1,
    over: 2
}


//Control the game

cvs.addEventListener("click", function(event) {
    switch (state.current) {
        case state.getReady:
            state.current = state.game;
            SWOOSHING.play();
            break;
        case state.game:
            bird.flap();
            FLAP.play();
            break;
        case state.over:
            let rect = cvs.getBoundingClientRect();
            let clickX = event.clientX - rect.left;
            let clickY = event.clientY - rect.top;
            if (clickX >= startBtn.x && clickX <= startBtn.x + startBtn.w &&
                clickY >= startBtn.y && clickY <= startBtn.y + startBtn.h) {
                pipes.reset();
                bird.speedReset();
                score.reset();
                state.current = state.getReady;
            }
            break;
    }
})

//Creat start button
const startBtn = {
    x: 120,
    y: 263,
    w: 83,
    h: 29
}

//Create Background
const bg = {
    sX: 0,
    sY: 0,
    w: 275,
    h: 226,
    x: 0,
    dx: 2,
    y: cvs.height - 226,

    draw: function() {
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);

        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x + this.w, this.y, this.w, this.h);
    },
    update: function() {
        if (state.current === state.game) {
            this.x = (this.x - this.dx) % (this.w / 2);
        }
    }

}

//Create foreground
const fg = {
    sX: 276,
    sY: 0,
    w: 223,
    h: 111,
    x: 0,
    y: cvs.height - 111,
    dx: 2,

    draw: function() {
        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);

        ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x + this.w, this.y, this.w, this.h);
    },
    update: function() {
        if (state.current === state.game) {
            this.x = (this.x - this.dx) % (this.w / 2);
        }
    }

}

//Create Bird
const bird = {
    animation: [
        { sX: 276, sY: 112 },
        { sX: 276, sY: 139 },
        { sX: 276, sY: 164 },
        { sX: 276, sY: 139 }
    ],
    x: 50,
    y: 150,
    w: 34,
    h: 26,
    radius: 12,

    frame: 0,

    gravity: 0.25,
    jump: 4.6,
    speed: 0,
    rotation: 0,


    draw: function() {
        let bird = this.animation[this.frame];

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.drawImage(sprite, bird.sX, bird.sY, this.w, this.h, -this.w / 2, -this.h / 2, this.w, this.h);
        ctx.restore();
    },

    flap: function() {
        this.speed = -this.jump;
    },

    update: function() {
        //If the game state is get ready state, the bird must flap slowly
        this.period = state.current == state.getReady ? 10 : 5;
        this.frame += frames % this.period == 0 ? 1 : 0;
        //Frame goes from 0 to 4, then again to 0
        this.frame = this.frame % this.animation.length;

        if (state.current == state.getReady) {
            //Reset position og the birt after game over
            this.y = 150;
            this.rotation = 0 * DEGREE;
        } else {
            this.speed += this.gravity;
            this.y += this.speed;
            if (this.y + this.h / 2 >= cvs.height - fg.h) {
                this.y = cvs.height - fg.h - this.h / 2;
                if (state.current == state.game) {
                    state.current = state.over;
                    DIE.play();
                }
            }
            //if the speed is greatter than the jump mean the bird is falling down
            if (this.speed >= this.jump) {
                this.rotation = 80 * DEGREE;
                this.frame = 1;
            } else {
                this.rotation = -25 * DEGREE;
            }
        }
    },
    speedReset: function() {
        this.speed = 0;
    }
}


//Create Pipes
const pipes = {
    position: [],
    top: {
        sX: 554,
        sY: 0,
    },
    bottom: {
        sX: 501,
        sY: 0
    },
    w: 53,
    h: 400,
    gap: 90,
    dx: 2,
    maxYPos: -150,

    draw: function() {
        for (let i = 0; i < this.position.length; i++) {
            let p = this.position[i];

            let topYPos = p.y;
            let bottomYPos = p.y + this.h + this.gap;

            //Draw top pipe
            ctx.drawImage(sprite, this.top.sX, this.top.sY, this.w, this.h, p.x, topYPos, this.w, this.h);
            //Draw bottom pipe
            ctx.drawImage(sprite, this.bottom.sX, this.bottom.sY, this.w, this.h, p.x, bottomYPos, this.w, this.h);
        }
    },

    update: function() {
        if (state.current !== state.game) return;

        if (frames % 100 == 0) {
            this.position.push({
                x: cvs.width,
                y: this.maxYPos * (Math.random() + 1)
            });
        }

        //Update position pipes
        for (let i = 0; i < this.position.length; i++) {
            let p = this.position[i];


            let bottomPipeYPos = p.y + this.h + this.gap;

            //Collision dectection
            //Top pipe
            if (bird.x + bird.radius > p.x && //Left
                bird.x - bird.radius < p.x + this.w && //Right
                bird.y + bird.radius > p.y && //Top
                bird.y - bird.radius < p.y + this.h) //Bottom
            {
                state.current = state.over;
                HIT.play();
            }
            if (bird.x + bird.radius > p.x && //Left
                bird.x - bird.radius < p.x + this.w && //Right
                bird.y + bird.radius > bottomPipeYPos && //Top
                bird.y - bird.radius < bottomPipeYPos + this.h) //Bottom
            {
                state.current = state.over;
                HIT.play();
            }

            //Move the pipes to the left
            p.x -= this.dx;

            //if the pipes go beyond canvas, delete them from the array
            if (p.x === 10) {
                score.value++;
                SCORE_S.play();
                score.best = Math.max(score.value, score.best);
                localStorage.setItem("best", score.best);
            }
            if (p.x + this.w <= 0) {
                this.position.shift();
            }
        }
    },
    reset: function() {
        this.position = [];
    }
}

//Create scoreboard
const score = {
    best: parseInt(localStorage.getItem("best")) || 0,
    value: 0,
    draw: function() {
        ctx.fillStyle = "#fff";
        ctx.strokeStyle = "#000";
        if (state.current === state.game) {
            ctx.lineWidth = 2;
            ctx.font = "40px Teko";
            ctx.fillText(this.value, cvs.width / 2, 45);
            ctx.strokeText(this.value, cvs.width / 2, 45);
        }
        if (state.current === state.over) {
            ctx.lineWidth = 2;
            ctx.font = "25px Teko";
            //Best score
            ctx.fillText(this.value, 225, 186);
            ctx.strokeText(this.value, 225, 186);
            // BEST SCORE
            ctx.fillText(this.best, 225, 228);
            ctx.strokeText(this.best, 225, 228);
        }
    },
    reset: function() {
        this.value = 0;
    }

}


//Create get ready message
const getReady = {

    sX: 0,
    sY: 228,
    w: 173,
    h: 152,
    x: cvs.width / 2 - 173 / 2,
    y: 85,
    draw: function() {
        if (state.current == state.getReady) {
            ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);
        }
    }

}

const gameOver = {

    sX: 175,
    sY: 228,
    w: 226,
    h: 200,
    x: cvs.width / 2 - 226 / 2,
    y: 90,
    draw: function() {
        if (state.current == state.over) {
            ctx.drawImage(sprite, this.sX, this.sY, this.w, this.h, this.x, this.y, this.w, this.h);
        }
    }
}


function draw() {
    ctx.fillStyle = "#70c5ce";
    ctx.fillRect(0, 0, cvs.width, cvs.height);
    bg.draw();
    fg.draw();
    pipes.draw();
    bird.draw();
    getReady.draw();
    gameOver.draw();
    score.draw();
}

//Upadate
function update() {
    bird.update();
    pipes.update();
    bg.update();
    fg.update();
}

function loop() {


    update();
    draw();

    //Xử lý mượt hiệu ứng
    frames++;
    requestAnimationFrame(loop);

}



loop();