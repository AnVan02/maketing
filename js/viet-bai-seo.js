document.addEventListener('DOMContentLoaded', () => {
    // Debug: Log sessionStorage
    const finalArticleDataJson = sessionStorage.getItem('finalArticleData');
    if (finalArticleDataJson) {
        const data = JSON.parse(finalArticleDataJson);
        if (data.finalArticle) {
            console.log(" Keys in finalArticle:", Object.keys(data.finalArticle));
        }
        if (data.article_outline) {
            console.log(" article_outline:", data.article_outline);
        }
    }
    console.log("=".repeat(50));

    // Load Article Data
    loadArticleData();

    // Setup Event Listeners
    setupTabs();
    setupToolbar();
    setupFloatingTool();
    setupSectionAccordions();
    setupDebugTool(); // Add debug button to UI
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
            alert("Đã log dữ liệu ra Console (F12). Click OK để xem JSON tóm tắt.");
            alert(data ? data.substring(0, 2000) + "..." : "Không có dữ liệu!");
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
function loadArticleData() {
    const finalArticleDataJson = sessionStorage.getItem('finalArticleData');
    if (!finalArticleDataJson) {
        console.warn("Không tìm thấy dữ liệu bài viết trong sessionStorage");
        console.log("Các keys có trong sessionStorage:", Object.keys(sessionStorage));
        return;
    }

    try {
        const articleData = JSON.parse(finalArticleDataJson);
        console.log("📄 Dữ liệu bài viết đầy đủ:", articleData);
        console.log("🔍 Keys trong articleData:", Object.keys(articleData));

        const article = (typeof articleData.finalArticle === 'string')
            ? { content: articleData.finalArticle }
            : (articleData.finalArticle || {});

        // 2. Find HTML content from multiple sources
        const htmlContent = article.content ||
            article.html ||
            article.result ||
            article.text ||
            article.text_content ||
            article.body ||
            article.article_content ||
            article.full_content ||
            article.html_content ||
            article.meta_description ||
            articleData.final_content ||
            articleData.content ||
            articleData.article?.content ||
            articleData.article?.html ||
            articleData.result ||
            articleData.text_content || '';

        const sourceKey = getContentSource(article, articleData);
        console.log("📄 Nguồn content dự kiến:", sourceKey);
        console.log("📄 HTML Content tìm được (length):", htmlContent ? htmlContent.length : 0);

        if (!htmlContent) {
            console.warn("⚠️ Không tìm thấy nội dung bài viết qua các key thông thường.");
        }

        // 1. Set Article Title
        setArticleTitle(articleData, article);

        // 3. Render Article Sections
        let finalSource = htmlContent;

        if (!finalSource || finalSource.length < 250) {
            console.log("🔍 Đang tìm kiếm nội dung sâu hơn trong articleData...");
            const longestResult = findLongestStringWithKey(articleData);
            if (longestResult.content && longestResult.content.length > (finalSource ? finalSource.length : 0)) {
                console.log(`✨ Đã tìm thấy nội dung tốt hơn tại: "${longestResult.path}" (Length: ${longestResult.content.length})`);
                finalSource = longestResult.content;
            } else if (!finalSource) {
                console.warn("⚠️ Không tìm thấy nội dung nào đáng kể.");
            }
        }

        // LAST RESORT: Try to recompose from sources (selected_news)
        if (!finalSource || finalSource.length < 200) {
            console.warn("⚠️ Vẫn chưa có nội dung, thử dùng dữ liệu từ nguồn (Selected News)...");
            const sources = articleData.pipeline_results?.selected_news || articleData.top_news || [];
            if (sources.length > 0) {
                finalSource = "<h2>Thông tin tổng hợp từ nguồn</h2>" +
                    sources.map(s => `<h3>${s.title}</h3><p>${s.content_preview || s.snippet || s.anchor || "Không có đoạn trích"}</p>`).join('\n');
            }
        }

        if (articleData.article_outline && articleData.article_outline.length > 0) {
            console.log("📋 Rendering from Outline using source length:", finalSource ? finalSource.length : 0);
            renderSectionsFromOutline(articleData.article_outline, finalSource, articleData);
        } else if (finalSource) {
            console.log("📋 Rendering raw content (No Outline)");
            renderArticleSections(finalSource);
        } else {
            console.error("❌ ABSOLUTELY NO CONTENT FOUND!");
            const container = document.getElementById('sectionsContainer');
            if (container) container.innerHTML = `<div style="padding:20px; color:#991b1b; background:#fef2f2; border:1px solid #fee2e2; border-radius:8px;">
                <b>Lỗi:</b> Không tìm thấy nội dung bài viết. Hãy thử nhấn "Viết bài" để tạo lại.
            </div>`;
        }

        // 4. Set Article Content
        setArticleContent(article);

        // 5. Set Short Description
        setShortDescription(article);

        // 6. Render References
        renderReferences(articleData);

        // 7. Render SEO Score
        renderSEOScore(article);

        // 8. Render Images
        renderImages(articleData);

        console.log("✅ Đã load xong tất cả dữ liệu từ API!");

    } catch (error) {
        console.error("❌ Lỗi khi parse dữ liệu:", error);
        alert("Lỗi khi tải dữ liệu bài viết: " + error.message);
    }
}

// ============================================================
// SET ARTICLE TITLE (Fixed priority)
// ============================================================
function setArticleTitle(articleData, article) {
    const titleInput = document.getElementById('articleTitle');
    if (!titleInput) {
        console.error("❌ Không tìm thấy input#articleTitle trong DOM!");
        return;
    }

    console.log("🔍 Đang set tiêu đề bài viết...");

    // ✅ Fixed priority: final_title > title > meta_description
    let title = '';
    if (articleData.final_title) {
        title = articleData.final_title;
        console.log("📝 Lấy title từ articleData.final_title:", title);
    } else if (article.title) {
        title = article.title;
        console.log("📝 Lấy title từ article.title:", title);
    } else if (article.meta_description) {
        title = article.meta_description;
        console.log("📝 Lấy title từ article.meta_description:", title);
    }

    if (!title) {
        console.warn("⚠️ Không tìm thấy title trong dữ liệu");
        return;
    }

    titleInput.value = title;
    console.log("✅ Đã set tiêu đề thành công:", titleInput.value);
}

// ============================================================
// RENDER SECTIONS FROM OUTLINE (Improved)
// ============================================================
function renderSectionsFromOutline(outline, htmlContent, articleData) {
    const container = document.getElementById('sectionsContainer');
    if (!container) return;

    console.log("🔍 [RENDER] Outline:", outline);
    console.log("📄 [CONTENT] Length:", htmlContent ? htmlContent.length : 0);

    container.innerHTML = '';

    // 1. HYBRID PARSING: Run both HTML and Markdown parsers
    const htmlMap = parseContentByHeadings(htmlContent);
    const mdMap = parseMarkdownContent(htmlContent);

    const htmlKeys = Object.keys(htmlMap).filter(k => k !== "Giới thiệu");
    const mdKeys = Object.keys(mdMap).filter(k => k !== "Giới thiệu");

    console.log("📋 HTML Keys:", htmlKeys);
    console.log("📋 MD Keys:", mdKeys);


    // Pick the richer map
    let contentMap = (mdKeys.length >= htmlKeys.length) ? mdMap : htmlMap;

    // Fallback if empty
    if (Object.keys(contentMap).length === 0 && htmlContent) {
        console.warn("⚠️ All parsers failed to find headings. Using raw content for first section.");
        contentMap = { "Giới thiệu": htmlContent };
    }

    console.log("📋 Content Map Keys Prepared:", Object.keys(contentMap));

    const availableKeys = Object.keys(contentMap).filter(k => k !== "Giới thiệu");
    const usedKeys = new Set();
    let sequentialIndex = 0;

    // image pool for auto-insertion
    const imagePool = getImagePool(articleData);
    let imageIndex = 0;

    // Render sections
    outline.forEach((section, sectionIndex) => {
        // Skip H1 (Title) to avoid redundancy
        if (section.level === 1 || section.level === '1') {
            console.log(`⏩ Skipping H1 section: "${section.title}"`);
            return;
        }

        let content = null;
        let matchedKey = null;

        // Step A: Precise Match
        if (contentMap[section.title]) {
            matchedKey = section.title;
        } else if (section.id && contentMap[section.id]) {
            matchedKey = section.id;
        }

        // Step B: Fuzzy Match (Only if not matched yet)
        if (!matchedKey) {
            matchedKey = findFuzzyContentMatchKey(section.title, contentMap, usedKeys);
        }

        if (matchedKey) {
            content = contentMap[matchedKey];
            usedKeys.add(matchedKey);
        }

        // Step C: Sequential Fallback (If still empty)
        if (!content) {
            // Find next unused key
            while (sequentialIndex < availableKeys.length && usedKeys.has(availableKeys[sequentialIndex])) {
                sequentialIndex++;
            }
            if (sequentialIndex < availableKeys.length) {
                const fallbackKey = availableKeys[sequentialIndex++];
                content = contentMap[fallbackKey];
                usedKeys.add(fallbackKey);
                console.log(`🔗 [SEQ] "${section.title}" matches "${fallbackKey}"`);
            }
        }

        // Step D: Global Intro Fallback (Only for first section)
        if (!content && sectionIndex === 0) {
            content = contentMap["Giới thiệu"] || htmlContent; // Robust fallback to all content if first section and intro fails
        }

        // Auto-insert image if missing
        if (content && !content.includes('<img') && imagePool.length > 0) {
            const imgData = imagePool[imageIndex % imagePool.length];
            const imgHtml = `<div style="text-align:center; margin: 20px 0;"><img src="${imgData.url}" style="max-width:100%; border-radius:8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);" title="Nguồn: ${escapeHtml(imgData.source)}"></div>`;
            content = imgHtml + content;
            imageIndex++;
        }

        const sectionDiv = createSectionWithSubsections(section, sectionIndex, content);
        container.appendChild(sectionDiv);
    });

    console.log("✅ Render complete.");
}

// ============================================================
// PARSE CONTENT BY HEADINGS (Robust Version)
// ============================================================
function parseContentByHeadings(htmlContent) {
    if (!htmlContent) return {};

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;

    // Tìm tất cả các thẻ tiêu đề trong document (không chỉ ở root)
    const headings = Array.from(tempDiv.querySelectorAll('h1, h2, h3, h4, h5, h6'));
    const contentMap = {};

    if (headings.length === 0) {
        console.log("⚠️ Không tìm thấy thẻ HTML Heading nào.");
        return {};
    }

    // Bước 1: Xử lý phần nội dung TRƯỚC tiêu đề đầu tiên (thường là Giới thiệu)
    let introContent = [];
    let current = tempDiv.firstChild;
    const firstHeading = headings[0];

    while (current && current !== firstHeading) {
        if (current.nodeType === 1) introContent.push(current.outerHTML);
        else if (current.nodeType === 3 && current.textContent.trim()) introContent.push(current.textContent);
        current = current.nextSibling;
    }
    if (introContent.length > 0) {
        contentMap["Giới thiệu"] = introContent.join('');
    }

    // Bước 2: Duyệt qua từng Heading và lấy nội dung sau đó cho tới Heading tiếp theo
    headings.forEach((heading, index) => {
        const title = heading.textContent.trim();
        const id = heading.id;
        let contents = [];
        let next = heading.nextSibling;
        const nextHeading = headings[index + 1];

        while (next && next !== nextHeading) {
            if (next.nodeType === 1) contents.push(next.outerHTML);
            else if (next.nodeType === 3 && next.textContent.trim()) contents.push(next.textContent);
            next = next.nextSibling;
        }

        const html = contents.join('');
        if (title) contentMap[title] = html;
        if (id) contentMap[id] = html;
    });

    return contentMap;
}

function parseMarkdownContent(text) {
    if (!text) return {};
    console.log("🔍 Parsing Markdown...");

    const lines = text.split('\n');
    const map = {};
    let currentKey = "Giới thiệu";
    let buffer = [];

    const save = (key, contentLines) => {
        if (contentLines.length > 0) {
            const cleanContent = contentLines.join('\n').trim();
            if (cleanContent) map[key] = cleanContent;
        }
    };

    lines.forEach(line => {
        const hMatch = line.match(/^(#{1,6})\s*(.*)$/);
        const bMatch = line.match(/^\*\*(.*)\*\*$/); // Bold line as header

        if (hMatch) {
            save(currentKey, buffer);
            currentKey = hMatch[2].trim();
            buffer = [];
        } else if (bMatch && buffer.length === 0) {
            save(currentKey, buffer);
            currentKey = bMatch[1].trim();
            buffer = [];
        } else {
            buffer.push(line);
        }
    });

    save(currentKey, buffer);
    return map;
}

// ============================================================
// CREATE SECTION WITH SUBSECTIONS
// ============================================================
function createSectionWithSubsections(section, sectionIndex, content) {
    const sectionDiv = document.createElement('div');
    sectionDiv.className = 'section-item';
    sectionDiv.setAttribute('data-id', section.id || '');
    if (sectionIndex === 0) sectionDiv.classList.add('active');

    const sectionHeader = document.createElement('div');
    sectionHeader.className = 'section-header';
    sectionHeader.innerHTML = `
        <span class="chevron"><img src="./images/icon-nha-xuong.png" style="margin-right: 12px;"></span>
        <input type="text" class="section-title-input" value="${escapeHtml(section.title)}">
    `;

    const sectionBody = document.createElement('div');
    sectionBody.className = 'section-body';
    sectionBody.style.display = sectionIndex === 0 ? 'block' : 'none';

    // Internal content rendering
    const contentEditor = document.createElement('div');
    contentEditor.className = 'content-editor';
    contentEditor.contentEditable = true;
    contentEditor.innerHTML = content || `<p style="color:gray">Nhấn để nhập nội dung cho: ${escapeHtml(section.title)}</p>`;

    sectionBody.appendChild(contentEditor);
    sectionDiv.appendChild(sectionHeader);
    sectionDiv.appendChild(sectionBody);
    return sectionDiv;
}

function findFuzzyContentMatchKey(title, contentMap, usedKeys) {
    const normalize = s => s.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '').trim();
    const targetNorm = normalize(title);
    if (!targetNorm) return null;

    return Object.keys(contentMap).find(key => {
        if (usedKeys.has(key)) return false;
        const keyNorm = normalize(key);
        // Special case: "Giới thiệu" can match almost anything at the start
        if (keyNorm === "gioithieu" && targetNorm.includes("gioithieu")) return true;
        return keyNorm.includes(targetNorm) || targetNorm.includes(keyNorm);
    });
}

function findLongestString(obj) {
    return findLongestStringWithKey(obj).content;
}

function findLongestStringWithKey(obj) {
    let longest = '';
    let foundPath = '';

    const traverse = (o, path = '') => {
        if (!o || typeof o === 'function') return;
        if (typeof o === 'string') {
            // Loại bỏ các chuỗi kỹ thuật hoặc quá ngắn
            if (o.length > longest.length &&
                !o.startsWith('{') &&
                !o.includes('Object]') &&
                !o.includes('function()') &&
                !o.includes('DOMContentLoaded')) {
                longest = o;
                foundPath = path;
            }
        } else if (typeof o === 'object') {
            Object.entries(o).forEach(([key, value]) => {
                const currentPath = path ? `${path}.${key}` : key;
                traverse(value, currentPath);
            });
        }
    };
    traverse(obj);
    return { content: longest.length > 100 ? longest : '', path: foundPath };
}

// ============================================================
// FUZZY CONTENT MATCH
// ============================================================
function findFuzzyContentMatch(sectionTitle, contentMap) {
    const normalize = s => s.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '').trim();
    const sectionNorm = normalize(sectionTitle);

    const key = Object.keys(contentMap).find(k => {
        const kNorm = normalize(k);
        return kNorm.includes(sectionNorm) || sectionNorm.includes(kNorm);
    });

    if (key) {
        console.log(`🔗 Fuzzy Matched: "${sectionTitle}" -> "${key}"`);
        return contentMap[key];
    }
    return null;
}

// ============================================================
// CONTENT GENERATION (Added validation)
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

        // ✅ Validation
        const titleInput = document.getElementById('articleTitle');
        const title = article.title || titleInput?.value || "";
        if (!title.trim()) {
            alert("Chưa có tiêu đề bài viết. Vui lòng nhập tiêu đề trước!");
            return;
        }

        if (!articleData.article_outline || !articleData.article_outline.length) {
            alert("Chưa có outline bài viết. Vui lòng tạo outline trước!");
            return;
        }

        const payload = {
            top_news: articleData.pipeline_results?.selected_news || [],
            target_language: articleData.target_language || "Tiếng Việt",
            config: {
                bot_id: "GPT-4.1",
                article_length: article.word_count ? String(article.word_count) : "1500",
                tone: article.tone || "Chuyên nghiệp",
                article_type: "blog",
                custome_instructions: articleData.custome_instructions || null
            },
            title: title,
            outline: articleData.article_outline || [],
            main_keyword: article.main_keyword || "",
            secondary_keywords: article.secondary_keywords || []
        };

        console.log("🚀 REQUEST ContentGeneration:", payload);

        // Show loading
        const container = document.getElementById('sectionsContainer');
        if (container) {
            container.innerHTML = `
                <div style="text-align: center; color: #9CA3AF; padding: 40px;">
                    <i class="fas fa-spinner fa-spin fa-2x"></i>
                    <p style="margin-top: 10px;">Đang viết bài, vui lòng chờ...</p>
                </div>
            `;
        }

        const response = await fetch("https://caiman-warm-swan.ngrok-free.app/api/v1/ai/contents", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        console.log("✅ RESPONSE ContentGeneration:", data);

        let newContent = data.content || data.html || data.result || (typeof data === 'string' ? data : '');
        if (newContent) {
            if (!articleData.finalArticle) articleData.finalArticle = {};
            articleData.finalArticle.content = newContent;
            sessionStorage.setItem('finalArticleData', JSON.stringify(articleData));
            loadArticleData();
            alert("Đã viết bài thành công!");
        } else {
            alert("API trả về nhưng không tìm thấy nội dung bài viết.");
        }

    } catch (error) {
        console.error("❌ Lỗi khi viết bài:", error);
        alert("Lỗi khi viết bài: " + error.message);
        loadArticleData();
    }
}

// ============================================================
// EXTRACT CONTENT FOR SECTION (Fixed - single version)
// ============================================================
function extractContentForSection(sectionTitle, htmlContent) {
    if (!htmlContent) return '';

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;

    let collecting = false;
    const content = [];

    Array.from(tempDiv.children).forEach(child => {
        if ((child.tagName === 'H2' || child.tagName === 'H1') &&
            child.textContent.trim().toLowerCase().includes(sectionTitle.toLowerCase())) {
            collecting = true;
            return;
        }

        if (collecting && (child.tagName === 'H2' || child.tagName === 'H1')) {
            collecting = false;
            return;
        }

        if (collecting) {
            content.push(child.outerHTML);
        }
    });

    return content.join('');
}

// ============================================================
// RENDER ARTICLE SECTIONS (Fallback)
// ============================================================
function renderArticleSections(htmlContent) {
    const container = document.getElementById('sectionsContainer');
    if (!container) return;

    console.log("🔍 Đang parse HTML content (fallback)...");
    container.innerHTML = '';

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;

    const sections = [];
    let currentSection = null;

    Array.from(tempDiv.children).forEach(child => {
        if (child.tagName === 'H2' || child.tagName === 'H1') {
            if (currentSection) sections.push(currentSection);
            currentSection = {
                id: 'section_' + sections.length,
                title: child.textContent.trim(),
                content: document.createElement('div')
            };
        } else {
            if (!currentSection) {
                currentSection = {
                    id: 'section_intro',
                    title: "Giới thiệu",
                    content: document.createElement('div')
                };
            }
            currentSection.content.appendChild(child.cloneNode(true));
        }
    });

    if (currentSection) sections.push(currentSection);

    console.log(`📋 Tìm thấy ${sections.length} sections`);

    sections.forEach((section, index) => {
        const sectionItem = createSimpleSection(section, index === 0);
        container.appendChild(sectionItem);
    });
}

function createSimpleSection(section, isExpanded) {
    const sectionDiv = document.createElement('div');
    sectionDiv.className = 'section-item';
    if (isExpanded) sectionDiv.classList.add('active');

    const sectionHeader = document.createElement('div');
    sectionHeader.className = 'section-header';
    sectionHeader.style.cssText = 'display: flex; align-items: center; padding: 15px; cursor: pointer; border-bottom: 1px solid #E5E7EB;';

    sectionHeader.innerHTML = `
        <span class="chevron" style="margin-right: 15px;">
            <img src="./images/icon-nha-xuong.png" alt="" style="margin-right: 12px;">
        </span>
        <span class="section-title" style="flex: 1; font-weight: 600; font-size: 16px;">${escapeHtml(section.title)}</span>
    `;

    const sectionBody = document.createElement('div');
    sectionBody.className = 'section-body';
    sectionBody.style.display = isExpanded ? 'block' : 'none';
    sectionBody.style.padding = '15px';

    const contentEditor = document.createElement('div');
    contentEditor.className = 'content-editor';
    contentEditor.contentEditable = true;
    contentEditor.innerHTML = section.content.innerHTML || '';
    contentEditor.style.cssText = 'min-height: 100px; padding: 15px; outline: none; line-height: 1.6; border: 1px solid #E5E7EB; border-radius: 4px;';

    sectionBody.appendChild(contentEditor);
    sectionDiv.appendChild(sectionHeader);
    sectionDiv.appendChild(sectionBody);
    return sectionDiv;
}

// ============================================================
// SET ARTICLE CONTENT
// ============================================================
function setArticleContent(article) {
    const contentInput = document.getElementById('article-contens');
    if (!contentInput) {
        console.warn("⚠️ Không tìm thấy element #article-contens");
        return;
    }

    const content = article.content || article.html || article.body || '';
    if (content) {
        contentInput.value = content;
        console.log("✅ Đã set article content:", content.substring(0, 100) + '...');
    }
}

// ============================================================
// SET SHORT DESCRIPTION
// ============================================================
function setShortDescription(article) {
    const textarea = document.querySelector('.short-description-section textarea');
    if (!textarea) {
        console.warn("⚠️ Không tìm thấy textarea trong short-description-section");
        return;
    }

    let description = '';
    if (article.meta_description) {
        description = article.meta_description;
    } else if (article.summary) {
        description = article.summary;
    } else if (article.description) {
        description = article.description;
    } else if (article.content) {
        description = extractFirstParagraph(article.content, 200);
    }

    if (description) {
        textarea.value = description;
        console.log("✅ Đã set mô tả ngắn:", description.substring(0, 100) + '...');
    }
}

// ============================================================
// RENDER REFERENCES & SEO SCORE
// ============================================================
function renderReferences(articleData) {
    let references = [];
    if (articleData.pipeline_results?.selected_news) {
        references = articleData.pipeline_results.selected_news;
    } else if (articleData.finalArticle?.sources) {
        references = articleData.finalArticle.sources;
    }

    if (references.length === 0) return;

    const accordions = document.querySelectorAll('.sidebar-accordion');
    if (accordions.length === 0) return;

    const referenceAccordion = accordions[0];
    const accordionContent = referenceAccordion.querySelector('.accordion-content');
    if (!accordionContent) return;

    accordionContent.innerHTML = '';

    references.forEach((ref, index) => {
        const sourceItem = document.createElement('div');
        sourceItem.className = 'source-item';
        sourceItem.style.marginBottom = '10px';

        const url = ref.url || ref.link || '#';
        const title = ref.title || `Nguồn ${index + 1}`;

        sourceItem.innerHTML = `
            <span class="dot" style="display: inline-block; width: 6px; height: 6px; background: #4F46E5; border-radius: 50%; margin-right: 8px;"></span>
            <a href="${url}" target="_blank" title="${title}" style="color: #4F46E5; text-decoration: none; word-break: break-word; font-size: 14px;">
                ${truncateText(title, 60)}
            </a>
        `;
        accordionContent.appendChild(sourceItem);
    });

    const sourceCount = referenceAccordion.querySelector('.source-count');
    if (sourceCount) {
        sourceCount.textContent = `${references.length} nguồn`;
    }
}

function renderSEOScore(article) {
    const accordions = document.querySelectorAll('.sidebar-accordion');
    if (accordions.length < 2) return;

    const seoAccordion = accordions[1];
    const seoScoreElement = seoAccordion.querySelector('.seo-score');
    const seoContent = seoAccordion.querySelector('.accordion-content');

    let seoData = article.seo_analysis || article.seo_score || {};

    if (seoScoreElement) {
        const score = seoData.score || seoData.overall_score || 85;
        seoScoreElement.textContent = `${score} điểm`;

        if (score >= 80) seoScoreElement.style.color = '#10B981';
        else if (score >= 60) seoScoreElement.style.color = '#F59E0B';
        else seoScoreElement.style.color = '#EF4444';
    }

    if (seoContent) {
        seoContent.innerHTML = '';
        const checks = seoData.items || [
            { icon: '✅', text: 'Từ khóa trong tiêu đề' },
            { icon: '✅', text: 'Độ dài bài viết tốt' },
            { icon: '✅', text: 'Mật độ từ khóa hợp lý' },
            { icon: '⚠️', text: 'Cần thêm Internal Link' }
        ];

        checks.forEach(check => {
            const seoItem = document.createElement('div');
            seoItem.className = 'seo-item';
            seoItem.style.marginBottom = '8px';
            seoItem.innerHTML = `${check.icon} ${check.text}`;
            seoContent.appendChild(seoItem);
        });
    }
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================
function getContentSource(article, articleData) {
    if (article.content) return 'article.content';
    if (article.html) return 'article.html';
    if (article.result) return 'article.result';
    if (article.text) return 'article.text';
    if (article.text_content) return 'article.text_content';
    if (article.body) return 'article.body';
    if (article.article_content) return 'article.article_content';
    if (article.full_content) return 'article.full_content';
    if (article.html_content) return 'article.html_content';
    if (article.meta_description) return 'article.meta_description';
    if (articleData.final_content) return 'articleData.final_content';
    if (articleData.content) return 'articleData.content';
    if (articleData.article?.content) return 'articleData.article.content';
    if (articleData.article?.html) return 'articleData.article.html';
    if (articleData.result) return 'articleData.result';
    if (articleData.text_content) return 'articleData.text_content';
    return 'NONE';
}

function extractFirstParagraph(htmlContent, maxLength = 200) {
    if (!htmlContent) return "";
    const plainText = htmlContent.replace(/<[^>]*>/g, '').trim();
    const firstParagraph = plainText.split(/\n\n|\.\s/)[0];
    if (firstParagraph.length > maxLength) {
        return firstParagraph.substring(0, maxLength).trim() + '...';
    }
    return firstParagraph;
}

function truncateText(text, maxLength) {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============================================================
// EVENT HANDLERS (Optimized)
// ============================================================
function setupSectionAccordions() {
    // ✅ Event delegation - chỉ setup 1 lần, hiệu suất cao
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
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            const tabId = btn.getAttribute('data-tab');
            const targetContent = document.getElementById(`${tabId}-tab`);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });
}

function setupToolbar() {
    const toolBtns = document.querySelectorAll('.tool-btn');
    toolBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            btn.classList.toggle('active-tool');
        });
    });
}

