const API_BASE_URL = 'https://caiman-warm-swan.ngrok-free.app/api/v1';

document.addEventListener('DOMContentLoaded', async () => {
    // Selectors
    const stepItems = document.querySelectorAll('.step-item');
    const stepLines = document.querySelectorAll('.step-line');
    const titleElement = document.querySelector('.thinking-title');
    const timerElement = document.getElementById('countdown-timer');

    // Steps Titles
    const titles = [
        'ĐANG NGHIÊN CỨU TỪ KHÓA...',
        'ĐANG TỔNG HỢP THÔNG TIN TỪ CÁC NGUỒN...',
        'AI ĐANG VIẾT BÀI VÀ TỐI ƯU SEO...',
        'ĐANG KIỂM TRA & RÀ SOÁT LỖI...',
        'HOÀN TẤT'
    ];

    // Load data from session storage
    const pipelineDataJson = sessionStorage.getItem('pipelineData');
    if (!pipelineDataJson) {
        alert("Không tìm thấy dữ liệu bài viết! Đang quay lại trang cấu hình...");
        window.location.href = 'cau-hinh-bai-viet.php';
        return;
    }

    const pipelineData = JSON.parse(pipelineDataJson);
    console.log("📦 Dữ liệu xử lý:", pipelineData);

    let currentStepIndex = 0;
    updateUI(0);
    startTimer();

    try {
        // ===================================
        // BƯỚC 1: NGHIÊN CỨU TỪ KHÓA (Đã có sẵn)
        // ===================================
        // Giả lập delay một chút cho đẹp
        await new Promise(r => setTimeout(r, 1500));

        currentStepIndex = 1;
        updateUI(1);

        // ===================================
        // BƯỚC 2: TỔNG HỢP THÔNG TIN (Crawl/Read Files)
        // ===================================
        let crawledContent = [];

        // Kiểm tra xem là nguồn Internet hay User Data/Text

        if (pipelineData.pipeline_results && pipelineData.pipeline_results.selected_news && pipelineData.pipeline_results.selected_news.length > 0) {
            crawledContent = await crawlArticles(pipelineData.pipeline_results.selected_news);
            if (!crawledContent) throw new Error("Không thể thu thập thông tin từ bài viết đã chọn.");
        } else {

            // Nguồn dữ liệu riêng (Files/Text) - Đã có sẵn content text, không cần crawl

            console.log("ℹ️ Sử dụng dữ liệu đầu vào trực tiếp (không crawl web).");
            await new Promise(r => setTimeout(r, 2000)); // Delay mô phỏng
        }

        currentStepIndex = 2;
        updateUI(2);

        // ===================================
        // BƯỚC 3: PHÁT TRIỂN NỘI DUNG (Generate SEO Content)
        // ===================================
        const finalArticle = await generateSEOContent(
            crawledContent || [],
            pipelineData.config,
            pipelineData.final_title,
            pipelineData.article_outline,
            pipelineData.config.main_keyword,
            pipelineData.config.secondary_keywords
        );

        if (!finalArticle) throw new Error("AI không thể tạo bài viết.");

        // Lưu kết quả cuối cùng
        const finalPayload = {
            ...pipelineData,
            finalArticle: finalArticle,
            crawledArticles: crawledContent || []
        };
        sessionStorage.setItem('finalArticleData', JSON.stringify(finalPayload));

        currentStepIndex = 3;
        updateUI(3);

        // ===================================
        // BƯỚC 4: KIỂM TRA SƠ BỘ
        // ===================================
        // Mô phỏng kiểm tra
        await new Promise(r => setTimeout(r, 2000));

        currentStepIndex = 4;
        updateUI(currentStepIndex);

        finishProcess();

    } catch (error) {
        console.error("❌ Lỗi xử lý:", error);
        if (titleElement) titleElement.textContent = "CÓ LỖI XẢY RA!";
        if (titleElement) titleElement.style.color = "red";
        alert("Lỗi: " + error.message);
        // Có thể thêm nút "Thử lại" hoặc Quay lại
    }

    // ============================================================
    // FUNCTIONS
    // ============================================================

    function updateUI(index) {
        // Update Steps
        stepItems.forEach((item, i) => {
            if (i < index) {
                item.classList.remove('active');
                item.classList.add('completed');
            } else if (i === index) {
                item.classList.add('active');
                item.classList.remove('completed');
            } else {
                item.classList.remove('active', 'completed');
            }
        });

        // Cập nhập 
        stepLines.forEach((line, i) => {
            if (i < index) {
                line.classList.add('completed');
            } else {
                line.classList.remove('completed');
            }
        });

        // cập nhập nội dung
        if (titleElement && titles[index]) {
            titleElement.textContent = titles[index];
        }
    }

    function startTimer() {
        let progress = 0;
        const totalDuration = 60; // Giả định trung bình 60s xong
        const increment = 100 / totalDuration;

        if (timerElement) {
            const timerInterval = setInterval(() => {
                if (progress < 95 && currentStepIndex < 4) { // Tăng đến 95% thì dừng chờ
                    progress += (increment / 10); // Check mỗi 100ms
                    timerElement.textContent = `Tiến độ: ${Math.round(progress)}%`;
                } else if (currentStepIndex >= 4) {
                    clearInterval(timerInterval);
                    timerElement.textContent = "Hoàn tất 100%!";
                    timerElement.style.color = "#4CAF50";
                }
            }, 100); // Cập nhật mượt hơn (100ms)
        }
    }

    function finishProcess() {
        if (titleElement) titleElement.textContent = "QUÁ TRÌNH HOÀN TẤT!";

        // Ensure all steps are marked completed
        stepItems.forEach(item => item.classList.add('completed'));
        stepLines.forEach(line => line.classList.add('completed'));

        setTimeout(() => {
            window.location.href = 'viet-bai-seo.php';
        }, 1000);
    }

    // ============================================
    // API FUNCTIONS
    // ============================================

    async function crawlArticles(articles) {
        console.log("📥 [API] Crawling articles:", articles.length);

        try {
            const payload = {
                articles: articles.map((a, index) => ({
                    url: a.url,
                    title: a.title,
                    snippet: a.content_preview || a.snippet || "",
                    rank: index + 1  // ✅ THÊM FIELD NÀY
                }))
            };

            const res = await fetch(`${API_BASE_URL}/crawl/crawl`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "ngrok-skip-browser-warning": "true"
                },
                body: JSON.stringify(payload)
            });

            const data = await res.json();
            console.log("✅ Crawl response:", data);

            if (data.success && data.articles) {
                return data.articles;
            } else {
                console.warn("Crawl returned false success or no articles", data);
                return null;
            }

        } catch (e) {
            console.error("❌ Crawl Articles Error:", e);
            return null;
        }
    }

    async function generateSEOContent(topNews, config, title, outline, mainKeyword, secondaryKeywords) {
        console.log("🚀 [API] Generating Content...");
        try {
            // Đảm bảo mỗi bài báo trong topNews đều có trường rank trước khi gửi đi
            const formattedTopNews = (Array.isArray(topNews) ? topNews : []).map((news, index) => ({
                ...news,
                rank: news.rank || (index + 1) // Nếu news chưa có rank thì lấy index + 1
            }));
            const outlineToUse = outline || pipelineData.article_outline || pipelineData.pipeline_results?.article_outline || [];

            const payload = {
                main_keyword: mainKeyword || config.main_keyword || pipelineData.config?.main_keyword || "",
                secondary_keywords: (secondaryKeywords && secondaryKeywords.length > 0) ? secondaryKeywords : (config.secondary_keywords || pipelineData.config?.secondary_keywords || []),
                title: title,
                top_news: formattedTopNews,
                target_language: config.language || pipelineData.target_language || "Tiếng Việt",
                config: {
                    bot_id: config.bot || config.bot_id || config.model || "GPT-4.1",
                    tone: config.tone || config.tone_of_voice || "Chuyên nghiệp",
                    article_length: String(config.article_length || "1500"),
                    article_type: config.article_type || "blog",
                    custome_instructions: config.custom_instructions || config.custome_instructions || ""
                },
                outline: outlineToUse
            };

            console.log("📤 Payload gửi đi:", JSON.stringify(payload, null, 2));

            const res = await fetch(`${API_BASE_URL}/ai/contents`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "ngrok-skip-browser-warning": "true"
                },
                body: JSON.stringify(payload)
            });

            // Kiểm tra response status
            if (!res.ok) {
                const errText = await res.text();
                console.error("❌ API Error:", errText);
                throw new Error(`API Error (${res.status}): ${errText}`);
            }
            const data = await res.json();
            console.log("✅ Phản hồi từ AI:", data);

            // Kiểm tra cấu trúc response
            if (data.success) {
                if (data.article) return data.article;
                if (data.content || data.html) return data; // Fallback if it's direct
                return data; // Return whatever we got
            } else {
                console.error("❌ API trả về success: false", data);
                if (data.article || data.content) return data.article || data; // Try to recover
                throw new Error(data.message || "Server AI từ chối tạo bài viết.");
            }
        } catch (e) {
            console.error("❌ generateSEOContent Error:", e.message);
            console.error("❌ Chi tiết lỗi:", e);
            throw e; // Ném lỗi lên trên thay vì return null
        }
    }
});