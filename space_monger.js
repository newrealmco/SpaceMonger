const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#000000',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

const game = new Phaser.Game(config);

let player;
let cursors;
let gold;
let goldText;
let enemies;
let score = 0;
let scoreText;
let level = 1;
let levelText;
let lives = 3;
let livesText;
let invulnerable = false; // Invulnerability flag
let invulnerabilityDuration = 2000; // 2 seconds of invulnerability
let lastHitTime = 0;
let enemySpeed = 100; // Initial enemy speed
let audioContext;
let gainNode;
let oscillator;
let countdownText;
let countdownValue = 5;
let gameOverText;
let pressAnyKeyText;
let stars;
let bullets;
let lastFired = 0;
let fireDelay = 250;
let explosions;
let debris;
let cookieMode = false;
let playerSpeed = 160;
let keyBuffer = [];
let leaderboard = [];
let isEnteringName = false;
let entryName = "";
let entryText;
let isGameRunning = false;

// Boss variables
let boss = null;
let bossActive = false;
let bossHp = 10;
let bossMaxHp = 10;
let bossSpeed = 3;
let bossDirection = 1;
let bossShootTimer = 0;
let bossShootInterval = 60;
let bossProjectiles;
let nextBossScore = 300;
let livesIcons = []; // Initialize as empty array

// Konami code tracking
let konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight'];
let konamiIndex = 0;

// Bonus round tracking
let bonusRoundActive = false;
let nextBonusScore = 1000;
let bonusCoins = [];
let bonusTimer = 0;
let bonusTimerText;

// Demo Mode
let demoMode = false;
let demoTimerEvent;
let demoText;

// Start Screen
let onStartScreen = false;
let menuStars = [];

// Easter Egg
let rpBuffer = [];

function preload() {
    // No assets to preload, we'll draw shapes directly
}

function drawRocket(scene) {
    let graphics = scene.add.graphics({ fillStyle: { color: 0x0000ff } });

    // Main rocket body - scaled to fit within 50x50
    graphics.fillTriangle(25, 0, 45, 50, 5, 50);

    // Left fin
    graphics.fillTriangle(5, 50, 15, 50, 0, 60);

    // Right fin
    graphics.fillTriangle(45, 50, 35, 50, 50, 60);

    let rocketTexture = graphics.generateTexture('rocket', 50, 60);
    graphics.destroy();

    let rocket = scene.add.sprite(400, 300, 'rocket');
    scene.physics.add.existing(rocket);
    rocket.body.setCollideWorldBounds(true);
    rocket.body.setSize(50, 60, false);

    return rocket;
}

function drawSpider(scene, x, y) {
    let graphics = scene.add.graphics();
    graphics.fillStyle(0xff0000, 1);

    // Main spider body - scaled to fit within 50x50
    graphics.fillEllipse(25, 25, 20, 12.5);

    // Spider legs - scaled to fit within 50x50
    for (let i = -1; i <= 1; i += 2) {
        graphics.lineStyle(2, 0xff0000, 1);

        graphics.beginPath();
        graphics.moveTo(5, 25);
        graphics.lineTo(0, 25 + 10 * i);
        graphics.lineTo(0, 25 + 15 * i);
        graphics.strokePath();

        graphics.beginPath();
        graphics.moveTo(45, 25);
        graphics.lineTo(50, 25 + 10 * i);
        graphics.lineTo(50, 25 + 15 * i);
        graphics.strokePath();
    }

    let spiderTexture = graphics.generateTexture('spider', 50, 50);
    graphics.destroy();

    let spider = scene.add.sprite(x, y, 'spider');
    scene.physics.add.existing(spider);
    spider.body.setCollideWorldBounds(true);
    spider.body.setSize(50, 50, false);

    return spider;
}

function drawCookieMonster(scene) {
    let graphics = scene.add.graphics();
    graphics.fillStyle(0x0000ff, 1); // Blue
    graphics.fillCircle(25, 25, 25);

    // Eyes
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(15, 15, 8);
    graphics.fillCircle(35, 15, 8);

    // Pupils
    graphics.fillStyle(0x000000, 1);
    graphics.fillCircle(15 + Phaser.Math.Between(-2, 2), 15, 3);
    graphics.fillCircle(35 + Phaser.Math.Between(-2, 2), 15, 3);

    let texture = graphics.generateTexture('cookie_monster', 50, 50);
    graphics.destroy();
}

function drawOscar(scene) {
    let graphics = scene.add.graphics();

    // Trash can
    graphics.fillStyle(0x808080, 1);
    graphics.fillRect(0, 25, 50, 25);

    // Oscar
    graphics.fillStyle(0x556b2f, 1); // Dark Olive Green
    graphics.fillCircle(25, 25, 20);

    // Eyes
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(18, 20, 6);
    graphics.fillCircle(32, 20, 6);

    graphics.fillStyle(0x000000, 1);
    graphics.fillCircle(18, 20, 3);
    graphics.fillCircle(32, 20, 3);

    // Unibrow
    graphics.lineStyle(2, 0x333333, 1);
    graphics.beginPath();
    graphics.moveTo(10, 15);
    graphics.lineTo(40, 15);
    graphics.strokePath();

    let texture = graphics.generateTexture('oscar', 50, 50);
    graphics.destroy();
}

function drawOscarNoCan(scene) {
    let graphics = scene.add.graphics();

    // Oscar (no trash can)
    graphics.fillStyle(0x556b2f, 1); // Dark Olive Green
    graphics.fillCircle(25, 25, 20);

    // Eyes
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(18, 20, 6);
    graphics.fillCircle(32, 20, 6);

    graphics.fillStyle(0x000000, 1);
    graphics.fillCircle(18, 20, 3);
    graphics.fillCircle(32, 20, 3);

    // Unibrow
    graphics.lineStyle(2, 0x333333, 1);
    graphics.beginPath();
    graphics.moveTo(10, 15);
    graphics.lineTo(40, 15);
    graphics.strokePath();

    let texture = graphics.generateTexture('oscar_no_can', 50, 50);
    graphics.destroy();
}

function drawBanana(scene) {
    let graphics = scene.add.graphics();
    graphics.lineStyle(3, 0xffff00, 1);
    graphics.beginPath();
    graphics.arc(10, 10, 10, 0.5, 2.6, false);
    graphics.strokePath();

    let texture = graphics.generateTexture('banana', 20, 20);
    graphics.destroy();
}

function drawCoin(scene) {
    let graphics = scene.add.graphics();
    graphics.fillStyle(0xffff00, 1);
    graphics.fillCircle(25, 25, 25);
    graphics.generateTexture('coin', 50, 50);
    graphics.destroy();
}

