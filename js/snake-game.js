/**
 * 高画质贪吃蛇游戏 (Snake)
 * 包含3D效果、粒子系统、动态光照等高级视觉效果
 */

class SnakeGame {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.canvas.width = 800;
        this.canvas.height = 600;
        this.ctx = this.canvas.getContext('2d');
        this.engine = new GameEngine(this.canvas);
        
        // 游戏状态
        this.gameState = 'menu'; // menu, playing, paused, gameOver
        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('snakeHighScore') || '0');
        this.gameSpeed = 150; // 毫秒
        this.lastUpdate = 0;
        
        // 网格设置
        this.gridSize = 20;
        this.tileCount = {
            x: Math.floor(this.canvas.width / this.gridSize),
            y: Math.floor(this.canvas.height / this.gridSize)
        };
        
        // 蛇
        this.snake = [
            { x: 15, y: 15 }
        ];
        this.dx = 0;
        this.dy = 0;
        this.snakeTrail = [];
        this.maxTrailLength = 8;
        
        // 障碍物
        this.obstacles = [];
        this.generateObstacles();
        
        // 食物（必须在障碍物初始化之后）
        this.food = this.generateFood();
        this.foodParticles = [];
        this.foodGlow = 0;
        
        // 特效
        this.screenShake = 0;
        this.backgroundOffset = 0;
        this.pulseEffect = 0;
        
        // 控制
        this.keys = {};
        this.setupControls();
        
        this.gameLoop();
    }
    
    setupControls() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            
            if (this.gameState === 'playing') {
                switch (e.key.toLowerCase()) {
                    case 'arrowup':
                    case 'w':
                        if (this.dy !== 1) {
                            this.dx = 0;
                            this.dy = -1;
                        }
                        break;
                    case 'arrowdown':
                    case 's':
                        if (this.dy !== -1) {
                            this.dx = 0;
                            this.dy = 1;
                        }
                        break;
                    case 'arrowleft':
                    case 'a':
                        if (this.dx !== 1) {
                            this.dx = -1;
                            this.dy = 0;
                        }
                        break;
                    case 'arrowright':
                    case 'd':
                        if (this.dx !== -1) {
                            this.dx = 1;
                            this.dy = 0;
                        }
                        break;
                    case ' ':
                        this.gameState = 'paused';
                        e.preventDefault();
                        break;
                }
            } else if (this.gameState === 'paused' && e.key === ' ') {
                this.gameState = 'playing';
                e.preventDefault();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
        
        // 点击开始游戏
        this.canvas.addEventListener('click', () => {
            if (this.gameState === 'menu' || this.gameState === 'gameOver') {
                this.startGame();
            }
        });
    }
    
    generateFood() {
        let food;
        do {
            food = {
                x: Math.floor(Math.random() * this.tileCount.x),
                y: Math.floor(Math.random() * this.tileCount.y)
            };
        } while (this.isCollision(food.x, food.y) || this.isObstacle(food.x, food.y));
        
        return food;
    }
    
    generateObstacles() {
        this.obstacles = [];
        const numObstacles = Math.floor(this.level / 2) + 3;
        
        for (let i = 0; i < numObstacles; i++) {
            let obstacle;
            do {
                obstacle = {
                    x: Math.floor(Math.random() * this.tileCount.x),
                    y: Math.floor(Math.random() * this.tileCount.y)
                };
            } while (
                this.isCollision(obstacle.x, obstacle.y) ||
                this.isFood(obstacle.x, obstacle.y) ||
                (Math.abs(obstacle.x - 15) < 3 && Math.abs(obstacle.y - 15) < 3)
            );
            
            this.obstacles.push(obstacle);
        }
    }
    
    update(currentTime) {
        if (this.gameState !== 'playing') return;
        
        // 控制游戏速度
        if (currentTime - this.lastUpdate < this.gameSpeed) return;
        this.lastUpdate = currentTime;
        
        // 如果蛇没有移动方向，不更新位置
        if (this.dx === 0 && this.dy === 0) return;
        
        // 更新蛇的位置
        const head = { x: this.snake[0].x + this.dx, y: this.snake[0].y + this.dy };
        
        // 边界检测
        if (head.x < 0 || head.x >= this.tileCount.x || 
            head.y < 0 || head.y >= this.tileCount.y) {
            this.gameOver();
            return;
        }
        
        // 自身碰撞检测
        if (this.isCollision(head.x, head.y)) {
            this.gameOver();
            return;
        }
        
        // 障碍物碰撞检测
        if (this.isObstacle(head.x, head.y)) {
            this.gameOver();
            return;
        }
        
        // 添加新的头部
        this.snake.unshift(head);
        
        // 食物检测
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.food = this.generateFood();
            this.foodGlow = 1;
            this.createFoodEffect();
            
            // 增加游戏速度
            this.gameSpeed = Math.max(50, this.gameSpeed - 2);
            
            // 每吃5个食物生成新障碍物
            if (this.score % 50 === 0) {
                this.generateObstacles();
            }
        } else {
            this.snake.pop();
        }
        
        // 更新特效
        this.updateEffects();
    }
    
    updateEffects() {
        // 更新食物发光效果
        if (this.foodGlow > 0) {
            this.foodGlow -= 0.02;
        }
        
        // 更新屏幕震动
        if (this.screenShake > 0) {
            this.screenShake--;
        }
        
        // 更新脉冲效果
        this.pulseEffect = Math.sin(this.engine.time * 3) * 0.5 + 0.5;
        
        // 更新蛇轨迹
        this.snakeTrail.unshift({ x: this.snake[0].x, y: this.snake[0].y });
        if (this.snakeTrail.length > this.maxTrailLength) {
            this.snakeTrail.pop();
        }
        
        // 更新食物粒子
        for (let i = this.foodParticles.length - 1; i >= 0; i--) {
            const particle = this.foodParticles[i];
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life -= 0.02;
            
            if (particle.life <= 0) {
                this.foodParticles.splice(i, 1);
            }
        }
    }
    
    createFoodEffect() {
        // 创建食物爆炸粒子
        for (let i = 0; i < 15; i++) {
            const angle = (Math.PI * 2 * i) / 15;
            const speed = Math.random() * 3 + 1;
            this.foodParticles.push({
                x: this.food.x * this.gridSize + this.gridSize / 2,
                y: this.food.y * this.gridSize + this.gridSize / 2,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1,
                color: `hsl(${Math.random() * 60 + 30}, 100%, 60%)`
            });
        }
        
        // 添加引擎粒子效果
        this.engine.explosion(
            this.food.x * this.gridSize + this.gridSize / 2,
            this.food.y * this.gridSize + this.gridSize / 2,
            12,
            '#44ff44'
        );
    }
    
    gameOver() {
        this.gameState = 'gameOver';
        this.screenShake = 30;
        
        // 创建蛇死亡效果
        this.snake.forEach((segment, index) => {
            setTimeout(() => {
                this.engine.explosion(
                    segment.x * this.gridSize + this.gridSize / 2,
                    segment.y * this.gridSize + this.gridSize / 2,
                    5,
                    '#ff4444'
                );
            }, index * 50);
        });
        
        // 更新最高分
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('snakeHighScore', this.highScore.toString());
        }
    }
    
    isCollision(x, y) {
        return this.snake.some(segment => segment.x === x && segment.y === y);
    }
    
    isFood(x, y) {
        return this.food.x === x && this.food.y === y;
    }
    
    isObstacle(x, y) {
        return this.obstacles.some(obstacle => obstacle.x === x && obstacle.y === y);
    }
    
    render() {
        // 应用屏幕震动
        if (this.screenShake > 0) {
            const shakeX = (Math.random() - 0.5) * this.screenShake;
            const shakeY = (Math.random() - 0.5) * this.screenShake;
            this.ctx.save();
            this.ctx.translate(shakeX, shakeY);
        }
        
        // 渲染背景
        this.renderBackground();
        
        // 渲染网格
        this.renderGrid();
        
        // 渲染障碍物
        this.renderObstacles();
        
        // 渲染蛇轨迹
        this.renderSnakeTrail();
        
        // 渲染蛇
        this.renderSnake();
        
        // 渲染食物
        this.renderFood();
        
        // 渲染食物粒子
        this.renderFoodParticles();
        
        // 渲染UI
        this.renderUI();
        
        // 渲染引擎效果
        this.engine.render();
        
        if (this.screenShake > 0) {
            this.ctx.restore();
        }
        
        // 渲染游戏状态界面
        if (this.gameState === 'menu') {
            this.renderMenu();
        } else if (this.gameState === 'paused') {
            this.renderPaused();
        } else if (this.gameState === 'gameOver') {
            this.renderGameOver();
        }
    }
    
    renderBackground() {
        // 动态背景
        const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
        const hue = (this.engine.time * 20) % 360;
        gradient.addColorStop(0, `hsl(${hue}, 30%, 10%)`);
        gradient.addColorStop(1, `hsl(${(hue + 60) % 360}, 30%, 5%)`);
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 背景网格线
        this.ctx.strokeStyle = `rgba(255, 255, 255, ${0.1 + this.pulseEffect * 0.05})`;
        this.ctx.lineWidth = 1;
        
        for (let x = 0; x < this.canvas.width; x += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        
        for (let y = 0; y < this.canvas.height; y += this.gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }
    
    renderGrid() {
        // 渲染游戏区域边框
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    renderObstacles() {
        this.obstacles.forEach(obstacle => {
            const x = obstacle.x * this.gridSize;
            const y = obstacle.y * this.gridSize;
            
            // 障碍物发光效果
            this.ctx.save();
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = '#ff4444';
            
            // 障碍物主体
            const gradient = this.ctx.createRadialGradient(
                x + this.gridSize/2, y + this.gridSize/2, 0,
                x + this.gridSize/2, y + this.gridSize/2, this.gridSize/2
            );
            gradient.addColorStop(0, '#ff8888');
            gradient.addColorStop(1, '#cc4444');
            
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(x + 2, y + 2, this.gridSize - 4, this.gridSize - 4);
            
            // 危险标记
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = 'bold 16px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('!', x + this.gridSize/2, y + this.gridSize/2 + 5);
            
            this.ctx.restore();
        });
    }
    
    renderSnakeTrail() {
        this.snakeTrail.forEach((point, index) => {
            const alpha = (this.snakeTrail.length - index) / this.snakeTrail.length * 0.3;
            const size = (this.gridSize * alpha) * 0.8;
            
            this.ctx.save();
            this.ctx.globalAlpha = alpha;
            this.ctx.fillStyle = '#44ff44';
            this.ctx.fillRect(
                point.x * this.gridSize + (this.gridSize - size) / 2,
                point.y * this.gridSize + (this.gridSize - size) / 2,
                size, size
            );
            this.ctx.restore();
        });
    }
    
    renderSnake() {
        this.snake.forEach((segment, index) => {
            const x = segment.x * this.gridSize;
            const y = segment.y * this.gridSize;
            
            // 蛇头发光效果
            if (index === 0) {
                this.ctx.save();
                this.ctx.shadowBlur = 15;
                this.ctx.shadowColor = '#88ff88';
            }
            
            // 蛇身渐变
            const gradient = this.ctx.createRadialGradient(
                x + this.gridSize/2, y + this.gridSize/2, 0,
                x + this.gridSize/2, y + this.gridSize/2, this.gridSize/2
            );
            
            if (index === 0) {
                // 蛇头
                gradient.addColorStop(0, '#88ff88');
                gradient.addColorStop(1, '#44cc44');
            } else {
                // 蛇身
                const brightness = 1 - (index / this.snake.length) * 0.3;
                gradient.addColorStop(0, `rgba(136, 255, 136, ${brightness})`);
                gradient.addColorStop(1, `rgba(68, 204, 68, ${brightness})`);
            }
            
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(x + 1, y + 1, this.gridSize - 2, this.gridSize - 2);
            
            // 蛇头眼睛
            if (index === 0) {
                this.ctx.fillStyle = '#ffffff';
                this.ctx.fillRect(x + 6, y + 6, 3, 3);
                this.ctx.fillRect(x + 11, y + 6, 3, 3);
                
                this.ctx.fillStyle = '#000000';
                this.ctx.fillRect(x + 7, y + 7, 1, 1);
                this.ctx.fillRect(x + 12, y + 7, 1, 1);
                
                this.ctx.restore();
            }
        });
    }
    
    renderFood() {
        const x = this.food.x * this.gridSize;
        const y = this.food.y * this.gridSize;
        
        // 食物发光效果
        this.ctx.save();
        this.ctx.shadowBlur = 20 + this.foodGlow * 10;
        this.ctx.shadowColor = '#ffff44';
        
        // 食物脉冲效果
        const pulseSize = this.gridSize * (0.8 + this.pulseEffect * 0.2);
        const offset = (this.gridSize - pulseSize) / 2;
        
        // 食物主体
        const gradient = this.ctx.createRadialGradient(
            x + this.gridSize/2, y + this.gridSize/2, 0,
            x + this.gridSize/2, y + this.gridSize/2, pulseSize/2
        );
        gradient.addColorStop(0, '#ffff88');
        gradient.addColorStop(1, '#ffaa00');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(x + offset, y + offset, pulseSize, pulseSize);
        
        // 食物高光
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(x + offset + 2, y + offset + 2, 4, 4);
        
        this.ctx.restore();
    }
    
    renderFoodParticles() {
        this.foodParticles.forEach(particle => {
            this.ctx.save();
            this.ctx.globalAlpha = particle.life;
            this.ctx.fillStyle = particle.color;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, 3, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        });
    }
    
    renderUI() {
        // UI背景
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.fillRect(10, 10, 250, 120);
        
        // 分数和最高分
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 20px Arial';
        this.ctx.fillText(`分数: ${this.score}`, 20, 35);
        this.ctx.fillText(`最高分: ${this.highScore}`, 20, 60);
        this.ctx.fillText(`长度: ${this.snake.length}`, 20, 85);
        
        // 速度指示器
        const speedPercent = (150 - this.gameSpeed) / 100;
        this.ctx.fillStyle = '#44ff44';
        this.ctx.fillRect(20, 100, speedPercent * 100, 10);
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.strokeRect(20, 100, 100, 10);
        
        // 控制说明
        this.ctx.font = '14px Arial';
        this.ctx.fillText('WASD/方向键: 移动', this.canvas.width - 200, 30);
        this.ctx.fillText('空格键: 暂停', this.canvas.width - 200, 50);
    }
    
    renderMenu() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('贪吃蛇游戏', this.canvas.width/2, this.canvas.height/2 - 50);
        
        this.ctx.font = '24px Arial';
        this.ctx.fillText('使用 WASD 或方向键控制', this.canvas.width/2, this.canvas.height/2 + 20);
        this.ctx.fillText('点击开始游戏', this.canvas.width/2, this.canvas.height/2 + 60);
        
        this.ctx.textAlign = 'left';
    }
    
    renderPaused() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 36px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('游戏暂停', this.canvas.width/2, this.canvas.height/2 - 30);
        this.ctx.font = '20px Arial';
        this.ctx.fillText('按空格键继续', this.canvas.width/2, this.canvas.height/2 + 20);
        
        this.ctx.textAlign = 'left';
    }
    
    renderGameOver() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#ff4444';
        this.ctx.font = 'bold 48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('游戏结束!', this.canvas.width/2, this.canvas.height/2 - 80);
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '32px Arial';
        this.ctx.fillText(`最终分数: ${this.score}`, this.canvas.width/2, this.canvas.height/2 - 20);
        this.ctx.fillText(`最高分数: ${this.highScore}`, this.canvas.width/2, this.canvas.height/2 + 20);
        this.ctx.fillText('点击重新开始', this.canvas.width/2, this.canvas.height/2 + 80);
        
        this.ctx.textAlign = 'left';
    }
    
    startGame() {
        this.gameState = 'playing';
        this.score = 0;
        this.gameSpeed = 150;
        this.snake = [{ x: 15, y: 15 }];
        this.dx = 1;  // 默认向右移动
        this.dy = 0;  // 不上下移动
        this.snakeTrail = [];
        this.food = this.generateFood();
        this.foodParticles = [];
        this.foodGlow = 0;
        this.obstacles = [];
        this.generateObstacles();
    }
    
    gameLoop(currentTime = 0) {
        this.update(currentTime);
        this.render();
        requestAnimationFrame((time) => this.gameLoop(time));
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
window.SnakeGame = SnakeGame;