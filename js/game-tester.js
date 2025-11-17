/**
 * 游戏系统测试器
 * 验证游戏系统是否正确加载和运行
 */

function testGameSystem() {
    console.log('🧪 开始测试游戏系统...');
    
    // 测试1: 检查游戏管理器
    if (typeof window.gameManager === 'undefined') {
        console.error('❌ 游戏管理器未加载');
        return false;
    }
    console.log('✅ 游戏管理器已加载');
    
    // 测试2: 检查游戏引擎
    if (typeof window.GameEngine === 'undefined') {
        console.error('❌ 游戏引擎未加载');
        return false;
    }
    console.log('✅ 游戏引擎已加载');
    
    // 测试3: 检查游戏类
    const games = ['RacingGame3D', 'BrickBreakerGame', 'SnakeGame'];
    for (let game of games) {
        if (typeof window[game] === 'undefined') {
            console.error(`❌ ${game} 未加载`);
            return false;
        }
        console.log(`✅ ${game} 已加载`);
    }
    
    // 测试4: 检查DOM元素
    const gameCards = document.querySelectorAll('.game-card');
    if (gameCards.length === 0) {
        console.error('❌ 游戏卡片未找到');
        return false;
    }
    console.log(`✅ 找到 ${gameCards.length} 个游戏卡片`);
    
    // 测试5: 检查统计面板
    const statItems = document.querySelectorAll('.stat-item');
    if (statItems.length === 0) {
        console.error('❌ 统计面板未找到');
        return false;
    }
    console.log(`✅ 找到 ${statItems.length} 个统计项`);
    
    console.log('🎉 游戏系统测试通过！');
    return true;
}

function testGameLoading() {
    console.log('🎮 测试游戏加载功能...');
    
    // 测试加载3D赛车游戏
    try {
        console.log('正在测试3D赛车游戏加载...');
        gameManager.loadGame('racing');
        
        setTimeout(() => {
            const canvas = document.querySelector('#gameContent canvas');
            if (canvas) {
                console.log('✅ 3D赛车游戏画布已创建');
                
                // 测试画布尺寸
                console.log(`画布尺寸: ${canvas.width}x${canvas.height}`);
                
                // 关闭游戏
                gameManager.closeGame();
                console.log('✅ 游戏关闭功能正常');
            } else {
                console.error('❌ 游戏画布未找到');
            }
        }, 1000);
        
    } catch (error) {
        console.error('❌ 游戏加载测试失败:', error);
    }
}

function showSystemStatus() {
    const status = {
        gameManager: typeof window.gameManager !== 'undefined',
        gameEngine: typeof window.GameEngine !== 'undefined',
        racingGame: typeof window.RacingGame3D !== 'undefined',
        brickGame: typeof window.BrickBreakerGame !== 'undefined',
        snakeGame: typeof window.SnakeGame !== 'undefined',
        gameCards: document.querySelectorAll('.game-card').length,
        statsPanel: document.querySelector('.game-stats-panel') !== null
    };
    
    console.log('📊 游戏系统状态:');
    console.table(status);
    
    return status;
}

// 自动测试（延迟执行以确保所有资源加载）
setTimeout(() => {
    console.log('='.repeat(50));
    console.log('🎮 闲狗联合会游戏系统测试报告');
    console.log('='.repeat(50));
    
    const systemReady = testGameSystem();
    showSystemStatus();
    
    if (systemReady) {
        console.log('✨ 系统测试通过！可以开始游戏了！');
        console.log('💡 提示：点击任意游戏卡片即可开始游戏');
        
        // 可选：测试游戏加载
        // testGameLoading();
    } else {
        console.error('❌ 系统测试失败，请检查错误日志');
    }
    
    console.log('='.repeat(50));
}, 2000);

// 添加用户友好的提示
function showGameTips() {
    const tips = [
        '🎮 点击游戏卡片开始游戏',
        '🏎️ 3D赛车：使用WASD或方向键控制',
        '🧱 打砖块：移动鼠标控制挡板',
        '🐍 贪吃蛇：使用方向键移动',
        '⚡ 按ESC键可退出游戏',
        '🎯 支持高DPI显示，画质清晰'
    ];
    
    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    console.log(`💡 ${randomTip}`);
}

// 定期显示提示
setInterval(showGameTips, 30000);

console.log('🧪 游戏系统测试器已加载，正在运行自动测试...');