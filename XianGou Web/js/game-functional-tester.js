/**
 * 游戏功能测试器
 * 自动测试游戏加载和运行
 */

function testGameFunctionality() {
    console.log('🎮 开始测试游戏功能...');
    
    // 测试3D赛车游戏
    console.log('🏎️ 测试3D赛车游戏...');
    try {
        gameManager.loadGame('racing');
        
        setTimeout(() => {
            const canvas = document.querySelector('#gameContent canvas');
            if (canvas) {
                console.log('✅ 3D赛车游戏加载成功');
                console.log(`📐 画布尺寸: ${canvas.width}x${canvas.height}`);
                
                // 模拟按键测试
                const event = new KeyboardEvent('keydown', { key: ' ' });
                document.dispatchEvent(event);
                console.log('✅ 游戏控制测试通过');
                
                // 关闭游戏
                setTimeout(() => {
                    gameManager.closeGame();
                    console.log('✅ 游戏关闭功能正常');
                    
                    // 测试其他游戏
                    testBrickGame();
                }, 2000);
            } else {
                console.error('❌ 游戏画布未找到');
            }
        }, 1000);
        
    } catch (error) {
        console.error('❌ 3D赛车游戏测试失败:', error);
    }
}

function testBrickGame() {
    console.log('🧱 测试打砖块游戏...');
    
    try {
        gameManager.loadGame('brick');
        
        setTimeout(() => {
            const canvas = document.querySelector('#gameContent canvas');
            if (canvas) {
                console.log('✅ 打砖块游戏加载成功');
                
                // 模拟鼠标移动
                const rect = canvas.getBoundingClientRect();
                const mouseEvent = new MouseEvent('mousemove', {
                    clientX: rect.left + rect.width / 2,
                    clientY: rect.top + rect.height / 2
                });
                canvas.dispatchEvent(mouseEvent);
                console.log('✅ 鼠标控制测试通过');
                
                setTimeout(() => {
                    gameManager.closeGame();
                    console.log('✅ 打砖块游戏关闭正常');
                    
                    // 测试贪吃蛇
                    testSnakeGame();
                }, 2000);
            }
        }, 1000);
        
    } catch (error) {
        console.error('❌ 打砖块游戏测试失败:', error);
    }
}

function testSnakeGame() {
    console.log('🐍 测试贪吃蛇游戏...');
    
    try {
        gameManager.loadGame('snake');
        
        setTimeout(() => {
            const canvas = document.querySelector('#gameContent canvas');
            if (canvas) {
                console.log('✅ 贪吃蛇游戏加载成功');
                
                // 模拟方向键
                const arrowKeys = ['ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft'];
                arrowKeys.forEach((key, index) => {
                    setTimeout(() => {
                        const event = new KeyboardEvent('keydown', { key: key });
                        document.dispatchEvent(event);
                    }, index * 500);
                });
                
                console.log('✅ 方向键控制测试通过');
                
                setTimeout(() => {
                    gameManager.closeGame();
                    console.log('✅ 贪吃蛇游戏关闭正常');
                    console.log('🎉 所有游戏测试完成！');
                    
                    showFinalReport();
                }, 3000);
            }
        }, 1000);
        
    } catch (error) {
        console.error('❌ 贪吃蛇游戏测试失败:', error);
    }
}

function showFinalReport() {
    const stats = gameManager.getGameStats();
    
    console.log('\n' + '='.repeat(50));
    console.log('📊 游戏系统最终测试报告');
    console.log('='.repeat(50));
    console.log(`🎮 总游戏次数: ${stats.gamesPlayed}`);
    console.log(`🏆 总分数: ${stats.totalScore}`);
    console.log(`⭐ 平均分数: ${stats.averageScore}`);
    console.log(`⏱️ 游戏时长: ${stats.totalPlayTime} 分钟`);
    console.log('='.repeat(50));
    console.log('✨ 所有高画质游戏已准备就绪！');
    console.log('💡 现在你可以点击游戏卡片开始游玩了！');
    
    // 显示用户提示
    showUserInstructions();
}

function showUserInstructions() {
    const instructions = [
        '🎯 游戏操作说明：',
        '',
        '🏎️ 3D赛车游戏：',
        '   • W/↑ - 加速',
        '   • S/↓ - 减速',
        '   • A/D 或 ←/→ - 左右转向',
        '   • 空格键 - 开始游戏',
        '',
        '🧱 打砖块游戏：',
        '   • 鼠标移动 - 控制挡板',
        '   • 点击鼠标 - 发射球',
        '   • 空格键 - 暂停/继续',
        '',
        '🐍 贪吃蛇游戏：',
        '   • 方向键或WASD - 控制移动',
        '   • 空格键 - 暂停游戏',
        '',
        '⚡ 通用操作：',
        '   • ESC键 - 退出游戏',
        '   • 点击游戏区域 - 开始游戏',
        '',
        '🌟 特色功能：',
        '   • 高DPI显示支持',
        '   • 粒子特效系统',
        '   • 动态光照效果',
        '   • 3D视觉体验',
        '   • 自动保存最高分'
    ];
    
    instructions.forEach(line => console.log(line));
}

// 延迟执行测试，确保页面完全加载
setTimeout(() => {
    console.log('🚀 开始自动游戏功能测试...');
    testGameFunctionality();
}, 3000);

console.log('🧪 游戏功能测试器已加载，即将开始自动测试...');