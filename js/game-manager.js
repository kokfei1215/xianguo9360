/**
 * 游戏管理器
 * 管理所有高画质游戏的加载和切换
 */

class GameManager {
    constructor() {
        this.currentGame = null;
        this.gameContainer = null;
        this.activeGames = new Map();
        this.gameStats = {
            gamesPlayed: 0,
            totalScore: 0,
            highScores: {}
        };
        
        this.loadGameStats();
        // 延迟初始化UI，确保DOM已加载
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeUI());
        } else {
            this.initializeUI();
        }
    }
    
    initializeUI() {
        // 创建游戏容器
        this.gameContainer = document.createElement('div');
        this.gameContainer.id = 'gameContainer';
        this.gameContainer.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.4);
            border: 2px solid #00ff88;
            border-radius: 15px;
            padding: 20px;
            z-index: 1000;
            display: none;
            backdrop-filter: blur(10px);
        `;
        
        // 创建游戏标题栏
        const header = document.createElement('div');
        header.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 1px solid #333;
        `;
        
        const title = document.createElement('h3');
        title.id = 'gameTitle';
        title.style.cssText = 'color: #00ff88; margin: 0; font-size: 24px;';
        header.appendChild(title);
        
        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '✕';
        closeBtn.style.cssText = `
            background: #ff4444;
            color: white;
            border: none;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            cursor: pointer;
            font-size: 18px;
            font-weight: bold;
        `;
        closeBtn.onclick = () => this.closeGame();
        header.appendChild(closeBtn);
        
        this.gameContainer.appendChild(header);
        
        // 创建游戏内容区域
        this.gameContent = document.createElement('div');
        this.gameContent.id = 'gameContent';
        this.gameContainer.appendChild(this.gameContent);
        
        // 创建游戏控制栏
        const controls = document.createElement('div');
        controls.style.cssText = `
            margin-top: 15px;
            padding-top: 10px;
            border-top: 1px solid #333;
            text-align: center;
            color: #888;
            font-size: 14px;
        `;
        const ctrlRow = document.createElement('div');
        ctrlRow.style.marginBottom = '10px';
        ctrlRow.innerHTML = `<span style="color:#00ff88;">游戏控制:</span><span style="margin-left:15px;">WASD/方向键</span><span style="margin-left:15px;">空格键</span><span style="margin-left:15px;">ESC</span>`;
        const diffRow = document.createElement('div');
        diffRow.style.marginTop = '6px';
        const label = document.createElement('span');
        label.textContent = '难度:';
        label.style.color = '#00ff88';
        label.style.marginRight = '8px';
        const select = document.createElement('select');
        select.id = 'gameDifficultySelect';
        select.style.cssText = 'background:#111;color:#00ff88;border:1px solid #00ff88;border-radius:6px;padding:4px;';
        ['easy','medium','hard'].forEach(v=>{const o=document.createElement('option');o.value=v;o.textContent={easy:'简单',medium:'中等',hard:'困难'}[v];select.appendChild(o);});
        select.onchange = () => { this.difficulty = select.value; };
        this.difficulty = 'medium';
        select.value = 'medium';
        diffRow.appendChild(label);
        diffRow.appendChild(select);
        controls.appendChild(ctrlRow);
        controls.appendChild(diffRow);
        this.gameContainer.appendChild(controls);
        
        document.body.appendChild(this.gameContainer);
        
        // 添加键盘事件监听
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.currentGame) {
                this.closeGame();
            }
        });
    }
    
    loadGame(gameType) {
        // 关闭当前游戏
        if (this.currentGame) {
            this.closeGame();
        }
        
        // 显示游戏容器
        this.gameContainer.style.display = 'block';
        
        // 清空游戏内容
        this.gameContent.innerHTML = '';
        
        // 根据游戏类型创建游戏
        let game;
        let title;
        
        switch (gameType) {
            case 'racing':
                game = new RacingGame3D();
                title = '3D赛车游戏';
                break;
            case 'brick':
                game = new BrickBreakerGame();
                title = '打砖块游戏';
                break;
            case 'snake':
                game = new SnakeGame();
                title = '贪吃蛇游戏';
                break;
            case 'memory':
                game = new MemoryGame(this.difficulty || 'medium');
                title = '记忆翻牌';
                break;
            case '2048':
                game = new Game2048();
                title = '2048';
                break;
            case 'maze':
                game = new MazeGame(this.difficulty || 'medium');
                title = '迷宫逃脱';
                break;
            case 'whac':
                game = new WhacGame(this.difficulty || 'medium');
                title = '打地鼠';
                break;
            default:
                console.error('未知的游戏类型:', gameType);
                return;
        }
        
        this.currentGame = game;
        this.currentGame.type = gameType;
        this.gameStats.gamesPlayed++;
        
        // 设置游戏标题
        document.getElementById('gameTitle').textContent = title;
        
        // 将游戏画布添加到容器
        const canvas = game.getCanvas();
        canvas.style.border = '2px solid #333';
        canvas.style.borderRadius = '10px';
        canvas.style.boxShadow = '0 0 20px rgba(0, 255, 136, 0.3)';
        canvas.style.display = 'block';
        canvas.style.background = 'linear-gradient(180deg, #101820 0%, #1a2736 100%)';
        this.gameContent.appendChild(canvas);
        
        // 延迟初始化以确保画布正确渲染
        setTimeout(() => {
            if (game.initializeRenderer) {
                game.initializeRenderer();
            }
            canvas.focus();
        }, 100);
        
        // 保存游戏实例
        this.activeGames.set(gameType, game);
        
        // 聚焦到游戏画布
        canvas.focus();
        
        console.log(`游戏 ${title} 已启动`);
    }
    
    closeGame() {
        if (this.currentGame) {
            // 保存游戏分数
            this.saveGameScore();
            
            // 隐藏游戏容器
            this.gameContainer.style.display = 'none';
            
            // 清空游戏内容
            this.gameContent.innerHTML = '';
            
            console.log('游戏已关闭');
            this.currentGame = null;
        }
    }
    
    saveGameScore() {
        if (this.currentGame && this.currentGame.score !== undefined) {
            this.gameStats.totalScore += this.currentGame.score;
            const t = this.currentGame.type || 'unknown';
            const prev = this.gameStats.highScores[t] || 0;
            if (this.currentGame.score > prev) this.gameStats.highScores[t] = this.currentGame.score;
            
            // 保存到本地存储
            localStorage.setItem('gameStats', JSON.stringify(this.gameStats));
        }
    }
    
    loadGameStats() {
        const saved = localStorage.getItem('gameStats');
        if (saved) {
            try {
                this.gameStats = JSON.parse(saved);
            } catch (e) {
                console.warn('无法加载游戏统计:', e);
            }
        }
    }
    
    getGameStats() {
        return {
            ...this.gameStats,
            totalPlayTime: this.calculateTotalPlayTime(),
            averageScore: this.gameStats.gamesPlayed > 0 ? 
                Math.floor(this.gameStats.totalScore / this.gameStats.gamesPlayed) : 0
        };
    }
    
    calculateTotalPlayTime() {
        // 简化的游戏时间计算
        return Math.floor(this.gameStats.gamesPlayed * 3.5); // 假设每局平均3.5分钟
    }
    
    // 性能优化方法
    optimizePerformance() {
        // 限制同时运行的游戏数量
        if (this.activeGames.size > 3) {
            const oldestGame = this.activeGames.keys().next().value;
            this.activeGames.delete(oldestGame);
        }
        
        // 清理长时间未使用的游戏实例
        setInterval(() => {
            const now = Date.now();
            this.activeGames.forEach((game, key) => {
                if (game.lastAccessTime && now - game.lastAccessTime > 300000) { // 5分钟
                    this.activeGames.delete(key);
                }
            });
        }, 60000); // 每分钟检查一次
    }
}

