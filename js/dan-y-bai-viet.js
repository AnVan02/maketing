
let outlineData = {
    title: "",
    sections: []
};

// ============================================
// 1. LẤY DỮ LIỆU VÀ KHỞI TẠO
// ============================================

function loadOutlineData() {
    console.log('📥 Đang load dữ liệu outline...');

    // Thử lấy từ sessionStorage trước
    const savedOutline = sessionStorage.getItem('generatedOutline');
    if (savedOutline) {
        try {
            const parsedOutline = JSON.parse(savedOutline);
            console.log('✅ Lấy outline từ sessionStorage:', parsedOutline);

            // Kiểm tra format dữ liệu
            if (parsedOutline.outline && Array.isArray(parsedOutline.outline)) {
                convertFromPipelineFormat(parsedOutline.outline);
            } else if (parsedOutline.sections) {
                outlineData = parsedOutline;
            }

            renderOutline();
            return;
        } catch (e) {
            console.error('❌ Lỗi parse outline từ sessionStorage:', e);
        }
    }

    // Tạo outline mặc định
    console.log('⚠️ Không tìm thấy dữ liệu, tạo outline mặc định');
    // createDefaultOutline(); // Không tự tạo default nếu không có lệnh, để tránh overwrite khi đang edit? 
    // Nhưng logic cũ là tạo default.
    createDefaultOutline();
    renderOutline();
}

function convertFromPipelineFormat(apiOutline) {
    outlineData.sections = [];

    // Ưu tiên lấy title từ sessionStorage nếu có (được lưu ở bước filter)
    const savedOutline = JSON.parse(sessionStorage.getItem('generatedOutline') || '{}');
    if (savedOutline.title) {
        outlineData.title = savedOutline.title;
    } else {
        // Fallback: Lấy title từ H1 đầu tiên
        const h1Item = apiOutline.find(item => item.level === 1);
        if (h1Item) {
            outlineData.title = h1Item.title || "";
        }
    }

    // Phân nhóm H2 và H3
    let currentH2 = null;

    apiOutline.forEach((item, index) => {
        // Bỏ qua H1 (đã lấy title)
        if (item.level === 1) return;

        if (item.level === 2) {
            // Tạo section H2 mới
            currentH2 = {
                id: item.id || `h2-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                title: item.title || "",
                subsections: [],
                config: item.config || null
            };
            outlineData.sections.push(currentH2);
        } else if (item.level === 3 && currentH2) {
            // Thêm H3 vào H2 hiện tại
            currentH2.subsections.push({
                id: item.id || `h3-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                title: item.title || "",
                config: item.config || null
            });
        }
    });

    console.log('✅ Đã convert outline:', outlineData);
}

function createDefaultOutline() {
    const mainKeyword = document.getElementById('user_query')?.value ||
        document.getElementById('internet_user_query')?.value ||
        "Máy tính AI";

    outlineData = {
        title: `${mainKeyword} - Hướng dẫn toàn diện`,
        sections: [
            {
                id: `h2-demo-1`,
                title: `Tổng quan về ${mainKeyword}`,
                config: {
                    word_count: 300,
                    keywords: ["AI", "công nghệ", "xu hướng"],
                    internal_link: "auto"
                },
                subsections: []
            },
            {
                id: `h2-demo-2`,
                title: `Lợi ích vượt trội cho doanh nghiệp`,
                config: {
                    word_count: 500,
                    keywords: ["tăng trưởng", "tiết kiệm", "tự động hóa"],
                    internal_link: null
                },
                subsections: []
            },
            {
                id: `h2-demo-3`,
                title: `Các dòng máy tính AI phổ biến hiện nay`,
                config: {
                    word_count: 400,
                    keywords: ["NPU", "Intel Core Ultra", "Snapdragon X Elite"],
                    internal_link: null
                },
                subsections: []
            }
        ]
    };
    console.log("Dữ liệu demo đã được tạo:", outlineData);
}

