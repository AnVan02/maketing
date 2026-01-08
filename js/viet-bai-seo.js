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
    setupToolbar();
    setupFloatingTool();
    setupSectionAccordions();
    setupTabs(); // Added missing tab setup
    setupSidebarSmartEdit(); // Setup sidebar smart edit
    setupImageHandlers(); // Handles Delete & Drag-Drop
    setupDebugTool(); // Add debug button to UI

    // Initial Image search if keyword exists
    setTimeout(() => {
        const titleInput = document.getElementById('articleTitle');
        const imgSearchInput = document.getElementById('imageSearchInput');
        if (titleInput && imgSearchInput && !imgSearchInput.value) {
            imgSearchInput.value = titleInput.value;
            searchImages();
        }
    }, 1000);
});

let draggedElement = null;

function setupImageHandlers() {
    const container = document.getElementById('sectionsContainer');
    if (!container) return;

    // 1. DELETE & CLICK Handler
    container.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-image-btn')) {
            const wrapper = e.target.closest('.draggable-image');
            if (wrapper) {
                // Remove image immediately without confirmation
                wrapper.nextElementSibling?.tagName === 'BR' ? wrapper.nextElementSibling.remove() : null;
                wrapper.remove();
                showNotification('Đã xóa ảnh!', 'success');
            }
        }
    });

    // 2. DRAG START
    container.addEventListener('dragstart', (e) => {
        const wrapper = e.target.closest('.draggable-image');
        if (wrapper) {
            draggedElement = wrapper;
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/html', wrapper.outerHTML);
            wrapper.style.opacity = '0.4';
        }
    });

    // 3. DRAG END (Cleanup)
    container.addEventListener('dragend', (e) => {
        const wrapper = e.target.closest('.draggable-image');
        if (wrapper) wrapper.style.opacity = '1';
        draggedElement = null;
    });

    // 4. DRAG OVER (Allow Drop)
    container.addEventListener('dragover', (e) => {
        e.preventDefault(); // Essential to allow dropping
        e.dataTransfer.dropEffect = 'move';
    });

    // 5. DROP
    container.addEventListener('drop', (e) => {
        e.preventDefault();

        // Allow both internal drags (from draggable-image) and external drags (from media grid)
        const editor = e.target.closest('.content-editor');
        if (!editor) return;

        // Try to use Range from event (Standard approach)

        let range = null;
        if (document.caretRangeFromPoint) { // Chrome/Webkit
            range = document.caretRangeFromPoint(e.clientX, e.clientY);
        } else if (document.caretPositionFromPoint) { // Firefox
            const pos = document.caretPositionFromPoint(e.clientX, e.clientY);
            range = document.createRange();
            range.setStart(pos.offsetNode, pos.offset);
            range.collapse(true);
        }

        if (!range) return;

        // If internal drag (we have a draggedElement reference), perform move
        if (draggedElement) {
            // ✅ FIX: Sử dụng lại element gốc thay vì tạo mới từ HTML
            // Điều này tránh tạo ảnh trùng lặp
            const elementToMove = draggedElement;

            // Xóa khỏi vị trí cũ (nếu còn trong DOM)
            if (elementToMove.parentNode) {
                elementToMove.parentNode.removeChild(elementToMove);
            }

            // Chèn vào vị trí mới
            range.insertNode(elementToMove);
            range.insertNode(document.createElement('br'));

            // Cleanup
            draggedElement = null;

            // Re-focus
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);

            showNotification('✅ Đã di chuyển ảnh!', 'success');
            return;
        }

        // External drag (e.g., dragging from Media grid) -> read HTML or URL from dataTransfer
        let incoming = e.dataTransfer.getData('text/html') || e.dataTransfer.getData('text/plain');
        if (!incoming) return;

        // If incoming is a plain URL, wrap it into draggable HTML
        if (/^https?:\/\//i.test(incoming.trim())) {
            incoming = createDraggableImageHtml(incoming.trim(), 'Inserted Image');
        }

        try {
            const fragment = document.createRange().createContextualFragment(incoming);
            const newEl = fragment.firstElementChild;
            range.insertNode(newEl);
            range.insertNode(document.createElement('br'));

            // Re-focus
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);

            showNotification('✅ Đã chèn ảnh bằng kéo thả!', 'success');
        } catch (err) {
            console.error('❌ Drop insert failed:', err);
        }
    });

    // 6. Auto-save khi go
    let timeoutId;
    container.addEventListener('input', () => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(saveCurrentArticleState, 1000);
    });

    //  7. Save on delete 
    container.addEventListener('click', (e) => {
        if (e.starget.classList.container('delete-image-btn')) {
            setTimeout(saveCurrentArticleState, 100);
        }
    });
}

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

let selectedText = "";
let selectedRange = null;
let lastPopupResult = "";

