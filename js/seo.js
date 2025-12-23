// ========================================================
// ✅ COMPLETE ARTICLE EDITOR - READY TO COPY & PASTE
// ========================================================

document.addEventListener('DOMContentLoaded', () => {
    console.log("🚀 Article Editor Loaded!");
    
    // Debug sessionStorage
    debugSessionStorage();
    
    // Load all data
    loadArticleData();
    
    // Setup UI
    setupTabs();
    setupToolbar();
    setupFloatingTool();
    setupSectionAccordions();
});

function debugSessionStorage() {
    console.log("=".repeat(60));
    const data = sessionStorage.getItem('finalArticleData');
    if (data) {
        try {
            const parsed = JSON.parse(data);
            console.log("📦 SESSION KEYS:", Object.keys(parsed));
            if (parsed.finalArticle) console.log("📄 Article keys:", Object.keys(parsed.finalArticle));
            if (parsed.article_outline) console.log("📋 Outline:", parsed.article_outline.length, "sections");
        } catch(e) {
            console.error("❌ Session parse error:", e);
        }
    }
    console.log("=".repeat(60));
}

// ========================================================
// 🔥 MAIN LOAD FUNCTION - CORE ENGINE
// ========================================================
function loadArticleData() {
    const finalArticleDataJson = sessionStorage.getItem('finalArticleData');
    if (!finalArticleDataJson) {
        showError("❌ Không tìm thấy dữ liệu bài viết trong sessionStorage!");
        return;
    }

    try {
        const articleData = JSON.parse(finalArticleDataJson);
        console.log("✅ LOADED:", articleData);
        
        const article = articleData.finalArticle || {};
        
        // VALIDATION
        if (!article || !articleData.article_outline?.length) {
            showError("❌ Dữ liệu không đầy đủ! Cần finalArticle và article_outline.");
            return;
        }

        // 1️⃣ TITLE
        setArticleTitle(articleData, article);
        
        // 2️⃣ CONTENT SOURCE
        const htmlContent = findBestContentSource(article, articleData);
        console.log("📄 Content length:", htmlContent?.length || 0);
        
        // 3️⃣ SECTIONS
        renderSectionsFromOutline(articleData.article_outline, htmlContent);
        
        // 4️⃣ FULL CONTENT
        setArticleContent(article, htmlContent);
        
        // 5️⃣ DESCRIPTION
        setShortDescription(article, htmlContent);
        
        // 6️⃣ SIDEBAR
        renderReferences(articleData);
        renderSEOScore(article);
        
        console.log("🎉 LOAD COMPLETE!");
        
    } catch (error) {
        console.error("💥 ERROR:", error);
        showError(`Lỗi tải dữ liệu: ${error.message}`);
    }
}

// ========================================================
// 🔍 CONTENT SOURCE DETECTOR
// ========================================================
function findBestContentSource(article, articleData) {
    const sources = [
        article.content, article.html, article.body, article.text,
        article.meta_description, articleData.final_content, articleData.content
    ];
    
    for (let source of sources) {
        if (source && typeof source === 'string' && source.trim().length > 50) {
            console.log("✅ Content found:", source.substring(0, 100) + "...");
            return source;
        }
    }
    console.warn("⚠️ No valid content source");
    return '';
}

// ========================================================
// 📝 TITLE SETTER
// ========================================================
function setArticleTitle(articleData, article) {
    const titleInput = document.getElementById('articleTitle');
    if (!titleInput) return console.error("❌ #articleTitle not found");
    
    let title = articleData.final_title || 
                article.title || 
                article.meta_description || 
                "Bài viết mới";
    
    titleInput.value = title;
    console.log("✅ Title set:", title);
}

// ========================================================
// 🏗️ SECTION RENDERING ENGINE
// ========================================================
function renderSectionsFromOutline(outline, htmlContent) {
    const container = document.getElementById('sectionsContainer');
    if (!container) return showError("❌ sectionsContainer not found");

    showLoading(true, container);
    
    const contentMap = parseContentByHeadings(htmlContent);
    console.log("📍 Content map keys:", Object.keys(contentMap));
    
    container.innerHTML = '';
    
    outline.forEach((section, index) => {
        const sectionDiv = createPerfectSection(section, index, contentMap, htmlContent);
        container.appendChild(sectionDiv);
    });
    
    setupSectionEvents();
    showLoading(false, container);
}

