// Main.js - General interactions for the portfolio

// Console Easter Egg for developers
(function () {
    const styles = [
        'color: #FFE500',
        'background: #0a0a0a',
        'font-size: 14px',
        'font-weight: bold',
        'padding: 10px 20px',
        'border: 2px solid #FFE500'
    ].join(';');

    const asciiArt = `
%c
    █████╗ ██████╗ ███████╗██╗  ██╗ █████╗ ██████╗
   ██╔══██╗██╔══██╗██╔════╝██║  ██║██╔══██╗██╔══██╗
   ███████║██████╔╝███████╗███████║███████║██║  ██║
   ██╔══██║██╔══██╗╚════██║██╔══██║██╔══██║██║  ██║
   ██║  ██║██║  ██║███████║██║  ██║██║  ██║██████╔╝
   ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═════╝
`;

    console.log(asciiArt, 'color: #FF6B9D; font-family: monospace; font-size: 10px;');
    console.log('%c👋 Hey there, curious developer!', styles);
    console.log('%cSince you\'re poking around...', 'color: #FFE500; font-size: 12px;');
    console.log('%c🎮 Type play() for a surprise...', 'color: #FFE500; font-size: 12px;');
    console.log('%c📧 Let\'s connect: arshad.ahmad97.aa@gmail.com', 'color: #FFE500; font-size: 12px;');
})();

