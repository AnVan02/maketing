// Sửa phần confirmSchedule (dòng ~1400-1460)
if (confirmSchedule) {
    confirmSchedule.addEventListener('click', async () => {
        const timeVal = scheduleTimeInput.value;
        if (!timeVal) return alert("⚠️ Vui lòng chọn thời gian đăng!");

        // FIX: Chuyển đổi thời gian đúng cách
        const selectedDate = new Date(timeVal);
        
        // Kiểm tra thời gian hợp lệ
        if (isNaN(selectedDate.getTime())) {
            return alert("⚠️ Thời gian không hợp lệ!");
        }

        const now = new Date();
        const diffMinutes = (selectedDate - now) / (1000 * 60);

        if (diffMinutes < 15) {
            return alert("⚠️ Thời gian hẹn đăng phải cách hiện tại ít nhất 15 phút!");
        }

        if (!currentDefaultConnection || !currentDefaultConnection.page_id) {
            return alert("⚠️ Chưa có thông tin Fanpage!");
        }

        try {
            confirmSchedule.disabled = true;
            confirmSchedule.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';

            // ✅ BƯỚC 1: Lấy nội dung text từ preview
            const previewContentEl = document.getElementById('preview-content');
            if (!previewContentEl) {
                throw new Error("Không tìm thấy khung xem trước!");
            }

            const currentContent = previewContentEl.innerHTML
                .replace(/<br\s*\/?>/gi, '\n')
                .replace(/<[^>]+>/g, '')
                .trim();

            if (!currentContent || currentContent === 'Nhập nội dung để xem trước bài viết...') {
                throw new Error("Vui lòng nhập nội dung bài viết!");
            }

            // ✅ BƯỚC 2: Đảm bảo có draft_post_id
            let finalDraftId = draft_post_id;

            if (!finalDraftId || isNaN(parseInt(finalDraftId))) {
                const configId = document.getElementById('config_template')?.value;

                const draftRes = await apiRequest('/facebook/generate/content', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        config_id: configId && !isNaN(parseInt(configId)) ? parseInt(configId) : 1,
                        topic: inputIdea?.value || "Bài viết Facebook",
                        message: currentContent,
                        content: currentContent
                    })
                });

                if (draftRes && (draftRes.success || draftRes.data)) {
                    const dataObj = draftRes.data || draftRes;
                    finalDraftId = dataObj.draft_id || dataObj.id || dataObj.draft_post_id;
                    draft_post_id = finalDraftId;
                } else {
                    throw new Error(draftRes?.message || "Không thể tạo draft");
                }
            }

            // Kiểm tra finalDraftId
            const parsedDraftId = parseInt(finalDraftId);
            if (isNaN(parsedDraftId)) {
                throw new Error("ID bài viết không hợp lệ: " + finalDraftId);
            }

            // ✅ BƯỚC 3: Upload media
            const media = await uploadAllMedia();

            // ✅ BƯỚC 4: Tạo payload hẹn giờ với format CHUẨN
            const payload = {
                draft_post_id: parsedDraftId,
                page_id: String(currentDefaultConnection.page_id),
                message: currentContent,
                content: currentContent,
                published: false,
                // FIX: Chuyển đúng định dạng thời gian
                scheduled_time: selectedDate.toISOString(), // ISO 8601 format
                // Hoặc nếu backend cần Unix timestamp (giây):
                // scheduled_time: Math.floor(selectedDate.getTime() / 1000),
                photo_ids: media.photos || [],
                video_ids: media.videos || []
            };

            console.log("📤 Schedule Payload:", payload);
            console.log("🕒 Scheduled Time:", selectedDate.toISOString());

            // ✅ BƯỚC 5: Gọi API hẹn giờ
            const response = await apiRequest('/facebook/publish/schedule', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response && response.success) {
                const scheduledTimeStr = selectedDate.toLocaleString('vi-VN', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                });
                
                alert(`✅ Đã lên lịch đăng bài thành công!\n\nThời gian: ${scheduledTimeStr}`);
                hideScheduleModal();
                clearDraft();
                location.reload();
            } else {
                throw new Error(response?.message || "Lỗi khi hẹn giờ đăng bài");
            }

        } catch (e) {
            console.error("❌ Schedule Error:", e);
            alert("❌ Lỗi hẹn giờ: " + e.message);
        } finally {
            confirmSchedule.disabled = false;
            confirmSchedule.innerHTML = '<i class="fas fa-calendar-check"></i> Xác nhận';
        }
    });
}