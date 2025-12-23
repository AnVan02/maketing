// ====================================================
// Biến toàn cục
// ====================================================

const API_BASE_URL = 'https://caiman-warm-swan.ngrok-free.app/api/v1';

// DOM Elements chính
const tabs = document.querySelectorAll(".tab");
const subButtons = document.querySelectorAll("#private .sub");
const fileSelector = document.getElementById("file-selector");
const outsideFileListContainer = document.querySelector(".uploaded-file-list-outside");
const subtabContentArea = document.getElementById("subtab-content-area");

// Storage Keys (Dùng var để tránh lỗi redeclare nếu file khác đã có)
var STORAGE_KEY = 'uploadedFilesData';
const MAX_STEP_KEY = 'maxCompletedStep';

// Trạng thái ứng dụng
let maxCompletedStep = parseInt(localStorage.getItem(MAX_STEP_KEY)) || 0;
let selectedFiles = [];
let tempTextContent = localStorage.getItem('tempTextContent') || "";
let tempLinkContent = localStorage.getItem('tempLinkContent') || "";
let productLinks = JSON.parse(localStorage.getItem('productLinks')) || [];

// Pipeline Data - Lưu kết quả từng bước
let pipelineData = {
    newsResults: [],      // Kết quả từ /crawl/news
    crawledArticles: [],  // Kết quả từ /crawl/crawl
    filteredNews: null,   // Kết quả từ /ai/news-filterings
    finalArticle: null    // Kết quả từ /ai/contents
};

// Ánh xạ bước thực hiện
const stepMap = { 'file': 0, 'text': 1, 'link': 2 };

// ============================================
// 2. HÀM GỌI API HỆ THỐNG (CORE LOGIC)
// ============================================

async function loadConfigs() {
    console.log("🚀 Đang tải cấu hình hệ thống...");
    const selectIds = ['content_types', 'writing_tones', 'languages', 'bots'];

    selectIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = '<option value="">Đang tải dữ liệu...</option>';
    });

    try {
        const res = await fetch(`${API_BASE_URL}/ui/configs`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (!res.ok) throw new Error(`API Error: ${res.status}`);

        const data = await res.json();
        console.log("✅ Configs loaded:", data);

        const populate = (id, items, label) => {
            const el = document.getElementById(id);
            if (!el) return;
            el.innerHTML = `<option value="">${label}</option>`;
            if (items && Array.isArray(items)) {
                items.forEach(i => {
                    const opt = document.createElement('option');
                    opt.value = i;
                    opt.textContent = i;
                    el.appendChild(opt);
                });
            }
        };

        populate('content_types', data.content_types, 'Chọn loại bài viết');
        populate('writing_tones', data.writing_tones, 'Chọn tone giọng');
        populate('languages', data.languages, 'Chọn ngôn ngữ');
        populate('bots', data.bots, 'Chọn AI Model');

        return true;

    } catch (e) {
        console.error("❌ Lỗi loadConfigs:", e);
        showNotification("Không kết nối được API. Dùng cấu hình mặc định.", "warning");
        createDefaultConfigs();
        return false;
    }
}

function createDefaultConfigs() {
    const defaults = {
        content_types: ["Blog SEO", "Tin tức", "Hướng dẫn"],
        writing_tones: ["Chuyên nghiệp", "Thuyết phục", "Sáng tạo"],
        languages: ["Tiếng Việt", "Tiếng Anh", "Tiếng Thái"],
        bots: ["GPT-4.1", "Gemini-2.5-flash"]
    };

    const fill = (id, arr) => {
        const el = document.getElementById(id);
        if (el) {
            el.innerHTML = '<option value="">Chọn...</option>';
            arr.forEach(x => el.innerHTML += `<option value="${x}">${x}</option>`);
        }
    }
    fill('content_types', defaults.content_types);
    fill('writing_tones', defaults.writing_tones);
    fill('languages', defaults.languages);
    fill('bots', defaults.bots);
}

