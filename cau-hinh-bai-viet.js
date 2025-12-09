// ============================================
// 1. BIẾN TOÀN CỤC VÀ CẤU HÌNH
// ============================================
const API_BASE_URL = 'http://172.16.1.78:8080/api/v1';

// API endpoints theo demo
const API_ENDPOINTS = {
    crawl_news: '/crawl/news',
    crawl_crawl: '/crawl/crawl',
    ai_news_filtering: '/ai/news-filterings',
    ai_contents: '/ai/contents',
    ui_configs: '/ui/configs',
    ui_generate: '/ui/generate'
};

// DOM Elements chính
const tabs = document.querySelectorAll(".tab");
const subButtons = document.querySelectorAll("#private .sub");
const fileSelector = document.getElementById("file-selector");
const outsideFileListContainer = document.querySelector(".uploaded-file-list-outside");
const subtabContentArea = document.getElementById("subtab-content-area");

// Storage Keys
const STORAGE_KEY = 'uploadedFilesData';
const MAX_STEP_KEY = 'maxCompletedStep';

// Trạng thái ứng dụng
let maxCompletedStep = parseInt(localStorage.getItem(MAX_STEP_KEY)) || 0;
let selectedFiles = [];
let tempTextContent = localStorage.getItem('tempTextContent') || "";
let tempLinkContent = localStorage.getItem('tempLinkContent') || "";
let productLinks = JSON.parse(localStorage.getItem('productLinks')) || [];
let crawledArticles = [];
let filteredOutline = null;

// Ánh xạ bước thực hiện
const stepMap = { 'file': 0, 'text': 1, 'link': 2 };

// ============================================
// 2. HÀM GỌI API HỆ THỐNG
// ============================================

async function loadConfigs() {
    console.log("🚀 Đang tải cấu hình hệ thống...");
    const selectIds = ['content_types', 'writing_tones', 'languages', 'bots'];

    selectIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = '<option value="">Đang tải dữ liệu...</option>';
    });

    try {
        const res = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ui_configs}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "ngrok-skip-browser-warning": "true"
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
// 3. HÀM TIỆN ÍCH CHUNG
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

function showLoading(show, message = "Đang xử lý...") {
    const loading = document.getElementById('loading');
    const generateBtn = document.getElementById('generateBtn');
    const videoPlaceholder = document.querySelector('.video-placeholder');
    const previewText = document.querySelector('.preview-text');

    if (loading) {
        loading.style.display = show ? 'block' : 'none';
        if (videoPlaceholder) videoPlaceholder.style.display = show ? 'none' : 'block';
        if (previewText) previewText.style.display = show ? 'none' : 'block';
    }

    if (generateBtn) {
        generateBtn.disabled = show;
        generateBtn.innerHTML = show ?
            `<span class="edit-icon">⏳</span> ${message}` :
            `<span class="edit-icon">📝</span> Tạo dàn ý bài viết <span style="margin-left: 5px;">→</span>`;
    }
}

function saveState() {
    localStorage.setItem(MAX_STEP_KEY, maxCompletedStep);
    localStorage.setItem('tempTextContent', tempTextContent);
    localStorage.setItem('tempLinkContent', tempLinkContent);
    localStorage.setItem('productLinks', JSON.stringify(productLinks));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedFiles));
    localStorage.setItem('crawledArticles', JSON.stringify(crawledArticles));
    localStorage.setItem('filteredOutline', JSON.stringify(filteredOutline));
}

function readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// ============================================
// 4. PHẦN XỬ LÝ TAB TUẦN TỰ (FILE - TEXT - LINK)
// ============================================

