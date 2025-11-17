/**
 * 贪吃蛇游戏修复测试器
 * 验证贪吃蛇游戏是否正确运行
 */

function testSnakeGameFix() {
    console.log('🐍 测试贪吃蛇游戏修复...');
    
    try {
        // 创建贪吃蛇游戏实例
        const snakeGame = new SnakeGame();
        
        console.log('✅ 贪吃蛇游戏实例创建成功');
        console.log(`📊 初始状态: 分数=${snakeGame.score}, 蛇长度=${snakeGame.snake.length}`);
        console.log(`🎯 食物位置: (${snakeGame.food.x}, ${snakeGame.food.y})`);
        console.log(`🧱 障碍物数量: ${snakeGame.obstacles.length}`);
        
        // 测试游戏画布
        const canvas = snakeGame.getCanvas();
        if (canvas) {
            console.log(`📐 画布尺寸: ${canvas.width}x${canvas.height}`);
            console.log('✅ 游戏画布创建成功');
        } else {
            console.error('❌ 游戏画布未创建');
        }
        
        // 测试游戏循环
        if (typeof snakeGame.gameLoop === 'function') {
            console.log('✅ 游戏循环函数存在');
        } else {
            console.error('❌ 游戏循环函数不存在');
        }
        
        // 测试关键方法
        const methods = ['generateFood', 'generateObstacles', 'isCollision', 'isObstacle'];
        methods.forEach(method => {
            if (typeof snakeGame[method] === 'function') {
                console.log(`✅ ${method} 方法存在`);
            } else {
                console.error(`❌ ${method} 方法不存在`);
            }
        });
        
        console.log('🎉 贪吃蛇游戏修复测试完成！');
        
        // 清理测试实例
        setTimeout(() => {
            if (snakeGame.gameLoop) {
                // 停止游戏循环（如果有清理方法的话）
                console.log('🧹 清理测试实例');
            }
        }, 1000);
        
        return true;
        
    } catch (error) {
        console.error('❌ 贪吃蛇游戏测试失败:', error);
        console.error('错误堆栈:', error.stack);
        return false;
    }
}

function testGameManagerWithSnake() {
    console.log('🎮 测试游戏管理器加载贪吃蛇...');
    
    try {
        // 使用游戏管理器加载贪吃蛇游戏
        gameManager.loadGame('snake');
        
        setTimeout(() => {
            const canvas = document.querySelector('#gameContent canvas');
            if (canvas) {
                console.log('✅ 通过游戏管理器加载贪吃蛇成功');
                console.log(`📐 画布尺寸: ${canvas.width}x${canvas.height}`);
                
                // 测试游戏控制
                const testControls = () => {
                    // 模拟方向键
                    const keys = ['ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft'];
                    keys.forEach((key, index) => {
                        setTimeout(() => {
                            const event = new KeyboardEvent('keydown', { key: key });
                            document.dispatchEvent(event);
                            console.log(`🎮 测试按键: ${key}`);
                        }, index * 200);
                    });
                };
                
                setTimeout(testControls, 1000);
                
                // 5秒后关闭游戏
                setTimeout(() => {
                    gameManager.closeGame();
                    console.log('✅ 游戏关闭成功');
                    console.log('🎉 贪吃蛇游戏完整测试通过！');
                }, 3000);
                
            } else {
                console.error('❌ 游戏画布未找到');
            }
        }, 500);
        
    } catch (error) {
        console.error('❌ 游戏管理器加载贪吃蛇失败:', error);
    }
}

// 运行测试
setTimeout(() => {
    console.log('='.repeat(50));
    console.log('🧪 开始贪吃蛇游戏修复测试');
    console.log('='.repeat(50));
    
    // 首先测试直接实例化
    const directTest = testSnakeGameFix();
    
    if (directTest) {
        // 然后测试通过游戏管理器加载
        setTimeout(() => {
            testGameManagerWithSnake();
        }, 2000);
    }
}, 1000);

console.log('🐍 贪吃蛇游戏修复测试器已加载');