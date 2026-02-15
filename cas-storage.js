// 文件名: cas-storage.js
const CAS_Storage = {
    SESSION_KEY: 'CAS_Current_Session',
    hasSession: () => localStorage.getItem('CAS_Current_Session') !== null,
    
    initSession: function(subjectInfo) {
        // 强制保障利手和教育水平等所有字段入库
        const sessionData = {
            session_id: subjectInfo.subject_id,
            demographics: {
                subject_id: subjectInfo.subject_id,
                name: subjectInfo.name,
                dob: subjectInfo.dob,
                gender: subjectInfo.gender,
                handedness: subjectInfo.handedness,     // 已修复
                education_level: subjectInfo.education_level // 已修复
            },
            start_time: new Date().toISOString(),
            modules: {} 
        };
        localStorage.setItem(this.SESSION_KEY, JSON.stringify(sessionData));
    },

    getSession: function() {
        const data = localStorage.getItem(this.SESSION_KEY);
        return data ? JSON.parse(data) : { demographics: {}, modules: {} };
    },

    saveModuleData: function(moduleName, data) {
        let session = this.getSession();
        session.modules[moduleName] = { 
            completed_at: new Date().toISOString(), 
            data: data 
        };
        localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
    },

    exportJSON: function() {
        const session = this.getSession();
        session.end_time = new Date().toISOString(); 
        const blob = new Blob([JSON.stringify(session, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); 
        a.href = url; a.download = `CAS_${session.session_id}_Complete.json`; 
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
    },

    clearSession: function() {
        if(confirm("确定清除当前受试者的所有测试缓存吗？")) {
            localStorage.removeItem(this.SESSION_KEY);
            location.href = 'index.html';
        }
    }
};
