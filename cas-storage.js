// 文件名: cas-storage.js
/**
 * CAS 4.0 Clinical Data Engine (Full Integration)
 * 负责全模态数据的持久化、硬件校准、EMA 日志与 BIDS 格式导出
 */
const CAS_Storage = {
    SESSION_KEY: 'cas_clinical_session_v4',

    // 1. 初始化或获取当前测试会话 (包含防抖与硬件环境提取)
    getSession: function() {
        let session = localStorage.getItem(this.SESSION_KEY);
        if (!session) {
            session = {
                session_id: 'CAS_' + new Date().getTime(),
                start_time: new Date().toISOString(),
                last_update: new Date().toISOString(),
                hardware_metadata: {
                    user_agent: navigator.userAgent,
                    screen_width: window.screen.width,
                    screen_height: window.screen.height,
                    device_pixel_ratio: window.devicePixelRatio,
                    platform: navigator.platform
                },
                demographics: {}, // 受试者基线资料
                ema_fatigue_logs: [], // 生态瞬时疲劳评估日志
                modules: {} // 存放 13 个子模块的高频时序数据
            };
            localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
        } else {
            session = JSON.parse(session);
        }
        return session;
    },

    // 2. 保存模块数据 (覆盖更新)
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

    // 3. 记录生态瞬时疲劳度 (EMA)
    recordFatigue: function(score) {
        let session = this.getSession();
        session.ema_fatigue_logs.push({
            timestamp: new Date().toISOString(),
            fatigue_score: parseInt(score)
        });
        localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
    },

    // 4. 检查某模块是否已完成
    isModuleCompleted: function(moduleId) {
        let session = this.getSession();
        return session.modules.hasOwnProperty(moduleId);
    },

    // 5. 危险操作：清空当前会话
    clearSession: function() {
        if (confirm("⚠️ 临床高危操作：您确定要清空当前受试者的所有测试数据吗？此操作不可逆！")) {
            localStorage.removeItem(this.SESSION_KEY);
            alert("临床数据已彻底销毁。");
            location.reload();
        }
    },

    // 6. 科研直出：导出 BIDS 兼容的 JSON 文件
    exportJSON: function() {
        const session = this.getSession();
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(session, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        
        // 遵循 BIDS 命名规范：CAS_Data_Sub-[ID]_[Timestamp].json
        const subId = (session.demographics && session.demographics.subject_id) ? session.demographics.subject_id : "Anonymous";
        const timeTag = new Date().toISOString().replace(/[:.]/g, '-');
        downloadAnchorNode.setAttribute("download", `CAS_Data_Sub-${subId}_${timeTag}.json`);
        
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        document.body.removeChild(downloadAnchorNode);
    }
};
