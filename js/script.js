document.addEventListener('DOMContentLoaded', function() {
    // 移动端菜单切换
    const menuToggle = document.querySelector('.menu-toggle');
    const nav = document.querySelector('nav');
    
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            nav.classList.toggle('active');
        });
    }

    // 点击页面其他区域关闭菜单
    document.addEventListener('click', function(event) {
        if (!event.target.closest('nav') && !event.target.closest('.menu-toggle') && nav.classList.contains('active')) {
            nav.classList.remove('active');
        }
    });

    // 简单的轮播效果（如果有多个testimonial）
    const testimonials = document.querySelectorAll('.testimonial-item');
    let currentTestimonial = 0;
    
    if (testimonials.length > 1) {
        // 初始化，只显示第一个
        testimonials.forEach((item, index) => {
            if (index !== 0) {
                item.style.display = 'none';
            }
        });

        // 每5秒切换一次
        setInterval(() => {
            testimonials[currentTestimonial].style.display = 'none';
            currentTestimonial = (currentTestimonial + 1) % testimonials.length;
            testimonials[currentTestimonial].style.display = 'block';
        }, 5000);
    }

    // 平滑滚动效果
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                window.scrollTo({
                    top: target.offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // 滚动时添加动画效果
    const animateOnScroll = function() {
        const elements = document.querySelectorAll('.feature-item, .event-card, .testimonial-item');
        
        elements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const screenPosition = window.innerHeight / 1.3;
            
            if (elementPosition < screenPosition) {
                element.classList.add('animate');
            }
        });
    };

    // 初始检查
    animateOnScroll();
    
    // 滚动时检查
    window.addEventListener('scroll', animateOnScroll);
});

// 会员系统相关功能
// 模拟数据存储（实际项目中应使用后端数据库）
let memberData = {
    pendingApplications: [],
    approvedMembers: [],
    rejectedApplications: [],
    currentUser: null,
    adminCredentials: {
        username: 'admin',
        password: 'admin123'
    }
};

// 用户注册功能
function handleRegistration() {
    const form = document.getElementById('registerForm');
    if (!form) return;

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // 获取表单数据
        const formData = new FormData(form);
        const userData = {
            id: Date.now(),
            username: formData.get('username'),
            email: formData.get('email'),
            password: formData.get('password'),
            confirmPassword: formData.get('confirmPassword'),
            realName: formData.get('realName'),
            phone: formData.get('phone'),
            city: formData.get('city'),
            interests: formData.get('interests'),
            reason: formData.get('reason'),
            agreement: formData.get('agreement'),
            status: 'pending',
            submitTime: new Date().toLocaleString('zh-CN')
        };

        // 表单验证
        if (!validateRegistrationForm(userData)) {
            return;
        }

        // 保存到本地存储
        let applications = JSON.parse(localStorage.getItem('pendingApplications') || '[]');
        applications.push(userData);
        localStorage.setItem('pendingApplications', JSON.stringify(applications));

        // 显示成功消息
        document.querySelector('.register-form-container').style.display = 'none';
        document.getElementById('successMessage').style.display = 'block';
    });
}

// 注册表单验证
function validateRegistrationForm(data) {
    let isValid = true;
    
    // 清除之前的错误信息
    document.querySelectorAll('.error-message').forEach(el => el.textContent = '');

    // 用户名验证
    if (data.username.length < 3 || data.username.length > 20) {
        document.getElementById('usernameError').textContent = '用户名长度应在3-20个字符之间';
        isValid = false;
    }

    // 邮箱验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
        document.getElementById('emailError').textContent = '请输入有效的邮箱地址';
        isValid = false;
    }

    // 密码验证
    if (data.password.length < 6) {
        document.getElementById('passwordError').textContent = '密码长度至少6位';
        isValid = false;
    }

    // 确认密码验证
    if (data.password !== data.confirmPassword) {
        document.getElementById('confirmPasswordError').textContent = '两次输入的密码不一致';
        isValid = false;
    }

    // 真实姓名验证
    if (data.realName.length < 2) {
        document.getElementById('realNameError').textContent = '请输入真实姓名';
        isValid = false;
    }

    // 手机号验证
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(data.phone)) {
        document.getElementById('phoneError').textContent = '请输入有效的手机号码';
        isValid = false;
    }

    // 申请理由验证
    if (data.reason.length < 10) {
        document.getElementById('reasonError').textContent = '申请理由至少10个字符';
        isValid = false;
    }

    // 协议验证
    if (!data.agreement) {
        document.getElementById('agreementError').textContent = '请同意用户协议和隐私政策';
        isValid = false;
    }

    return isValid;
}