// ============================================
// 3. API PIPELINE - TỪ NEWS ĐẾN OUTLINE
// ============================================
// BƯỚC 3.2: Tìm kiếm tin tức
async function searchNews(query, maxResults = 10) {
    console.log("🔍 [API] Searching news for:", query);
    showNotification("Đang tìm kiếm tin tức liên quan...", "info");

    try {
        const res = await fetch(`${API_BASE_URL}/crawl/news`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query: query, max_results: maxResults })
        });

        if (!res.ok) throw new Error(`News API Error: ${res.status}`);

        const data = await res.json();
        console.log("✅ News results:", data);


        if (data.success && data.results && data.results.length > 0) {
            pipelineData.newsResults = data.results;
            showNotification(`✅ Tìm thấy ${data.total_results} bài viết liên quan!`, "success");
            return data.results;
        } else {
            throw new Error("Không tìm thấy bài viết nào");
        }

    } catch (e) {
        console.error("❌ Search News Error:", e);
        showNotification("Lỗi tìm kiếm tin tức: " + e.message, "error");
        return null;
    }
}

// BƯỚC 3.3: Crawl nội dung (ĐÃ SỬA: GÁN CONTENT_PREVIEW VÀO CONTENT)
async function crawlArticles(articles) {
    console.log("📥 [API] Crawling articles:", articles.length);
    showNotification("Đang lấy nội dung chi tiết từ các bài viết...", "info");
    try {
        const res = await fetch(`${API_BASE_URL}/crawl/crawl`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                articles: articles.map(a => ({
                    url: a.url,
                    title: a.title,
                    snippet: a.snippet || ""
                }))
            })
        });
        if (!res.ok) throw new Error(`Crawl API Error: ${res.status}`);

        const data = await res.json();
        console.log("RESPONSE NHẬN VỀ: ", data);

        if (data.success && Array.isArray(data.articles)) {
            // Chuẩn hóa dữ liệu: Gán content_preview vào content để bước sau dùng được
            const processedArticles = data.articles.map(article => ({
                url: article.url,
                title: article.title,
                snippet: article.snippet || "",
                // QUAN TRỌNG: Gán content_preview vào content
                content: article.content_preview || article.content || "",
                content_preview: article.content_preview || "",
                images: article.images || [],
                success: article.success
            }));

            pipelineData.crawledArticles = processedArticles;

            showNotification(`✅ Đã lấy nội dung ${data.processed_count} bài viết!`, "success");
            return processedArticles;
        } else {
            throw new Error("Không crawl được bài viết hoặc danh sách rỗng");
        }

    } catch (e) {
        console.error("❌ Crawl Articles Error:", e);
        showNotification("Lỗi crawl bài viết: " + e.message, "error");
        return null;
    }
}

