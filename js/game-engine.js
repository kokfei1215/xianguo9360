/**
 * 高画质游戏引擎
 * 提供3D渲染、粒子效果、光照等高级功能
 */

class GameEngine {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.width = canvas.width;
        this.height = canvas.height;
        this.particles = [];
        this.lights = [];
        this.time = 0;
        this.setupHighDPI();
    }

    setupHighDPI() {
        // 确保画布已经添加到DOM后再获取尺寸
        if (this.canvas.parentElement) {
            const rect = this.canvas.getBoundingClientRect();
            const dpr = window.devicePixelRatio || 1;
            this.canvas.width = rect.width * dpr;
            this.canvas.height = rect.height * dpr;
            this.ctx.scale(dpr, dpr);
            this.canvas.style.width = rect.width + 'px';
            this.canvas.style.height = rect.height + 'px';
        } else {
            // 如果画布还没有添加到DOM，使用默认尺寸
            const dpr = window.devicePixelRatio || 1;
            this.canvas.width = this.canvas.width * dpr;
            this.canvas.height = this.canvas.height * dpr;
            this.ctx.scale(dpr, dpr);
            this.canvas.style.width = this.canvas.width / dpr + 'px';
            this.canvas.style.height = this.canvas.height / dpr + 'px';
        }
    }

    // 粒子系统
    createParticle(x, y, options = {}) {
        const particle = {
            x,
            y,
            vx: options.vx || (Math.random() - 0.5) * 4,
            vy: options.vy || (Math.random() - 0.5) * 4,
            life: options.life || 1,
            maxLife: options.life || 1,
            size: options.size || Math.random() * 3 + 1,
            color: options.color || `hsl(${Math.random() * 360}, 70%, 60%)`,
            gravity: options.gravity || 0.1,
            friction: options.friction || 0.98
        };
        this.particles.push(particle);
        return particle;
    }

    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += p.gravity;
            p.vx *= p.friction;
            p.vy *= p.friction;
            p.life -= 0.02;

            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    renderParticles() {
        this.particles.forEach(p => {
            const alpha = p.life / p.maxLife;
            this.ctx.save();
            this.ctx.globalAlpha = alpha;
            this.ctx.fillStyle = p.color;
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = p.color;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        });
    }

    // 光照效果
    addLight(x, y, radius, color = 'white', intensity = 1) {
        this.lights.push({ x, y, radius, color, intensity });
    }

    renderLights() {
        this.lights.forEach(light => {
            const gradient = this.ctx.createRadialGradient(
                light.x, light.y, 0,
                light.x, light.y, light.radius
            );
            gradient.addColorStop(0, light.color);
            gradient.addColorStop(1, 'transparent');
            
            this.ctx.save();
            this.ctx.globalAlpha = light.intensity;
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(light.x, light.y, light.radius, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        });
        this.lights = [];
    }

    // 高画质渲染
    render() {
        this.time += 0.016;
        this.updateParticles();
        
        // 清除画布，使用渐变背景
        const gradient = this.ctx.createLinearGradient(0, 0, this.width, this.height);
        gradient.addColorStop(0, '#0a0a0a');
        gradient.addColorStop(1, '#1a1a2e');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);

        this.renderLights();
        this.renderParticles();
    }

    // 爆炸效果
    explosion(x, y, count = 20, color = null) {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count;
            const speed = Math.random() * 5 + 2;
            this.createParticle(x, y, {
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: Math.random() * 0.5 + 0.5,
                size: Math.random() * 4 + 2,
                color: color || `hsl(${Math.random() * 60 + 15}, 100%, 60%)`
            });
        }
        this.addLight(x, y, 100, 'orange', 0.8);
    }
}

/**
 * 3D向量工具类
 */
class Vector3 {
    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    add(v) {
        return new Vector3(this.x + v.x, this.y + v.y, this.z + v.z);
    }

    multiply(scalar) {
        return new Vector3(this.x * scalar, this.y * scalar, this.z * scalar);
    }

    normalize() {
        const length = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
        if (length === 0) return new Vector3();
        return new Vector3(this.x / length, this.y / length, this.z / length);
    }
}

/**
 * 3D游戏相机
 */
class Camera3D {
    constructor(fov = 60, aspect = 1, near = 0.1, far = 1000) {
        this.position = new Vector3(0, 0, 5);
        this.rotation = new Vector3(0, 0, 0);
        this.fov = fov;
        this.aspect = aspect;
        this.near = near;
        this.far = far;
    }