// 用户登录功能
function handleLogin() {
    const form = document.getElementById('loginForm');
    if (!form) return;

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        // 清除错误信息
        document.querySelectorAll('.error-message').forEach(el => el.textContent = '');

        // 验证输入
        if (!email || !password) {
            if (!email) document.getElementById('loginEmailError').textContent = '请输入邮箱地址';
            if (!password) document.getElementById('loginPasswordError').textContent = '请输入密码';
            return;
        }

        // 检查用户状态
        const approvedMembers = JSON.parse(localStorage.getItem('approvedMembers') || '[]');
        const pendingApplications = JSON.parse(localStorage.getItem('pendingApplications') || '[]');
        
        const approvedUser = approvedMembers.find(user => user.email === email && user.password === password);
        const pendingUser = pendingApplications.find(user => user.email === email);

        if (approvedUser) {
            // 登录成功
            localStorage.setItem('currentUser', JSON.stringify(approvedUser));
            showLoginStatus('success', '登录成功！', '欢迎回到闲狗联合会', 
                '<a href="index.html" class="btn btn-primary">进入首页</a>');
        } else if (pendingUser) {
            // 账户待审核
            showLoginStatus('pending', '账户待审核', '您的注册申请正在审核中，请耐心等待管理员审核通过。', 
                '<a href="index.html" class="btn btn-secondary">返回首页</a>');
        } else {
            // 登录失败
            showLoginStatus('error', '登录失败', '邮箱或密码错误，请检查后重试。如果您还没有账户，请先注册。', 
                '<a href="register.html" class="btn btn-primary">立即注册</a>');
        }
    });
}

// 显示登录状态
function showLoginStatus(type, title, message, actions) {
    document.querySelector('.login-form-container').style.display = 'none';
    const statusMessage = document.getElementById('statusMessage');
    statusMessage.style.display = 'block';
    
    document.getElementById('statusTitle').textContent = title;
    document.getElementById('statusText').textContent = message;
    document.getElementById('statusActions').innerHTML = actions;
    
    const statusCard = statusMessage.querySelector('.status-card');
    statusCard.className = `status-card ${type}`;
}

// 忘记密码功能
function showForgotPassword() {
    document.querySelector('.login-form').style.display = 'none';
    document.getElementById('forgotPasswordForm').style.display = 'block';
}

function showLoginForm() {
    document.querySelector('.login-form').style.display = 'block';
    document.getElementById('forgotPasswordForm').style.display = 'none';
}

function sendResetEmail() {
    const email = document.getElementById('resetEmail').value;
    if (!email) {
        document.getElementById('resetEmailError').textContent = '请输入邮箱地址';
        return;
    }
    
    // 模拟发送重置邮件
    alert('重置密码链接已发送到您的邮箱，请查收。');
    showLoginForm();
}

// 管理员功能
function handleAdminLogin() {
    const form = document.getElementById('adminLoginForm');
    if (!form) return;

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('adminUsername').value;
        const password = document.getElementById('adminPassword').value;

        if (username === memberData.adminCredentials.username && 
            password === memberData.adminCredentials.password) {
            // 登录成功，显示管理界面
            document.getElementById('adminLogin').style.display = 'none';
            document.getElementById('adminDashboard').style.display = 'block';
            loadAdminData();
        } else {
            document.getElementById('adminUsernameError').textContent = '用户名或密码错误';
        }
    });
}

// 加载管理员数据
function loadAdminData() {
    const pendingApplications = JSON.parse(localStorage.getItem('pendingApplications') || '[]');
    const approvedMembers = JSON.parse(localStorage.getItem('approvedMembers') || '[]');
    const rejectedApplications = JSON.parse(localStorage.getItem('rejectedApplications') || '[]');

    // 更新统计数据
    document.getElementById('pendingCount').textContent = pendingApplications.length;
    document.getElementById('approvedCount').textContent = approvedMembers.length;
    document.getElementById('rejectedCount').textContent = rejectedApplications.length;

    // 加载待审核申请
    loadPendingApplications(pendingApplications);
}

