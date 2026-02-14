// 文件名: cas-storage.js
const CAS_Storage = {
    SESSION_KEY: 'CAS_Current_Session',
    initSession: function(subjectId = "CAS_" + Date.now()) {
        const sessionData = { session_id: subjectId, start_time: new Date().toISOString(), device_info: navigator.userAgent, screen_resolution: `${window.screen.width}x${window.screen.height}`, modules: {} };
        localStorage.setItem(this.SESSION_KEY, JSON.stringify(sessionData));
        return sessionData;
    },
    getSession: function() {
        const data = localStorage.getItem(this.SESSION_KEY);
        return data ? JSON.parse(data) : this.initSession();
    },
    saveModuleData: function(moduleName, data) {
        let session = this.getSession();
        session.modules[moduleName] = { completed_at: new Date().toISOString(), data: data };
        localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
        console.log(`[CAS] ${moduleName} 数据已结构化并安全保存。`);
    },
    exportJSON: function() {
        const session = this.getSession();
        session.end_time = new Date().toISOString(); 
        const blob = new Blob([JSON.stringify(session, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = `${session.session_id}_Phenotype_Data.json`;
        document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    },
    clearSession: function() {
        if(confirm("确定清除当前受试者的所有数字表型数据吗？")) { localStorage.removeItem(this.SESSION_KEY); window.location.href = 'index.html'; }
    }
};
