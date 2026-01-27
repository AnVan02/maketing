/**
 * PHẦN 1: KIỂM TRA QUYỀN TRUY CẬP (AUTH CHECK)
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
 * TIỆN ÍCH: Định dạng thời gian
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
 */
let currentPage = 1;
let totalArticles = 0; // Luôn giữ tổng số bài để phân trang chính xác
const itemsPerPage = 10;
let currentTab = 'seo';

/**
 * PHẦN 3: CÁC HÀM TƯƠNG TÁC API
 */

async function fetchArticles(limit = 10, offset = 0) {
    try {
        const response = await apiRequest(`/seo/articles?limit=${limit}&offset=${offset}`, { method: 'GET' });
        if (response.success && response.articles) {
            return {
                articles: response.articles,
                total: response.total // Ưu tiên dùng trường total từ Server nếu có
            };
        }
        return { articles: [], total: 0 };
    } catch (error) {
        console.error('❌ Lỗi lấy danh sách bài SEO:', error);
        return { articles: [], total: 0 };
    }
}

let currentFbStatus = ''; // Biến lưu trạng thái lọc Facebook hiện tại

async function fetchFacebookPosts(limit = 10, offset = 0) {
    try {
        let url = '/facebook/publish/posts';

        // If current status is scheduled, use the dedicated endpoint
        if (currentFbStatus === 'scheduled') {
            url = '/facebook/publish/posts/scheduled';
        } else if (currentFbStatus) {
            url += `?status=${currentFbStatus}`;
        }

        const response = await apiRequest(url);
        let posts = [];
        if (response && response.posts) posts = response.posts;
        else if (response && response.articles) posts = response.articles;
        else if (response && response.drafts) posts = response.drafts;
        else if (response && response.data) posts = response.data;
        else if (Array.isArray(response)) posts = response;

        // Sort by created_at desc if available
        posts.sort((a, b) => new Date(b.created_at || b.updated_at || 0) - new Date(a.created_at || a.updated_at || 0));

        // Client-side pagination
        const pagedPosts = posts.slice(offset, offset + limit);

        return {
            articles: pagedPosts,
            total: posts.length
        };
    } catch (error) {
        console.error('❌ Lỗi lấy danh sách bài Facebook:', error);
        return { articles: [], total: 0 };
    }
}

/**
 * MODULE XỬ LÝ ANALYTICS FACEBOOK
 */
