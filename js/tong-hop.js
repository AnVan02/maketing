/**
 * PHẦN 1: KIỂM TRA QUYỀN TRUY CẬP (AUTH CHECK)
 * Đảm bảo người xem đã đăng nhập thành công trước khi hiển thị dữ liệu.
 * 
 * Lưu ý: Với HTTP-only cookies, việc kiểm tra chỉ mang tính tham khảo.
 * Server sẽ tự động kiểm tra cookies khi gọi API. Nếu không hợp lệ sẽ trả về 401.
 */
function checkAuth() {
    const userInfo = localStorage.getItem('user_info');
    if (!userInfo) {
        console.warn('⚠️ Hệ thống: Không tìm thấy thông tin đăng nhập. Đang chuyển hướng...');
        window.location.href = 'dang-nhap.php';
        return false;
    }
    return true;
}

/**
 * TIỆN ÍCH: Định dạng thời gian cho dễ đọc.
 * Chuyển dữ liệu thô (2026-01-14T...) thành (14/01/2026 13:50).
 */
function formatDateTime(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
}

/**
 * PHẦN 2: QUẢN LÝ DỮ LIỆU VÀ PHÂN TRANG (STATE MANAGEMENT)
 * Lưu trữ trạng thái hiện tại của ứng dụng.
 */
let currentPage = 1;      // Trang dữ liệu đang hiển thị hiện tại
let totalArticles = 0;    // Tổng số bài viết lấy được từ Server
const itemsPerPage = 10;  // Mỗi trang chỉ hiện tối đa 10 dòng dữ liệu
let currentTab = 'seo';   // 'seo' hoặc 'facebook'

/**
 * PHẦN 3: CÁC HÀM TƯƠNG TÁC API
 */

// 1. Lấy danh sách bài viết theo từng trang (kéo dữ liệu SEO)
async function fetchArticles(limit = 10, offset = 0) {
    try {
        const response = await apiRequest(`/seo/articles?limit=${limit}&offset=${offset}`, {
            method: 'GET'
        });

        if (response.success && response.articles) {
            return {
                articles: response.articles,
                total: response.total
            };
        } else {
            return { articles: [], total: 0 };
        }
    } catch (error) {
        console.error('❌ Lỗi lấy danh sách bài SEO:', error);
        return { articles: [], total: 0 };
    }
}

// 1.2 Lấy danh sách bài viết Facebook
async function fetchFacebookPosts(limit = 10, offset = 0) {
    try {
        const response = await apiRequest(`/facebook/publish/posts?limit=${limit}&offset=${offset}`, {
            method: 'GET'
        });

        let posts = [];
        if (response && response.posts) posts = response.posts;
        else if (response && response.articles) posts = response.articles;
        else if (Array.isArray(response)) posts = response;
        else if (response.data && Array.isArray(response.data)) posts = response.data;

        return {
            articles: posts,
            total: response.total || posts.length
        };
    } catch (error) {
        console.error('❌ Lỗi lấy danh sách bài Facebook:', error);
        return { articles: [], total: 0 };
    }
}

// 2. Hỏi server tổng cộng có bao nhiêu bài (Để tính số trang 1, 2, 3...)
async function fetchTotalArticles() {
    try {
        const response = await apiRequest(`/seo/articles?limit=1&offset=0`, {
            method: 'GET'
        });
        return response.success ? (response.total || 0) : 0;
    } catch (error) {
        return 0;
    }
}

/**
 * PHẦN 4: ĐIỀU KHIỂN GIAO DIỆN BẢNG DỮ LIỆU (UI RENDERING)
 * Biến mảng dữ liệu thành các thẻ <tr> <td> trong HTML.
 */