// Hidden Breakout game - type play() in console to start
function play() {
    // Game config
    const colors = ['#FFE500', '#FF6B9D', '#00D4FF', '#7CFF6B', '#FF6B35', '#B388FF'];
    const BRICK_ROWS = 5;
    const BRICK_COLS = 10;
    const BRICK_WIDTH = 70;
    const BRICK_HEIGHT = 25;
    const BRICK_PADDING = 8;
    const PADDLE_WIDTH = 100;
    const PADDLE_HEIGHT = 15;
    const BALL_RADIUS = 8;

    // High score from localStorage
    let highScore = parseInt(localStorage.getItem('breakoutHighScore')) || 0;

    // Create overlay
    const overlay = document.createElement('div');
    overlay.id = 'breakout-overlay';
    overlay.style.cssText = `
        position: fixed;
        inset: 0;
        background: rgba(10, 10, 10, 0.95);
        z-index: 99999;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        font-family: 'Space Mono', monospace;
    `;

    // Create canvas
    const canvas = document.createElement('canvas');
    const canvasWidth = BRICK_COLS * (BRICK_WIDTH + BRICK_PADDING) + BRICK_PADDING;
    const canvasHeight = 500;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    canvas.style.cssText = `
        border-top: 6px solid #FFE500;
        border-bottom: 6px solid #FFE500;
        border-left: 6px solid #FFE500;
        border-right: 6px solid #FFE500;
        background: #0a0a0a;
        box-shadow: 12px 12px 0 #000;
        display: block;
    `;

    // UI elements
    const scoreDiv = document.createElement('div');
    scoreDiv.style.cssText = 'color: #FFE500; font-size: 1.2rem; margin-bottom: 15px; font-weight: bold;';
    scoreDiv.textContent = `SCORE: 0 | HIGH: ${highScore}`;

    const hintDiv = document.createElement('div');
    hintDiv.style.cssText = 'color: #666; font-size: 0.9rem; margin-top: 15px;';
    hintDiv.textContent = 'A/D or ←/→ to move • ESC to exit';

    overlay.appendChild(scoreDiv);
    overlay.appendChild(canvas);
    overlay.appendChild(hintDiv);
    document.body.appendChild(overlay);

    const ctx = canvas.getContext('2d');

    // Game state
    let score = 0;
    let gameRunning = false;
    let gamePaused = false;
    let animationId;

    // Paddle
    let paddle = {
        x: canvasWidth / 2 - PADDLE_WIDTH / 2,
        y: canvasHeight - 40,
        width: PADDLE_WIDTH,
        height: PADDLE_HEIGHT
    };

    // Ball
    let ball = {
        x: canvasWidth / 2,
        y: canvasHeight - 60,
        dx: 4 * (Math.random() > 0.5 ? 1 : -1),
        dy: -4,
        radius: BALL_RADIUS
    };

    // Create bricks
    let bricks = [];
    function initBricks() {
        bricks = [];
        for (let row = 0; row < BRICK_ROWS; row++) {
            for (let col = 0; col < BRICK_COLS; col++) {
                bricks.push({
                    x: col * (BRICK_WIDTH + BRICK_PADDING) + BRICK_PADDING,
                    y: row * (BRICK_HEIGHT + BRICK_PADDING) + BRICK_PADDING + 40,
                    width: BRICK_WIDTH,
                    height: BRICK_HEIGHT,
                    color: colors[row % colors.length],
                    alive: true
                });
            }
        }
    }
    initBricks();

    // Mouse control
    const handleMouseMove = (e) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        paddle.x = Math.max(0, Math.min(canvasWidth - paddle.width, mouseX - paddle.width / 2));
    };
    canvas.addEventListener('mousemove', handleMouseMove);

    // Keyboard controls - smooth continuous movement
    const keys = { left: false, right: false };
    const PADDLE_SPEED = 10; // Smooth movement per frame

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            cleanup();
        }
        if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
            keys.left = true;
        }
        if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
            keys.right = true;
        }
    };

    const handleKeyUp = (e) => {
        if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
            keys.left = false;
        }
        if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
            keys.right = false;
        }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    function cleanup() {
        gameRunning = false;
        gamePaused = true;
        cancelAnimationFrame(animationId);
        canvas.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('keyup', handleKeyUp);
        overlay.remove();
        console.log('%c🎮 Thanks for playing! Final Score: ' + score, 'color: #FFE500; font-size: 12px; font-weight: bold;');
    }

    function updateHighScore() {
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('breakoutHighScore', highScore);
            return true;
        }
        return false;
    }

    function showGameOver(won) {
        gameRunning = false;
        gamePaused = true;
        cancelAnimationFrame(animationId);

        const isNewHighScore = updateHighScore();

        ctx.fillStyle = 'rgba(10, 10, 10, 0.85)';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        ctx.fillStyle = won ? '#7CFF6B' : '#FF6B9D';
        ctx.font = 'bold 36px Space Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(won ? '🎉 YOU WIN!' : '💀 GAME OVER', canvasWidth / 2, canvasHeight / 2 - 60);

        ctx.fillStyle = '#FFE500';
        ctx.font = 'bold 24px Space Mono, monospace';
        ctx.fillText(`SCORE: ${score}`, canvasWidth / 2, canvasHeight / 2 - 10);

        if (isNewHighScore) {
            ctx.fillStyle = '#FF6B35';
            ctx.font = 'bold 18px Space Mono, monospace';
            ctx.fillText('🏆 NEW HIGH SCORE!', canvasWidth / 2, canvasHeight / 2 + 25);
        }

        ctx.fillStyle = '#fff';
        ctx.font = '16px Space Mono, monospace';
        ctx.fillText('Press R to Retry', canvasWidth / 2, canvasHeight / 2 + 70);
        ctx.fillText('Press ESC to Close', canvasWidth / 2, canvasHeight / 2 + 100);

        // Listen for retry
        const retryHandler = (e) => {
            if (e.key === 'r' || e.key === 'R') {
                document.removeEventListener('keydown', retryHandler);
                restartGame();
            }
        };
        document.addEventListener('keydown', retryHandler);
    }

    function restartGame() {
        score = 0;
        scoreDiv.textContent = `SCORE: 0 | HIGH: ${highScore}`;

        paddle.x = canvasWidth / 2 - PADDLE_WIDTH / 2;
        ball = {
            x: canvasWidth / 2,
            y: canvasHeight - 60,
            dx: 4 * (Math.random() > 0.5 ? 1 : -1),
            dy: -4,
            radius: BALL_RADIUS
        };

        initBricks();
        startCountdown();
    }

    function drawPaddle() {
        ctx.fillStyle = '#FFE500';
        ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.strokeRect(paddle.x, paddle.y, paddle.width, paddle.height);
    }

    function drawBall() {
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fillStyle = '#FF6B9D';
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.closePath();
    }

    function drawBricks() {
        bricks.forEach(brick => {
            if (brick.alive) {
                ctx.fillStyle = brick.color;
                ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 2;
                ctx.strokeRect(brick.x, brick.y, brick.width, brick.height);
            }
        });
    }

    function checkCollisions() {
        // Wall collisions
        if (ball.x + ball.dx > canvasWidth - ball.radius || ball.x + ball.dx < ball.radius) {
            ball.dx = -ball.dx;
        }
        if (ball.y + ball.dy < ball.radius) {
            ball.dy = -ball.dy;
        }

        // Paddle collision
        if (ball.y + ball.dy > paddle.y - ball.radius &&
            ball.x > paddle.x && ball.x < paddle.x + paddle.width) {
            ball.dy = -ball.dy;
            const hitPos = (ball.x - paddle.x) / paddle.width;
            ball.dx = 8 * (hitPos - 0.5);
        }

        // Bottom - game over
        if (ball.y + ball.dy > canvasHeight - ball.radius) {
            showGameOver(false);
            return;
        }

        // Brick collisions
        bricks.forEach(brick => {
            if (brick.alive &&
                ball.x > brick.x && ball.x < brick.x + brick.width &&
                ball.y > brick.y && ball.y < brick.y + brick.height) {
                ball.dy = -ball.dy;
                brick.alive = false;
                score += 10;
                scoreDiv.textContent = `SCORE: ${score} | HIGH: ${highScore}`;

                // Check win
                if (bricks.every(b => !b.alive)) {
                    showGameOver(true);
                }
            }
        });
    }

    function gameLoop() {
        if (!gameRunning || gamePaused) return;

        // Smooth keyboard movement
        if (keys.left) {
            paddle.x = Math.max(0, paddle.x - PADDLE_SPEED);
        }
        if (keys.right) {
            paddle.x = Math.min(canvasWidth - paddle.width, paddle.x + PADDLE_SPEED);
        }

        ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        drawBricks();
        drawPaddle();
        drawBall();
        checkCollisions();

        ball.x += ball.dx;
        ball.y += ball.dy;

        animationId = requestAnimationFrame(gameLoop);
    }

    function startCountdown() {
        gamePaused = true;
        let count = 3;

        function drawCountdown() {
            ctx.clearRect(0, 0, canvasWidth, canvasHeight);
            drawBricks();
            drawPaddle();
            drawBall();

            ctx.fillStyle = 'rgba(10, 10, 10, 0.7)';
            ctx.fillRect(0, 0, canvasWidth, canvasHeight);

            ctx.fillStyle = '#FFE500';
            ctx.font = 'bold 72px Space Mono, monospace';
            ctx.textAlign = 'center';
            ctx.fillText(count, canvasWidth / 2, canvasHeight / 2 + 20);
        }

        drawCountdown();

        const countdownInterval = setInterval(() => {
            count--;
            if (count > 0) {
                drawCountdown();
            } else {
                clearInterval(countdownInterval);
                gamePaused = false;
                gameRunning = true;
                gameLoop();
            }
        }, 800);
    }

    // Start game with countdown
    console.log('%c🎮 Breakout started! A/D or ←/→ to move the paddle.', 'color: #FFE500; font-size: 12px;');
    startCountdown();
}