async function processFiles(files) {
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
        const icon = file.type.includes("pdf") ? '📄' : '📁';
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

function setupSubtabContent(sub) {
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

    if (sub === "text") {
        const isReadonly = maxCompletedStep > 1;
        subtabContentArea.innerHTML = `
            <div class="text-editor-container">
                <div class="editor-toolbar">
                    <select class="font-select" onchange="document.execCommand('fontName',false,this.value)" ${isReadonly ? 'disabled' : ''}>
                        <option value="Arial">Arial</option>
                        <option value="Times New Roman">Times New Roman</option>
                        <option value="Montserrat">Montserrat</option>
                    </select>
                    <select onchange="document.execCommand('fontSize',false,this.value)" ${isReadonly ? 'disabled' : ''} style="width:60px">
                        <option value="3">Size</option><option value="1">1</option><option value="2">2</option>
                        <option value="4">4</option><option value="5">5</option><option value="6">6</option>
                    </select>

                    <div class="divider"></div>

                    <button class="toolbar-btn" onclick="document.execCommand('bold')" title="Đậm" ${isReadonly ? 'disabled' : ''}><b>B</b></button>
                    <button class="toolbar-btn" onclick="document.execCommand('italic')" title="Nghiêng" ${isReadonly ? 'disabled' : ''}><i>I</i></button>
                    <button class="toolbar-btn" onclick="document.execCommand('underline')" title="Gạch chân" ${isReadonly ? 'disabled' : ''}><u>U</u></button>
                    
                    <div class="divider"></div>

                    <button class="toolbar-btn" onclick="document.execCommand('formatBlock',false,'h2')" ${isReadonly ? 'disabled' : ''}>H2</button>
                    <button class="toolbar-btn" onclick="document.execCommand('formatBlock',false,'h3')" ${isReadonly ? 'disabled' : ''}>H3</button>
                    
                    <div class="divider"></div>

                    <button class="toolbar-btn" onclick="document.execCommand('justifyLeft')" ${isReadonly ? 'disabled' : ''}>Left</button>
                    <button class="toolbar-btn" onclick="document.execCommand('justifyCenter')" ${isReadonly ? 'disabled' : ''}>Center</button>
                    <button class="toolbar-btn" onclick="document.execCommand('justifyRight')" ${isReadonly ? 'disabled' : ''}>Right</button>

                    <input type="color" onchange="document.execCommand('foreColor',false,this.value)" title="Màu chữ" ${isReadonly ? 'disabled' : ''}>
                </div>

                <div class="editor-content" id="editor" contenteditable="${!isReadonly}" 
                     placeholder="Nhập nội dung bổ sung hoặc dàn ý tại đây...">
                     ${tempTextContent}
                </div>
                ${isReadonly ? '<div class="step-status-lock">🔒 Bước này đã hoàn thành.</div>' : ''}
            </div>
        `;

        const editor = document.getElementById('editor');
        if (!isReadonly && editor) {
            editor.addEventListener('input', (e) => {
                tempTextContent = e.target.innerHTML;
                saveState();
                if (tempTextContent.length > 10 && maxCompletedStep < 2) {
                    maxCompletedStep = 2;
                    saveState();
                    updateSubtabStates();
                }
            });
        }
    } else if (sub === "link") {
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
// 5. TÍNH NĂNG BỔ SUNG
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

    window.addKeywordTag = addTag;
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
        showNotification("Đã lưu nháp!", "success");
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
// 6. CÁC API THEO DEMO
// ============================================

async function crawlNewsFromInternet(query, maxResults = 5) {
    try {
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.crawl_news}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                query: query,
                max_results: maxResults
            })
        });

        if (!response.ok) throw new Error(`API Error: ${response.status}`);
        const data = await response.json();
        if (data.success && data.results) {
            crawledArticles = data.results;
            saveState();
            return data.results;
        }
        return [];
    } catch (error) {
        console.error("❌ Lỗi crawl news:", error);
        showNotification("Không thể crawl tin tức từ internet", "error");
        return [];
    }
}

async function crawlArticleDetails(articles) {
    try {
        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.crawl_crawl}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ articles: articles })
        });

        if (!response.ok) throw new Error(`API Error: ${response.status}`);
        const data = await response.json();
        return data.articles || [];
    } catch (error) {
        console.error("❌ Lỗi crawl chi tiết:", error);
        return articles;
    }
}

