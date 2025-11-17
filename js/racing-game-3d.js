/**
 * 3D赛车游戏 - 高画质版本
 * 使用Canvas 2D API模拟3D效果
 */

class RacingGame3D {
    constructor() {
        this.canvas = document.createElement('canvas');
        this.canvas.width = 800;
        this.canvas.height = 600;
        this.canvas.style.background = 'linear-gradient(180deg, #101820 0%, #1a2736 100%)';
        this.ctx = this.canvas.getContext('2d');
        this.engine = new GameEngine(this.canvas);
        
        // 游戏状态
        this.gameState = 'menu'; // menu, playing, gameOver
        this.score = 0;
        this.speed = 0;
        this.maxSpeed = 12;
        this.acceleration = 0.2;
        this.deceleration = 0.1;
        
        // 玩家车辆
        this.playerCar = {
            x: 0,
            y: 0.5,
            z: 0,
            width: 0.3,
            height: 0.2,
            color: '#ff4444'
        };
        
        // 道路和场景
        this.road = [];
        this.roadSegments = 200;
        this.segmentLength = 200;
        this.roadWidth = 8;
        this.cameraHeight = 1;
        this.cameraDepth = 0.8;
        this.cameraZ = 0;
        
        // 其他车辆
        this.otherCars = [];
        this.maxOtherCars = 5;
        
        // 输入控制
        this.keys = {};
        this.setupControls();
        this.generateRoad();
        this.generateOtherCars();
        
        // 延迟启动游戏循环，确保画布已正确初始化
        setTimeout(() => {
            this.gameLoop();
        }, 200);
    }
    
