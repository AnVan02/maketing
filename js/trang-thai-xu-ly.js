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
            const firstNews = pipelineData.pipeline_results.selected_news[0];

            // KIỂM TRA: Nếu đã có content rồi thì không crawl lại nữa
            if (firstNews.content && firstNews.content.length > 100) {
                console.log("✅ Đã có nội dung bài viết, bỏ qua bước crawl lại.");
                crawledContent = pipelineData.pipeline_results.selected_news;
                await new Promise(r => setTimeout(r, 1000)); // Delay mô phỏng UI cho mượt
            } else {
                console.log("📥 Dữ liệu chưa đủ, thực hiện crawl chi tiết...");
                crawledContent = await crawlArticles(pipelineData.pipeline_results.selected_news);
                if (!crawledContent) throw new Error("Không thể thu thập thông tin từ bài viết đã chọn.");
            }
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
            // TRUNCATE CONTENT để tránh lỗi 413 hoặc Timeout
            const formattedTopNews = (Array.isArray(topNews) ? topNews : []).map((news, index) => ({
                rank: news.rank || (index + 1),
                title: news.title || "Tin tức liên quan",
                url: news.url || news.link || "#",
                images: news.images || [],
                content_preview: (news.content || news.content_preview || news.summary || "").substring(0, 5000)
            }));

            const rawOutline = outline || pipelineData.article_outline || pipelineData.pipeline_results?.article_outline || [];

            // --- CHUẨN HÓA OUTLINE (QUAN TRỌNG) ---
            let outlineForApi = [];

            // Helper format item
            const formatItem = (item, idx) => ({
                id: item.id || `section-${idx + 1}`,
                level: parseInt(item.level || 2),
                title: item.title || item.heading || "",
                order: item.order || (idx + 1),
                config: {
                    word_count: parseInt(item.config?.word_count || item.word_count || 150),
                    keywords: Array.isArray(item.config?.keywords || item.keywords) ? (item.config?.keywords || item.keywords) : [],
                    tone: item.config?.tone || config.tone || "Chuyên nghiệp",
                    internal_link: item.config?.internal_link || null
                }
            });

            // Tiêu đề H1 mặc định
            const h1Title = title || config.main_keyword || "Bài viết mới";
            const h1Item = { id: 'h1-title', level: 1, title: h1Title, order: 1, config: null };

            if (Array.isArray(rawOutline)) {
                // Trường hợp 1: Outline là mảng
                // Check if H1 exists
                const hasH1 = rawOutline.some(s => s.level === 1);
                if (!hasH1) outlineForApi.push(h1Item);

                rawOutline.forEach((item, idx) => {
                    outlineForApi.push(formatItem(item, idx + (hasH1 ? 1 : 2)));
                });

                // Sort by order/level just in case
                outlineForApi.sort((a, b) => a.order - b.order);

            } else if (rawOutline && Array.isArray(rawOutline.sections)) {
                // Trường hợp 2: Outline là object có sections
                const hasH1 = rawOutline.sections.some(s => s.level === 1);
                if (!hasH1) outlineForApi.push(h1Item);

                rawOutline.sections.forEach((section, idx) => {
                    const formatted = formatItem(section, idx + (hasH1 ? 0 : 1));

                    if (section.length_ratio) {
                        const totalWords = parseInt(config.article_length || 1500);
                        formatted.config.word_count = Math.round((section.length_ratio / 100) * totalWords);
                    }
                    outlineForApi.push(formatted);
                });
            } else {
                // Trường hợp 3: Rỗng hoặc lỗi -> Tạo dummy
                console.warn("⚠️ Outline input is invalid, creating default.");
                outlineForApi = [
                    { level: 1, title: title || "Bài viết SEO", order: 1 },
                    { level: 2, title: "Giới thiệu", order: 2, config: { word_count: 200 } },
                    { level: 2, title: "Nội dung chính", order: 3, config: { word_count: 500 } },
                    { level: 2, title: "Kết luận", order: 4, config: { word_count: 150 } }
                ];
            }

            const payload = {
                main_keyword: mainKeyword || config.main_keyword || pipelineData.config?.main_keyword || "",
                secondary_keywords: (secondaryKeywords && secondaryKeywords.length > 0) ? secondaryKeywords : (config.secondary_keywords || pipelineData.config?.secondary_keywords || []),
                title: title,
                top_news: formattedTopNews,
                target_language: config.language || pipelineData.target_language || "Tiếng Việt",
                config: {
                    // Cập nhật model mặc định an toàn hơn
                    bot_id: config.bot || config.bot_id || config.model || "gpt-4o",
                    tone: config.tone || config.tone_of_voice || "Chuyên nghiệp",
                    article_length: String(config.article_length || "1500"),
                    article_type: config.article_type || "blog",
                    custome_instructions: (config.custom_instructions || config.custome_instructions || "") +
                        " \n\n# CHỈ THỊ QUAN TRỌNG VỀ CẤU TRÚC BÀI VIẾT:\n" +
                        "1. Bạn PHẢI sử dụng toàn bộ các tiêu đề H2 và H3 có trong Outline được cung cấp.\n" +
                        "2. Với mỗi tiêu đề <h3>, bạn PHẢI viết ít nhất 2-3 đoạn văn chi tiết, sử dụng tối đa dữ liệu từ trang web tham khảo (top_news).\n" +
                        "3. TUYỆT ĐỐI KHÔNG được gộp các mục H3 lại với nhau hoặc bỏ qua bất kỳ mục nào.\n" +
                        "4. KHÔNG ĐƯỢC để bất kỳ mục tiêu đề nào trống không có nội dung.\n" +
                        "5. Sử dụng dữ liệu THẬT từ top_news để làm dẫn chứng chi tiết cho từng phần."
                },
                outline: outlineForApi
            };

            console.log("📤 PAYLOAD (Full):", JSON.stringify(payload, null, 2));

            console.log("📤 Payload gửi đi (Truncated):", JSON.stringify(payload).length, "bytes");

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
                // console.error("❌ API Error:", errText); // Logged in catch below
                throw new Error(`API Error (${res.status}): ${errText}`);
            }
            const data = await res.json();
            console.log("✅ RAW AI RESPONSE:", data);

            if (data.article && data.article.html_content) {
                const h3Count = (data.article.html_content.match(/<h3/g) || []).length;
                console.log(`📊 AI HTML check: Found ${h3Count} <h3> tags.`);
            }

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
            // console.error("❌ Chi tiết lỗi:", e);
            throw e; // Ném lỗi lên trên thay vì return null
        }
    }
});