function drawCookie(scene) {
    let graphics = scene.add.graphics();
    graphics.fillStyle(0x8b4513, 1); // Saddle Brown
    graphics.fillCircle(25, 25, 25);

    graphics.fillStyle(0x654321, 1); // Dark Brown Chips
    for (let i = 0; i < 5; i++) {
        graphics.fillCircle(Phaser.Math.Between(10, 40), Phaser.Math.Between(10, 40), 3);
    }

    let texture = graphics.generateTexture('cookie', 50, 50);
    graphics.destroy();
}

function drawBigSpider(scene) {
    let graphics = scene.add.graphics();
    let size = 100;

    // Body
    graphics.fillStyle(0xff0000, 1);
    graphics.fillCircle(50, 50, 40);

    // Multiple eyes
    for (let i = 0; i < 4; i++) {
        let eyeX = 30 + (i % 2) * 40;
        let eyeY = 30 + Math.floor(i / 2) * 30;
        graphics.fillStyle(0xffffff, 1);
        graphics.fillCircle(eyeX, eyeY, 8);
        graphics.fillStyle(0x000000, 1);
        graphics.fillCircle(eyeX, eyeY, 5);
    }

    // Legs
    graphics.lineStyle(3, 0xff0000, 1);
    for (let i = 0; i < 8; i++) {
        let angle = (i * 45) * Math.PI / 180;
        let endX = 50 + Math.cos(angle) * 60;
        let endY = 50 + Math.sin(angle) * 60;
        graphics.beginPath();
        graphics.moveTo(50, 50);
        graphics.lineTo(endX, endY);
        graphics.strokePath();
    }

    graphics.generateTexture('big_spider', size, size);
    graphics.destroy();
}

function drawBigBird(scene) {
    let graphics = scene.add.graphics();
    let size = 100;

    // Yellow body
    graphics.fillStyle(0xffff00, 1);
    graphics.fillCircle(50, 50, 40);

    // Eyes
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(35, 35, 10);
    graphics.fillCircle(65, 35, 10);
    graphics.fillStyle(0x000000, 1);
    graphics.fillCircle(35, 35, 6);
    graphics.fillCircle(65, 35, 6);

    // Beak
    graphics.fillStyle(0xffa500, 1);
    graphics.fillTriangle(50, 50, 40, 65, 60, 65);

    graphics.generateTexture('big_bird', size, size);
    graphics.destroy();
}


function create(data) {
    if (!audioContext) {
        try {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            gainNode = audioContext.createGain();
            gainNode.connect(audioContext.destination);
        } catch (e) {
            console.warn('AudioContext creation failed:', e);
        }
    }

    // Handle scene restart data
    if (data && data.isDemo) {
        demoMode = true;
        setupGame(this);
    } else if (data && data.isGame) {
        demoMode = false;
        setupGame(this);
    } else {
        // Initial load or full reset

        // Generate textures
        drawCookieMonster(this);
        drawOscar(this);
        drawOscarNoCan(this);
        drawCookie(this);
        drawBanana(this);
        drawCoin(this);
        drawBigSpider(this);
        drawBigBird(this);

        // Input for mode toggle and name entry
        this.input.keyboard.on('keydown', function (event) {
            if (isEnteringName) {
                if (event.keyCode >= 65 && event.keyCode <= 90) { // A-Z
                    if (entryName.length < 3) {
                        entryName += event.key.toUpperCase();
                        entryText.setText(entryName);
                        if (entryName.length === 3) {
                            saveScore(this);
                        }
                    }
                } else if (event.keyCode === 8) { // Backspace
                    entryName = entryName.slice(0, -1);
                    entryText.setText(entryName);
                } else if (event.keyCode === 13) { // Enter
                    if (entryName.length > 0) {
                        saveScore(this);
                    }
                }
                return;
            }

            if (event.key === 'c' || event.key === 's') {
                keyBuffer.push(event.key);
                if (keyBuffer.length > 3) keyBuffer.shift();

                if (keyBuffer.join('') === 'ccc' && !cookieMode) {
                    toggleCookieMode(this);
                    keyBuffer = [];
                } else if (keyBuffer.join('') === 'sss' && cookieMode) {
                    toggleCookieMode(this);
                    keyBuffer = [];
                }
            }

            // RP Easter Egg detection
            if (event.key === 'r' || event.key === 'p') {
                rpBuffer.push(event.key);
                if (rpBuffer.length > 2) rpBuffer.shift();

                if (rpBuffer.join('') === 'rp') {
                    showRPFireworks(this);
                    rpBuffer = [];
                }
            }

            // Konami code detection
            if (event.code === konamiCode[konamiIndex]) {
                konamiIndex++;
                if (konamiIndex === konamiCode.length) {
                    // Konami code completed!
                    toggleCookieMode(this);
                    konamiIndex = 0;
                    // Show brief message
                    let codeText = this.add.text(400, 300, 'CODE ACCEPTED!', { fontSize: '48px', fill: '#00ff00' }).setOrigin(0.5);
                    this.time.delayedCall(1000, () => codeText.destroy());
                }
            } else {
                konamiIndex = 0; // Reset if wrong key
            }
        }, this);

        showStartScreen(this);
    }
}

let startGameHandler;