function renderArticles(articles, isLoading = false) {
    const tableBody = document.getElementById('configTableBody');
    const tableHeader = document.querySelector('.activity-table thead tr');
    if (!tableBody || !tableHeader) return;

    // Cập nhật Header dựa trên tab
    if (currentTab === 'seo') {
        tableHeader.innerHTML = `
            <th style="width: 40px;"><i class="far fa-square" style="color: #cbd5e1;"></i></th>
            <th>Tiêu đề bài viết</th>
            <th>Khoá chính</th>
            <th>Số lượng từ</th>
            <th>Meta-description</th>
            <th style="text-align: center;">Ngày đăng</th>
            <th style="text-align: center;">Hình ảnh</th>
            <th style="text-align: center;">Hành động</th>
        `;
    } else {
        tableHeader.innerHTML = `
            <th>Nội dung bài viết</th>
            <th>Trang Fanpage</th>
            <th>Trạng thái</th>
            <th>Thời gian</th>
            <th>Hành động</th>
        `;
    }

    if (isLoading) {
        const colSpan = currentTab === 'seo' ? 8 : 5;
        tableBody.innerHTML = `
            <tr>
                <td colspan="${colSpan}" style="text-align: center; padding: 40px; color: #999;">
                    <div class="loader-container">
                        <i class="fas fa-spinner fa-spin" style="font-size: 24px; margin-bottom: 10px; display: block;"></i>
                        <span>Đang tải dữ liệu, vui lòng đợi...</span>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = '';

    if (!articles || articles.length === 0) {
        const colSpan = currentTab === 'seo' ? 8 : 5;
        tableBody.innerHTML = `<tr><td colspan="${colSpan}" style="text-align:center; padding:20px;">Chưa có bài viết nào.</td></tr>`;
        return;
    }

    articles.forEach(item => {
        const row = document.createElement('tr');

        if (currentTab === 'seo') {
            const title = item.title || 'Bài viết chưa đặt tên';
            const keyword = item.main_keyword || '---';
            const wordCount = item.word_count || (item.content ? item.content.split(/\s+/).length : 0);
            const meta = item.meta_description || '---';
            const date = formatDateTime(item.created_at).split(' ')[0];
            const hasImage = (item.html_content && item.html_content.includes('<img')) ? 'Có' : 'Không';
            const imageColor = hasImage === 'Có' ? '#10B981' : '#64748b';

            row.innerHTML = `
                <td style="text-align: center;"><i class="far fa-square" style="color: #cbd5e1;"></i></td>
                <td>
                    <div style="font-weight: 600; color: #1e293b;">${title}</div>
                </td>
                <td><span style="color: #64748b;">${keyword}</span></td>
                <td style="text-align: center; color: #64748b;">${wordCount}</td>
                <td><div style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: #64748b;">${meta}</div></td>
                <td style="text-align: center; color: #64748b;">${date}</td>
                <td style="text-align: center; color: ${imageColor}; font-weight: 600;">${hasImage}</td>
                <td style="text-align: center;">
                    <div style="display: flex; gap: 12px; justify-content: center; align-items: center;">
                        <button class="action-btn-mini" style="color: #EF4444;" onclick="deleteArticle('${item.id}')"><i class="fas fa-trash-alt"></i></button>
                        <button class="action-btn-mini" style="color: #3B82F6;" onclick="editArticle('${item.id}')"><i class="fas fa-edit"></i></button>
                    </div>
                </td>
            `;
        } else {
            const content = item.content || item.message || '(Không có nội dung)';
            const truncatedContent = content.length > 60 ? content.substring(0, 60) + '...' : content;
            const statusText = item.published ? 'Đã đăng' : 'Đang xử lý';
            const statusColor = item.published ? '#16a34a' : '#ca8a04';
            const statusBg = item.published ? '#f0fdf4' : '#fefce8';

            row.innerHTML = `
                <td><div style="font-weight: 500; color: #1e293b; max-width: 300px;">${truncatedContent}</div></td>
                <td>${item.page_name || '---'}</td>
                <td>
                    <span style="background: ${statusBg}; color: ${statusColor}; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 500;">
                        ${statusText}
                    </span>
                </td>
                <td>${formatDateTime(item.created_at)}</td>
                <td>
                    ${item.facebook_post_id ? `<a href="https://facebook.com/${item.facebook_post_id}" target="_blank" class="manage-link">Xem</a>` : '---'}
                </td>
            `;
        }
        tableBody.appendChild(row);
    });
}

/**
 * PHẦN 5: CẬP NHẬT CÁC Ô THỐNG KÊ (STATS CARDS)
 * Đếm tổng số bài, số bài đã xuất bản, và số bài nháp.
 */
async function updateStats() {
    try {
        // 1. Cập nhật thống kê SEO
        const seoResponse = await apiRequest(`/seo/articles?limit=1&offset=0`, { method: 'GET' });
        if (seoResponse && seoResponse.articles) {
            const seoTotal = seoResponse.total || 0;
            // Vì API SEO hiện tại chưa trả về số lượng nháp/xuất bản cụ thể trong một request stats, 
            // chúng ta có thể gọi thêm một request nếu thực sự cần, hoặc hiển thị tổng cộng.
            // Tạm thời lấy seoTotal và giả định dữ liệu.
            const seoCardNum = document.querySelector('#card-seo .stat-number');
            const seoCardSub = document.querySelector('#card-seo .sub-stat');

            if (seoCardNum) seoCardNum.textContent = `${seoTotal} bài`;
            if (seoCardSub) seoCardSub.textContent = `Tổng số bài viết SEO đã tạo`;

            if (currentTab === 'seo') totalArticles = seoTotal;
        }

        // 2. Cập nhật thống kê Facebook
        const fbResponse = await apiRequest(`/facebook/publish/posts?limit=1&offset=0`, { method: 'GET' });
        if (fbResponse) {
            const fbTotal = fbResponse.total || (fbResponse.posts ? fbResponse.posts.length : 0);
            const fbCardNum = document.querySelector('#card-facebook .stat-number');
            const fbCardSub = document.querySelector('#card-facebook .sub-stat');

            if (fbCardNum) fbCardNum.textContent = `${fbTotal} bài`;
            if (fbCardSub) fbCardSub.textContent = `Tổng số bài viết Facebook đã đăng`;

            if (currentTab === 'facebook') totalArticles = fbTotal;
        }

        // Vẽ lại thanh phân trang
        updatePaginationInfo();
        renderPagination();
    } catch (error) {
        console.error('❌ Lỗi cập nhật thống kê:', error);
    }
}

/**
 * PHẦN 6: HỆ THỐNG PHÂN TRANG (PAGINATION)
 * Điều khiển các nút "Trước", "Sau" và các số trang 1, 2, 3...
 */

// Cập nhật thông tin: "Đang xem bài 1 đến 10 trong tổng số 100 bài"
function updatePaginationInfo() {
    const showingFrom = document.getElementById('showingFrom');
    const showingTo = document.getElementById('showingTo');
    const totalArticlesElement = document.getElementById('totalArticles');

    if (!showingFrom || !showingTo || !totalArticlesElement) return;

    if (totalArticles === 0) {
        showingFrom.textContent = '0';
        showingTo.textContent = '0';
        totalArticlesElement.textContent = '0';
        return;
    }

    const from = (currentPage - 1) * itemsPerPage + 1;
    const to = Math.min(currentPage * itemsPerPage, totalArticles);

    showingFrom.textContent = from;
    showingTo.textContent = to;
    totalArticlesElement.textContent = totalArticles;
}

// Vẽ các nút bấm phân trang vào vùng 'paginationControls'
function renderPagination() {
    const paginationControls = document.getElementById('paginationControls');
    if (!paginationControls) return;

    paginationControls.innerHTML = '';
    const totalPages = Math.ceil(totalArticles / itemsPerPage);

    if (totalPages <= 1) return; // Chỉ có 1 trang thì không cần hiện nút

    // Nút "Trước"
    const prevBtn = document.createElement('button');
    prevBtn.className = 'pagination-btn';
    prevBtn.textContent = 'Trước';
    prevBtn.disabled = currentPage === 1;
    prevBtn.onclick = () => goToPage(currentPage - 1);
    paginationControls.appendChild(prevBtn);

    // Vẽ các số trang (Logic tự động rút gọn dấu ... nếu quá nhiều trang)
    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.className = `pagination-btn ${i === currentPage ? 'active' : ''}`;
        btn.textContent = i;
        btn.onclick = () => goToPage(i);
        paginationControls.appendChild(btn);
    }

    // Nút "Tiếp"
    const nextBtn = document.createElement('button');
    nextBtn.className = 'pagination-btn';
    nextBtn.textContent = 'Tiếp';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.onclick = () => goToPage(currentPage + 1);
    paginationControls.appendChild(nextBtn);
}

// Hàm thực thi việc chuyển sang một trang khác
async function goToPage(page) {
    if (page < 1) return;

    currentPage = page;
    renderArticles([], true); // Hiện Loading

    const offset = (currentPage - 1) * itemsPerPage;
    const result = currentTab === 'seo'
        ? await fetchArticles(itemsPerPage, offset)
        : await fetchFacebookPosts(itemsPerPage, offset);

    if (result.total) totalArticles = result.total;
    else totalArticles = result.articles ? result.articles.length : 0;

    renderArticles(result.articles);
    updatePaginationInfo();
    renderPagination();

    // Cuộn trang lên đầu bảng cho dễ xem nếu cần
    const tableHeader = document.querySelector('.activity-header');
    if (tableHeader) tableHeader.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Hàm giả lập Xoá bài viết (Cần tích hợp API thật sau)
window.deleteArticle = (id) => {
    if (confirm('Bạn có chắc chắn muốn xoá bài viết này?')) {
        console.log('🗑️ Xoá bài:', id);
        // await apiRequest(`/seo/articles/${id}`, { method: 'DELETE' });
        // goToPage(currentPage);
    }
}

// Hàm chuyển tới trang Sửa bài viết
window.editArticle = (id) => {
    console.log('✏️ Sửa bài:', id);
    // window.location.href = `viet-bai-seo.php?id=${id}`;
}

/**
 * PHẦN 7: TƯƠNG TÁC GIAO DIỆN KHÁC (TABS, CHARTS)
 */

// Đổi qua lại giữa tab SEO và tab Facebook
function setupInteractions() {
    const cardSeo = document.getElementById('card-seo');
    const cardFacebook = document.getElementById('card-facebook');
    const analyticsSeo = document.getElementById('analytics-seo');
    const analyticsFacebook = document.getElementById('analytics-facebook');
    const tabBtns = document.querySelectorAll('.tab-btn');

    if (!cardSeo || !cardFacebook) return;

    const switchTab = async (tab) => {
        if (currentTab === tab) return;
        currentTab = tab;

        // Cập nhật UI tabs
        tabBtns.forEach(btn => {
            if ((tab === 'seo' && btn.textContent.includes('SEO')) ||
                (tab === 'facebook' && btn.textContent.includes('Facebook'))) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // Cập nhật Analytics
        if (tab === 'seo') {
            analyticsSeo.style.display = 'block';
            analyticsFacebook.style.display = 'none';
        } else {
            analyticsFacebook.style.display = 'block';
            analyticsSeo.style.display = 'none';
        }

        // Tải lại dữ liệu
        await goToPage(1);
    };

    cardSeo.addEventListener('click', () => switchTab('seo'));
    cardFacebook.addEventListener('click', () => switchTab('facebook'));

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.textContent.includes('SEO') ? 'seo' : 'facebook';
            switchTab(tab);
        });
    });

    const statusBtns = document.querySelectorAll('.status-btn');
    statusBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            statusBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            console.log(`🔍 Lọc theo trạng thái: ${btn.textContent}`);
            // Logic lọc sẽ được thêm vào hàm fetchArticles/fetchFacebookPosts sau
        });
    });

    const syncBtn = document.querySelector('.sync-btn-custom');
    if (syncBtn) {
        syncBtn.addEventListener('click', () => {
            console.log('🔄 Đang đồng bộ lại dữ liệu...');
            goToPage(1);
        });
    }
}

// Vẽ biểu đồ tăng trưởng (Sử dụng Tool Chart.js)
function initCharts() {
    const seoCtx = document.getElementById('seoChart')?.getContext('2d');
    if (seoCtx) {
        new Chart(seoCtx, {
            type: 'bar',
            data: {
                labels: ['T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'],
                datasets: [{
                    label: 'Lượt truy cập',
                    data: [5231, 2241, 8921, 12213, 10145, 8597, 12847],
                    backgroundColor: '#3B82F6',
                    borderRadius: 4,
                    barThickness: 20
                }]
            },
            options: {
                indexAxis: 'y', // Chuyển sang biểu đồ ngang
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: {
                        grid: { display: false },
                        border: { display: false }
                    },
                    y: {
                        grid: { display: false },
                        border: { display: false }
                    }
                }
            }
        });
    }

    const fbCtx = document.getElementById('facebookChart')?.getContext('2d');
    if (fbCtx) {
        const hours = Array.from({ length: 24 }, (_, i) => i.toString());

        // Tạo dữ liệu giả lập có xu hướng tăng vào giờ trưa/chiều
        const generateData = (base) => hours.map(h => {
            const hr = parseInt(h);
            let val = base + Math.random() * 20;
            if (hr >= 10 && hr <= 15) val *= 3;
            else if (hr >= 6 && hr <= 9) val *= 1.5;
            else if (hr >= 16 && hr <= 20) val *= 2;
            else val *= 0.5;
            return Math.floor(val);
        });

        new Chart(fbCtx, {
            type: 'bar',
            data: {
                labels: hours,
                datasets: [
                    { label: 'Thứ Hai', data: generateData(30), backgroundColor: '#60A5FA' },
                    { label: 'Thứ Ba', data: generateData(25), backgroundColor: '#D97706' },
                    { label: 'Thứ Tư', data: generateData(35), backgroundColor: '#22D3EE' },
                    { label: 'Thứ Năm', data: generateData(20), backgroundColor: '#FBBF24' },
                    { label: 'Thứ Sáu', data: generateData(40), backgroundColor: '#3B82F6' },
                    { label: 'Thứ Bảy', data: generateData(45), backgroundColor: '#34D399' },
                    { label: 'Chủ Nhật', data: generateData(50), backgroundColor: '#1D4ED8' }
                ]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: { boxWidth: 12, padding: 20, font: { size: 11 } }
                    }
                },
                scales: {
                    x: {
                        stacked: true,
                        grid: { color: '#f1f5f9' },
                        border: { display: false },
                        max: 600
                    },
                    y: {
                        stacked: true,
                        grid: { display: false },
                        border: { display: false }
                    }
                }
            }
        });
    }
}
// lấy dữ liệu 

/**
 * KHỞI CHẠY (INITIALIZATION)
 * Chạy toàn bộ hệ thống khi trình duyệt đã sẵn sàng.
 */
document.addEventListener('DOMContentLoaded', async () => {
    if (!checkAuth()) return; // Kiểm tra đăng nhập

    initCharts();        // Vẽ biểu đồ
    setupInteractions(); // Cài đặt nút bấm

    // 1. Lấy dữ liệu thống kê tổng quát
    updateStats();

    // 2. Tải trang dữ liệu đầu tiên
    await goToPage(1);
});