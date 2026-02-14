// 文件名: cas-storage.js
const CAS_Storage = {
    SESSION_KEY: 'CAS_Current_Session',
    hasSession: () => localStorage.getItem(CAS_Storage.SESSION_KEY) !== null,
    
    initSession: function(subjectInfo) {
        const sessionData = {
            session_id: subjectInfo.subject_id,
            demographics: subjectInfo,
            start_time: new Date().toISOString(),
            device_info: navigator.userAgent,
            screen_resolution: `${window.screen.width}x${window.screen.height}`,
            modules: {} 
        };
        localStorage.setItem(this.SESSION_KEY, JSON.stringify(sessionData));
        return sessionData;
    },

    getSession: function() {
        const data = localStorage.getItem(this.SESSION_KEY);
        if (!data) return { session_id: "Unknown", demographics: {}, modules: {} };
        return JSON.parse(data);
    },

    saveModuleData: function(moduleName, data) {
        if (!this.hasSession()) return alert("系统警告：当前会话丢失，请返回主页重新建立受试者档案！");
        let session = this.getSession();
        session.modules[moduleName] = { completed_at: new Date().toISOString(), data: data };
        localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
        console.log(`[CAS] ${moduleName} 特征集已安全写入本地。`);
    },

    exportJSON: function() {
        const session = this.getSession();
        session.end_time = new Date().toISOString(); 
        const blob = new Blob([JSON.stringify(session, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); 
        a.href = url; a.download = `CAS_${session.session_id}_Phenotype.json`; 
        document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    },

    clearSession: function() {
        if(confirm("⚠️ 危险操作：确定要结束当前评估并清除该受试者的所有本地缓存吗？(请确保数据已导出)")) { 
            localStorage.removeItem(this.SESSION_KEY); window.location.href = 'index.html'; 
        }
    }
};