function setupFloatingTool() {
    const trigger = document.getElementById('ai-floating-trigger');
    const popup = document.getElementById('ai-selection-popup');
    const container = document.getElementById('sectionsContainer');

    if (!trigger || !popup || !container) return;

    // Detect selection
    container.addEventListener('mouseup', (e) => {
        setTimeout(() => {
            const selection = window.getSelection();
            const text = selection.toString().trim();

            if (text.length > 0) {
                selectedText = text;
                selectedRange = selection.getRangeAt(0);
                const rect = selectedRange.getBoundingClientRect();

                // Show trigger
                trigger.style.display = 'flex';
                trigger.style.top = `${rect.top + window.scrollY - 45}px`;
                trigger.style.left = `${rect.left + window.scrollX + (rect.width / 2) - 25}px`;

                // Hide popup if it was open
                popup.style.display = 'none';
            } else {
                if (!trigger.contains(e.target) && !popup.contains(e.target)) {
                    trigger.style.display = 'none';
                    popup.style.display = 'none';
                }
            }
        }, 10);
    });

    // Handle trigger click
    trigger.addEventListener('click', () => {
        const rect = selectedRange.getBoundingClientRect();

        // Show popup
        popup.style.display = 'block';
        popup.style.top = `${rect.top + window.scrollY - popup.offsetHeight - 15}px`;
        popup.style.left = `${rect.left + window.scrollX + (rect.width / 2) - (popup.offsetWidth / 2)}px`;

        // Populate preview with current text
        const preview = document.getElementById('popup-content-preview');
        if (preview) preview.innerHTML = selectedText;

        trigger.style.display = 'none';
        lastPopupResult = ""; // Reset result
    });

    // Close buttons
    const closeBtn = popup.querySelector('.close-popup');
    if (closeBtn) {
        closeBtn.onclick = () => popup.style.display = 'none';
    }

    // Action links
    const copyBtn = document.getElementById('popup-copy-btn');
    const replaceBtn = document.getElementById('popup-replace-btn');

    if (copyBtn) {
        copyBtn.onclick = () => {
            const textToCopy = lastPopupResult || selectedText;
            navigator.clipboard.writeText(textToCopy).then(() => {
                showNotification("Đã sao chép vào bộ nhớ tạm!", "success");
            });
        };
    }

    if (replaceBtn) {
        replaceBtn.onclick = () => {
            if (lastPopupResult && selectedRange) {
                const fragment = document.createRange().createContextualFragment(lastPopupResult);

                // Giữ data-block-id cũ cho tất cả phần tử mới
                const blockElement = selectedRange.commonAncestorContainer;
                const parentBlock = blockElement.nodeType === Node.ELEMENT_NODE
                    ? blockElement.closest('[data-block-id]')
                    : blockElement.parentElement?.closest('[data-block-id]');

                if (parentBlock) {
                    const blockId = parentBlock.getAttribute('data-block-id');
                    fragment.querySelectorAll('*').forEach(el => {
                        el.setAttribute('data-block-id', blockId);
                    });
                }

                // Xóa nội dung cũ và chèn fragment mới
                selectedRange.deleteContents();
                selectedRange.insertNode(fragment);

                // Đóng popup
                popup.style.display = 'none';
                showNotification("Đã thay thế thành công bằng nội dung AI!", "success");

                // lưu lại
                saveCurrentArticleToSession();

                // Reset
                selectedText = "";
                selectedRange = null;
                lastPopupResult = "";
            } else {
                showNotification("Không có nội dung AI để thay thế.", "info");
            }
        };
    }

    // Send button
    const sendBtn = document.getElementById('popup-send-btn');
    const input = document.getElementById('popup-chat-input');
    if (sendBtn && input) {
        sendBtn.onclick = () => {
            const val = input.value.trim();
            if (val) {
                handleAIAction('custom', val);
                input.value = '';
            }
        };
        input.onkeydown = (e) => {
            if (e.key === 'Enter') sendBtn.click();
        };
    }
}


async function handleAIAction(action, instruction) {
    if (!selectedText || !selectedRange) {
        showNotification("Vui lòng bôi đen đoạn văn cần chỉnh sửa!", "info");
        return;
    }
    const originalText = selectedRange.cloneContents().textContent || selectedText;


    const popup = document.getElementById('ai-selection-popup');
    const preview = document.getElementById('popup-content-preview');
    const sendBtn = document.getElementById('popup-send-btn');
    if (!preview || !sendBtn) return;

    // 1️⃣ Tìm block chứa selection
    let container = selectedRange.commonAncestorContainer;
    if (container.nodeType !== Node.ELEMENT_NODE) {
        container = container.parentNode;
    }

    let blockElement = container.closest('[data-block-id]');
    if (!blockElement) {
        blockElement = container.closest('p, h1, h2, h3, h4, h5, h6, div, li, blockquote');
    }

    if (!blockElement) {
        showNotification("Không xác định được đoạn văn để rewrite!", "error");
        return;
    }

    // 2️⃣ Đảm bảo block có ID
    let selectedBlockId = blockElement.getAttribute('data-block-id');
    if (!selectedBlockId) {
        selectedBlockId = `block-${Date.now()}-${Math.random().toString(36).slice(2)}`;
        blockElement.setAttribute('data-block-id', selectedBlockId);
    }

    // 3️⃣ Loading UI
    preview.innerHTML = `<div style="text-align:center;padding:20px">
        <i class="fas fa-spinner fa-spin"></i> Đang xử lý...
    </div>`;
    sendBtn.disabled = true;

    try {
        // 4️⃣ Lấy danh sách blocks
        let blocks = collectCurrentBlocks();

        // 5️⃣ BẮT BUỘC phải có block đang chọn
        if (!blocks.some(b => b.id === selectedBlockId)) {
            blocks.push({
                id: selectedBlockId,
                tag: blockElement.tagName.toLowerCase(),
                text: blockElement.innerHTML || selectedText
            });
        }

        // 6️⃣ Gọi API rewrite
        const response = await fetch('https://caiman-warm-swan.ngrok-free.app/api/v1/ai/contents/rewrite', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",

            },
            body: JSON.stringify({
                blocks,
                selected_block_id: selectedBlockId,
                instruction: instruction || "Viết lại đoạn này theo phong cách chuyên nghiệp, chuẩn SEO"
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.message || "Rewrite thất bại");
        }
        // 7️⃣ Hiển thị kết quả
        lastPopupResult = data.rewriting_content.trim();
        lastPopupResult = data.rewriting_content.trim();
        preview.innerHTML = `
            <div style="display:flex; flex-direction:column; gap:16px; font-size:14px; line-height:1.7;">

                <!-- ĐOẠN GỐC -->
                <div style="
                    background:#f3f4f6;
                    padding:12px;
                    border-radius:8px;
                    color:#9A9A9A;
                ">
                    ${escapeHtml(originalText)}
                </div>

                <!-- ĐOẠN AI -->
                <div style="
                    background:#ffffff;
                    padding:12px;
                    border-radius:8px;
                    border:1px solid #e5e7eb;
                    color:#151515;
                    font-weight:500;
                ">
                    ${escapeHtml(lastPopupResult)}
                </div>
            </div>
        `;


        showNotification("AI đã viết lại thành công!", "success");

    } catch (err) {
        console.error("❌ Rewrite Error:", err);
        preview.innerHTML = `
            <div style="color:red;background:#fee;padding:10px">
                <strong>Lỗi:</strong> ${escapeHtml(err.message)}
            </div>
        `;
        showNotification("Rewrite thất bại", "error");
    } finally {
        sendBtn.disabled = false;
    }
}

