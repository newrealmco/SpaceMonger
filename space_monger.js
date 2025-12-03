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
let livesIcons = []; // Array to hold life icon sprites
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

function toggleCookieMode(scene) {
    cookieMode = !cookieMode;

    if (!player) return;

    // Update Player
    player.setTexture(cookieMode ? 'cookie_monster' : 'rocket');

    // Update Gold
    if (gold) gold.setTexture(cookieMode ? 'cookie' : 'coin');

    // Update Gold Text
    if (goldText) goldText.setVisible(!cookieMode);

    // Update Enemies
    if (enemies) {
        enemies.getChildren().forEach(enemy => {
            enemy.setTexture(cookieMode ? (enemy.hasTrashCan ? 'oscar' : 'oscar_no_can') : 'spider');
        });
    }
}

function create() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    gainNode = audioContext.createGain();
    gainNode.connect(audioContext.destination);

    // Create starfield
    // Moved to startGame

    // Generate textures
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

function showStartScreen(scene) {
    scene.children.removeAll(); // Clear screen
    loadLeaderboard();

    let titleText = scene.add.text(400, 50, 'HIGH SCORES', { fontSize: '48px', fill: '#ffffff' }).setOrigin(0.5);

    // Blink effect for title
    scene.tweens.add({
        targets: titleText,
        alpha: 0.3,
        duration: 500,
        ease: 'Linear',
        yoyo: true,
        repeat: -1
    });

    for (let i = 0; i < leaderboard.length; i++) {
        let entry = leaderboard[i];
        scene.add.text(400, 120 + i * 40, (i + 1) + '. ' + entry.name + ' - ' + entry.score, { fontSize: '32px', fill: '#ffffff' }).setOrigin(0.5);
    }

    let startText = scene.add.text(400, 550, 'Press SPACE to start', { fontSize: '32px', fill: '#ffffff' }).setOrigin(0.5);

    // Blink effect
    scene.tweens.add({
        targets: startText,
        alpha: 0,
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
    scene.input.keyboard.once('keydown-SPACE', () => {
        if (demoTimerEvent) demoTimerEvent.remove();
        startGame(scene);
    });
}

function startGame(scene) {
    scene.children.removeAll(); // Clear screen
    isGameRunning = true;

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

    player = drawRocket(scene);

    // Set up input keys
    cursors = scene.input.keyboard.createCursorKeys();
    scene.input.keyboard.on('keydown-SPACE', fireBullet, scene);

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
    livesIcons.forEach(icon => icon.destroy());
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
    if (!isGameRunning) return;

    // Update starfield
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
            player.setVelocityX(-playerSpeed);
        } else if (cursors.right.isDown) {
            player.setVelocityX(playerSpeed);
        } else {
            player.setVelocityX(0);
        }

        // Keep player in bounds
        if (player.x < 25) player.x = 25;
        if (player.x > 775) player.x = 775;

        return; // Skip normal game update
    }

    // Check for Bonus Round Trigger
    if (score >= nextBonusScore && !bossActive) {
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
                player.setVelocityX(playerSpeed);
            } else if (player.x > nearestEnemy.x + 10) {
                player.setVelocityX(-playerSpeed);
            } else {
                player.setVelocityX(0);
                fireBullet.call(this);
            }
        } else {
            if (player.x < 390) {
                player.setVelocityX(playerSpeed);
            } else if (player.x > 410) {
                player.setVelocityX(-playerSpeed);
            } else {
                player.setVelocityX(0);
            }
        }

        if (Math.random() < 0.05) fireBullet.call(this);

        if (this.input.keyboard.checkDown(this.input.keyboard.addKey('SPACE'), 1000) ||
            cursors.left.isDown || cursors.right.isDown || cursors.up.isDown || cursors.down.isDown) {
            resetGame(this);
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

    // Boss logic
    if (score >= nextBossScore && !bossActive) {
        spawnBoss(this);
    }

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
            lives += 1;
            scoreText.setText('Score: ' + score);
            updateLivesIcons(this);

            boss.destroy();
            boss = null;
            bossActive = false;
            bossProjectiles.clear(true, true);  // Clear all boss projectiles
            nextBossScore += 300;  // Next boss at +300 points
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
        isEnteringName = true;
        entryName = "";

        scene.add.text(400, 200, 'New High Score!', { fontSize: '48px', fill: '#ffffff' }).setOrigin(0.5);
        scene.add.text(400, 300, 'Enter Initials:', { fontSize: '32px', fill: '#ffffff' }).setOrigin(0.5);
        entryText = scene.add.text(400, 400, '', { fontSize: '64px', fill: '#ffff00' }).setOrigin(0.5);
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
    scene.children.removeAll(); // Clear screen

    scene.add.text(400, 50, 'Leaderboard', { fontSize: '48px', fill: '#ffffff' }).setOrigin(0.5);

    for (let i = 0; i < leaderboard.length; i++) {
        let entry = leaderboard[i];
        scene.add.text(400, 120 + i * 40, (i + 1) + '. ' + entry.name + ' - ' + entry.score, { fontSize: '32px', fill: '#ffffff' }).setOrigin(0.5);
    }

    pressAnyKeyText = scene.add.text(400, 550, 'Press any key to play again', { fontSize: '32px', fill: '#ffffff' }).setOrigin(0.5);

    // Small delay before allowing restart to prevent accidental skips
    scene.time.delayedCall(1000, () => {
        scene.input.keyboard.on('keydown', () => {
            if (!isEnteringName) resetGame(scene);
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

    // Force spawn a few enemies to restart action immediately
    for (let i = 0; i < level + 2; i++) {
        let enemy = enemies.create(Phaser.Math.Between(0, 800), Phaser.Math.Between(-200, 0), cookieMode ? 'oscar' : 'spider');
        enemy.setVelocityY(enemySpeed);
        enemy.hasTrashCan = true;
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
    demoMode = true;
    startGame(scene);

    // Add Demo Mode Text
    demoText = scene.add.text(400, 100, 'DEMO MODE', { fontSize: '48px', fill: '#ff0000' }).setOrigin(0.5);
    demoText.setDepth(2000);

    scene.tweens.add({
        targets: demoText,
        alpha: 0,
        duration: 500,
        ease: 'Linear',
        yoyo: true,
        repeat: -1
    });
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

    // Restart scene properly to reset everything
    scene.scene.restart();
}


