/**
 * API客户端 - 后端API接口封装
 * 用于替代localStorage实现多浏览器同步
 */

class ApiClient {
    constructor(baseUrl) {
        let configured = null;
        try {
            configured = (typeof window !== 'undefined' && window.localStorage) ? localStorage.getItem('apiBaseUrl') : null;
        } catch {}
        const origin = (typeof window !== 'undefined' && window.location && window.location.origin) ? window.location.origin : 'http://localhost:5050';
        this.baseUrl = baseUrl || configured || origin;
        this.cache = {};
        this.cacheTimeout = 5000;
    }

    /**
     * 基础请求方法
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
            },
        };

        const response = await fetch(url, {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...options.headers,
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    }

    /**
     * 获取所有数据
     */
    async getAllData() {
        const cacheKey = 'allData';
        const cached = this.getCache(cacheKey);
        if (cached) return cached;

        try {
            const data = await this.request('/api/data');
            this.setCache(cacheKey, data);
            return data;
        } catch (error) {
            console.error('获取所有数据失败:', error);
            return this.getFallbackData();
        }
    }

    /**
     * 更新所有数据
     */
    async updateAllData(data) {
        try {
            const result = await this.request('/api/data', {
                method: 'POST',
                body: JSON.stringify(data),
            });
            this.clearCache();
            return result;
        } catch (error) {
            console.error('更新数据失败:', error);
            throw error;
        }
    }

    /**
     * 获取捐款记录
     */
    async getDonations() {
        const cacheKey = 'donations';
        const cached = this.getCache(cacheKey);
        if (cached) return cached;

        try {
            const data = await this.request('/api/donations');
            this.setCache(cacheKey, data);
            return data;
        } catch (error) {
            console.error('获取捐款记录失败:', error);
            return [];
        }
    }

    /**
     * 添加捐款记录
     */
    async addDonation(donation) {
        try {
            const result = await this.request('/api/donations', {
                method: 'POST',
                body: JSON.stringify(donation),
            });
            this.clearCache();
            return result;
        } catch (error) {
            console.error('添加捐款记录失败:', error);
            throw error;
        }
    }

    /**
     * 获取会员列表
     */
    async getMembers() {
        const cacheKey = 'members';
        const cached = this.getCache(cacheKey);
        if (cached) return cached;

        try {
            const data = await this.request('/api/members');
            this.setCache(cacheKey, data);
            return data;
        } catch (error) {
            console.error('获取会员列表失败:', error);
            return [];
        }
    }

    /**
     * 添加会员
     */
    async addMember(member) {
        try {
            const result = await this.request('/api/members', {
                method: 'POST',
                body: JSON.stringify(member),
            });
            this.clearCache();
            return result;
        } catch (error) {
            console.error('添加会员失败:', error);
            throw error;
        }
    }

    /**
     * 更新会员信息
     */
    async updateMember(memberId, updates) {
        try {
            const result = await this.request(`/api/members/${memberId}`, {
                method: 'PUT',
                body: JSON.stringify(updates),
            });
            this.clearCache();
            return result;
        } catch (error) {
            console.error('更新会员信息失败:', error);
            throw error;
        }
    }

    // 钱包相关API
    async getWallet(userId) {
        try {
            const result = await this.request(`/api/wallet/${userId}`);
            return result;
        } catch (error) {
            console.error('获取钱包信息失败:', error);
            throw error;
        }
    }

    async depositToWallet(userId, amount) {
        try {
            const result = await this.request('/api/wallet/deposit', {
                method: 'POST',
                body: JSON.stringify({
                    user_id: userId,
                    amount: amount
                }),
            });
            this.clearCache();
            return result;
        } catch (error) {
            console.error('钱包充值失败:', error);
            throw error;
        }
    }

    async withdrawFromWallet(userId, amount) {
        try {
            const result = await this.request('/api/wallet/withdraw', {
                method: 'POST',
                body: JSON.stringify({
                    user_id: userId,
                    amount: amount
                }),
            });
            this.clearCache();
            return result;
        } catch (error) {
            console.error('钱包提款失败:', error);
            throw error;
        }
    }

