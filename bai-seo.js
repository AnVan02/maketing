document.addEventListener('DOMContentLoaded', () => {
    // Debug: Log sessionStorage
    const finalArticleDataJson = sessionStorage.getItem('finalArticleData');
    if (finalArticleDataJson) {
        const data = JSON.parse(finalArticleDataJson);
        console.log("📊 Dữ liệu từ sessionStorage:", data);
    }

    // Load Article Data
    loadArticleData();

    // Setup Event Listeners
    setupTabs();
    setupToolbar();
    setupFloatingTool();
    setupSectionAccordions();
    setupDebugTool();
    attachImageHandlers();
});

function setupDebugTool() {
    const headerRight = document.querySelector('.header-right');
    if (headerRight) {
        const debugBtn = document.createElement('button');
        debugBtn.innerHTML = "🔍 View Data";
        debugBtn.style.cssText = "background:#F3F4F6; border:1px solid #D1D5DB; padding:6px 12px; border-radius:6px; font-size:12px; cursor:pointer; margin-right:10px;";
        debugBtn.onclick = () => {
            const data = sessionStorage.getItem('finalArticleData');
            console.log("RAW DATA:", JSON.parse(data));
            alert("Đã log dữ liệu ra Console (F12).");
        };
        headerRight.prepend(debugBtn);
    }
}

function setupFloatingTool() {
    const tool = document.querySelector('.ai-floating-tool');
    if (tool) {
        tool.addEventListener('click', () => {
            alert("Tính năng AI Rewrite đang được kích hoạt!");
        });
    }
}

// ============================================================
// MAIN FUNCTION: LOAD ARTICLE DATA FROM API
// ============================================================
async function loadArticleData() {
    const container = document.getElementById('sectionsContainer');

    // Hiển thị loading
    if (container) {
        container.innerHTML = `
<div style="text-align: center; padding: 40px; color: #4F46E5;">
    <i class="fas fa-spinner fa-spin fa-2x"></i>
    <p style="margin-top: 10px;">Đang tải nội dung...</p>
</div>
`;
    }

    const finalArticleDataJson = sessionStorage.getItem('finalArticleData');
    if (!finalArticleDataJson) {
        console.warn("Không tìm thấy dữ liệu bài viết");
        if (container) {
            container.innerHTML = '<div class="no-data">Không có dữ liệu bài viết. Vui lòng tạo bài viết mới.</div>';
        }
        return;
    }

    try {
        const articleData = JSON.parse(finalArticleDataJson);
        console.log("📄 Dữ liệu bài viết đầy đủ:", articleData);

        // 1. Set Article Title
        setArticleTitle(articleData);

        // 2. Nếu có dữ liệu từ API, xử lý và render
        if (articleData.apiResponse) {
            await handleAPIResponse(articleData.apiResponse, articleData);
        } else {
            // Fallback: Render từ outline có sẵn
            renderFromOutlineAndContent(articleData);
        }

        // 3. Set các thông tin khác
        setArticleContent(articleData);
        setShortDescription(articleData);
        renderReferences(articleData);
        renderSEOScore(articleData);
        renderImages(articleData);

        // 4. Re-attach handlers
        attachImageHandlers();

        console.log("✅ Đã load xong tất cả dữ liệu!");

    } catch (error) {
        console.error("❌ Lỗi khi load dữ liệu:", error);
        if (container) {
            container.innerHTML = `<div class="error-message">Lỗi khi tải dữ liệu: ${error.message}</div>`;
        }
    }
}

// ============================================================
// HANDLE API RESPONSE (New function)
// ============================================================
async function handleAPIResponse(apiData, articleData) {
    const container = document.getElementById('sectionsContainer');
    if (!container) return;

    console.log("🔍 Xử lý dữ liệu từ API:", apiData);

    let content = '';

    // Tìm content từ nhiều nguồn có thể
    if (apiData.content) {
        content = apiData.content;
    } else if (apiData.result) {
        content = apiData.result;
    } else if (apiData.html) {
        content = apiData.html;
    } else if (typeof apiData === 'string') {
        content = apiData;
    }

    console.log("📝 Content từ API (length):", content.length);

    if (!content) {
        console.warn("⚠️ API không trả về content");
        renderFromOutlineAndContent(articleData);
        return;
    }

    // Parse content thành sections dựa trên heading
    const sections = parseContentIntoSections(content);

    // Render sections
    renderSections(sections, articleData);
}