// ============================================================
// MAIN FUNCTION: LOAD ARTICLE DATA FROM API
// ============================================================
function loadArticleData() {
    const container = document.getElementById('sectionsContainer');
    const finalArticleDataJson = sessionStorage.getItem('finalArticleData');

    if (!finalArticleDataJson || !container) return;

    try {
        const responseData = JSON.parse(finalArticleDataJson);

        // ✅ Ưu tiên lấy từ responseData.article (cấu trúc API mới)
        const article = responseData.article || responseData.finalArticle || responseData;

        console.log("📊 Article data structure:", {
            hasBlocks: !!article.blocks,
            blocksLength: article.blocks?.length || 0,
            hasHtmlContent: !!article.html_content,
            title: article.title
        });

        // 1. Đổ tiêu đề bài viết
        const titleInput = document.getElementById('articleTitle');
        if (titleInput) {
            titleInput.value = article.title || responseData.final_title || "";
            console.log("✅ Set title:", titleInput.value);
        }

        // 2. Đổ mô tả ngắn (Meta Description)
        // Use helper to populate from meta_description, summary or first paragraph if meta missing
        const descriptionTextarea = document.querySelector('.short-description-section textarea');
        if (descriptionTextarea) {
            setShortDescription(article);
            console.log("✅ Set meta description (using helper)");
        }

        // 3. Xử lý hiển thị các ô nội dung
        container.innerHTML = ''; // Xóa sạch để nạp mới

        // ✅ FIX: Ưu tiên hiển thị từ html_content (vì chứa đầy đủ H2, H3 sau khi AI viết)
        // Blocks thường chỉ là outline ban đầu (thiếu H3)
        const outlineToUse = responseData.article_outline || responseData.outline || (article && article.outline);
        if (article.html_content && outlineToUse && Array.isArray(outlineToUse)) {
            console.log("Strict Mode");
            renderSectionsFromOutline(outlineToUse, article.html_content, responseData);
        } else if (article.html_content) {
            console.log("📋 Rendering from 'html_content' (Priority Source)");
            renderArticleSections(article.html_content, responseData);
        } else if (article.blocks && article.blocks.length > 0) {
            console.log("📋 Rendering from 'blocks' (Fallback Source)");
            renderFromBlocks(article.blocks, container);
        } else {
            console.warn("⚠️ No content found. Auto-triggering content generation...");
            // Kiểm tra tránh lặp vô tận hoặc gọi khi không có dữ liệu gốc
            if (responseData.article_outline || responseData.main_keyword) {
                ContentGeneration();
            } else {
                container.innerHTML = `
                    <div style="text-align:center; padding:60px; color:#9CA3AF; background: #F9FAFB; border-radius: 12px; border: 2px dashed #E5E7EB;">
                        <img src="./images/icon-ai-bot.png" style="width: 64px; opacity: 0.5; margin-bottom: 20px;">
                        <p style="font-size: 16px;">Không tìm thấy dữ liệu để bắt đầu viết bài.</p>
                    </div>
                `;
            }
        }

        // 4. Đổ các phần phụ khác
        renderReferences(responseData);
        renderImages(responseData);
        attachImageHandlers();

        // 5. Lưu toàn bộ HTML vào input ẩn (nếu có yêu cầu từ UI)
        const hiddenInput = document.getElementById('article-contens');
        if (hiddenInput && article.html_content) {
            hiddenInput.value = article.html_content;
        }

        // ✅ TỰ ĐỘNG BỐ SUNG H3 CHO OUTLINE NẾU THIẾU (Đồng bộ với dan-y-bai-viet.js)
        if (responseData.article_outline) {
            ensureH3SubsectionsForData(responseData.article_outline);
            // Lưu lại để các hàm generator sau này thấy H3
            sessionStorage.setItem('finalArticleData', JSON.stringify(responseData));
        }
    } catch (error) {
        console.error("❌ Lỗi hiển thị bài viết:", error);
        showNotification("Lỗi khi tải dữ liệu bài viết!", "error");
    }
}

// Hàm bổ trợ để nhóm các blocks vào từng ô UI
function renderFromBlocks(blocks, container) {
    let currentSection = null;
    let sectionCount = 0;
    let h2Count = 0;
    let h3Count = 0;

    console.log(`📦 renderFromBlocks: Processing ${blocks.length} blocks`);

    blocks.forEach((block, index) => {
        const tag = (block.tag || 'p').toLowerCase();
        const blockText = block.text || block.content || "";

        // CHỈ TẠO Ô MỚI CHO H2 (Và H1 nếu chưa có section nào)
        // H3, H4,... sẽ ở trong nội dung của H2
        if (tag === 'h2' || (tag === 'h1' && sectionCount === 0)) {
            // Nếu là H1 đầu tiên, thường là tiêu đề bài viết -> cập nhật Title Input thay vì tạo ô riêng
            if (tag === 'h1') {
                const titleInput = document.getElementById('articleTitle');
                if (titleInput && blockText) {
                    titleInput.value = blockText;
                    console.log("  ✅ Set H1 as article title");
                }
                return;
            }

            sectionCount++;
            h2Count++;
            currentSection = createSectionElement(blockText, sectionCount, block.id);
            container.appendChild(currentSection);
            console.log(`  ✅ Created H2 section #${h2Count}`);
        } else {
            // Nếu là đoạn văn (p) hoặc H3, H4... nhét vào ô hiện tại
            if (!currentSection) {
                // Trường hợp có văn bản trước khi có tiêu đề H2 (Giới thiệu)
                sectionCount++;
                h2Count++;
                currentSection = createSectionElement(blockText, sectionCount, block.id);
                container.appendChild(currentSection);
                console.log(` Created H2 section #${h2Count}`);
            }

            const editor = currentSection.querySelector('.content-editor');
            if (!editor) {
                console.error("❌ No content-editor found in current section!");
                return;
            }

            const el = document.createElement(tag);
            el.innerHTML = blockText;

            // Gắn data-block-id để giống hệt cấu trúc API/File mẫu
            if (block.id) {
                el.setAttribute('data-block-id', block.id);
            }

            editor.appendChild(el);

            // Log H3 specifically
            if (tag === 'h3') {
                h3Count++;
                console.log(`  ➡️  Added H3 #${h3Count}: "${blockText.substring(0, 40)}..." (ID: ${block.id})`);
            }
        }
    });

    console.log(`📊 Summary: ${h2Count} H2 sections, ${h3Count} H3 elements rendered`);
    console.log(`🔍 Verify: ${container.querySelectorAll('.content-editor h3').length} H3 elements in DOM`);
}

// Hàm tạo cấu trúc HTML cho một ô Section (giống giao diện của bạn)
function createSectionElement(title, index, id) {
    const div = document.createElement('div');
    div.className = 'section-item active'; // Mặc định mở
    if (id) div.setAttribute('data-id', id);

    div.innerHTML = `
        <div class="section-header" style="cursor: pointer;">
            <span class="chevron"><img src="./images/icon-nha-xuong.png" style="margin-right: 12px; transform: rotate(180deg);"></span>
            <input type="text" class="section-title-input" value="${escapeHtml(title)}" style="flex:1; font-weight:bold; border:none; background:transparent;">
        </div>
        <div class="section-body" style="display: block; padding: 15px;">
            <div class="content-editor" contenteditable="true" style="min-height: 50px; outline: none; color:20px"></div>
        </div>
    `;
    return div;
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
}

/**
 * Đảm bảo outline có các mục H3 (Đồng bộ logic với dan-y-bai-viet.js)
 */

