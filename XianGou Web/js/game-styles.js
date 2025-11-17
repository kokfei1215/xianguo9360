/**
 * 高画质游戏样式
 * 为游戏页面添加专业的视觉效果
 */

// 添加游戏页面专用样式
const gameStyles = `
    /* 游戏页面整体样式 */
    .games-section {
        padding: 40px 0;
        background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
        min-height: 100vh;
    }
    
    .games-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 20px;
    }
    
    /* 游戏标题区域 */
    .games-header {
        text-align: center;
        margin-bottom: 50px;
    }
    
    .games-header h1 {
        font-size: 3rem;
        background: linear-gradient(45deg, #00ff88, #44aaff, #ff44ff);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        margin-bottom: 20px;
        text-shadow: 0 0 30px rgba(0, 255, 136, 0.5);
    }
    
    .games-header p {
        font-size: 1.2rem;
        color: #aaaaaa;
        margin-bottom: 30px;
    }
    
    /* 游戏统计面板 */
    .game-stats-panel {
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(0, 255, 136, 0.3);
        border-radius: 15px;
        padding: 25px;
        margin-bottom: 40px;
        backdrop-filter: blur(10px);
    }
    
    .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 20px;
        margin-top: 20px;
    }
    
    .stat-item {
        text-align: center;
        padding: 15px;
        background: rgba(0, 255, 136, 0.1);
        border-radius: 10px;
        border: 1px solid rgba(0, 255, 136, 0.2);
    }
    
    .stat-value {
        font-size: 2rem;
        font-weight: bold;
        color: #00ff88;
        display: block;
    }
    
    .stat-label {
        font-size: 0.9rem;
        color: #aaaaaa;
        margin-top: 5px;
    }
    
    /* 游戏卡片网格 */
    .games-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
        gap: 30px;
        margin-top: 40px;
    }
    
    /* 高画质游戏卡片 */
    .game-card {
        background: linear-gradient(135deg, rgba(26, 26, 46, 0.8), rgba(22, 33, 62, 0.8));
        border: 2px solid rgba(0, 255, 136, 0.3);
        border-radius: 20px;
        padding: 30px;
        cursor: pointer;
        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        position: relative;
        overflow: hidden;
        backdrop-filter: blur(15px);
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
    }
    
    .game-card:hover {
        transform: translateY(-15px) scale(1.02);
        box-shadow: 0 20px 60px rgba(0, 255, 136, 0.4);
        border-color: #00ff88;
    }
    
    .game-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
        transition: left 0.6s ease;
    }
    
    .game-card:hover::before {
        left: 100%;
    }
    
    .game-card::after {
        content: '';
        position: absolute;
        top: -2px;
        left: -2px;
        right: -2px;
        bottom: -2px;
        background: linear-gradient(45deg, #00ff88, #44aaff, #ff44ff, #00ff88);
        border-radius: 20px;
        z-index: -1;
        opacity: 0;
        transition: opacity 0.4s ease;
    }
    
    .game-card:hover::after {
        opacity: 0.7;
    }
    
    .game-icon {
        font-size: 4rem;
        margin-bottom: 20px;
        text-align: center;
        display: block;
        filter: drop-shadow(0 0 20px rgba(0, 255, 136, 0.6));
        animation: float 3s ease-in-out infinite;
    }
    
    @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
    }
    
    .game-title {
        font-size: 1.8rem;
        font-weight: bold;
        color: #ffffff;
        margin-bottom: 15px;
        text-align: center;
        text-shadow: 0 0 15px rgba(0, 255, 136, 0.5);
    }
    
    .game-description {
        color: #cccccc;
        text-align: center;
        line-height: 1.6;
        margin-bottom: 20px;
        font-size: 1rem;
    }
    
    .game-features {
        display: flex;
        justify-content: space-around;
        margin: 20px 0;
        padding: 15px 0;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .feature-tag {
        display: flex;
        flex-direction: column;
        align-items: center;
        font-size: 0.9rem;
        color: #aaaaaa;
    }
    
    .feature-icon {
        font-size: 1.5rem;
        margin-bottom: 5px;
        color: #00ff88;
    }
    
    .game-difficulty {
        display: inline-block;
        padding: 8px 16px;
        border-radius: 20px;
        font-size: 0.9rem;
        font-weight: bold;
        margin-top: 15px;
        text-align: center;
        width: 100%;
        box-sizing: border-box;
    }
    
    .difficulty-easy {
        background: linear-gradient(45deg, #44ff44, #88ff88);
        color: #000;
        box-shadow: 0 4px 15px rgba(68, 255, 68, 0.4);
    }
    
    .difficulty-medium {
        background: linear-gradient(45deg, #ffaa44, #ffcc88);
        color: #000;
        box-shadow: 0 4px 15px rgba(255, 170, 68, 0.4);
    }
    
    .difficulty-hard {
        background: linear-gradient(45deg, #ff4444, #ff8888);
        color: #fff;
        box-shadow: 0 4px 15px rgba(255, 68, 68, 0.4);
    }
    
    /* 游戏容器样式 */
    #gameContainer {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(10, 10, 10, 0.95);
        border: 2px solid #00ff88;
        border-radius: 20px;
        padding: 25px;
        z-index: 1000;
        display: none;
        backdrop-filter: blur(20px);
        box-shadow: 0 0 50px rgba(0, 255, 136, 0.5);
        max-width: 90vw;
        max-height: 90vh;
    }
    
    #gameContent {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 400px;
    }
    
    #gameContent canvas {
        border: 2px solid #333;
        border-radius: 15px;
        box-shadow: 0 0 30px rgba(0, 255, 136, 0.3);
        max-width: 100%;
        max-height: 70vh;
    }
    
    /* 游戏控制面板 */
    .game-controls {
        margin-top: 20px;
        padding-top: 20px;
        border-top: 1px solid #333;
        text-align: center;
        color: #888;
        font-size: 14px;
    }
    
    .control-hint {
        display: inline-block;
        margin: 5px 10px;
        padding: 5px 10px;
        background: rgba(0, 255, 136, 0.1);
        border: 1px solid rgba(0, 255, 136, 0.3);
        border-radius: 8px;
        font-family: monospace;
    }
    
    /* 加载动画 */
    .game-loading {
        text-align: center;
        padding: 40px;
        color: #00ff88;
    }
    
    .loading-spinner {
        border: 4px solid #333;
        border-top: 4px solid #00ff88;
        border-radius: 50%;
        width: 50px;
        height: 50px;
        animation: spin 1s linear infinite;
        margin: 20px auto;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    /* 响应式设计 */
    @media (max-width: 768px) {
        .games-grid {
            grid-template-columns: 1fr;
            gap: 20px;
        }
        
        .game-card {
            padding: 20px;
        }
        
        .games-header h1 {
            font-size: 2rem;
        }
        
        #gameContainer {
            max-width: 95vw;
            max-height: 95vh;
            padding: 15px;
        }
    }
    
    /* 动画效果 */
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.9);
        }
        to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
        }
    }
    
    @keyframes pulse {
        0%, 100% {
            box-shadow: 0 0 20px rgba(0, 255, 136, 0.3);
        }
        50% {
            box-shadow: 0 0 40px rgba(0, 255, 136, 0.6);
        }
    }
    
    .pulse-animation {
        animation: pulse 2s infinite;
    }
    
    /* 游戏统计面板动画 */
    .stat-item {
        animation: slideUp 0.6s ease-out;
    }
    
    @keyframes slideUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    /* 特殊效果 */
    .neon-text {
        text-shadow: 
            0 0 5px currentColor,
            0 0 10px currentColor,
            0 0 15px currentColor,
            0 0 20px currentColor;
    }
    
    .glow-border {
        position: relative;
        overflow: hidden;
    }
    
    .glow-border::before {
        content: '';
        position: absolute;
        top: -2px;
        left: -2px;
        right: -2px;
        bottom: -2px;
        background: linear-gradient(45deg, #00ff88, #44aaff, #ff44ff, #00ff88);
        border-radius: inherit;
        z-index: -1;
        animation: rotate 3s linear infinite;
    }
    
    @keyframes rotate {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

// 注入样式到页面
const styleSheet = document.createElement('style');
styleSheet.textContent = gameStyles;
document.head.appendChild(styleSheet);

// 添加页面加载动画
document.addEventListener('DOMContentLoaded', function() {
    // 为游戏卡片添加渐入动画
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 100);
            }
        });
    });
    
    // 观察所有游戏卡片
    document.querySelectorAll('.game-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(50px)';
        card.style.transition = 'all 0.6s ease-out';
        observer.observe(card);
    });
    
    // 添加鼠标跟踪效果
    document.querySelectorAll('.game-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / centerY * -10;
            const rotateY = (x - centerX) / centerX * 10;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-15px) scale(1.02)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0) scale(1)';
        });
    });
});

console.log('🎮 高画质游戏样式已加载完成！');