    project(point) {
        const fovRad = (this.fov * Math.PI) / 180;
        const scale = Math.tan(fovRad / 2);
        
        const relative = point.add(this.position.multiply(-1));
        
        if (relative.z <= 0) return null;
        
        const x = (relative.x / relative.z) * scale * this.aspect;
        const y = (relative.y / relative.z) * scale;
        
        return {
            x: (x + 1) * 0.5,
            y: (1 - y) * 0.5,
            z: relative.z
        };
    }
}

class MemoryGame {
    constructor(difficulty='medium') {
        this.cols = {easy:4, medium:4, hard:6}[difficulty];
        this.rows = {easy:3, medium:4, hard:6}[difficulty];
        this.pairs = (this.cols * this.rows) / 2;
        this.canvas = document.createElement('canvas');
        this.canvas.width = 600; this.canvas.height = 450;
        this.ctx = this.canvas.getContext('2d');
        this.grid = [];
        this.first = null;
        this.lock = false;
        this.score = 0;
        this.matched = 0;
        this.generate();
        this.canvas.tabIndex = 0;
        this.canvas.addEventListener('click', (e)=>this.handleClick(e));
        this.render();
    }
    getCanvas() { return this.canvas; }
    generate() {
        const nums = [];
        for (let i=0;i<this.pairs;i++) nums.push(i,i);
        for (let i=nums.length-1;i>0;i--) { const j=Math.floor(Math.random()* (i+1)); [nums[i],nums[j]]=[nums[j],nums[i]]; }
        this.grid = nums.map(n=>({n,open:false,done:false}));
    }
    indexFromPoint(x,y) {
        const w = this.canvas.width, h = this.canvas.height;
        const cw = Math.floor((w-40)/this.cols), ch = Math.floor((h-40)/this.rows);
        const gx = Math.floor((x-20)/cw), gy = Math.floor((y-20)/ch);
        if (gx<0||gy<0||gx>=this.cols||gy>=this.rows) return -1;
        return gy*this.cols+gx;
    }
    handleClick(e) {
        if (this.lock) return;
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left, y = e.clientY - rect.top;
        const idx = this.indexFromPoint(x,y);
        if (idx<0) return;
        const card = this.grid[idx];
        if (card.done||card.open) return;
        card.open = true;
        if (!this.first) { this.first = idx; this.render(); return; }
        const a = this.grid[this.first];
        if (a.n === card.n) {
            a.done = true; card.done = true; this.score += 10; this.matched += 1; this.first = null; this.render();
        } else {
            this.lock = true; this.render();
            setTimeout(()=>{ a.open=false; card.open=false; this.first=null; this.lock=false; this.render(); }, 700);
        }
    }
    render() {
        const ctx=this.ctx, w=this.canvas.width, h=this.canvas.height;
        ctx.fillStyle = '#0a0a0a'; ctx.fillRect(0,0,w,h);
        const cw = Math.floor((w-40)/this.cols), ch = Math.floor((h-40)/this.rows);
        for (let r=0;r<this.rows;r++) for (let c=0;c<this.cols;c++) {
            const i=r*this.cols+c, card=this.grid[i];
            const x=20+c*cw, y=20+r*ch;
            ctx.fillStyle = card.done? '#00ff88' : (card.open? '#333' : '#111');
            ctx.strokeStyle = '#00ff88'; ctx.lineWidth = 2;
            ctx.fillRect(x+4,y+4,cw-8,ch-8); ctx.strokeRect(x+4,y+4,cw-8,ch-8);
            if (card.open||card.done) {
                ctx.fillStyle = '#00ff88'; ctx.font = 'bold 24px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
                ctx.fillText(String(card.n+1), x+cw/2, y+ch/2);
            }
        }
        ctx.fillStyle='#00ff88'; ctx.font='14px sans-serif'; ctx.fillText('分数: '+this.score, 20, h-10);
    }
}