    setupControls() {
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            
            // 处理游戏开始/重新开始
            if (e.key === ' ' && (this.gameState === 'menu' || this.gameState === 'gameOver')) {
                this.startGame();
                e.preventDefault();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
        
        // 添加画布点击事件
        this.canvas.addEventListener('click', () => {
            if (this.gameState === 'menu' || this.gameState === 'gameOver') {
                this.startGame();
            }
        });
    }
    
    generateRoad() {
        for (let i = 0; i < this.roadSegments; i++) {
            const segment = {
                index: i,
                z: i * this.segmentLength,
                curve: Math.sin(i * 0.02) * 2,
                y: Math.sin(i * 0.01) * 50
            };
            this.road.push(segment);
        }
    }
    
    generateOtherCars() {
        for (let i = 0; i < this.maxOtherCars; i++) {
            this.otherCars.push({
                x: (Math.random() - 0.5) * (this.roadWidth - 1),
                y: 0,
                z: Math.random() * this.roadSegments * this.segmentLength * 0.8,
                width: 0.25,
                height: 0.15,
                color: ['#4444ff', '#44ff44', '#ffff44', '#ff44ff'][Math.floor(Math.random() * 4)],
                speed: Math.random() * 3 + 2
            });
        }
    }
    
    update() {
        if (this.gameState !== 'playing') return;
        
        // 更新速度
        if (this.keys['arrowup'] || this.keys['w']) {
            this.speed = Math.min(this.speed + this.acceleration, this.maxSpeed);
        } else if (this.keys['arrowdown'] || this.keys['s']) {
            this.speed = Math.max(this.speed - this.acceleration * 2, -this.maxSpeed * 0.5);
        } else {
            this.speed *= (1 - this.deceleration);
        }
        
        // 更新玩家位置
        if (this.keys['arrowleft'] || this.keys['a']) {
            this.playerCar.x -= 0.15;
        }
        if (this.keys['arrowright'] || this.keys['d']) {
            this.playerCar.x += 0.15;
        }
        
        // 限制在道路范围内
        this.playerCar.x = Math.max(-this.roadWidth/2 + 0.2, Math.min(this.roadWidth/2 - 0.2, this.playerCar.x));
        
        // 更新相机位置
        this.cameraZ += this.speed * 10;
        
        // 更新其他车辆
        this.otherCars.forEach(car => {
            car.z += (this.speed - car.speed) * 10;
            if (car.z < this.cameraZ - 500) {
                car.z += this.roadSegments * this.segmentLength;
                car.x = (Math.random() - 0.5) * (this.roadWidth - 1);
            }
        });
        
        // 检测碰撞
        this.checkCollisions();
        
        // 更新分数
        this.score += Math.floor(this.speed);
        
        // 添加粒子效果
        if (this.speed > 5 && Math.random() < 0.3) {
            this.engine.createParticle(
                this.canvas.width/2 + this.playerCar.x * 50 + (Math.random() - 0.5) * 20,
                this.canvas.height * 0.8 + Math.random() * 10,
                {
                    vx: (Math.random() - 0.5) * 2,
                    vy: Math.random() * 2 + 1,
                    life: 0.5,
                    color: '#ff8800',
                    size: Math.random() * 3 + 1
                }
            );
        }
    }
    
    checkCollisions() {
        this.otherCars.forEach(car => {
            const distance = Math.abs(car.z - this.cameraZ);
            if (distance < 200 && 
                Math.abs(car.x - this.playerCar.x) < (car.width + this.playerCar.width) / 2) {
                // 碰撞发生
                this.engine.explosion(
                    this.canvas.width/2 + this.playerCar.x * 50,
                    this.canvas.height * 0.7,
                    30
                );
                this.gameState = 'gameOver';
            }
        });
    }
    
    render() {
        // 清空画布
        this.ctx.fillStyle = '#102235';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 只在游戏进行状态渲染游戏内容
        if (this.gameState === 'playing') {
            // 渲染道路
            this.renderRoad();
            
            // 渲染其他车辆
            this.renderCars();
            
            // 渲染玩家车辆
            this.renderPlayerCar();
        }
        
        // 渲染UI（包括菜单和游戏结束界面）
        this.renderUI();
        
        // 渲染粒子效果
        this.engine.render();
    }
    
    renderRoad() {
        const maxy = this.canvas.height;
        const camz = this.cameraZ;
        const basey = this.canvas.height * 0.8;
        
        // 渲染道路段
        for (let i = 0; i < this.roadSegments - 1; i++) {
            const segment1 = this.road[i];
            const segment2 = this.road[i + 1];
            
            const z1 = segment1.z - camz;
            const z2 = segment2.z - camz;
            
            if (z1 <= 0 || z2 <= 0) continue;
            
            // 3D投影计算
            const scale1 = this.cameraDepth / z1;
            const scale2 = this.cameraDepth / z2;
            
            const x1 = segment1.curve * scale1 * 100;
            const x2 = segment2.curve * scale2 * 100;
            
            const y1 = basey + (segment1.y - this.cameraHeight) * scale1 * 100;
            const y2 = basey + (segment2.y - this.cameraHeight) * scale2 * 100;
            
            const w1 = this.roadWidth * scale1 * 50;
            const w2 = this.roadWidth * scale2 * 50;
            
            // 渲染道路
            this.ctx.fillStyle = i % 2 === 0 ? '#333' : '#444';
            this.ctx.beginPath();
            this.ctx.moveTo(this.canvas.width/2 - w1 + x1, y1);
            this.ctx.lineTo(this.canvas.width/2 + w1 + x1, y1);
            this.ctx.lineTo(this.canvas.width/2 + w2 + x2, y2);
            this.ctx.lineTo(this.canvas.width/2 - w2 + x2, y2);
            this.ctx.closePath();
            this.ctx.fill();
            
            // 渲染道路边线
            this.ctx.strokeStyle = '#ffff00';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.moveTo(this.canvas.width/2 - w1 + x1, y1);
            this.ctx.lineTo(this.canvas.width/2 - w2 + x2, y2);
            this.ctx.stroke();
            
            this.ctx.beginPath();
            this.ctx.moveTo(this.canvas.width/2 + w1 + x1, y1);
            this.ctx.lineTo(this.canvas.width/2 + w2 + x2, y2);
            this.ctx.stroke();
            
            // 渲染中线
            if (i % 4 === 0) {
                this.ctx.strokeStyle = '#ffffff';
                this.ctx.lineWidth = 2;
                this.ctx.setLineDash([10, 10]);
                this.ctx.beginPath();
                this.ctx.moveTo(this.canvas.width/2 + x1, y1);
                this.ctx.lineTo(this.canvas.width/2 + x2, y2);
                this.ctx.stroke();
                this.ctx.setLineDash([]);
            }
        }
    }
    
    renderCars() {
        this.otherCars.forEach(car => {
            const distance = car.z - this.cameraZ;
            if (distance <= 0) return;
            
            const scale = this.cameraDepth / distance;
            const x = this.canvas.width/2 + car.x * scale * 50;
            const y = this.canvas.height * 0.8 + (car.y - this.cameraHeight) * scale * 100;
            const width = car.width * scale * 50;
            const height = car.height * scale * 100;
            
            if (y < 0 || y > this.canvas.height) return;
            
            // 渲染车辆阴影
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            this.ctx.fillRect(x - width/2 + 2, y - height/2 + 2, width, height);
            
            // 渲染车辆
            this.ctx.fillStyle = car.color;
            this.ctx.fillRect(x - width/2, y - height/2, width, height);
            
            // 渲染车窗
            this.ctx.fillStyle = '#222';
            this.ctx.fillRect(x - width/4, y - height/3, width/2, height/3);
            
            // 渲染车灯
            this.ctx.fillStyle = '#ffff88';
            this.ctx.fillRect(x - width/2 - 2, y - height/4, 4, height/8);
            this.ctx.fillRect(x - width/2 - 2, y + height/8, 4, height/8);
        });
    }
    
    renderPlayerCar() {
        const carWidth = 60;
        const carHeight = 40;
        const x = this.canvas.width/2 + this.playerCar.x * 50;
        const y = this.canvas.height * 0.8;
        
        // 渲染车辆阴影
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.fillRect(x - carWidth/2 + 3, y - carHeight/2 + 3, carWidth, carHeight);
        
        // 渲染玩家车辆
        this.ctx.fillStyle = this.playerCar.color;
        this.ctx.fillRect(x - carWidth/2, y - carHeight/2, carWidth, carHeight);
        
        // 渲染车窗
        this.ctx.fillStyle = '#333';
        this.ctx.fillRect(x - carWidth/3, y - carHeight/2 + 5, carWidth * 2/3, carHeight/3);
        
        // 渲染车灯
        this.ctx.fillStyle = '#88ff88';
        this.ctx.fillRect(x + carWidth/2 - 2, y - carHeight/3, 4, carHeight/6);
        this.ctx.fillRect(x + carWidth/2 - 2, y + carHeight/6, 4, carHeight/6);
        
        // 渲染尾灯
        this.ctx.fillStyle = '#ff4444';
        this.ctx.fillRect(x - carWidth/2 - 1, y - carHeight/4, 2, carHeight/8);
        this.ctx.fillRect(x - carWidth/2 - 1, y + carHeight/8, 2, carHeight/8);
    }
    
    renderUI() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.fillRect(10, 10, 200, 120);
        
        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 20px Arial';
        this.ctx.fillText(`分数: ${this.score}`, 20, 35);
        this.ctx.fillText(`速度: ${Math.floor(this.speed * 20)} km/h`, 20, 60);
        
        // 速度表
        const speedPercent = this.speed / this.maxSpeed;
        this.ctx.strokeStyle = '#444';
        this.ctx.lineWidth = 8;
        this.ctx.beginPath();
        this.ctx.arc(160, 70, 30, 0, Math.PI * 2);
        this.ctx.stroke();
        
        this.ctx.strokeStyle = speedPercent > 0.8 ? '#ff4444' : '#44ff44';
        this.ctx.lineWidth = 6;
        this.ctx.beginPath();
        this.ctx.arc(160, 70, 30, -Math.PI/2, -Math.PI/2 + Math.PI * 2 * speedPercent);
        this.ctx.stroke();
        
        // 游戏状态UI
        if (this.gameState === 'menu') {
            this.renderMenu();
        } else if (this.gameState === 'gameOver') {
            this.renderGameOver();
        }
    }
    
