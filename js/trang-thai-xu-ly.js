// API_BASE_URL is now managed by bao-mat.js proxy

// ----------------------------------------

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
    // Log minimal info to avoid blocking when pipelineData is large
    console.log("📦 Dữ liệu xử lý keys:", Object.keys(pipelineData || {}));

    // ============================================================
    // MAIN PROCESSING LOGIC
    // ============================================================



    let currentStepIndex = 0;
    updateUI(0);
    startTimer();

    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    try {
        // ===================================
        // BƯỚC 1: NGHIÊN CỨU TỪ KHÓA
        // ===================================
        await sleep(1500); // Artificial delay for UX
        currentStepIndex = 1;
        updateUI(1);

        // ===================================
        // BƯỚC 2: TỔNG HỢP THÔNG TIN (Crawl/Read Files)
        // ===================================
        let crawledContent = [];

        // Nếu user đã cung cấp dàn ý (outline), ưu tiên dùng dàn ý và BỎ QUA bước crawl
        if (Array.isArray(pipelineData.article_outline) && pipelineData.article_outline.length > 0) {
            console.log("ℹ️ Dùng dàn ý từ người dùng, bỏ qua bước crawl và sử dụng outline để tạo bài.");
            await sleep(1000); // Minimum delay even when skipping
            // Crawled content sẽ để trống; generateSEOContent sẽ dùng 'outline' để tạo nội dung

        } else if (pipelineData.pipeline_results && pipelineData.pipeline_results.selected_news && pipelineData.pipeline_results.selected_news.length > 0) {
            const firstNews = pipelineData.pipeline_results.selected_news[0];

            if (firstNews.content && firstNews.content.length > 100) {
                console.log("✅ Đã có nội dung bài viết, bỏ qua bước crawl lại.");
                crawledContent = pipelineData.pipeline_results.selected_news;
                await sleep(500);
            } else {
                console.log("📥 Dữ liệu chưa đủ, thực hiện crawl chi tiết...");
                crawledContent = await crawlArticles(pipelineData.pipeline_results.selected_news);
                if (!crawledContent) throw new Error("Không thể thu thập thông tin từ bài viết đã chọn.");
            }
        } else {
            console.log("ℹ️ Sử dụng dữ liệu đầu vào trực tiếp (không crawl web).");
            await sleep(500);
        }

        currentStepIndex = 2;
        updateUI(2);

        // ===================================
        // BƯỚC 3: PHÁT TRIỂN NỘI DUNG (Generate SEO Content)
        // - Nếu đã có finalArticle cached hoặc pipelineData.finalArticle -> sử dụng luôn (không gọi API)
        // - Nếu có outline và config.use_local_render = true -> render tạm local (không tốn token)
        // - Ngược lại mới gọi API
        // ===================================
        let finalArticle = null;

        // 1) Kiểm tra cache trong sessionStorage
        try {
            const cached = JSON.parse(sessionStorage.getItem('finalArticleData') || 'null');
            if (cached && cached.finalArticle && cached.finalArticle.html_content) {
                finalArticle = cached.finalArticle;
                console.log("1 Sử dụng finalArticle đã cache, bỏ qua gọi API.");
            } else if (cached && cached.finalArticleSnippet) {
                finalArticle = {
                    title: cached.finalArticleTitle || pipelineData.final_title || pipelineData.config?.main_keyword || 'Bài viết',
                    html_content: cached.finalArticleSnippet
                };
                console.log("ℹ️ Sử dụng finalArticle rút gọn từ cache, bỏ qua gọi API.");
            }
        } catch (e) {
            /* ignore parse errors */
        }

        // 2) Kiểm tra pipelineData trực tiếp
        if (!finalArticle && pipelineData.finalArticle && pipelineData.finalArticle.html_content) {
            finalArticle = pipelineData.finalArticle;
            console.log("ℹ️ Sử dụng finalArticle có sẵn trong pipelineData, bỏ qua gọi API.");
        }

        // 3) Nếu có outline và user muốn render local (không tốn token)
        if (!finalArticle && Array.isArray(pipelineData.article_outline) && pipelineData.article_outline.length > 0 && pipelineData.config?.use_local_render) {
            finalArticle = generateFromOutline(pipelineData.final_title || pipelineData.config?.main_keyword || 'Bài viết', pipelineData.article_outline);
            console.log("ℹ️ Tạo bài tạm thời từ outline (không tốn token).");
        }

        // 4) Nếu vẫn chưa có bài, gọi API
        if (!finalArticle) {
            finalArticle = await generateSEOContent(
                crawledContent || [],
                pipelineData.config,
                pipelineData.final_title,
                pipelineData.article_outline,
                pipelineData.config.main_keyword,
                pipelineData.config.secondary_keywords
            );
            if (!finalArticle) throw new Error("AI không thể tạo bài viết.");
        }

        // Lưu kết quả cuối cùng (trimmed để tránh chậm do dữ liệu lớn)
        const finalPayload = {
            ...pipelineData,
            finalArticle: {
                title: finalArticle.title || '',
                html_content: finalArticle.html_content || finalArticle.content || '',
                summary: finalArticle.summary || ''
            },
            crawledArticles: (crawledContent || []).map(a => ({
                title: a.title,
                url: a.url,
                snippet: a.content_preview || a.snippet || ''
            }))
        };
        // Save asynchronously to avoid blocking the UI before navigation.
        // Use requestIdleCallback when available, otherwise fallback to setTimeout.

        const saveFinalPayload = () => {
            try {
                sessionStorage.setItem('finalArticleData', JSON.stringify(finalPayload));
            } catch (e) {
                console.warn("⚠️ Không thể lưu full final payload vào sessionStorage (quá lớn), lưu tạm thông tin rút gọn.");
                const minimalPayload = {
                    finalArticleTitle: finalArticle.title || '',
                    finalArticleSnippet: (finalArticle.html_content || '').substring(0, 200)
                };
                try {
                    sessionStorage.setItem('finalArticleData', JSON.stringify(minimalPayload));
                } catch (e2) {
                    console.warn("⚠️ Không thể lưu minimalPayload vào sessionStorage.");
                }
            }
        };
        if (typeof requestIdleCallback === 'function') {
            requestIdleCallback(saveFinalPayload);
        } else {
            setTimeout(saveFinalPayload, 0);
        }

        currentStepIndex = 3;
        updateUI(3);

        // ===================================
        // BƯỚC 4: KIỂM TRA SƠ BỘ
        // ===================================
        await sleep(1000); // Artificial delay for checking step
        currentStepIndex = 4;
        updateUI(currentStepIndex);

        await sleep(500);
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

        window.location.href = 'viet-bai-seo.php';
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

            const data = await apiRequest('crawl/crawl', {
                method: "POST",
                body: JSON.stringify(payload)
            });

            // Avoid logging huge objects
            console.log("✅ Crawl response keys:", Object.keys(data || {}), "articles:", (data?.articles?.length) || 0);

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

    // Khi user muốn tạo bài local (không gọi API), sử dụng helper dưới đây
    function generateFromOutline(title, rawOutline) {
        const escapeHtml = s => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        // Normalize outline into array of sections
        let sections = [];
        if (Array.isArray(rawOutline)) sections = rawOutline;
        else if (rawOutline && Array.isArray(rawOutline.sections)) sections = rawOutline.sections;
        // Build a simple HTML with headings and short placeholder paragraphs
        let html = `<h1>${escapeHtml(title || 'Bài viết')}</h1>`;
        sections.forEach(sec => {
            const level = parseInt(sec.level || 2);
            const tag = level === 1 ? 'h1' : (level === 2 ? 'h2' : 'h3');
            const heading = escapeHtml(sec.title || sec.heading || 'Tiêu đề');
            html += `<${tag}>${heading}</${tag}>`;
            // Add 1-2 short paragraphs as placeholder
            html += `<p>${escapeHtml(sec.config?.summary || 'Nội dung tóm tắt cho phần này.')}</p>`;
            if (tag === 'h3') html += `<p>${escapeHtml('Chi tiết bổ sung cho phần này.')}</p>`;
        });
        return { title: title, html_content: html, summary: 'Bài viết tạm tạo từ outline (không gọi API).' };
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
<<<<<<< HEAD
                        "5. Sử dụng dữ liệu THẬT từ top_news để làm dẫn chứng chi tiết cho từng phần.\n" +
                        "6. Sử dụng CHÍNH XÁC tên các tiêu đề (titles) được cung cấp trong Outline, không được tự ý thay đổi tên hoặc thêm số thứ tự vào tiêu đề."
=======
                        "5. Sử dụng dữ liệu THẬT từ top_news để làm dẫn chứng chi tiết cho từng phần."
>>>>>>> 9611f99083b433c2fc2e7a7eb6a320c06d544dd6
                },
                outline: outlineForApi
            };

