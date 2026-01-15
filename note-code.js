/**
 * STORAGE HELPER
 * Quản lý tập trung việc lưu trữ dữ liệu trong ứng dụng
 */

const StorageHelper = {
    /**
     * PHẦN 1: LOCALSTORAGE (Dữ liệu lâu dài)
     */
    
    // Lưu thông tin người dùng (KHÔNG bao gồm token)
    setUserInfo(userInfo) {
        const safeInfo = {
            email: userInfo.email,
            name: userInfo.name || userInfo.user?.name,
            role: userInfo.role || userInfo.user?.role,
            avatar: userInfo.avatar || userInfo.user?.avatar,
            // KHÔNG lưu access_token, refresh_token
        };
        localStorage.setItem('user_info', JSON.stringify(safeInfo));
    },

    getUserInfo() {
        const data = localStorage.getItem('user_info');
        return data ? JSON.parse(data) : null;
    },

    // Lưu cấu hình giao diện (UI Configs)
    setUIConfigs(configs) {
        localStorage.setItem('ui_configs', JSON.stringify(configs));
    },

    getUIConfigs() {
        const data = localStorage.getItem('ui_configs');
        return data ? JSON.parse(data) : null;
    },

    // Lưu danh sách mẫu cấu hình người dùng (Cache)
    setUserConfigs(configs) {
        localStorage.setItem('user_configs_api', JSON.stringify(configs));
    },

    getUserConfigs() {
        const data = localStorage.getItem('user_configs_api');
        return data ? JSON.parse(data) : [];
    },

    // Lưu preferences người dùng
    setPreferences(prefs) {
        localStorage.setItem('user_preferences', JSON.stringify(prefs));
    },

    getPreferences() {
        const data = localStorage.getItem('user_preferences');
        return data ? JSON.parse(data) : {
            theme: 'light',
            language: 'vi',
            notifications_enabled: true
        };
    },

    /**
     * PHẦN 2: SESSIONSTORAGE (Dữ liệu tạm thời trong phiên)
     */
    
    // Lưu draft form (form đang làm dở)
    saveDraft(formData) {
        sessionStorage.setItem('draft_config', JSON.stringify(formData));
    },

    getDraft() {
        const data = sessionStorage.getItem('draft_config');
        return data ? JSON.parse(data) : null;
    },
    
    clearDraft() {
        sessionStorage.removeItem('draft_config');
    },

    // Lưu template được chọn để chuyển sang trang khác
    setSelectedTemplate(template) {
        sessionStorage.setItem('selected_template', JSON.stringify(template));
    },

    getSelectedTemplate() {
        const data = sessionStorage.getItem('selected_template');
        return data ? JSON.parse(data) : null;
    },

    clearSelectedTemplate() {
        sessionStorage.removeItem('selected_template');
    },

    // Lưu trạng thái phân trang
    setPageState(page, filter = null) {
        sessionStorage.setItem('current_page', page.toString());
        if (filter) sessionStorage.setItem('current_filter', filter);
    },

    getPageState() {
        return {
            page: parseInt(sessionStorage.getItem('current_page') || '1'),
            filter: sessionStorage.getItem('current_filter') || 'all'
        };
    },

    /**
     * PHẦN 3: XÓA DỮ LIỆU KHI ĐĂNG XUẤT
     */

    clearUserData() {
        // Xóa tất cả dữ liệu người dùng
        localStorage.removeItem('user_info');
        localStorage.removeItem('user_configs_api');
        localStorage.removeItem('user_preferences');
        
        // Xóa session
        sessionStorage.clear();
        
        // GIỮ LẠI UI Configs (vì không liên quan đến user cụ thể)
        // localStorage.removeItem('ui_configs'); // KHÔNG xóa cái này
    },

    clearAllData() {
        // Xóa TẤT CẢ (bao gồm cả UI Configs)
        localStorage.clear();
        sessionStorage.clear();
    },


    /**
     * PHẦN 4: KIỂM TRA XEM USER ĐÃ ĐĂNG NHẬP CHƯA
     */

    isLoggedIn() {
        // Kiểm tra xem có thông tin user trong localStorage không
        // Lưu ý: Cookie authentication thực sự được verify ở backend
        const userInfo = this.getUserInfo();
        return userInfo !== null && userInfo.email;
    },

    /**
     * PHẦN 5: DEBUG & MAINTENANCE
     */

    // Hiển thị tất cả dữ liệu đang lưu (để debug)
    debug() {
        console.group('📦 Storage Debug Info');
        console.log('LocalStorage:');
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            console.log(`  ${key}:`, localStorage.getItem(key));
        }
        console.log('SessionStorage:');
        for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i);
            console.log(`  ${key}:`, sessionStorage.getItem(key));
        }
        console.groupEnd();
    },

    // Tính dung lượng đang sử dụng
    getStorageSize() {
        let localSize = 0;
        let sessionSize = 0;

        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                localSize += localStorage[key].length + key.length;
            }
        }

        for (let key in sessionStorage) {
            if (sessionStorage.hasOwnProperty(key)) {
                sessionSize += sessionStorage[key].length + key.length;
            }
        }

        return {
            localStorage: (localSize / 1024).toFixed(2) + ' KB',
            sessionStorage: (sessionSize / 1024).toFixed(2) + ' KB',
            total: ((localSize + sessionSize) / 1024).toFixed(2) + ' KB'
        };
    }
};

// Export để dùng ở các file khác
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StorageHelper;
}