// BƯỚC 3.4: Lọc tin tức & tạo dàn ý 
async function filterNewsAndGenerateOutline(crawledArticles, mainKeyword, secondaryKeywords, articleTitle, topK = 3) {
    console.log("🤖 [API] Filtering news & generating outline...");

    if (!crawledArticles || crawledArticles.length === 0) {
        showNotification("⚠️ Không có bài viết nào để phân tích!", "warning");
        return null;
    }
    showNotification("AI đang đọc hiểu và lọc bài viết (Có thể mất 10-20s)...", "info");
    try {
        // Payload chuẩn theo yêu cầu user
        const payload = {
            articles: crawledArticles.map(article => ({
                url: article.url,
                title: article.title,
                snippet: article.snippet || "Giới thiệu GPT-5 từ OpenAI", // Fallback như mẫu
                content_preview: article.content_preview || article.content || "",
                images: article.images || [],
                success: true,
                error: null
            })),
            main_keyword: mainKeyword,
            secondary_keywords: secondaryKeywords || [],
            article_title: articleTitle,
            top_k: topK
        };

        console.log("REQUEST:", payload);

        // API URL theo yêu cầu user
        const res = await fetch("http://172.16.1.78:8080/api/v1/ai/news-filterings", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        console.log("RESPONSE:", data);

        // document.getElementById("result").textContent = JSON.stringify(data, null, 2); // User example logic

        if (data.success) {
            pipelineData.filteredNews = {
                selected_news: data.selected_news || [],
                article_outline: data.article_outline, // Dàn ý trả về từ API
                reasoning: data.reasoning || ""
            };

            const count = data.selected_news ? data.selected_news.length : 0;
            showNotification(`✅ AI đã chọn được ${count} bài viết tốt nhất & tạo xong dàn ý!`, "success");

            return pipelineData.filteredNews;
        } else {
            // Fallback nếu API trả về lỗi logic nhưng vẫn 200 OK
            throw new Error(data.message || "Không tạo được dàn ý (Lỗi không xác định)");
        }

    } catch (e) {
        console.error("❌ Filter & Outline Error:", e);
        showNotification("Lỗi xử lý AI: " + e.message, "error");
        return null;
    }
}

// BƯỚC 3.5: Tạo bài viêt SEO với api
/**
 * Gọi API AI để tạo nội dung bài viết SEO.
 * @param {Array} topNews - Danh sách các bài viết được chọn (rank, title, url, images, content_preview).
 * @param {Object} config - Cấu hình AI (bot_id, article_length, tone, article_type, language, custom_instructions).
 * @param {string} title - Tiêu đề bài viết.
 * @param {Array} outline - Dàn ý bài viết.
 * @param {string} mainKeyword - Từ khoá chính.
 * @param {Array} secondaryKeywords - Danh sách các từ khoá phụ.
 * @returns {Promise<Object|null>} Trả về bài viết nếu thành công, hoặc null nếu thất bại.
 */

async function generateSEOContent(topNews, config, title, outline, mainKeyword, secondaryKeywords) {
    try {
        // Chuyển đổi outline từ format sections sang format API yêu cầu
        let outlineForApi = [];
        // Thêm H1 (title)
        outlineForApi.push({
            id: "h1-1",
            level: 1,
            title: title,
            order: 1,
            config: null
        });

        // Thêm các H2 sections
        if (outline && outline.sections) {
            outline.sections.forEach((section, index) => {
                outlineForApi.push({
                    id: `h2-${index + 1}`,
                    level: 2,
                    title: section.heading || section.title,
                    order: index + 2,
                    config: {
                        word_count: Math.round((section.length_ratio || 50) * 5), // Convert % to word count
                        keywords: section.keywords || [],
                        tone: null,
                        internal_link: null
                    }
                });
            });
        }

        const payload = {
            top_news: topNews,
            target_language: config.language || "Tiếng Việt",
            config: {
                bot_id: config.bot_id || config.bot || "GPT-4.1",
                article_length: config.article_length || "2000",
                tone: config.tone || "Chuyên nghiệp",
                article_type: config.article_type || config.type || "blog",
                custome_instructions: config.custom_instructions || null
            },
            title: title,
            outline: outlineForApi,
            main_keyword: mainKeyword,
            secondary_keywords: secondaryKeywords || []
        };

        console.log("📤 Payload gửi đến /ai/contents:", payload);

        const res = await fetch(`${API_BASE_URL}/ai/contents`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "ngrok-skip-browser-warning": "true"
            },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            const errText = await res.text();
            throw new Error(`AI Content API Error (${res.status}): ${errText}`);
        }

        const data = await res.json();
        if (data.success && data.article) {
            console.log("✅ SEO article generated:", data.article);
            return data.article;
        } else {
            throw new Error(data.message || "Failed to generate article");
        }
    } catch (e) {
        console.error("❌ generateSEOContent error:", e);
        showNotification(`Lỗi tạo nội dung SEO: ${e.message}`, "error");
        return null;
    }
}

// ============================================
// 4. HÀM TIỆN ÍCH CHUNG
// ============================================
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + ['Bytes', 'KB', 'MB', 'GB'][i];
}

function showNotification(message, type = 'info') {
    const colors = { success: '#28a745', error: '#dc3545', warning: '#ffc107', info: '#17a2b8' };
    const existing = document.querySelectorAll('.custom-notification');
    existing.forEach(e => e.remove());

    const notification = document.createElement('div');
    notification.className = 'custom-notification';
    notification.style.cssText = `position: fixed; top: 20px; right: 20px; padding: 15px 20px; background: ${colors[type] || colors.info}; color: white; border-radius: 5px; z-index: 9999; box-shadow: 0 3px 10px rgba(0,0,0,0.2); animation: slideIn 0.3s ease;`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => { notification.remove(); }, 3000);
}

function showLoading(show) { // Hiển thị loading
    const loading = document.getElementById('loading');
    const generateBtn = document.getElementById('generateBtn');
    if (loading) loading.style.display = show ? 'block' : 'none';
    if (generateBtn) {
        generateBtn.disabled = show;
        generateBtn.innerHTML = show ? `<span class="edit-icon">⏳</span> Đang xử lý...` : `<span class="edit-icon">📝</span> Tạo dàn ý bài viết <span style="margin-left: 5px;">→</span>`;
    }
}

function saveState() {  // lưu trạng thái
    localStorage.setItem(MAX_STEP_KEY, maxCompletedStep);
    localStorage.setItem('tempTextContent', tempTextContent);
    localStorage.setItem('tempLinkContent', tempLinkContent);
    localStorage.setItem('productLinks', JSON.stringify(productLinks));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedFiles));
}

