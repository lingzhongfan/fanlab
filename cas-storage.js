// 文件名: cas-storage.js
const CAS_Storage = {
    SESSION_KEY: 'CAS_Current_Session',

    // 检查当前是否有正在进行的测试会话
    hasSession: function() {
        return localStorage.getItem(this.SESSION_KEY) !== null;
    },

    // 带着受试者基本信息初始化会话
    initSession: function(subjectInfo) {
        const sessionData = {
            session_id: subjectInfo.subject_id,
            demographics: subjectInfo, // 包含姓名、出生日期、性别、利手等
            start_time: new Date().toISOString(),
            device_info: navigator.userAgent,
            screen_resolution: `${window.screen.width}x${window.screen.height}`,
            modules: {} 
        };
        localStorage.setItem(this.SESSION_KEY, JSON.stringify(sessionData));
        return sessionData;
    },

    // 获取当前会话，如果意外丢失则抛出警告
    getSession: function() {
        const data = localStorage.getItem(this.SESSION_KEY);
        if (!data) {
            console.warn("[CAS] 未找到活动会话，请返回主页重新建档。");
            return { session_id: "Unknown", demographics: {}, modules: {} };
        }
        return JSON.parse(data);
    },

    saveModuleData: function(moduleName, data) {
        if (!this.hasSession()) return alert("系统错误：受试者信息已丢失，请返回主页重新录入！");
        let session = this.getSession();
        session.modules[moduleName] = { completed_at: new Date().toISOString(), data: data };
        localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
        console.log(`[CAS] ${moduleName} 模块特征已结构化并安全同步。`);
    },

    exportJSON: function() {
        const session = this.getSession();
        session.end_time = new Date().toISOString(); 
        const blob = new Blob([JSON.stringify(session, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; 
        a.download = `CAS_${session.session_id}_Phenotype_Data.json`; // 文件名包含被试ID
        document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    },

    clearSession: function() {
        if(confirm("⚠️ 确定要结束当前评估并清除该受试者的所有本地缓存吗？(请确保已导出数据)")) { 
            localStorage.removeItem(this.SESSION_KEY); 
            window.location.href = 'index.html'; 
        }
    }
};
