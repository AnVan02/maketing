document.addEventListener('DOMContentLoaded', () => {
    // Debug: Log toàn bộ sessionStorage để kiểm tra
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
    console.log("=" .repeat(50));

    // Load Article Data from API
    loadArticleData();

    // Setup Event Listeners
    setupTabs();
    setupToolbar();
    setupFloatingTool();
});

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
        console.warn("⚠️ Không tìm thấy dữ liệu bài viết trong sessionStorage");
        console.log("🔍 Các keys có trong sessionStorage:", Object.keys(sessionStorage));
        console.log("📦 Sử dụng dữ liệu demo để test...");
        createDemoData();
        return;
    }

    try {
        const articleData = JSON.parse(finalArticleDataJson);
        console.log("📄 Dữ liệu bài viết đầy đủ:", articleData);
        console.log("🔍 Keys trong articleData:", Object.keys(articleData));

        const article = articleData.finalArticle;
        if (!article) {
            console.error("❌ Không tìm thấy finalArticle trong dữ liệu");
            console.log("🔍 Cấu trúc dữ liệu:", Object.keys(articleData));
            return;
        }

        // 1. Set Article Title
        setArticleTitle(articleData, article);

        // 2. Tìm HTML content từ nhiều nguồn có thể
        // Thử tất cả các field có thể chứa nội dung bài viết
        const htmlContent = article.content || 
                           article.html || 
                           article.body || 
                           article.text ||
                           article.meta_description ||
                           articleData.final_content || 
                           articleData.content ||

                           '';
        console.log("📄 HTML Content tìm được:", htmlContent ? htmlContent.substring(0, 300) : 'EMPTY');
        console.log("📄 Nguồn content:", 
            article.content ? 'article.content' :
            article.html ? 'article.html' :
            article.body ? 'article.body' :
            article.text ? 'article.text' :
            article.meta_description ? 'article.meta_description' :
            articleData.final_content ? 'articleData.final_content' :
            'NONE'
        );

        // 3. Render Article Sections với outline structure
        if (articleData.article_outline) {
            console.log("📋 Sử dụng article_outline");
            renderSectionsFromOutline(articleData.article_outline, htmlContent);
        } else if (htmlContent) {
            console.log("📋 Parse từ HTML content");
            renderArticleSections(htmlContent);
        } else {
            console.error("❌ Không tìm thấy nội dung HTML nào!");
        }

        // 4. Set Article Content (full HTML)
        setArticleContent(article);

        // 5. Set Short Description
        setShortDescription(article);

        // 6. Render References
        renderReferences(articleData);

        // 7. Render SEO Score
        renderSEOScore(article);

        console.log("✅ Đã load xong tất cả dữ liệu từ API!");

    } catch (error) {
        console.error("❌ Lỗi khi parse dữ liệu:", error);
        alert("Lỗi khi tải dữ liệu bài viết: " + error.message);
    }
}

// ============================================================
// SET ARTICLE TITLE
// ============================================================
function setArticleTitle(articleData, article) {
    const titleInput = document.getElementById('articleTitle');

    console.log("🔍 Đang set tiêu đề bài viết...");

    if (!titleInput) {
        console.error("❌ Không tìm thấy input#articleTitle trong DOM!");
        return;
    }

    let title = '';

    // Ưu tiên lấy từ meta_description trước
    if (article.meta_description) {
        title = article.meta_description;
        console.log("📝 Lấy title từ article.meta_description:", title);
    } else if (articleData.final_title) {
        title = articleData.final_title;
        console.log("📝 Lấy title từ articleData.final_title:", title);
    } else if (article.title) {
        title = article.title;
        console.log("📝 Lấy title từ article.title:", title);
    } else {
        console.warn("⚠️ Không tìm thấy title trong dữ liệu");
        return;
    } 

    titleInput.value = title;
    console.log("✅ Đã set tiêu đề thành công:", titleInput.value);
}

// ============================================================
// RENDER SECTIONS FROM OUTLINE (H2 & H3 Structure)
// ============================================================
function renderSectionsFromOutline(outline, htmlContent) {
    const container = document.getElementById('sectionsContainer');
    if (!container) {
        console.warn("⚠️ Không tìm thấy sectionsContainer");
        return;
    }
    

    console.log("🔍 Đang render từ outline structure...");
    console.log("📋 Outline:", outline);
    console.log("📄 HTML Content length:", htmlContent ? htmlContent.length : 0);
    console.log("📄 HTML Content preview:", htmlContent ? htmlContent.substring(0, 500) : 'EMPTY');

    // Clear existing
    container.innerHTML = '';

    // Parse HTML content để lấy nội dung chi tiết
    const contentMap = parseContentByHeadings(htmlContent);
    console.log("📋 Content Map keys:", Object.keys(contentMap));
    console.log("📋 Content Map full:", contentMap);

    // Nếu không có contentMap, thử parse trực tiếp từ HTML
    if (Object.keys(contentMap).length === 0 && htmlContent) {
        console.warn("⚠️ Content Map trống, thử phương pháp khác...");
        // Fallback: sử dụng toàn bộ HTML content cho mỗi section
        outline.forEach((section) => {
            contentMap[section.title] = htmlContent;
        });
    }
    

    // Render từng section (H2) với subsections (H3)
    outline.forEach((section, sectionIndex) => {
        const sectionDiv = createSectionWithSubsections(section, sectionIndex, htmlContent);
        container.appendChild(sectionDiv);
    });

    console.log("✅ Đã render xong tất cả sections từ outline");

    // Setup accordion functionality
    setupSectionAccordions();
}