function readFileAsBase64(file) { // đọc file thành base 64
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// ============================================
// 5. PHẦN XỬ LÝ TAB TUẦN TỰ (FILE - TEXT - LINK)
// ============================================

async function processFiles(files) { // xử lý file
    if (!files || files.length === 0) return;
    const allowedTypes = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"];
    const validFiles = Array.from(files).filter(f => allowedTypes.includes(f.type));

    if (validFiles.length === 0) return showNotification("Chỉ chấp nhận file PDF, DOCX hoặc Excel!", "warning");

    selectedFiles = [];
    for (const file of validFiles) {
        const base64Content = await readFileAsBase64(file);
        selectedFiles.push({ name: file.name, size: file.size, type: file.type, base64: base64Content });
        break;
    }
    renderFiles();
    saveState();

    if (selectedFiles.length > 0 && maxCompletedStep === 0) {
        maxCompletedStep = 1;
        saveState();
        showNotification("✅ Tải file thành công!", "success");
        updateSubtabStates();
        const currentSub = document.querySelector('.sub.active');
        if (currentSub && currentSub.dataset.sub === 'file') setupSubtabContent('file');
    }
}

function renderFiles() {
    if (!outsideFileListContainer) return;
    outsideFileListContainer.innerHTML = "";
    if (selectedFiles.length === 0) {
        if (maxCompletedStep > 0) { maxCompletedStep = 0; saveState(); updateSubtabStates(); }
        return;
    }
    selectedFiles.forEach((file, index) => {
        const icon = file.type.includes("pdf") ? '📄' : '📊';
        const html = `
            <div class="uploaded-file">
                <div class="file-info"><span class="file-icon">${icon}</span>
                <div class="file-details"><div class="file-name">${file.name}</div>
                <div class="file-size-status">${formatFileSize(file.size)} - Đã tải lên</div></div></div>
                ${maxCompletedStep === 0 ? `<button class="remove-file" data-index="${index}">×</button>` : ''}
            </div>`;
        outsideFileListContainer.innerHTML += html;
    });

    document.querySelectorAll(".remove-file").forEach(btn => {
        btn.addEventListener("click", (e) => {
            selectedFiles.splice(e.currentTarget.dataset.index, 1);
            saveState();
            renderFiles();
        });
    });
}

function setupSubtabContent(sub) { // setup nội dung tab
    if (!subtabContentArea) return;
    subtabContentArea.innerHTML = '';
    const isFileStepCompleted = maxCompletedStep > 0;

    if (sub === 'file') {
        if (outsideFileListContainer) outsideFileListContainer.style.display = 'flex';
        renderFiles();

        const boxHTML = `
            <div class="upload-box" id="actual-upload-box">
                <div class="icon">${isFileStepCompleted ? '✅' : '☁️'}</div>
                <p>${isFileStepCompleted ? 'File đã được tải lên thành công!' : 'Kéo thả File vào đây'}</p>
            </div>`;
        subtabContentArea.innerHTML = boxHTML;

        const box = document.getElementById("actual-upload-box");
        if (!isFileStepCompleted) {
            box.classList.add('clickable');
            box.addEventListener("click", () => fileSelector.click());
            box.addEventListener("dragover", (e) => { e.preventDefault(); box.classList.add("hover"); });
            box.addEventListener("dragleave", () => box.classList.remove("hover"));
            box.addEventListener("drop", (e) => { e.preventDefault(); processFiles(e.dataTransfer.files); });
        } else {
            box.style.background = '#f0fff4';
            box.style.borderColor = 'green';
        }
    } else {
        if (outsideFileListContainer) outsideFileListContainer.style.display = 'none';
    }

    if (sub === "text") { // tad text
        const isReadonly = maxCompletedStep > 1;
        subtabContentArea.innerHTML = `
            <div class="text-editor-container">
                <div class="editor-toolbar">
                    <select class="font-select" onchange="document.execCommand('fontName',false,this.value)" ${isReadonly ? 'disabled' : ''}>
                        <option value="Arial">Arial</option>
                        <option value="Times New Roman">Times New Roman</option>
                        <option value="Montserrat">Montserrat</option>
                    </select>
                    <button class="toolbar-btn" onclick="document.execCommand('bold')" title="Đậm" ${isReadonly ? 'disabled' : ''}><b>B</b></button>
                    <button class="toolbar-btn" onclick="document.execCommand('italic')" title="Nghiêng" ${isReadonly ? 'disabled' : ''}><i>I</i></button>
                </div>
                <div class="editor-content" id="editor" contenteditable="${!isReadonly}" 
                     placeholder="Nhập nội dung bổ sung hoặc dàn ý tại đây...">
                     ${tempTextContent}
                </div>
                ${isReadonly ? '<div class="step-status-lock">🔒 Bước này đã hoàn thành.</div>' : ''}
            </div>
        `;
    } else if (sub === "link") { // tab link
        const isReadonly = maxCompletedStep > 2;
        subtabContentArea.innerHTML = `
            <div class="link-input-container">
                <input id="input-link" placeholder="Link sản phẩm (Nhấn Enter để thêm)..." value="${tempLinkContent}" ${isReadonly ? 'readonly' : ''}>
                <div id="link-list" style="margin-top:10px;">
                    ${productLinks.map((p, idx) => `
                        <div style="padding:5px; border-bottom:1px solid #eee; display:flex; justify-content:space-between;">
                            <span>🔗 ${p.url}</span>
                            ${!isReadonly ? `<span style="color:red;cursor:pointer" onclick="removeLink(${idx})">×</span>` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>`;

        const inp = document.getElementById('input-link');
        if (!isReadonly && inp) {
            inp.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && inp.value) {
                    productLinks.push({ url: inp.value });
                    inp.value = '';
                    saveState();
                    setupSubtabContent('link');
                }
            });
            window.removeLink = (idx) => {
                productLinks.splice(idx, 1);
                saveState();
                setupSubtabContent('link');
            };
        }
    }
}

function updateSubtabStates() {
    subButtons.forEach(btn => {
        const step = stepMap[btn.dataset.sub];
        if (step < maxCompletedStep) { btn.classList.add('completed'); btn.classList.remove('locked'); }
        else if (step === maxCompletedStep) { btn.classList.remove('locked'); btn.style.opacity = '1'; }
        else { btn.classList.add('locked'); btn.style.opacity = '0.5'; }
    });
}

// Event Listeners cho Tabs
if (subButtons.length > 0) {
    subButtons.forEach((btn) => {
        btn.addEventListener("click", (e) => {
            if (btn.classList.contains('locked')) return;
            subButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            setupSubtabContent(btn.dataset.sub);
        });
    });
}

tabs.forEach(tab => {
    tab.addEventListener("click", () => {
        tabs.forEach(t => t.classList.remove("active"));
        tab.classList.add("active");
        const target = tab.dataset.tab;

        document.querySelectorAll(".content").forEach(c => {
            c.classList.remove("active");
            if (c.id === target) c.classList.add("active");
        });
    });
});

if (fileSelector) {
    fileSelector.addEventListener("change", (e) => processFiles(e.target.files));
}


// ============================================
// 6. CÁC TÍNH NĂNG BỔ SUNG (Tags, Drafts, AI Suggest)
// ============================================

function initializeKeywordTags() {
    const input = document.getElementById('secondaryKeyword');
    const container = document.getElementById('tagContainer');
    const mainInput = document.getElementById('user_query');

    if (!input || !container) return;

    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && input.value.trim()) {
            e.preventDefault();
            addTag(input.value.trim());
            input.value = '';
        }
    });

    function addTag(text) {
        const existing = Array.from(container.querySelectorAll('.tag')).map(t => t.textContent.replace('×', '').trim());
        if (existing.includes(text)) return;

        const tag = document.createElement('span');
        tag.className = 'tag';
        tag.innerHTML = `${text} <span class="close-icon" onclick="this.parentElement.remove()">×</span>`;
        container.appendChild(tag);
    }

    async function fetchKeywordsFromApi(query) {
        if (!query) return;

        const loadingTag = document.createElement('span');
        loadingTag.className = 'tag loading-tag';
        loadingTag.textContent = 'Đang tìm từ khóa... ⏳';
        container.appendChild(loadingTag);

        try {
            const res = await fetch(`${API_BASE_URL}/suggest_keywords`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query: query })
            });

            loadingTag.remove();

            if (res.ok) {
                const data = await res.json();
                if (data && Array.isArray(data.keywords)) {
                    data.keywords.forEach(kw => addTag(kw));
                    showNotification(`Đã tìm thấy ${data.keywords.length} từ khóa liên quan!`, 'success');
                }
            } else {
                const mockKeywords = [query + " là gì", "lợi ích của " + query, "cách sử dụng " + query];
                mockKeywords.forEach(kw => addTag(kw));
                showNotification("Đã tìm thấy từ khóa gợi ý (Demo)", 'info');
            }

        } catch (e) {
            loadingTag.remove();
            console.error("Fetch Keywords Error:", e);
            const mockKeywords = [query + " giá rẻ", query + " tốt nhất", "review " + query];
            mockKeywords.forEach(kw => addTag(kw));
        }
    }

    if (mainInput) {
        mainInput.addEventListener('blur', () => {
            if (mainInput.value.trim() && container.children.length === 0) {
                fetchKeywordsFromApi(mainInput.value.trim());
            }
        });
    }
}

function initializeAiSuggest() {
    const btn = document.getElementById('aiSuggestBtn');
    if (!btn) return;
    btn.addEventListener('click', () => {
        const kw = document.getElementById('user_query')?.value;
        if (!kw) return showNotification("Nhập từ khóa trước!", "warning");

        showNotification("Đang tạo gợi ý...", "info");
        setTimeout(() => {
            document.getElementById('articleTitle').value = `Top 5 điều cần biết về ${kw}`;
            showNotification("Đã gợi ý tiêu đề!", "success");
        }, 1000);
    });
}

function setupDraftSystem() {
    const saveBtn = document.getElementById('saveDraft');
    if (!saveBtn) return;
    saveBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const data = {
            query: document.getElementById('user_query')?.value,
            title: document.getElementById('articleTitle')?.value,
            type: document.getElementById('content_types')?.value,
            bot: document.getElementById('bots')?.value,
        };
        localStorage.setItem('articleDraft', JSON.stringify(data));
        showNotification("Đã lưu nhá p!", "success");
    });
}

function loadDraft() {
    const draft = localStorage.getItem('articleDraft');
    if (draft) {
        try {
            const d = JSON.parse(draft);
            if (d.query) document.getElementById('user_query').value = d.query;
            if (d.title) document.getElementById('articleTitle').value = d.title;
            showNotification("Đã khôi phục nháp.", "info");
        } catch (e) { }
    }
}


// ============================================
// 7. XỬ LÝ GENERATE (UPDATED WITH API PIPELINE)
// ============================================

const generateBtn = document.getElementById('generateBtn');
if (generateBtn) {
    generateBtn.addEventListener('click', async function (e) {
        e.preventDefault();
        console.log("🚀 Bắt đầu quy trình tạo bài...");

        // --- 1. LẤY DỮ LIỆU INPUT ---
        // Xác định nguồn (Internet hay Private)
        const activeTab = document.querySelector('.tab.active');
        const sourceType = activeTab && activeTab.dataset.tab === 'private' ? 'private' : 'internet';

        let primary_keyword = '', title = '', context = '';
        let secondary_keywords = [];

        // LẤY INPUT TỪ TAB "INTERNET"
        primary_keyword = document.getElementById('primaryKeyword')?.value?.trim() || '';

        let secondary_keywords_raw = document.getElementById('secondaryKeywords')?.value || '';
        secondary_keywords = secondary_keywords_raw
            .split(',')
            .map(item => item.trim())
            .filter(item => item !== '');  // loại bỏ chuỗi rỗng

        title = document.getElementById('articleTitle')?.value?.trim() || '';

        const content_type = document.getElementById('content_types')?.value;
        const bot = document.getElementById('bots')?.value;

        // Kiểm tra đầu vào
        if (!user_query) {
            alert('Vui lòng nhập từ khóa!');
            return;
        }

        if (!title) title = `Bài viết về ${user_query}`;

        // Hiển thị loading
        showLoading(true);

        try {
            // --- 2. GỌI API BƯỚC 1: TÌM KIẾM ---
            console.log("📡 Bước 1: Search News...");
            const newsResults = await searchNews(user_query, 10); // Tìm 10 bài
            if (!newsResults || newsResults.length === 0) throw new Error("Không tìm thấy tin tức.");

            // --- 3. GỌI API BƯỚC 2: CRAWL NỘI DUNG ---
            console.log("📡 Bước 2: Crawl Content...");
            const crawledArticles = await crawlArticles(newsResults);
            if (!crawledArticles || crawledArticles.length === 0) throw new Error("Không crawl được nội dung.");

            // --- 4. GỌI API BƯỚC 3: LỌC & TẠO DÀN Ý ---
            console.log("📡 Bước 3: Filter & Outline...");
            // Lấy tags nếu có
            // const tags = document.querySelectorAll('#tagContainer .tag');
            // const tagList = Array.from(tags).map(t => t.textContent.replace('×', '').trim());

            const outlineData = await filterNewsAndGenerateOutline(
                crawledArticles,
                user_query,
                tagList,
                title,
                5 // Lấy top 5 bài
            );

            if (!outlineData) throw new Error("Lỗi khi tạo dàn ý.");

            // --- 5. XỬ LÝ DỮ LIỆU TRƯỚC KHI LƯU (ĐÃ FIX LỖI TÌM KIẾM) ---
            console.log("🔄 Đang gộp dữ liệu nội dung...");

            let finalNewsList = [];
            const selectedList = outlineData.selected_news || [];

            // Hàm chuẩn hóa URL để so sánh chính xác hơn
            const normalizeUrl = (url) => {
                try {
                    return url.toLowerCase()
                        .split('?')[0]       // Bỏ tham số query
                        .split('#')[0]       // Bỏ anchor
                        .replace(/^https?:\/\//, '') // Bỏ http
                        .replace(/^www\./, '')       // Bỏ www
                        .replace(/\/$/, '');         // Bỏ trailing slash
                } catch (e) {
                    return url;
                }
            };


            // --- XỬ LÝ KẾT QUẢ DÀN Ý ---
            if (outlineData && outlineData.article_outline) {
                // 1. Ẩn loading và các placeholder cũ
                showLoading(false);
                document.querySelector('.video-placeholder').style.display = 'none';
                document.querySelector('.preview-text').style.display = 'none';

                // 2. Chuyển dữ liệu sang outline editor
                if (window.outlineEditor) {
                    window.outlineEditor.setOutlineData(outlineData);
                    window.outlineEditor.renderOutline();
                }

                // 3. Scroll tới kết quả
                const outlineResult = document.getElementById('outlineResult');
                if (outlineResult) outlineResult.scrollIntoView({ behavior: 'smooth' });

                // 4. Lưu pipeline data vào sessionStorage để dùng cho bước sau (Tạo bài viết)
                const sessionData = {
                    pipeline_results: pipelineData.filteredNews,
                    config: {
                        main_keyword: user_query,
                        secondary_keywords: tagList,
                        title: title,
                        type: content_type,
                        bot: bot,
                        context: context
                    }
                };

                sessionStorage.setItem('pipelineData', JSON.stringify(sessionData));
                console.log("✅ Đã lưu session data:", sessionData);

            } else {
                throw new Error("Dữ liệu dàn ý trả về không hợp lệ.");
            }

            // // Gọi AI để tạo nội dung (Step 3.5)
            // const article = await generateSEOContent(
            //     finalNewsList,
            //     {
            //         bot_id: bot,
            //         article_length: "500",
            //         tone: "Chuyên Nghiệp",
            //         article_type: content_type,
            //         language: "Tiếng Việt",
            //         custom_instructions: null
            //     },
            //     title,
            //     outlineData.article_outline,
            //     user_query,
            //     tagList // từ khoá phụ từ tags
            // );

            // if (article) {
            //     // Lưu cả dữ liệu pipeline và bài viết cuối cùng để trang sau
            //     const fullResult = { ...payload, finalArticle: article };
            //     try {
            //         sessionStorage.setItem('pipelineData', JSON.stringify(fullResult));
            //         console.log("✅ Đã lưu dữ liệu và bài viết thành công!");
            //         // Chuyển đến trang hiển thị bài viết
            //         window.location.href = 'article-view.php';
            //     } catch (storageError) {
            //         console.error("Lỗi bộ nhớ:", storageError);
            //         alert("Dữ liệu quá lớn! Vui lòng thử lại.");
            //     }
            // } else {
            //     // Không có bài viết được tạo ra – fallback to outline editor for user to edit outline
            //     try {
            //         sessionStorage.setItem('pipelineData', JSON.stringify(payload));
            //         console.log("✅ Đã lưu dữ liệu pipeline thành công (không có article). Redirecting to outline editor.");
            //         window.location.href = 'outline-editor.php';
            //     } catch (storageError) {
            //         console.error("Lỗi bộ nhớ:", storageError);
            //         alert("Dữ liệu quá lớn! Vui lòng thử lại.");
            //     }
            //     // Fallback: still save pipeline data and go to outline editor
            //     try {
            //         sessionStorage.setItem('pipelineData', JSON.stringify(payload));
            //         console.log("✅ Đã lưu dữ liệu pipeline thành công (không có article).");
            //         window.location.href = 'article-view.php';
            //     } catch (storageError) {
            //         console.error("Lỗi bộ nhớ:", storageError);
            //         alert("Dữ liệu quá lớn! Vui lòng thử lại.");
            //     }
            // }

        } catch (error) {
            console.error("❌ LỖI:", error);
            showNotification("Có lỗi xảy ra: " + error.message, "error");
        } finally {
            showLoading(false);
        }
    });
}


// Thêm thẻ vào phím Enter cho các từ khóa phụ
function addTagOnEnter(inputId, containerId) {
    const input = document.getElementById(inputId);
    const container = document.getElementById(containerId);
    if (!input || !container) return;
    input.addEventListener('keypress', function (e) {
        if (e.key === 'Enter' && input.value.trim()) {
            const tag = input.value.trim();
            // Tránh thẻ trùng
            const existing = Array.from(container.querySelectorAll('.tag')).map(t => t.textContent.replace('×', '').trim());
            if (!existing.includes(tag)) {
                const span = document.createElement('span');
                span.className = 'tag';
                span.innerHTML = `${tag} <span class="close-icon" onclick="this.parentElement.remove()">×</span>`;
                container.appendChild(span);
            }
            input.value = '';
        }
    });
}
// Áp dụng cho cả hai trường từ khóa phụ
addTagOnEnter('customData_secondaryKeyword', 'customData_tagContainer');
addTagOnEnter('secondaryKeyword', 'tagContainer');

// ============================================
// 8. KHỞI TẠO TRANG
// ============================================
async function initializePage() {
    // 1. Tải cấu hình API
    await loadConfigs();

    // 2. Tải dữ liệu đã lưu
    const savedFiles = localStorage.getItem(STORAGE_KEY);
    if (savedFiles) {
        try { selectedFiles = JSON.parse(savedFiles); } catch (e) { selectedFiles = []; }
    }

    // 3. Khởi tạo các tính năng giao diện  
    updateSubtabStates();
    initializeKeywordTags();
    initializeAiSuggest();
    setupDraftSystem();
    loadDraft();

    // Kích hoạt tab đầu tiên
    const firstSub = document.querySelector('.sub[data-sub="file"]');
    if (firstSub && !firstSub.classList.contains('locked')) {
        firstSub.click();
    } else {
        const acc = document.querySelector('.sub:not(.locked)');
        if (acc) acc.click();
    }

    // Cập nhật văn bản trước khi hiển thị
    const lenInput = document.getElementById('article_length');
    if (lenInput) {
        lenInput.addEventListener('input', () => {
            const prev = document.getElementById('previewLength');
            if (prev) prev.textContent = lenInput.value + ' từ';
        });
    }

    // Đếm số từ
    const contextTextarea = document.getElementById('private_context');
    if (contextTextarea) {
        contextTextarea.addEventListener('input', function () {
            const count = this.value.trim().split(/\s+/).filter(w => w.length > 0).length;
            const counterEl = this.parentElement.querySelector('.char-counter');
            if (counterEl) {
                counterEl.textContent = `${count}/300 từ`;
                counterEl.style.color = count > 300 ? 'red' : '#9CA3AF';
            }
        });
    }
    // ================================
    // MẶC ĐỊNH TAB: 🌐 NGUỒN INTERNET
    // ================================
    const internetTab = document.querySelector('.tab[data-tab="internet"]');
    const internetContent = document.getElementById('internet');

    if (internetTab && internetContent) {
        tabs.forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.content').forEach(c => c.classList.remove('active'));

        internetTab.classList.add('active');
        internetContent.classList.add('active');
    }

    // ⛔ KHÔNG DÁN SAU DÒNG NÀY
    showNotification('Hệ thống đã sẵn sàng!', 'info');
}

// --- Sidebar Toggle ---
function initializeSidebarToggle() {
    const toggleBtn = document.querySelector('.menu-toggle');
    const appContainer = document.querySelector('.app-container');

    if (toggleBtn && appContainer) {
        toggleBtn.addEventListener('click', () => {
            appContainer.classList.toggle('sidebar-collapsed');
        });
    }
}

// Chạy ứng dụng
// Chờ initializePage() làm xong mọi thứ
document.addEventListener('DOMContentLoaded', () => {
    initializePage();
    initializeSidebarToggle();
});