window.toggleAccordion = function (headerElement) {
    const content = headerElement.nextElementSibling;
    const chevron = headerElement.querySelector('.chevron img');

    if (content.style.display === 'block') {
        content.style.display = 'none';
        headerElement.classList.remove('active');
        if (chevron) chevron.style.transform = 'rotate(0deg)';
    } else {
        content.style.display = 'block';
        headerElement.classList.add('active');
        if (chevron) chevron.style.transform = 'rotate(180deg)';
    }
};

// ============================================================
// IMAGE POOL HELPER
// ============================================================
function getImagePool(articleData) {
    let images = [];
    const usedUrls = new Set();

    // 1. From selected_news
    if (articleData.pipeline_results?.selected_news) {
        articleData.pipeline_results.selected_news.forEach(news => {
            if (news.images && Array.isArray(news.images)) {
                news.images.forEach(imgUrl => {
                    if (imgUrl && !usedUrls.has(imgUrl)) {
                        images.push({ url: imgUrl, source: news.title });
                        usedUrls.add(imgUrl);
                    }
                });
            }
        });
    }

    // 2. From crawledArticles
    if (articleData.crawledArticles && Array.isArray(articleData.crawledArticles)) {
        articleData.crawledArticles.forEach(news => {
            if (news.images && Array.isArray(news.images)) {
                news.images.forEach(imgUrl => {
                    if (imgUrl && !usedUrls.has(imgUrl)) {
                        images.push({ url: imgUrl, source: news.title });
                        usedUrls.add(imgUrl);
                    }
                });
            }
        });
    }

    // 3. From finalArticle.images
    if (articleData.finalArticle?.images && Array.isArray(articleData.finalArticle.images)) {
        articleData.finalArticle.images.forEach(img => {
            const url = typeof img === 'string' ? img : img.url;
            if (url && !usedUrls.has(url)) {
                images.push({ url: url, source: 'AI Recommended' });
                usedUrls.add(url);
            }
        });
    }

    return images;
}