const FacebookAnalytics = (function() {
    // Biến toàn cục
    let facebookChart = null;
    let currentSummary = null;
    let dateRange = {
        start: getDateDaysAgo(6), // 7 ngày trước
        end: getCurrentDate()
    };

    // Khởi tạo
    function init() {
        console.log('🔄 Khởi tạo Facebook Analytics...');
        setupEventListeners();
        setupDefaultDates();
    }

    // Thiết lập ngày mặc định
    function setupDefaultDates() {
        const startDateInput = document.getElementById('facebook_start_date');
        const endDateInput = document.getElementById('facebook_end_date');

        if (startDateInput && endDateInput) {
            startDateInput.value = dateRange.start;
            endDateInput.value = dateRange.end;
        }
    }

    // Thiết lập event listeners
    function setupEventListeners() {
        // Nút refresh
        const refreshBtn = document.getElementById('btn-refresh-facebook-stats');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', loadFacebookAnalytics);
        }

        // Date pickers
        const startDateInput = document.getElementById('facebook_start_date');
        const endDateInput = document.getElementById('facebook_end_date');

        if (startDateInput) {
            startDateInput.addEventListener('change', handleDateChange);
        }
        if (endDateInput) {
            endDateInput.addEventListener('change', handleDateChange);
        }
    }

    // Xử lý thay đổi ngày
    function handleDateChange() {
        const startDate = document.getElementById('facebook_start_date').value;
        const endDate = document.getElementById('facebook_end_date').value;

        if (startDate && endDate) {
            // Validate: startDate không được sau endDate
            if (new Date(startDate) > new Date(endDate)) {
                showNotification('❌ Ngày bắt đầu không thể sau ngày kết thúc', 'error');
                setupDefaultDates();
                return;
            }

            dateRange = { start: startDate, end: endDate };
            loadFacebookAnalytics();
        }
    }

    // Tải dữ liệu analytics
    async function loadFacebookAnalytics() {
        try {
            console.log('📊 Đang tải Facebook analytics...');
            
            // Hiển thị trạng thái loading
            showLoadingState(true);

            // Tính toán period dựa trên date range
            const period = calculatePeriodFromDates(dateRange.start, dateRange.end);
            
            // Lấy dữ liệu tổng quan
            const summary = await getEngagementSummary(period);
            
            if (summary && summary.success) {
                currentSummary = summary.data;
                updateChart(currentSummary);
                updateFooterStats(currentSummary);
            } else {
                throw new Error(summary?.message || 'Không thể lấy dữ liệu tổng quan');
            }

            // Lấy danh sách bài viết hiệu quả nhất
            const topPosts = await getTopPerformingPosts(5);
            if (topPosts && topPosts.success) {
                updateTopPosts(topPosts.data);
            }

            showNotification('✅ Cập nhật dữ liệu Facebook thành công', 'success');
            
        } catch (error) {
            console.error('❌ Lỗi tải Facebook analytics:', error);
            showNotification(`❌ Lỗi: ${error.message}`, 'error');
            showFallbackData();
        } finally {
            showLoadingState(false);
        }
    }

    // Cập nhật biểu đồ
    function updateChart(summaryData) {
        const ctx = document.getElementById('facebookChart');
        if (!ctx) return;

        // Destroy chart cũ nếu tồn tại
        if (facebookChart) {
            facebookChart.destroy();
        }

        // Chuẩn bị dữ liệu cho biểu đồ
        const chartData = prepareChartData(summaryData);

        // Tạo biểu đồ mới
        facebookChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: chartData.labels,
                datasets: [{
                    label: 'Tương tác',
                    data: chartData.interactions,
                    borderColor: '#1877F2', // Facebook blue
                    backgroundColor: 'rgba(24, 119, 242, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#1877F2',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 4
                }, {
                    label: 'Lượt xem',
                    data: chartData.views,
                    borderColor: '#42B72A', // Facebook green
                    backgroundColor: 'rgba(66, 183, 42, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#42B72A',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            padding: 20,
                            usePointStyle: true,
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12,
                        titleFont: {
                            size: 12
                        },
                        bodyFont: {
                            size: 12
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            font: {
                                size: 11
                            }
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            borderDash: [5, 5]
                        },
                        ticks: {
                            font: {
                                size: 11
                            },
                            callback: function(value) {
                                if (value >= 1000) {
                                    return (value / 1000).toFixed(1) + 'k';
                                }
                                return value;
                            }
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'nearest'
                }
            }
        });
    }

    // Chuẩn bị dữ liệu biểu đồ
    function prepareChartData(summaryData) {
        // Nếu có dữ liệu lịch sử, sử dụng nó
        if (summaryData.history && summaryData.history.length > 0) {
            const history = summaryData.history.slice(-30); // Lấy 30 ngày gần nhất
            return {
                labels: history.map(item => formatDate(item.date)),
                interactions: history.map(item => item.total_interactions || 0),
                views: history.map(item => item.total_reach || 0)
            };
        }

        // Fallback: tạo dữ liệu mẫu hoặc rỗng
        const days = getDateRangeArray(dateRange.start, dateRange.end);
        return {
            labels: days.map(date => formatDate(date)),
            interactions: days.map(() => Math.floor(Math.random() * 1000) + 500),
            views: days.map(() => Math.floor(Math.random() * 5000) + 1000)
        };
    }

    // Cập nhật thống kê footer
    function updateFooterStats(summaryData) {
        // Tổng tương tác
        const totalInteractions = document.querySelector('#analytics-facebook .footer-item:nth-child(1) .footer-value');
        if (totalInteractions && summaryData.total_interactions) {
            totalInteractions.textContent = formatNumber(summaryData.total_interactions);
            
            // Cập nhật trend
            const trendElement = totalInteractions.nextElementSibling;
            if (trendElement && summaryData.interaction_growth) {
                updateTrendElement(trendElement, summaryData.interaction_growth);
            }
        }

        // Bài nổi bật
        const topPostElement = document.querySelector('#analytics-facebook .footer-item:nth-child(2) .footer-value');
        if (topPostElement && summaryData.top_post_interactions) {
            topPostElement.textContent = formatNumber(summaryData.top_post_interactions);
        }

        // Tỉ lệ click (CTR)
        const ctrElement = document.querySelector('#analytics-facebook .footer-item:nth-child(3) .footer-value');
        if (ctrElement && summaryData.average_ctr) {
            ctrElement.textContent = `${summaryData.average_ctr.toFixed(2)}%`;
            
            // Cập nhật trend CTR
            const ctrTrendElement = ctrElement.nextElementSibling;
            if (ctrTrendElement && summaryData.ctr_growth) {
                updateTrendElement(ctrTrendElement, summaryData.ctr_growth, true);
            }
        }
    }

    // Cập nhật bài viết nổi bật
    function updateTopPosts(posts) {
        // Tìm element chứa bài nổi bật và cập nhật
        const topPostItem = document.querySelector('#analytics-facebook .footer-item:nth-child(2)');
        if (topPostItem && posts.length > 0) {
            const topPost = posts[0]; // Bài viết đầu tiên là hiệu quả nhất
            const postName = document.createElement('div');
            postName.className = 'footer-post-name';
            postName.textContent = truncateText(topPost.content || 'Bài viết không có nội dung', 30);
            postName.title = topPost.content || '';
            
            // Thêm vào footer item
            const existingPostName = topPostItem.querySelector('.footer-post-name');
            if (existingPostName) {
                existingPostName.remove();
            }
            topPostItem.appendChild(postName);
        }
    }

    // Hiển thị trạng thái loading
    function showLoadingState(isLoading) {
        const refreshBtn = document.getElementById('btn-refresh-facebook-stats');
        if (refreshBtn) {
            if (isLoading) {
                refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
                refreshBtn.disabled = true;
            } else {
                refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i>';
                refreshBtn.disabled = false;
            }
        }

        // Cập nhật footer values
        const footerValues = document.querySelectorAll('#analytics-facebook .footer-value');
        footerValues.forEach(element => {
            element.textContent = isLoading ? '...' : element.textContent;
        });
    }

    // Hiển thị dữ liệu fallback
    function showFallbackData() {
        const footerValues = document.querySelectorAll('#analytics-facebook .footer-value');
        if (footerValues[0]) footerValues[0].textContent = '--';
        if (footerValues[1]) footerValues[1].textContent = '--';
        if (footerValues[2]) footerValues[2].textContent = '--%';
    }

    // Helper functions
    function getDateDaysAgo(days) {
        const date = new Date();
        date.setDate(date.getDate() - days);
        return date.toISOString().split('T')[0];
    }

    function getCurrentDate() {
        return new Date().toISOString().split('T')[0];
    }

    function calculatePeriodFromDates(start, end) {
        const startDate = new Date(start);
        const endDate = new Date(end);
        const diffDays = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
        
        if (diffDays <= 1) return 'today';
        if (diffDays <= 7) return '7days';
        if (diffDays <= 30) return '30days';
        return 'custom';
    }

    function getDateRangeArray(start, end) {
        const dates = [];
        const currentDate = new Date(start);
        const endDate = new Date(end);
        
        while (currentDate <= endDate) {
            dates.push(new Date(currentDate));
            currentDate.setDate(currentDate.getDate() + 1);
        }
        
        return dates;
    }

    function formatDate(date) {
        if (!date) return '';
        const d = new Date(date);
        return `${d.getDate()}/${d.getMonth() + 1}`;
    }

    function formatNumber(num) {
        if (!num) return '0';
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'k';
        }
        return num.toString();
    }

    function updateTrendElement(element, growth, isPercentage = false) {
        if (!element || growth === undefined) return;
        
        element.className = 'footer-trend';
        
        if (growth > 0) {
            element.classList.add('trend-up');
            element.innerHTML = `<i class="fas fa-arrow-up"></i> ${isPercentage ? growth.toFixed(2) + '%' : formatNumber(growth)}`;
        } else if (growth < 0) {
            element.classList.add('trend-down');
            element.innerHTML = `<i class="fas fa-arrow-down"></i> ${isPercentage ? Math.abs(growth).toFixed(2) + '%' : formatNumber(Math.abs(growth))}`;
        } else {
            element.classList.add('trend-neutral');
            element.innerHTML = `<span style="font-size: 11px; color: #64748b;">Không đổi</span>`;
        }
    }

    function truncateText(text, maxLength) {
        if (!text) return 'N/A';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }

    function showNotification(message, type = 'info') {
        // Tìm hoặc tạo notification container
        let notificationContainer = document.getElementById('notification-container');
        if (!notificationContainer) {
            notificationContainer = document.createElement('div');
            notificationContainer.id = 'notification-container';
            notificationContainer.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 9999;
            `;
            document.body.appendChild(notificationContainer);
        }

        // Tạo notification
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div style="
                background: ${type === 'error' ? '#FEE2E2' : type === 'success' ? '#DCFCE7' : '#FEF9C3'};
                border: 1px solid ${type === 'error' ? '#FCA5A5' : type === 'success' ? '#86EFAC' : '#FDE047'};
                color: ${type === 'error' ? '#DC2626' : type === 'success' ? '#166534' : '#854D0E'};
                padding: 12px 16px;
                border-radius: 8px;
                margin-bottom: 10px;
                font-size: 14px;
                display: flex;
                align-items: center;
                gap: 8px;
            ">
                <span>${message}</span>
            </div>
        `;

        notificationContainer.appendChild(notification);

        // Tự động xóa sau 3 giây
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Public API
    return {
        init,
        loadFacebookAnalytics,
        refresh: loadFacebookAnalytics,
        getCurrentData: () => currentSummary,
        updateDateRange: (start, end) => {
            dateRange = { start, end };
            loadFacebookAnalytics();
        }
    };
})();