// ============================================================
// PARSE CONTENT INTO SECTIONS (Improved)
// ============================================================
function parseContentIntoSections(content) {
    const sections = [];
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;

    let currentSection = null;
    let currentContent = [];

    // Lấy tất cả các node con
    const nodes = Array.from(tempDiv.childNodes);

    nodes.forEach(node => {
        if (node.nodeType === 1) { // Element node
            const tagName = node.tagName;

            // Nếu là heading
            if (tagName.match(/^H[1-6]$/)) {
                // Lưu section trước đó nếu có
                if (currentSection) {
                    currentSection.content = currentContent.join('');
                    sections.push(currentSection);
                    currentContent = [];
                }

                // Tạo section mới
                const level = parseInt(tagName.substring(1));
                const title = node.textContent.trim();

                currentSection = {
                    id: generateSectionId(title),
                    level: level,
                    title: title,
                    content: ''
                };
            } else {
                // Thêm vào content của section hiện tại
                if (currentSection) {
                    currentContent.push(node.outerHTML);
                } else {
                    // Nếu chưa có section (phần giới thiệu)
                    if (!sections.find(s => s.id === 'intro')) {
                        currentSection = {
                            id: 'intro',
                            level: 2,
                            title: 'Giới thiệu',
                            content: ''
                        };
                    }
                    currentContent.push(node.outerHTML);
                }
            }
        } else if (node.nodeType === 3 && node.textContent.trim()) { // Text node
            if (currentSection) {
                currentContent.push(node.textContent);
            }
        }
    });

    // Lưu section cuối cùng
    if (currentSection) {
        currentSection.content = currentContent.join('');
        sections.push(currentSection);
    }

    console.log("📋 Đã parse được sections:", sections);
    return sections;
}

// ============================================================
// RENDER SECTIONS (New function)
// ============================================================
function renderSections(sections, articleData) {
    const container = document.getElementById('sectionsContainer');
    if (!container) return;

    container.innerHTML = '';

    if (sections.length === 0) {
        container.innerHTML = '<div class="no-content">Không có nội dung để hiển thị</div>';
        return;
    }

    // Render từng section
    sections.forEach((section, index) => {
        const sectionDiv = createSectionElement(section, index, articleData);
        container.appendChild(sectionDiv);
    });

    // Setup accordion sau khi render
    setupSectionAccordions();
}

// ============================================================
// CREATE SECTION ELEMENT (Improved)
// ============================================================
function createSectionElement(section, index, articleData) {
    const sectionDiv = document.createElement('div');
    sectionDiv.className = 'section-item';
    sectionDiv.setAttribute('data-id', section.id || `section-${index}`);

    // Section header với chevron và input
    const sectionHeader = document.createElement('div');
    sectionHeader.className = 'section-header';
    sectionHeader.style.cssText = 'display: flex; align-items: center; padding: 15px; cursor: pointer; border-bottom: 1px solid #E5E7EB;';

    sectionHeader.innerHTML = `
<span class="chevron" style="margin-right: 15px; transition: transform 0.3s;">
    <img src="./images/icon-nha-xuong.png" alt="" style="width: 16px; height: 16px; transform: rotate(0deg);">
</span>
<input type="text"
    class="section-title-input"
    value="${escapeHtml(section.title)}"
    style="flex: 1; border: none; background: transparent; font-size: 16px; font-weight: 600; outline: none;"
    placeholder="Nhập tiêu đề section...">
`;

    // Section body với content editor
    const sectionBody = document.createElement('div');
    sectionBody.className = 'section-body';
    sectionBody.style.cssText = 'display: none; padding: 15px; background: #f9fafb;';

    const contentEditor = document.createElement('div');
    contentEditor.className = 'content-editor';
    contentEditor.contentEditable = true;
    contentEditor.style.cssText = 'min-height: 150px; padding: 15px; background: white; border: 1px solid #E5E7EB; border-radius: 8px; outline: none; line-height: 1.6;';

    // Set content cho editor
    contentEditor.innerHTML = section.content || `<p style="color: #9CA3AF;">Nhập nội dung cho ${escapeHtml(section.title)}...</p>`;

    sectionBody.appendChild(contentEditor);
    sectionDiv.appendChild(sectionHeader);
    sectionDiv.appendChild(sectionBody);

    // Mở section đầu tiên
    if (index === 0) {
        sectionDiv.classList.add('active');
        sectionBody.style.display = 'block';
        const chevronImg = sectionHeader.querySelector('.chevron img');
        if (chevronImg) chevronImg.style.transform = 'rotate(180deg)';
    }

    return sectionDiv;
}

