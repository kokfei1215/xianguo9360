#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
极简后端API服务器 - 实现多浏览器实时同步
使用Flask框架提供RESTful API接口
"""

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import json
import os
from datetime import datetime
import threading
import time
import random
import string
import re

app = Flask(__name__)
CORS(app)  # 启用跨域支持

# 数据文件路径
DATA_FILE = 'data.json'
USERS_FILE = 'users.json'

# 全局数据锁，确保线程安全
data_lock = threading.Lock()

def load_json_data(filename, default_data=None):
    """安全加载JSON数据"""
    if default_data is None:
        default_data = {}
    
    try:
        if os.path.exists(filename):
            with data_lock:
                with open(filename, 'r', encoding='utf-8') as f:
                    return json.load(f)
    except Exception as e:
        print(f"加载 {filename} 失败: {e}")
    
    return default_data

def save_json_data(filename, data):
    """安全保存JSON数据"""
    try:
        with data_lock:
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
        return True
    except Exception as e:
        print(f"保存 {filename} 失败: {e}")
        return False

# 初始化数据文件
if not os.path.exists(DATA_FILE):
    initial_data = {
        "donations": [],
        "members": [],
        "applications": [],
        "events": [],
        "userPresence": {}
    }
    save_json_data(DATA_FILE, initial_data)

if not os.path.exists(USERS_FILE):
    initial_users = {
        "users": [
            {
                "username": "admin",
                "password": "admin123",
                "role": "admin",
                "created_at": datetime.now().isoformat()
            }
        ]
    }
    save_json_data(USERS_FILE, initial_users)

# API路由

@app.route('/api/data', methods=['GET'])
def get_all_data():
    """获取所有数据"""
    data = load_json_data(DATA_FILE)
    return jsonify(data)

@app.route('/api/data', methods=['POST'])
def update_all_data():
    """更新所有数据"""
    try:
        new_data = request.get_json()
        if save_json_data(DATA_FILE, new_data):
            return jsonify({"success": True, "message": "数据更新成功"})
        else:
            return jsonify({"success": False, "message": "数据保存失败"}), 500
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 400

@app.route('/api/auto-register', methods=['POST'])
def auto_register():
    """自动注册会员"""
    try:
        registration_data = request.get_json() or {}
        
        # 生成自动用户信息
        username = registration_data.get('username') or generate_auto_username()
        password = registration_data.get('password') or generate_auto_password()
        email = registration_data.get('email') or f"auto_{int(time.time())}@jlp.temp"
        
        # 验证邮箱格式
        if email != f"auto_{int(time.time())}@jlp.temp" and not validate_email(email):
            return jsonify({"success": False, "message": "邮箱格式不正确"}), 400
        
        # 验证手机号格式（如果提供）
        phone = registration_data.get('phone', '')
        if phone and not validate_phone(phone):
            return jsonify({"success": False, "message": "手机号格式不正确"}), 400
        
        # 检查用户名是否已存在
        users_data = load_json_data(USERS_FILE)
        existing_users = users_data.get('users', [])
        
        for user in existing_users:
            if user.get('username') == username:
                # 如果用户名冲突，生成新的用户名
                username = generate_auto_username()
                break
        
        # 创建新用户
        new_user = {
            "id": str(int(time.time() * 1000)),
            "username": username,
            "password": password,
            "email": email,
            "phone": phone,
            "realName": registration_data.get('realName', ''),
            "city": registration_data.get('city', ''),
            "interests": registration_data.get('interests', ''),
            "role": "member",
            "status": "active",  # 自动注册的用户直接激活
            "auto_registered": True,
            "created_at": datetime.now().isoformat()
        }
        
        # 添加到用户列表
        if 'users' not in users_data:
            users_data['users'] = []
        users_data['users'].append(new_user)
        
        # 保存到文件
        if save_json_data(USERS_FILE, users_data):
            # 同时添加到会员列表
            data = load_json_data(DATA_FILE)
            if 'members' not in data:
                data['members'] = []
            
            member_info = {
                "id": new_user['id'],
                "username": username,
                "email": email,
                "realName": new_user['realName'],
                "phone": phone,
                "city": new_user['city'],
                "interests": new_user['interests'],
                "joined_at": new_user['created_at'],
                "status": "active",
                "auto_registered": True
            }
            data['members'].append(member_info)
            save_json_data(DATA_FILE, data)
            
            # 记录注册统计
            print(f"自动注册用户成功: {username} ({email})")
            
            return jsonify({
                "success": True, 
                "message": "自动注册成功",
                "user": {
                    "username": username,
                    "password": password,
                    "email": email,
                    "id": new_user['id']
                },
                "login_info": {
                    "username": username,
                    "password": password
                }
            })
        else:
            return jsonify({"success": False, "message": "用户数据保存失败"}), 500
            
    except Exception as e:
        print(f"自动注册失败: {e}")
        return jsonify({"success": False, "message": f"注册失败: {str(e)}"}), 400

@app.route('/api/donations', methods=['GET'])
def get_donations():
    """获取捐款记录"""
    data = load_json_data(DATA_FILE)
    return jsonify(data.get('donations', []))

@app.route('/api/donations', methods=['POST'])
def add_donation():
    """添加捐款记录"""
    try:
        donation = request.get_json()
        data = load_json_data(DATA_FILE)
        
        if 'donations' not in data:
            data['donations'] = []
        
        donation['id'] = str(int(time.time() * 1000))
        donation['created_at'] = datetime.now().isoformat()
        data['donations'].append(donation)
        
        if save_json_data(DATA_FILE, data):
            return jsonify({"success": True, "message": "捐款记录添加成功", "id": donation['id']})
        else:
            return jsonify({"success": False, "message": "数据保存失败"}), 500
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 400

@app.route('/api/donations/user/<user_id>', methods=['GET'])
def get_user_donations(user_id):
    """获取指定用户的捐款记录"""
    try:
        data = load_json_data(DATA_FILE)
        donations = data.get('donations', [])
        
        # 筛选该用户的捐款记录
        user_donations = [d for d in donations if str(d.get('user_id')) == str(user_id)]
        
        # 计算捐款总额
        total_amount = sum(float(d.get('amount', 0)) for d in user_donations)
        
        return jsonify({
            "success": True,
            "donations": user_donations,
            "total_amount": total_amount,
            "count": len(user_donations)
        })
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 400

@app.route('/api/members', methods=['GET'])
def get_members():
    """获取会员列表"""
    data = load_json_data(DATA_FILE)
    return jsonify(data.get('members', []))

@app.route('/api/members', methods=['POST'])
def add_member():
    """添加会员"""
    try:
        member = request.get_json()
        data = load_json_data(DATA_FILE)
        
        if 'members' not in data:
            data['members'] = []
        
        member['id'] = str(int(time.time() * 1000))
        member['joined_at'] = datetime.now().isoformat()
        data['members'].append(member)
        
        if save_json_data(DATA_FILE, data):
            return jsonify({"success": True, "message": "会员添加成功", "id": member['id']})
        else:
            return jsonify({"success": False, "message": "数据保存失败"}), 500
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 400

@app.route('/api/members/<member_id>', methods=['PUT'])
def update_member(member_id):
    """更新会员信息"""
    try:
        update_data = request.get_json()
        data = load_json_data(DATA_FILE)
        
        if 'members' not in data:
            return jsonify({"success": False, "message": "会员列表为空"}), 404
        
        member_found = False
        for i, member in enumerate(data['members']):
            if member.get('id') == member_id:
                data['members'][i].update(update_data)
                member_found = True
                break
        
        if not member_found:
            return jsonify({"success": False, "message": "会员不存在"}), 404
        
        if save_json_data(DATA_FILE, data):
            return jsonify({"success": True, "message": "会员信息更新成功"})
        else:
            return jsonify({"success": False, "message": "数据保存失败"}), 500
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 400

@app.route('/api/applications', methods=['GET'])
def get_applications():
    """获取申请列表"""
    data = load_json_data(DATA_FILE)
    return jsonify(data.get('applications', []))

@app.route('/api/applications', methods=['POST'])
def add_application():
    """添加申请"""
    try:
        application = request.get_json()
        data = load_json_data(DATA_FILE)
        
        if 'applications' not in data:
            data['applications'] = []
        
        application['id'] = str(int(time.time() * 1000))
        application['created_at'] = datetime.now().isoformat()
        data['applications'].append(application)
        
        if save_json_data(DATA_FILE, data):
            return jsonify({"success": True, "message": "申请添加成功", "id": application['id']})
        else:
            return jsonify({"success": False, "message": "数据保存失败"}), 500
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 400

@app.route('/api/applications/rejected', methods=['GET'])
def get_rejected_applications():
    """获取被拒绝的申请列表"""
    data = load_json_data(DATA_FILE)
    applications = data.get('applications', [])
    rejected_applications = [app for app in applications if app.get('status') == 'rejected']
    return jsonify(rejected_applications)

@app.route('/api/user-presence', methods=['GET'])
def get_user_presence():
    """获取用户在线状态"""
    data = load_json_data(DATA_FILE)
    return jsonify(data.get('userPresence', {}))

@app.route('/api/user-presence', methods=['POST'])
def update_user_presence():
    """更新用户在线状态"""
    try:
        presence_data = request.get_json()
        data = load_json_data(DATA_FILE)
        
        if 'userPresence' not in data:
            data['userPresence'] = {}
        
        username = presence_data.get('username')
        if username:
            data['userPresence'][username] = {
                'online': presence_data.get('online', False),
                'lastActive': datetime.now().isoformat()
            }
        
        if save_json_data(DATA_FILE, data):
            return jsonify({"success": True, "message": "在线状态更新成功"})
        else:
            return jsonify({"success": False, "message": "数据保存失败"}), 500
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 400

@app.route('/api/login', methods=['POST'])
def login():
    """用户登录 - 支持会员ID或用户名登录"""
    try:
        login_data = request.get_json()
        member_id = login_data.get('memberId')  # 优先使用会员ID
        username = login_data.get('username')  # 备用：用户名
        password = login_data.get('password')
        
        if not member_id and not username:
            return jsonify({"success": False, "message": "请输入会员ID或用户名"}), 400
            
        if not password:
            return jsonify({"success": False, "message": "请输入密码"}), 400
        
        users_data = load_json_data(USERS_FILE)
        found_user = None
        
        # 优先通过会员ID查找
        if member_id:
            for user in users_data.get('users', []):
                if user.get('id') == member_id and user.get('password') == password:
                    found_user = user
                    username = user.get('username')  # 获取用户名用于在线状态
                    break
        
        # 如果会员ID没找到，尝试用户名（向后兼容）
        if not found_user and username:
            for user in users_data.get('users', []):
                if user.get('username') == username and user.get('password') == password:
                    found_user = user
                    break
        
        if found_user:
            # 更新在线状态
            data = load_json_data(DATA_FILE)
            if 'userPresence' not in data:
                data['userPresence'] = {}
            
            data['userPresence'][username] = {
                'online': True,
                'lastActive': datetime.now().isoformat()
            }
            save_json_data(DATA_FILE, data)
            
            return jsonify({
                "success": True, 
                "message": "登录成功",
                "user": {
                    "username": found_user.get('username'),
                    "role": found_user.get('role', 'user'),
                    "id": found_user.get('id'),
                    "memberId": found_user.get('id')
                }
            })
        
        return jsonify({"success": False, "message": "会员ID/用户名或密码错误"}), 401
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 400

@app.route('/api/admin/login', methods=['POST'])
def admin_login():
    """管理员登录"""
    try:
        login_data = request.get_json()
        username = login_data.get('username')
        password = login_data.get('password')
        
        users_data = load_json_data(USERS_FILE)
        
        for user in users_data.get('users', []):
            if user.get('username') == username and user.get('password') == password and user.get('role') == 'admin':
                # 生成管理员会话令牌
                session_token = ''.join(random.choices(string.ascii_letters + string.digits, k=32))
                
                # 更新在线状态
                data = load_json_data(DATA_FILE)
                if 'adminSessions' not in data:
                    data['adminSessions'] = {}
                
                data['adminSessions'][session_token] = {
                    'username': username,
                    'loginTime': datetime.now().isoformat(),
                    'lastActive': datetime.now().isoformat(),
                    'expiresAt': (datetime.now().timestamp() + 7200) * 1000  # 2小时后过期
                }
                
                if 'userPresence' not in data:
                    data['userPresence'] = {}
                
                data['userPresence'][username] = {
                    'online': True,
                    'lastActive': datetime.now().isoformat()
                }
                
                save_json_data(DATA_FILE, data)
                
                return jsonify({
                    "success": True, 
                    "message": "管理员登录成功",
                    "token": session_token,
                    "admin": {
                        "username": username,
                        "role": user.get('role', 'admin'),
                        "id": user.get('id', str(int(time.time() * 1000)))
                    },
                    "expiresAt": data['adminSessions'][session_token]['expiresAt']
                })
        
        return jsonify({"success": False, "message": "管理员账号或密码错误"}), 401
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 400

@app.route('/api/admin/validate', methods=['POST'])
def validate_admin_session():
    """验证管理员会话"""
    try:
        data = request.get_json()
        token = data.get('token')
        
        if not token:
            return jsonify({"success": False, "message": "未提供会话令牌"}), 401
        
        data = load_json_data(DATA_FILE)
        admin_sessions = data.get('adminSessions', {})
        
        if token not in admin_sessions:
            return jsonify({"success": False, "message": "无效的会话令牌"}), 401
        
        session = admin_sessions[token]
        current_time = datetime.now().timestamp() * 1000
        
        if current_time > session.get('expiresAt', 0):
            # 会话已过期，删除会话
            del admin_sessions[token]
            save_json_data(DATA_FILE, data)
            return jsonify({"success": False, "message": "会话已过期"}), 401
        
        # 更新最后活跃时间
        session['lastActive'] = datetime.now().isoformat()
        save_json_data(DATA_FILE, data)
        
        return jsonify({
            "success": True, 
            "message": "会话有效",
            "admin": {
                "username": session.get('username'),
                "role": 'admin'
            },
            "expiresAt": session.get('expiresAt')
        })
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 400

@app.route('/api/admin/logout', methods=['POST'])
def admin_logout():
    """管理员退出登录"""
    try:
        data = request.get_json()
        token = data.get('token')
        
        if not token:
            return jsonify({"success": False, "message": "未提供会话令牌"}), 400
        
        data = load_json_data(DATA_FILE)
        admin_sessions = data.get('adminSessions', {})
        
        if token in admin_sessions:
            del admin_sessions[token]
            save_json_data(DATA_FILE, data)
            return jsonify({"success": True, "message": "管理员已退出登录"})
        
        return jsonify({"success": False, "message": "会话不存在"}), 404
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 400

@app.route('/api/user/change-password', methods=['POST'])
def user_change_password():
    try:
        payload = request.get_json()
        member_id = payload.get('memberId')
        current_password = payload.get('currentPassword')
        new_password = payload.get('newPassword')
        if not member_id or not current_password or not new_password:
            return jsonify({"success": False, "message": "缺少必要参数"}), 400
        users_data = load_json_data(USERS_FILE)
        users = users_data.get('users', [])
        target = None
        for u in users:
            if u.get('id') == member_id:
                target = u
                break
        if not target:
            return jsonify({"success": False, "message": "会员不存在"}), 404
        if target.get('password') != current_password:
            return jsonify({"success": False, "message": "当前密码不正确"}), 401
        target['password'] = new_password
        target['updated_at'] = datetime.now().isoformat()
        if save_json_data(USERS_FILE, users_data):
            return jsonify({"success": True, "message": "密码修改成功"})
        return jsonify({"success": False, "message": "保存数据失败"}), 500
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 400

@app.route('/api/admin/change-password', methods=['POST'])
def admin_change_password():
    """管理员修改会员密码"""
    try:
        data = request.get_json()
        token = data.get('token')
        member_id = data.get('memberId')
        new_password = data.get('newPassword')
        
        # 验证管理员权限
        if not token:
            return jsonify({"success": False, "message": "未提供会话令牌"}), 400
            
        if not member_id or not new_password:
            return jsonify({"success": False, "message": "缺少必要参数"}), 400
        
        # 验证管理员会话
        data = load_json_data(DATA_FILE)
        admin_sessions = data.get('adminSessions', {})
        
        if token not in admin_sessions:
            return jsonify({"success": False, "message": "管理员会话无效或已过期"}), 401
        
        # 加载用户数据
        users_data = load_json_data(USERS_FILE)
        users = users_data.get('users', [])
        
        # 查找会员
        member_found = False
        for user in users:
            if user.get('id') == member_id:
                member_found = True
                user['password'] = new_password
                user['updated_at'] = datetime.now().isoformat()
                break
        
        if not member_found:
            return jsonify({"success": False, "message": "会员不存在"}), 404
        
        # 保存数据
        if save_json_data(USERS_FILE, users_data):
            return jsonify({"success": True, "message": "密码修改成功"})
        else:
            return jsonify({"success": False, "message": "保存数据失败"}), 500
            
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 400

# 静态文件服务
@app.route('/<path:path>')
def serve_static(path):
    """提供静态文件服务"""
    return send_from_directory('.', path)

@app.route('/')
def serve_index():
    """提供首页"""
    return send_from_directory('.', 'index.html')

# 定期清理离线用户
def cleanup_offline_users():
    """定期清理长时间不活跃的用户"""
    while True:
        try:
            data = load_json_data(DATA_FILE)
            if 'userPresence' in data:
                current_time = datetime.now()
                offline_users = []
                
                for username, presence in data['userPresence'].items():
                    last_active = datetime.fromisoformat(presence.get('lastActive', ''))
                    if (current_time - last_active).total_seconds() > 1800:  # 30分钟不活跃
                        offline_users.append(username)
                
                for username in offline_users:
                    del data['userPresence'][username]
                
                if offline_users:
                    save_json_data(DATA_FILE, data)
            
            time.sleep(300)  # 每5分钟检查一次
        except Exception as e:
            print(f"清理离线用户失败: {e}")
            time.sleep(300)

def generate_auto_username():
    """生成自动用户名"""
    adjectives = ['快乐', '聪明', '友好', '活跃', '阳光', '热情', '可爱', '机智', '勇敢', '温柔']
    nouns = ['小狗', '小猫', '小鸟', '小鱼', '小熊', '小兔', '小鹿', '小马', '小象', '小虎']
    
    adj = random.choice(adjectives)
    noun = random.choice(nouns)
    number = random.randint(1000, 9999)
    
    return f"{adj}{noun}{number}"

def generate_auto_password():
    """生成随机密码"""
    # 包含大小写字母、数字和特殊字符
    chars = string.ascii_letters + string.digits + "!@#$%"
    password = ''.join(random.choice(chars) for _ in range(12))
    return password

def validate_email(email):
    """简单的邮箱验证"""
    import re
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_phone(phone):
    """简单的手机号验证"""
    # 支持马来西亚和中国手机号格式
    pattern = r'^(01[0-9]{8,9}|\+60[0-9]{8,11}|1[3-9][0-9]{9})$'
    return re.match(pattern, phone) is not None

def get_user_wallet(user_id):
    """获取用户钱包信息"""
    try:
        data = load_json_data(DATA_FILE)
        if 'wallets' not in data:
            data['wallets'] = {}
        
        if user_id not in data['wallets']:
            # 创建新钱包
            data['wallets'][user_id] = {
                'balance': 0.00,
                'created_at': datetime.now().isoformat(),
                'updated_at': datetime.now().isoformat()
            }
            save_json_data(DATA_FILE, data)
        
        return data['wallets'][user_id]
    except Exception as e:
        print(f"获取钱包信息失败: {e}")
        return {'balance': 0.00, 'error': str(e)}

def create_wallet_transaction(user_id, type, amount, description="", status="completed"):
    """创建钱包交易记录"""
    try:
        data = load_json_data(DATA_FILE)
        if 'wallet_transactions' not in data:
            data['wallet_transactions'] = []
        
        transaction = {
            'id': str(int(time.time() * 1000)),
            'user_id': user_id,
            'type': type,  # deposit, withdraw, payment, refund
            'amount': float(amount),
            'description': description,
            'status': status,  # completed, pending, failed
            'created_at': datetime.now().isoformat()
        }
        
        data['wallet_transactions'].append(transaction)
        
        # 更新钱包余额
        if 'wallets' not in data:
            data['wallets'] = {}
        
        if user_id not in data['wallets']:
            data['wallets'][user_id] = {'balance': 0.00}
        
        if type == 'deposit':
            data['wallets'][user_id]['balance'] += float(amount)
        elif type == 'withdraw':
            if data['wallets'][user_id]['balance'] >= float(amount):
                data['wallets'][user_id]['balance'] -= float(amount)
            else:
                return {'success': False, 'message': '余额不足'}
        
        data['wallets'][user_id]['updated_at'] = datetime.now().isoformat()
        
        if save_json_data(DATA_FILE, data):
            return {'success': True, 'transaction': transaction}
        else:
            return {'success': False, 'message': '保存交易记录失败'}
            
    except Exception as e:
        print(f"创建交易记录失败: {e}")
        return {'success': False, 'message': str(e)}

def get_wallet_transactions(user_id, limit=50):
    """获取用户钱包交易记录"""
    try:
        data = load_json_data(DATA_FILE)
        if 'wallet_transactions' not in data:
            return []
        
        # 过滤该用户的交易记录，按时间倒序排列
        user_transactions = [
            t for t in data['wallet_transactions'] 
            if t['user_id'] == user_id
        ]
        user_transactions.sort(key=lambda x: x['created_at'], reverse=True)
        
        return user_transactions[:limit]
    except Exception as e:
        print(f"获取交易记录失败: {e}")
        return []

# 钱包相关API端点
@app.route('/api/wallet/<user_id>', methods=['GET'])
def get_wallet(user_id):
    """获取用户钱包信息"""
    try:
        wallet_info = get_user_wallet(user_id)
        if 'error' in wallet_info:
            return jsonify({"success": False, "message": wallet_info['error']}), 500
        
        return jsonify({
            "success": True,
            "wallet": wallet_info
        })
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/api/wallet/deposit', methods=['POST'])
def wallet_deposit():
    """钱包充值"""
    try:
        deposit_data = request.get_json()
        user_id = deposit_data.get('user_id')
        amount = float(deposit_data.get('amount', 0))
        
        if not user_id or amount <= 0:
            return jsonify({"success": False, "message": "参数错误"}), 400
        
        # 创建充值交易
        result = create_wallet_transaction(
            user_id=user_id,
            type='deposit',
            amount=amount,
            description=f"钱包充值 ¥{amount:.2f}"
        )
        
        if result['success']:
            return jsonify({
                "success": True,
                "message": f"充值成功 ¥{amount:.2f}",
                "transaction": result['transaction']
            })
        else:
            return jsonify({"success": False, "message": result['message']}), 400
            
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/api/wallet/withdraw', methods=['POST'])
def wallet_withdraw():
    """钱包提款"""
    try:
        withdraw_data = request.get_json()
        user_id = withdraw_data.get('user_id')
        amount = float(withdraw_data.get('amount', 0))
        
        if not user_id or amount <= 0:
            return jsonify({"success": False, "message": "参数错误"}), 400
        
        # 创建提款交易
        result = create_wallet_transaction(
            user_id=user_id,
            type='withdraw',
            amount=amount,
            description=f"钱包提款 ¥{amount:.2f}"
        )
        
        if result['success']:
            return jsonify({
                "success": True,
                "message": f"提款成功 ¥{amount:.2f}",
                "transaction": result['transaction']
            })
        else:
            return jsonify({"success": False, "message": result['message']}), 400
            
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/api/wallet/transactions/<user_id>', methods=['GET'])
def get_wallet_transactions_api(user_id):
    """获取用户钱包交易记录"""
    try:
        limit = request.args.get('limit', 50, type=int)
        transactions = get_wallet_transactions(user_id, limit)
        
        return jsonify({
            "success": True,
            "transactions": transactions,
            "count": len(transactions)
        })
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

# 启动清理线程
cleanup_thread = threading.Thread(target=cleanup_offline_users, daemon=True)
cleanup_thread.start()

if __name__ == '__main__':
    print("启动极简后端API服务器...")
    print("服务器运行在: http://localhost:5050")
    print("API端点:")
    print("  GET  /api/data              - 获取所有数据")
    print("  POST /api/data              - 更新所有数据")
    print("  GET  /api/donations         - 获取捐款记录")
    print("  POST /api/donations         - 添加捐款记录")
    print("  GET  /api/members           - 获取会员列表")
    print("  POST /api/members           - 添加会员")
    print("  PUT  /api/members/<id>      - 更新会员信息")
    print("  GET  /api/applications      - 获取申请列表")
    print("  POST /api/applications      - 添加申请")
    print("  GET  /api/user-presence     - 获取用户在线状态")
    print("  POST /api/user-presence     - 更新用户在线状态")
    print("  POST /api/login             - 用户登录")
    print("  POST /api/admin/login       - 管理员登录")
    print("  POST /api/admin/validate    - 验证管理员会话")
    print("  POST /api/admin/logout      - 管理员退出登录")
    print("  POST /api/auto-register     - 自动注册会员")
    print("  GET  /api/wallet/<user_id>  - 获取用户钱包信息")
    print("  POST /api/wallet/deposit    - 钱包充值")
    print("  POST /api/wallet/withdraw   - 钱包提款")
    print("  GET  /api/wallet/transactions/<user_id> - 获取交易记录")
    print("")
    print("自动注册功能已启用！")
    print("访问 /api/auto-register 即可自动创建会员账户")
    
    app.run(host='0.0.0.0', port=5050, debug=True)