/**
 * PHẦN ENGAGEMENT & METRICS (FACEBOOK) - API FUNCTIONS
 */

// Thu thập chỉ số cho một bài viết cụ thể
async function collectPostMetrics(draft_post_id) {
    try {
        const response = await apiRequest(`/facebook/engagement/posts/${draft_post_id}/metrics/collect`, { method: 'POST' });
        return response;
    } catch (error) {
        console.error(`❌ Lỗi thu thập chỉ số cho bài ${draft_post_id}:`, error);
        return { success: false, message: error.message };
    }
}

// Thu thập chỉ số cho tất cả bài viết
async function collectAllPostsMetrics() {
    try {
        const response = await apiRequest('/facebook/engagement/posts/metrics/collect-all', { method: 'POST' });
        return response;
    } catch (error) {
        console.error('❌ Lỗi thu thập chỉ số tất cả bài viết:', error);
        return { success: false, message: error.message };
    }
}

// Lấy chỉ số hiện tại của một bài viết
async function getPostMetrics(draft_post_id) {
    try {
        const response = await apiRequest(`/facebook/engagement/posts/${draft_post_id}/metrics`, { method: 'GET' });
        return response;
    } catch (error) {
        console.error(`❌ Lỗi lấy chỉ số bài ${draft_post_id}:`, error);
        return null;
    }
}

// Lấy lịch sử chỉ số của một bài viết
async function getPostMetricsHistory(draft_post_id) {
    try {
        const response = await apiRequest(`/facebook/engagement/posts/${draft_post_id}/metrics/history`, { method: 'GET' });
        return response;
    } catch (error) {
        console.error(`❌ Lỗi lấy lịch sử chỉ số bài ${draft_post_id}:`, error);
        return [];
    }
}

// Lấy danh sách các bài viết hiệu quả nhất
async function getTopPerformingPosts(limit = 5) {
    try {
        const response = await apiRequest(`/facebook/engagement/analytics/top-posts?limit=${limit}`, { method: 'GET' });
        return response;
    } catch (error) {
        console.error('❌ Lỗi lấy danh sách bài viết hiệu quả:', error);
        return [];
    }
}

// Lấy tóm tắt chỉ số tương tác tổng quan
async function getEngagementSummary(period = '7days') {
    try {
        const response = await apiRequest(`/facebook/engagement/analytics/summary?period=${period}`, { method: 'GET' });
        return response;
    } catch (error) {
        console.error('❌ Lỗi lấy tóm tắt tương tác:', error);
        return null;
    }
}

/**
 * PHẦN 4: ĐIỀU KHIỂN GIAO DIỆN BẢNG DỮ LIỆU (UI RENDERING)
 */