function ensureH3SubsectionsForData(outline) {
    if (!Array.isArray(outline) || outline.length === 0) return;

    const hasH3 = outline.some(item => item.level === 3);
    if (!hasH3) {
        console.log("⚡ [viet-bai-seo] Dàn ý thiếu H3, đang tự động bổ sung...");

        const newItems = [];
        outline.forEach((item, idx) => {
            newItems.push(item);

            if (item.level === 2) {
                const titleLower = item.title.toLowerCase();
                if (titleLower.includes("kết luận") || titleLower.includes("lời kết")) return;

                // Tạo 2 H3 mẫu
                for (let i = 1; i <= 2; i++) {
                    newItems.push({
                        id: `h3-auto-${idx}-${i}-${Date.now()}`,
                        level: 3,
                        title: `${item.title} - Phân tích chi tiết ${i}`,
                        order: 0,
                        config: { word_count: 150, keywords: [], tone: null, internal_link: null }
                    });
                }
            }
        });

        // Cập nhật lại mảng outline (vì array pass by reference)
        outline.length = 0;
        newItems.forEach(item => outline.push(item));
    }
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
            content = contentMap["Giới thiệu"] || htmlContent;
        }



        // Auto-insert image if missing
        if (content && !content.includes('<img') && imagePool.length > 0) {
            const imgData = imagePool[imageIndex % imagePool.length];
            const imgHtml = createDraggableImageHtml(imgData.url, imgData.source);
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
    // ✅ Chỉ tách content theo H2 để giữ H3, H4 nằm trong nội dung của H2 (tránh bị mất nếu outline không khớp)
    const headings = Array.from(tempDiv.querySelectorAll('h1, h2'));
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
        const hMatch = line.match(/^(#{1,2})\s*(.*)$/); // Chỉ lấy H1, H2 làm key
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
    sectionDiv.classList.add('active');

    const sectionHeader = document.createElement('div');
    sectionHeader.className = 'section-header';
    sectionHeader.innerHTML = `
        <span class="chevron"><img src="./images/icon-nha-xuong.png" style="margin-right: 12px; transform: rotate(180deg);"></span>
        <input type="text" class="section-title-input" value="${escapeHtml(section.title)}">
    `;

    const sectionBody = document.createElement('div');
    sectionBody.className = 'section-body';
    sectionBody.style.display = 'block';

    // Internal content rendering
    const contentEditor = document.createElement('div');
    contentEditor.className = 'content-editor';
    contentEditor.contentEditable = true;

    // Parse content để tách H3 và render chúng rõ ràng
    if (content) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;

        // Count H3 elements for logging
        const h3Elements = tempDiv.querySelectorAll('h3');
        if (h3Elements.length > 0) {
            console.log(`📌 Section "${section.title}": Found ${h3Elements.length} H3 elements`);
        }

        // Set content (giữ nguyên HTML structure)
        contentEditor.innerHTML = content;
    } else {
        contentEditor.innerHTML = `<p style="color:gray">Nhấn để nhập nội dung cho: ${escapeHtml(section.title)}</p>`;
    }

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
// HÀM VIẾT BÀI 
// ============================================================
async function ContentGeneration() {
    const container = document.getElementById('sectionsContainer');
    const finalArticleDataJson = sessionStorage.getItem('finalArticleData');
    if (!finalArticleDataJson) return alert("Không tìm thấy dữ liệu!");

    // Hiển thị loading
    if (container) {
        container.innerHTML = `
            <div style="text-align:center; padding:50px;">
                <i class="fas fa-spinner fa-spin fa-3x" style="color:#4F46E5;"></i>
                <p style="margin-top:15px; font-weight:bold;">AI đang viết bài...</p>
            </div>`;
    }

    try {
        const articleData = JSON.parse(finalArticleDataJson);
        const titleInput = document.getElementById('articleTitle');
        const mainTitle = titleInput?.value || articleData.final_title || "Tiêu đề bài viết";

        // 1. Lấy outline từ UI sections
        const sections = document.querySelectorAll('.section-item');
        let outline = [];
        let orderCounter = 1;

        // Bắt đầu bằng H1 (Tiêu đề chính)
        outline.push({
            id: "h1-1",
            level: 1,
            title: mainTitle,
            order: orderCounter++,
            config: null
        });

        // Thêm H2-1 (Tổng quan)
        outline.push({
            id: "h2-1",
            level: 2,
            title: "Tổng quan về " + mainTitle,
            order: orderCounter++,
            config: {
                word_count: 100,
                keywords: [extractKeyword(mainTitle)],
                tone: null,
                internal_link: null
            }
        });

        if (sections.length > 0) {
            let h2Idx = 2;
            sections.forEach((sec) => {
                const titleInput = sec.querySelector('.section-title-input');
                const dataId = sec.getAttribute('data-id');
                const contentEditor = sec.querySelector('.content-editor');

                // Bỏ qua các mục đặc biệt đã được xử lý (H1, H2-1 cố định)
                if (dataId === 'h1-1' || dataId === 'h2-1' || dataId === 'h1-main' || dataId === 'section_intro') return;

                const sectionTitle = titleInput ? titleInput.value : `Mục chưa đặt tên`;
                const h2Id = dataId || `h2-${h2Idx++}`;

                // Thêm mục H2
                outline.push({
                    id: h2Id,
                    level: 2,
                    title: sectionTitle,
                    order: orderCounter++,
                    config: {
                        word_count: 200,
                        keywords: [extractKeyword(sectionTitle)],
                        tone: "Chuyên nghiệp",
                        internal_link: null
                    }
                });

                // ✅ TÌM H3 TRONG EDITOR CỦA SECTION NÀY
                if (contentEditor) {
                    const h3sInEditor = contentEditor.querySelectorAll('h3');
                    if (h3sInEditor.length > 0) {
                        h3sInEditor.forEach((h3, subIdx) => {
                            outline.push({
                                id: `${h2Id}-h3-${subIdx + 1}`,
                                level: 3,
                                title: h3.textContent.trim(),
                                order: orderCounter++,
                                config: {
                                    word_count: 150,
                                    keywords: [],
                                    tone: "Chuyên sâu",
                                    internal_link: null
                                }
                            });
                        });
                    }
                }
            });
        }

        // ✅ SYNC VỚI OUTLINE GỐC ĐỂ LẤY LẠI H3 (Rất quan trọng để đảm bảo AI viết đủ các mục đã lên kế hoạch)
        if (articleData.article_outline) {
            console.log("🔄 Syncing UI outline with original planned outline...");
            outline = addH3ToOutline(outline, articleData.article_outline);
        }

        // 1.5 Tự động bổ sung H3 mẫu nếu toàn bộ outline VẪN thiếu H3 (Phục vụ SEO tối thiểu)
        const hasH3 = outline.some(item => item.level === 3);
        if (!hasH3) {
            console.log("🔍 No H3 found after sync, auto-generating default H3 subsections...");
            const newOutline = [];
            let h3GlobalCounter = 1;

            outline.forEach((item) => {
                newOutline.push(item);
                if (item.level === 2 && !item.title.toLowerCase().includes("kết luận") && !item.title.toLowerCase().includes("lời kết")) {
                    for (let i = 1; i <= 2; i++) {
                        newOutline.push({
                            id: `h3-auto${h3GlobalCounter++}`,
                            level: 3,
                            title: `${item.title} - Phân tích chi tiết ${i}`,
                            order: 0,
                            config: { word_count: 150, keywords: [], tone: "Chuyên sâu", internal_link: null }
                        });
                    }
                }
            });
            outline = newOutline.map((item, idx) => ({ ...item, order: idx + 1 }));
        } else {
            // Re-order lại cho chắc chắn sau khi đã merge H3
            outline = outline.map((item, idx) => ({ ...item, order: idx + 1 }));
        }

        // 2. Lấy dữ liệu từ các nguồn khác
        const topNews = articleData.pipeline_results?.selected_news || articleData.crawledArticles || [];
        const mainKeyword = articleData.main_keyword || (articleData.seo_config ? articleData.seo_config.main_keyword : "") || "Thiết kế website";
        const secondaryKeywords = articleData.secondary_keywords || (articleData.seo_config ? articleData.seo_config.secondary_keywords : []) || ["web responsive", "UI/UX", "tối ưu SEO"];

        // 3. Xây dựng payload (Khớp 100% format mẫu của USER)
        const payload = {
            top_news: topNews.slice(0, 10).map((news, idx) => ({
                rank: idx + 1,
                title: news.title || "Tin tức liên quan",
                url: news.url || news.link || "#",
                images: news.images || [],
                content_preview: (news.content || news.content_preview || news.summary || "Nội dung tham khảo cho bài viết.").substring(0, 5000)
            })),
            target_language: articleData.target_language || "Tiếng Việt",
            config: {
                bot_id: articleData.config?.bot || articleData.config?.bot_id || articleData.config?.model || "GPT-4.1",
                article_length: String(articleData.config?.article_length || "500"),
                tone: articleData.config?.tone || articleData.config?.tone_of_voice || "Chuyên nghiệp",
                article_type: articleData.config?.article_type || "blog",
                custome_instructions: (articleData.config?.custom_instructions || articleData.config?.custome_instructions || "")
            },
            title: mainTitle,
            outline: outline,
            main_keyword: mainKeyword,
            secondary_keywords: secondaryKeywords
        };

        console.log("🚀 PAYLOAD CHI TIẾT:", JSON.stringify(payload, null, 2));

        // 5. Gọi API
        const data = await apiRequest('ai/contents', {
            method: "POST",
            body: JSON.stringify(payload)
        });

        console.log("✅ RESPONSE:", data);
        if (data.success && data.article) {
            // ✅ MERGE DATA để không mất article_outline và các config khác
            const mergedData = {
                ...articleData,
                article: data.article,
                success: true
            };
            sessionStorage.setItem('finalArticleData', JSON.stringify(mergedData));
            loadArticleData();
            showNotification(`✅ Đã viết xong bài viết với ${outline.length} mục!`, "success");
        } else {
            const errorMsg = data.error || data.message || "API lỗi";
            showNotification(`❌ ${errorMsg}`, "error");
            console.error("API Error:", data);
            loadArticleData();
        }

    } catch (error) {
        console.error("❌ Lỗi khi gọi API:", error);
        showNotification(`❌ Lỗi: ${error.message}`, "error");
        loadArticleData();
    }
}

// ============================================================
// HÀM BỔ TRỢ
// ============================================================

function extractKeyword(title) {
    if (!title) return "chủ đề";

    const commonKeywords = ["thiết kế website", "du lịch", "SEO", "marketing", "công nghệ", "ẩm thực", "...",];

    for (const keyword of commonKeywords) {
        if (title.toLowerCase().includes(keyword.toLowerCase())) {
            return keyword;
        }
    }

    // Lấy từ đầu tiên
    const words = title.split(' ');
    return words.length > 0 ? words[0] : "chủ đề";
}

function addH3ToOutline(outline, originalOutline) {
    if (!outline || !originalOutline || originalOutline.length === 0) return outline;

    const newOutline = [];

    outline.forEach((item) => {
        newOutline.push(item);

        // Nếu là H2, tìm các H3 đi theo nó trong outline gốc
        if (item.level === 2) {
            const normalize = s => s.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '').trim();
            const itemNorm = normalize(item.title);

            // Tìm index của H2 tương ứng trong outline gốc
            // Ưu tiên match theo ID, sau đó mới fuzzy match theo Title
            const originalH2Index = originalOutline.findIndex(orig => {
                if (orig.level !== 2) return false;
                if (item.id && orig.id && item.id === orig.id) return true;

                const origNorm = normalize(orig.title);
                return origNorm === itemNorm || origNorm.includes(itemNorm) || itemNorm.includes(origNorm);
            });

            if (originalH2Index !== -1) {
                // Lấy tất cả H3 thuộc H2 này (dừng khi gặp H1/H2 tiếp theo)
                for (let i = originalH2Index + 1; i < originalOutline.length; i++) {
                    const nextItem = originalOutline[i];
                    if (nextItem.level === 3) {
                        // Kiểm tra xem H3 này đã có trong outline chưa để tránh duplicate
                        const alreadyExists = newOutline.some(o => o.level === 3 && normalize(o.title) === normalize(nextItem.title));
                        if (!alreadyExists) {
                            newOutline.push({
                                ...nextItem,
                                id: nextItem.id || `h3-${item.id}-${i}-${Date.now()}`,
                                order: 0 // Sẽ được re-index ở cuối
                            });
                        }
                    } else if (nextItem.level <= 2) {
                        break;
                    }
                }
            }
        }
    });
    console.log("🚀 NEW OUTLINE WITH H3s:", newOutline);

    // Cập nhật lại order cho toàn bộ outline
    return newOutline.map((item, idx) => ({
        ...item,
        order: idx + 1
    }));
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
// RENDER ARTICLE SECTIONS –
// ============================================================

function renderArticleSections(htmlContent, articleData) {
    const container = document.getElementById('sectionsContainer');
    if (!container) return;

    container.innerHTML = '';

    if (!htmlContent) {
        console.warn("Không có html_content để render");
        return;
    }

    const imagePool = getImagePool(articleData);
    let imageIndex = 0;
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;

    let currentSection = null;
    let currentEditor = null;
    let sectionCount = 0;
    let buffer = []; // Lưu nội dung trước khi gặp H2 đầu tiên

    Array.from(tempDiv.childNodes).forEach(node => {
        if (node.nodeType === Node.TEXT_NODE && !node.textContent.trim()) return;

        const tag = node.tagName ? node.tagName.toUpperCase() : '';

        if (tag === 'H2') {
            // Finalize previous section: nếu section trước đó tồn tại mà chưa có ảnh, chèn fallback
            if (currentEditor && !currentEditor.querySelector('img') && imagePool.length > 0) {
                const imgData = imagePool[imageIndex % imagePool.length];
                currentEditor.insertAdjacentHTML('afterbegin', createDraggableImageHtml(imgData.url, imgData.source));
                imageIndex++;
            }
            // Đổ buffer vào section hiện tại
            if (buffer.length > 0) {
                if (!currentEditor) {
                    sectionCount++;
                    currentSection = createSectionElement("Giới thiệu", sectionCount, "intro-section");
                    currentSection.classList.add('active');
                    container.appendChild(currentSection);
                    currentEditor = currentSection.querySelector('.content-editor');
                }
                buffer.forEach(n => currentEditor.appendChild(n.cloneNode(true)));
                buffer = [];
                // Nếu section vừa được tạo không có ảnh, chèn ảnh fallback
                if (currentEditor && !currentEditor.querySelector('img') && imagePool.length > 0) {
                    const imgData = imagePool[imageIndex % imagePool.length];
                    currentEditor.insertAdjacentHTML('afterbegin', createDraggableImageHtml(imgData.url, imgData.source));
                    imageIndex++;
                }
            }

            // Tạo section mới (không chèn ảnh ngay, chờ đến khi section hoàn tất để kiểm tra tránh duplicate)
            sectionCount++;
            const title = node.textContent.trim() || `Mục ${sectionCount}`;
            currentSection = createSectionElement(title, sectionCount, `section_${sectionCount}`);
            currentSection.classList.add('active');
            container.appendChild(currentSection);
            currentEditor = currentSection.querySelector('.content-editor');
        } else if (tag === 'H1') {
            const titleInput = document.getElementById('articleTitle');
            if (titleInput) titleInput.value = node.textContent.trim();
        } else {
            if (currentEditor) {
                currentEditor.appendChild(node.cloneNode(true));
            } else {
                buffer.push(node);
            }
        }
    });

    // Đổ buffer còn lại
    if (buffer.length > 0) {
        if (!currentEditor) {
            sectionCount++;
            currentSection = createSectionElement("Giới thiệu", sectionCount, "intro-section");
            currentSection.classList.add('active');
            container.appendChild(currentSection);
            currentEditor = currentSection.querySelector('.content-editor');
        }
        buffer.forEach(n => currentEditor.appendChild(n.cloneNode(true)));

        // Fallback insert image if none
        if (currentEditor && !currentEditor.querySelector('img') && imagePool.length > 0) {
            const imgData = imagePool[imageIndex % imagePool.length];
            currentEditor.insertAdjacentHTML('afterbegin', createDraggableImageHtml(imgData.url, imgData.source));
            imageIndex++;
        }
    }

    // Finalize last section: nếu cuối cùng vẫn chưa có ảnh, chèn fallback
    if (currentEditor && !currentEditor.querySelector('img') && imagePool.length > 0) {
        const imgData = imagePool[imageIndex % imagePool.length];
        currentEditor.insertAdjacentHTML('afterbegin', createDraggableImageHtml(imgData.url, imgData.source));
        imageIndex++;
    }
    setupSectionAccordions();
    console.log(`✅ ĐÃ RENDER LẠI THÀNH CÔNG – ${sectionCount} section giữ nguyên sau F5!`);
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

    // Ưu tiên lấy từ cấu trúc API mới
    const article = articleData.article || articleData.finalArticle || articleData;

    if (article.references && Array.isArray(article.references)) {
        references = article.references;
    } else if (articleData.pipeline_results?.selected_news) {
        references = articleData.pipeline_results.selected_news;
    } else if (article.sources) {
        references = article.sources;
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

    // Optional: Trigger lần đầu nếu tab Media đang active mặc định
    const defaultActive = document.querySelector('.tab-btn.active');
    if (defaultActive) defaultActive.click();
}

function setupToolbar() {
    const toolBtns = document.querySelectorAll('.tool-btn');
    toolBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const command = btn.getAttribute('data-command');
            const value = btn.getAttribute('data-value');

            if (command) {
                document.execCommand(command, false, value);
                // Maintain focus in the active section if possible
                const activeSection = document.querySelector('.section-item.active .content-editor');
                if (activeSection) activeSection.focus();
            }

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

    // 4. Extract from html_content if present
    const htmlSource = (articleData.article?.html_content || articleData.finalArticle?.html_content || articleData.html_content);
    if (htmlSource && typeof htmlSource === 'string') {
        try {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = htmlSource;
            const imgEls = tempDiv.querySelectorAll('img');
            imgEls.forEach(img => {
                const src = img.getAttribute('src');
                if (src && !usedUrls.has(src)) {
                    usedUrls.add(src);
                    images.push({ url: src, source: 'From HTML Content' });
                }
            });
        } catch (e) {
            console.warn('⚠️ Không thể phân tích html_content để lấy ảnh:', e.message);
        }
    }

    console.log('📷 Image pool size:', images.length);
    return images;
}

// ============================================================
// RENDER IMAGES TO MEDIA TAB
// ============================================================
function renderImages(articleData) {
    const imageGrid = document.getElementById('imageGrid');
    if (!imageGrid) {
        console.warn(" Không tìm thấy element #imageGrid");
        return;
    }

    console.log(" Đang render danh sách ảnh...");
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


    // 2. Thử lấy từ config mới của AI (article.images)
    const article = articleData.article || articleData.finalArticle || articleData;
    if (article.images && Array.isArray(article.images)) {
        article.images.forEach(img => {
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
        item.draggable = true; // Enable drag

        item.innerHTML = `
            <img src="${imgData.url}" onerror="this.src='./assets/images/placeholder-image.png'; this.parentElement.style.display='none';" draggable="false">
            <div class="image-overlay">Kéo hoặc Click để chèn</div>
        `;

        // DRAG START
        item.addEventListener('dragstart', (e) => {
            const html = createDraggableImageHtml(imgData.url, imgData.source);
            e.dataTransfer.setData('text/html', html);
            e.dataTransfer.setData('text/plain', imgData.url);
            e.dataTransfer.effectAllowed = 'copy';

            // Highlight the source
            item.style.opacity = '0.5';
        });

        item.addEventListener('dragend', () => {
            item.style.opacity = '1';
        });

        // CLICK to insert
        item.addEventListener('click', () => {
            insertImageToActiveSection(imgData.url, imgData.source);
        });

        imageGrid.appendChild(item);
    });
}

// helper tạo ảnh có thể kéo và xoá 
function createDraggableImageHtml(url, source = '') {
    return `
    <div class="draggable-image" contenteditable="false" draggable="true" title="Nguồn: ${escapeHtml(source)}">
      <img src="${url}" loading="lazy" decoding="async">
      <button class="delete-image-btn" type="button" title="Xóa ảnh">×</button>
    </div>
    <p><br></p>`; // Thêm dòng trống phía sau để dễ nhập văn bản tiếp theo
}

function insertImageToActiveSection(url, source = 'User Inserted') {
    // Tìm section đang active hoặc section đầu tiên
    let targetEditor = document.querySelector('.section-item.active .content-editor');
    if (!targetEditor) {
        targetEditor = document.querySelector('.content-editor');
    }

    if (targetEditor) {
        const imgHtml = createDraggableImageHtml(url, source);

        // Chèn vào vị trí con trỏ hoặc cuối editor
        targetEditor.focus();

        // Try to insert at caret
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0 && targetEditor.contains(selection.getRangeAt(0).commonAncestorContainer)) {
            document.execCommand('insertHTML', false, imgHtml);
        } else {
            // Append to end
            const frag = document.createRange().createContextualFragment(imgHtml);
            targetEditor.appendChild(frag);
        }
        showNotification("Đã chèn ảnh vào bài viết!", "success");
        saveCurrentArticleToSession();
    } else {
        alert("Vui lòng chọn một đoạn nội dung để chèn ảnh.");
    }
}

// ============================================================
// ATTACH IMAGE HANDLERS FOR MEDIA TAB
// ============================================================
function attachImageHandlers() {
    const imageGrid = document.getElementById('imageGrid');
    if (!imageGrid) return;

    // Xử lý khi click vào ảnh
    imageGrid.addEventListener('click', (e) => {
        const imgItem = e.target.closest('.grid-image-item');
        if (!imgItem) return;

        const img = imgItem.querySelector('img');
        if (!img || !img.src) return;

        // 1. Hiển thị xác nhận
        const confirmInsert = confirm("Bạn muốn chèn ảnh này vào bài viết?");
        if (!confirmInsert) return;

        // 2. Tìm editor đang active
        let targetEditor = document.querySelector('.section-item.active .content-editor');
        if (!targetEditor) {
            targetEditor = document.querySelector('.content-editor');
        }

        if (targetEditor) {
            const imgHtml = `
                <div style="text-align:center; margin:20px 0;">
                    <img src="${img.src}" 
                         style="max-width:100%; border-radius:8px; 
                                box-shadow:0 4px 6px rgba(0,0,0,0.1);"
                         alt="Ảnh minh họa">
                    <p style="font-size:12px; color:#666; margin-top:8px; font-style:italic;">
                        Nguồn: ${imgItem.title.replace('Nguồn: ', '')}
                    </p>
                </div>
                <p></p>
            `;

            // Chèn vào vị trí con trỏ hoặc cuối editor
            targetEditor.focus();

            // Kiểm tra nếu có selection
            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                range.deleteContents();

                const div = document.createElement('div');
                div.innerHTML = imgHtml;
                const fragment = document.createDocumentFragment();
                Array.from(div.childNodes).forEach(node => {
                    fragment.appendChild(node.cloneNode(true));
                });

                range.insertNode(fragment);
                range.collapse(false);
            } else {
                // Chèn vào cuối
                document.execCommand('insertHTML', false, imgHtml);
            }

            showNotification("✅ Đã chèn ảnh vào bài viết!", "success");
        } else {
            alert("⚠️ Vui lòng chọn một section để chèn ảnh.");
        }
    });

    // Xử lý lỗi ảnh
    const images = imageGrid.querySelectorAll('img');
    images.forEach(img => {
        img.onerror = function () {
            this.style.opacity = '0.3';
            this.parentElement.querySelector('.image-overlay').textContent = 'Lỗi tải ảnh';
            this.parentElement.style.cursor = 'not-allowed';
        };
    });
}

// ============================================================
// SHOW NOTIFICATION
// ============================================================
function showNotification(message, type = "info") {
    // Xóa thông báo cũ nếu có
    const oldNoti = document.querySelector('.custom-notification');
    if (oldNoti) oldNoti.remove();

    // Tạo thông báo mới
    const noti = document.createElement('div');
    noti.className = `custom-notification ${type}`;
    noti.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 8px;
        background: ${type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#3B82F6'};
        color: white;
        font-weight: 500;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 9999;
        animation: slideIn 0.3s ease;
    `;

    // Thêm CSS animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }h
        }
    `;
    document.head.appendChild(style);

    noti.textContent = message;
    document.body.appendChild(noti);

    // Tự động xóa sau 3 giây
    setTimeout(() => {
        noti.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => noti.remove(), 300);
    }, 3000);
}

// lấy range từ toạ độ chuột (cross-browser)

function getCaretRangeFromPoint(x, y) {
    if (document.caretRangeFromPoint) {
        return document.caretRangeFromPoint(x, y);
    } else if (document.caretPositionFromPoint) {
        const pos = document.caretPositionFromPoint(x, y);
        const range = document.createRange();
        range.setStart(pos.offsetNode, pos.offset);
        range.collapse(true);
        return range;
    }
    return null;
}


// ============================================================
// COLLECT ALL BLOCKS FROM CURRENT ARTICLE (for AI rewrite)
// ============================================================

function collectCurrentBlocks() {
    const blocks = [];
    const sections = document.querySelectorAll('#sectionsContainer .section-item');

    sections.forEach(section => {
        const sectionTitle = section.querySelector('.section-title-input')?.value.trim() || "Giới thiệu";
        const editor = section.querySelector('.content-editor');

        if (!editor) return;

        // Duyệt từng phần tử con trong editor
        editor.childNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
                const tagName = node.tagName.toLowerCase();
                let text = '';

                if (tagName === 'img') {
                    // Bỏ qua ảnh, không cần gửi làm block text
                    return;
                } else if (tagName === 'div' && node.classList.contains('draggable-image')) {
                    // Bỏ qua wrapper ảnh
                    return;
                } else if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'blockquote', 'ul', 'ol', 'li'].includes(tagName)) {
                    text = node.textContent.trim();
                } else {
                    text = node.textContent.trim();
                }

                if (text) {
                    let blockId = node.getAttribute('data-block-id');
                    if (!blockId) {
                        blockId = `auto-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                        node.setAttribute('data-block-id', blockId); // <-- Quan trọng: gán vào DOM
                    }
                    blocks.push({
                        id: blockId,
                        tag: tagName,
                        text: text
                    });

                    // Gắn tạm data-block-id để lần sau dùng lại (nếu chưa có)
                    if (!node.hasAttribute('data-block-id')) {
                        node.setAttribute('data-block-id', blockId);
                    }
                }
            } else if (node.nodeType === Node.TEXT_NODE) {
                const text = node.textContent.trim();
                if (text) {
                    const blockId = `text-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                    blocks.push({
                        id: blockId,
                        tag: 'p',
                        text: text
                    });
                }
            }
        });
    });

    console.log("📦 Collected blocks for rewrite:", blocks.length, blocks);
    return blocks;
}
// ============================================================
// TỰ ĐỘNG LƯU THAY ĐỔI ĐỂ KHI F5 VẪN GIỮ NGUYÊN NỘI DUNG MỚI
// ============================================================