// ============================================
// 2. RENDER GIAO DIỆN
// ============================================

// ============================================
// STATE TRACKING FOR UI
// ============================================
let expandedSections = new Set(); // Stores IDs of expanded sections

function renderOutline() {
    console.log('🎨 Đang render outline...');

    const outlineResult = document.getElementById('outlineResult');
    const listContainer = document.getElementById('outlineList');

    if (!outlineResult || !listContainer) return;

    // Hiển thị khung kết quả
    outlineResult.style.display = 'block';

    // Render danh sách (Title + Sections)
    listContainer.innerHTML = `
        <div class="outline-actions-header" style="display: flex; justify-content: flex-end; gap: 10px; margin-bottom: 20px; color:#4B5563">
             <button class="btn-action-outline"><i class="fas fa-undo"></i><img src="./images/icon-khoi-phuc.png" style="margin-right: 12px;">Khôi phục</button>
             <button class="btn-action-outline"><i class="fas fa-book"></i> Hướng dẫn</button>
        </div>
        <div class="outline-title-section">
            <label>Dàn ý bài viết</label>
            <div style="position: relative;color:#727272">
                <input type="text" 
                       id="outlineMainTitle" 
                       class="outline-main-title-input" 
                       value="${escapeHtml(outlineData.title)}" 
                       placeholder="Nhập tiêu đề chính..." style="color:1037B8">
                <span class="h1-badge">H1</span>
            </div>
        </div>

        <div class="outline-sections" id="outlineSections">
            ${outlineData.sections.map((section, index) => createSectionHTML(section, index)).join('')}
        </div>

        <button id="addSectionBtn" class="btn-add-section-outline">
            <i class="fas fa-plus"></i> Thêm tiêu đề
        </button>
    `;

    // Gắn event listeners
    attachEventListeners();
    saveToSessionStorage();

    console.log('✅ Render hoàn tất');
}