<<<<<<< HEAD
            // Avoid logging huge payloads (can block the UI); log size only and reuse the serialized payload
            const payloadStr = JSON.stringify(payload);
            console.log("📤 PAYLOAD size (bytes):", payloadStr.length);
=======
            console.log("📤 PAYLOAD (Full):", JSON.stringify(payload, null, 2));

            console.log("📤 Payload gửi đi (Truncated):", JSON.stringify(payload).length, "bytes");
>>>>>>> 9611f99083b433c2fc2e7a7eb6a320c06d544dd6

            const data = await apiRequest('ai/contents', {
                method: "POST",
                body: payloadStr
            });

            // Log a compact summary instead of the full object to prevent UI blocking
            console.log("✅ RAW AI RESPONSE keys:", Object.keys(data || {}), "article_size:", (data?.article?.html_content?.length) || 0);

            if (data.article && data.article.html_content) {
                const h3Count = (data.article.html_content.match(/<h3/g) || []).length;
                console.log(`📊 AI HTML check: Found ${h3Count} <h3> tags.`);
            }
<<<<<<< HEAD
=======
            const data = await res.json();
            console.log("✅ RAW AI RESPONSE:", data);

            if (data.article && data.article.html_content) {
                const h3Count = (data.article.html_content.match(/<h3/g) || []).length;
                console.log(`📊 AI HTML check: Found ${h3Count} <h3> tags.`);
            }
>>>>>>> 9611f99083b433c2fc2e7a7eb6a320c06d544dd6

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