function saveCurrentArticleToSession() {
    const container = document.getElementById('sectionsContainer');
    if (!container) return;

    let html = '';

    container.querySelectorAll('.section-item').forEach(section => {
        const titleInput = section.querySelector('.section-title-input');
        const editor = section.querySelector('.content-editor');

        if (!editor) return;

        const title = titleInput?.value?.trim();
        if (title) {
            html += `<h2>${title}</h2>\n`;
        }
        html += editor.innerHTML + '\n';
    });

    const data = JSON.parse(sessionStorage.getItem('finalArticleData') || '{}');

    if (!data.article) data.article = {};
    data.article.html_content = html;

    sessionStorage.setItem('finalArticleData', JSON.stringify(data));

    console.log("💾 Đã lưu html_content mới vào sessionStorage");
}


// Lắng nghe mọi thay đổi trong bài viết và lưu tự động
document.getElementById('sectionsContainer')?.addEventListener('input', () => {
    setTimeout(saveCurrentArticleToSession, 500); // chờ DOM cập nhật xong
});

document.getElementById('articleTitle')?.addEventListener('input', saveCurrentArticleToSession);
document.querySelector('.short-description-section textarea')?.addEventListener('input', saveCurrentArticleToSession);

// Đặc biệt: Lưu ngay sau khi nhấn "Thay thế" từ popup AI
const replaceBtn = document.getElementById('popup-replace-btn');
if (replaceBtn) {
    replaceBtn.addEventListener('click', () => {
        setTimeout(saveCurrentArticleToSession, 100);
    });
}