function renderArticles(articles, isLoading = false) {
    const tableBody = document.getElementById('configTableBody');
    const tableHeader = document.getElementById('tableHeaderRow');
    if (!tableBody || !tableHeader) return;

    if (currentTab === 'seo') {
        tableHeader.innerHTML = `
            <th>Tiêu đề bài viết</th>
            <th>Khoá chính</th>
            <th>Meta-description</th>
            <th style="text-align: center;">Số lượng từ</th>
            <th style="text-align: center;">SEO Score</th>
            <th style="text-align: center;">Ngày đăng</th>
            <th style="text-align: center;">Hành động</th>
        `;
    } else {
        tableHeader.innerHTML = `
            <th>Nội dung bài viết</th>
            <th>Trang Fanpage</th>
            <th>Trạng thái</th>
            <th style="text-align: center;">Tương tác</th>
            <th style="text-align: center;">Thời gian</th>
            <th style="text-align: center;">Hành động</th>
        `;
    }

    if (isLoading) {
        const colSpan = currentTab === 'seo' ? 7 : 5;
        tableBody.innerHTML = `
            <tr>
                <td colspan="${colSpan}" style="text-align: center; padding: 40px; color: #999;">
                    <div class="loader-container"><i class="fas fa-spinner fa-spin"></i> <span>Đang tải dữ liệu, vui lòng đợi...</span></div>
                </td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = '';

    if (!articles || articles.length === 0) {
        const colSpan = currentTab === 'seo' ? 7 : 5;
        tableBody.innerHTML = `<tr><td colspan="${colSpan}" style="text-align:center; padding:20px;">Dữ liệu ở trang này trống hoặc chưa được bài viết nào.</td></tr>`;
        return;
    }

    articles.forEach(item => {
        const row = document.createElement('tr');
        if (currentTab === 'seo') {
            const seoScore = Math.floor(Math.random() * 30) + 70;
            const scoreClass = seoScore >= 80 ? 'score-good' : 'score-medium';
            row.innerHTML = `
                <td><strong>${item.title || 'Bài viết chưa đặt tên'}</strong></td>
                <td>${item.primary_keyword || '---'}</td>
                <td>
                    <div class="meta-description" title="${item.meta_description || ''}">
                        ${item.meta_description ? (item.meta_description.substring(0, 60) + '...') : 'Không có mô tả.'}
                    </div>
                </td>
                <td style="text-align: center;">${item.word_count ? item.word_count.toLocaleString() : 0} từ</td>
                <td style="text-align: center;"><span class="seo-score ${scoreClass}">${seoScore}/100</span></td>
                <td style="text-align: center;">${formatDateTime(item.created_at).split(' ')[0]}</td>
                <td style="text-align: center;">
                    <div style="display: flex; gap: 10px; justify-content: center;">
                        <button class="action-btn-mini" style="color: #EF4444;" onclick="window.deleteArticle('${item.id}')" title="Xoá bài viết">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                        <button class="action-btn-mini" style="color: #3B82F6;" onclick="window.editArticle('${item.id}')" title="Sửa bài viết">
                            <i class="fas fa-edit"></i>
                        </button>
                    </div>
                </td>
            `;
        } else {
            const content = item.article_content || item.article_topic || item.content || item.message || '(Không có nội dung)';
            const truncatedContent = content.length > 60 ? content.substring(0, 60) + '...' : content;

            // Xử lý hiển thị trạng thái chi tiết hơn
            let statusText = 'Đang xử lý';
            let statusColor = '#ca8a04'; // Mặc định: Vàng
            let statusBg = '#fefce8';

            if (item.status === 'posted' || item.published === true || item.published === 1 || item.published === '1') {
                statusText = 'Đã đăng';
                statusColor = '#16a34a'; // Xanh lá
                statusBg = '#f0fdf4';
            } else if (item.status === 'scheduled') {
                statusText = 'Đã lên lịch';
                statusColor = '#3b82f6'; // Xanh dương
                statusBg = '#eff6ff';
            } else if (item.status === 'draft' || !item.published) {
                statusText = 'Bài nháp';
                statusColor = '#6b7280'; // Xám
                statusBg = '#f3f4f6';
            }

            // Xử lý tên Fanpage
            const pageName = item.page_name || item.page_id || '---';

            // Link xem bài viết trên Facebook
            let viewLink = '';
            let fbLink = item.facebook_post_url || '';

            if (!fbLink && item.facebook_post_id) {
                const parts = item.facebook_post_id.split('_');
                if (parts.length === 2) {
                    fbLink = `https://www.facebook.com/${parts[0]}/posts/${parts[1]}`;
                } else {
                    fbLink = `https://www.facebook.com/${item.facebook_post_id}`;
                }
            }

            if (fbLink) {
                viewLink = `<a href="${fbLink}" target="_blank" class="action-btn-mini" style="color: #3B82F6;" title="Xem trên Facebook"><i class="fas fa-external-link-alt"></i></a>`;
            }

            // Tổng chỉ số tương tác (nếu có)
            const likes = item.likes || 0;
            const comments = item.comments || 0;
            const shares = item.shares || 0;
            const totalEngage = likes + comments + shares;

            // Button metrics với chức năng thực
            const metricsButton = item.facebook_post_id ? 
                `<button class="action-btn-mini" style="color: #10B981;" onclick="window.viewMetrics('${item.id}')" title="Xem chỉ số">
                    <i class="fas fa-chart-line"></i>
                </button>` :
                `<button class="action-btn-mini" style="color: #9ca3af;" onclick="alert('Chưa có chỉ số, vui lòng chờ bài viết được đăng')" title="Chưa có chỉ số">
                    <i class="fas fa-chart-line"></i>
                </button>`;

            row.innerHTML = `
                <td><div style="font-weight: 500; color: #1e293b; font-size: 14px;">${truncatedContent}</div></td>
                <td>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <i class="fab fa-facebook-square" style="color: #1877f2; font-size: 16px;"></i>
                        <span style="font-size: 14px; color: #475569;">${pageName}</span>
                    </div>
                </td>
                <td>
                    <span style="background: ${statusBg}; color: ${statusColor}; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 500;">
                        ${statusText}
                    </span>
                </td>
                <td style="text-align: center;">
                    <div style="display: flex; flex-direction: column; align-items: center; gap: 2px;">
                        <span style="font-weight: 600; color: #1e293b;">${totalEngage.toLocaleString()}</span>
                        <div style="display: flex; gap: 6px; font-size: 10px; color: #64748b;">
                            <span title="Lượt thích"><i class="far fa-thumbs-up"></i> ${likes}</span>
                            <span title="Bình luận"><i class="far fa-comment"></i> ${comments}</span>
                        </div>
                    </div>
                </td>
                <td style="text-align: center; font-size: 14px; color: #475569;">${formatDateTime(item.created_at)}</td>

                <td style="text-align: center;">
                    <div style="display: flex; gap: 10px; justify-content: center;">
                        ${viewLink}
                        ${metricsButton}
                        ${(item.status !== 'posted' && !item.published) ? `
                        <button class="action-btn-mini" style="color: #ca8a04;" onclick="window.openScheduleModal('${item.id}')" title="${item.status === 'scheduled' ? 'Đổi lịch' : 'Hẹn giờ'}">
                            <i class="fas fa-clock"></i>
                        </button>
                        ` : ''}
                        ${item.status === 'scheduled' ? `
                        <button class="action-btn-mini" style="color: #EF4444;" onclick="window.cancelSchedule('${item.id}')" title="Hủy lịch đăng">
                            <i class="fas fa-calendar-times"></i>
                        </button>
                        ` : ''}
                        <button class="action-btn-mini" style="color: #ef4444;" onclick="window.deleteArticle('${item.id}')" title="Xoá bài viết">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                        <button class="action-btn-mini" style="color: #3b82f6;" onclick="window.editArticle('${item.id}')" title="Sửa bài viết">
                            <i class="fas fa-edit"></i>
                        </button>
                    </div>
                </td>
            `;
        }
        tableBody.appendChild(row);
    });
}

/**
 * HỦY LỊCH ĐĂNG
 */
window.cancelSchedule = async (id) => {
    if (!confirm('Bạn có chắc muốn hủy lịch đăng cho bài viết này?')) return;
    try {
        const res = await apiRequest(`/facebook/publish/posts/scheduled/${id}`, { method: 'DELETE' });
        if (res && res.success) {
            alert('Đã hủy lịch đăng thành công!');
            goToPage(currentPage);
        } else {
            alert('Lỗi: ' + (res.message || 'Không thể hủy lịch'));
        }
    } catch (e) {
        alert('Lỗi kết nối: ' + e.message);
    }
};

/**
 * HÀNH ĐỘNG
 */