// ============================================================
// RENDER FROM OUTLINE AND CONTENT (Fallback)
// ============================================================
function renderFromOutlineAndContent(articleData) {
    const container = document.getElementById('sectionsContainer');
    if (!container) return;

    const outline = articleData.article_outline || [];
    const content = articleData.finalArticle?.content || articleData.content || '';

    console.log("📋 Outline:", outline);
    console.log("📝 Content (length):", content.length);

    // Nếu có outline, render theo outline
    if (outline.length > 0) {
        renderOutlineSections(outline, content, articleData);
    } else if (content) {
        // Nếu chỉ có content, parse và render
        const sections = parseContentIntoSections(content);
        renderSections(sections, articleData);
    } else {
        container.innerHTML = '<div class="no-content">Không có nội dung để hiển thị</div>';
    }
}

// ============================================================
// RENDER OUTLINE SECTIONS
// ============================================================
function renderOutlineSections(outline, content, articleData) {
    const container = document.getElementById('sectionsContainer');
    if (!container) return;

    container.innerHTML = '';

    // Parse content thành map theo heading
    const contentMap = parseContentToMap(content);

    outline.forEach((section, index) => {
        // Tìm content cho section này
        let sectionContent = '';

        // Thử tìm content bằng exact match
        if (contentMap[section.title]) {
            sectionContent = contentMap[section.title];
        } else {
            // Fuzzy match
            const matchedKey = findMatchingKey(section.title, contentMap);
            if (matchedKey) {
                sectionContent = contentMap[matchedKey];
            }
        }

        // Nếu vẫn không có content, tạo placeholder
        if (!sectionContent && section.config?.word_count) {
            sectionContent = `<p>Phần này cần khoảng ${section.config.word_count} từ về chủ đề "${section.title}".</p>`;
        }

        const sectionDiv = createOutlineSectionElement(section, index, sectionContent, articleData);
        container.appendChild(sectionDiv);
    });
}

// ============================================================
// PARSE CONTENT TO MAP
// ============================================================
function parseContentToMap(content) {
    const map = {};
    if (!content) return map;

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;

    let currentKey = 'Giới thiệu';
    let currentContent = [];

    Array.from(tempDiv.children).forEach(child => {
        if (child.tagName.match(/^H[1-6]$/)) {
            // Lưu content trước đó
            if (currentContent.length > 0) {
                map[currentKey] = currentContent.join('');
                currentContent = [];
            }

            // Set key mới
            currentKey = child.textContent.trim();
        } else {
            currentContent.push(child.outerHTML);
        }
    });

    // Lưu content cuối cùng
    if (currentContent.length > 0) {
        map[currentKey] = currentContent.join('');
    }

    return map;
}