// ============================================================
// PARSE CONTENT BY HEADINGS
// ============================================================
function parseContentByHeadings(htmlContent) {
    if (!htmlContent) return {};

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;

    const contentMap = {};
    let currentHeading = "Giới thiệu"; // Mặc định cho phần đầu nếu không có H2
    let currentContent = [];

    Array.from(tempDiv.children).forEach(child => {
        if (['H1', 'H2', 'H3'].includes(child.tagName)) {
            // Lưu lại phần trước đó
            if (currentContent.length > 0) {
                contentMap[currentHeading] = currentContent.map(el => el.outerHTML).join('');
            }
            currentHeading = child.textContent.trim();
            currentContent = [];
        } else {
            currentContent.push(child.cloneNode(true));
        }
    });

    // Lưu phần cuối cùng
    if (currentHeading) {
        contentMap[currentHeading] = currentContent.map(el => el.outerHTML).join('');
    }
    return contentMap;
}

// ============================================================
// CREATE SECTION WITH SUBSECTIONS (H2 + H3)
// ============================================================
function createSectionWithSubsections(section, sectionIndex, contentMap, fullHtmlContent) {
    const sectionDiv = document.createElement('div');
    sectionDiv.className = 'section-item';
    sectionDiv.setAttribute('data-id', section.id);
    if (sectionIndex === 0) sectionDiv.classList.add('active');

    const sectionHeader = document.createElement('div');
    sectionHeader.className = 'section-header';
    sectionHeader.innerHTML = `
        <span class="chevron"><img src="./images/icon-nha-xuong.png" style="margin-right: 12px;"></span>
        <input type="text" class="section-title-input" value="${escapeHtml(section.title)}" style="flex: 1; border: none; background: transparent; font-weight: 600;">
    `;

    const sectionBody = document.createElement('div');
    sectionBody.className = 'section-body';
    sectionBody.style.display = sectionIndex === 0 ? 'block' : 'none';

    // 1. Render Subsections (H3)
    // if (section.subsections && section.subsections.length > 0) {
    //     const subContainer = document.createElement('div');
    //     section.subsections.forEach((sub, idx) => {
    //         subContainer.innerHTML += createSubsectionHTML(sub, section.id, idx);
    //     });
    //     sectionBody.appendChild(subContainer);
    // }

    // 2. Lấy nội dung cho Section này
    let content = contentMap[section.title] || "";
    
    // Nếu không tìm thấy, thử tìm kiếm tương đối (partial match)
    if (!content) {
        const key = Object.keys(contentMap).find(k => k.includes(section.title) || section.title.includes(k));
        if (key) content = contentMap[key];
    }

    const contentEditor = document.createElement('div');
    contentEditor.className = 'content-editor';
    contentEditor.contentEditable = true;
    contentEditor.innerHTML = content || `<p style="color:gray">Nhấn để nhập nội dung cho: ${section.title}</p>`;
    
    sectionBody.appendChild(contentEditor);
    sectionDiv.appendChild(sectionHeader);
    sectionDiv.appendChild(sectionBody);

    return sectionDiv;
}
// ============================================================
// EXTRACT CONTENT FOR SECTION (Fallback method)
// ============================================================
function extractContentForSection(sectionTitle, htmlContent) {
    if (!htmlContent) return '';
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    
    let collecting = false;
    let content = [];
    
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
        
        if (collecting && child.tagName !== 'H3') {
            content.push(child.outerHTML);
        }
    });
    
    return content.join('');
}

// ============================================================
// CREATE SUBSECTION HTML (H3)
// ============================================================
function createSubsectionHTML(subsection, parentId, index) {
    // return `
    //     <div class="subsection-item" style="margin-bottom: 10px; padding: 10px; background: #F3F4F6; border-radius: 4px;">
    //         <input type="text" 
    //                class="subsection-title-input" 
    //                value="${escapeHtml(subsection.title)}" 
    //                data-parent="${parentId}"
    //                data-index="${index}"
    //                style="width: 100%; border: none; background: transparent; font-weight: 500; font-size: 14px; padding: 5px; outline: none; color: #374151;">
    //     </div>
    // `;
}

// ============================================================
// EXTRACT CONTENT FOR SECTION (Fallback method)
// ============================================================
function extractContentForSection(sectionTitle, htmlContent) {
    if (!htmlContent) return '';
    
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    
    let collecting = false;
    let content = [];
    
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
        
        if (collecting && child.tagName !== 'H3') {
            content.push(child.outerHTML);
        }
    });
    
    return content.join('');
}