// 创建全局游戏管理器实例
window.gameManager = null;

// 安全初始化函数
function initializeGameManager() {
    if (window.gameManager) {
        console.log('游戏管理器已初始化');
        return;
    }
    
    try {
        window.gameManager = new GameManager();
        console.log('🎮 游戏管理器初始化成功！');
        
        // 更新游戏统计
        if (typeof updateGameStats === 'function') {
            updateGameStats();
        }
    } catch (error) {
        console.error('游戏管理器初始化失败:', error);
        
        // 创建备用管理器
        window.gameManager = {
            loadGame: function(gameType) {
                alert('游戏系统正在初始化中，请稍后再试...');
            },
            getGameStats: function() {
                return { gamesPlayed: 0, totalScore: 0, averageScore: 0, totalPlayTime: 0 };
            }
        };
    }
}

// 确保在DOM加载后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeGameManager);
} else {
    // 如果已经加载，延迟执行以确保所有脚本都加载完成
    setTimeout(initializeGameManager, 100);
}

// 添加CSS样式
const style = document.createElement('style');
style.textContent = `
    .game-card {
        background: linear-gradient(135deg, #1a1a2e, #16213e);
        border: 2px solid #00ff88;
        border-radius: 15px;
        padding: 20px;
        margin: 15px;
        cursor: pointer;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
    }
    
    .game-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 30px rgba(0, 255, 136, 0.3);
        border-color: #44ff88;
    }
    
    .game-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
        transition: left 0.5s;
    }
    
    .game-card:hover::before {
        left: 100%;
    }
    
    .game-icon {
        font-size: 48px;
        margin-bottom: 15px;
        text-align: center;
        color: #00ff88;
    }
    
    .game-title {
        font-size: 24px;
        font-weight: bold;
        color: #ffffff;
        margin-bottom: 10px;
        text-align: center;
    }
    
    .game-description {
        color: #aaaaaa;
        text-align: center;
        line-height: 1.5;
    }
    
    .game-stats {
        margin-top: 15px;
        padding-top: 15px;
        border-top: 1px solid #333;
        display: flex;
        justify-content: space-around;
        font-size: 14px;
        color: #888;
    }
    
    .game-difficulty {
        display: inline-block;
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: bold;
        margin-top: 10px;
    }
    
    .difficulty-easy { background: #44ff44; color: #000; }
    .difficulty-medium { background: #ffaa44; color: #000; }
    .difficulty-hard { background: #ff4444; color: #fff; }
    
    #gameContainer {
        animation: fadeIn 0.3s ease-out;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
        to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
    }
    
    .loading-spinner {
        border: 3px solid #333;
        border-top: 3px solid #00ff88;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        animation: spin 1s linear infinite;
        margin: 20px auto;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);
