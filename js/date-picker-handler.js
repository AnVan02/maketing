
/**
 * Lắng nghe thay đổi ngày tháng để cập nhật Dashboard Facebook
 */
document.addEventListener('DOMContentLoaded', () => {
    // 1. Set mặc định ngày (7 ngày qua)
    const startDateInput = document.getElementById('facebook_start_date');
    const endDateInput = document.getElementById('facebook_end_date');
    const refreshBtn = document.getElementById('btn-refresh-facebook-stats');

    if (startDateInput && endDateInput) {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - 7);

        // Định dạng YYYY-MM-DD cho input type="date"
        endDateInput.value = end.toISOString().split('T')[0];
        startDateInput.value = start.toISOString().split('T')[0];
    }

    // 2. Hàm gọi update
    const triggerUpdate = async () => {
        if (!startDateInput || !endDateInput) return;

        const startVal = startDateInput.value;
        const endVal = endDateInput.value;

        if (!startVal || !endVal) {
            alert('Vui lòng chọn đầy đủ ngày bắt đầu và kết thúc');
            return;
        }

        // Logic so sánh ngày
        if (new Date(startVal) > new Date(endVal)) {
            alert('Ngày bắt đầu không được lớn hơn ngày kết thúc');
            return;
        }

        // Hiệu ứng loading nút refresh
        if (refreshBtn) {
            const icon = refreshBtn.querySelector('i');
            if (icon) icon.className = 'fas fa-spinner fa-spin';
            refreshBtn.disabled = true;
        }

        try {
            console.log(`📅 Cập nhật thống kê từ ${startVal} đến ${endVal}`);
            // Gọi hàm cập nhật Dashboard (sẽ được sửa để nhận tham số ngày)
            // Lưu ý: apiRequest hiện tại chưa hỗ trợ param date range động trong code cũ
            // Nhưng ta sẽ truyền vào func updateFacebookAnalytics nếu cần mở rộng sau này

            // Tạm thời gọi lại hàm update cũ, nhưng nếu Backend hỗ trợ ?from=&to= thì ta sẽ gắn vào
            await updateFacebookAnalyticsWithDate(startVal, endVal);

            // Vẽ lại chart
            // Cần sửa hàm initCharts hoặc tách logic vẽ chart ra để nhận date range
            // Ở đây tạm thời ta reload lại trang hoặc gọi lại logic vẽ chart
            // Tuy nhiên để chuẩn, ta sẽ cần refactor hàm vẽ chart.
            // Trong phạm vi yêu cầu hiện tại, ta sẽ gọi lại logic updateStats()

            await updateStats(startVal, endVal);

        } catch (e) {
            console.error('Lỗi cập nhật ngày tháng:', e);
        } finally {
            if (refreshBtn) {
                const icon = refreshBtn.querySelector('i');
                if (icon) icon.className = 'fas fa-sync-alt';
                refreshBtn.disabled = false;
            }
        }
    };

    // 3. Gán sự kiện
    if (refreshBtn) {
        refreshBtn.addEventListener('click', triggerUpdate);
    }
});

// Hàm hỗ trợ update với date range (Bổ sung vào global scope hoặc module)
async function updateFacebookAnalyticsWithDate(startDate, endDate) {
    // Logic này sẽ gọi API với tham số date
    // Ví dụ: /analytics/summary?from=...&to=...
    // Hiện tại đang dùng '7days' fix cứng trong code JS cũ.
    // Cần update JS cũ để nhận tham số này.
    console.log("Requesting analytics for:", startDate, endDate);
}