function createSectionHTML(section, index) {
    const wordCount = section.config?.word_count || 150;
    const keywords = (section.config?.keywords || []).join(', ');
    const hasLink = !!section.config?.internal_link;
    // const uniqueID = section.id; 

    // Expand state: First one is default active, OR if it's in our expanded set
    // Also add to set if it is the first one and set is empty (initial load)
    let isExpanded = '';

    // Initialize first item as expanded if no state exists yet
    if (index === 0 && expandedSections.size === 0) {
        expandedSections.add(section.id);
    }

    if (expandedSections.has(section.id)) {
        isExpanded = 'active';
    }

    return `
        <div class="outline-section ${isExpanded}" data-id="${section.id}">
            <!-- Header Row -->
            <div class="section-header" onclick="toggleSection('${section.id}')">
                <img src="./images/icon-nha-xuong.png" style="margin-right: 12px;">
                <div class="header-left">
                    <span class="chevron-icon"><i class="fas fa-chevron-down"></i></span>
                    <input type="text" 
                           class="h2-input" 
                           value="${escapeHtml(section.title)}" 
                           placeholder="Nhập tiêu đề mục..."
                           onclick="event.stopPropagation();"
                           data-section-id="${section.id}">
                    <span class="level-badge">H2</span>
                </div>
                <div class="header-right">
                    <button class="btn-icon" title="Chỉnh sửa"><img src="./images/icon-sua.png" style="margin-right: 12px;"><i class="fas fa-pen"></i></button>
                    <button class="btn-icon btn-remove" onclick="event.stopPropagation(); removeSection('${section.id}')" title="Xóa"><img src="./images/icon-xoa.png" style="margin-right: 12px;"><i class="fas fa-times"></i></button>
                </div>
            </div>

            <!-- Config Body -->
            <div class="section-config-area">
                <!-- Row 1: Word Count Slider -->
                <div class="config-row">
                    <div class="config-label">Tỷ lệ độ dài:</div>
                    <div class="slider-container">
                        <div class="slider-tooltip" style="left: ${(wordCount / 500) * 100}%">${wordCount}%</div>
                        <input type="range" min="50" max="500" value="${wordCount}" class="range-slider" 
                               oninput="updateWordCount(this, '${section.id}')"
                               onclick="event.stopPropagation();">
                    </div>
                </div>

                <!-- Row 2: Keywords -->
                <div class="config-row" style="flex-wrap: wrap; align-items: flex-start;">
                    <div class="config-label" style="padding-top: 5px;">Keyword tuỳ chỉnh:</div>
                    <div style="flex: 1;">
                        <input type="text" class="config-input-line" 
                               placeholder="Nhập từ khóa và nhấn Enter để thêm..."
                               onkeydown="if(event.key === 'Enter') { addKeywordTag(this, '${section.id}'); event.preventDefault(); }"
                               onclick="event.stopPropagation();">
                        <div class="tags-container" id="tags-${section.id}">
                            ${(section.config?.keywords || []).map(kw => `
                                <span class="tag">${escapeHtml(kw)} <span class="close-icon" onclick="removeKeywordTag(this, '${section.id}')">×</span></span>
                            `).join('')}
                        </div>
                    </div>
                </div>
                
                <!-- Row 3: Internal Link -->
                <div class="config-row" style="flex-wrap: wrap; align-items: flex-start;">
                    <div class="config-label" style="padding-top: 5px;">Liên kết nội bộ:</div>
                    <div style="flex: 1;">
                        <input type="text" class="config-input-line" 
                               placeholder="Nhập đường dẫn và nhấn Enter để thêm..."
                               onkeydown="if(event.key === 'Enter') { addInternalLinkTag(this, '${section.id}'); event.preventDefault(); }"
                               onclick="event.stopPropagation();">
                        <div class="tags-container" id="links-${section.id}">
                            ${(section.config?.internal_links || []).map(link => `
                                <span class="tag">${escapeHtml(link)} <span class="close-icon" onclick="removeInternalLinkTag(this, '${section.id}')">×</span></span>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// ============================================
// 3. XỬ LÝ SỰ KIỆN & LOGIC
// ============================================

window.toggleSection = function (id) {
    const el = document.querySelector(`.outline-section[data-id="${id}"]`);
    if (el) {
        el.classList.toggle('active');
        if (el.classList.contains('active')) {
            expandedSections.add(id);
        } else {
            expandedSections.delete(id);
        }
    }
}

window.updateWordCount = function (el, id) {
    const val = el.value;
    const tooltip = el.parentElement.querySelector('.slider-tooltip');
    if (tooltip) {
        tooltip.textContent = val + ' %';
        tooltip.style.left = (val / 500) * 100 + '%';
    }

    // Update data
    const section = outlineData.sections.find(s => s.id === id);
    if (section) {
        if (!section.config) section.config = {};
        section.config.word_count = parseInt(val);
        saveToSessionStorage();
    }
}

window.updateKeywords = function (el, id) {
    // This is now replaced by tag logic, but keeping for compatibility if ever needed
}

window.addKeywordTag = function (el, id) {
    const val = el.value.trim();
    if (!val) return;

    const section = outlineData.sections.find(s => s.id === id);
    if (section) {
        if (!section.config) section.config = {};
        if (!section.config.keywords) section.config.keywords = [];

        if (!section.config.keywords.includes(val)) {
            section.config.keywords.push(val);
            saveToSessionStorage();

            // Re-render only tags or full? Full render to keep it simple for now
            renderOutline();
        }
        el.value = '';
    }
}

window.removeKeywordTag = function (el, id) {
    const tagText = el.parentElement.textContent.replace('×', '').trim();
    const section = outlineData.sections.find(s => s.id === id);
    if (section) {
        if (section.config && section.config.keywords) {
            section.config.keywords = section.config.keywords.filter(k => k !== tagText);
            saveToSessionStorage();
            renderOutline();
        }
    }
}

window.addInternalLinkTag = function (el, id) {
    const val = el.value.trim();
    if (!val) return;

    const section = outlineData.sections.find(s => s.id === id);
    if (section) {
        if (!section.config) section.config = {};
        if (!section.config.internal_links) section.config.internal_links = [];

        if (!section.config.internal_links.includes(val)) {
            section.config.internal_links.push(val);
            saveToSessionStorage();
            renderOutline();
        }
        el.value = '';
    }
}

window.removeInternalLinkTag = function (el, id) {
    const tagText = el.parentElement.textContent.replace('×', '').trim();
    const section = outlineData.sections.find(s => s.id === id);
    if (section) {
        if (section.config && section.config.internal_links) {
            section.config.internal_links = section.config.internal_links.filter(l => l !== tagText);
            saveToSessionStorage();
            renderOutline();
        }
    }
}

function attachEventListeners() {
    // Buttons
    const addSectionBtn = document.getElementById('addSectionBtn');
    if (addSectionBtn) {
        // Use cloning to remove old listeners
        const newBtn = addSectionBtn.cloneNode(true);
        addSectionBtn.parentNode.replaceChild(newBtn, addSectionBtn);
        newBtn.addEventListener('click', addNewSection);
    }

    // Create Article Button (FIX: Thêm event listener cho nút Tạo bài viết)
    const createArticleBtn = document.getElementById('createArticleBtn');
    if (createArticleBtn) {
        // Use cloning to remove old listeners
        const newBtn = createArticleBtn.cloneNode(true);
        createArticleBtn.parentNode.replaceChild(newBtn, createArticleBtn);
        newBtn.addEventListener('click', handleCreateArticle);
        console.log("✅ Đã gắn sự kiện click cho nút bài viết");
    }

    // Title Input
    const mainTitleInput = document.getElementById('outlineMainTitle');
    if (mainTitleInput) {
        mainTitleInput.addEventListener('input', handleMainTitleChange);
    }

    // H2 Inputs
    document.querySelectorAll('.h2-input').forEach(input => {
        input.addEventListener('input', handleH2Change);
    });
}

function handleMainTitleChange(e) {
    outlineData.title = e.target.value;
    saveToSessionStorage();
    console.log('💾 Đã cập nhật tiêu đề chính:', outlineData.title);
}

function handleH2Change(e) {
    const sectionId = e.target.dataset.sectionId;
    const section = outlineData.sections.find(s => s.id === sectionId);
    if (section) {
        section.title = e.target.value;
        saveToSessionStorage();
    }
}

function addNewSection() {
    const newSection = {
        id: `h2-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: "",
        subsections: [],
        config: {
            word_count: 150,
            keywords: [],
            internal_link: null
        }
    };

    outlineData.sections.push(newSection);
    renderOutline();

    // Focus vào input mới
    setTimeout(() => {
        const inputs = document.querySelectorAll('.h2-input');
        if (inputs.length > 0) {
            inputs[inputs.length - 1].focus();
        }
    }, 100);

    console.log('➕ Đã thêm mục H2 mới');
}

function removeSection(sectionId) {
    if (confirm('Bạn có chắc muốn xóa mục này?')) {
        outlineData.sections = outlineData.sections.filter(s => s.id !== sectionId);
        renderOutline();
        console.log('🗑️ Đã xóa section:', sectionId);
    }
}

// ============================================
// 4. LƯU TRỮ & CHUYỂN ĐỔI
// ============================================

function saveToSessionStorage() {
    sessionStorage.setItem('articleOutline', JSON.stringify(outlineData));
    console.log('💾 Đã lưu outline vào sessionStorage');
}

function convertToPipelineFormat() {
    const result = [];

    // Thêm H1 (title)
    result.push({
        id: 'h1-main',
        level: 1,
        title: outlineData.title,
        order: 1,
        config: null
    });

    let order = 2;

    // Thêm H2 và H3
    outlineData.sections.forEach(section => {
        // Chuẩn bị config cho API
        const sectionConfig = { ...(section.config || {}) };

        // Convert internal_links array back to internal_link string for API compatibility
        if (sectionConfig.internal_links && sectionConfig.internal_links.length > 0) {
            sectionConfig.internal_link = sectionConfig.internal_links.join(', ');
        } else if (!sectionConfig.internal_link) {
            sectionConfig.internal_link = null;
        }

        result.push({
            id: section.id,
            level: 2,
            title: section.title,
            order: order++,
            config: sectionConfig
        });

        if (section.subsections) {
            section.subsections.forEach(subsection => {
            });
        }
    });

    return result;
}

// ============================================
// 5. NAVIGATION & VALIDATION
// ============================================

async function handleCreateArticle() { // Đã được gọi từ nút "Tạo bài viết"
    // Validate
    if (!outlineData.title.trim()) {
        alert('Vui lòng nhập tiêu đề bài viết!');
        document.getElementById('outlineMainTitle')?.focus();
        return;
    }

    if (outlineData.sections.length === 0) {
        alert('Vui lòng thêm ít nhất một mục chính (H2)!');
        return;
    }

    // Kiểm tra sections có title không
    for (let section of outlineData.sections) {
        if (!section.title.trim()) {
            alert('Vui lòng điền đầy đủ tiêu đề cho tất cả các mục chính!');
            return;
        }
    }

    // Hiển thị loading trên nút
    const createArticleBtn = document.getElementById('createArticleBtn'); // Giả sử nút này có ID
    if (createArticleBtn) {
        createArticleBtn.disabled = true;
        createArticleBtn.innerHTML = 'Đang tạo bài viết...';
    }

    try {
        // 1. Lấy dữ liệu pipeline đã lưu từ sessionStorage
        const savedPipelineData = JSON.parse(sessionStorage.getItem('pipelineData'));
        if (!savedPipelineData) {
            // throw new Error("Không tìm thấy dữ liệu pipeline. Vui lòng quay lại Bước 1.");
            // Allow bypassing if testing
            console.warn("⚠️ Pipeline Data missing, using Mock Data for navigation");
        }

        const pipelineDataToUse = savedPipelineData || { config: {}, final_title: "" };

        // 2. Lấy dàn ý đã được chỉnh sửa (format cho API)
        const updatedOutlineForApi = convertToPipelineFormat();

        // 3. Cập nhật pipelineData với dàn ý mới nhất và title mới nhất
        pipelineDataToUse.article_outline = updatedOutlineForApi;
        pipelineDataToUse.final_title = outlineData.title;

        // Lưu lại vào sessionStorage để trang xử lý sử dụng
        sessionStorage.setItem('pipelineData', JSON.stringify(pipelineDataToUse));

        console.log("🚀 Chuyển hướng sang trang xử lý...", pipelineDataToUse);

        // 4. Chuyển sang trang trạng thái xử lý
        window.location.href = 'trang-thai-xu-ly.php';

    } catch (error) {
        alert("Lỗi: " + error.message);
        console.error("❌ Lỗi khi chuyển trang:", error);
        if (createArticleBtn) {
            createArticleBtn.disabled = false;
            createArticleBtn.innerHTML = 'Tạo bài viết →';
        }
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============================================
// 6. EXPORT GLOBAL API
// ============================================

window.outlineEditor = {
    loadOutlineData,
    renderOutline,
    addNewSection,
    handleCreateArticle,
    saveToSessionStorage,
    createDefaultOutline,
    updateTitle: function (newTitle) {
        outlineData.title = newTitle;
        const input = document.getElementById('outlineMainTitle');
        if (input) input.value = newTitle;
        saveToSessionStorage();
    },
    setOutlineData: function (data) {
        outlineData = data;
        // Nếu data từ API pipeline, convert nó
        if (data.article_outline) {
            convertFromPipelineFormat(data.article_outline);
        } else if (Array.isArray(data)) {
            convertFromPipelineFormat(data);
        }
    }
};


console.log('✅ Module dan-y-bai-viet.js đã sẵn sàng!');