// ============================================================
// CREATE SUBSECTION HTML (H3)
// ============================================================
function createSubsectionHTML(subsection, parentId, index) {
    // return `
    //     <div class="subsection-item" style="margin-bottom: 10px; padding: 10px; background: #F3F4F6; border-radius: 4px;">
    //         <input type="text" 
    //                class="subsection-title-input" 
    //                value="${escapeHtml(subsection.title)}" 
    //                data-parent="${parentId}"
    //                data-index="${index}"
    //                style="width: 100%; border: none; background: transparent; font-weight: 500; font-size: 14px; padding: 5px; outline: none; color: #374151;">
    //     </div>
    // `;
}

// ============================================================
// RENDER ARTICLE SECTIONS (Fallback - No Outline)
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

    setupSectionAccordions();
}

// ============================================================
// CREATE SIMPLE SECTION (No Subsections)
// ============================================================
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
        <span class="section-title" style="flex: 1; font-weight: 600; font-size: 16px;">${section.title}</span>
    `;

    const sectionBody = document.createElement('div');
    sectionBody.className = 'section-body';
    sectionBody.style.display = isExpanded ? 'block' : 'none';
    sectionBody.style.padding = '15px';

    const contentEditor = document.createElement('div');
    contentEditor.className = 'content-editor';
    contentEditor.contentEditable = true;
    contentEditor.innerHTML = section.content.innerHTML;
    contentEditor.style.cssText = 'min-height: 100px; padding: 15px; outline: none; line-height: 1.6; border: 1px solid #E5E7EB; border-radius: 4px;';

    sectionBody.appendChild(contentEditor);
    sectionDiv.appendChild(sectionHeader);
    sectionDiv.appendChild(sectionBody);
    return sectionDiv;
}

// ============================================================
// SET ARTICLE CONTENT (Full HTML)
// ============================================================
function setArticleContent(article) {
    const contentInput = document.getElementById('article-contens');
    if (contentInput) {
        // Tìm content từ nhiều nguồn có thể
        const content = article.content || article.html || article.body || '';
        if (content) {
            contentInput.value = content;
            console.log("✅ Đã set article content:", content.substring(0, 100) + '...');
        } else {
            console.warn("⚠️ Không tìm thấy content để set vào article-contens");
        }
    } else {
        console.warn("⚠️ Không tìm thấy element #article-contens");
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

    // Thử lấy từ các field có thể
    if (article.meta_description) {
        description = article.meta_description;
        console.log(" Lấy description từ article.meta_description");
    } else if (article.summary) {
        description = article.summary;
        console.log(" Lấy description từ article.summary");
    } else if (article.description) {
        description = article.description;
        console.log(" Lấy description từ article.description");
    } else if (article.content) {
        description = extractFirstParagraph(article.content, 200);
        console.log(" Extract description từ article.content");
    }

    if (description) {
        textarea.value = description;
        console.log("✅ Đã set mô tả ngắn:", description.substring(0, 100) + '...');
    } else {
        console.warn("⚠️ Không tìm thấy nội dung cho mô tả ngắn");
    }
}

// ============================================================
// RENDER REFERENCES
// ============================================================
function renderReferences(articleData) {
    let references = [];

    if (articleData.pipeline_results && articleData.pipeline_results.selected_news) {
        references = articleData.pipeline_results.selected_news;
    } else if (articleData.finalArticle && articleData.finalArticle.sources) {
        references = articleData.finalArticle.sources;
    }

    if (references.length === 0) {
        console.log(" Không có nguồn tham khảo");
        return;
    }

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

    console.log(`✅ Đã hiển thị ${references.length} nguồn tham khảo`);
}

// ============================================================
// RENDER SEO SCORE
// ============================================================
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

        if (score >= 80) {
            seoScoreElement.style.color = '#10B981';
        } else if (score >= 60) {
            seoScoreElement.style.color = '#F59E0B';
        } else {
            seoScoreElement.style.color = '#EF4444';
        }
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

    console.log("✅ Đã hiển thị SEO score");
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================
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
// SETUP SECTION ACCORDIONS
// ============================================================
function setupSectionAccordions() {
    document.querySelectorAll('.section-header').forEach(header => {
        const newHeader = header.cloneNode(true);
        header.parentNode.replaceChild(newHeader, header);
    });

    document.querySelectorAll('.section-header').forEach(header => {
        header.addEventListener('click', (e) => {
            // Don't toggle if clicking on input
            if (e.target.tagName === 'INPUT') return;

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
    });
}

// ============================================================
// SETUP TABS
// ============================================================
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

// ============================================================
// SETUP TOOLBAR
// ============================================================
function setupToolbar() {
    const toolBtns = document.querySelectorAll('.tool-btn');
    toolBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            btn.classList.toggle('active-tool');
        });
    });
}

// ============================================================
// TOGGLE ACCORDION (SIDEBAR)
// ============================================================
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
// CREATE DEMO DATA (For Testing)
// ============================================================
function createDemoData() {
    console.log("🧪 Tạo dữ liệu demo...");
    // Add your demo data creation logic here if needed
}