// ==== Tìm kiếm hinh ảnh thuộc bài viết đó =====
const imageInput = document.getElementById("imageSearchInput");
const imageGrid = document.getElementById("imageGrid");
const searchLoading = document.getElementById("searchLoading");

// Enter để search
imageInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        searchImages();
    }
});

async function searchImages() {
    const keyword = imageInput.value.trim();
    if (!keyword) return;

    imageGrid.innerHTML = "";
    searchLoading.style.display = "block";

    try {
        const response = await fetch(
            "https://caiman-warm-swan.ngrok-free.app/api/v1/crawl/images",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "ngrok-skip-browser-warning": "true"
                },
                body: JSON.stringify({
                    query: keyword,
                    num_results: 12
                })
            }
        );

        const data = await response.json();
        searchLoading.style.display = "none";

        if (!data.success) {
            imageGrid.innerHTML = `<p style="color:red;">${data.message}</p>`;
            return;
        }

        if (!data.images || data.images.length === 0) {
            imageGrid.innerHTML = `<p style="grid-column:1/-1;text-align:center;">Không tìm thấy ảnh</p>`;
            return;
        }

        data.images.forEach(img => {
            const imgWrap = document.createElement("div");
            imgWrap.style.cursor = "pointer";

            const imgEl = document.createElement("img");
            imgEl.src = img.image_url;
            imgEl.style.width = "100%";
            imgEl.style.borderRadius = "8px";
            imgEl.style.objectFit = "cover";

            // click để chèn vào editor
            imgEl.onclick = () => insertImageToEditor(img.image_url);

            imgWrap.appendChild(imgEl);
            imageGrid.appendChild(imgWrap);
        });

    } catch (err) {
        searchLoading.style.display = "none";
        imageGrid.innerHTML = `<p style="color:red;">Lỗi gọi API</p>`;
        console.error(err);
    }
}