document.addEventListener('DOMContentLoaded', () => {
    // Initialize pink brush stroke cursor trail
    initCursorTrail();

    // Animate stats on scroll
    initStatsAnimation();

    // Add hover sound effect class
    initHoverEffects();

    // Skill tags interaction
    initSkillTags();

    // Bomb drop explosion effect
    initBombDrop();

    // Scroll to top rocket animation
    initScrollToTop();

    // Crystal ball fortune modal
    initFortuneBall();

    // Magnetic skill cards - tilt toward cursor
    initMagneticCards();

    // Confetti celebration on contact click
    initContactConfetti();
});

// Pink brush stroke / highlighter cursor trail effect with ghost memory
function initCursorTrail() {
    // Ghost trail container (behind main trails)
    const ghostContainer = document.createElement('div');
    ghostContainer.id = 'ghost-trail-container';
    ghostContainer.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 9997; overflow: hidden;';
    document.body.appendChild(ghostContainer);

    // Main trail container
    const trailContainer = document.createElement('div');
    trailContainer.id = 'cursor-trail-container';
    trailContainer.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 9999; overflow: hidden;';
    document.body.appendChild(trailContainer);

    const trails = [];
    const ghostTrails = [];
    const maxTrails = 20;
    const maxGhostTrails = 200;
    let lastX = 0;
    let lastY = 0;
    let isMoving = false;
    let moveTimeout;

    document.addEventListener('mousemove', (e) => {
        const x = e.clientX;
        const y = e.clientY;

        // Calculate distance moved
        const dx = x - lastX;
        const dy = y - lastY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Only create trail if moved enough distance
        if (distance > 5) {
            createBrushStroke(x, y, dx, dy, distance);
            lastX = x;
            lastY = y;
        }

        // Track if mouse is moving
        isMoving = true;
        clearTimeout(moveTimeout);
        moveTimeout = setTimeout(() => {
            isMoving = false;
        }, 100);
    });

    function createBrushStroke(x, y, dx, dy, distance) {
        const stroke = document.createElement('div');
        stroke.className = 'highlighter-trail';

        // Calculate angle of movement
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);

        // Randomize size slightly for brush effect
        const width = Math.min(distance + 10, 40);
        const height = 8 + Math.random() * 8;

        stroke.style.cssText = `
            left: ${x}px;
            top: ${y}px;
            width: ${width}px;
            height: ${height}px;
            transform: translate(-50%, -50%) rotate(${angle}deg);
            opacity: ${0.4 + Math.random() * 0.3};
        `;

        trailContainer.appendChild(stroke);
        trails.push(stroke);

        // Create ghost trail (persistent faint copy)
        createGhostTrail(x, y, width, height, angle);

        // Fade out main trail
        setTimeout(() => {
            stroke.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            stroke.style.opacity = '0';
            stroke.style.transform = `translate(-50%, -50%) rotate(${angle}deg) scale(0.8)`;
        }, 50);

        setTimeout(() => {
            if (stroke.parentNode) {
                stroke.parentNode.removeChild(stroke);
            }
            const index = trails.indexOf(stroke);
            if (index > -1) {
                trails.splice(index, 1);
            }
        }, 500);

        // Limit total trails
        while (trails.length > maxTrails) {
            const oldTrail = trails.shift();
            if (oldTrail && oldTrail.parentNode) {
                oldTrail.parentNode.removeChild(oldTrail);
            }
        }
    }

    function createGhostTrail(x, y, width, height, angle) {
        const ghost = document.createElement('div');
        ghost.className = 'ghost-trail';
        ghost.style.cssText = `
            position: fixed;
            left: ${x}px;
            top: ${y}px;
            width: ${width}px;
            height: ${height}px;
            transform: translate(-50%, -50%) rotate(${angle}deg);
            background: var(--pink);
            opacity: 0.04;
            mix-blend-mode: multiply;
            border-radius: 2px;
            pointer-events: none;
        `;

        ghostContainer.appendChild(ghost);
        ghostTrails.push(ghost);

        // Limit ghost trails for performance
        while (ghostTrails.length > maxGhostTrails) {
            const oldGhost = ghostTrails.shift();
            if (oldGhost && oldGhost.parentNode) {
                oldGhost.parentNode.removeChild(oldGhost);
            }
        }
    }
}