function showStartScreen(scene) {
    demoMode = false; // Reset demo mode flag
    onStartScreen = true;
    scene.children.removeAll(); // Clear screen
    loadLeaderboard();

    // Create animated starfield for menu
    menuStars = [];
    for (let i = 0; i < 150; i++) {
        let x = Phaser.Math.Between(0, 800);
        let y = Phaser.Math.Between(0, 600);
        let speed = Phaser.Math.FloatBetween(0.5, 3);
        let size = Phaser.Math.Between(1, 3);
        let star = scene.add.circle(x, y, size, 0xffffff, Phaser.Math.FloatBetween(0.3, 1));
        star.speed = speed;
        menuStars.push(star);
    }

    // Add decorative border with glow effect
    let border = scene.add.graphics();
    border.lineStyle(6, 0x00ffff, 0.8);
    border.strokeRoundedRect(50, 20, 700, 560, 10);
    border.lineStyle(3, 0x0088ff, 0.6);
    border.strokeRoundedRect(55, 25, 690, 550, 10);
    border.setDepth(100);

    // Add corner decorations
    for (let corner of [[60, 30], [730, 30], [60, 560], [730, 560]]) {
        let deco = scene.add.graphics();
        deco.fillStyle(0x00ffff, 0.6);
        deco.fillCircle(corner[0], corner[1], 5);
        deco.setDepth(101);

        // Pulse animation
        scene.tweens.add({
            targets: deco,
            alpha: 0.3,
            duration: 1000,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });
    }

    let titleText = scene.add.text(400, 60, 'HIGH SCORES', {
        fontSize: '56px',
        fill: '#00ffff',
        fontStyle: 'bold',
        stroke: '#0088ff',
        strokeThickness: 4
    }).setOrigin(0.5).setDepth(102);

    // Blink effect for title
    scene.tweens.add({
        targets: titleText,
        alpha: 0.5,
        duration: 500,
        ease: 'Linear',
        yoyo: true,
        repeat: -1
    });

    // Trophy/medal icons for top 3
    let medals = ['🥇', '🥈', '🥉'];
    for (let i = 0; i < leaderboard.length; i++) {
        let entry = leaderboard[i];
        let color = i < 3 ? ['#FFD700', '#C0C0C0', '#CD7F32'][i] : '#ffffff';
        let prefix = i < 3 ? medals[i] + ' ' : (i + 1) + '. ';

        scene.add.text(400, 140 + i * 40, prefix + entry.name + ' - ' + entry.score, {
            fontSize: '28px',
            fill: color,
            fontStyle: i < 3 ? 'bold' : 'normal'
        }).setOrigin(0.5).setDepth(102);
    }

    let startText = scene.add.text(400, 550, 'Press SPACE to start', {
        fontSize: '32px',
        fill: '#00ff00',
        fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(102);

    // Blink effect
    scene.tweens.add({
        targets: startText,
        alpha: 0.2,
        duration: 800,
        ease: 'Linear',
        yoyo: true,
        repeat: -1
    });

    // Start Demo Mode Timer (5 seconds idle)
    if (demoTimerEvent) demoTimerEvent.remove();
    demoTimerEvent = scene.time.delayedCall(5000, () => {
        startDemoMode(scene);
    });

    // Input to start game
    if (startGameHandler) {
        scene.input.keyboard.off('keydown-SPACE', startGameHandler);
        scene.input.keyboard.off('keydown-ENTER', startGameHandler);
    }

    startGameHandler = () => {
        if (demoTimerEvent) demoTimerEvent.remove();
        onStartScreen = false;
        scene.input.keyboard.off('keydown-SPACE', startGameHandler);
        scene.input.keyboard.off('keydown-ENTER', startGameHandler);
        scene.scene.restart({ isGame: true });
    };

    scene.input.keyboard.once('keydown-SPACE', startGameHandler);
    scene.input.keyboard.once('keydown-ENTER', startGameHandler);
}

function setupGame(scene) {
    onStartScreen = false;
    scene.children.removeAll(); // Clear screen
    scene.tweens.killAll(); // Kill all tweens
    scene.input.keyboard.removeAllListeners(); // Clear all input listeners
    isGameRunning = true;
    konamiIndex = 0; // Reset Konami code progress
    keyBuffer = []; // Reset key buffer
    rpBuffer = []; // Reset RP easter egg buffer

    // Create starfield
    stars = [];
    for (let i = 0; i < 100; i++) {
        let x = Phaser.Math.Between(0, 800);
        let y = Phaser.Math.Between(0, 600);
        let speed = Phaser.Math.Between(1, 3);
        let star = scene.add.circle(x, y, 2, 0xffffff);
        star.speed = speed; // Attach speed directly to the star object
        stars.push(star);
    }

    if (demoMode) {
        // Add Demo Mode Text
        demoText = scene.add.text(400, 300, 'DEMO MODE', { fontSize: '64px', fill: '#ff0000', alpha: 0.5 }).setOrigin(0.5);
        demoText.setDepth(2000);

        // Add instruction to exit
        let exitText = scene.add.text(400, 500, 'Press SPACE to Start', { fontSize: '32px', fill: '#ffffff' }).setOrigin(0.5);
        exitText.setDepth(2000);

        scene.tweens.add({
            targets: [demoText, exitText],
            alpha: 0.2,
            duration: 1000,
            ease: 'Linear',
            yoyo: true,
            repeat: -1
        });
    }

    player = drawRocket(scene);

    // Set up input keys
    cursors = scene.input.keyboard.createCursorKeys();
    scene.input.keyboard.on('keydown-SPACE', fireBullet, scene);

    // Set up Konami code and mode toggle listener
    scene.input.keyboard.on('keydown', function (event) {
        // Name entry for high score
        if (isEnteringName) {
            if (event.keyCode >= 65 && event.keyCode <= 90) { // A-Z
                if (entryName.length < 3) {
                    entryName += event.key.toUpperCase();
                    entryText.setText(entryName);
                    if (entryName.length === 3) {
                        saveScore(scene);
                    }
                }
            } else if (event.keyCode === 8) { // Backspace
                entryName = entryName.slice(0, -1);
                entryText.setText(entryName);
            } else if (event.keyCode === 13) { // Enter
                if (entryName.length > 0) {
                    saveScore(scene);
                }
            }
            return;
        }

        // CCC/SSS mode toggle
        if (event.key === 'c' || event.key === 's') {
            keyBuffer.push(event.key);
            if (keyBuffer.length > 3) keyBuffer.shift();

            if (keyBuffer.join('') === 'ccc' && !cookieMode) {
                toggleCookieMode(scene);
                keyBuffer = [];
            } else if (keyBuffer.join('') === 'sss' && cookieMode) {
                toggleCookieMode(scene);
                keyBuffer = [];
            }
        }

        // RP Easter Egg detection
        if (event.key === 'r' || event.key === 'p') {
            rpBuffer.push(event.key);
            if (rpBuffer.length > 2) rpBuffer.shift();

            if (rpBuffer.join('') === 'rp') {
                showRPFireworks(scene);
                rpBuffer = [];
            }
        }

        // Konami code detection
        if (event.code === konamiCode[konamiIndex]) {
            konamiIndex++;
            if (konamiIndex === konamiCode.length) {
                // Konami code completed!
                toggleCookieMode(scene);
                konamiIndex = 0;
                // Show brief message
                let codeText = scene.add.text(400, 300, 'CODE ACCEPTED!', { fontSize: '48px', fill: '#00ff00' }).setOrigin(0.5);
                codeText.setDepth(2001);
                scene.time.delayedCall(1000, () => codeText.destroy());
            }
        } else {
            konamiIndex = 0; // Reset if wrong key
        }
    });

    // Create bullets group
    bullets = scene.physics.add.group({
        defaultKey: 'bullet',
        maxSize: 10
    });

    // Create explosions group
    explosions = scene.add.group();

    // Create debris group
    debris = scene.add.group();

    // Draw a single gold coin with a $ sign
    let x = Phaser.Math.Between(0, 800);
    let y = 0; // Start at the top

    gold = scene.physics.add.sprite(x, y, 'coin');
    gold.body.setCircle(25);
    gold.body.setVelocityY(50);

    goldText = scene.add.text(x, y, '$', { fontSize: '32px', fill: '#000000' });
    goldText.setOrigin(0.5);
    goldText.setDepth(1); // Ensure text is above the coin sprite
    goldText.setVisible(!cookieMode);

    // Draw enemies as spaceship spiders
    enemies = scene.physics.add.group();
    let enemy = drawSpider(scene, Phaser.Math.Between(0, 800), 0);
    enemy.body.setVelocityY(enemySpeed);
    enemy.hasTrashCan = true;
    enemies.add(enemy);

    // Set up score and level text
    scoreText = scene.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#ffffff' });
    levelText = scene.add.text(16, 48, 'Level: 1', { fontSize: '32px', fill: '#ffffff' });

    // Create lives icons instead of text
    updateLivesIcons(scene);

    if (demoMode) {
        scoreText.setVisible(false);
        levelText.setVisible(false);
        livesIcons.forEach(icon => icon.setVisible(false));
    }

    // Set up collisions
    scene.physics.add.overlap(player, gold, collectGold, null, scene);
    scene.physics.add.overlap(player, enemies, hitEnemy, null, scene);
    scene.physics.add.overlap(bullets, enemies, hitEnemyWithBullet, null, scene);

    // Boss projectiles group
    bossProjectiles = scene.physics.add.group({
        maxSize: 20
    });
    scene.physics.add.overlap(player, bossProjectiles, hitPlayerWithBossProjectile, null, scene);

    // Add scanlines for CRT effect
    let scanlines = scene.add.graphics();
    scanlines.lineStyle(1, 0x000000, 0.15);
    for (let y = 0; y < 600; y += 4) {
        scanlines.lineBetween(0, y, 800, y);
    }
    scanlines.setDepth(1000); // Ensure scanlines are on top

    // Add border frame
    let border = scene.add.graphics();
    border.lineStyle(4, 0xffffff, 1);
    border.strokeRect(2, 2, 796, 596);
    border.lineStyle(2, 0x00ff00, 1);
    border.strokeRect(6, 6, 788, 588);
    border.setDepth(999);
}

function updateLivesIcons(scene) {
    // Clear existing icons
    if (livesIcons) {
        livesIcons.forEach(icon => {
            if (icon && icon.active) icon.destroy();
        });
    }
    livesIcons = [];

    // Create new icons based on current lives
    for (let i = 0; i < lives; i++) {
        let icon;
        if (cookieMode) {
            icon = scene.add.sprite(750 - (i * 35), 30, 'cookie_monster');
        } else {
            icon = scene.add.sprite(750 - (i * 35), 30, 'rocket');
        }
        icon.setScale(0.5);
        icon.setDepth(1001);
        livesIcons.push(icon);
    }
}

function update() {
    // Update menu starfield if on start screen
    if (onStartScreen) {
        menuStars.forEach(star => {
            star.y += star.speed;
            if (star.y > 600) {
                star.y = 0;
                star.x = Phaser.Math.Between(0, 800);
            }
        });
        return;
    }

    if (!isGameRunning) return;

    // Update game starfield
    stars.forEach(star => {
        star.y += star.speed;
        if (star.y > 600) {
            star.y = 0;
            star.x = Phaser.Math.Between(0, 800);
        }
    });

    // Bonus Round Logic
    if (bonusRoundActive) {
        let delta = this.game.loop.delta;
        bonusTimer -= delta;
        bonusTimerText.setText('BONUS TIME: ' + Math.ceil(bonusTimer / 1000));

        // Spawn falling coins/cookies
        if (Math.random() < 0.05) {
            let x = Phaser.Math.Between(50, 750);
            let coin;
            if (cookieMode) {
                coin = this.physics.add.sprite(x, -20, 'cookie');
            } else {
                coin = this.physics.add.sprite(x, -20, 'coin');
            }
            coin.setVelocityY(200);
            bonusCoins.push(coin);
            this.physics.add.overlap(player, coin, collectBonusCoin, null, this);
        }

        // Cleanup coins
        for (let i = bonusCoins.length - 1; i >= 0; i--) {
            let c = bonusCoins[i];
            if (c.y > 620) {
                c.destroy();
                bonusCoins.splice(i, 1);
            }
        }

        if (bonusTimer <= 0) {
            endBonusRound(this);
        }

        // Allow player movement during bonus round
        if (cursors.left.isDown) {
            player.body.setVelocityX(-playerSpeed);
        } else if (cursors.right.isDown) {
            player.body.setVelocityX(playerSpeed);
        } else {
            player.body.setVelocityX(0);
        }

        // Keep player in bounds
        if (player.x < 25) player.x = 25;
        if (player.x > 775) player.x = 775;

        return; // Skip normal game update
    }

    // Check for Boss Spawn first (priority over bonus round)
    if (score >= nextBossScore && !bossActive && !bonusRoundActive) {
        spawnBoss(this);
    }

    // Check for Bonus Round Trigger
    if (score >= nextBonusScore && !bossActive && !bonusRoundActive) {
        startBonusRound(this);
        return;
    }

    // Demo Mode Logic or Player Control
    if (demoMode) {
        // Demo Mode AI
        let nearestEnemy = null;
        let minDistance = 1000;
        enemies.getChildren().forEach(enemy => {
            let dist = Phaser.Math.Distance.Between(player.x, player.y, enemy.x, enemy.y);
            if (dist < minDistance) {
                minDistance = dist;
                nearestEnemy = enemy;
            }
        });

        if (nearestEnemy) {
            if (player.x < nearestEnemy.x - 10) {
                player.body.setVelocityX(playerSpeed);
            } else if (player.x > nearestEnemy.x + 10) {
                player.body.setVelocityX(-playerSpeed);
            } else {
                player.body.setVelocityX(0);
                fireBullet.call(this);
            }
        } else {
            if (player.x < 390) {
                player.body.setVelocityX(playerSpeed);
            } else if (player.x > 410) {
                player.body.setVelocityX(-playerSpeed);
            } else {
                player.body.setVelocityX(0);
            }
        }

        if (Math.random() < 0.05) fireBullet.call(this);

        // Exit Demo Mode on any key
        let spaceKey = this.input.keyboard.addKey('SPACE');
        let enterKey = this.input.keyboard.addKey('ENTER');
        if (Phaser.Input.Keyboard.JustDown(spaceKey) ||
            Phaser.Input.Keyboard.JustDown(enterKey) ||
            cursors.left.isDown || cursors.right.isDown || cursors.up.isDown || cursors.down.isDown) {
            this.scene.restart({ isGame: true });
            return;
        }
    } else {
        // Normal Player Control
        player.body.setVelocity(0);
        if (cursors.left.isDown) {
            player.body.setVelocityX(-160);
        } else if (cursors.right.isDown) {
            player.body.setVelocityX(160);
        }
        if (cursors.up.isDown) {
            player.body.setVelocityY(-160);
        } else if (cursors.down.isDown) {
            player.body.setVelocityY(160);
        }

        // Fire bullet
        // This was originally tied to SPACE keydown, not continuous update
        // fireBullet.call(this); // Removed as it causes continuous firing
    }

    // Keep player in bounds
    if (player.x < 25) player.x = 25;
    if (player.x > 775) player.x = 775;
    if (player.y < 25) player.y = 25;
    if (player.y > 575) player.y = 575;

    // Update enemy movement
    enemies.getChildren().forEach(enemy => {
        enemy.body.setVelocityY(enemySpeed);
        if (enemy.y > 600) {
            enemy.y = 0;
            enemy.x = Phaser.Math.Between(0, 800);

            // Reset Oscar state
            enemy.hasTrashCan = true;
            if (cookieMode) {
                enemy.setTexture('oscar');
            } else {
                enemy.setTexture('spider');
            }
        }
    });

    // Boss movement and shooting logic
    if (bossActive && boss && boss.active) {
        // Move boss horizontally
        boss.x += bossSpeed * bossDirection;
        if (boss.x <= 50 || boss.x >= 750) {
            bossDirection *= -1;
        }

        // Boss shooting
        bossShootTimer++;
        if (bossShootTimer >= bossShootInterval) {
            bossShootTimer = 0;

            // Create projectile with proper texture
            let texKey = 'boss_proj_' + Date.now();
            let graphics = this.add.graphics();

            if (cookieMode) {
                // Egg
                graphics.fillStyle(0xffffff, 1);
                graphics.fillEllipse(5, 7.5, 10, 15);
            } else {
                // Laser/Web
                graphics.fillStyle(0xff0000, 1);
                graphics.fillRect(0, 0, 5, 15);
            }

            graphics.generateTexture(texKey, 10, 15);
            graphics.destroy();

            let projectile = bossProjectiles.create(boss.x, boss.y + 50, texKey);
            if (projectile) {
                projectile.setActive(true);
                projectile.setVisible(true);
                projectile.body.setVelocityY(300);
            }
        }
    }

    // Update boss projectiles
    bossProjectiles.getChildren().forEach(proj => {
        if (proj.active && proj.y > 600) {
            proj.setActive(false);
            proj.setVisible(false);
        }
    });

    // Update gold movement
    if (gold.y > 600) {
        gold.y = 0;
        gold.x = Phaser.Math.Between(0, 800);
    }

    // Move gold text
    goldText.x = gold.x;
    goldText.y = gold.y;
    goldText.setVisible(!cookieMode); // Hide $ sign in cookie mode

    // Handle invulnerability
    if (invulnerable && this.time.now > lastHitTime + invulnerabilityDuration) {
        invulnerable = false;
        player.setAlpha(1); // Restore player opacity
    }

    // Update bullets
    bullets.children.each(function (b) {
        if (b.active) {
            if (b.y < 0) {
                b.setActive(false);
                b.setVisible(false);
            }
        }
    }.bind(this));

    // Update debris
    debris.children.each(function (d) {
        if (d.active) {
            d.x += d.vx;
            d.y += d.vy;
            d.alpha -= 0.02;
            if (d.alpha <= 0) {
                d.destroy();
            }
        }
    });
}

function fireBullet() {
    if (this.time.now > lastFired + fireDelay && !gameOverText) {
        let bullet = bullets.get(player.x, player.y - 20);
        if (bullet) {
            bullet.setActive(true);
            bullet.setVisible(true);
            bullet.body.setVelocityY(-400);

            // Set correct texture based on mode
            if (cookieMode) {
                bullet.setTexture('banana');
            } else {
                // Ensure bullet texture exists
                if (!this.textures.exists('bullet')) {
                    let graphics = this.add.graphics();
                    graphics.fillStyle(0xffff00, 1);
                    graphics.fillRect(0, 0, 5, 10);
                    graphics.generateTexture('bullet', 5, 10);
                    graphics.destroy();
                }
                bullet.setTexture('bullet');
            }

            lastFired = this.time.now;
            playShootSound();
        }
    }
}

function hitEnemyWithBullet(bullet, enemy) {
    if (bullet.active && enemy.active) {
        bullet.setActive(false);
        bullet.setVisible(false);

        // Capture position for explosion
        let explosionX = enemy.x;
        let explosionY = enemy.y;

        if (cookieMode) {
            bullet.setActive(false);
            bullet.setVisible(false);

            if (enemy.hasTrashCan) {
                enemy.hasTrashCan = false;
                enemy.setTexture('oscar_no_can');
                // Make Oscar drop faster when he loses his trash can
                enemy.body.setVelocityY(enemy.body.velocity.y * 1.5);
                score += 5;
                scoreText.setText('Score: ' + score);

                if (score % 100 === 0) {
                    level += 1;
                    levelText.setText('Level: ' + level);
                    nextLevel(this);
                }
            }
            // If no trash can, do nothing (bullet destroyed, enemy survives)
            return;
        }

        // Reset enemy
        enemy.y = 0;
        enemy.x = Phaser.Math.Between(0, 800);
        enemy.hasTrashCan = true;

        score += 5;
        scoreText.setText('Score: ' + score);

        // Play explosion sound
        playExplosionSound();

        // Create explosion visual
        createExplosion(this, explosionX, explosionY);

        // Create debris (100% chance)
        createDebris(this, explosionX, explosionY);

        if (score % 100 === 0) {
            level += 1;
            levelText.setText('Level: ' + level);
            nextLevel(this);
        }
    }
}

function playExplosionSound() {
    if (!audioContext || !gainNode) return;
    // Generate white noise
    let bufferSize = audioContext.sampleRate * 0.5; // 0.5 seconds
    let buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    let data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
        // Apply decay
        data[i] *= (1 - i / bufferSize);
    }

    let noise = audioContext.createBufferSource();
    noise.buffer = buffer;
    noise.connect(gainNode);
    noise.start();
}

function createExplosion(scene, x, y) {
    let circle = scene.add.circle(x, y, 5, 0xffa500);
    scene.tweens.add({
        targets: circle,
        scale: 4,
        alpha: 0,
        duration: 500,
        onComplete: function () {
            circle.destroy();
        }
    });
}

function createDebris(scene, x, y) {
    for (let i = 0; i < Phaser.Math.Between(5, 10); i++) {
        let d = scene.add.rectangle(x, y, 2, 2, 0x999999);
        d.vx = Phaser.Math.FloatBetween(-2, 2);
        d.vy = Phaser.Math.FloatBetween(-2, 2);
        debris.add(d);
    }
}

function playTone(frequency, duration) {
    if (!audioContext || !gainNode) return;
    let osc = audioContext.createOscillator();
    osc.frequency.setValueAtTime(frequency, audioContext.currentTime);
    osc.connect(gainNode);
    osc.start();

    setTimeout(() => {
        osc.stop();
        osc.disconnect();
    }, duration);
}

function playCollectSound() {
    if (!audioContext || !gainNode) return;
    // Rising tone for coin collection
    let osc = audioContext.createOscillator();
    osc.type = 'square'; // 8-bit square wave
    osc.frequency.setValueAtTime(523, audioContext.currentTime); // C5
    osc.frequency.exponentialRampToValueAtTime(1047, audioContext.currentTime + 0.1); // C6
    osc.connect(gainNode);
    osc.start();
    setTimeout(() => {
        osc.stop();
        osc.disconnect();
    }, 100);
}

function playHitSound() {
    if (!audioContext || !gainNode) return;
    // Harsh descending tone for damage
    let osc = audioContext.createOscillator();
    osc.type = 'sawtooth'; // Harsh 8-bit sound
    osc.frequency.setValueAtTime(200, audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 0.15);
    osc.connect(gainNode);
    osc.start();
    setTimeout(() => {
        osc.stop();
        osc.disconnect();
    }, 150);
}

function playShootSound() {
    if (!audioContext || !gainNode) return;
    // Quick high-pitched beep for shooting
    let osc = audioContext.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(880, audioContext.currentTime); // A5
    osc.connect(gainNode);
    osc.start();
    setTimeout(() => {
        osc.stop();
        osc.disconnect();
    }, 50);
}

function playDeathSound() {
    if (!audioContext || !gainNode) return;
    // Classic descending death sound (Space Invaders style)
    let osc = audioContext.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(400, audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 1.5);
    osc.connect(gainNode);
    osc.start();
    setTimeout(() => {
        osc.stop();
        osc.disconnect();
    }, 1500);
}

function collectGold(player, gold) {
    // Respawn gold at the top with a random x-coordinate
    gold.y = 0;
    gold.x = Phaser.Math.Between(0, 800);
    score += 10;
    scoreText.setText('Score: ' + score);
    playCollectSound(); // Play collect sound
    if (score % 100 === 0) {
        level += 1;
        levelText.setText('Level: ' + level);
        nextLevel(this);
    }
}

function toggleCookieMode(scene) {
    cookieMode = !cookieMode;

    player.setTexture(cookieMode ? 'cookie_monster' : 'rocket');
    gold.setTexture(cookieMode ? 'cookie' : 'coin');
    goldText.setVisible(!cookieMode);

    enemies.getChildren().forEach(enemy => {
        enemy.setTexture(cookieMode ? (enemy.hasTrashCan ? 'oscar' : 'oscar_no_can') : 'spider');
    });

    // Update Lives Icons
    updateLivesIcons(scene);
}

function spawnBoss(scene) {
    bossActive = true;
    bossHp = bossMaxHp;
    bossDirection = 1;
    bossShootTimer = 0;

    let texture = cookieMode ? 'big_bird' : 'big_spider';
    boss = scene.physics.add.sprite(400, 100, texture);
    boss.setCollideWorldBounds(true);

    // Add collision with bullets
    scene.physics.add.overlap(bullets, boss, hitBossWithBullet, null, scene);
    scene.physics.add.overlap(player, boss, hitPlayerWithBoss, null, scene);
}

function hitBossWithBullet(bullet, boss) {
    if (bullet.active && boss.active) {
        bullet.setActive(false);
        bullet.setVisible(false);

        bossHp -= 1;

        // Screen shake on boss hit
        this.cameras.main.shake(100, 0.005);

        if (bossHp <= 0) {
            // Boss defeated
            let explosionX = boss.x;
            let explosionY = boss.y;

            playExplosionSound();
            createExplosion(this, explosionX, explosionY);

            // Big screen shake on boss defeat
            this.cameras.main.shake(300, 0.01);

            // Create more debris for boss
            for (let i = 0; i < 20; i++) {
                createDebris(this, explosionX, explosionY);
            }

            score += 20;
            if (lives < 4) {  // Cap lives at 4
                lives += 1;
            }
            scoreText.setText('Score: ' + score);
            updateLivesIcons(this);

            boss.destroy();
            boss = null;
            bossActive = false;
            bossProjectiles.clear(true, true);  // Clear all boss projectiles
            nextBossScore += 300;  // Next boss at +300 points
            bossMaxHp += 5;  // Each boss gets 5 more HP
        }
    }
}

function hitPlayerWithBoss(player, boss) {
    if (!invulnerable && boss.active) {
        lives -= 1;
        updateLivesIcons(this);
        invulnerable = true;
        player.setAlpha(0.5);

        if (lives === 0) {
            this.physics.pause();
            player.setAlpha(0);
            checkHighScore(this);
        } else {
            // Reset player position
            player.x = 400;
            player.y = 300;

            // Make invulnerable for 2 seconds
            this.time.delayedCall(2000, () => {
                invulnerable = false;
                player.setAlpha(1);
            });
        }
    }
}

function hitPlayerWithBossProjectile(player, projectile) {
    if (!invulnerable && projectile.active) {
        projectile.setActive(false);
        projectile.setVisible(false);

        lives -= 1;
        updateLivesIcons(this);

        if (lives === 0) {
            this.physics.pause();
            player.setAlpha(0);
            checkHighScore(this);
        } else {
            invulnerable = true;
            player.setAlpha(0.5);
            this.time.delayedCall(2000, () => {
                invulnerable = false;
                player.setAlpha(1);
            });
        }
    }
}

function nextLevel(scene) {
    if (level <= 5) {
        enemySpeed += 20; // Increase enemy speed
    } else if (level <= 9) {
        let enemy = drawSpider(scene, Phaser.Math.Between(0, 800), 0);
        enemy.body.setVelocityY(enemySpeed);
        if (cookieMode) enemy.setTexture('oscar');
        enemy.hasTrashCan = true;
        enemies.add(enemy);
    } else if (level == 10) {
        // Create boss enemy
        let bossSize = 200; // 4 times the size (50 * 4)
        let bossSpeed = enemySpeed; // Speed same as in level 5
        let boss = drawSpider(scene, Phaser.Math.Between(0, 800), 0);
        boss.setScale(4); // Make boss 4 times larger
        boss.body.setVelocityY(bossSpeed);
        if (cookieMode) boss.setTexture('oscar');
        boss.hasTrashCan = true;
        enemies.add(boss);
    }

    // Update the speed of existing enemies
    enemies.getChildren().forEach(enemy => {
        enemy.body.setVelocityY(enemySpeed);
    });
}

function hitEnemy(player, enemy) {
    if (cookieMode && !enemy.hasTrashCan) {
        return; // Harmless
    }

    if (!invulnerable) {
        lives -= 1;
        updateLivesIcons(this);
        lastHitTime = this.time.now; // Record the time of the hit
        invulnerable = true;
        player.setAlpha(0.5); // Make player semi-transparent to indicate invulnerability
        playHitSound(); // Play hit sound

        if (lives > 0) {
            // Reset player position
            player.x = 400;
            player.y = 300;
        } else {
            this.physics.pause();
            player.setAlpha(0); // Make player invisible to indicate game over
            checkHighScore(this);
        }
    }
}

function loadLeaderboard() {
    let stored = localStorage.getItem('space_monger_scores');
    if (stored) {
        leaderboard = JSON.parse(stored);
    } else {
        leaderboard = [];
    }
}

function saveLeaderboard() {
    localStorage.setItem('space_monger_scores', JSON.stringify(leaderboard));
}

function checkHighScore(scene) {
    loadLeaderboard();
    if (leaderboard.length < 10 || score > leaderboard[leaderboard.length - 1].score) {
        // High Score!
        onStartScreen = true;
        isEnteringName = true;
        entryName = "";

        // Create animated starfield
        menuStars = [];
        for (let i = 0; i < 150; i++) {
            let x = Phaser.Math.Between(0, 800);
            let y = Phaser.Math.Between(0, 600);
            let speed = Phaser.Math.FloatBetween(0.5, 3);
            let size = Phaser.Math.Between(1, 3);
            let star = scene.add.circle(x, y, size, 0xffffff, Phaser.Math.FloatBetween(0.3, 1));
            star.speed = speed;
            menuStars.push(star);
        }

        // Add decorative border
        let border = scene.add.graphics();
        border.lineStyle(6, 0xffff00, 0.8);
        border.strokeRoundedRect(50, 100, 700, 400, 10);
        border.lineStyle(3, 0xffaa00, 0.6);
        border.strokeRoundedRect(55, 105, 690, 390, 10);
        border.setDepth(100);

        let titleText = scene.add.text(400, 200, 'NEW HIGH SCORE!', {
            fontSize: '56px',
            fill: '#ffff00',
            fontStyle: 'bold',
            stroke: '#ffaa00',
            strokeThickness: 4
        }).setOrigin(0.5).setDepth(102);

        // Pulse effect
        scene.tweens.add({
            targets: titleText,
            scale: 1.1,
            duration: 500,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });

        scene.add.text(400, 280, 'Your Score: ' + score, {
            fontSize: '36px',
            fill: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(102);

        scene.add.text(400, 340, 'Enter Initials:', {
            fontSize: '32px',
            fill: '#00ffff'
        }).setOrigin(0.5).setDepth(102);

        entryText = scene.add.text(400, 420, '', {
            fontSize: '64px',
            fill: '#ffff00',
            fontStyle: 'bold',
            stroke: '#ffaa00',
            strokeThickness: 3
        }).setOrigin(0.5).setDepth(102);
    } else {
        showLeaderboard(scene);
    }
}

function saveScore(scene) {
    isEnteringName = false;
    leaderboard.push({ name: entryName, score: score });
    leaderboard.sort((a, b) => b.score - a.score);
    if (leaderboard.length > 10) {
        leaderboard = leaderboard.slice(0, 10);
    }
    saveLeaderboard();

    scene.children.removeAll(); // Remove all objects
    showLeaderboard(scene);
}

function showLeaderboard(scene) {
    onStartScreen = true;
    scene.children.removeAll(); // Clear screen

    // Create animated starfield
    menuStars = [];
    for (let i = 0; i < 150; i++) {
        let x = Phaser.Math.Between(0, 800);
        let y = Phaser.Math.Between(0, 600);
        let speed = Phaser.Math.FloatBetween(0.5, 3);
        let size = Phaser.Math.Between(1, 3);
        let star = scene.add.circle(x, y, size, 0xffffff, Phaser.Math.FloatBetween(0.3, 1));
        star.speed = speed;
        menuStars.push(star);
    }

    // Add decorative border
    let border = scene.add.graphics();
    border.lineStyle(6, 0xff00ff, 0.8);
    border.strokeRoundedRect(50, 20, 700, 560, 10);
    border.lineStyle(3, 0xff0088, 0.6);
    border.strokeRoundedRect(55, 25, 690, 550, 10);
    border.setDepth(100);

    // Add corner decorations
    for (let corner of [[60, 30], [730, 30], [60, 560], [730, 560]]) {
        let deco = scene.add.graphics();
        deco.fillStyle(0xff00ff, 0.6);
        deco.fillCircle(corner[0], corner[1], 5);
        deco.setDepth(101);

        scene.tweens.add({
            targets: deco,
            alpha: 0.3,
            duration: 1000,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });
    }

    scene.add.text(400, 60, 'GAME OVER', {
        fontSize: '56px',
        fill: '#ff00ff',
        fontStyle: 'bold',
        stroke: '#ff0088',
        strokeThickness: 4
    }).setOrigin(0.5).setDepth(102);

    // Trophy/medal icons for top 3
    let medals = ['🥇', '🥈', '🥉'];
    for (let i = 0; i < leaderboard.length; i++) {
        let entry = leaderboard[i];
        let color = i < 3 ? ['#FFD700', '#C0C0C0', '#CD7F32'][i] : '#ffffff';
        let prefix = i < 3 ? medals[i] + ' ' : (i + 1) + '. ';

        scene.add.text(400, 140 + i * 40, prefix + entry.name + ' - ' + entry.score, {
            fontSize: '28px',
            fill: color,
            fontStyle: i < 3 ? 'bold' : 'normal'
        }).setOrigin(0.5).setDepth(102);
    }

    pressAnyKeyText = scene.add.text(400, 550, 'Press any key to play again', {
        fontSize: '32px',
        fill: '#00ff00',
        fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(102);

    // Blink effect
    scene.tweens.add({
        targets: pressAnyKeyText,
        alpha: 0.2,
        duration: 800,
        ease: 'Linear',
        yoyo: true,
        repeat: -1
    });

    // Small delay before allowing restart to prevent accidental skips
    scene.time.delayedCall(1000, () => {
        scene.input.keyboard.on('keydown', () => {
            if (!isEnteringName) {
                onStartScreen = false;
                resetGame(scene);
            }
        });
    });
}

function startBonusRound(scene) {
    bonusRoundActive = true;
    bonusTimer = 10000; // 10 seconds

    // Clear enemies and projectiles
    enemies.clear(true, true);
    bullets.clear(true, true);
    if (boss) {
        boss.destroy();
        boss = null;
        bossActive = false;
        bossProjectiles.clear(true, true);
    }

    // UI
    bonusTimerText = scene.add.text(400, 300, 'BONUS ROUND!', { fontSize: '64px', fill: '#ffff00' }).setOrigin(0.5);
    scene.tweens.add({
        targets: bonusTimerText,
        y: 100,
        scale: 0.5,
        duration: 1000,
        ease: 'Power2',
        onComplete: () => {
            bonusTimerText.setText('BONUS TIME: 10');
        }
    });
}

function endBonusRound(scene) {
    bonusRoundActive = false;
    if (bonusTimerText) bonusTimerText.destroy();

    // Clear bonus coins
    bonusCoins.forEach(c => c.destroy());
    bonusCoins = [];

    nextBonusScore += 1000;

    // Check if we should spawn a boss after bonus round
    if (score >= nextBossScore && !bossActive) {
        spawnBoss(scene);
    } else {
        // Force spawn a few enemies to restart action immediately
        for (let i = 0; i < level + 2; i++) {
            let enemy = enemies.create(Phaser.Math.Between(0, 800), Phaser.Math.Between(-200, 0), cookieMode ? 'oscar' : 'spider');
            enemy.setVelocityY(enemySpeed);
            enemy.hasTrashCan = true;
        }
    }
}

function collectBonusCoin(player, coin) {
    coin.destroy();
    // Remove from array
    let index = bonusCoins.indexOf(coin);
    if (index > -1) {
        bonusCoins.splice(index, 1);
    }

    score += 50;
    scoreText.setText('Score: ' + score);
    playCollectSound();
}

function startDemoMode(scene) {
    onStartScreen = false;
    scene.scene.restart({ isDemo: true });
}

function showRPFireworks(scene) {
    // Define R and P letter shapes using coordinate points
    const rPoints = [
        // Vertical line
        [0, 0], [0, 10], [0, 20], [0, 30], [0, 40], [0, 50],
        // Top horizontal
        [10, 0], [20, 0], [30, 0],
        // Top curve
        [40, 10], [40, 20],
        // Middle horizontal
        [30, 25], [20, 25], [10, 25],
        // Diagonal leg
        [15, 35], [20, 40], [25, 45], [30, 50]
    ];

    const pPoints = [
        // Vertical line
        [0, 0], [0, 10], [0, 20], [0, 30], [0, 40], [0, 50],
        // Top horizontal
        [10, 0], [20, 0], [30, 0],
        // Top curve
        [40, 10], [40, 20],
        // Bottom curve back
        [30, 25], [20, 25], [10, 25]
    ];

    const colors = [0xff0000, 0xff6600, 0xffff00, 0x00ff00, 0x00ffff, 0x0000ff, 0xff00ff, 0xff0088];

    // Draw R at position (150, 200)
    rPoints.forEach((point, index) => {
        scene.time.delayedCall(index * 30, () => {
            let color = colors[Math.floor(Math.random() * colors.length)];
            createFireworkParticle(scene, 150 + point[0] * 3, 200 + point[1] * 3, color);
        });
    });

    // Draw P at position (350, 200) with delay
    pPoints.forEach((point, index) => {
        scene.time.delayedCall(index * 30 + 500, () => {
            let color = colors[Math.floor(Math.random() * colors.length)];
            createFireworkParticle(scene, 350 + point[0] * 3, 200 + point[1] * 3, color);
        });
    });

    // Show message
    let easterEggText = scene.add.text(400, 500, 'RAMI PINKU!', {
        fontSize: '48px',
        fill: '#ffff00',
        fontStyle: 'bold',
        stroke: '#ff6600',
        strokeThickness: 4
    }).setOrigin(0.5).setDepth(3000);

    // Pulse animation
    scene.tweens.add({
        targets: easterEggText,
        scale: 1.2,
        duration: 300,
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: 5,
        onComplete: () => {
            easterEggText.destroy();
        }
    });
}

function createFireworkParticle(scene, x, y, color) {
    // Create main burst particle
    let particle = scene.add.circle(x, y, 8, color).setDepth(2500);

    // Sparkle effect
    scene.tweens.add({
        targets: particle,
        scale: 1.5,
        alpha: 0,
        duration: 1000,
        ease: 'Power2',
        onComplete: () => particle.destroy()
    });

    // Create small explosions around the main particle
    for (let i = 0; i < 8; i++) {
        let angle = (i / 8) * Math.PI * 2;
        let distance = Phaser.Math.Between(20, 40);
        let sparkX = x + Math.cos(angle) * distance;
        let sparkY = y + Math.sin(angle) * distance;

        let spark = scene.add.circle(x, y, 3, color).setDepth(2500);

        scene.tweens.add({
            targets: spark,
            x: sparkX,
            y: sparkY,
            alpha: 0,
            scale: 0.5,
            duration: 800,
            ease: 'Power2',
            onComplete: () => spark.destroy()
        });
    }

    // Play a tone for each firework
    playTone(Phaser.Math.Between(400, 800), 100);
}

function startCountdown(scene) {
    countdownValue = 5;
    countdownText = scene.add.text(400, 350, countdownValue, { fontSize: '64px', fill: '#ffffff' }).setOrigin(0.5);
    scene.time.addEvent({
        delay: 1000,
        callback: updateCountdown,
        callbackScope: scene,
        repeat: countdownValue - 1
    });
}

function updateCountdown() {
    countdownValue -= 1;
    countdownText.setText(countdownValue);
    if (countdownValue === 0) {
        pressAnyKeyText = this.add.text(400, 400, 'Press any key to play again', { fontSize: '32px', fill: '#ffffff' }).setOrigin(0.5);
        this.input.keyboard.on('keydown', resetGame, this);
    }
}

function resetGame(scene) {
    score = 0;
    level = 1;
    lives = 3;
    invulnerable = false;
    enemySpeed = 100;
    isEnteringName = false;
    nextBossScore = 300; // Reset boss spawn threshold
    bossMaxHp = 10; // Reset boss max HP
    konamiIndex = 0; // Reset Konami code progress
    keyBuffer = []; // Reset key buffer
    rpBuffer = []; // Reset RP easter egg buffer

    // Restart scene properly to reset everything
    scene.scene.restart();
}