// ============================================================
// RENDER IMAGES TO MEDIA TAB
// ============================================================
function renderImages(articleData) {
    const imageGrid = document.getElementById('imageGrid');
    if (!imageGrid) {
        console.warn("⚠️ Không tìm thấy element #imageGrid");
        return;
    }

    console.log("🖼️ Đang render danh sách ảnh...");
    imageGrid.innerHTML = '';

    // 1. Lọc ảnh từ selected_news (pipeline kết quả crawl)
    let images = [];

    // Thử lấy từ pipeline_results.selected_news
    if (articleData.pipeline_results?.selected_news) {
        articleData.pipeline_results.selected_news.forEach(news => {
            if (news.images && Array.isArray(news.images)) {
                news.images.forEach(imgUrl => {
                    if (imgUrl && !images.some(existing => existing.url === imgUrl)) {
                        images.push({
                            url: imgUrl,
                            source: news.title
                        });
                    }
                });
            }
        });
    }

    // 1.1 Thử lấy từ crawledArticles (Mới được bổ sung từ trang-thai-xu-ly.js)
    if (articleData.crawledArticles && Array.isArray(articleData.crawledArticles)) {
        articleData.crawledArticles.forEach(news => {
            if (news.images && Array.isArray(news.images)) {
                news.images.forEach(imgUrl => {
                    if (imgUrl && !images.some(existing => existing.url === imgUrl)) {
                        images.push({
                            url: imgUrl,
                            source: news.title
                        });
                    }
                });
            }
        });
    }


    // 2. Thử lấy từ finalArticle.images (nếu có)
    if (articleData.finalArticle?.images && Array.isArray(articleData.finalArticle.images)) {
        articleData.finalArticle.images.forEach(img => {
            const url = typeof img === 'string' ? img : img.url;
            if (url && !images.some(existing => existing.url === url)) {
                images.push({
                    url: url,
                    source: 'AI Recommended'
                });
            }
        });
    }

    if (images.length === 0) {
        imageGrid.innerHTML = `
            <div style="grid-column: span 2; text-align: center; padding: 20px; color: #9CA3AF;">
                <p style="font-size: 13px;">Không tìm thấy ảnh liên quan.</p>
            </div>
        `;
        return;
    }

    console.log(`✅ Tìm thấy ${images.length} ảnh để hiển thị.`);

    images.forEach(imgData => {
        const item = document.createElement('div');
        item.className = 'grid-image-item';
        item.title = `Nguồn: ${imgData.source}`;

        item.innerHTML = `
            <img src="${imgData.url}" onerror="this.src='./assets/images/placeholder-image.png'; this.parentElement.style.display='none';">
            <div class="image-overlay">Click để chèn</div>
        `;

        item.addEventListener('click', () => {
            insertImageToActiveSection(imgData.url);
        });

        imageGrid.appendChild(item);
    });
}

function insertImageToActiveSection(url) {
    // Tìm section đang active hoặc section đầu tiên
    let targetEditor = document.querySelector('.section-item.active .content-editor');
    if (!targetEditor) {
        targetEditor = document.querySelector('.content-editor');
    }

    if (targetEditor) {
        const imgHtml = `<div style="text-align:center; margin: 20px 0;"><img src="${url}" style="max-width:100%; border-radius:8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);"></div><p></p>`;

        // Chèn vào vị trí con trỏ hoặc cuối editor
        targetEditor.focus();
        document.execCommand('insertHTML', false, imgHtml);

        showNotification("Đã chèn ảnh vào bài viết!", "success");
    } else {
        alert("Vui lòng chọn một đoạn nội dung để chèn ảnh.");
    }
}