// Animate stat numbers when they come into view
function initStatsAnimation() {
    const stats = document.querySelectorAll('.stat-number');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const stat = entry.target;
                const finalValue = stat.textContent;

                // Only animate if it's a number
                if (/^\d+/.test(finalValue)) {
                    animateNumber(stat, finalValue);
                }

                observer.unobserve(stat);
            }
        });
    }, { threshold: 0.5 });

    stats.forEach(stat => observer.observe(stat));
}

function animateNumber(element, finalValue) {
    const hasPlus = finalValue.includes('+');
    const numericValue = parseInt(finalValue);
    const duration = 1000;
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentValue = Math.floor(easeOut * numericValue);

        element.textContent = currentValue + (hasPlus ? '+' : '');

        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            element.textContent = finalValue;
        }
    }

    requestAnimationFrame(update);
}

// Add subtle interaction to hover effects
function initHoverEffects() {
    const interactiveElements = document.querySelectorAll('.skill-card, .project-card, .exp-card, .edu-card, .contact-btn');

    interactiveElements.forEach(element => {
        element.addEventListener('mouseenter', () => {
            element.style.transition = 'all 0.15s ease';
        });
    });
}

// Skill tags get a random rotation on hover
function initSkillTags() {
    const tags = document.querySelectorAll('.skill-tag');

    tags.forEach(tag => {
        tag.addEventListener('mouseenter', () => {
            const randomRotation = (Math.random() - 0.5) * 6; // -3 to 3 degrees
            tag.style.transform = `rotate(${randomRotation}deg) scale(1.05)`;
        });

        tag.addEventListener('mouseleave', () => {
            tag.style.transform = 'rotate(0deg) scale(1)';
        });
    });
}