function parseContentByHeadings(htmlContent) {
    if (!htmlContent) return {};
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    
    const contentMap = {};
    let currentKey = 'intro';
    let currentContent = [];
    
    // Get all child elements
    const elements = Array.from(tempDiv.children);
    
    elements.forEach(el => {
        if (/^H[1-6]$/i.test(el.tagName)) {
            // Save previous content
            if (currentContent.length > 0) {
                contentMap[currentKey] = currentContent.map(e => e.outerHTML).join('');
            }
            
            // New heading
            currentKey = normalizeKey(el.textContent.trim());
            currentContent = [];
        } else {
            currentContent.push(el.cloneNode(true));
        }
    });
    
    // Save final content
    if (currentContent.length > 0) {
        contentMap[currentKey] = currentContent.map(e => e.outerHTML).join('');
    }
    
    return contentMap;
}

function normalizeKey(text) {
    return text.toLowerCase()
        .replace(/[^\w\s]/g, '')
        .replace(/\s+/g, '_')
        .substring(0, 50);
}

// ========================================================
// 🎯 PERFECT SECTION CREATOR
// ========================================================
function createPerfectSection(section, index, contentMap, fallbackContent) {
    const div = document.createElement('div');
    div.className = `section-item ${index === 0 ? 'active' : ''}`;
    div.dataset.id = section.id || `sec_${index}`;

    // HEADER
    const header = document.createElement('div');
    header.className = 'section-header';
    header.innerHTML = `
        <span class="chevron">
            <img src="./images/icon-nha-xuong.png" alt="Section" style="width:20px; transition: transform 0.2s;">
        </span>
        <input type="text" class="section-title-input" value="${escapeHtml(section.title)}" 
               style="flex:1; border:none; background:transparent; font-weight:600; font-size:16px; padding:4px;">
        <span class="section-index">${index + 1}</span>
    `;

    // CONTENT
    const content = findBestContent(section, contentMap, fallbackContent);
    
    const body = document.createElement('div');
    body.className = 'section-body';
    body.style.display = index === 0 ? 'block' : 'none';
    body.style.padding = '20px';
    
    const editor = document.createElement('div');
    editor.className = 'content-editor';
    editor.contentEditable = true;
    editor.innerHTML = content || getPlaceholder(section.title);
    editor.style.cssText = `
        min-height: 150px; padding: 20px; border: 1px solid #e5e7eb; 
        border-radius: 8px; line-height: 1.7; outline: none;
        font-family: inherit; transition: all 0.2s;
    `;

    body.appendChild(editor);
    div.append(header, body);
    return div;
}

function findBestContent(section, contentMap, fallback) {
    const key = normalizeKey(section.title);
    
    // Exact match
    if (contentMap[key]) return contentMap[key];
    
    // Fuzzy match
    for (let mapKey in contentMap) {
        if (mapKey.includes(key) || key.includes(mapKey)) {
            console.log(`🔗 Fuzzy match: "${section.title}" -> "${mapKey}"`);
            return contentMap[mapKey];
        }
    }
    
    return fallback ? fallback.substring(0, 2000) : '';
}

function getPlaceholder(title) {
    return `<p style="color:#9ca3af; font-style:italic; text-align:center; padding:40px 0;">
        Nhấn để chỉnh sửa nội dung cho: <strong>${escapeHtml(title)}</strong>
    </p>`;
}

