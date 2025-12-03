import pygame
import random
import json
import os

# Initialize Pygame
pygame.init()

# Set up display
WIDTH, HEIGHT = 800, 600
win = pygame.display.set_mode((WIDTH, HEIGHT))
win = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("Digger Game")

# Load sound
try:
    explosion_sound = pygame.mixer.Sound("explosion.wav")
except:
    print("Warning: explosion.wav not found")
    explosion_sound = None

# Colors
BLACK = (0, 0, 0)
WHITE = (255, 255, 255)
GREEN = (0, 255, 0)
RED = (255, 0, 0)
YELLOW = (255, 255, 0)
BLUE = (0, 0, 255)
BROWN = (139, 69, 19)
DARK_BROWN = (101, 67, 33)
OSCAR_GREEN = (85, 107, 47)

# Player properties
player_size = 50
player_pos = [WIDTH // 2, HEIGHT // 2]
player_speed = 5
player_shape = [
    (1, 0), (2, 0), (3, 0), 
    (0, 1), (4, 1), 
    (1, 2), (2, 2), (3, 2), 
    (1, 3), (3, 3), 
    (0, 4), (4, 4)
]

# Enemy properties
enemy_size = 50
enemy_speed = 10
enemy_shape = [
    (0, 0), (4, 0),
    (0, 1), (4, 1),
    (2, 2),
    (1, 3), (3, 3),
    (1, 4), (3, 4)
]
enemies = [{"pos": [random.randint(0, WIDTH - enemy_size), 0], "start_delay": random.randint(30, 90), "has_trash_can": True}]

# Gold properties
gold_size = 50

# Boss properties
boss_active = False
boss = None
boss_hp = 10
boss_max_hp = 10
boss_speed = 3
boss_direction = 1
boss_shoot_timer = 0
boss_shoot_interval = 60
boss_projectiles = []
next_boss_score = 300
gold_pos = [random.randint(0, WIDTH - gold_size), 0]
gold_speed = 10
gold_start_delay = random.randint(60, 120)  # Delay between 2 and 4 seconds

# Starfield properties
stars = []
for _ in range(100):
    x = random.randint(0, WIDTH)
    y = random.randint(0, HEIGHT)
    speed = random.randint(1, 3)
    stars.append([x, y, speed])

# Bullet properties
bullet_size = 5
bullet_speed = 10
bullets = []
last_shot_time = 0
shoot_delay = 250  # Milliseconds

# Explosions and Debris
explosions = []  # List of [x, y, radius, max_radius, alpha]
debris = []      # List of [x, y, vx, vy, life]

# Game variables
score = 0
level = 1
lives = 3
game_over = False
clock = pygame.time.Clock()
level_up_display_time = 0
cookie_mode = False
key_buffer = []

cookie_mode = False
key_buffer = []

LEADERBOARD_FILE = "leaderboard.json"

def load_leaderboard():
    if os.path.exists(LEADERBOARD_FILE):
        try:
            with open(LEADERBOARD_FILE, "r") as f:
                return json.load(f)
        except:
            return []
    return []

def save_leaderboard(scores):
    with open(LEADERBOARD_FILE, "w") as f:
        json.dump(scores, f)

def draw_leaderboard(scores, message="Press any key to restart"):
    win.fill(BLACK)
    font_title = pygame.font.SysFont("comicsans", 60)
    title = font_title.render("Leaderboard", True, WHITE)
    win.blit(title, (WIDTH // 2 - title.get_width() // 2, 50))
    
    font_entry = pygame.font.SysFont("comicsans", 40)
    for i, entry in enumerate(scores[:10]):
        text = font_entry.render(f"{i+1}. {entry['name']} - {entry['score']}", True, WHITE)
        win.blit(text, (WIDTH // 2 - text.get_width() // 2, 150 + i * 40))
    
    font_msg = pygame.font.SysFont("comicsans", 30)
    msg = font_msg.render(message, True, WHITE)
    win.blit(msg, (WIDTH // 2 - msg.get_width() // 2, HEIGHT - 50))
    pygame.display.update()

def get_high_score_name(score):
    name = ""
    font = pygame.font.SysFont("comicsans", 60)
    
    while True:
        win.fill(BLACK)
        title = font.render("New High Score!", True, WHITE)
        score_text = font.render(f"Score: {score}", True, WHITE)
        prompt = font.render("Enter Initials:", True, WHITE)
        name_text = font.render(name, True, YELLOW)
        
        win.blit(title, (WIDTH // 2 - title.get_width() // 2, 100))
        win.blit(score_text, (WIDTH // 2 - score_text.get_width() // 2, 200))
        win.blit(prompt, (WIDTH // 2 - prompt.get_width() // 2, 300))
        win.blit(name_text, (WIDTH // 2 - name_text.get_width() // 2, 400))
        pygame.display.update()
        
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                exit()
            if event.type == pygame.KEYDOWN:
                if event.key == pygame.K_RETURN:
                    if len(name) > 0:
                        return name
                elif event.key == pygame.K_BACKSPACE:
                    name = name[:-1]
                elif len(name) < 3 and event.unicode.isalpha():
                    name += event.unicode.upper()
                
                if len(name) == 3:
                    pygame.time.delay(500) # Small pause to see the 3rd letter
                    return name

def show_game_over(score):
    scores = load_leaderboard()
    
    # Check if high score
    is_high_score = False
    if len(scores) < 10 or score > scores[-1]['score']:
        is_high_score = True
        
    if is_high_score:
        name = get_high_score_name(score)
        scores.append({"name": name, "score": score})
        scores.sort(key=lambda x: x['score'], reverse=True)
        scores = scores[:10]
        save_leaderboard(scores)
    
    draw_leaderboard(scores)
    wait_for_key_press()
    if (player_pos[0] < obj_pos[0] < player_pos[0] + player_size or 
        player_pos[0] < obj_pos[0] + obj_size < player_pos[0] + player_size):
        if (player_pos[1] < obj_pos[1] < player_pos[1] + player_size or 
            player_pos[1] < obj_pos[1] + obj_size < player_pos[1] + player_size):
            return True
    return False

def update_position(pos, size, speed, start_delay):
    if start_delay > 0:
        start_delay -= 1
    else:
        pos[1] += speed
        if pos[1] > HEIGHT:
            pos[0] = random.randint(0, WIDTH - size)
            pos[1] = 0
    return start_delay

def draw_spaceship(surface, pos, size, spaceship_shape, color, has_trash_can=True):
    if cookie_mode and color == BLUE: # Player
        # Draw Cookie Monster
        pygame.draw.circle(surface, BLUE, (pos[0] + size//2, pos[1] + size//2), size//2)
        # Eyes
        pygame.draw.circle(surface, WHITE, (pos[0] + size//3, pos[1] + size//3), size//6)
        pygame.draw.circle(surface, WHITE, (pos[0] + 2*size//3, pos[1] + size//3), size//6)
        # Pupils
        pygame.draw.circle(surface, BLACK, (pos[0] + size//3 + random.randint(-2, 2), pos[1] + size//3), size//10)
        pygame.draw.circle(surface, BLACK, (pos[0] + 2*size//3 + random.randint(-2, 2), pos[1] + size//3), size//10)
    elif cookie_mode and color == RED: # Enemy
        # Draw Oscar
        if has_trash_can:
            pygame.draw.rect(surface, (100, 100, 100), (pos[0], pos[1] + size//2, size, size//2)) # Trash can
        
        # Oscar head/body
        pygame.draw.circle(surface, OSCAR_GREEN, (pos[0] + size//2, pos[1] + size//2), size//2) 
        
        # Eyes
        pygame.draw.circle(surface, WHITE, (pos[0] + size//3, pos[1] + size//2), size//8)
        pygame.draw.circle(surface, WHITE, (pos[0] + 2*size//3, pos[1] + size//2), size//8)
        pygame.draw.circle(surface, BLACK, (pos[0] + size//3, pos[1] + size//2), size//12)
        pygame.draw.circle(surface, BLACK, (pos[0] + 2*size//3, pos[1] + size//2), size//12)
        # Unibrow
        pygame.draw.line(surface, (50, 50, 50), (pos[0] + size//4, pos[1] + size//3), (pos[0] + 3*size//4, pos[1] + size//3), 3)
    else:
        for (x, y) in spaceship_shape:
            pygame.draw.rect(surface, color, (pos[0] + x * size // 5, pos[1] + y * size // 5, size // 5, size // 5))

def draw_boss(surface, pos, size, mode):
    if mode:  # Cookie mode - Big Bird
        # Yellow body
        pygame.draw.circle(surface, (255, 255, 0), (pos[0] + size//2, pos[1] + size//2), size//2)
        # Eyes
        pygame.draw.circle(surface, WHITE, (pos[0] + size//3, pos[1] + size//3), size//8)
        pygame.draw.circle(surface, WHITE, (pos[0] + 2*size//3, pos[1] + size//3), size//8)
        pygame.draw.circle(surface, BLACK, (pos[0] + size//3, pos[1] + size//3), size//12)
        pygame.draw.circle(surface, BLACK, (pos[0] + 2*size//3, pos[1] + size//3), size//12)
        # Beak
        pygame.draw.polygon(surface, (255, 165, 0), [
            (pos[0] + size//2, pos[1] + size//2),
            (pos[0] + size//2 - 10, pos[1] + size//2 + 15),
            (pos[0] + size//2 + 10, pos[1] + size//2 + 15)
        ])
    else:  # Space mode - Big Spider
        # Body
        pygame.draw.circle(surface, RED, (pos[0] + size//2, pos[1] + size//2), size//2)
        # Multiple eyes
        for i in range(4):
            eye_x = pos[0] + size//4 + (i % 2) * size//2
            eye_y = pos[1] + size//4 + (i // 2) * size//3
            pygame.draw.circle(surface, WHITE, (eye_x, eye_y), size//10)
            pygame.draw.circle(surface, BLACK, (eye_x, eye_y), size//15)
        # Legs
        for i in range(8):
            angle = i * 45
            end_x = pos[0] + size//2 + int(size * 0.8 * pygame.math.Vector2(1, 0).rotate(angle).x)
            end_y = pos[1] + size//2 + int(size * 0.8 * pygame.math.Vector2(1, 0).rotate(angle).y)
            pygame.draw.line(surface, RED, (pos[0] + size//2, pos[1] + size//2), (end_x, end_y), 3)

def draw_gold(surface, pos, size):
    if cookie_mode:
        # Draw Cookie
        pygame.draw.circle(surface, BROWN, (pos[0] + size // 2, pos[1] + size // 2), size // 2)
        # Chips
        for _ in range(5):
            chip_x = pos[0] + random.randint(5, size - 5)
            chip_y = pos[1] + random.randint(5, size - 5)
            pygame.draw.circle(surface, DARK_BROWN, (chip_x, chip_y), 3)
    else:
        # Draw gold coin
        pygame.draw.circle(surface, YELLOW, (pos[0] + size // 2, pos[1] + size // 2), size // 2)
        # Draw $ sign
        font = pygame.font.SysFont("comicsans", size // 2)
        text = font.render("$", True, BLACK)
        text_rect = text.get_rect(center=(pos[0] + size // 2, pos[1] + size // 2))
        surface.blit(text, text_rect)

def show_game_over(score):
    win.fill(BLACK)
    font = pygame.font.SysFont("comicsans", 75)
    score_text = font.render("Score: " + str(score), True, WHITE)
    game_over_text = font.render("Game Over", True, WHITE)
    win.blit(score_text, (WIDTH // 2 - score_text.get_width() // 2, HEIGHT // 2 - score_text.get_height() // 2 - score_text.get_height() - 10))
    win.blit(game_over_text, (WIDTH // 2 - game_over_text.get_width() // 2, HEIGHT // 2 - game_over_text.get_height() // 2))
    pygame.display.update()
    wait_for_key_press()

def wait_for_key_press():
    waiting = True
    while waiting:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                exit()
            if event.type == pygame.KEYDOWN:
                waiting = False

def show_start_screen():
    win.fill(BLACK)
    font_title = pygame.font.SysFont("comicsans", 75)
    font_instruction = pygame.font.SysFont("comicsans", 40)
    
    title = font_title.render("Space Shooter", True, WHITE)
    instruction = font_instruction.render("Press any key to start", True, WHITE)
    
    win.blit(title, (WIDTH // 2 - title.get_width() // 2, HEIGHT // 2 - title.get_height() // 2 - 50))
    win.blit(instruction, (WIDTH // 2 - instruction.get_width() // 2, HEIGHT // 2 + 50))
    pygame.display.update()
    wait_for_key_press()

def next_level():
    global level, enemy_speed, enemies, score, level_up_display_time
    level += 1
    level_up_display_time = pygame.time.get_ticks()  # Record the time when the level up occurs
    if level <= 5:
        enemy_speed += 2
    elif level <= 9:
        enemies.append({"pos": [random.randint(0, WIDTH - enemy_size), 0], "start_delay": random.randint(30, 90), "has_trash_can": True})
    elif level == 10:
        enemy_speed += 5  # Boss ship speed boost

def show_level_up():
    font = pygame.font.SysFont("comicsans", 75)
    level_up_text = font.render(f"Level {level}", True, WHITE)
    win.blit(level_up_text, (WIDTH // 2 - level_up_text.get_width() // 2, HEIGHT // 2 - level_up_text.get_height() // 2))

def show_stats():
    font = pygame.font.SysFont("comicsans", 30)
    stats_text = font.render(f"Level {level} Score {score}", True, WHITE)
    win.blit(stats_text, (10, 10))  # Positioning the text at the top-left corner

def show_lives():
    for i in range(lives):
        pygame.draw.rect(win, BLUE, (WIDTH - (i + 1) * 40, 10, 30, 30))
    
    # Draw scanlines for CRT effect
    for y in range(0, HEIGHT, 4):
        pygame.draw.line(win, (0, 0, 0, 30), (0, y), (WIDTH, y), 1)

# Main game loop
show_start_screen()

running = True
while running:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False
        if event.type == pygame.KEYDOWN:
            if event.unicode in ['c', 's']:
                key_buffer.append(event.unicode)
                if len(key_buffer) > 3:
                    key_buffer.pop(0)
                
                if key_buffer == ['c', 'c', 'c']:
                    cookie_mode = True
                    key_buffer = []
                elif key_buffer == ['s', 's', 's']:
                    cookie_mode = False
                    key_buffer = []

    if game_over:
        show_game_over(score)
        show_start_screen() # Show start screen again
        
        # Reset game variables
        player_pos = [WIDTH // 2, HEIGHT // 2]
        score = 0
        lives = 3
        level = 1
        enemy_speed = 2
        enemies = [{"pos": [random.randint(0, WIDTH - enemy_size), 0], "start_delay": random.randint(30, 90), "has_trash_can": True}]
        bullets = []
        explosions = []
        debris = []
        game_over = False
        gold_start_delay = random.randint(100, 300)
        
        # Clear any pending key presses from the start screen
        pygame.event.clear()
        continue # Skip the rest of the loop for this frame

    keys = pygame.key.get_pressed()
    if keys[pygame.K_LEFT] and player_pos[0] > 0:
        player_pos[0] -= player_speed
    if keys[pygame.K_RIGHT] and player_pos[0] < WIDTH - player_size:
        player_pos[0] += player_speed
    if keys[pygame.K_UP] and player_pos[1] > 0:
        player_pos[1] -= player_speed
    if keys[pygame.K_DOWN] and player_pos[1] < HEIGHT - player_size:
        player_pos[1] += player_speed
    if keys[pygame.K_SPACE]:
        current_time = pygame.time.get_ticks()
        if current_time - last_shot_time > shoot_delay:
            bullets.append([player_pos[0] + player_size // 2 - bullet_size // 2, player_pos[1]])
            last_shot_time = current_time

    # Update bullets
    for bullet in bullets:
        bullet[1] -= bullet_speed
        if bullet[1] < 0:
            bullets.remove(bullet)

    # Boss logic
    if score >= next_boss_score and not boss_active:
        boss_active = True
        boss_size = 100
        boss = {
            'pos': [WIDTH // 2 - boss_size // 2, 50],
            'size': boss_size
        }
        boss_hp = boss_max_hp
        boss_direction = 1
        boss_shoot_timer = 0
    
    if boss_active and boss:
        # Move boss horizontally
        boss['pos'][0] += boss_speed * boss_direction
        if boss['pos'][0] <= 0 or boss['pos'][0] >= WIDTH - boss['size']:
            boss_direction *= -1
        
        # Boss shooting
        boss_shoot_timer += 1
        if boss_shoot_timer >= boss_shoot_interval:
            boss_shoot_timer = 0
            boss_projectiles.append([boss['pos'][0] + boss['size']//2, boss['pos'][1] + boss['size']])
        
        # Check bullet collision with boss
        for bullet in bullets[:]:
            if (boss['pos'][0] < bullet[0] < boss['pos'][0] + boss['size'] and
                boss['pos'][1] < bullet[1] < boss['pos'][1] + boss['size']):
                bullets.remove(bullet)
                boss_hp -= 1
                if boss_hp <= 0:
                    # Boss defeated
                    explosions.append([boss['pos'][0] + boss['size']//2, boss['pos'][1] + boss['size']//2, 10, 80, 255])
                    if explosion_sound:
                        explosion_sound.play()
                    for _ in range(20):
                        debris.append([
                            boss['pos'][0] + boss['size']//2,
                            boss['pos'][1] + boss['size']//2,
                            random.uniform(-5, 5),
                            random.uniform(-5, 5),
                            random.randint(30, 60)
                        ])
                    score += 20
                    lives += 1
                    boss_active = False
                    boss = None
                    boss_projectiles.clear()  # Clear all boss projectiles
                    next_boss_score += 300  # Next boss at +300 points
                break
        
        # Check boss collision with player
        if check_collision(player_pos, player_size, boss['pos'], boss['size']):
            if not (cookie_mode and False):  # Boss always damages in both modes
                lives -= 1
                if lives == 0:
                    game_over = True
                else:
                    player_pos = [WIDTH // 2, HEIGHT // 2]
    
    # Update boss projectiles
    for proj in boss_projectiles[:]:
        proj[1] += 5
        if proj[1] > HEIGHT:
            boss_projectiles.remove(proj)
        elif check_collision(player_pos, player_size, [proj[0], proj[1]], 10):
            boss_projectiles.remove(proj)
            lives -= 1
            if lives == 0:
                game_over = True
            else:
                player_pos = [WIDTH // 2, HEIGHT // 2]

    for enemy in enemies:
        old_y = enemy['pos'][1]
        enemy['start_delay'] = update_position(enemy['pos'], enemy_size, enemy_speed, enemy['start_delay'])
        
        # Check if enemy wrapped around (was near bottom, now at top)
        if old_y > HEIGHT - enemy_speed * 2 and enemy['pos'][1] == 0:
             enemy['has_trash_can'] = True

        if check_collision(player_pos, player_size, enemy['pos'], enemy_size):
            if cookie_mode and not enemy.get('has_trash_can', True):
                pass # Harmless
            else:
                lives -= 1
                if lives == 0:
                    game_over = True
                else:
                    player_pos = [WIDTH // 2, HEIGHT // 2]  # Reset player position
        
        # Check bullet collisions
        for bullet in bullets:
            if (enemy['pos'][0] < bullet[0] < enemy['pos'][0] + enemy_size and
                enemy['pos'][1] < bullet[1] < enemy['pos'][1] + enemy_size):
                
                if cookie_mode:
                    bullets.remove(bullet)
                    if enemy.get('has_trash_can', True):
                        enemy['has_trash_can'] = False
                        score += 5
                        if score % 10 == 0:
                            next_level()
                    break # Bullet destroyed, enemy survives (or already harmless)
                
                bullets.remove(bullet)
                
                # Explosion
                explosions.append([enemy['pos'][0] + enemy_size//2, enemy['pos'][1] + enemy_size//2, 5, 40, 255])
                if explosion_sound:
                    explosion_sound.play()
                
                # Debris (100% chance)
                for _ in range(random.randint(5, 10)):
                    debris.append([
                        enemy['pos'][0] + enemy_size//2,
                        enemy['pos'][1] + enemy_size//2,
                        random.uniform(-3, 3),
                        random.uniform(-3, 3),
                        random.randint(20, 40)
                    ])

                enemy['pos'] = [random.randint(0, WIDTH - enemy_size), 0]
                enemy['start_delay'] = 0
                enemy['has_trash_can'] = True # Reset for new spawn
                score += 5
                if score % 10 == 0:
                    next_level()
                break

    gold_start_delay = update_position(gold_pos, gold_size, gold_speed, gold_start_delay)
    if check_collision(player_pos, player_size, gold_pos, gold_size):
        score += 1
        gold_pos = [random.randint(0, WIDTH - gold_size), 0]
        gold_start_delay = random.randint(60, 120)
        if score % 10 == 0:
            next_level()

    # Fill background
    win.fill(BLACK)

    # Draw and update stars
    for star in stars:
        star[1] += star[2]
        if star[1] > HEIGHT:
            star[1] = 0
            star[0] = random.randint(0, WIDTH)
        pygame.draw.circle(win, WHITE, (star[0], star[1]), 2)

    # Draw player
    draw_spaceship(win, player_pos, player_size, player_shape, BLUE)

    # Draw bullets
    for bullet in bullets:
        if cookie_mode:
            # Draw Banana
            pygame.draw.arc(win, YELLOW, (bullet[0], bullet[1], bullet_size*3, bullet_size*3), 3.14, 6.28, 3)
        else:
            pygame.draw.rect(win, YELLOW, (bullet[0], bullet[1], bullet_size, bullet_size * 2))
    
    # Draw boss projectiles
    for proj in boss_projectiles:
        if cookie_mode:
            # Egg
            pygame.draw.ellipse(win, WHITE, (proj[0], proj[1], 10, 15))
        else:
            # Web/Laser
            pygame.draw.rect(win, (255, 0, 0), (proj[0], proj[1], 5, 15))

    # Draw and update explosions
    for explosion in explosions[:]:
        pygame.draw.circle(win, (255, 165, 0), (explosion[0], explosion[1]), int(explosion[2]))
        explosion[2] += 2  # Expand
        if explosion[2] >= explosion[3]:
            explosions.remove(explosion)

    # Draw and update debris
    for d in debris[:]:
        d[0] += d[2]
        d[1] += d[3]
        d[4] -= 1
        if d[4] <= 0:
            debris.remove(d)
        else:
            pygame.draw.line(win, (150, 150, 150), (d[0], d[1]), (d[0] + d[2]*2, d[1] + d[3]*2), 2)

    # Draw enemies
    for enemy in enemies:
        if enemy['start_delay'] <= 0:
            draw_spaceship(win, enemy['pos'], enemy_size, enemy_shape, RED, enemy.get('has_trash_can', True))
    
    # Draw boss
    if boss_active and boss:
        draw_boss(win, boss['pos'], boss['size'], cookie_mode)
        # Draw HP bar
        bar_width = 200
        bar_height = 20
        bar_x = WIDTH // 2 - bar_width // 2
        bar_y = 10
        pygame.draw.rect(win, RED, (bar_x, bar_y, bar_width, bar_height))
        pygame.draw.rect(win, GREEN, (bar_x, bar_y, int(bar_width * (boss_hp / boss_max_hp)), bar_height))
        pygame.draw.rect(win, WHITE, (bar_x, bar_y, bar_width, bar_height), 2)

    # Draw gold
    if gold_start_delay <= 0:
        draw_gold(win, gold_pos, gold_size)

    # Show stats
    show_stats()

    # Show lives
    show_lives()

    # Show level up indication if within 2 seconds of level up
    if pygame.time.get_ticks() - level_up_display_time < 2000:
        show_level_up()

    # Update display
    pygame.display.update()

    # Tick clock
    clock.tick(30)

if __name__ == "__main__":
    show_game_over(score)
    pygame.quit()