// Add glitch effect to elements with .glitch class on random intervals
function initRandomGlitch() {
    const glitchElements = document.querySelectorAll('.glitch');

    setInterval(() => {
        const randomElement = glitchElements[Math.floor(Math.random() * glitchElements.length)];
        if (randomElement) {
            randomElement.classList.add('glitching');
            setTimeout(() => {
                randomElement.classList.remove('glitching');
            }, 300);
        }
    }, 5000);
}

// Initialize random glitch after a delay
setTimeout(initRandomGlitch, 2000);

// Bomb drop on Earth explosion effect
function initBombDrop() {
    const bomb = document.getElementById('bomb');
    const earth = document.getElementById('earth');

    if (!bomb || !earth) return;

    let isDragging = false;
    let bombClone = null;
    let startX, startY;
    let originalBombRect;

    // Mouse down - start drag
    bomb.addEventListener('mousedown', (e) => {
        e.preventDefault();
        isDragging = true;
        originalBombRect = bomb.getBoundingClientRect();

        // Create a clone for dragging
        bombClone = bomb.cloneNode(true);
        bombClone.id = 'bomb-clone';
        bombClone.classList.add('dragging');
        bombClone.style.left = e.clientX + 'px';
        bombClone.style.top = e.clientY + 'px';
        document.body.appendChild(bombClone);

        // Hide original
        bomb.style.opacity = '0.3';

        startX = e.clientX;
        startY = e.clientY;
    });

    // Mouse move - drag
    document.addEventListener('mousemove', (e) => {
        if (!isDragging || !bombClone) return;

        bombClone.style.left = e.clientX + 'px';
        bombClone.style.top = e.clientY + 'px';

        // Check if over earth
        const earthRect = earth.getBoundingClientRect();
        const isOverEarth = (
            e.clientX >= earthRect.left &&
            e.clientX <= earthRect.right &&
            e.clientY >= earthRect.top &&
            e.clientY <= earthRect.bottom
        );

        if (isOverEarth) {
            earth.classList.add('highlight');
        } else {
            earth.classList.remove('highlight');
        }
    });

    // Mouse up - drop
    document.addEventListener('mouseup', (e) => {
        if (!isDragging) return;
        isDragging = false;

        const earthRect = earth.getBoundingClientRect();
        const isOverEarth = (
            e.clientX >= earthRect.left - 30 &&
            e.clientX <= earthRect.right + 30 &&
            e.clientY >= earthRect.top - 30 &&
            e.clientY <= earthRect.bottom + 30
        );

        if (isOverEarth) {
            // EXPLOSION!
            triggerExplosion(earthRect.left + earthRect.width / 2, earthRect.top + earthRect.height / 2);
        }

        // Remove clone
        if (bombClone) {
            bombClone.remove();
            bombClone = null;
        }

        // Show original bomb
        bomb.style.opacity = '1';
        earth.classList.remove('highlight');
    });

    function triggerExplosion(x, y) {
        // Hide earth
        earth.classList.add('exploding');

        // Create flash
        const flash = document.createElement('div');
        flash.className = 'explosion-flash';
        flash.style.setProperty('--x', x + 'px');
        flash.style.setProperty('--y', y + 'px');
        document.body.appendChild(flash);

        // Create particles
        const colors = ['#FF6B35', '#FFE500', '#FF6B9D', '#ff4444', '#ffaa00'];
        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.className = 'explosion-particle';
            particle.style.left = x + 'px';
            particle.style.top = y + 'px';
            particle.style.background = colors[Math.floor(Math.random() * colors.length)];

            const angle = (Math.PI * 2 * i) / 20;
            const distance = 50 + Math.random() * 100;
            particle.style.setProperty('--tx', Math.cos(angle) * distance + 'px');
            particle.style.setProperty('--ty', Math.sin(angle) * distance + 'px');

            document.body.appendChild(particle);

            setTimeout(() => particle.remove(), 800);
        }

        // Create explosion emoji
        const mushroom = document.createElement('div');
        mushroom.className = 'mushroom-cloud';
        mushroom.textContent = '💥';
        mushroom.style.left = x + 'px';
        mushroom.style.top = y + 'px';
        document.body.appendChild(mushroom);

        // Clean up flash
        setTimeout(() => flash.remove(), 500);
        setTimeout(() => mushroom.remove(), 1000);

        // Reset after 3 seconds
        setTimeout(() => {
            earth.classList.remove('exploding');
            earth.style.transform = '';
            earth.style.opacity = '1';
        }, 3000);
    }
}