window.editArticle = (id) => {
    if (currentTab === 'seo') {
        window.location.href = `viet-bai-seo.php?id=${id}`;
    } else {
        // Chuyển hướng sang trang cấu hình facebook với id bài viết nháp
        window.location.href = `cau-hinh-facebook.php?draft_id=${id}`;
    }
};

let currentSchedulingId = null;

window.openScheduleModal = (id) => {
    currentSchedulingId = id;
    const modal = document.getElementById('scheduleModal');
    const input = document.getElementById('scheduleTime');
    if (modal) {
        modal.style.display = 'flex';
        // Set default time to 30 mins from now
        const now = new Date();
        now.setMinutes(now.getMinutes() + 30);
        const localIso = new Date(now.getTime() - (now.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
        if (input) input.value = localIso;
    }
};

// Handlers for schedule modal
document.addEventListener('DOMContentLoaded', () => {
    const closeBtn = document.getElementById('closeScheduleModal');
    const cancelBtn = document.getElementById('cancelSchedule');
    const confirmBtn = document.getElementById('confirmSchedule');
    const modal = document.getElementById('scheduleModal');
    const input = document.getElementById('scheduleTime');

    if (closeBtn) closeBtn.onclick = () => modal.style.display = 'none';
    if (cancelBtn) cancelBtn.onclick = () => modal.style.display = 'none';
    if (confirmBtn) {
        confirmBtn.onclick = async () => {
            const time = input.value;
            if (!time) return alert("Vui lòng chọn thời gian!");

            try {
                confirmBtn.disabled = true;
                confirmBtn.textContent = 'Đang xử lý...';

                const response = await apiRequest(`/facebook/publish/posts/scheduled/${currentSchedulingId}`, {
                    method: 'PUT',
                    body: JSON.stringify({
                        scheduled_publish_time: time
                    })
                });

                if (response && response.success) {
                    alert("Đã cập nhật lịch đăng bài thành công!");
                    modal.style.display = 'none';
                    if (typeof goToPage === 'function') goToPage(currentPage);
                    if (typeof updateStats === 'function') updateStats();
                } else {
                    alert("Lỗi: " + (response.message || "Không thể cập nhật lịch bài đăng"));
                }
            } catch (error) {
                alert("Lỗi kết nối: " + error.message);
            } finally {
                confirmBtn.disabled = false;
                confirmBtn.textContent = 'Xác nhận';
            }
        };
    }
});

window.deleteArticle = async (id) => {
    if (!confirm('Bạn có chắc chắn muốn xoá bài viết này không?')) return;

    try {
        let url = '';
        if (currentTab === 'seo') {
            url = `/seo/articles/${id}`;
        } else {
            // API xoá bài nháp facebook
            url = `/facebook/publish/posts/drafts/${id}`;
        }

        const res = await apiRequest(url, { method: 'DELETE' });

        if (res && res.success) {
            alert('Đã xoá thành công!');
            // Refresh lại bảng hiện tại
            const offset = (currentPage - 1) * itemsPerPage;
            let result;
            if (currentTab === 'seo') {
                result = await fetchArticles(itemsPerPage, offset);
            } else {
                result = await fetchFacebookPosts(itemsPerPage, offset);
            }
            // Cập nhật lại số liệu thống kê
            if (result.total) totalArticles = result.total;
            renderArticles(result.articles);
            updateStats();
        } else {
            alert('Xoá thất bại: ' + (res.message || 'Lỗi không xác định'));
        }
    } catch (e) {
        console.error('Lỗi khi xoá:', e);
        alert('Có lỗi xảy ra khi xoá bài viết.');
    }
};

/**
 * PHẦN 5: CẬP NHẬT THỐNG KÊ (Stats Cards)
 */
async function updateStats(startDate = null, endDate = null) {
    try {
        // 1. Tính tổng SEO
        const seoRes = await apiRequest(`/seo/articles?limit=1000&offset=0`, { method: 'GET' });
        if (seoRes.success && seoRes.articles) {
            const articles = seoRes.articles;
            // TODO: Filter SEO articles by date if needed
            const draftCount = articles.filter(a => !a.published_at).length;
            const publishedCount = articles.filter(a => a.published_at).length;

            const seoCardNum = document.querySelector('#card-seo .stat-number');
            const seoCardSub = document.querySelector('#card-seo .sub-stat');

            if (seoCardNum) seoCardNum.textContent = `${articles.length} bài`;
            if (seoCardSub) seoCardSub.textContent = `${draftCount} nháp · ${publishedCount} xuất bản`;

            if (currentTab === 'seo') totalArticles = seoRes.total || articles.length;
        }

        // 2. Tính tổng Facebook (Có lọc theo ngày)
        const fbRes = await apiRequest(`/facebook/publish/posts?limit=1000&offset=0`, { method: 'GET' });
        if (fbRes) {
            let posts = [];
            if (fbRes.posts) posts = fbRes.posts;
            else if (fbRes.articles) posts = fbRes.articles;
            else if (fbRes.drafts) posts = fbRes.drafts;
            else if (fbRes.data) posts = fbRes.data;
            else if (Array.isArray(fbRes)) posts = fbRes;

            // Lọc theo ngày nếu có tham số
            if (startDate && endDate) {
                const startD = new Date(startDate); startD.setHours(0, 0, 0, 0);
                const endD = new Date(endDate); endD.setHours(23, 59, 59, 999);

                posts = posts.filter(p => {
                    const d = new Date(p.created_at || p.published_at);
                    return d >= startD && d <= endD;
                });
            }

            const fbCardNum = document.querySelector('#card-facebook .stat-number');
            const fbCardSub = document.querySelector('#card-facebook .sub-stat');

            const publishedCount = posts.filter(p => p.status === 'posted' || p.published === true || p.published === 1 || p.published === '1').length;
            const scheduledCount = posts.filter(p => p.status === 'scheduled').length;
            const draftCount = posts.length - publishedCount - scheduledCount;

            if (fbCardNum) fbCardNum.textContent = `${posts.length} bài`;
            if (fbCardSub) {
                let subText = `${draftCount} nháp · ${publishedCount} đã đăng`;
                if (scheduledCount > 0) subText += ` · ${scheduledCount} chờ đăng`;
                fbCardSub.textContent = subText;
            }

            // Chỉ cập nhật totalArticles nếu đang ở tab Facebook VÀ không phải view filter custom (hoặc tùy logic)
            // Ở đây ta cứ update để phân trang đúng cho view hiện tại
            if (currentTab === 'facebook') totalArticles = posts.length; // Override total
        }

        // 3. Cập nhật Analytics Facebook nếu đang ở tab Facebook
        if (currentTab === 'facebook') {
            FacebookAnalytics.loadFacebookAnalytics();
        }

        updatePaginationInfo();
        renderPagination();
    } catch (error) {
        console.error('❌ Lỗi thống kê:', error);
    }
}

async function updateFacebookAnalytics() {
    try {
        const summary = await getEngagementSummary();
        const topPosts = await getTopPerformingPosts(1);

        if (summary) {
            const totalEngagementEl = document.querySelector('#analytics-facebook .footer-item:nth-child(1) .footer-value');
            const ctrEl = document.querySelector('#analytics-facebook .footer-item:nth-child(3) .footer-value');

            if (totalEngagementEl) {
                const total = (summary.total_likes || 0) + (summary.total_comments || 0) + (summary.total_shares || 0);
                totalEngagementEl.textContent = total.toLocaleString();
            }
            if (ctrEl && summary.avg_ctr) {
                ctrEl.textContent = `${summary.avg_ctr}% `;
            }
        }

        if (topPosts && topPosts.length > 0) {
            const bestPostEl = document.querySelector('#analytics-facebook .footer-item:nth-child(2) .footer-value');
            if (bestPostEl) {
                const bestPost = topPosts[0];
                const bestEngagement = (bestPost.likes || 0) + (bestPost.comments || 0) + (bestPost.shares || 0);
                bestPostEl.textContent = bestEngagement.toLocaleString();
            }
        }
    } catch (error) {
        console.warn('⚠️ Không thể cập nhật dữ liệu phân tích Facebook:', error);
    }
}

/**
 * PHẦN 6: PHÂN TRANG (PAGINATION)
 */
function updatePaginationInfo() {
    const fromEl = document.getElementById('showingFrom');
    const toEl = document.getElementById('showingTo');
    const totalEl = document.getElementById('totalArticles');
    if (!fromEl || !toEl || !totalEl) return;

    if (totalArticles === 0) {
        fromEl.textContent = '0'; toEl.textContent = '0'; totalEl.textContent = '0';
        return;
    }
    const from = (currentPage - 1) * itemsPerPage + 1;
    const to = Math.min(currentPage * itemsPerPage, totalArticles);
    fromEl.textContent = from; toEl.textContent = to; totalEl.textContent = totalArticles;
}

function renderPagination() {
    const controls = document.getElementById('paginationControls');
    if (!controls) return;
    controls.innerHTML = '';
    const totalPages = Math.ceil(totalArticles / itemsPerPage);
    if (totalPages <= 1) return;

    const prevBtn = document.createElement('button');
    prevBtn.className = 'pagination-btn'; prevBtn.textContent = 'Trước';
    prevBtn.disabled = (currentPage === 1);
    prevBtn.onclick = () => goToPage(currentPage - 1);
    controls.appendChild(prevBtn);

    const addPageBtn = (i) => {
        const btn = document.createElement('button');
        btn.className = `pagination-btn ${i === currentPage ? 'active' : ''}`;
        btn.textContent = i;
        btn.onclick = () => goToPage(i);
        controls.appendChild(btn);
    };

    const addEllipsis = () => {
        const span = document.createElement('span');
        span.className = 'pagination-ellipsis';
        span.textContent = '...';
        controls.appendChild(span);
    };

    if (totalPages <= 7) {
        for (let i = 1; i <= totalPages; i++) addPageBtn(i);
    } else {
        addPageBtn(1);
        if (currentPage > 3) addEllipsis();
        const start = Math.max(2, currentPage - 1);
        const end = Math.min(totalPages - 1, currentPage + 1);
        for (let i = start; i <= end; i++) addPageBtn(i);
        if (currentPage < totalPages - 2) addEllipsis();
        addPageBtn(totalPages);
    }

    const nextBtn = document.createElement('button');
    nextBtn.className = 'pagination-btn'; nextBtn.textContent = 'Sau';
    nextBtn.disabled = (currentPage === totalPages);
    nextBtn.onclick = () => goToPage(currentPage + 1);
    controls.appendChild(nextBtn);
}

async function goToPage(page) {
    if (page < 1) return;
    currentPage = page;
    renderArticles([], true);

    const offset = (currentPage - 1) * itemsPerPage;
    const result = (currentTab === 'seo')
        ? await fetchArticles(itemsPerPage, offset)
        : await fetchFacebookPosts(itemsPerPage, offset);

    // Nếu API có trả về total mới nhất, cập nhật. Nếu không, giữ nguyên total đã đếm từ updateStats.
    if (result.total) totalArticles = result.total;

    renderArticles(result.articles);
    updatePaginationInfo();
    renderPagination();

    const tableHeader = document.querySelector('.activity-header');
    if (tableHeader) tableHeader.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * CHARTS - Sử dụng dữ liệu thực tế từ Facebook API
 */
async function initCharts() {
    // ========================================
    // 1. BIỂU ĐỒ SEO - LẤY DỮ LIỆU THỰC TỪ API
    // ========================================
    const seoCtx = document.getElementById('seoChart')?.getContext('2d');
    if (seoCtx) {
        try {
            // Lấy tất cả bài SEO trong 7 ngày qua
            const seoRes = await apiRequest('/seo/articles?limit=1000&offset=0', { method: 'GET' });

            if (seoRes.success && seoRes.articles && seoRes.articles.length > 0) {
                const articles = seoRes.articles;

                // Nhóm theo ngày trong 7 ngày qua
                const last7Days = [];
                const today = new Date();
                for (let i = 6; i >= 0; i--) {
                    const date = new Date(today);
                    date.setDate(date.getDate() - i);
                    last7Days.push({
                        date: date.toISOString().split('T')[0],
                        label: `${date.getDate()}/${date.getMonth() + 1}`,
                        count: 0,
                        views: 0
                    });
                }

                // Đếm số bài viết theo ngày
                articles.forEach(article => {
                    const createdDate = new Date(article.created_at).toISOString().split('T')[0];
                    const dayData = last7Days.find(d => d.date === createdDate);
                    if (dayData) {
                        dayData.count++;
                        // Nếu có trường view_count từ API
                        dayData.views += article.view_count || 0;
                    }
                });

                const labels = last7Days.map(d => d.label);
                const data = last7Days.map(d => d.views);

                new Chart(seoCtx, {
                    type: 'bar',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: 'Lượt xem bài viết',
                            data: data,
                            backgroundColor: '#3B82F6',
                            borderRadius: 4,
                            barThickness: 20
                        }]
                    },
                    options: {
                        indexAxis: 'y',
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { display: false },
                            tooltip: {
                                callbacks: {
                                    label: function (context) {
                                        return `Lượt xem: ${context.parsed.x.toLocaleString()}`;
                                    }
                                }
                            }
                        },
                        scales: {
                            x: {
                                grid: { display: false },
                                border: { display: false },
                                ticks: {
                                    callback: function (value) {
                                        return value.toLocaleString();
                                    }
                                }
                            },
                            y: { grid: { display: false }, border: { display: false } }
                        }
                    }
                });

                console.log('✅ Đã tải biểu đồ SEO với dữ liệu thực:', articles.length, 'bài viết');
            } else {
                // Fallback nếu không có dữ liệu
                renderSeoChartFallback(seoCtx);
            }
        } catch (error) {
            console.error('❌ Lỗi khi tải dữ liệu SEO:', error);
            renderSeoChartFallback(seoCtx);
        }
    }

    // ========================================
    // 2. KHỞI TẠO FACEBOOK ANALYTICS
    // ========================================
    FacebookAnalytics.init();
}