async function filterNewsAndGenerateOutline(articles, mainKeyword, title) {
    try {
        const secondaryKeywords = Array.from(document.querySelectorAll('.active .tag'))
            .map(t => t.textContent.replace('×', '').trim());

        const payload = {
            articles: articles,
            main_keyword: mainKeyword,
            secondary_keywords: secondaryKeywords,
            article_title: title || `Bài viết về ${mainKeyword}`,
            top_k: 3
        };

        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ai_news_filtering}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error(`API Error: ${response.status}`);
        const data = await response.json();
        filteredOutline = data;
        saveState();
        return data;
    } catch (error) {
        console.error("❌ Lỗi filter news:", error);
        showNotification("Không thể tạo dàn ý từ tin tức", "error");
        return null;
    }
}

async function generateContentFromOutline(outlineData, config) {
    try {
        const secondaryKeywords = Array.from(document.querySelectorAll('.active .tag'))
            .map(t => t.textContent.replace('×', '').trim());

        const payload = {
            top_news: crawledArticles.slice(0, 2).map(article => ({
                rank: 1,
                title: article.title,
                url: article.url,
                images: [],
                content_preview: article.snippet || article.content_preview || ""
            })),
            target_language: config.lang || "Tiếng Việt",
            config: {
                bot_id: config.bot || "GPT-4.1",
                article_length: config.len || "500",
                tone: config.tone || "Chuyên nghiệp",
                article_type: config.type || "blog",
                custome_instructions: null
            },
            title: config.title || `Bài viết về ${config.main_keyword}`,
            outline: outlineData.outline || [],
            main_keyword: config.main_keyword || "",
            secondary_keywords: secondaryKeywords
        };

        console.log("📤 Sending content generation payload:", payload);

        const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ai_contents}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error(`API Error: ${response.status}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("❌ Lỗi generate content:", error);
        showNotification("Không thể tạo nội dung từ dàn ý", "error");
        return null;
    }
}

// ============================================
// 7. HÀM GENERATE CHÍNH
// ============================================

// Character Counter
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

// Main Generate Function
const generateBtn = document.getElementById('generateBtn');
if (generateBtn) {
    generateBtn.addEventListener('click', async function (e) {
        e.preventDefault();

        // 1. Xác định nguồn dữ liệu
        const activeTab = document.querySelector('.tab.active');
        const sourceType = activeTab && activeTab.dataset.tab === 'private' ? 'private' : 'internet';

        // 2. Lấy dữ liệu Input
        let user_query = '', title = '', context = '', website = '';

        if (sourceType === 'internet') {
            user_query = document.getElementById('internet_user_query')?.value.trim();
            title = document.getElementById('articleTitle_internet')?.value.trim();
            context = document.getElementById('internet_context')?.value.trim();
            website = document.getElementById('user_website')?.value.trim();
        } else {
            user_query = document.getElementById('user_query')?.value.trim();
            title = document.getElementById('articleTitle')?.value.trim();
            context = document.getElementById('private_context')?.value.trim();
            website = document.getElementById('user_website')?.value.trim();
        }

        // Common Configs
        const content_type = document.getElementById('content_types')?.value;
        const writing_tone = document.getElementById('writing_tones')?.value;
        const language = document.getElementById('languages')?.value;
        const bot = document.getElementById('bots')?.value;
        const article_length = document.getElementById('article_length')?.value;

        // 3. Validate
        if (!user_query) {
            showNotification('Vui lòng nhập từ khóa chính!', 'warning');
            return;
        }

        if (!content_type || !bot) {
            showNotification('Vui lòng chọn Loại bài và AI Model!', 'warning');
            return;
        }

        // 4. Show loading
        showLoading(true, "Đang xử lý...");

        try {
            let finalResult = null;

            if (sourceType === 'internet') {
                // Bước 1: Crawl news
                showLoading(true, "Đang tìm kiếm tin tức...");
                const crawledNews = await crawlNewsFromInternet(user_query, 5);

                if (crawledNews.length === 0) {
                    showNotification("Không tìm thấy tin tức nào cho từ khóa này", "warning");
                    showLoading(false);
                    return;
                }

                // Bước 2: Crawl chi tiết bài viết
                showLoading(true, "Đang thu thập chi tiết bài viết...");
                const detailedArticles = await crawlArticleDetails(crawledNews.slice(0, 2));

                // Bước 3: Filter và tạo outline
                showLoading(true, "Đang tạo dàn ý bài viết...");
                const outlineResult = await filterNewsAndGenerateOutline(
                    detailedArticles,
                    user_query,
                    title
                );

                if (!outlineResult) {
                    showLoading(false);
                    return;
                }

                // Bước 4: Generate content từ outline
                showLoading(true, "Đang viết bài...");
                const config = {
                    title: title,
                    type: content_type,
                    tone: writing_tone,
                    lang: language,
                    bot: bot,
                    len: article_length,
                    main_keyword: user_query,
                    context: context,
                    website: website
                };

                finalResult = await generateContentFromOutline(outlineResult, config);

            } else {
                // QUY TRÌNH CHO NGUỒN PRIVATE
                showLoading(true, "Đang xử lý dữ liệu nội bộ...");

                const payload = {
                    user_query: user_query,
                    source_type: 'private',
                    config: {
                        title: title,
                        type: content_type,
                        tone: writing_tone,
                        lang: language,
                        bot: bot,
                        len: article_length,
                        context: context,
                        website: website
                    },
                    private_data: {
                        files: selectedFiles,
                        text: tempTextContent,
                        links: productLinks
                    }
                };

                console.log("📤 Sending private data payload:", payload);

                const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ui_generate}`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "ngrok-skip-browser-warning": "true"
                    },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) throw new Error(`API Error: ${response.status}`);
                const data = await response.json();
                finalResult = data;
            }

            // 5. Save result and redirect
            if (finalResult) {
                sessionStorage.setItem('apiResult', JSON.stringify(finalResult));
                sessionStorage.setItem('generationSource', sourceType);

                showNotification("✅ Tạo bài viết thành công!", "success");

                setTimeout(() => {
                    if (typeof window.redirectToThinkingPage === 'function') {
                        window.redirectToThinkingPage();
                    } else {
                        window.location.href = 'thinking.php';
                    }
                }, 1000);
            } else {
                showLoading(false);
                showNotification("Không thể tạo bài viết. Vui lòng thử lại!", "error");
            }

        } catch (error) {
            console.error("❌ Generate Error:", error);
            showLoading(false);
            showNotification(`Lỗi: ${error.message}`, "error");
        }
    });
}

