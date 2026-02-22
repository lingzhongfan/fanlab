// 文件名: cas-storage.js
/**
 * CAS 4.0 Clinical Data Engine (v4.3 疾病风险拓展版)
 * 包含原始时序数据收集与计算精神病学风险标签的统一存储
 */
const CAS_Storage = {
    SESSION_KEY: 'cas_clinical_session_v4',

    // 初始化或获取当前测试会话
    getSession: function() {
        let session = localStorage.getItem(this.SESSION_KEY);
        if (!session) {
            session = {
                session_id: 'CAS_' + new Date().getTime(),
                start_time: new Date().toISOString(),
                last_update: new Date().toISOString(),
                hardware_metadata: {
                    user_agent: navigator.userAgent,
                    screen_resolution: `${window.screen.width}x${window.screen.height}`,
                    device_pixel_ratio: window.devicePixelRatio,
                    platform: navigator.platform
                },
                demographics: {}, 
                ema_fatigue_logs: [], 
                modules: {}, 
                // 计算精神病学风险画像标签，利于未来 Python/MATLAB 直接读取特征靶点
                computational_risk_profile: {
                    generated_at: null,
                    risk_scores: {},
                    clinical_flags: []
                }
            };
            localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
        } else {
            session = JSON.parse(session);
        }
        return session;
    },

    // 保存单个模块的时序数据
    saveModuleData: function(moduleId, data) {
        let session = this.getSession();
        session.modules[moduleId] = { 
            timestamp: new Date().toISOString(), 
            data: data 
        };
        session.last_update = new Date().toISOString();
        localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
        console.log(`[CAS_Storage] 模块 [${moduleId}] 临床特征已安全入库。`);
    },

    // 记录生态瞬时疲劳评估 (EMA)
    recordFatigue: function(score) {
        let session = this.getSession();
        session.ema_fatigue_logs.push({ 
            timestamp: new Date().toISOString(), 
            fatigue_score: parseInt(score) 
        });
        localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
    },

    // 保存系统计算得出的疾病风险权重图谱
    saveRiskProfile: function(scores, flags) {
        let session = this.getSession();
        session.computational_risk_profile = {
            generated_at: new Date().toISOString(),
            risk_scores: scores,
            clinical_flags: flags
        };
        session.last_update = new Date().toISOString();
        localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
    },

    // 检查某模块是否已完成
    isModuleCompleted: function(moduleId) {
        let session = this.getSession();
        return session.modules.hasOwnProperty(moduleId);
    },

    // 销毁当前缓存
    clearSession: function() {
        if (confirm("⚠️ 临床高危操作：您确定要清空当前受试者的所有多模态数据吗？此操作不可逆！")) {
            localStorage.removeItem(this.SESSION_KEY);
            alert("临床数据已彻底销毁。");
            location.reload();
        }
    },

    // 导出 BIDS 标准的 JSON 档案
    exportJSON: function() {
        const session = this.getSession();
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(session, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        
        const subId = (session.demographics && session.demographics.subject_id) ? session.demographics.subject_id : "Anonymous";
        const timeTag = new Date().toISOString().replace(/[:.]/g, '-');
        downloadAnchorNode.setAttribute("download", `CAS_Data_Sub-${subId}_${timeTag}.json`);
        
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        document.body.removeChild(downloadAnchorNode);
    }
};