// Scroll to top with rocket animation (two-phase: failed launch, then successful)
function initScrollToTop() {
    const scrollBtn = document.getElementById('scroll-top');
    const scrollIcon = document.getElementById('scroll-icon');

    if (!scrollBtn || !scrollIcon) return;

    let isFirstAttempt = true; // Track which attempt we're on

    scrollBtn.addEventListener('click', () => {
        // Change to rocket
        scrollIcon.textContent = '🚀';
        scrollIcon.style.transition = 'transform 0.3s ease';
        scrollIcon.style.transform = 'rotate(-45deg)';

        if (isFirstAttempt) {
            // FIRST ATTEMPT: Failed launch - go halfway, explode, fall back down
            const halfwayPoint = window.scrollY / 2;

            window.scrollTo({ top: halfwayPoint, behavior: 'smooth' });

            // Wait for halfway scroll, then explode
            const checkHalfway = setInterval(() => {
                if (Math.abs(window.scrollY - halfwayPoint) < 50) {
                    clearInterval(checkHalfway);

                    // Explosion!
                    scrollIcon.textContent = '💥';
                    scrollIcon.style.transform = 'rotate(0deg)';

                    // Scroll back down after brief pause
                    setTimeout(() => {
                        const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
                        window.scrollTo({ top: documentHeight, behavior: 'smooth' });

                        // Check when reached bottom
                        const checkBottom = setInterval(() => {
                            const currentScroll = window.scrollY;
                            const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

                            if (currentScroll >= maxScroll - 10) {
                                clearInterval(checkBottom);

                                // Show crossbone
                                scrollIcon.textContent = '☠️';

                                // After 3 seconds, back to arrow
                                setTimeout(() => {
                                    scrollIcon.textContent = '↑';
                                    isFirstAttempt = false; // Next time will succeed
                                }, 3000);
                            }
                        }, 100);
                    }, 500);
                }
            }, 100);

        } else {
            // SECOND ATTEMPT: Successful launch to the moon
            window.scrollTo({ top: 0, behavior: 'smooth' });

            const checkScroll = setInterval(() => {
                if (window.scrollY === 0) {
                    clearInterval(checkScroll);

                    // Change to moon
                    scrollIcon.textContent = '🌕';
                    scrollIcon.style.transform = 'rotate(0deg)';

                    // After 3 seconds, change back to arrow and reset cycle
                    setTimeout(() => {
                        scrollIcon.textContent = '↑';
                        isFirstAttempt = true; // Reset for next cycle
                    }, 3000);
                }
            }, 100);
        }
    });
}

