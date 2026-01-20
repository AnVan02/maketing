// ============================================
// 1. HẰNG SỐ & BIẾN TOÀN CỤC
// ============================================
const STORAGE_KEY = 'selected_files_v1';

let selectedFiles = [];

// ============================================
// 2. HÀM HỖ TRỢ AN TOÀN
// ============================================

// Gọi hàm an toàn (không crash khi hàm chưa tồn tại)
function safeCall(fn, ...args) {
    if (typeof fn === 'function') {
        try {
            return fn(...args);
        } catch (e) {
            console.error('Lỗi khi gọi hàm:', fn?.name, e);
        }
    }
}

// Lấy phần tử DOM an toàn
function $(selector) {
    try {
        return document.querySelector(selector);
    } catch {
        return null;
    }
}


// ============================================
// 3. KHỞI TẠO TRANG CHÍNH
// ============================================
async function initializePage() {
    console.log('⏳ Đang khởi tạo hệ thống...');

    // 1. Load cấu hình API (có chống lỗi)
    if (typeof loadConfigs === 'function') {
        try {
            await loadConfigs();
        } catch (e) {
            console.warn('⚠️ Lỗi khi loadConfigs:', e);
        }
    }

    // 2. Load dữ liệu đã lưu từ localStorage
    try {
        const savedFiles = localStorage.getItem(STORAGE_KEY);
        if (savedFiles) {
            selectedFiles = JSON.parse(savedFiles);
        }
    } catch (e) {
        console.warn('⚠️ Lỗi localStorage:', e);
        selectedFiles = [];
    }

    // 3. Khởi tạo các module giao diện
    // safeCall(updateSubtabStates);
    safeCall(initializeKeywordTags);
    safeCall(initializeAiSuggest);
    safeCall(setupDraftSystem);
    safeCall(loadDraft);

    // 4. Tự động bấm tab đầu tiên có thể dùng
    // (Đã tắt để tránh lỗi nhảy trang không mong muốn)
    /* 
    setTimeout(() => {
        const firstSub = $('.sub[data-sub="file"]');

        if (firstSub && !firstSub.classList.contains('locked')) {
            firstSub.click();
        } else {
            const availableTab = $('.sub:not(.locked)');
            if (availableTab) {
                availableTab.click();
            }
        }
    }, 100); 
    */

    // 5. Cập nhật preview độ dài bài viết theo thời gian thực
    const lenInput = $('#article_length');

    if (lenInput) {
        const preview = $('#previewLength');

        lenInput.addEventListener('input', () => {
            if (preview) {
                preview.textContent = lenInput.value + ' từ';
            }
        });
    }

    // 6. Hiển thị thông báo khi sẵn sàng
    if (typeof showNotification === 'function') {
        showNotification('Hệ thống đã sẵn sàng!', 'info');
    }

    // 7. Active State & Scroll Persistence (Chống nhảy sidebar)
    safeCall(initializeSidebarState);

    console.log('✅ Hệ thống đã sẵn sàng');
}

// ============================================
// 4. QUẢN LÝ TRẠNG THÁI SIDEBAR (Auto Active + Scroll)
// ============================================
function initializeSidebarState() {
    // A. Highlight Active Link
    const currentPath = window.location.pathname;
    const page = currentPath.split("/").pop();
    const links = document.querySelectorAll('.sidebar-nav .nav-item');

    links.forEach(link => {
        const href = link.getAttribute('href');

        // Active logic
        if (href && href !== '#' && (href === page || currentPath.endsWith(href))) {
            link.classList.add('active');

            // Prevent reload if clicking current page
            link.addEventListener('click', (e) => {
                e.preventDefault();
            });
        }

        // Save scroll on click
        link.addEventListener('click', saveSidebarScroll);
    });

    // B. Restore Scroll Position
    const sidebar = document.querySelector('.sidebar-nav');
    const savedScroll = localStorage.getItem('sidebar_scroll_y');

    if (sidebar && savedScroll) {
        // Restore immediately
        sidebar.scrollTop = parseInt(savedScroll);
    }

    // C. Save scroll on unload (cho các trường hợp reload khác)
    window.addEventListener('beforeunload', saveSidebarScroll);
}

function saveSidebarScroll() {
    const sidebar = document.querySelector('.sidebar-nav');
    if (sidebar) {
        localStorage.setItem('sidebar_scroll_y', sidebar.scrollTop);
    }
}

// ============================================
// 5. XỬ LÝ ĐÓNG / MỞ SIDEBAR
// ============================================
function initializeSidebarToggle() {
    const toggleBtn = $('.menu-toggle');
    const appContainer = $('.app-container');

    if (!toggleBtn || !appContainer) {
        console.warn('⚠️ Không tìm thấy phần tử sidebar');
        return;
    }

    toggleBtn.addEventListener('click', () => {
        appContainer.classList.toggle('sidebar-collapsed');
    });
}

// ============================================
// 5. CHẠY KHI DOM LOAD XONG
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    initializePage();
    initializeSidebarToggle();
});