    async getWalletTransactions(userId, limit = 50) {
        try {
            const result = await this.request(`/api/wallet/transactions/${userId}?limit=${limit}`);
            return result;
        } catch (error) {
            console.error('获取钱包交易记录失败:', error);
            throw error;
        }
    }

    async changePassword(memberId, currentPassword, newPassword) {
        try {
            const result = await this.request('/api/user/change-password', {
                method: 'POST',
                body: JSON.stringify({
                    memberId,
                    currentPassword,
                    newPassword
                }),
            });
            return result;
        } catch (error) {
            console.error('修改密码失败:', error);
            throw error;
        }
    }

    async getUserDonations(userId) {
        try {
            const result = await this.request(`/api/donations/user/${userId}`);
            return result;
        } catch (error) {
            console.error('获取用户捐款记录失败:', error);
            throw error;
        }
    }

    /**
     * 获取申请列表
     */
    async getApplications() {
        const cacheKey = 'applications';
        const cached = this.getCache(cacheKey);
        if (cached) return cached;

        try {
            const data = await this.request('/api/applications');
            this.setCache(cacheKey, data);
            return data;
        } catch (error) {
            console.error('获取申请列表失败:', error);
            return [];
        }
    }

    /**
     * 获取被拒绝的申请列表
     */
    async getRejectedApplications() {
        const cacheKey = 'rejectedApplications';
        const cached = this.getCache(cacheKey);
        if (cached) return cached;

        try {
            // 假设后端提供了专门的端点
            const data = await this.request('/api/applications/rejected');
            this.setCache(cacheKey, data);
            return data;
        } catch (error) {
            console.error('获取被拒绝的申请列表失败:', error);
            return [];
        }
    }

    /**
     * 添加申请
     */
    async addApplication(application) {
        try {
            const result = await this.request('/api/applications', {
                method: 'POST',
                body: JSON.stringify(application),
            });
            this.clearCache();
            return result;
        } catch (error) {
            console.error('添加申请失败:', error);
            throw error;
        }
    }

    async approveApplication(id) {
        try {
            const data = await this.getAllData();
            data.applications = Array.isArray(data.applications) ? data.applications : [];
            data.members = Array.isArray(data.members) ? data.members : [];
            const idx = data.applications.findIndex(a => String(a.id) === String(id));
            if (idx === -1) throw new Error('application_not_found');
            const app = data.applications[idx];
            app.status = 'approved';
            const exists = data.members.find(m => (m.email||'').toLowerCase() === (app.email||'').toLowerCase());
            if (!exists) {
                data.members.push({
                    id: String(Date.now()),
                    username: app.username || app.fullName || app.email || '',
                    email: app.email || '',
                    realName: app.realName || app.fullName || '',
                    password: app.password || '',
                    joined_at: new Date().toISOString()
                });
            }
            await this.updateAllData(data);
            this.clearCache();
            return { success: true };
        } catch (error) {
            console.error('批准申请失败:', error);
            throw error;
        }
    }

    async rejectApplication(id, reason) {
        try {
            const data = await this.getAllData();
            data.applications = Array.isArray(data.applications) ? data.applications : [];
            const idx = data.applications.findIndex(a => String(a.id) === String(id));
            if (idx === -1) throw new Error('application_not_found');
            const app = data.applications[idx];
            app.status = 'rejected';
            app.rejectReason = reason || '无';
            await this.updateAllData(data);
            this.clearCache();
            return { success: true };
        } catch (error) {
            console.error('拒绝申请失败:', error);
            throw error;
        }
    }

    /**
     * 获取用户在线状态
     */
    async getUserPresence() {
        const cacheKey = 'userPresence';
        const cached = this.getCache(cacheKey);
        if (cached) return cached;

        try {
            const data = await this.request('/api/user-presence');
            this.setCache(cacheKey, data);
            return data;
        } catch (error) {
            console.error('获取用户在线状态失败:', error);
            return {};
        }
    }