// 加载待审核申请
function loadPendingApplications(applications) {
    const container = document.getElementById('pendingApplications');
    if (applications.length === 0) {
        container.innerHTML = '<p class="no-data">暂无待审核申请</p>';
        return;
    }

    container.innerHTML = applications.map(app => `
        <div class="application-card" data-id="${app.id}">
            <div class="application-header">
                <h3>${app.realName}</h3>
                <span class="status-badge pending">待审核</span>
            </div>
            <div class="application-info">
                <div class="info-row">
                    <span class="label">用户名:</span>
                    <span class="value">${app.username}</span>
                </div>
                <div class="info-row">
                    <span class="label">邮箱:</span>
                    <span class="value">${app.email}</span>
                </div>
                <div class="info-row">
                    <span class="label">手机:</span>
                    <span class="value">${app.phone}</span>
                </div>
                <div class="info-row">
                    <span class="label">城市:</span>
                    <span class="value">${app.city || '未填写'}</span>
                </div>
                <div class="info-row">
                    <span class="label">申请时间:</span>
                    <span class="value">${app.submitTime}</span>
                </div>
            </div>
            <div class="application-details">
                <div class="detail-section">
                    <h4>兴趣爱好:</h4>
                    <p>${app.interests || '未填写'}</p>
                </div>
                <div class="detail-section">
                    <h4>申请理由:</h4>
                    <p>${app.reason}</p>
                </div>
            </div>
            <div class="application-actions">
                <button class="btn btn-success" onclick="approveApplication(${app.id})">通过申请</button>
                <button class="btn btn-danger" onclick="rejectApplication(${app.id})">拒绝申请</button>
            </div>
        </div>
    `).join('');
}

// 审核通过申请
function approveApplication(id) {
    const pendingApplications = JSON.parse(localStorage.getItem('pendingApplications') || '[]');
    const approvedMembers = JSON.parse(localStorage.getItem('approvedMembers') || '[]');
    
    const applicationIndex = pendingApplications.findIndex(app => app.id === id);
    if (applicationIndex !== -1) {
        const application = pendingApplications[applicationIndex];
        application.status = 'approved';
        application.approveTime = new Date().toLocaleString('zh-CN');
        
        // 移动到已通过列表
        approvedMembers.push(application);
        pendingApplications.splice(applicationIndex, 1);
        
        // 更新本地存储
        localStorage.setItem('pendingApplications', JSON.stringify(pendingApplications));
        localStorage.setItem('approvedMembers', JSON.stringify(approvedMembers));
        
        // 刷新界面
        loadAdminData();
        
        alert(`已通过 ${application.realName} 的申请`);
    }
}

// 拒绝申请
function rejectApplication(id) {
    const reason = prompt('请输入拒绝理由:');
    if (!reason) return;
    
    const pendingApplications = JSON.parse(localStorage.getItem('pendingApplications') || '[]');
    const rejectedApplications = JSON.parse(localStorage.getItem('rejectedApplications') || '[]');
    
    const applicationIndex = pendingApplications.findIndex(app => app.id === id);
    if (applicationIndex !== -1) {
        const application = pendingApplications[applicationIndex];
        application.status = 'rejected';
        application.rejectTime = new Date().toLocaleString('zh-CN');
        application.rejectReason = reason;
        
        // 移动到已拒绝列表
        rejectedApplications.push(application);
        pendingApplications.splice(applicationIndex, 1);
        
        // 更新本地存储
        localStorage.setItem('pendingApplications', JSON.stringify(pendingApplications));
        localStorage.setItem('rejectedApplications', JSON.stringify(rejectedApplications));
        
        // 刷新界面
        loadAdminData();
        
        alert(`已拒绝 ${application.realName} 的申请`);
    }
}

// 标签页切换
function showTab(tabName) {
    // 隐藏所有标签内容
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // 移除所有按钮的active类
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // 显示选中的标签
    document.getElementById(tabName + 'Tab').classList.add('active');
    event.target.classList.add('active');
}

// 管理员退出登录
function logout() {
    if (confirm('确定要退出登录吗？')) {
        document.getElementById('adminLogin').style.display = 'block';
        document.getElementById('adminDashboard').style.display = 'none';
        document.getElementById('adminLoginForm').reset();
    }
}

// 页面加载时初始化相应功能
document.addEventListener('DOMContentLoaded', function() {
    // 根据当前页面初始化相应功能
    if (document.getElementById('registerForm')) {
        handleRegistration();
    }
    
    if (document.getElementById('loginForm')) {
        handleLogin();
    }
    
    if (document.getElementById('adminLoginForm')) {
        handleAdminLogin();
    }
});