class Game2048 {
    constructor() {
        this.size = 4;
        this.canvas = document.createElement('canvas');
        this.canvas.width = 480; this.canvas.height = 480;
        this.ctx = this.canvas.getContext('2d');
        this.grid = Array.from({length:this.size},()=>Array(this.size).fill(0));
        this.score = 0;
        this.spawn(); this.spawn();
        this.canvas.tabIndex = 0;
        this.canvas.addEventListener('keydown',(e)=>this.key(e));
        this.render();
    }
    getCanvas(){return this.canvas;}
    spawn(){
        const empty=[]; for(let r=0;r<this.size;r++) for(let c=0;c<this.size;c++) if(this.grid[r][c]===0) empty.push([r,c]);
        if(empty.length===0) return;
        const [r,c]=empty[Math.floor(Math.random()*empty.length)];
        this.grid[r][c]=Math.random()<0.9?2:4;
    }
    move(dir){
        let moved=false; const s=this.size;
        const line = i => ({
            left:()=>this.grid[i].slice(),
            right:()=>this.grid[i].slice().reverse(),
            up:()=>this.grid.map(r=>r[i]),
            down:()=>this.grid.map(r=>r[i]).reverse()
        });
        const setLine = (i, arr, d) => {
            if (d==='left') this.grid[i]=arr;
            if (d==='right') this.grid[i]=arr.slice().reverse();
            if (d==='up') for(let r=0;r<s;r++) this.grid[r][i]=arr[r];
            if (d==='down') for(let r=0;r<s;r++) this.grid[r][i]=arr.slice().reverse()[r];
        };
        const reduce = arr => {
            const a=arr.filter(v=>v!==0);
            for(let i=0;i<a.length-1;i++) if(a[i]===a[i+1]) { a[i]*=2; this.score+=a[i]; a.splice(i+1,1); }
            while(a.length<s) a.push(0);
            return a;
        };
        const dirs=['left','right','up','down'];
        for(const d of dirs){ if(d!==dir) continue; }
        if(dir==='left'||dir==='right'){
            for(let i=0;i<s;i++){ const before=line(i)[dir](); const after=reduce(before); setLine(i,after,dir); if(JSON.stringify(before)!==JSON.stringify(after)) moved=true; }
        } else {
            for(let i=0;i<s;i++){ const before=line(i)[dir](); const after=reduce(before); setLine(i,after,dir); if(JSON.stringify(before)!==JSON.stringify(after)) moved=true; }
        }
        if(moved) this.spawn();
        this.render();
    }
    key(e){
        if(e.key==='ArrowLeft'||e.key==='a') this.move('left');
        if(e.key==='ArrowRight'||e.key==='d') this.move('right');
        if(e.key==='ArrowUp'||e.key==='w') this.move('up');
        if(e.key==='ArrowDown'||e.key==='s') this.move('down');
    }
    render(){
        const ctx=this.ctx,w=this.canvas.width,h=this.canvas.height;
        ctx.fillStyle='#0a0a0a'; ctx.fillRect(0,0,w,h);
        const pad=20, cell=(w-2*pad)/this.size;
        for(let r=0;r<this.size;r++) for(let c=0;c<this.size;c++){
            const v=this.grid[r][c];
            const x=pad+c*cell, y=pad+r*cell;
            ctx.fillStyle=v?`hsl(${Math.min(60+v,300)},70%,40%)`:'#111';
            ctx.strokeStyle='#00ff88'; ctx.lineWidth=2;
            ctx.fillRect(x+4,y+4,cell-8,cell-8); ctx.strokeRect(x+4,y+4,cell-8,cell-8);
            if(v){ ctx.fillStyle='#00ff88'; ctx.font='bold 24px sans-serif'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(String(v), x+cell/2, y+cell/2); }
        }
        ctx.fillStyle='#00ff88'; ctx.font='14px sans-serif'; ctx.fillText('分数: '+this.score, pad, h-pad/2);
    }
}