    renderMenu() {
        // 清空画布
        this.ctx.fillStyle = '#001122';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制半透明遮罩
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('3D赛车游戏', this.canvas.width/2, this.canvas.height/2 - 50);
        
        this.ctx.font = '24px Arial';
        this.ctx.fillText('使用 WASD 或方向键控制', this.canvas.width/2, this.canvas.height/2 + 20);
        this.ctx.fillText('按空格键或点击开始游戏', this.canvas.width/2, this.canvas.height/2 + 60);
        
        this.ctx.textAlign = 'left';
    }
    
    renderGameOver() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = '#ff4444';
        this.ctx.font = 'bold 48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('游戏结束!', this.canvas.width/2, this.canvas.height/2 - 50);
        
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '32px Arial';
        this.ctx.fillText(`最终分数: ${this.score}`, this.canvas.width/2, this.canvas.height/2 + 20);
        this.ctx.fillText('按空格键重新开始', this.canvas.width/2, this.canvas.height/2 + 60);
        
        this.ctx.textAlign = 'left';
    }
    
    startGame() {
        this.gameState = 'playing';
        this.score = 0;
        this.speed = 0;
        this.cameraZ = 0;
        this.playerCar.x = 0;
        this.otherCars.forEach(car => {
            car.z = Math.random() * this.roadSegments * this.segmentLength * 0.8;
        });
    }
    
    gameLoop() {
        // 处理输入 - 移除空格键处理，因为已经在setupControls中处理
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
window.RacingGame3D = RacingGame3D;