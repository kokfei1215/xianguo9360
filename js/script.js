document.addEventListener('DOMContentLoaded', function() {
    try { localStorage.setItem('apiBaseUrl', 'https://xiangou9360.com'); } catch(e) {}
    // 根据会话更新导航展示
    updateNavSessionState();
    // 登录页自动跳转：已登录直接进入会员中心
    try {
        if (document.getElementById('loginForm')) {
            const user = getCurrentUser();
            if (user) { window.location.href = 'member.html'; }
        }
    } catch(e) {}
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
        if (!nav) return;
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

    // 平滑滚动效果（修复 href="#" 报错）
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const selector = this.getAttribute('href');
            // 跳过仅为占位的链接
            if (!selector || selector === '#') return;
            const target = document.querySelector(selector);
            if (target) {
                e.preventDefault();
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

    const eventItems = document.querySelectorAll('.events-list .event-item');
    if (eventItems.length) {
        const defaults = {
            social: 'img/placeholder-600x400.svg',
            professional: 'img/placeholder-600x400.svg',
            outdoor: 'img/placeholder-600x400.svg',
            charity: 'img/placeholder-600x400.svg'
        };
        const titleToCategory = {
            '联谊晚会': 'social',
            '行业交流研讨会': 'professional',
            '团建活动': 'outdoor',
            '爱心助学公益行': 'charity',
            '中秋联谊会': 'social',
            '创业经验分享会': 'professional'
        };
        eventItems.forEach(item => {
            const img = item.querySelector('.event-image img');
            if (!img) return;
            const titleEl = item.querySelector('.event-details h3');
            const title = titleEl ? titleEl.textContent.trim() : '';
            const category = Object.keys(defaults).find(k => item.classList.contains(k)) || titleToCategory[title] || 'social';
            const base = `img/events/`;
            const slug = title.replace(/\s+/g, '-');
            const candidates = [
                `${base}${slug}.jpg`,
                `${base}${slug}.png`,
                `${base}${slug}.svg`,
                `${base}${category}.jpg`,
                `${base}${category}.png`,
                `${base}${category}.svg`
            ];
            let i = 0;
            const fallback = defaults[category] || defaults.social;
            img.loading = 'lazy';
            const tryNext = () => {
                if (i >= candidates.length) { img.src = fallback; return; }
                img.src = candidates[i++];
            };
            img.onerror = tryNext;
            tryNext();
        });
    }

    const i18n = {
        zh: {
            'nav.home': '首页',
            'nav.about': '关于我们',
            'nav.events': '活动展示',
            'nav.contact': '联系我们',
            'nav.donation': '捐款',
            'nav.application': '入会申请',
            'nav.login': '登录',
            'nav.register': '注册',
            'register.title': '会员注册',
            'register.subtitle': '加入闲狗联合会，开启精彩的社交生活',
            'register.form.title': '填写注册信息',
            'register.username': '用户名 *',
            'register.username.ph': '请输入用户名（3-20个字符）',
            'register.email': '邮箱地址 *',
            'register.email.ph': '请输入邮箱地址',
            'register.password': '密码 *',
            'register.password.ph': '请输入密码（至少6位）',
            'register.confirm': '确认密码 *',
            'register.confirm.ph': '请再次输入密码',
            'register.realname': '真实姓名 *',
            'register.realname.ph': '请输入真实姓名',
            'register.phone': '手机号码 *',
            'register.phone.ph': '请输入手机号码（可含国家区号）',
            'register.city': '所在城市',
            'register.city.ph': '请输入所在城市',
            'register.interests': '兴趣爱好',
            'register.interests.ph': '请简单介绍您的兴趣爱好，有助于我们为您推荐合适的活动',
            'register.reason': '申请理由 *',
            'register.reason.ph': '请说明您申请加入闲狗联合会的理由，这将有助于审核',
            'register.agreement': '我已阅读并同意',
            'register.submit': '提交注册申请',
            'donation.title': '支持我们',
            'donation.subtitle': '您的捐款将帮助我们更好地服务社区',
            'donation.amount': '捐款金额 (元)',
            'donation.amount.ph': '请输入捐款金额',
            'donation.name': '姓名',
            'donation.name.ph': '请输入您的姓名',
            'donation.email': '电子邮箱',
            'donation.email.ph': '请输入您的电子邮箱',
            'donation.method': '捐款方式',
            'donation.submit': '立即捐款',
            'application.title': '入会申请',
            'application.subtitle': '选择适合您的会员类型，加入我们，享受专属权益',
            'application.form.title': '选择会员类型并支付',
            'application.pay.submit': '确认支付并提交申请',
        },
        en: {
            'nav.home': 'Home',
            'nav.about': 'About',
            'nav.events': 'Events',
            'nav.contact': 'Contact',
            'nav.donation': 'Donate',
            'nav.application': 'Apply',
            'nav.login': 'Login',
            'nav.register': 'Register',
            'register.title': 'Member Registration',
            'register.subtitle': 'Join JLP and start a great social life',
            'register.form.title': 'Fill in Registration Information',
            'register.username': 'Username *',
            'register.username.ph': 'Enter 3–20 characters',
            'register.email': 'Email *',
            'register.email.ph': 'Enter your email',
            'register.password': 'Password *',
            'register.password.ph': 'Enter password (min 6 chars)',
            'register.confirm': 'Confirm Password *',
            'register.confirm.ph': 'Re-enter your password',
            'register.realname': 'Full Name *',
            'register.realname.ph': 'Enter your full name',
            'register.phone': 'Phone Number *',
            'register.phone.ph': 'Enter phone number (with country code)',
            'register.city': 'City',
            'register.city.ph': 'Enter your city',
            'register.interests': 'Interests',
            'register.interests.ph': 'Briefly describe your interests',
            'register.reason': 'Application Reason *',
            'register.reason.ph': 'Why do you want to join JLP?',
            'register.agreement': 'I have read and agree to',
            'register.submit': 'Submit Registration',
            'donation.title': 'Support Us',
            'donation.subtitle': 'Your donation helps us serve the community better',
            'donation.amount': 'Donation Amount (CNY)',
            'donation.amount.ph': 'Enter donation amount',
            'donation.name': 'Name',
            'donation.name.ph': 'Enter your name',
            'donation.email': 'Email',
            'donation.email.ph': 'Enter your email',
            'donation.method': 'Payment Method',
            'donation.submit': 'Donate Now',
            'application.title': 'Membership Application',
            'application.subtitle': 'Choose a membership type and enjoy exclusive benefits',
            'application.form.title': 'Select Type and Pay',
            'application.pay.submit': 'Confirm Payment and Submit',
        }
    };
    const getLang = () => { const s = localStorage.getItem('lang'); return s || ((navigator.language||'zh').startsWith('en') ? 'en' : 'zh'); };
    const setLang = (l) => { localStorage.setItem('lang', l); document.documentElement.setAttribute('lang', l==='en'?'en-US':'zh-CN'); };
    const t = (k) => (i18n[getLang()]||{})[k] || (i18n.zh||{})[k] || '';
    const applyI18n = () => {
        const home = document.querySelector('nav a[href="index.html"], header nav a[href="index.html"], nav ul li a[href="index.html"]'); if (home) home.textContent = t('nav.home');
        const about = document.querySelector('nav a[href="about.html"]'); if (about) about.textContent = t('nav.about');
        const events = document.querySelector('nav a[href="events.html"]'); if (events) events.textContent = t('nav.events');
        const contact = document.querySelector('nav a[href="contact.html"]'); if (contact) contact.textContent = t('nav.contact');
        const donation = document.querySelector('nav a[href="donation.html"]'); if (donation) donation.textContent = t('nav.donation');
        const application = document.querySelector('nav a[href="application.html"]'); if (application) application.textContent = t('nav.application');
        const loginLink = document.querySelector('nav a[href="login.html"]'); if (loginLink) loginLink.textContent = t('nav.login');
        const registerLink = document.querySelector('nav a[href="register.html"]'); if (registerLink) registerLink.textContent = t('nav.register');
        const regTitle = document.querySelector('.page-header h1'); if (regTitle && location.pathname.endsWith('register.html')) regTitle.textContent = t('register.title');
        const regSub = document.querySelector('.page-header p'); if (regSub && location.pathname.endsWith('register.html')) regSub.textContent = t('register.subtitle');
        const regFormTitle = document.querySelector('#registerForm h2'); if (regFormTitle) regFormTitle.textContent = t('register.form.title');
        const uLabel = document.querySelector('label[for="username"]'); if (uLabel) uLabel.textContent = t('register.username');
        const uInput = document.getElementById('username'); if (uInput) uInput.placeholder = t('register.username.ph');
        const eLabel = document.querySelector('label[for="email"]'); if (eLabel && location.pathname.endsWith('register.html')) eLabel.textContent = t('register.email');
        const eInput = document.getElementById('email'); if (eInput && location.pathname.endsWith('register.html')) eInput.placeholder = t('register.email.ph');
        const pLabel = document.querySelector('label[for="password"]'); if (pLabel) pLabel.textContent = t('register.password');
        const pInput = document.getElementById('password'); if (pInput) pInput.placeholder = t('register.password.ph');
        const cLabel = document.querySelector('label[for="confirmPassword"]'); if (cLabel) cLabel.textContent = t('register.confirm');
        const cInput = document.getElementById('confirmPassword'); if (cInput) cInput.placeholder = t('register.confirm.ph');
        const rLabel = document.querySelector('label[for="realName"]'); if (rLabel) rLabel.textContent = t('register.realname');
        const rInput = document.getElementById('realName'); if (rInput) rInput.placeholder = t('register.realname.ph');
        const phLabel = document.querySelector('label[for="phone"]'); if (phLabel) phLabel.textContent = t('register.phone');
        const phInput = document.getElementById('phone'); if (phInput) phInput.placeholder = t('register.phone.ph');
        const cityLabel = document.querySelector('label[for="city"]'); if (cityLabel) cityLabel.textContent = t('register.city');
        const cityInput = document.getElementById('city'); if (cityInput) cityInput.placeholder = t('register.city.ph');
        const iLabel = document.querySelector('label[for="interests"]'); if (iLabel) iLabel.textContent = t('register.interests');
        const iInput = document.getElementById('interests'); if (iInput) iInput.placeholder = t('register.interests.ph');
        const rsLabel = document.querySelector('label[for="reason"]'); if (rsLabel) rsLabel.textContent = t('register.reason');
        const rsInput = document.getElementById('reason'); if (rsInput) rsInput.placeholder = t('register.reason.ph');
        const regBtn = document.querySelector('#registerForm button[type="submit"]'); if (regBtn) regBtn.textContent = t('register.submit');
        if (location.pathname.endsWith('donation.html')) {
            const dTitle = document.querySelector('.section-title'); if (dTitle) dTitle.textContent = t('donation.title');
            const dSub = document.querySelector('.section-subtitle'); if (dSub) dSub.textContent = t('donation.subtitle');
            const amtLabel = document.querySelector('label[for="amount"]'); if (amtLabel) amtLabel.textContent = t('donation.amount');
            const amtInput = document.getElementById('amount'); if (amtInput) amtInput.placeholder = t('donation.amount.ph');
            const dnLabel = document.querySelector('label[for="name"]'); if (dnLabel) dnLabel.textContent = t('donation.name');
            const dnInput = document.getElementById('name'); if (dnInput) dnInput.placeholder = t('donation.name.ph');
            const deLabel = document.querySelector('label[for="email"]'); if (deLabel) deLabel.textContent = t('donation.email');
            const deInput = document.getElementById('email'); if (deInput) deInput.placeholder = t('donation.email.ph');
            const pmLabel = document.querySelector('.donation-form label + .payment-methods')?.previousElementSibling; if (pmLabel) pmLabel.textContent = t('donation.method');
            const dBtn = document.querySelector('#donation-form button[type="submit"]'); if (dBtn) dBtn.textContent = t('donation.submit');
        }
        if (location.pathname.endsWith('application.html')) {
            const aTitle = document.querySelector('.page-header h1'); if (aTitle) aTitle.textContent = t('application.title');
            const aSub = document.querySelector('.page-header p'); if (aSub) aSub.textContent = t('application.subtitle');
            const afTitle = document.querySelector('#applicationForm h2'); if (afTitle) afTitle.textContent = t('application.form.title');
            const aBtn = document.querySelector('#applicationForm button[type="submit"]'); if (aBtn) aBtn.textContent = t('application.pay.submit');
        }
    };
    const injectLangSwitcher = () => {
        const container = document.querySelector('header .nav-container') || document.querySelector('header .container');
        if (!container || container.querySelector('#langSwitcher')) return;
        const select = document.createElement('select');
        select.id = 'langSwitcher';
        select.style.marginLeft = '12px';
        select.innerHTML = '<option value="zh">中文</option><option value="en">English</option>';
        select.value = getLang();
        select.onchange = function(){ setLang(this.value); applyI18n(); };
        container.appendChild(select);
    };
    setLang(getLang());
    injectLangSwitcher();
    applyI18n();
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

    form.addEventListener('submit', async function(e) {
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

        // 保存到后端（支持同步）
        try {
            if (window.apiClient) {
                await window.apiClient.addApplication(userData);
            } else {
                // 后备：保存到本地存储
                let applications = JSON.parse(localStorage.getItem('pendingApplications') || '[]');
                applications.push(userData);
                localStorage.setItem('pendingApplications', JSON.stringify(applications));
            }
        } catch (error) {
            console.error('保存申请失败:', error);
            // 后备：保存到本地存储
            let applications = JSON.parse(localStorage.getItem('pendingApplications') || '[]');
            applications.push(userData);
            localStorage.setItem('pendingApplications', JSON.stringify(applications));
        }

        // 显示成功消息：隐藏表单本身而不是整个容器
        const registerFormEl = document.querySelector('.register-form');
        if (registerFormEl) {
            registerFormEl.style.display = 'none';
        }
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
    const normalizedPhone = String(data.phone||'').replace(/[^0-9+]/g,'');
    const digits = normalizedPhone.replace(/[^0-9]/g,'');
    const validPhone = /^\+?[0-9]{7,15}$/.test(normalizedPhone) && digits.length>=7 && digits.length<=15;
    if (!validPhone) { document.getElementById('phoneError').textContent = getLang()==='en'?'Please enter a valid international phone number':'请输入有效的国际电话号码'; isValid = false; }

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

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const memberId = document.getElementById('loginMemberId').value;
        const password = document.getElementById('loginPassword').value;

        // 清除错误信息
        document.querySelectorAll('.error-message').forEach(el => el.textContent = '');

        // 验证输入
        if (!memberId || !password) {
            if (!memberId) document.getElementById('loginMemberIdError').textContent = '请输入会员ID';
            if (!password) document.getElementById('loginPasswordError').textContent = '请输入密码';
            return;
        }

        try {
            if (window.apiClient) {
                const result = await window.apiClient.login(memberId, password);
                if (result && result.success && result.user) {
                    try { localStorage.removeItem('currentUser'); } catch {}
                    localStorage.setItem('currentUser', JSON.stringify({
                        id: result.user.id,
                        username: result.user.username,
                        email: result.user.email || '',
                        memberNumber: result.user.memberId || '',
                        level: '1级'
                    }));
                    showLoginStatus('success', '登录成功！', '正在跳转到会员中心...', 
                        '<a href="member.html" class="btn btn-primary">立即跳转</a>');
                    setTimeout(() => { 
                        try { 
                            window.location.href = 'member.html'; 
                        } catch(e) {}
                    }, 2000);
                    return;
                }
            }
        } catch (error) {
            console.error('登录失败:', error);
        }

        let approvedMembers = [];
        let pendingApplications = [];
        try {
            if (window.apiClient) {
                approvedMembers = await window.apiClient.getMembers();
                pendingApplications = await window.apiClient.getApplications();
            }
        } catch (error) {}
        const approvedUser = approvedMembers.find(user => user.id === memberId && user.password === password);
        const pendingUser = pendingApplications.find(user => user.id === memberId);
        if (approvedUser) {
            // 登录成功
            try {
                if (window.apiClient) {
                    // 更新在线状态
                    await window.apiClient.updateUserPresence(approvedUser.username, true);
                }
            } catch (error) {
                console.error('更新在线状态失败:', error);
            }
            
            localStorage.setItem('currentUser', JSON.stringify(approvedUser));
            
            // 立即显示成功状态
            showLoginStatus('success', '登录成功！', '正在跳转到会员中心...', 
                '<a href="member.html" class="btn btn-primary">立即跳转</a>');

            // 2秒后自动跳转到会员中心
            setTimeout(() => { 
                try { 
                    window.location.href = 'member.html'; 
                } catch(e) {
                    console.error('跳转失败:', e);
                }
            }, 2000);
        } else if (pendingUser) {
            // 账户待审核
            showLoginStatus('pending', '账户待审核', '您的注册申请正在审核中，请耐心等待管理员审核通过。', 
                '<a href="index.html" class="btn btn-secondary">返回首页</a>');
        } else {
            // 登录失败
            showLoginStatus('error', '登录失败', '会员ID或密码错误，请检查后重试。如果您还没有账户，请先注册。', 
                '<a href="register.html" class="btn btn-primary">立即注册</a>');
        }
    });
}

// 显示登录状态
function showLoginStatus(type, title, message, actions) {
    // 隐藏登录表单
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.style.display = 'none';
    }
    
    // 隐藏忘记密码表单
    const forgotForm = document.getElementById('forgotPasswordForm');
    if (forgotForm) {
        forgotForm.style.display = 'none';
    }
    
    // 显示状态消息
    const statusMessage = document.getElementById('statusMessage');
    if (statusMessage) {
        statusMessage.style.display = 'block';
        
        document.getElementById('statusTitle').textContent = title;
        document.getElementById('statusText').textContent = message;
        document.getElementById('statusActions').innerHTML = actions;
        
        const statusCard = statusMessage.querySelector('.status-card');
        if (statusCard) {
            statusCard.className = `status-card ${type}`;
        }
    }
}

// 忘记密码功能
function showForgotPassword() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.style.display = 'none';
    }
    
    const statusMessage = document.getElementById('statusMessage');
    if (statusMessage) {
        statusMessage.style.display = 'none';
    }
    
    document.getElementById('forgotPasswordForm').style.display = 'block';
}

