/**
 * 高画质打砖块游戏 (Arkanoid风格)
 * 包含粒子效果、光照、阴影等高级视觉效果
 */

class BrickBreakerGame {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.canvas.width = 800;
        this.canvas.height = 600;
        this.canvas.style.background = '#000';
        this.ctx = this.canvas.getContext('2d');
        this.engine = new GameEngine(this.canvas);
        
        // 游戏状态
        this.gameState = 'menu'; // menu, playing, paused, gameOver
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.particles = [];
        
        // 挡板
        this.paddle = {
            x: this.canvas.width / 2,
            y: this.canvas.height - 40,
            width: 120,
            height: 15,
            speed: 8,
            color: '#00ff88'
        };
        
        // 球
        this.ball = {
            x: this.canvas.width / 2,
            y: this.canvas.height - 60,
            radius: 8,
            vx: 4,
            vy: -4,
            trail: [],
            maxTrailLength: 10
        };
        
        // 砖块
        this.bricks = [];
        this.brickRows = 8;
        this.brickCols = 12;
        this.brickWidth = 60;
        this.brickHeight = 25;
        this.brickPadding = 5;
        this.brickOffsetTop = 80;
        this.brickOffsetLeft = 35;
        
        // 道具系统
        this.powerUps = [];
        this.activePowerUps = {
            multiBall: false,
            bigPaddle: false,
            slowBall: false
        };
        this.powerUpTimers = {};
        
        // 特效
        this.screenShake = 0;
        this.flashEffect = 0;
        
