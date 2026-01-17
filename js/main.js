// Main.js - General interactions for the portfolio

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
});

// Pink brush stroke / highlighter cursor trail effect
function initCursorTrail() {
    const trailContainer = document.createElement('div');
    trailContainer.id = 'cursor-trail-container';
    trailContainer.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 9999; overflow: hidden;';
    document.body.appendChild(trailContainer);

    const trails = [];
    const maxTrails = 20;
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

        // Fade out and remove
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
            triggerExplosion(earthRect.left + earthRect.width/2, earthRect.top + earthRect.height/2);
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

// Scroll to top with rocket animation
function initScrollToTop() {
    const scrollBtn = document.getElementById('scroll-top');
    const scrollIcon = document.getElementById('scroll-icon');

    if (!scrollBtn || !scrollIcon) return;

    scrollBtn.addEventListener('click', () => {
        // Change to rocket
        scrollIcon.textContent = '🚀';
        scrollIcon.style.transition = 'transform 0.3s ease';
        scrollIcon.style.transform = 'rotate(-45deg)';

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Check when scroll reaches top
        const checkScroll = setInterval(() => {
            if (window.scrollY === 0) {
                clearInterval(checkScroll);

                // Change to moon
                scrollIcon.textContent = '🌕';
                scrollIcon.style.transform = 'rotate(0deg)';

                // After 3 seconds, change back to arrow
                setTimeout(() => {
                    scrollIcon.textContent = '↑';
                }, 3000);
            }
        }, 100);
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