function showLoginForm() {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('forgotPasswordForm').style.display = 'none';
    
    const statusMessage = document.getElementById('statusMessage');
    if (statusMessage) {
        statusMessage.style.display = 'none';
    }
    // 已登录用户直接跳转会员中心，避免重复看到登录页
    const user = getCurrentUser();
    if (user) {
        try { window.location.href = 'member.html'; } catch(e) {}
    }
}

function sendResetEmail() {
    const memberId = document.getElementById('resetMemberId').value;
    if (!memberId) {
        document.getElementById('resetMemberIdError').textContent = '请输入会员ID';
        return;
    }
    
    // 模拟发送重置邮件
    alert('重置密码链接已发送到您的会员账户关联邮箱，请查收。');
    showLoginForm();
}

// 管理员功能
function handleAdminLogin() {
    const form = document.getElementById('adminLoginForm');
    if (!form) return;
    if (typeof window.loginAdmin === 'function') {
        return;
    }

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
async function loadAdminData() {
    try {
        if (window.apiClient) {
            const [pendingApplications, approvedMembers, rejectedApplications] = await Promise.all([
                window.apiClient.getApplications(),
                window.apiClient.getMembers(),
                window.apiClient.getRejectedApplications(),
            ]);

            document.getElementById('pendingCount').textContent = pendingApplications.length;
            document.getElementById('approvedCount').textContent = approvedMembers.length;
            document.getElementById('rejectedCount').textContent = rejectedApplications.length;

            loadPendingApplications(pendingApplications);
        } else {
            console.error('apiClient不可用');
            alert('无法加载管理数据，请刷新页面或联系技术支持');
        }
    } catch (error) {
        console.error('获取管理数据失败:', error);
        alert('加载管理数据失败，请重试');
    }
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
async function approveApplication(id) {
    try {
        if (window.apiClient) {
            await window.apiClient.approveApplication(id);
            await loadAdminData();
            alert('申请已通过');
        } else {
            console.error('apiClient不可用');
            alert('操作失败，请刷新页面或联系技术支持');
        }
    } catch (error) {
        console.error('审核申请失败:', error);
        alert('审核失败，请重试');
    }
}

// 拒绝申请
async function rejectApplication(id) {
    const reason = prompt('请输入拒绝理由:');
    if (!reason) return;
    
    try {
        if (window.apiClient) {
            await window.apiClient.rejectApplication(id, reason);
            await loadAdminData();
            alert('申请已拒绝');
        } else {
            console.error('apiClient不可用');
            alert('操作失败，请刷新页面或联系技术支持');
        }
    } catch (error) {
        console.error('拒绝申请失败:', error);
        alert('拒绝失败，请重试');
    }
}

// 加载捐款数据
async function loadDonationsData() {
    let donations = [];
    
    try {
        if (window.apiClient) {
            // 优先使用后端API
            donations = await window.apiClient.getDonations();
        } else {
            // 后备：使用本地存储
            donations = JSON.parse(localStorage.getItem('donationRecords') || '[]');
        }
    } catch (error) {
        console.error('获取捐款数据失败:', error);
        donations = JSON.parse(localStorage.getItem('donationRecords') || '[]');
    }
    
    const tableBody = document.getElementById('donationsTableBody');
    
    if (donations.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="4" class="no-data">暂无捐款记录</td></tr>';
        return;
    }

    tableBody.innerHTML = donations.map(donation => `
        <tr>
            <td>${donation.name}</td>
            <td>${donation.email}</td>
            <td>${donation.amount.toFixed(2)}</td>
            <td>${donation.time}</td>
        </tr>
    `).join('');
}

// 后台捐款数据导出/导入（用于跨浏览器同步）
function setupDonationsSyncControls() {
    const exportBtn = document.getElementById('exportDonationsBtn');
    const importBtn = document.getElementById('importDonationsBtn');
    const fileInput = document.getElementById('donationsImportFile');

    if (!exportBtn || !importBtn || !fileInput) return;

    exportBtn.addEventListener('click', function() {
        const donations = JSON.parse(localStorage.getItem('donationRecords') || '[]');
        const payload = { donationRecords: donations };
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `donations-${new Date().toISOString().slice(0,10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    importBtn.addEventListener('click', function() {
        fileInput.click();
    });

    fileInput.addEventListener('change', async function(e) {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        try {
            const text = await file.text();
            const data = JSON.parse(text);
            if (!data || !Array.isArray(data.donationRecords)) {
                alert('导入失败：文件格式不正确（需要包含 donationRecords 数组）');
                return;
            }
            localStorage.setItem('donationRecords', JSON.stringify(data.donationRecords));
            // 刷新捐款列表与汇总视图
            loadDonationsData();
            if (typeof loadDonationSummary === 'function') {
                loadDonationSummary();
            }
            alert(`已成功导入 ${data.donationRecords.length} 条捐款记录`);
        } catch (err) {
            console.error(err);
            alert('导入失败：' + (err && err.message ? err.message : '未知错误'));
        } finally {
            fileInput.value = '';
        }
    });
}

// 标签页切换（修复点击无响应问题）
function showTab(tabName, btn) {
    // 隐藏所有标签内容并移除active
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
        tab.style.display = 'none';
    });

    // 移除所有按钮的active类
    document.querySelectorAll('.tab-btn').forEach(b => {
        b.classList.remove('active');
    });

    // 显示选中的标签内容
    const target = document.getElementById(tabName + 'Tab');
    if (target) {
        target.classList.add('active');
        target.style.display = 'block';
    }

    // 设置当前按钮为active
    if (btn) {
        btn.classList.add('active');
    }

    // 进入特定标签时加载数据
    if (tabName === 'donations') {
        loadDonationsData();
    } else if (tabName === 'applications') {
        loadApplicationsData();
    } else if (tabName === 'summary') {
        loadDonationSummary();
    }
}

// 管理员退出登录
function logout() {
    if (confirm('确定要退出登录吗？')) {
        document.getElementById('adminLogin').style.display = 'block';
        document.getElementById('adminDashboard').style.display = 'none';
        document.getElementById('adminLoginForm').reset();
    }
}

// ===== 后台辅助函数（避免未定义错误） =====
function viewMemberDetails(username) {
    alert(`查看会员详情：${username}\n此功能为演示占位，可根据需要扩展。`);
}

function reconsiderApplication(username) {
    alert(`已标记申请人（${username}）为重新考虑。\n此功能为演示占位，可根据需要与数据存储结合。`);
}

function viewDetails(id) {
    alert(`查看申请详情（ID：${id}）。\n此功能为演示占位，可展示更丰富的申请信息。`);
}

function suspendMember(username) {
    alert(`已标记会员（${username}）为暂停。\n此功能为演示占位，可与会员状态管理结合。`);
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

    // 初始化后台捐款导出/导入控件（若存在）
    setupDonationsSyncControls();

    // 会员页面初始化
    if (document.getElementById('memberPage')) {
        initMemberPage();
    }

    // 游戏页面访问控制
    if (document.getElementById('gamesPage')) {
        initGamesPage();
    }

    // 捐款表单处理
    const donationForm = document.getElementById('donation-form');
    if (donationForm) {
        donationForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            // 在实际应用中，这里会调用支付网关
            
            // 收集捐款数据
            const amount = parseFloat(document.getElementById('amount').value || '0');
            const name = document.getElementById('name').value || '';
            const email = document.getElementById('email').value || ''; // 新增
            const method = (document.querySelector('input[name="payment_method"]:checked') || {}).value || 'unknown';
            const record = {
                name,
                amount,
                email, // 新增
                method,
                time: new Date().toLocaleString('zh-CN')
            };

            try {
                if (window.apiClient) {
                    // 优先使用后端API
                    await window.apiClient.addDonation(record);
                } else {
                    // 后备：保存到本地存储
                    const existing = JSON.parse(localStorage.getItem('donationRecords') || '[]');
                    existing.unshift(record); // 新记录放前面
                    localStorage.setItem('donationRecords', JSON.stringify(existing));
                }
            } catch (error) {
                console.error('保存捐款记录失败:', error);
                // 后备：保存到本地存储
                const existing = JSON.parse(localStorage.getItem('donationRecords') || '[]');
                existing.unshift(record); // 新记录放前面
                localStorage.setItem('donationRecords', JSON.stringify(existing));
            }

            // 渲染最新记录
            renderDonationRecords();

            // 隐藏表单并显示确认信息
            donationForm.style.display = 'none';
            document.getElementById('donation-confirmation').style.display = 'block';
        });
    }

    // 如果存在记录表格，则渲染
    async function renderDonationRecords() {
        const tbody = document.getElementById('donationRecordsBody');
        if (!tbody) return;
        
        let records = [];
        try {
            if (window.apiClient) {
                // 优先使用后端API
                records = await window.apiClient.getDonations();
            } else {
                // 后备：使用本地存储
                records = JSON.parse(localStorage.getItem('donationRecords') || '[]');
            }
        } catch (error) {
            console.error('获取捐款记录失败:', error);
            records = JSON.parse(localStorage.getItem('donationRecords') || '[]');
        }
        
        if (records.length === 0) {
            tbody.innerHTML = '<tr><td colspan="2" style="padding:8px;color:#666;">暂无记录</td></tr>';
            return;
        }
        tbody.innerHTML = records.map(r => `
            <tr>
                <td style="padding:8px; border-bottom:1px solid #eee;">${r.name}</td>
                <td style="padding:8px; border-bottom:1px solid #eee; text-align:right;">${Number(r.amount).toFixed(2)}</td>
            </tr>
        `).join('');
    }

    // 页面加载时尝试渲染
    renderDonationRecords().catch(console.error);

    // 会员申请表单处理
    const applicationForm = document.getElementById('applicationForm');
    if (applicationForm) {
        const totalFeeEl = document.getElementById('totalFee');
        const membershipRadios = document.querySelectorAll('input[name="membership_type"]');

        // 更新费用
        const updateTotalFee = () => {
            const selected = document.querySelector('input[name="membership_type"]:checked');
            totalFeeEl.textContent = parseFloat(selected.dataset.fee).toFixed(2);
        };

        membershipRadios.forEach(radio => radio.addEventListener('change', updateTotalFee));

        applicationForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(applicationForm);
            const applicationData = {
                id: Date.now(),
                fullName: formData.get('fullName'),
                email: formData.get('email'),
                membershipType: formData.get('membership_type'),
                fee: Number(document.getElementById('totalFee').textContent),
                paymentMethod: formData.get('payment_method'),
                status: 'pending',
                submitTime: new Date().toLocaleString('zh-CN')
            };

            try {
                if (window.apiClient) {
                    await window.apiClient.addApplication(applicationData);
                } else {
                    let applications = JSON.parse(localStorage.getItem('memberApplications') || '[]');
                    applications.push(applicationData);
                    localStorage.setItem('memberApplications', JSON.stringify(applications));
                }
            } catch (error) {
                console.error('提交申请失败:', error);
                let applications = JSON.parse(localStorage.getItem('memberApplications') || '[]');
                applications.push(applicationData);
                localStorage.setItem('memberApplications', JSON.stringify(applications));
            }

            // 显示成功消息
            applicationForm.style.display = 'none';
            document.getElementById('applicationSuccessMessage').style.display = 'block';
        });
    }
});

// 加载会员申请数据
async function loadApplicationsData() {
    const applicationsTableBody = document.getElementById('applicationsTableBody');
    if (applicationsTableBody) {
        let applications = [];
        try {
            if (window.apiClient) {
                applications = await window.apiClient.getApplications();
            } else {
                applications = JSON.parse(localStorage.getItem('memberApplications') || '[]');
            }
        } catch (error) {
            console.error('获取申请数据失败:', error);
            applications = JSON.parse(localStorage.getItem('memberApplications') || '[]');
        }

        const rows = applications.map(app => `
            <tr>
                <td>${app.fullName}</td>
                <td>${app.email}</td>
                <td>${app.membershipType}</td>
                <td>${app.fee}</td>
                <td>${app.paymentMethod}</td>
                <td>${app.submitTime}</td>
                <td><span class="status-badge ${app.status}">${app.status}</span></td>
                <td>
                    <button class="btn btn-success btn-sm" onclick="updateApplicationStatus(${app.id}, 'approved')">批准</button>
                    <button class="btn btn-danger btn-sm" onclick="updateApplicationStatus(${app.id}, 'rejected')">拒绝</button>
                </td>
            </tr>
        `);
        applicationsTableBody.innerHTML = rows.join('');
    }
}

// 更新会员申请状态
async function updateApplicationStatus(id, newStatus) {
    try {
        if (window.apiClient) {
            if (newStatus === 'approved') {
                await window.apiClient.approveApplication(id);
            } else if (newStatus === 'rejected') {
                const reason = prompt('请输入拒绝理由:') || '无';
                await window.apiClient.rejectApplication(id, reason);
            }
        } else {
            let applications = JSON.parse(localStorage.getItem('memberApplications') || '[]');
            const appIndex = applications.findIndex(app => app.id === id);
            if (appIndex !== -1) {
                applications[appIndex].status = newStatus;
                localStorage.setItem('memberApplications', JSON.stringify(applications));
            }
        }
        await loadApplicationsData(); // 重新加载数据以更新UI
    } catch (error) {
        console.error('更新申请状态失败:', error);
        alert('更新失败，请重试');
    }
}

// 会员捐款汇总：按邮箱聚合已通过会员的捐款总额与等级
async function loadDonationSummary() {
    const summaryBody = document.getElementById('donationSummaryBody');
    if (!summaryBody) return;

    try {
        let approvedMembers, donations, presence;

        if (window.apiClient) {
            [approvedMembers, donations, presence] = await Promise.all([
                window.apiClient.getMembers(),
                window.apiClient.getDonations(),
                window.apiClient.getUserPresence(),
            ]);
        } else {
            // Fallback to local storage, but keep it async to fix the level calculation bug
            approvedMembers = JSON.parse(localStorage.getItem('approvedMembers') || '[]');
            donations = JSON.parse(localStorage.getItem('donationRecords') || '[]');
            presence = JSON.parse(localStorage.getItem('userPresence') || '{}');
        }

        const totalsByEmail = donations.reduce((acc, d) => {
            const email = (d.email || '').toLowerCase();
            const amount = Number(d.amount || 0);
            if (!email) return acc;
            acc[email] = (acc[email] || 0) + (isFinite(amount) ? amount : 0);
            return acc;
        }, {});

        if (approvedMembers.length === 0) {
            summaryBody.innerHTML = '<tr><td colspan="7" class="no-data">暂无已通过会员</td></tr>';
            return;
        }

        const rows = await Promise.all(approvedMembers.map(async m => {
            const email = (m.email || '').toLowerCase();
            const total = totalsByEmail[email] || 0;
            const name = m.realName || m.fullName || m.username || '（未提供姓名）';
            const { level } = await computeMemberLevel(email); // Correctly await the async function
            const lastActive = presence[email] ? new Date(presence[email].lastSeen).toLocaleString() : '从未';
            const isOnline = presence[email] && (Date.now() - presence[email].lastSeen < 2 * 60 * 1000);

            return `
                <tr>
                    <td>${name}</td>
                    <td>${m.email || ''}</td>
                    <td>${level}级</td>
                    <td>${Number(total).toFixed(2)}</td>
                    <td><span class="status-badge ${isOnline ? 'online' : 'offline'}">${isOnline ? '在线' : '离线'}</span></td>
                    <td>${lastActive}</td>
                    <td>
                        <button class="btn btn-warning btn-sm" onclick="suspendMemberAccount('${email}')">暂停账户</button>
                        <button class="btn btn-danger btn-sm" onclick="resetMemberPassword('${email}')">重置密码</button>
                    </td>
                </tr>
            `;
        }));
        summaryBody.innerHTML = rows.join('');
    } catch (error) {
        console.error('加载捐款汇总失败:', error);
        summaryBody.innerHTML = '<tr><td colspan="7" class="no-data">加载数据失败</td></tr>';
    }
}

function suspendMemberAccount(email) {
    if (!confirm(`确定要暂停 ${email} 的账户吗？`)) return;
    alert(`已暂停 ${email} 的账户（功能待实现）。`);
}

// 全局变量存储当前要重置密码的会员邮箱
let currentResetEmail = null;

function resetMemberPassword(email) {
    currentResetEmail = email;
    document.getElementById('newPasswordInput').value = '';
    document.getElementById('confirmPasswordInput').value = '';
    document.getElementById('resetPasswordModal').style.display = 'block';
}

function closeResetPasswordModal() {
    document.getElementById('resetPasswordModal').style.display = 'none';
    currentResetEmail = null;
}

function confirmResetPassword() {
    const newPassword = document.getElementById('newPasswordInput').value.trim();
    const confirmPassword = document.getElementById('confirmPasswordInput').value.trim();
    
    if (!newPassword) {
        alert('请输入新密码');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        alert('两次输入的密码不一致');
        return;
    }
    
    if (newPassword.length < 6) {
        alert('密码长度至少为6位');
        return;
    }
    
    if (currentResetEmail) {
        // 在实际应用中，这里应该调用API更新密码
        alert(`已将 ${currentResetEmail} 的密码重置为新密码（功能待实现）。`);
        closeResetPasswordModal();
    }
}

// （移除重复的页面初始化监听，避免事件重复绑定）
// ---- 会员中心相关逻辑 ----
function getCurrentUser() {
    try { return JSON.parse(localStorage.getItem('currentUser') || 'null'); } catch { return null; }
}

function computeDonationTotalByEmail(email) {
    const records = JSON.parse(localStorage.getItem('donationRecords') || '[]');
    const total = records.reduce((sum, r) => sum + (r.email && r.email.toLowerCase() === (email||'').toLowerCase() ? Number(r.amount) || 0 : 0), 0);
    return Number(total);
}

async function getUserAvatar(email) {
    try {
        if (window.apiClient) {
            return await window.apiClient.getUserAvatar(email);
        } else {
            const map = JSON.parse(localStorage.getItem('userAvatars') || '{}');
            return map[(email||'').toLowerCase()] || '';
        }
    } catch (error) {
        console.error('获取头像失败:', error);
        return '';
    }
}

async function setUserAvatar(email, dataUrl) {
    try {
        if (window.apiClient) {
            await window.apiClient.setUserAvatar(email, dataUrl);
        } else {
            const key = (email||'').toLowerCase();
            const map = JSON.parse(localStorage.getItem('userAvatars') || '{}');
            map[key] = dataUrl;
            localStorage.setItem('userAvatars', JSON.stringify(map));
        }
    } catch (error) {
        console.error('保存头像失败:', error);
        alert('保存头像失败，请重试');
    }
}

async function getEventRegistrations(email) {
    try {
        if (window.apiClient) {
            const result = await window.apiClient.getEventRegistrations();
            // 确保返回的是数组
            const registrations = result.registrations || [];
            const em = (email||'').toLowerCase();
            return registrations.filter(r => (r.email||'').toLowerCase() === em);
        } else {
            const regs = JSON.parse(localStorage.getItem('eventRegistrations') || '[]');
            const em = (email||'').toLowerCase();
            return regs.filter(r => (r.email||'').toLowerCase() === em);
        }
    } catch (error) {
        console.error('获取活动报名记录失败:', error);
        return [];
    }
}

async function computeMemberLevel(email) {
    const donation = await computeDonationTotalByEmail(email);
    const contributions = (await getEventRegistrations(email)).length;
    const score = donation + contributions * 20;

    let level = 1;
    let requiredScore = 100; // 升到2级所需分数
    let cumulativeScore = 0;

    for (let i = 2; i <= 30; i++) {
        cumulativeScore += requiredScore;
        if (score >= cumulativeScore) {
            level = i;
            // 难度递增：后续每级所需分数增加 (i * 20)
            requiredScore += i * 20;
        } else {
            break;
        }
    }
    
    const nextThreshold = (level < 30) ? cumulativeScore + requiredScore : null;

    return { level, score, nextThreshold };
}

async function initMemberPage() {
    const user = getCurrentUser();
    if (!user) { window.location.href = 'login.html'; return; }

    // 填充基本信息
    document.getElementById('memberName').textContent = user.realName || user.username || '会员';
    document.getElementById('memberEmail').textContent = user.email || '';
    document.getElementById('memberId').textContent = user.id || '未分配';

    // 头像
    const avatar = await getUserAvatar(user.email);
    if (avatar) document.getElementById('memberAvatarImg').src = avatar;

    const avatarInput = document.getElementById('avatarInput');
    const saveBtn = document.getElementById('saveAvatarBtn');
    let tempAvatarData = '';
    if (avatarInput) {
        avatarInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = function() { tempAvatarData = reader.result; document.getElementById('memberAvatarImg').src = tempAvatarData; };
            reader.readAsDataURL(file);
        });
    }
    if (saveBtn) {
        saveBtn.addEventListener('click', async function() {
            if (tempAvatarData) { await setUserAvatar(user.email, tempAvatarData); alert('头像已保存'); }
        });
    }

    // 累计捐款
    const total = await computeDonationTotalByEmail(user.email);
    document.getElementById('donationTotal').textContent = Number(total).toFixed(2);

    // 会员等级
    const { level } = await computeMemberLevel(user.email);
    document.getElementById('memberLevel').textContent = level + '级';

    // 报名记录
    const regs = await getEventRegistrations(user.email);
    const tbody = document.getElementById('signupList');
    if (regs.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="no-data">暂无报名记录</td></tr>';
    } else {
        tbody.innerHTML = regs.map(r => `
            <tr>
                <td>${r.title}</td>
                <td>${r.location||''}</td>
                <td>${r.time||''}</td>
                <td>${r.registerTime||''}</td>
            </tr>
        `).join('');
    }
}

function initGamesPage() {
    const user = getCurrentUser();
    const gate = document.getElementById('gamesGate');
    const list = document.getElementById('gamesList');
    if (!user) { gate.style.display = 'block'; list.style.display = 'none'; }
    else {
        gate.style.display = 'none';
        list.style.display = 'grid';

        // 初始化打地鼠小游戏
        setupWhacGame();
        // 点击“打地鼠”卡片的开始按钮时启动
        list.addEventListener('click', function(e) {
            const btn = e.target.closest('.btn');
            if (!btn) return;
            const item = btn.closest('.event-item');
            const title = (item && item.querySelector('h3')) ? item.querySelector('h3').textContent : '';
            if (title.includes('打地鼠')) {
                e.preventDefault();
                startWhacGame();
            }
        });
    }
}

// ---- 活动报名（事件委托） ----
document.addEventListener('click', async function(e) {
    const target = e.target;
    if (target && target.matches('.event-actions .btn') && target.textContent.includes('报名')) {
        e.preventDefault();
        const user = getCurrentUser();
        if (!user) { alert('请先登录会员账户再报名活动'); window.location.href = 'login.html'; return; }
        const item = target.closest('.event-item');
        if (!item) return;
        const title = (item.querySelector('h3')||{}).textContent || '活动';
        const location = (item.querySelector('.event-meta p i.fa-map-marker-alt')||{}).parentElement?.textContent || '';
        const time = (item.querySelector('.event-meta p i.fa-clock')||{}).parentElement?.textContent || '';
        
        const registration = { email: user.email, title, location, time, registerTime: new Date().toLocaleString('zh-CN') };

        try {
            if (window.apiClient) {
                await window.apiClient.addEventRegistration(registration);
            } else {
                const regs = JSON.parse(localStorage.getItem('eventRegistrations') || '[]');
                regs.unshift(registration);
                localStorage.setItem('eventRegistrations', JSON.stringify(regs));
            }
            alert('报名成功！可在会员中心查看报名记录');
        } catch (error) {
            console.error('报名失败:', error);
            alert('报名失败，请重试');
        }
    }
});

// ---- 简易打地鼠（Whac-a-Mole）----
function setupWhacGame() {
    const grid = document.getElementById('whacGrid');
    if (!grid) return;
    // 创建 3x3 网格
    grid.innerHTML = '';
    for (let i = 0; i < 9; i++) {
        const cell = document.createElement('div');
        cell.style.width = '120px';
        cell.style.height = '120px';
        cell.style.border = '1px solid #ddd';
        cell.style.borderRadius = '8px';
        cell.style.display = 'flex';
        cell.style.alignItems = 'center';
        cell.style.justifyContent = 'center';
        cell.style.background = '#fafafa';
        cell.style.cursor = 'pointer';
        cell.dataset.index = i;
        grid.appendChild(cell);
    }

    const startBtn = document.getElementById('whacStartBtn');
    if (startBtn) {
        startBtn.addEventListener('click', function(e) { e.preventDefault(); startWhacGame(); });
    }
}

// ---- 会员群聊与在线状态 ----
function initChatPage() {
    const user = getCurrentUser();
    if (!user) { window.location.href = 'login.html'; return; }

    // 心跳更新在线状态
    updatePresence(user.email);
    const heartbeat = setInterval(() => updatePresence(user.email), 30000);
    window.addEventListener('beforeunload', () => clearInterval(heartbeat));

    // 渲染会员列表（approvedMembers）
    renderChatMembers();
    // 渲染历史消息
    renderChatMessages();

    // 发送消息
    const sendBtn = document.getElementById('chatSendBtn');
    const input = document.getElementById('chatMessageInput');
    if (sendBtn && input) {
        sendBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            const text = (input.value || '').trim();
            if (!text) return;
            const message = { email: user.email, name: user.realName || user.username || '会员', text, time: new Date().toLocaleString('zh-CN') };
            
            try {
                if (window.apiClient) {
                    await window.apiClient.addChatMessage(message);
                } else {
                    const messages = JSON.parse(localStorage.getItem('chatMessages') || '[]');
                    messages.push(message);
                    localStorage.setItem('chatMessages', JSON.stringify(messages));
                }
            } catch (error) {
                console.error('发送消息失败:', error);
                const messages = JSON.parse(localStorage.getItem('chatMessages') || '[]');
                messages.push(message);
                localStorage.setItem('chatMessages', JSON.stringify(messages));
            }
            
            input.value = '';
            await renderChatMessages(true);
        });
    }

    // 同源标签之间的实时更新（storage事件）
    // window.addEventListener('storage', function(ev) {
    //     if (ev.key === 'chatMessages' || ev.key === 'memberPresence' || ev.key === 'approvedMembers') {
    //         renderChatMembers();
    //         renderChatMessages(true);
    //     }
    // });
}

function updatePresence(email) {
    const presence = JSON.parse(localStorage.getItem('memberPresence') || '{}');
    presence[(email || '').toLowerCase()] = Date.now();
    localStorage.setItem('memberPresence', JSON.stringify(presence));
}

function renderChatMembers() {
    const list = document.getElementById('chatMembers');
    if (!list) return;
    const members = JSON.parse(localStorage.getItem('approvedMembers') || '[]');
    const presence = JSON.parse(localStorage.getItem('memberPresence') || '{}');
    const now = Date.now();
    list.innerHTML = members.map(m => {
        const email = (m.email || '').toLowerCase();
        const last = presence[email] || 0;
        const online = now - last < 2 * 60 * 1000; // 2分钟内活跃视为在线
        const name = m.realName || m.fullName || m.username || '会员';
        return `<li style="padding:8px 0; border-bottom:1px solid #eee; display:flex; justify-content:space-between;">
            <span>${name} <small style="color:#666;">(${m.email || ''})</small></span>
            <span style="color:${online ? '#2e7d32' : '#888'};">${online ? '在线' : '离线'}</span>
        </li>`;
    }).join('');
}

async function renderChatMessages(scrollToEnd=false) {
    const win = document.getElementById('chatWindow');
    if (!win) return;
    
    let messages = [];
    try {
        if (window.apiClient) {
            messages = await window.apiClient.getChatMessages();
        } else {
            messages = JSON.parse(localStorage.getItem('chatMessages') || '[]');
        }
    } catch (error) {
        console.error('获取聊天消息失败:', error);
        messages = JSON.parse(localStorage.getItem('chatMessages') || '[]');
    }

    const current = getCurrentUser();
    win.innerHTML = messages.slice(-200).map(msg => {
        const isMe = current && (current.email || '').toLowerCase() === (msg.email || '').toLowerCase();
        return `<div style="margin:6px 0; display:flex; ${isMe ? 'justify-content:flex-end;' : 'justify-content:flex-start;'}">
            <div style="max-width:70%; background:${isMe ? '#c5e1a5' : '#e0e0e0'}; padding:8px 10px; border-radius:8px;">
                <div style="font-size:12px; color:#555;">${escapeHtml(msg.name || '')} · ${msg.time || ''}</div>
                <div style="margin-top:4px;">${escapeHtml(msg.text || '')}</div>
            </div>
        </div>`;
    }).join('');
    
    if (scrollToEnd) {
        win.scrollTop = win.scrollHeight;
    }
}

function escapeHtml(str) {
    return String(str).replace(/[&<>"]+/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[s]));
}

// 页面加载时初始化相应功能（补充聊天页面）
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('chatPage')) {
        initChatPage();
    }
});

let whacTimer = null;
let whacTick = null;
let whacActiveIndex = -1;
let whacTimeLeft = 30;
let whacScore = 0;

function startWhacGame() {
    const section = document.getElementById('simpleGame');
    const grid = document.getElementById('whacGrid');
    const scoreEl = document.getElementById('whacScore');
    const timeEl = document.getElementById('whacTime');
    if (!section || !grid) return;
    section.style.display = 'block';

    // 重置状态
    whacScore = 0;
    whacTimeLeft = 30;
    scoreEl.textContent = whacScore;
    timeEl.textContent = whacTimeLeft;
    clearInterval(whacTimer); clearInterval(whacTick);

    // 点击处理
    grid.querySelectorAll('div').forEach(cell => {
        cell.onclick = function() {
            const idx = Number(this.dataset.index);
            if (idx === whacActiveIndex) {
                whacScore += 1;
                scoreEl.textContent = whacScore;
                // 击中后马上刷新
                renderWhacActive(-1);
                setTimeout(spawnWhac, 100);
            }
        };
    });

    // 每秒倒计时
    whacTick = setInterval(() => {
        whacTimeLeft -= 1;
        timeEl.textContent = whacTimeLeft;
        if (whacTimeLeft <= 0) {
            clearInterval(whacTimer); clearInterval(whacTick);
            renderWhacActive(-1);
            alert(`时间到！你的分数：${whacScore}`);
        }
    }, 1000);

    // 每800ms生成地鼠
    whacTimer = setInterval(spawnWhac, 800);
    spawnWhac();
}

function spawnWhac() {
    const next = Math.floor(Math.random() * 9);
    renderWhacActive(next);
}

function renderWhacActive(index) {
    const grid = document.getElementById('whacGrid');
    if (!grid) return;
    whacActiveIndex = index;
    grid.querySelectorAll('div').forEach((cell, i) => {
        if (i === index) {
            cell.style.background = '#ffd54f';
            cell.textContent = '🐹';
            cell.style.fontSize = '42px';
        } else {
            cell.style.background = '#fafafa';
            cell.textContent = '';
            cell.style.fontSize = '16px';
        }
    });
}
// 会话驱动的导航控制
function updateNavSessionState() {
    const user = getCurrentUser();
    const nav = document.querySelector('nav, .navbar');
    if (!nav) return;
    const links = nav.querySelectorAll('a');
    links.forEach(a => {
        const href = (a.getAttribute('href')||'').toLowerCase();
        if (href.includes('login.html')) {
            a.style.display = user ? 'none' : '';
        }
        if (href.includes('member.html')) {
            a.style.display = user ? '' : 'none';
        }
    });
}
