/**
 * 游戏统计更新器
 * 更新游戏页面的统计数据
 */

function updateGameStats() {
    // 等待游戏管理器加载
    if (!window.gameManager || typeof window.gameManager.getGameStats !== 'function') {
        console.warn('游戏管理器未准备好，延迟更新统计');
        setTimeout(updateGameStats, 500);
        return;
    }
    
    const stats = window.gameManager.getGameStats();
    
    // 更新DOM元素
    const totalGamesEl = document.getElementById('totalGames');
    const totalScoreEl = document.getElementById('totalScore');
    const avgScoreEl = document.getElementById('avgScore');
    const playTimeEl = document.getElementById('playTime');
    
    if (totalGamesEl) totalGamesEl.textContent = stats.gamesPlayed;
    if (totalScoreEl) totalScoreEl.textContent = stats.totalScore.toLocaleString();
    if (avgScoreEl) avgScoreEl.textContent = stats.averageScore.toLocaleString();
    if (playTimeEl) playTimeEl.textContent = stats.totalPlayTime;
    
    // 添加动画效果
    animateNumbers();
}

function animateNumbers() {
    const numbers = document.querySelectorAll('.stat-value');
    numbers.forEach(number => {
        const finalValue = parseInt(number.textContent.replace(/,/g, ''));
        let currentValue = 0;
        const increment = finalValue / 50;
        
        const timer = setInterval(() => {
            currentValue += increment;
            if (currentValue >= finalValue) {
                currentValue = finalValue;
                clearInterval(timer);
            }
            number.textContent = Math.floor(currentValue).toLocaleString();
        }, 20);
    });
}

// 页面加载完成后更新统计
document.addEventListener('DOMContentLoaded', function() {
    // 延迟一点以确保游戏管理器已加载
    setTimeout(updateGameStats, 500);
    
    // 定期检查更新（当用户返回页面时）
    setInterval(updateGameStats, 5000);
});

// 监听游戏关闭事件以更新统计
document.addEventListener('gameClosed', updateGameStats);

// 添加一些交互效果
document.addEventListener('DOMContentLoaded', function() {
    // 为统计项添加悬停效果
    const statItems = document.querySelectorAll('.stat-item');
    statItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.05)';
            this.style.transition = 'transform 0.3s ease';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    });
    
    // 添加页面滚动视差效果
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const parallax = document.querySelector('.games-header');
        if (parallax) {
            const speed = scrolled * 0.5;
            parallax.style.transform = `translateY(${speed}px)`;
        }
    });
});

console.log('🎮 游戏统计系统已加载！');