    /**
     * 更新用户在线状态
     */
    async updateUserPresence(username, online) {
        try {
            const result = await this.request('/api/user-presence', {
                method: 'POST',
                body: JSON.stringify({
                    username: username,
                    online: online,
                }),
            });
            this.clearCache();
            return result;
        } catch (error) {
            console.error('更新用户在线状态失败:', error);
            throw error;
        }
    }

    /**
     * 用户登录 - 支持会员ID或用户名
     */
    async login(memberId, password) {
        try {
            const result = await this.request('/api/login', {
                method: 'POST',
                body: JSON.stringify({
                    memberId: memberId,
                    password: password,
                }),
            });
            return result;
        } catch (error) {
            console.error('登录失败:', error);
            throw error;
        }
    }

    /**
     * 按用户名登录（用于自动注册后的自动登录）
     */
    async loginByUsername(username, password) {
        try {
            const result = await this.request('/api/login', {
                method: 'POST',
                body: JSON.stringify({
                    username: username,
                    password: password,
                }),
            });
            return result;
        } catch (error) {
            console.error('按用户名登录失败:', error);
            throw error;
        }
    }

    /**
     * 管理员登录
     */
    async adminLogin(username, password) {
        try {
            const result = await this.request('/api/admin/login', {
                method: 'POST',
                body: JSON.stringify({
                    username: username,
                    password: password,
                }),
            });
            return result;
        } catch (error) {
            console.error('管理员登录失败:', error);
            throw error;
        }
    }

    /**
     * 验证管理员会话
     */
    async validateAdminSession(token) {
        try {
            const result = await this.request('/api/admin/validate', {
                method: 'POST',
                body: JSON.stringify({ token }),
            });
            return result;
        } catch (error) {
            console.error('验证管理员会话失败:', error);
            throw error;
        }
    }

    /**
     * 管理员退出登录
     */
    async adminLogout(token) {
        try {
            const result = await this.request('/api/admin/logout', {
                method: 'POST',
                body: JSON.stringify({ token }),
            });
            return result;
        } catch (error) {
            console.error('管理员退出登录失败:', error);
            throw error;
        }
    }

    /**
     * 获取用户头像
     */
    async getUserAvatar(userId) {
        try {
            // 返回默认头像或根据用户ID生成头像
            const defaultAvatar = `https://ui-avatars.com/api/?name=User&background=00ff88&color=000&size=128`;
            return {
                success: true,
                avatar: defaultAvatar
            };
        } catch (error) {
            console.error('获取用户头像失败:', error);
            return {
                success: false,
                avatar: `https://ui-avatars.com/api/?name=User&background=00ff88&color=000&size=128`
            };
        }
    }

    /**
     * 设置用户头像
     */
    async setUserAvatar(userId, avatarData) {
        try {
            // 这里可以实现头像上传到后端的功能
            // 目前只是模拟保存成功
            console.log('保存用户头像:', userId, avatarData ? '头像数据已接收' : '无头像数据');
            return {
                success: true,
                message: '头像保存成功'
            };
        } catch (error) {
            console.error('保存用户头像失败:', error);
            return {
                success: false,
                message: '头像保存失败'
            };
        }
    }

    /**
     * 获取活动报名记录
     */
    async getEventRegistrations(userId) {
        try {
            // 返回模拟的活动报名记录或空数组
            return {
                success: true,
                registrations: []
            };
        } catch (error) {
            console.error('获取活动报名记录失败:', error);
            return {
                success: true,
                registrations: []
            };
        }
    }