/**
 * Hàm vẽ lại biểu đồ Facebook theo khoảng thời gian
 */
window.renderFacebookChart = async (startDate = null, endDate = null) => {
    const fbCtx = document.getElementById('facebookChart')?.getContext('2d');

    // Hủy biểu đồ cũ nếu có
    if (window.myFbChart) {
        window.myFbChart.destroy();
    }

    if (fbCtx) {
        try {
            // Xác định ngày bắt đầu/kết thúc
            let startD = new Date();
            startD.setDate(startD.getDate() - 7);
            let endD = new Date();

            if (startDate) startD = new Date(startDate);
            if (endDate) endD = new Date(endDate);

            // Reset time để so sánh chính xác
            startD.setHours(0, 0, 0, 0);
            endD.setHours(23, 59, 59, 999);

            // Lấy dữ liệu bài viết
            let allPosts = [];

            // Thử lấy từ API danh sách bài viết
            const fbRes = await apiRequest('/facebook/publish/posts?limit=1000&offset=0');

            if (fbRes && fbRes.posts) allPosts = fbRes.posts;
            else if (fbRes && fbRes.data) allPosts = fbRes.data;
            else if (Array.isArray(fbRes)) allPosts = fbRes;

            if (allPosts.length === 0) {
                console.warn('⚠️ Không có bài đăng Facebook nào để vẽ biểu đồ');
                renderFacebookChartFallback(fbCtx);
                return;
            }

            // Lọc bài theo khoảng thời gian
            const publishedPosts = allPosts.filter(post => {
                const isPublished = post.status === 'posted' || post.published === true || post.published === 1;
                const postDate = new Date(post.created_at || post.published_at);
                return isPublished && postDate >= startD && postDate <= endD;
            });

            console.log(`📊 Phân tích giờ đăng của ${publishedPosts.length} bài viết từ ${startD.toLocaleDateString()} đến ${endD.toLocaleDateString()}`);

            // Cấu trúc dữ liệu và màu sắc
            const daysConfig = [
                { label: 'Thứ Hai', color: '#3B82F6', id: 1 },    // Xanh dương
                { label: 'Thứ Ba', color: '#D97706', id: 2 },     // Cam đất
                { label: 'Thứ Tư', color: '#22D3EE', id: 3 },     // Xanh ngọc
                { label: 'Thứ Năm', color: '#FBBF24', id: 4 },    // Vàng
                { label: 'Thứ Sáu', color: '#6366F1', id: 5 },    // Tím xanh
                { label: 'Thứ Bảy', color: '#82E0AA', id: 6 },    // Xanh lá nhạt
                { label: 'Chủ Nhật', color: '#1D4ED8', id: 0 }    // Xanh đậm
            ];

            const datasets = daysConfig.map(day => ({
                label: day.label,
                data: Array(24).fill(0), // 0h - 23h
                backgroundColor: day.color,
                borderRadius: 2,
                barPercentage: 0.8,
                categoryPercentage: 0.9,
                dayId: day.id
            }));

            // Duyệt qua bài viết và cộng dồn engagement
            publishedPosts.forEach(post => {
                const date = new Date(post.created_at || post.published_at);
                const hour = date.getHours();
                const dayOfWeek = date.getDay();

                const dataset = datasets.find(ds => ds.dayId === dayOfWeek);
                if (dataset) {
                    const engagement = (post.likes || 0) + (post.comments || 0) + (post.shares || 0);
                    dataset.data[hour] += engagement;
                }
            });

            const hoursLabels = Array.from({ length: 24 }, (_, i) => i.toString());

            window.myFbChart = new Chart(fbCtx, {
                type: 'bar',
                data: {
                    labels: hoursLabels,
                    datasets: datasets
                },
                options: {
                    indexAxis: 'y', // Biểu đồ ngang
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                boxWidth: 12,
                                padding: 15,
                                font: { size: 10, family: "Montserrat" },
                                usePointStyle: true
                            }
                        },
                        tooltip: {
                            callbacks: {
                                title: (items) => `Khung giờ: ${items[0].label}:00 - ${items[0].label}:59`,
                                label: (context) => {
                                    if (context.raw > 0) {
                                        return `${context.dataset.label}: ${context.raw.toLocaleString()} tương tác`;
                                    }
                                    return null;
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            stacked: true,
                            grid: { color: '#f1f5f9', borderDash: [2, 2] },
                            border: { display: false },
                            position: 'top',
                            ticks: {
                                font: { size: 10, color: '#64748b' }
                            }
                        },
                        y: {
                            stacked: true,
                            grid: { display: false },
                            border: { display: false },
                            ticks: {
                                font: { size: 11, color: '#64748b' }
                            },
                            reverse: false
                        }
                    },
                    interaction: {
                        mode: 'y',
                        intersect: false
                    }
                }
            });

            console.log('✅ Đã vẽ biểu đồ Facebook phân bổ theo giờ thành công.');

        } catch (error) {
            console.error('❌ Lỗi biểu đồ Facebook:', error);
            renderFacebookChartFallback(fbCtx);
        }
    }
}