function insertImageToEditor(url) {
    const editor = document.querySelector(".content-editor");
    if (!editor) return;

    const img = document.createElement("img");
    img.src = url;
    img.style.maxWidth = "100%";
    img.style.display = "block";
    img.style.margin = "12px 0";

    editor.appendChild(img);
}



// ============================================================
// ATTACH IMAGE HANDLERS FOR MEDIA TAB
// ============================================================
function attachImageHandlers() {
    // Chỉ giữ lại fallback xử lý lỗi ảnh trong grid
    const imageGrid = document.getElementById('imageGrid');
    if (!imageGrid) return;

    // Xử lý lỗi ảnh bằng sự kiện delegation cho hiệu quả
    imageGrid.addEventListener('error', (e) => {
        if (e.target.tagName === 'IMG') {
            const img = e.target;
            img.style.opacity = '0.3';
            const overlay = img.parentElement.querySelector('.image-overlay');
            if (overlay) overlay.textContent = 'Lỗi tải ảnh';
            img.parentElement.style.cursor = 'not-allowed';
            img.parentElement.draggable = false;
        }
    }, true);
}


// ============================================================
// SHOW NOTIFICATION
// ============================================================
function showNotification(message, type = "info") {
    // Xóa thông báo cũ nếu có
    const oldNoti = document.querySelector('.custom-notification');
    if (oldNoti) oldNoti.remove();

    // Tạo thông báo mới
    const noti = document.createElement('div');
    noti.className = `custom-notification ${type}`;
    noti.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 8px;
        background: ${type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#3B82F6'};
        color: white;
        font-weight: 500;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 9999;
        animation: slideIn 0.3s ease;
    `;

    // Thêm CSS animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }h
        }
    `;
    document.head.appendChild(style);

    noti.textContent = message;
    document.body.appendChild(noti);

    // Tự động xóa sau 3 giây
    setTimeout(() => {
        noti.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => noti.remove(), 300);
    }, 3000);
}

// lấy range từ toạ độ chuột (cross-browser)

function getCaretRangeFromPoint(x, y) {
    if (document.caretRangeFromPoint) {
        return document.caretRangeFromPoint(x, y);
    } else if (document.caretPositionFromPoint) {
        const pos = document.caretPositionFromPoint(x, y);
        const range = document.createRange();
        range.setStart(pos.offsetNode, pos.offset);
        range.collapse(true);
        return range;
    }
    return null;
}


// ============================================================
