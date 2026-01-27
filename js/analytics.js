document.addEventListener('DOMContentLoaded', async () => {
    const periodSelect = document.getElementById('analytics-period');
    const syncBtn = document.getElementById('sync-metrics-btn');
    let engagementChart = null;

    // --- API WRAPPERS ---

    async function getSummary(period = '7days') {
        return await apiRequest(`/facebook/engagement/analytics/summary?period=${period}`);
    }

    async function getTopPosts(limit = 5) {
        return await apiRequest(`/facebook/engagement/analytics/top-posts?limit=${limit}`);
    }

    async function collectAllMetrics() {
        return await apiRequest('/facebook/engagement/posts/metrics/collect-all', { method: 'POST' });
    }

    // --- UI UPDATERS ---

    async function refreshDashboard() {
        const period = periodSelect.value;
        try {
            const summary = await getSummary(period);
            const topPosts = await getTopPosts(5);

            updateSummaryCards(summary);
            updateChart(summary);
            updateTopPosts(topPosts);

        } catch (error) {
            console.error("Dashboard refresh error:", error);
        }
    }

    function updateSummaryCards(summary) {
        if (!summary) return;

        const total = (summary.total_likes || 0) + (summary.total_comments || 0) + (summary.total_shares || 0);
        document.getElementById('total-engagement').textContent = total.toLocaleString();
        document.getElementById('total-likes').textContent = (summary.total_likes || 0).toLocaleString();
        document.getElementById('total-comments').textContent = (summary.total_comments || 0).toLocaleString();
        document.getElementById('total-shares').textContent = (summary.total_shares || 0).toLocaleString();
    }

    function updateTopPosts(posts) {
        const list = document.getElementById('top-posts-list');
        if (!list) return;

        if (!posts || posts.length === 0) {
            list.innerHTML = '<p style="text-align:center;color:#94a3b8;padding:20px;">Chưa có dữ liệu bài viết.</p>';
            return;
        }

        list.innerHTML = posts.map(post => {
            const content = post.content || post.article_topic || 'Bài viết không tiêu đề';
            const engage = (post.likes || 0) + (post.comments || 0) + (post.shares || 0);
            return `
                <div style="display:flex; justify-content:space-between; align-items:center; padding:12px; border-bottom:1px solid #f1f5f9;">
                    <div style="max-width:70%;">
                        <div style="font-weight:600; font-size:14px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${content}</div>
                        <div style="font-size:12px; color:#64748b;">${new Date(post.created_at).toLocaleDateString('vi-VN')}</div>
                    </div>
                    <div style="text-align:right;">
                        <div style="font-weight:700; color:#1877f2;">${engage}</div>
                        <div style="font-size:10px; color:#94a3b8;">TƯƠNG TÁC</div>
                    </div>
                </div>
            `;
        }).join('');
    }

    function updateChart(summary) {
        const ctx = document.getElementById('engagementChart').getContext('2d');

        // Mock data for line chart if summary doesn't provide daily breakdown
        // In a real app, you'd want history data here.
        const labels = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật'];
        const data = [12, 19, 3, 5, 2, 3, 7]; // Dummy

        if (engagementChart) engagementChart.destroy();

        engagementChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Tương tác tổng hợp',
                    data: data,
                    borderColor: '#1877f2',
                    backgroundColor: 'rgba(24, 119, 242, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: { beginAtZero: true, grid: { color: '#f1f5f9' } },
                    x: { grid: { display: false } }
                }
            }
        });
    }

    // --- EVENT LISTENERS ---

    periodSelect.addEventListener('change', refreshDashboard);

    syncBtn.addEventListener('click', async () => {
        syncBtn.disabled = true;
        const icon = syncBtn.querySelector('i');
        icon.classList.add('fa-spin');

        try {
            await collectAllMetrics();
            alert("Đã cập nhật chỉ số mới nhất từ Facebook!");
            await refreshDashboard();
        } catch (error) {
            alert("Lỗi khi đồng bộ: " + error.message);
        } finally {
            syncBtn.disabled = false;
            icon.classList.remove('fa-spin');
        }
    });

    // --- INIT ---
    await refreshDashboard();
});