// ============================================
// 8. KHỞI TẠO TRANG
// ============================================
async function initializePage() {
    // 1. Load API Configs
    await loadConfigs();

    // 2. Load Saved Data
    const savedFiles = localStorage.getItem(STORAGE_KEY);
    if (savedFiles) {
        try { selectedFiles = JSON.parse(savedFiles); } catch (e) { selectedFiles = []; }
    }

    const savedCrawled = localStorage.getItem('crawledArticles');
    if (savedCrawled) {
        try { crawledArticles = JSON.parse(savedCrawled); } catch (e) { crawledArticles = []; }
    }

    const savedOutline = localStorage.getItem('filteredOutline');
    if (savedOutline) {
        try { filteredOutline = JSON.parse(savedOutline); } catch (e) { filteredOutline = null; }
    }

    // 3. Init UI Features
    updateSubtabStates();
    initializeKeywordTags();
    initializeAiSuggest();
    setupDraftSystem();
    loadDraft();

    // 4. Kích hoạt tab đầu tiên
    const firstSub = document.querySelector('.sub[data-sub="file"]');
    if (firstSub && !firstSub.classList.contains('locked')) {
        firstSub.click();
    } else {
        const acc = document.querySelector('.sub:not(.locked)');
        if (acc) acc.click();
    }

    // 5. Preview Text Update
    const lenInput = document.getElementById('article_length');
    if (lenInput) {
        lenInput.addEventListener('input', () => {
            const prev = document.getElementById('previewLength');
            if (prev) prev.textContent = lenInput.value + ' từ';
        });
    }

    showNotification('Hệ thống đã sẵn sàng!', 'info');
}

// Sidebar Toggle
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
document.addEventListener('DOMContentLoaded', () => {
    initializePage();
    initializeSidebarToggle();
});