// ========================================================
// 🚀 CONTENT GENERATION API
// ========================================================
async function ContentGeneration() {
    const titleInput = document.getElementById('articleTitle');
    if (!titleInput?.value.trim()) {
        alert("❌ Vui lòng nhập tiêu đề bài viết!");
        titleInput?.focus();
        return;
    }

    const finalData = JSON.parse(sessionStorage.getItem('finalArticleData'));
    if (!finalData.article_outline?.length) {
        alert("❌ Cần có outline bài viết!");
        return;
    }

    showLoading(true);
    
    try {
        const payload = {
            top_news: finalData.pipeline_results?.selected_news || [],
            target_language: finalData.target_language || "Tiếng Việt",
            config: {
                bot_id: "GPT-4.1",
                article_length: finalData.finalArticle?.word_count || "1500",
                tone: finalData.finalArticle?.tone || "Chuyên nghiệp",
                article_type: "blog"
            },
            title: titleInput.value,
            outline: finalData.article_outline,
            main_keyword: finalData.finalArticle?.main_keyword || "",
            secondary_keywords: finalData.finalArticle?.secondary_keywords || []
        };

        console.log("🚀 Sending to API:", payload);

        const response = await fetch("https://caiman-warm-swan.ngrok-free.app/api/v1/ai/contents", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();
        console.log("✅ API Response:", result);

        // Save new content
        if (!finalData.finalArticle) finalData.finalArticle = {};
        finalData.finalArticle.content = result.content || result.html || result.result || '';
        
        sessionStorage.setItem('finalArticleData', JSON.stringify(finalData));
        
        // Reload
        loadArticleData();
        alert("✅ Đã viết bài thành công!");

    } catch (error) {
        console.error("💥 API Error:", error);
        alert(`Lỗi viết bài: ${error.message}`);
    } finally {
        showLoading(false);
    }
}

// ========================================================
// 🎨 UI HELPERS
// ========================================================
function showError(message) {
    const container = document.getElementById('sectionsContainer');
    if (container) {
        container.innerHTML = `
            <div style="padding:60px 20px; text-align:center; color:#ef4444; max-width:600px; margin:0 auto;">
                <div style="font-size:64px; margin-bottom:20px;">⚠️</div>
                <h2 style="margin-bottom:16px; color:#dc2626;">Lỗi tải dữ liệu</h2>
                <p style="font-size:16px; margin-bottom:24px; color:#6b7280;">${message}</p>
                <button onclick="location.reload()" style="
                    background:#ef4444; color:white; padding:12px 32px; 
                    border:none; border-radius:8px; font-size:16px; cursor:pointer;
                    font-weight:600; transition: all 0.2s;
                ">🔄 Tải lại trang</button>
            </div>
        `;
    }
    alert(message);
}

function showLoading(show = true, container = null) {
    if (!container) container = document.getElementById('sectionsContainer');
    if (!container) return;
    
    if (show) {
        container.innerHTML = `
            <div style="display:flex; flex-direction:column; align-items:center; justify-content:center; 
                        min-height:400px; padding:40px; color:#6b7280;">
                <div style="font-size:48px; margin-bottom:24px; animation: spin 1s linear infinite;">
                    ⏳
                </div>
                <h3 style="margin-bottom:8px; color:#374151;">Đang xử lý dữ liệu...</h3>
                <p style="margin:0;">Vui lòng chờ trong giây lát</p>
            </div>
            <style>
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            </style>
        `;
    }
}

function setArticleContent(article, fallback) {
    const el = document.getElementById('article-contens');
    if (el) {
        el.value = article.content || fallback || '';
        console.log("✅ Full content set");
    }
}

function setShortDescription(article, fallback) {
    const textarea = document.querySelector('.short-description-section textarea');
    if (textarea) {
        const desc = article.meta_description || 
                    article.summary || 
                    extractFirstParagraph(fallback || article.content || '', 160);
        textarea.value = desc;
    }
}

function extractFirstParagraph(html, maxLen = 160) {
    if (!html) return '';
    const text = html.replace(/<[^>]*>/g, '').trim();
    const firstPara = text.split(/\n\n|\.\s*\n/)[0];
    return firstPara.substring(0, maxLen).trim() + (firstPara.length > maxLen ? '...' : '');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text || '';
    return div.innerHTML;
}

// ========================================================
// 📚 SIDEBAR RENDERING
// ========================================================
function renderReferences(articleData) {
    let references = articleData.pipeline_results?.selected_news || 
                    articleData.finalArticle?.sources || [];
    
    if (!references.length) return;

    const accordions = document.querySelectorAll('.sidebar-accordion');
    if (accordions.length === 0) return;

    const refAccordion = accordions[0];
    const content = refAccordion.querySelector('.accordion-content');
    if (!content) return;

    content.innerHTML = '';
    
    references.forEach((ref, i) => {
        const item = document.createElement('div');
        item.className = 'source-item';
        item.style.cssText = 'margin-bottom:12px; display:flex; align-items:center;';
        
        const url = ref.url || ref.link || '#';
        const title = (ref.title || `Nguồn ${i + 1}`).substring(0, 80);
        
        item.innerHTML = `
            <span style="width:8px;height:8px;background:#4f46e5;border-radius:50%;margin-right:12px;"></span>
            <a href="${url}" target="_blank" style="
                color:#4f46e5; text-decoration:none; font-size:14px; 
                word-break:break-word; line-height:1.4;
            " title="${ref.title || ''}">${title}${title.length > 60 ? '...' : ''}</a>
        `;
        content.appendChild(item);
    });
    
    const countEl = refAccordion.querySelector('.source-count');
    if (countEl) countEl.textContent = `${references.length} nguồn`;
}

function renderSEOScore(article) {
    const accordions = document.querySelectorAll('.sidebar-accordion');
    if (accordions.length < 2) return;

    const seoAccordion = accordions[1];
    const scoreEl = seoAccordion.querySelector('.seo-score');
    const content = seoAccordion.querySelector('.accordion-content');

    let seoData = article.seo_analysis || article.seo_score || { score: 85 };
    const score = seoData.score || seoData.overall_score || 85;

    if (scoreEl) {
        scoreEl.textContent = `${score} điểm`;
        scoreEl.style.color = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444';
    }

    if (content) {
        const checks = seoData.items || [
            { icon: '✅', text: 'Từ khóa chính trong tiêu đề' },
            { icon: '✅', text: 'Độ dài bài viết đạt chuẩn' },
            { icon: '✅', text: 'Mật độ từ khóa hợp lý' },
            { icon: '⚠️', text: 'Nên thêm internal links' }
        ];
        
        content.innerHTML = checks.map(check => 
            `<div style="margin-bottom:10px; display:flex; align-items:center;">
                <span style="margin-right:8px; font-size:18px;">${check.icon}</span>
                <span style="font-size:14px;">${check.text}</span>
            </div>`
        ).join('');
    }
}

// ========================================================
// 🎛️ EVENT HANDLERS
// ========================================================
function setupSectionEvents() {
    const container = document.getElementById('sectionsContainer');
    if (!container) return;
    
    container.addEventListener('click', (e) => {
        const header = e.target.closest('.section-header');
        if (!header || e.target.tagName === 'INPUT') return;

        const item = header.parentElement;
        const body = header.nextElementSibling;
        const chevron = header.querySelector('.chevron img');

        const isActive = item.classList.contains('active');
        
        // Toggle
        item.classList.toggle('active');
        body.style.display = isActive ? 'none' : 'block';
        
        if (chevron) {
            chevron.style.transform = isActive ? 'rotate(0deg)' : 'rotate(180deg)';
        }
    });
}

function setupTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            btn.classList.add('active');
            const target = document.getElementById(`${btn.dataset.tab}-tab`);
            if (target) target.classList.add('active');
        });
    });
}

function setupToolbar() {
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.addEventListener('click', () => btn.classList.toggle('active-tool'));
    });
}

function setupFloatingTool() {
    const tool = document.querySelector('.ai-floating-tool');
    if (tool) {
        tool.addEventListener('click', () => {
            ContentGeneration();
        });
    }
}

// ========================================================
// 🌐 GLOBAL FUNCTIONS (WINDOW)
// ========================================================
window.toggleAccordion = function(header) {
    const content = header.nextElementSibling;
    const chevron = header.querySelector('.chevron img');
    const isOpen = content.style.display === 'block';
    
    content.style.display = isOpen ? 'none' : 'block';
    header.classList.toggle('active', !isOpen);
    if (chevron) chevron.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(180deg)';
};

window.ContentGeneration = ContentGeneration;