        this.setupControls();
        this.initBricks();
        this.gameLoop();
    }
    
    setupControls() {
        this.mouseX = this.canvas.width / 2;
        
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouseX = e.clientX - rect.left;
        });
        
        this.canvas.addEventListener('click', () => {
            if (this.gameState === 'menu' || this.gameState === 'gameOver') {
                this.startGame();
            } else if (this.gameState === 'playing') {
                this.launchBall();
            }
        });
        
        // 键盘控制
        this.keys = {};
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            if (e.key === ' ') {
                e.preventDefault();
                if (this.gameState === 'playing') {
                    this.launchBall();
                }
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
    }
    
    initBricks() {
        this.bricks = [];
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff', '#5f27cd'];
        
        for (let r = 0; r < this.brickRows; r++) {
            for (let c = 0; c < this.brickCols; c++) {
                const brick = {
                    x: c * (this.brickWidth + this.brickPadding) + this.brickOffsetLeft,
                    y: r * (this.brickHeight + this.brickPadding) + this.brickOffsetTop,
                    width: this.brickWidth,
                    height: this.brickHeight,
                    color: colors[r % colors.length],
                    hits: Math.floor(r / 2) + 1,
                    maxHits: Math.floor(r / 2) + 1,
                    visible: true,
                    glowIntensity: 0
                };
                this.bricks.push(brick);
            }
        }
    }
    
    launchBall() {
        if (this.ball.vx === 0 && this.ball.vy === 0) {
            this.ball.vx = (Math.random() - 0.5) * 4;
            this.ball.vy = -4;
        }
    }
    
    update() {
        if (this.gameState !== 'playing') return;
        
        this.updatePaddle();
        this.updateBall();
        this.updatePowerUps();
        this.updateEffects();
        this.checkCollisions();
        this.checkLevelComplete();
    }
    
    updatePaddle() {
        // 鼠标控制
        this.paddle.x = this.mouseX;
        
        // 键盘控制
        if (this.keys['arrowleft'] || this.keys['a']) {
            this.paddle.x -= this.paddle.speed;
        }
        if (this.keys['arrowright'] || this.keys['d']) {
            this.paddle.x += this.paddle.speed;
        }
        
        // 限制挡板位置
        this.paddle.x = Math.max(this.paddle.width / 2, 
                                Math.min(this.canvas.width - this.paddle.width / 2, this.paddle.x));
        
        // 如果球还在挡板上，跟随挡板移动
        if (this.ball.vx === 0 && this.ball.vy === 0) {
            this.ball.x = this.paddle.x;
        }
    }
    
    updateBall() {
        // 更新球的轨迹
        this.ball.trail.push({ x: this.ball.x, y: this.ball.y });
        if (this.ball.trail.length > this.ball.maxTrailLength) {
            this.ball.trail.shift();
        }
        
        // 更新球的位置
        this.ball.x += this.ball.vx;
        this.ball.y += this.ball.vy;
        
        // 球的边界碰撞
        if (this.ball.x - this.ball.radius <= 0 || this.ball.x + this.ball.radius >= this.canvas.width) {
            this.ball.vx = -this.ball.vx;
            this.ball.x = Math.max(this.ball.radius, Math.min(this.canvas.width - this.ball.radius, this.ball.x));
            this.createBounceEffect(this.ball.x, this.ball.y);
        }
        
        if (this.ball.y - this.ball.radius <= 0) {
            this.ball.vy = -this.ball.vy;
            this.ball.y = this.ball.radius;
            this.createBounceEffect(this.ball.x, this.ball.y);
        }
        
        // 球掉落检测
        if (this.ball.y - this.ball.radius > this.canvas.height) {
            this.lives--;
            this.screenShake = 20;
            this.engine.explosion(this.ball.x, this.canvas.height - 50, 15, '#ff4444');
            
            if (this.lives <= 0) {
                this.gameState = 'gameOver';
            } else {
                this.resetBall();
            }
        }
    }
    
    updatePowerUps() {
        // 更新道具位置
        for (let i = this.powerUps.length - 1; i >= 0; i--) {
            const powerUp = this.powerUps[i];
            powerUp.y += powerUp.speed;
            powerUp.rotation += 0.1;
            
            // 道具掉落检测
            if (powerUp.y > this.canvas.height) {
                this.powerUps.splice(i, 1);
                continue;
            }
            
            // 道具与挡板碰撞检测
            if (this.checkPowerUpCollision(powerUp)) {
                this.activatePowerUp(powerUp.type);
                this.powerUps.splice(i, 1);
                this.engine.explosion(powerUp.x, powerUp.y, 10, powerUp.color);
            }
        }
        
        // 更新道具计时器
        Object.keys(this.powerUpTimers).forEach(powerUp => {
            this.powerUpTimers[powerUp]--;
            if (this.powerUpTimers[powerUp] <= 0) {
                this.deactivatePowerUp(powerUp);
            }
        });
    }
    
    updateEffects() {
        if (this.screenShake > 0) {
            this.screenShake--;
        }
        if (this.flashEffect > 0) {
            this.flashEffect--;
        }
    }
    
    checkCollisions() {
        // 球与挡板碰撞
        if (this.ball.vy > 0 && 
            this.ball.x > this.paddle.x - this.paddle.width/2 && 
            this.ball.x < this.paddle.x + this.paddle.width/2 &&
            this.ball.y + this.ball.radius > this.paddle.y &&
            this.ball.y - this.ball.radius < this.paddle.y + this.paddle.height) {
            
            const hitPos = (this.ball.x - this.paddle.x) / (this.paddle.width/2);
            this.ball.vx = hitPos * 5;
            this.ball.vy = -Math.abs(this.ball.vy);
            
            this.createBounceEffect(this.ball.x, this.paddle.y);
            this.engine.addLight(this.ball.x, this.paddle.y, 100, '#00ff88', 0.5);
        }
        
        // 球与砖块碰撞
        this.bricks.forEach(brick => {
            if (!brick.visible) return;
            
            if (this.ball.x + this.ball.radius > brick.x &&
                this.ball.x - this.ball.radius < brick.x + brick.width &&
                this.ball.y + this.ball.radius > brick.y &&
                this.ball.y - this.ball.radius < brick.y + brick.height) {
                
                brick.hits--;
                brick.glowIntensity = 1;
                
                if (brick.hits <= 0) {
                    brick.visible = false;
                    this.score += brick.maxHits * 100;
                    this.screenShake = 10;
                    this.flashEffect = 5;
                    
                    // 创建爆炸效果
                    this.engine.explosion(brick.x + brick.width/2, brick.y + brick.height/2, 15, brick.color);
                    
                    // 随机生成道具
                    if (Math.random() < 0.2) {
                        this.spawnPowerUp(brick.x + brick.width/2, brick.y + brick.height/2);
                    }
                } else {
                    this.score += 50;
                    this.engine.addLight(brick.x + brick.width/2, brick.y + brick.height/2, 80, brick.color, 0.3);
                }
                
                // 反弹球
                this.ball.vy = -this.ball.vy;
                this.createBounceEffect(this.ball.x, this.ball.y);
            }
        });
    }
    
    checkPowerUpCollision(powerUp) {
        return powerUp.x > this.paddle.x - this.paddle.width/2 &&
               powerUp.x < this.paddle.x + this.paddle.width/2 &&
               powerUp.y + powerUp.size > this.paddle.y &&
               powerUp.y - powerUp.size < this.paddle.y + this.paddle.height;
    }
    
    activatePowerUp(type) {
        this.activePowerUps[type] = true;
        this.powerUpTimers[type] = 300; // 5秒
        
        switch (type) {
            case 'bigPaddle':
                this.paddle.width = 200;
                break;
            case 'slowBall':
                this.ball.vx *= 0.5;
                this.ball.vy *= 0.5;
                break;
            case 'multiBall':
                // 创建额外的球
                for (let i = 0; i < 2; i++) {
                    this.createExtraBall();
                }
                break;
        }
    }
    
    deactivatePowerUp(type) {
        this.activePowerUps[type] = false;
        delete this.powerUpTimers[type];
        
        switch (type) {
            case 'bigPaddle':
                this.paddle.width = 120;
                break;
        }
    }
    
    spawnPowerUp(x, y) {
        const types = ['bigPaddle', 'slowBall', 'multiBall'];
        const colors = ['#00ff88', '#ffaa00', '#ff44ff'];
        const type = types[Math.floor(Math.random() * types.length)];
        
        this.powerUps.push({
            x: x,
            y: y,
            size: 15,
            type: type,
            color: colors[types.indexOf(type)],
            speed: 2,
            rotation: 0
        });
    }
    
    createExtraBall() {
        // 这里简化处理，实际游戏中应该创建多个球实例
        this.engine.createParticle(this.ball.x, this.ball.y, {
            vx: (Math.random() - 0.5) * 6,
            vy: -Math.abs(this.ball.vy) + (Math.random() - 0.5) * 2,
            life: 1,
            color: '#88ff88',
            size: 8
        });
    }
    
    createBounceEffect(x, y) {
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 * i) / 8;
            const speed = Math.random() * 3 + 1;
            this.engine.createParticle(x, y, {
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 0.3,
                color: '#ffffff',
                size: Math.random() * 2 + 1
            });
        }
    }
    
    resetBall() {
        this.ball.x = this.paddle.x;
        this.ball.y = this.paddle.y - 30;
        this.ball.vx = 0;
        this.ball.vy = 0;
        this.ball.trail = [];
    }
    
    checkLevelComplete() {
        const visibleBricks = this.bricks.filter(brick => brick.visible);
        if (visibleBricks.length === 0) {
            this.level++;
            this.initBricks();
            this.resetBall();
            this.engine.explosion(this.canvas.width/2, this.canvas.height/2, 30, '#44ff44');
        }
    }
    
    render() {
        // 应用屏幕震动效果
        if (this.screenShake > 0) {
            const shakeX = (Math.random() - 0.5) * this.screenShake;
            const shakeY = (Math.random() - 0.5) * this.screenShake;
            this.ctx.save();
            this.ctx.translate(shakeX, shakeY);
        }
        
        // 清空画布
        this.ctx.fillStyle = '#0a0a0a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 渲染背景星空
        this.renderStarfield();
        
        // 渲染砖块
        this.renderBricks();
        
        // 渲染球轨迹
        this.renderBallTrail();
        
        // 渲染球
        this.renderBall();
        
        // 渲染挡板
        this.renderPaddle();
        
        // 渲染道具
        this.renderPowerUps();
        
        // 渲染UI
        this.renderUI();
        
        // 渲染特效
        this.renderEffects();
        
        // 渲染引擎效果
        this.engine.render();
        
        if (this.screenShake > 0) {
            this.ctx.restore();
        }
        
        // 渲染游戏状态界面
        if (this.gameState === 'menu') {
            this.renderMenu();
        } else if (this.gameState === 'gameOver') {
            this.renderGameOver();
        }
    }
    
    renderStarfield() {
        this.ctx.fillStyle = '#ffffff';
        for (let i = 0; i < 100; i++) {
            const x = (i * 37) % this.canvas.width;
            const y = (i * 73 + this.engine.time * 20) % this.canvas.height;
            const size = (i % 3) + 1;
            this.ctx.globalAlpha = 0.3 + (i % 5) * 0.1;
            this.ctx.fillRect(x, y, size, size);
        }
        this.ctx.globalAlpha = 1;
    }
    
    renderBricks() {
        this.bricks.forEach(brick => {
            if (!brick.visible) return;
            
            // 更新发光效果
            if (brick.glowIntensity > 0) {
                brick.glowIntensity -= 0.05;
            }
            
            // 渲染砖块发光效果
            if (brick.glowIntensity > 0) {
                this.ctx.save();
                this.ctx.shadowBlur = 20 * brick.glowIntensity;
                this.ctx.shadowColor = brick.color;
                this.ctx.globalAlpha = brick.glowIntensity;
                this.ctx.fillStyle = brick.color;
                this.ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
                this.ctx.restore();
            }
            
            // 渲染砖块主体
            const gradient = this.ctx.createLinearGradient(brick.x, brick.y, brick.x, brick.y + brick.height);
            gradient.addColorStop(0, brick.color);
            gradient.addColorStop(1, this.darkenColor(brick.color, 0.3));
            
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
            
            // 渲染砖块边框
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(brick.x, brick.y, brick.width, brick.height);
            
            // 渲染剩余生命值
            if (brick.hits < brick.maxHits) {
                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                const healthBarWidth = (brick.width - 10) * (brick.hits / brick.maxHits);
                this.ctx.fillRect(brick.x + 5, brick.y + brick.height - 8, healthBarWidth, 3);
            }
        });
    }
    
    renderBallTrail() {
        this.ctx.save();
        for (let i = 0; i < this.ball.trail.length; i++) {
            const point = this.ball.trail[i];
            const alpha = (i + 1) / this.ball.trail.length;
            this.ctx.globalAlpha = alpha * 0.5;
            this.ctx.fillStyle = '#88ffff';
            this.ctx.beginPath();
            this.ctx.arc(point.x, point.y, this.ball.radius * alpha, 0, Math.PI * 2);
            this.ctx.fill();
        }
        this.ctx.restore();
    }
    
    renderBall() {
        // 球的发光效果
        this.ctx.save();
        this.ctx.shadowBlur = 20;
        this.ctx.shadowColor = '#88ffff';
        
        // 球的主体
        const gradient = this.ctx.createRadialGradient(
            this.ball.x - 3, this.ball.y - 3, 0,
            this.ball.x, this.ball.y, this.ball.radius
        );
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(1, '#44aaff');
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
    }
    
    renderPaddle() {
        // 挡板发光效果
        this.ctx.save();
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = this.paddle.color;
        
        // 挡板主体
        const gradient = this.ctx.createLinearGradient(
            this.paddle.x - this.paddle.width/2, this.paddle.y,
            this.paddle.x - this.paddle.width/2, this.paddle.y + this.paddle.height
        );
        gradient.addColorStop(0, this.paddle.color);
        gradient.addColorStop(1, this.darkenColor(this.paddle.color, 0.3));
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(this.paddle.x - this.paddle.width/2, this.paddle.y, this.paddle.width, this.paddle.height);
        
        // 挡板边框
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(this.paddle.x - this.paddle.width/2, this.paddle.y, this.paddle.width, this.paddle.height);
        
        this.ctx.restore();
    }
    
    renderPowerUps() {
        this.powerUps.forEach(powerUp => {
            this.ctx.save();
            this.ctx.translate(powerUp.x, powerUp.y);
            this.ctx.rotate(powerUp.rotation);
            
            // 道具发光效果
            this.ctx.shadowBlur = 15;
            this.ctx.shadowColor = powerUp.color;
            
            // 道具主体
            this.ctx.fillStyle = powerUp.color;
            this.ctx.fillRect(-powerUp.size/2, -powerUp.size/2, powerUp.size, powerUp.size);
            
            // 道具图标
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = 'bold 12px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(this.getPowerUpIcon(powerUp.type), 0, 4);
            
            this.ctx.restore();
        });
    }
    
    renderUI() {
        // UI背景
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.fillRect(10, 10, 200, 100);
        
        // 分数和生命
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 20px Arial';
        this.ctx.fillText(`分数: ${this.score}`, 20, 35);
        this.ctx.fillText(`生命: ${this.lives}`, 20, 60);
        this.ctx.fillText(`等级: ${this.level}`, 20, 85);
        
        // 道具状态
        let yOffset = 120;
        Object.keys(this.activePowerUps).forEach(powerUp => {
            if (this.activePowerUps[powerUp]) {
                this.ctx.fillStyle = this.getPowerUpColor(powerUp);
                this.ctx.fillText(`${this.getPowerUpName(powerUp)}: ${Math.ceil(this.powerUpTimers[powerUp]/60)}s`, 
                                20, yOffset);
                yOffset += 25;
            }
        });
    }
    
    renderEffects() {
        // 闪光效果
        if (this.flashEffect > 0) {
            this.ctx.fillStyle = `rgba(255, 255, 255, ${this.flashEffect * 0.1})`;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }
    
    renderMenu() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('打砖块游戏', this.canvas.width/2, this.canvas.height/2 - 50);
        
        this.ctx.font = '24px Arial';
        this.ctx.fillText('移动鼠标控制挡板', this.canvas.width/2, this.canvas.height/2 + 20);
        this.ctx.fillText('点击开始游戏', this.canvas.width/2, this.canvas.height/2 + 60);
        
        this.ctx.textAlign = 'left';
    }
    
    renderGameOver() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#ff4444';
        this.ctx.font = 'bold 48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('游戏结束!', this.canvas.width/2, this.canvas.height/2 - 50);
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '32px Arial';
        this.ctx.fillText(`最终分数: ${this.score}`, this.canvas.width/2, this.canvas.height/2 + 20);
        this.ctx.fillText(`到达等级: ${this.level}`, this.canvas.width/2, this.canvas.height/2 + 60);
        this.ctx.fillText('点击重新开始', this.canvas.width/2, this.canvas.height/2 + 100);
        
        this.ctx.textAlign = 'left';
    }
    
    // 工具函数
    darkenColor(color, factor) {
        const hex = color.replace('#', '');
        const r = Math.floor(parseInt(hex.substr(0, 2), 16) * (1 - factor));
        const g = Math.floor(parseInt(hex.substr(2, 2), 16) * (1 - factor));
        const b = Math.floor(parseInt(hex.substr(4, 2), 16) * (1 - factor));
        return `rgb(${r}, ${g}, ${b})`;
    }
    
    getPowerUpIcon(type) {
        const icons = {
            bigPaddle: '↔',
            slowBall: '🐌',
            multiBall: '⚡'
        };
        return icons[type] || '?';
    }
    
    getPowerUpName(type) {
        const names = {
            bigPaddle: '大挡板',
            slowBall: '慢速球',
            multiBall: '多重球'
        };
        return names[type] || type;
    }
    
    getPowerUpColor(type) {
        const colors = {
            bigPaddle: '#00ff88',
            slowBall: '#ffaa00',
            multiBall: '#ff44ff'
        };
        return colors[type] || '#ffffff';
    }
    
    startGame() {
        this.gameState = 'playing';
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.initBricks();
        this.resetBall();
        this.powerUps = [];
        this.activePowerUps = {
            multiBall: false,
            bigPaddle: false,
            slowBall: false
        };
        this.powerUpTimers = {};
    }
    
    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
    
    getCanvas() {
        return this.canvas;
    }
    
    initializeRenderer() {
        // 重新设置画布尺寸和渲染器
        const rect = this.canvas.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
            this.canvas.width = 800;
            this.canvas.height = 600;
            this.ctx = this.canvas.getContext('2d');
            this.engine = new GameEngine(this.canvas);
            
            // 强制重新渲染一帧
            this.render();
        }
    }
}

// 导出游戏类
window.BrickBreakerGame = BrickBreakerGame;