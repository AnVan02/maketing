// API_BASE_URL is now managed by bao-mat.js proxy


// 2. HÀM HIỆU ỨNG LOADING (UI)
function transitionToLoadingState() {
    console.log("🚀 Bắt đầu chuyển sang trạng thái Loading...");

    const rightColumn = document.querySelector('.column.right');
    const leftColumn = document.querySelector('.column.left');

    // Các phần tử cần ẩn
    const elementsToHide = document.querySelectorAll(
        '.video-placeholder, .preview-text, #generateBtn, #previewLength, .guide-btn'
    );
    const existingLoading = document.getElementById('loading');

    // Làm mờ cột trái nhưng vẫn cho phép sửa (theo yêu cầu mới nhất)
    if (leftColumn) {
        leftColumn.style.pointerEvents = 'auto'; // Vẫn cho phép tương tác
        leftColumn.style.opacity = '0.7';        // Làm mờ 70% để phân biệt với phần đang xử lý
    }

    // Ẩn nội dung cột phải cũ
    elementsToHide.forEach(el => {
        if (el) el.style.display = 'none';
    });
    if (existingLoading) existingLoading.style.display = 'none';

    // Tạo Loading Lớn
    let bigLoading = document.getElementById('fullscreen-loading-state');
    if (!bigLoading) {
        bigLoading = document.createElement('div');
        bigLoading.id = 'fullscreen-loading-state';
        bigLoading.className = 'loading-state-container';
        bigLoading.innerHTML = `
            <div class="spinner-large-container">
                <svg class="spinner-circle" viewBox="0 0 50 50">
                    <circle class="spinner-track" cx="25" cy="25" r="20" fill="none" stroke-width="4"></circle>
                    <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="4"></circle>
                </svg>
            </div>
            <h3 class="loading-title">Dàn ý đang được khởi tạo...</h3>
            <p class="loading-desc">Hệ thống đang tìm kiếm tin tức và phân tích nội dung.<br>Vui lòng chờ trong giây lát.</p>
        `;

        if (rightColumn) {
            rightColumn.appendChild(bigLoading);
            rightColumn.classList.add('flex-centered');
        }
    } else {
        bigLoading.style.display = 'flex';
    }

    bigLoading.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// 3. HÀM TÌM KIẾM TIN TỨC (API STEP 1)
async function searchNews(query, maxResults = 10) {
    console.log(`🔍 Đang tìm kiếm: ${query}`);

    try {
        const data = await apiRequest('crawl/news', {
            method: "POST",
            body: JSON.stringify({ query: query, max_results: maxResults })
        });


        if (data.success && data.results?.length > 0) {
            console.log(`✅ Tìm thấy ${data.results.length} bài viết.`);
            return data.results;
        } else {
            throw new Error("Không tìm thấy bài viết nào phù hợp.");
        }
    } catch (e) {
        console.error("❌ Lỗi Search:", e);
        throw e;
    }
}

// 4. HÀM CRAWL CHI TIẾT BÀI VIẾT (API STEP 2)
async function crawlArticleDetails(articles) {
    console.log("📥 Đang crawl chi tiết bài viết...");

    try {
        const data = await apiRequest('crawl/crawl', {
            method: "POST",
            body: JSON.stringify({
                articles: articles.map(a => ({
                    url: a.url,
                    title: a.title,
                    snippet: a.snippet || ""
                }))
            })
        });


        if (data.success && Array.isArray(data.articles)) {
            console.log(`✅ Đã crawl ${data.processed_count} bài viết`);
            return data.articles.map(article => ({
                url: article.url,
                title: article.title,
                snippet: article.snippet || "",
                content: article.content_preview || article.content || "",
                content_preview: article.content_preview || "",
                images: article.images || [],
                success: article.success
            }));
        } else {
            throw new Error("Không crawl được bài viết");
        }
    } catch (e) {
        console.error("❌ Lỗi Crawl:", e);
        throw e;
    }
}

// 5. HÀM SINH DÀN Ý (API STEP 3)
async function callGenerateOutlineApi(crawledArticles, mainKeyword, articleTitle) {
    console.log("🧠 Đang gọi AI sinh dàn ý...");

    // Chuẩn bị dữ liệu gửi đi
    const simplifiedArticles = crawledArticles.map(art => ({
        url: art.url,
        title: art.title,
        snippet: art.snippet || "",
        content_preview: (art.content || art.content_preview || "").substring(0, 3000),
        images: art.images || [],
        success: true
    }));

    const payload = {
        articles: simplifiedArticles,
        main_keyword: mainKeyword,
        secondary_keywords: [],
        article_title: articleTitle || mainKeyword,
        top_k: 3
    };

    try {
        const data = await apiRequest('ai/news-filterings', {
            method: "POST",
            body: JSON.stringify(payload)
        });


        if (data.success) {
            return {
                selected_news: data.selected_news,
                article_outline: data.article_outline,
                reasoning: data.reasoning
            };
        } else {
            throw new Error(data.message || "AI không trả về dàn ý.");
        }
    } catch (e) {
        console.error("❌ Lỗi AI:", e);
        throw e;
    }
}

// 5. HÀM XỬ LÝ CHÍNH (MAIN HANDLER)
async function handleGenerateOutline() {
    // A. Lấy dữ liệu từ Form
    const activeTab = document.querySelector('.tab.active')?.dataset.tab || 'internet';
    let keyword = '';
    let title = '';

    if (activeTab === 'internet') {
        keyword = document.getElementById('internet_user_query').value.trim();
        title = document.getElementById('articleTitle_internet').value.trim();
    } else {
        keyword = document.getElementById('user_query').value.trim();
        title = document.getElementById('articleTitle').value.trim();
    }

    if (!keyword) {
        alert("Vui lòng nhập từ khóa chính!");
        return;
    }

    // B. Bật hiệu ứng Loading
    transitionToLoadingState();

    try {
        // C. Tìm kiếm tin tức
        const articles = await searchNews(keyword);

        // D. Crawl chi tiết bài viết
        const crawledArticles = await crawlArticleDetails(articles);

        // E. Gọi AI sinh dàn ý
        const aiResult = await callGenerateOutlineApi(crawledArticles, keyword, title);

        // F. Đóng gói dữ liệu để lưu
        const pipelineData = {
            config: {
                main_keyword: keyword,
                title: title,
                type: 'internet'
            },
            crawledArticles: crawledArticles,
            pipeline_results: aiResult // Kết quả quan trọng nhất (Dàn ý + Tin đã lọc)
        };

        // G. Lưu vào SessionStorage
        sessionStorage.setItem('pipelineData', JSON.stringify(pipelineData));
        console.log("💾 Đã lưu dữ liệu thành công!");

        // H. CHUYỂN HƯỚNG SANG TRANG DÀN Ý
        console.log("➡️ Đang chuyển hướng sang trang-thai-xu-ly...");
        setTimeout(() => {
            window.location.href = './trang-thai-xu-ly.php';
        }, 1000); // Đợi 1s để người dùng thấy loading xong

    } catch (error) {
        alert("Có lỗi xảy ra: " + error.message);
        console.error(error);
        location.reload(); // Reload lại trang để reset trạng thái loading
    }
}

// 6. GẮN SỰ KIỆN KHI DOM SẴN SÀNG
document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generateBtn');
    if (generateBtn) {
        // Xóa các event cũ nếu có để tránh duplicate
        const newBtn = generateBtn.cloneNode(true);
        generateBtn.parentNode.replaceChild(newBtn, generateBtn);

        // Gắn sự kiện mới
        newBtn.addEventListener('click', handleGenerateOutline);
        console.log("✅ Đã gắn sự kiện click cho nút Tạo dàn ý");
    }
});