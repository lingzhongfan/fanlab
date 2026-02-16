// 文件名: cas-storage.js
/**
 * NeuroMap (The Neuro-Behavioral Multimodal Assessment Platform) 核心存储引擎
 * 临床意义: 负责在无网络(Offline)环境下，将22+项高频行为学时序数据(Time-Series)
 * 与横截面量表数据(Cross-Sectional)持久化在本地浏览器，保障社区筛查的数据安全。
 */
const CAS_Storage = {
    SESSION_KEY: 'CAS_Current_Session',
    
    // 检查当前是否存在活跃的受试者会话
    hasSession: () => localStorage.getItem('CAS_Current_Session') !== null,
    
    // 初始化基线档案 (严格捕获协变量：利手、教育、年龄、性别)
    initSession: function(subjectInfo) {
        const sessionData = {
            session_id: subjectInfo.subject_id,
            demographics: {
                subject_id: subjectInfo.subject_id,
                name: subjectInfo.name,
                dob: subjectInfo.dob,
                gender: subjectInfo.gender,
                handedness: subjectInfo.handedness,     // 运动皮层偏侧化协变量
                education_level: subjectInfo.education_level // 认知储备(Cognitive Reserve)协变量
            },
            start_time: new Date().toISOString(),
            modules: {} // 存放所有子范式数据的沙盒
        };
        localStorage.setItem(this.SESSION_KEY, JSON.stringify(sessionData));
    },

    getSession: function() {
        const data = localStorage.getItem(this.SESSION_KEY);
        return data ? JSON.parse(data) : { demographics: {}, modules: {} };
    },

    // 通用数据入库接口 (支持覆盖更新)
    saveModuleData: function(moduleName, data) {
        let session = this.getSession();
        session.modules[moduleName] = { 
            completed_at: new Date().toISOString(), 
            data: data 
        };
        localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
    },

    // 临床特征包打包导出 (直接输出为可供 Python/R 读取的标准化 JSON)
    exportJSON: function() {
        const session = this.getSession();
        session.end_time = new Date().toISOString(); 
        const blob = new Blob([JSON.stringify(session, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); 
        a.href = url; a.download = `CAS_Export_${session.session_id}_${new Date().getTime()}.json`; 
        document.body.appendChild(a); a.click(); document.body.removeChild(a);
    },

    // 防误触的会话终结机制
    clearSession: function() {
        if(confirm("⚠️ 危险操作：确定要清除当前受试者的所有测试缓存吗？\n(请务必确保已经点击导出 JSON 并备份数据！)")) {
            localStorage.removeItem(this.SESSION_KEY);
            location.href = 'index.html';
        }
    }
};