// Expose updateStats to window
window.updateStats = updateStats;

/**
 * Fallback cho biểu đồ SEO
 */
function renderSeoChartFallback(seoCtx) {
    new Chart(seoCtx, {
        type: 'bar',
        data: {
            labels: ['Không có dữ liệu'],
            datasets: [{
                label: 'Lượt truy cập',
                data: [0],
                backgroundColor: '#e2e8f0',
                borderRadius: 4,
                barThickness: 20
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { grid: { display: false }, border: { display: false }, max: 10 },
                y: { grid: { display: false }, border: { display: false } }
            }
        }
    });
    console.log('⚠️ Biểu đồ SEO: Không có dữ liệu để hiển thị.');
}

/**
 * Fallback cho biểu đồ Facebook - Hiển thị trạng thái rỗng
 */
function renderFacebookChartFallback(fbCtx) {
    const hours = Array.from({ length: 24 }, (_, i) => i.toString());

    // Dataset rỗng
    const emptyData = Array(24).fill(0);

    new Chart(fbCtx, {
        type: 'bar',
        data: {
            labels: hours,
            datasets: [
                { label: 'Chưa có dữ liệu', data: emptyData, backgroundColor: '#f1f5f9' }
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
                x: { stacked: true, grid: { color: '#f1f5f9' }, border: { display: false }, max: 10 },
                y: { stacked: true, grid: { display: false }, border: { display: false } }
            }
        }
    });

    console.log('⚠️ Biểu đồ Facebook: Không có dữ liệu để hiển thị.');
}

function setupInteractions() {
    const cardSeo = document.getElementById('card-seo');
    const cardFacebook = document.getElementById('card-facebook');
    const analyticsSeo = document.getElementById('analytics-seo');
    const analyticsFacebook = document.getElementById('analytics-facebook');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const filterSection = document.getElementById('filter-section');
    const filterBtns = document.querySelectorAll('.status-btn');

    if (!cardSeo || !cardFacebook) return;

    // Xử lý chuyển tab
    const switchTab = async (tab) => {
        if (currentTab === tab) return;
        currentTab = tab;
        currentPage = 1; // Reset về trang 1 khi đổi tab

        tabBtns.forEach(btn => {
            const isTarget = (tab === 'seo' && btn.textContent.includes('SEO')) || (tab === 'facebook' && btn.textContent.includes('Facebook'));
            btn.classList.toggle('active', isTarget);
        });

        if (tab === 'seo') {
            analyticsSeo.style.display = 'block';
            analyticsFacebook.style.display = 'none';
            if (filterSection) filterSection.style.display = 'none'; // Ẩn filter khi ở tab SEO
        } else {
            analyticsFacebook.style.display = 'block';
            analyticsSeo.style.display = 'none';
            if (filterSection) filterSection.style.display = 'block'; // Hiện filter khi ở tab Facebook
        }

        await updateStats(); // Cập nhật lại tổng số bài trước
        await goToPage(1);   // Sau đó tải dữ liệu trang 1
    };

    // Xử lý click filter button
    if (filterBtns) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', async () => {
                // Remove active class from all
                filterBtns.forEach(b => b.classList.remove('active'));
                // Add active to clicked
                btn.classList.add('active');

                // Set status
                currentFbStatus = btn.getAttribute('data-status') || '';

                // Reload data
                currentPage = 1;
                await goToPage(1);
            });
        });
    }

    cardSeo.addEventListener('click', () => switchTab('seo'));
    cardFacebook.addEventListener('click', () => switchTab('facebook'));
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.textContent.includes('SEO') ? 'seo' : 'facebook';
            switchTab(tab);
        });
    });

    // Xử lý nút Đồng bộ lại
    const syncBtn = document.querySelector('.sync-btn-custom');
    if (syncBtn) {
        syncBtn.addEventListener('click', async () => {
            const icon = syncBtn.querySelector('i');
            if (icon) icon.classList.add('fa-spin');
            syncBtn.disabled = true;

            try {
                const res = await collectAllPostsMetrics();
                if (res && res.success) {
                    alert('Đồng bộ dữ liệu thành công!');
                    await updateStats();
                    await goToPage(1);
                    // Cập nhật lại analytics Facebook
                    FacebookAnalytics.refresh();
                } else {
                    alert('Đồng bộ thất bại: ' + (res?.message || 'Lỗi không xác định'));
                }
            } catch (error) {
                alert('Có lỗi xảy ra khi đồng bộ dữ liệu.');
            } finally {
                if (icon) icon.classList.remove('fa-spin');
                syncBtn.disabled = false;
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    if (!checkAuth()) return;
    initCharts();
    setupInteractions();
    await updateStats();
    await goToPage(1);
});

let metricsChart = null;

window.viewMetrics = async (draftId) => {
    const modal = document.getElementById('metricsModal');
    if (!modal) return;

    modal.style.display = 'flex';
    const chartCtx = document.getElementById('historyChart').getContext('2d');

    // Loading state
    document.getElementById('modalTitle').textContent = 'Đang tải chỉ số...';

    try {
        const history = await getPostMetricsHistory(draftId);

        document.getElementById('modalTitle').textContent = 'Chi tiết tương tác bài viết';

        if (!history || history.length === 0) {
            alert('Chưa có dữ liệu lịch sử cho bài viết này.');
            modal.style.display = 'none';
            return;
        }

        const labels = history.map(h => formatDateTime(h.collected_at).split(' ')[0]);
        const likesData = history.map(h => h.likes || 0);
        const commentsData = history.map(h => h.comments || 0);
        const sharesData = history.map(h => h.shares || 0);

        if (metricsChart) metricsChart.destroy();

        metricsChart = new Chart(chartCtx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Lượt thích',
                        data: likesData,
                        borderColor: '#3B82F6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: 'Bình luận',
                        data: commentsData,
                        borderColor: '#10B981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: 'Chia sẻ',
                        data: sharesData,
                        borderColor: '#F59E0B',
                        backgroundColor: 'rgba(245, 158, 11, 0.1)',
                        fill: true,
                        tension: 0.4
                }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'top' }
                },
                scales: {
                    y: { beginAtZero: true, grid: { color: '#f1f5f9' } },
                    x: { grid: { display: false } }
                }
            }
        });

    } catch (error) {
        console.error('Lỗi khi tải modal chỉ số:', error);
        alert('Không thể tải dữ liệu chỉ số.');
        modal.style.display = 'none';
    }
};

window.closeMetricsModal = () => {
    const modal = document.getElementById('metricsModal');
    if (modal) modal.style.display = 'none';
};