    /**
     * 自动注册会员
     */
    async autoRegister(userData = {}) {
        try {
            const result = await this.request('/api/auto-register', {
                method: 'POST',
                body: JSON.stringify(userData),
            });
            
            // 自动登录新注册的用户
            if (result.success) {
                try {
                    const loginResult = await this.loginByUsername(result.user.username, result.user.password);
                    // 登录成功则写入本地会话
                    if (loginResult && loginResult.success && loginResult.user) {
                        try {
                            localStorage.removeItem('currentUser');
                        } catch {}
                        const u = loginResult.user;
                        localStorage.setItem('currentUser', JSON.stringify({
                            id: u.id,
                            username: u.username,
                            email: u.email || '',
                            memberNumber: u.memberId || '',
                            level: '1级'
                        }));
                    }
                    return {
                        ...result,
                        loginSuccess: loginResult.success,
                        loginMessage: loginResult.message
                    };
                } catch (loginError) {
                    console.error('自动登录失败:', loginError);
                    return {
                        ...result,
                        loginSuccess: false,
                        loginMessage: '注册成功但自动登录失败'
                    };
                }
            }
            
            return result;
        } catch (error) {
            console.error('自动注册失败:', error);
            throw error;
        }
    }

    /**
     * 缓存相关方法
     */
    getCache(key) {
        const cached = this.cache[key];
        if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
            return cached.data;
        }
        return null;
    }

    setCache(key, data) {
        this.cache[key] = {
            data: data,
            timestamp: Date.now(),
        };
    }

    clearCache() {
        this.cache = {};
    }

    /**
     * 后备数据（当API不可用时）
     */
    getFallbackData() {
        return {
            donations: [],
            members: [],
            applications: [],
            events: [],
            userPresence: {},
        };
    }
}

// 创建全局API客户端实例
const apiClient = new ApiClient();

/**
 * 兼容性包装函数 - 用于替换原有的localStorage操作
 */

// 模拟localStorage的API，但实际使用后端
const backendStorage = {
    async getItem(key) {
        try {
            const allData = await apiClient.getAllData();
            return JSON.stringify(allData[key] || null);
        } catch (error) {
            console.error('获取数据失败:', error);
            return null;
        }
    },

    async setItem(key, value) {
        try {
            const allData = await apiClient.getAllData();
            allData[key] = JSON.parse(value);
            await apiClient.updateAllData(allData);
            return true;
        } catch (error) {
            console.error('保存数据失败:', error);
            return false;
        }
    },

    async removeItem(key) {
        try {
            const allData = await apiClient.getAllData();
            delete allData[key];
            await apiClient.updateAllData(allData);
            return true;
        } catch (error) {
            console.error('删除数据失败:', error);
            return false;
        }
    },

    // 同步版本（用于向后兼容）
    getItemSync(key) {
        // 返回本地缓存或默认值
        return localStorage.getItem(key) || 'null';
    },

    setItemSync(key, value) {
        // 同时保存到localStorage和后端（用于向后兼容）
        localStorage.setItem(key, value);
        // 异步保存到后端
        this.setItem(key, value).catch(console.error);
        return true;
    }
};

/**
 * 数据同步管理器
 */
class DataSyncManager {
    constructor() {
        this.syncInterval = 30000; // 30秒同步一次
        this.isSyncing = false;
        this.startAutoSync();
    }

    /**
     * 开始自动同步
     */
    startAutoSync() {
        setInterval(() => {
            this.syncAllData();
        }, this.syncInterval);
    }

    /**
     * 同步所有数据
     */
    async syncAllData() {
        if (this.isSyncing) return;
        
        this.isSyncing = true;
        try {
            console.log('开始数据同步...');
            
            // 从后端获取最新数据
            const serverData = await apiClient.getAllData();
            
            // 更新本地localStorage
            for (const [key, value] of Object.entries(serverData)) {
                if (value !== null && value !== undefined) {
                    localStorage.setItem(key, JSON.stringify(value));
                }
            }
            
            console.log('数据同步完成');
        } catch (error) {
            console.error('数据同步失败:', error);
        } finally {
            this.isSyncing = false;
        }
    }

    /**
     * 手动触发同步
     */
    async manualSync() {
        return this.syncAllData();
    }
}

// 创建数据同步管理器实例
const dataSyncManager = new DataSyncManager();

/**
     * 导出供全局使用的函数
     */
window.apiClient = apiClient;
window.backendStorage = backendStorage;
window.dataSyncManager = dataSyncManager;