/* =====================================================
   AI SEO – APP LOGIC (REQUIRES mock-api.js)
   ===================================================== */

// Ensure apiRequest is available
if (typeof apiRequest === 'undefined') {
    console.error("❌ mock-api.js failed to load! Make sure to include it in your HTML.");
}

/* =====================================================
   APP LOGIC
   ===================================================== */

async function loadConfigs() {
    try {
        // Use global API_BASE_URL
        const baseUrl = window.API_BASE_URL || 'https://caiman-warm-swan.ngrok-free.app/api/v1';
        const data = await apiRequest(`${baseUrl}/ui/configs`);

        fillSelect("content_types", data.content_types);
        fillSelect("writing_tones", data.writing_tones);
        fillSelect("languages", data.languages);
        fillSelect("bots", data.bots);
    } catch (e) {
        console.error("❌ Config Load Error:", e);
    }
}

function fillSelect(id, arr) {
    const el = document.getElementById(id);
    if (!el) return;
    el.innerHTML = `<option value="">Chọn...</option>`;
    if (Array.isArray(arr)) {
        arr.forEach(v => el.innerHTML += `<option value="${v}">${v}</option>`);
    }
}

/* ================= PIPELINE ================= */

async function searchNews(query) {
    const baseUrl = window.API_BASE_URL;
    const data = await apiRequest(`${baseUrl}/crawl/news`, {
        method: "POST",
        body: JSON.stringify({ query })
    });
    return data.results;
}

async function crawlArticles(articles) {
    const baseUrl = window.API_BASE_URL;
    const data = await apiRequest(`${baseUrl}/crawl/crawl`, {
        method: "POST",
        body: JSON.stringify({
            articles: articles.map(a => ({
                url: a.url,
                title: a.title,
                snippet: a.snippet
            }))
        })
    });
    return data.articles;
}

async function filterAndOutline(crawled, keyword, title) {
    const baseUrl = window.API_BASE_URL;
    return apiRequest(`${baseUrl}/ai/news-filterings`, {
        method: "POST",
        body: JSON.stringify({
            articles: crawled,
            main_keyword: keyword,
            article_title: title
        })
    });
}

/* ================= UI HELPER ================= */

function showLoadingState(isLoading) {
    const loadingEl = document.getElementById("loading");
    const rightPanelContent = document.querySelectorAll(".video-placeholder, .preview-text");
    const outlineResult = document.getElementById("outlineResult");
    const btn = document.getElementById("generateBtn");

    if (isLoading) {
        if (loadingEl) loadingEl.style.display = "block";
        rightPanelContent.forEach(el => el.style.display = "none");
        if (outlineResult) outlineResult.style.display = "none";

        if (btn) {
            btn.disabled = true;
            btn.innerHTML = `<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Đang xử lý...`;
        }
    } else {
        if (loadingEl) loadingEl.style.display = "none";
        // Do not unhide rightPanelContent, as we assume result will be shown
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = `Tạo dàn ý bài viết <span style="margin-left: 5px;">→</span>`;
        }
    }
}

/* ================= MAIN FUNCTION ================= */

async function generate() {
    // 1. Get Inputs based on Active Tab
    const activeTab = document.querySelector('.tab.active');
    const isPrivate = activeTab && activeTab.dataset.tab === 'private';

    // Select input based on active tab
    const internetQueryInput = document.getElementById("internet_user_query");
    const privateQueryInput = document.getElementById("user_query");

    // Get values
    const internetQuery = internetQueryInput ? internetQueryInput.value.trim() : "";
    const privateQuery = privateQueryInput ? privateQueryInput.value.trim() : "";

    const keyword = isPrivate ? privateQuery : internetQuery;

    if (!keyword) {
        alert("Vui lòng nhập từ khóa chính!");
        // Focus the correct input
        if (isPrivate && privateQueryInput) privateQueryInput.focus();
        else if (internetQueryInput) internetQueryInput.focus();
        return;
    }

    // Get Title
    const titleInput = isPrivate ? document.getElementById("articleTitle") : document.getElementById("internet_articleTitle");
    const title = titleInput?.value || `Bài viết về ${keyword}`;

    console.log(`🚀 START PIPELINE (${isPrivate ? 'Private' : 'Internet'}) with keyword:`, keyword);

    // 2. Show Loading
    showLoadingState(true);

    try {
        // 3. Run Pipeline
        const news = await searchNews(keyword);
        const crawled = await crawlArticles(news);
        const outlineData = await filterAndOutline(crawled, keyword, title);

        console.log("✅ Pipeline Success:", outlineData);

        // 4. Render Result
        showLoadingState(false);

        // Show result container
        const outlineResult = document.getElementById("outlineResult");
        if (outlineResult) outlineResult.style.display = "block";

        // Use dan-y-bai-viet.js if available
        if (window.outlineEditor) {
            // Pass the article_outline from response
            if (outlineData.article_outline) {
                window.outlineEditor.setOutlineData(outlineData.article_outline);
                window.outlineEditor.renderOutline();

                // Update title logic
                if (title) window.outlineEditor.updateTitle(title);
            }
        } else {
            console.error("❌ window.outlineEditor not found!");
            const listContainer = document.getElementById('outlineList');
            if (listContainer) listContainer.innerHTML = `<pre>${JSON.stringify(outlineData, null, 2)}</pre>`;
        }

    } catch (e) {
        console.error("❌ Pipeline Failed:", e);
        showLoadingState(false);
        alert("Có lỗi xảy ra: " + e.message);

        // Restore placeholder if failed
        document.querySelectorAll(".video-placeholder, .preview-text").forEach(el => el.style.display = "block");
    }
}

/* ================= INIT UI INTERACTION ================= */

function initTabs() {
    const tabs = document.querySelectorAll(".tab");
    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            // Remove active from all tabs
            tabs.forEach(t => t.classList.remove("active"));
            // Add active to clicked tab
            tab.classList.add("active");

            const targetId = tab.dataset.tab; // 'internet' or 'private'

            // Hide/Show content areas
            document.querySelectorAll(".content").forEach(c => {
                c.classList.remove("active");
                if (c.id === targetId) c.classList.add("active");
            });

            // Optional: Log to verify logic
            console.log("Switched to tab:", targetId);
        });
    });
}

function initTags(inputId, containerId) {
    const input = document.getElementById(inputId);
    const container = document.getElementById(containerId);

    if (!input || !container) return;

    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && input.value.trim()) {
            e.preventDefault();
            const text = input.value.trim();
            const tag = document.createElement('span');
            tag.className = 'tag';
            // Simple styling
            tag.style.cssText = "display:inline-block; background:#e1f5fe; color:#0288d1; padding:4px 8px; margin:2px; border-radius:4px; font-size:12px;";
            tag.innerHTML = `${text} <span class="close-icon" style="cursor:pointer;margin-left:5px;color:red;" onclick="this.parentElement.remove()">×</span>`;
            container.appendChild(tag);
            input.value = '';
        }
    });
}

/* ================= INIT ================= */

document.addEventListener("DOMContentLoaded", () => {
    loadConfigs();

    // Initialize UI Logic
    initTabs();
    initTags('internet_secondaryKeyword', 'internet_tagContainer');
    initTags('private_secondaryKeyword', 'tagContainer');

    const btn = document.getElementById("generateBtn");
    if (btn) {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            generate();
        });
    } else {
        console.error("❌ Generate Button (id='generateBtn') not found!");
    }
    console.log("✅ AI SEO APP READY");
});