class MazeGame {
    constructor(difficulty='medium'){
        this.size={easy:15,medium:21,hard:31}[difficulty];
        this.canvas=document.createElement('canvas');
        this.canvas.width=600; this.canvas.height=600;
        this.ctx=this.canvas.getContext('2d');
        this.grid=Array.from({length:this.size},()=>Array(this.size).fill(1));
        this.player={x:1,y:1};
        this.exit={x:this.size-2,y:this.size-2};
        this.score=0;
        this.generate();
        this.canvas.tabIndex=0;
        this.canvas.addEventListener('keydown',(e)=>this.key(e));
        this.render();
    }
    getCanvas(){return this.canvas;}
    generate(){
        const carve=(x,y)=>{
            const dirs=[[2,0],[0,2],[-2,0],[0,-2]];
            for(let i=dirs.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[dirs[i],dirs[j]]=[dirs[j],dirs[i]];}
            for(const [dx,dy] of dirs){ const nx=x+dx, ny=y+dy; if(nx>0&&ny>0&&nx<this.size-1&&ny<this.size-1&&this.grid[ny][nx]===1){ this.grid[ny-dy/2][nx-dx/2]=0; this.grid[ny][nx]=0; carve(nx,ny);} }
        };
        for(let r=0;r<this.size;r++) for(let c=0;c<this.size;c++) this.grid[r][c]=1;
        this.grid[1][1]=0; carve(1,1);
    }
    key(e){
        const m=(nx,ny)=>{ if(this.grid[ny][nx]===0){ this.player.x=nx; this.player.y=ny; this.score+=1; if(nx===this.exit.x&&ny===this.exit.y){ this.score+=100; } this.render(); }};
        if(e.key==='ArrowLeft'||e.key==='a') m(this.player.x-1,this.player.y);
        if(e.key==='ArrowRight'||e.key==='d') m(this.player.x+1,this.player.y);
        if(e.key==='ArrowUp'||e.key==='w') m(this.player.x,this.player.y-1);
        if(e.key==='ArrowDown'||e.key==='s') m(this.player.x,this.player.y+1);
    }
    render(){
        const ctx=this.ctx,w=this.canvas.width,h=this.canvas.height;
        ctx.fillStyle='#0a0a0a'; ctx.fillRect(0,0,w,h);
        const cell=Math.floor(w/this.size);
        for(let r=0;r<this.size;r++) for(let c=0;c<this.size;c++){
            const x=c*cell, y=r*cell; ctx.fillStyle=this.grid[r][c]?'#111':'#222'; ctx.fillRect(x,y,cell-1,cell-1);
        }
        ctx.fillStyle='#00ff88';
        ctx.fillRect(this.player.x*cell+4,this.player.y*cell+4,cell-8,cell-8);
        ctx.fillStyle='#ff6b35';
        ctx.fillRect(this.exit.x*cell+4,this.exit.y*cell+4,cell-8,cell-8);
        ctx.fillStyle='#00ff88'; ctx.font='14px sans-serif'; ctx.fillText('步数: '+this.score, 10, 20);
    }
}

class WhacGame {
    constructor(difficulty='medium'){
        this.rows={easy:3,medium:3,hard:4}[difficulty];
        this.cols={easy:3,medium:4,hard:4}[difficulty];
        this.canvas=document.createElement('canvas');
        this.canvas.width=480; this.canvas.height=360;
        this.ctx=this.canvas.getContext('2d');
        this.score=0; this.time=30; this.active=-1; this.running=false;
        this.canvas.addEventListener('click',(e)=>this.hit(e));
        this.start();
        this.render();
    }
    getCanvas(){return this.canvas;}
    start(){ this.running=true; this.timer=setInterval(()=>{ if(this.time<=0){ this.running=false; clearInterval(this.timer);} else { this.time-=1; this.active=Math.floor(Math.random()*(this.rows*this.cols)); this.render(); } },1000); }
    indexFromPoint(x,y){ const w=this.canvas.width,h=this.canvas.height; const cw=Math.floor((w-40)/this.cols),ch=Math.floor((h-40)/this.rows); const gx=Math.floor((x-20)/cw),gy=Math.floor((y-20)/ch); if(gx<0||gy<0||gx>=this.cols||gy>=this.rows) return -1; return gy*this.cols+gx; }
    hit(e){ if(!this.running) return; const rect=this.canvas.getBoundingClientRect(); const x=e.clientX-rect.left, y=e.clientY-rect.top; const idx=this.indexFromPoint(x,y); if(idx===this.active){ this.score+=5; this.active=-1; this.render(); } else { this.score=Math.max(0,this.score-1); this.render(); } }
    render(){ const ctx=this.ctx,w=this.canvas.width,h=this.canvas.height; ctx.fillStyle='#0a0a0a'; ctx.fillRect(0,0,w,h); const cw=Math.floor((w-40)/this.cols),ch=Math.floor((h-40)/this.rows); for(let r=0;r<this.rows;r++) for(let c=0;c<this.cols;c++){ const i=r*this.cols+c; const x=20+c*cw, y=20+r*ch; ctx.fillStyle='#111'; ctx.strokeStyle='#00ff88'; ctx.lineWidth=2; ctx.fillRect(x+4,y+4,cw-8,ch-8); ctx.strokeRect(x+4,y+4,cw-8,ch-8); if(i===this.active){ ctx.fillStyle='#ff6b35'; ctx.beginPath(); ctx.arc(x+cw/2,y+ch/2,Math.min(cw,ch)/4,0,Math.PI*2); ctx.fill(); } }
        ctx.fillStyle='#00ff88'; ctx.font='14px sans-serif'; ctx.fillText('分数: '+this.score, 20, h-12); ctx.fillText('剩余: '+this.time+'s', 120, h-12); }
}

// 导出游戏引擎类
window.GameEngine = GameEngine;
window.Vector3 = Vector3;
window.Camera3D = Camera3D;