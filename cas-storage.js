const CAS_Storage = {
    SESSION_KEY: 'CAS_Current_Session',
    hasSession: () => localStorage.getItem(CAS_Storage.SESSION_KEY) !== null,
    
    initSession: function(subjectInfo) {
        const sessionData = {
            session_id: subjectInfo.subject_id,
            demographics: subjectInfo,
            start_time: new Date().toISOString(),
            modules: {} 
        };
        localStorage.setItem(this.SESSION_KEY, JSON.stringify(sessionData));
        return sessionData;
    },

    getSession: function() {
        const data = localStorage.getItem(this.SESSION_KEY);
        return data ? JSON.parse(data) : { session_id: "Unknown", demographics: {}, modules: {} };
    },

    saveModuleData: function(moduleName, data) {
        let session = this.getSession();
        session.modules[moduleName] = { completed_at: new Date().toISOString(), data: data };
        localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
    },

    exportJSON: function() {
        const session = this.getSession();
        session.end_time = new Date().toISOString(); 
        const blob = new Blob([JSON.stringify(session, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); 
        a.href = url; a.download = `CAS_${session.session_id}.json`; 
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
    },

    clearSession: function() {
        if(confirm("确定清除当前受试者数据并结束会话吗？")) { 
            localStorage.removeItem(this.SESSION_KEY); window.location.href = 'index.html'; 
        }
    }
};