// Crystal Ball Fortune Modal
function initFortuneBall() {
    const fortuneTriggers = document.querySelectorAll('.crystal-ball-trigger');
    const modal = document.getElementById('fortune-modal');
    const closeBtn = document.querySelector('.fortune-close');
    const fortuneText = document.getElementById('fortune-text');

    if (!fortuneTriggers.length || !modal) return;

    const fortunes = [
        // Sarcastic / Funny
        "Your code works? Don't touch it. Don't even look at it. Walk away slowly.",
        "The bug isn't in your code. It's in your life choices that led you here.",
        "You'll find success... right after mass confusion, mass debugging, and mass coffee.",
        "The crystal ball sees... another meeting that could've been an email.",
        "Your future holds great things. Also, 47 browser tabs you'll never close.",
        // Wholesome / Good-hearted
        "Someone out there is inspired by the work you do. Keep creating.",
        "Your potential is limitless. Today is just the beginning of something amazing.",
        "The world needs your unique perspective. Don't dim your light.",
        "Every expert was once a beginner. You're exactly where you need to be.",
        "You're doing better than you think. Trust the process and trust yourself."
    ];

    fortuneTriggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            const randomFortune = fortunes[Math.floor(Math.random() * fortunes.length)];
            fortuneText.textContent = randomFortune;
            modal.classList.add('active');
        });
    });

    closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            modal.classList.remove('active');
        }
    });
}

// Magnetic skill cards - cards tilt toward cursor like they have gravity
function initMagneticCards() {
    const cards = document.querySelectorAll('.skill-card');

    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            // Calculate distance from center
            const deltaX = e.clientX - centerX;
            const deltaY = e.clientY - centerY;

            // Calculate rotation (max 15 degrees)
            const rotateX = (deltaY / (rect.height / 2)) * -10;
            const rotateY = (deltaX / (rect.width / 2)) * 10;

            // Calculate subtle scale based on proximity to center
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            const maxDistance = Math.sqrt((rect.width / 2) ** 2 + (rect.height / 2) ** 2);
            const scale = 1 + (1 - distance / maxDistance) * 0.05;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale})`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transition = 'transform 0.5s ease';
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';

            // Remove transition after animation completes
            setTimeout(() => {
                card.style.transition = '';
            }, 500);
        });
    });
}

// Confetti celebration when clicking contact buttons
function initContactConfetti() {
    const contactBtns = document.querySelectorAll('.contact-btn');

    contactBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = rect.left + rect.width / 2;
            const y = rect.top + rect.height / 2;

            createConfetti(x, y);
        });
    });

    function createConfetti(originX, originY) {
        const colors = ['#FFE500', '#FF6B9D', '#00D4FF', '#7CFF6B', '#FF6B35', '#B388FF'];
        const confettiCount = 50;

        for (let i = 0; i < confettiCount; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti-piece';

            // Random properties
            const color = colors[Math.floor(Math.random() * colors.length)];
            const size = 8 + Math.random() * 8;
            const angle = (Math.random() * 360) * (Math.PI / 180);
            const velocity = 8 + Math.random() * 8;
            const spin = (Math.random() - 0.5) * 720;

            // Calculate end position
            const tx = Math.cos(angle) * velocity * 30;
            const ty = Math.sin(angle) * velocity * 20 - 100; // Bias upward

            confetti.style.cssText = `
                position: fixed;
                left: ${originX}px;
                top: ${originY}px;
                width: ${size}px;
                height: ${size}px;
                background: ${color};
                pointer-events: none;
                z-index: 10000;
                transform: translate(-50%, -50%);
            `;

            // Randomly make some pieces rectangular
            if (Math.random() > 0.5) {
                confetti.style.width = size * 0.4 + 'px';
                confetti.style.borderRadius = '2px';
            }

            document.body.appendChild(confetti);

            // Animate with gravity effect
            const duration = 1000 + Math.random() * 500;
            confetti.animate([
                {
                    transform: 'translate(-50%, -50%) rotate(0deg)',
                    opacity: 1
                },
                {
                    transform: `translate(calc(-50% + ${tx}px), calc(-50% + ${ty + 200}px)) rotate(${spin}deg)`,
                    opacity: 0
                }
            ], {
                duration: duration,
                easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            });

            setTimeout(() => confetti.remove(), duration);
        }
    }
}