// ============================================================
// CREATE OUTLINE SECTION ELEMENT
// ============================================================
function createOutlineSectionElement(section, index, content, articleData) {
    const sectionDiv = document.createElement('div');
    sectionDiv.className = 'section-item';
    sectionDiv.setAttribute('data-id', section.id || `section-${index}`);

    // Section header
    const sectionHeader = document.createElement('div');
    sectionHeader.className = 'section-header';
    sectionHeader.style.cssText = 'display: flex; align-items: center; padding: 15px; cursor: pointer; border-bottom: 1px solid #E5E7EB;';

    const levelClass = `level-${section.level || 2}`;
    const paddingLeft = ((section.level || 2) - 1) * 20;

    sectionHeader.innerHTML = `
<span class="chevron" style="margin-right: 15px; transition: transform 0.3s;">
    <img src="./images/icon-nha-xuong.png" alt="" style="width: 16px; height: 16px; transform: rotate(0deg);">
</span>
<span class="section-level-indicator" style="margin-right: 10px; color: #6B7280; font-size: 12px;">
    H${section.level || 2}
</span>
<input type="text"
    class="section-title-input ${levelClass}"
    value="${escapeHtml(section.title)}"
    style="flex: 1; border: none; background: transparent; font-size: ${section.level === 1 ? '18px' : '16px'}; font-weight: ${section.level === 1 ? '700' : '600'}; outline: none; padding-left: ${paddingLeft}px;"
    placeholder="Nhập tiêu đề section...">
`;

    // Section body
    const sectionBody = document.createElement('div');
    sectionBody.className = 'section-body';
    sectionBody.style.cssText = 'display: none; padding: 15px; background: #f9fafb;';

    const contentEditor = document.createElement('div');
    contentEditor.className = 'content-editor';
    contentEditor.contentEditable = true;
    contentEditor.style.cssText = 'min-height: 150px; padding: 15px; background: white; border: 1px solid #E5E7EB; border-radius: 8px; outline: none; line-height: 1.6;';

    // Hiển thị thông tin config nếu có
    let configInfo = '';
    if (section.config) {
        configInfo = `
<div style="background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 10px; margin-bottom: 15px; font-size: 13px; color: #1e40af;">
    <strong>📋 Yêu cầu viết:</strong><br>
    ${section.config.word_count ? `• Số từ: ${section.config.word_count}<br>` : ''}
    ${section.config.keywords ? `• Từ khóa: ${section.config.keywords.join(', ')}<br>` : ''}
    ${section.config.tone ? `• Giọng văn: ${section.config.tone}<br>` : ''}
    ${section.config.internal_link ? `• Link nội bộ: ${section.config.internal_link}` : ''}
</div>
`;
    }

    contentEditor.innerHTML = configInfo + (content || `<p style="color: #9CA3AF;">Nhập nội dung cho ${escapeHtml(section.title)}...</p>`);

    sectionBody.appendChild(contentEditor);
    sectionDiv.appendChild(sectionHeader);
    sectionDiv.appendChild(sectionBody);

    // Mở section đầu tiên
    if (index === 0) {
        sectionDiv.classList.add('active');
        sectionBody.style.display = 'block';
        const chevronImg = sectionHeader.querySelector('.chevron img');
        if (chevronImg) chevronImg.style.transform = 'rotate(180deg)';
    }

    return sectionDiv;
}

// ============================================================
// CONTENT GENERATION FUNCTION (Fixed)
// ============================================================
async function ContentGeneration() {
    const finalArticleDataJson = sessionStorage.getItem('finalArticleData');
    if (!finalArticleDataJson) {
        alert("Không tìm thấy dữ liệu bài viết!");
        return;
    }

    try {
        const articleData = JSON.parse(finalArticleDataJson);
        const article = articleData.finalArticle || {};
        const titleInput = document.getElementById('articleTitle');

        // 1. Chuẩn bị Top News
        const sources = articleData.pipeline_results?.selected_news || articleData.top_news || [];
        const topNewsPayload = sources.map((news, index) => ({
            rank: index + 1,
            title: news.title || "No Title",
            url: news.url || news.link || "",
            images: news.images || [],
            content_preview: news.content_preview || news.snippet || ""
        }));

        // 2. Chuẩn bị Outline
        const outlinePayload = (articleData.article_outline || []).map((item, index) => ({
            id: item.id || `h${item.level || 2}-${index}`,
            level: parseInt(item.level) || 2,
            title: item.title || "",
            order: index + 1,
            config: item.config || null
        }));

        // 3. Xây dựng Payload
        const payload = {
            top_news: topNewsPayload,
            target_language: articleData.target_language || "Tiếng Việt",
            config: {
                bot_id: "GPT-4.1",
                article_length: article.word_count ? String(article.word_count) : "1500",
                tone: article.tone || "Chuyên nghiệp",
                article_type: "blog",
                custome_instructions: articleData.custome_instructions || null
            },
            title: titleInput ? titleInput.value : (article.title || "Tiêu đề chưa đặt"),
            outline: outlinePayload,
            main_keyword: articleData.main_keyword || article.main_keyword || "",
            secondary_keywords: articleData.secondary_keywords || article.secondary_keywords || []
        };

        console.log("🚀 ĐANG GỬI REQUEST:", payload);

        // Hiển thị loading
        const container = document.getElementById('sectionsContainer');
        if (container) {
            container.innerHTML = `
<div style="text-align: center; padding: 50px; color: #4F46E5; background: #f9fafb; border-radius: 12px; margin: 20px;">
    <i class="fas fa-spinner fa-spin fa-3x"></i>
    <p style="margin-top: 20px; font-size: 16px; font-weight: 600;">AI đang viết bài...</p>
    <p style="color: #6B7280; font-size: 13px;">Quá trình này có thể mất 30-60 giây.</p>
</div>
`;
        }

        const response = await fetch("https://caiman-warm-swan.ngrok-free.app/api/v1/ai/contents", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error(`Lỗi server: ${response.status}`);

        const data = await response.json();
        console.log("✅ KẾT QUẢ API:", data);

        // Lưu response vào articleData
        articleData.apiResponse = data;
        sessionStorage.setItem('finalArticleData', JSON.stringify(articleData));

        // Render lại với dữ liệu mới
        await loadArticleData();

        alert("✅ Đã viết bài thành công!");

    } catch (error) {
        console.error("❌ Lỗi ContentGeneration:", error);
        alert("Lỗi khi viết bài: " + error.message);

        // Nếu lỗi, load lại dữ liệu cũ
        loadArticleData();
    }
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================
function setArticleTitle(articleData) {
    const titleInput = document.getElementById('articleTitle');
    if (!titleInput) return;

    let title = '';
    if (articleData.final_title) {
        title = articleData.final_title;
    } else if (articleData.finalArticle?.title) {
        title = articleData.finalArticle.title;
    } else if (articleData.title) {
        title = articleData.title;
    }

    if (title) {
        titleInput.value = title;
        console.log("✅ Đã set tiêu đề:", title);
    }
}

function setArticleContent(articleData) {
    const contentInput = document.getElementById('article-contens');
    if (!contentInput) return;

    const content = articleData.finalArticle?.content || articleData.content || '';
    if (content) {
        contentInput.value = content;
    }
}

function setShortDescription(articleData) {
    const textarea = document.querySelector('.short-description-section textarea');
    if (!textarea) return;

    let description = '';
    if (articleData.finalArticle?.meta_description) {
        description = articleData.finalArticle.meta_description;
    } else if (articleData.meta_description) {
        description = articleData.meta_description;
    }

    if (description) {
        textarea.value = description;
    }
}

function renderReferences(articleData) {
    // ... (giữ nguyên như cũ)
}

function renderSEOScore(articleData) {
    // ... (giữ nguyên như cũ)
}

function renderImages(articleData) {
    // ... (giữ nguyên như cũ)
}

function setupSectionAccordions() {
    const container = document.getElementById('sectionsContainer');
    if (!container) return;

    container.addEventListener('click', (e) => {
        const header = e.target.closest('.section-header');
        if (!header || e.target.tagName === 'INPUT') return;

        const item = header.parentElement;
        const body = header.nextElementSibling;
        const chevron = header.querySelector('.chevron img');

        const isActive = item.classList.contains('active');
        item.classList.toggle('active');

        if (body) {
            body.style.display = isActive ? 'none' : 'block';
        }
        if (chevron) {
            chevron.style.transform = isActive ? 'rotate(0deg)' : 'rotate(180deg)';
        }
    });
}

function setupTabs() {
    // ... (giữ nguyên như cũ)
}

function setupToolbar() {
    // ... (giữ nguyên như cũ)
}

function generateSectionId(title) {
    return title.toLowerCase()
        .replace(/[^\w\s]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 50);
}

function findMatchingKey(sectionTitle, contentMap) {
    const normalize = s => s.toLowerCase().replace(/[^\w\s]/g, '').trim();
    const targetNorm = normalize(sectionTitle);

    for (const key in contentMap) {
        const keyNorm = normalize(key);
        if (keyNorm.includes(targetNorm) || targetNorm.includes(keyNorm)) {
            return key;
        }
    }

    return null;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============================================================
// IMAGE HANDLERS (giữ nguyên)
// ============================================================
function attachImageHandlers() {
    // ... (giữ nguyên như cũ)
}