// API Configuration
const API_BASE_URL = 'http://localhost:8080/api/v1';

// Utility functions
async function makeApiRequest(endpoint, data) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('API request failed:', error);
        throw error;
    }
}

function showNotification(message, type = 'info') {
    const colors = {
        success: '#28a745',
        error: '#dc3545',
        warning: '#ffc107',
        info: '#17a2b8'
    };
    
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${colors[type] || colors.info};
        color: white;
        border-radius: 5px;
        z-index: 1000;
        box-shadow: 0 3px 10px rgba(0,0,0,0.2);
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function showLoading(show) {
    const loading = document.getElementById('loading');
    const generateBtn = document.getElementById('generateBtn');
    
    if (show) {
        loading.style.display = 'block';
        generateBtn.disabled = true;
        generateBtn.innerHTML = `<span class="edit-icon">⏳</span> Đang xử lý...`;
    } else {
        loading.style.display = 'none';
        generateBtn.disabled = false;
        generateBtn.innerHTML = `<span class="edit-icon"><img src="../assets/image/ico.png" alt=""></span> Generate bài viết`;
    }
}

// Xử lý thêm tag từ khóa phụ
const secondaryKeywordInput = document.getElementById('secondaryKeyword');
const tagContainer = document.getElementById('tagContainer');

secondaryKeywordInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && this.value.trim() !== '') {
        e.preventDefault();
        addTag(this.value.trim());
        this.value = '';
    }
});

function addTag(text) {
    const tag = document.createElement('span');
    tag.className = 'tag';
    tag.innerHTML = `${text} <span class="close-icon" onclick="removeTag(this)">×</span>`;
    tagContainer.appendChild(tag);
}

function removeTag(element) {
    element.parentElement.remove();
}

function getSecondaryKeywords() {
    const tags = tagContainer.querySelectorAll('.tag');
    return Array.from(tags).map(tag => 
        tag.textContent.replace('×', '').trim()
    );
}

// Tải cấu hình từ API
async function loadConfigs() {
    try {
        const response = await fetch(`${API_BASE_URL}/ui/configs`);
        const data = await response.json();
        
        if (response.ok) {
            // Populate dropdowns
            populateDropdown('content_type', data.content_types);
            populateDropdown('writing_tone', data.writing_tones);
            populateDropdown('language', data.languages);
            populateDropdown('bot', data.bots);
            
            // Cập nhật preview cho bot
            const botSelect = document.getElementById('bot');
            const previewBot = document.getElementById('previewBot');
            botSelect.addEventListener('change', function() {
                const selectedOption = this.options[this.selectedIndex];
                previewBot.textContent = selectedOption.text;
            });
            
            // Kích hoạt event change đầu tiên
            if (data.bots && data.bots.length > 0) {
                previewBot.textContent = data.bots[0];
            }
            
            showNotification('Đã tải cấu hình thành công!', 'success');
        } else {
            throw new Error('Không thể tải cấu hình');
        }
    } catch (error) {
        console.error('Lỗi tải config:', error);
        showNotification('Không thể tải cấu hình. Vui lòng thử lại sau.', 'error');
        
        // Fallback nếu API lỗi
        populateDropdown('content_type', ['Blog SEO cơ bản', 'Tin tức', 'Đánh giá', 'Hướng dẫn']);
        populateDropdown('writing_tone', ['Chuyên nghiệp', 'Thân thiện', 'Trang trọng', 'Sáng tạo']);
        populateDropdown('language', ['Tiếng Việt', 'English', 'Tiếng Trung']);
        populateDropdown('bot', ['GPT-4', 'Claude', 'Gemini']);
    }
}

// Hàm populate dropdown
function populateDropdown(elementId, options) {
    const select = document.getElementById(elementId);
    select.innerHTML = '<option value="">Chọn...</option>';
    
    if (!Array.isArray(options)) {
        console.error('Options không phải array:', options);
        return;
    }
    
    options.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option;
        optionElement.textContent = option;
        select.appendChild(optionElement);
    });
}

// Xử lý gợi ý AI
const aiSuggestBtn = document.getElementById('aiSuggestBtn');
const articleTitle = document.getElementById('articleTitle');
const userQuery = document.getElementById('user_query');

aiSuggestBtn.addEventListener('click', async function() {
    const keyword = userQuery.value.trim();
    
    if (!keyword) {
        showNotification('Vui lòng nhập từ khóa chính trước!', 'warning');
        return;
    }

    showLoading(true);

    try {
        const titleData = {
            main_keyword: keyword,
            language: document.getElementById('language').value || 'Tiếng Việt'
        };

        const response = await fetch(`${API_BASE_URL}/ai/suggest-titles`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(titleData)
        });
        
        const result = await response.json();
        
        if (response.ok && result.success && result.titles && result.titles.length > 0) {
            showTitleSuggestions(result.titles);
        } else {
            showNotification('Không thể tạo tiêu đề gợi ý. Vui lòng thử lại!', 'error');
        }
    } catch (error) {
        console.error('Error generating title suggestion:', error);
        showNotification('Không thể tạo gợi ý. Vui lòng thử lại!', 'error');
    } finally {
        showLoading(false);
    }
});

// ============================================
// PHẦN THÔNG TIN CƠ BẢN - TAB TUẦN TỰ
// ============================================

// Biến toàn cục
const tabs = document.querySelectorAll(".tab");
const subButtons = document.querySelectorAll("#private .sub");
const fileSelector = document.getElementById("file-selector"); 
const outsideFileListContainer = document.querySelector(".uploaded-file-list-outside"); 
const subtabContentArea = document.getElementById("subtab-content-area"); 
const STORAGE_KEY = 'uploadedFilesData';
const MAX_STEP_KEY = 'maxCompletedStep';

// Khởi tạo trạng thái từ Local Storage
let maxCompletedStep = parseInt(localStorage.getItem(MAX_STEP_KEY)) || 0; 
let selectedFiles = []; 
let tempTextContent = localStorage.getItem('tempTextContent') || "";
let tempLinkContent = localStorage.getItem('tempLinkContent') || "";

// Ánh xạ tên subtab sang chỉ số bước
const stepMap = {
    'file': 0,
    'text': 1,
    'link': 2
};

// Hàm tiện ích
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = 2;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function saveState() {
    localStorage.setItem(MAX_STEP_KEY, maxCompletedStep);
    localStorage.setItem('tempTextContent', tempTextContent);
    localStorage.setItem('tempLinkContent', tempLinkContent);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedFiles));
}

function readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Hàm xử lý file sau khi chọn/kéo thả
async function processFiles(files) {
    if (!files || files.length === 0) return;
    
    const allowedTypes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ];

    const validFiles = Array.from(files).filter(f => allowedTypes.includes(f.type));
    
    if (validFiles.length === 0) {
        showNotification("Chỉ chấp nhận file PDF, DOCX hoặc Excel!", "warning");
        return;
    }
    
    // Xóa file cũ nếu có (chỉ cho phép 1 file)
    selectedFiles = [];
    
    for (const file of validFiles) {
        const base64Content = await readFileAsBase64(file);
        selectedFiles.push({
            name: file.name,
            size: file.size,
            type: file.type,
            base64: base64Content
        });
        break; // Chỉ lấy 1 file đầu tiên
    }

    renderFiles(); 
    saveState(); 

    // Đánh dấu bước 'file' đã hoàn thành
    if (selectedFiles.length > 0 && maxCompletedStep === 0) {
        maxCompletedStep = 1;
        saveState();
        showNotification("✅ Tải file thành công! Bạn có thể chuyển sang bước tiếp theo.", "success");
        
        // Cập nhật UI cho các subtab
        updateSubtabStates();
        
        // Nếu đang ở tab file, refresh UI
        const currentSub = document.querySelector('.sub.active');
        if (currentSub && currentSub.dataset.sub === 'file') {
            setupSubtabContent('file');
        }
    }
}

// 1. HÀM RENDER FILE
function renderFiles() {
    outsideFileListContainer.innerHTML = ""; 
    const isFileStepCompleted = maxCompletedStep > 0; 

    if (selectedFiles.length === 0) {
        if (maxCompletedStep > 0) {
            maxCompletedStep = 0;
            saveState(); 
            updateSubtabStates();
            
            // Nếu đang ở tab file, refresh UI
            const currentSub = document.querySelector('.sub.active');
            if (currentSub && currentSub.dataset.sub === 'file') {
                setupSubtabContent('file');
            }
        }
        return; 
    }
    
    selectedFiles.forEach((file, index) => {
        const fileSizeFormatted = formatFileSize(file.size);
        const fileIcon = file.type.includes("pdf") ? '📄' : 
                         file.type.includes("word") ? '📃' : 
                         file.type.includes("excel") ? '📊' : '📁';
                         
        const fileDiv = document.createElement("div");
        fileDiv.classList.add("uploaded-file");
        
        fileDiv.innerHTML = `
            <div class="file-info">
                <span class="file-icon">${fileIcon}</span>
                <div class="file-details">
                    <div class="file-name">${file.name}</div>
                    <div class="file-size-status">${fileSizeFormatted} - Đã tải lên</div>
                </div>
            </div>
            ${isFileStepCompleted ? 
                `<span class="locked-text">(Đã khóa)</span>` : 
                `<button class="remove-file" data-index="${index}">×</button>`
            }
        `;
        
        outsideFileListContainer.appendChild(fileDiv);
    });
    
    // Thêm event listener cho các nút xóa (chỉ khi chưa hoàn thành bước)
    if (!isFileStepCompleted) {
        document.querySelectorAll(".remove-file").forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                const index = parseInt(e.currentTarget.dataset.index);
                selectedFiles.splice(index, 1);
                saveState(); 
                renderFiles(); 
            });
        });
    }
}

// 2. HÀM SETUP NỘI DUNG SUBTAB
function setupSubtabContent(sub) {
    subtabContentArea.innerHTML = ''; 
    const isFileStepCompleted = maxCompletedStep > 0;
    
    // KIỂM SOÁT HIỂN THỊ DANH SÁCH FILE: Chỉ hiển thị khi ở tab 'file'
    if (sub === 'file') {
        outsideFileListContainer.style.display = 'flex'; 
        renderFiles(); 
    } else {
        outsideFileListContainer.style.display = 'none';
    }

    if (sub === "file") {
        // Tạo khung kéo thả
        const uploadBoxHTML = `
            <div class="upload-box" id="actual-upload-box">
                <div class="icon">☁️</div>
                <p>Kéo thả File (PDF, Docx, Excel) vào đây</p>
            </div>
        `;
        subtabContentArea.innerHTML = uploadBoxHTML;
        const actualUploadBox = document.getElementById("actual-upload-box");
        
        if (isFileStepCompleted) {
            // Trạng thái KHÓA (Đã hoàn thành)
            actualUploadBox.classList.remove('clickable');
            actualUploadBox.style.pointerEvents = 'none'; 
            actualUploadBox.style.opacity = '0.7';
            actualUploadBox.style.backgroundColor = '#f5f5f5';
            actualUploadBox.innerHTML = `
                <div class="icon">✅</div>
                <p style="color:#28a745;font-weight:600;">File đã được tải lên thành công!</p>
            `;
        } else {
            // Trạng thái MỞ (Chưa hoàn thành)
            actualUploadBox.classList.add('clickable'); 
            actualUploadBox.style.pointerEvents = 'auto';
            actualUploadBox.style.opacity = '1';
            actualUploadBox.style.backgroundColor = 'white';
            
            // Thêm event cho kéo thả
            actualUploadBox.addEventListener("dragover", (e) => {
                e.preventDefault();
                actualUploadBox.classList.add("hover");
            });
            
            actualUploadBox.addEventListener("dragleave", () => {
                actualUploadBox.classList.remove("hover");
            });
            
            actualUploadBox.addEventListener("drop", (e) => {
                e.preventDefault();
                actualUploadBox.classList.remove("hover");
                processFiles(e.dataTransfer.files);
            });
            
            // Thêm event cho click
            actualUploadBox.addEventListener("click", () => {
                fileSelector.click(); 
            });
        }
    } else if (sub === "text") {
        // Tạo Textarea
        const isReadonly = maxCompletedStep > 1;
        subtabContentArea.innerHTML = `
            <div style="margin-top: 10px;">
                <textarea id="textarea-text" placeholder="Nhập nội dung tại đây..." 
                          style="width:100%;height:150px;padding:10px;border: 1px solid #ccc;border-radius: 4px;"
                          ${isReadonly ? 'readonly' : ''}>${tempTextContent}</textarea>
                ${isReadonly ? '<p style="color:#777; font-size:12px; margin-top:5px;">(Đã khóa - bạn đã chuyển sang bước tiếp theo)</p>' : ''}
            </div>
        `;
        
        const textarea = document.getElementById('textarea-text');
        if (!isReadonly) {
            textarea.addEventListener('input', (e) => {
                tempTextContent = e.target.value;
                saveState();
                
                // Nếu có nội dung, đánh dấu đã hoàn thành bước text
                if (tempTextContent.trim() && maxCompletedStep < 2) {
                    maxCompletedStep = 2;
                    saveState();
                    updateSubtabStates();
                }
            });
        }
        
    } else if (sub === "link") {
        // Tạo Input Link
        const isReadonly = maxCompletedStep > 2;
        subtabContentArea.innerHTML = `
            <input type="url" id="input-link" placeholder="Nhập link sản phẩm..." 
                   value="${tempLinkContent}" 
                   style="width:100%;padding:10px;margin-top: 10px; border: 1px solid #ccc;border-radius: 4px;"
                   ${isReadonly ? 'readonly' : ''}>
            ${isReadonly ? '<p style="color:#777; font-size:12px; margin-top:5px;">(Đã khóa)</p>' : ''}
        `;
        
        const inputLink = document.getElementById('input-link');
        if (!isReadonly) {
            inputLink.addEventListener('input', (e) => {
                tempLinkContent = e.target.value;
                saveState();
            });
        }
    }
}

// 3. HÀM CẬP NHẬT TRẠNG THÁI SUBTAB
function updateSubtabStates() {
    subButtons.forEach(btn => {
        const sub = btn.dataset.sub;
        const step = stepMap[sub];
        
        if (step < maxCompletedStep) {
            // Tab đã hoàn thành - thêm class locked
            btn.classList.add('locked');
            btn.style.opacity = '0.6';
            btn.title = `Bước "${btn.textContent}" đã hoàn thành và bị khóa`;
        } else if (step === maxCompletedStep) {
            // Tab hiện tại
            btn.classList.remove('locked');
            btn.style.opacity = '1';
            btn.title = `Bước hiện tại: ${btn.textContent}`;
        } else if (step === maxCompletedStep + 1) {
            // Tab tiếp theo có thể truy cập
            btn.classList.remove('locked');
            btn.style.opacity = '1';
            btn.title = `Bước tiếp theo: ${btn.textContent}`;
        } else {
            // Tab chưa đến
            btn.classList.remove('locked');
            btn.style.opacity = '0.4';
            btn.title = `Chưa đến bước này`;
        }
    });
}

// 4. XỬ LÝ SUBBUTTONS
subButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
        const sub = btn.dataset.sub;
        const targetStep = stepMap[sub];
        
        // Kiểm tra nếu tab bị khóa
        if (btn.classList.contains('locked')) {
            e.preventDefault();
            alert(`❌ Không thể quay lại bước "${btn.textContent}" đã hoàn thành.\n\nHệ thống làm việc theo tuần tự:\n1. Tải file → 2. Nhập văn bản → 3. Link sản phẩm`);
            return;
        }
        
        // Kiểm tra nếu nhảy bước (chưa hoàn thành bước trước)
        if (targetStep > maxCompletedStep + 1) {
            e.preventDefault();
            const currentStepName = getStepName(maxCompletedStep);
            alert(`⏳ Vui lòng hoàn thành bước "${currentStepName}" trước khi chuyển sang bước tiếp theo.`);
            return;
        }

        // Chuyển tab hợp lệ
        subButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        setupSubtabContent(sub);
    });
});

function getStepName(step) {
    const stepNames = {
        0: 'Tải file',
        1: 'Nhập văn bản', 
        2: 'Link sản phẩm'
    };
    return stepNames[step] || '';
}

// 5. XỬ LÝ TAB CHÍNH
tabs.forEach(tab => {
    tab.addEventListener("click", () => {
        tabs.forEach(t => t.classList.remove("active"));
        tab.classList.add("active");

        const target = tab.dataset.tab;
        document.querySelectorAll(".content").forEach(c => {
            c.classList.toggle("active", c.id === target);
        });
        
        if (target === "private") {
            // Kích hoạt lại subtab đang active
            const activeSub = document.querySelector('.sub.active');
            if (activeSub) {
                setupSubtabContent(activeSub.dataset.sub);
            } else {
                document.querySelector('.sub[data-sub="file"]').click();
            }
        } else {
            outsideFileListContainer.style.display = 'none';
        }
    });
});

// 6. XỬ LÝ CHỌN FILE TỪ INPUT
fileSelector.addEventListener("change", (e) => {
    processFiles(e.target.files);
    e.target.value = null; // Reset input
});

// KHỞI TẠO TRANG
function initialize() {
    // Tải dữ liệu từ Local Storage
    const savedFiles = localStorage.getItem(STORAGE_KEY);
    if (savedFiles) {
        try {
            selectedFiles = JSON.parse(savedFiles);
        } catch (e) {
            console.error("Lỗi khi đọc file từ Local Storage:", e);
            selectedFiles = [];
        }
    }
    
    // Cập nhật trạng thái subtab
    updateSubtabStates();
    
    // Kích hoạt subtab đầu tiên
    const firstSub = document.querySelector('.sub[data-sub="file"]');
    if (firstSub && !firstSub.classList.contains('locked')) {
        firstSub.click();
    } else {
        // Nếu file đã bị khóa, chuyển sang bước tiếp theo có thể truy cập
        const accessibleSub = document.querySelector('.sub:not(.locked)');
        if (accessibleSub) {
            accessibleSub.click();
        }
    }
}

// ============================================
// CÁC HÀM KHÁC (giữ nguyên)
// ============================================

// Hàm hiển thị gợi ý tiêu đề
function showTitleSuggestions(titles) {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    `;
    
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
        background: white;
        padding: 30px;
        border-radius: 10px;
        max-width: 500px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
    `;
    
    modalContent.innerHTML = `
        <h3 style="margin-bottom: 20px; color: #333;">Chọn tiêu đề bạn thích:</h3>
        <div id="titleSuggestions" style="margin-bottom: 20px;">
            ${titles.map((title, index) => `
                <div style="padding: 10px; margin-bottom: 10px; border: 1px solid #ddd; border-radius: 5px; cursor: pointer; transition: background 0.3s;"
                     onclick="selectTitle('${title.replace(/'/g, "\\'")}')"
                     onmouseover="this.style.background='#f8f9fa'"
                     onmouseout="this.style.background='white'">
                    ${index + 1}. ${title}
                </div>
            `).join('')}
        </div>
        <button onclick="this.closest('div[style*=\"position: fixed\"]').remove()" 
                style="padding: 10px 20px; background: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer;">
            Hủy
        </button>
    `;
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
}

// Hàm chọn title từ modal
function selectTitle(title) {
    articleTitle.value = title;
    document.querySelector('div[style*="position: fixed"]').remove();
    showNotification('Đã chọn tiêu đề thành công!', 'success');
}

// Xử lý tùy chọn nâng cao
const advancedToggle = document.getElementById('advancedToggle');
const advancedContent = document.getElementById('advancedContent');

advancedToggle.addEventListener('click', function() {
    this.classList.toggle('open');
    advancedContent.classList.toggle('open');
});

// Cập nhật preview khi thay đổi độ dài
const articleLength = document.getElementById('article_length');
const previewLength = document.getElementById('previewLength');
const previewTime = document.getElementById('previewTime');
const previewStructure = document.getElementById('previewStructure');

articleLength.addEventListener('input', function() {
    const length = parseInt(this.value);
    previewLength.textContent = `${length} từ`;
    
    // Cập nhật thời gian dự kiến
    let time = '3-5 phút';
    if (length < 1000) time = '2-3 phút';
    else if (length > 2000) time = '5-8 phút';
    previewTime.textContent = time;
    
    // Cập nhật cấu trúc dự kiến
    let structure = [
        'Phần mở đầu (100-150 từ)',
        '3-4 phần nội dung chính',
        'Kết luận và CTA'
    ];
    
    if (length >= 1200 && length <= 2000) {
        structure = [
            'Phần mở đầu (150-200 từ)',
            '5-6 phần nội dung chính',
            'Case study & Ví dụ',
            'Kết luận và CTA'
        ];
    } else if (length > 2000) {
        structure = [
            'Phần mở đầu chi tiết (200-300 từ)',
            '7-10 phần nội dung sâu',
            'Case study & Phân tích',
            'FAQ',
            'Kết luận và CTA'
        ];
    }
    
    previewStructure.innerHTML = structure.map(item => 
        `<li><span class="bullet"></span> ${item}</li>`
    ).join('');
});

// Cập nhật tone giọng preview
const toneSelect = document.getElementById('writing_tone');
const previewTone = document.getElementById('previewTone');

toneSelect.addEventListener('change', function() {
    const toneMap = {
        'Chuyên nghiệp': '"Trong thời đại công nghệ 4.0, việc ứng dụng AI vào doanh nghiệp không chỉ là xu hướng mà đã trở thành yếu tố quyết định."',
        'Thân thiện': '"Bạn đã bao giờ tự hỏi làm thế nào AI có thể giúp công việc của bạn dễ dàng hơn? Hãy cùng khám phá nhé!"',
        'Trang trọng': '"Kiến trúc học sâu và các mô hình transformer đang định hình lại cách chúng ta tiếp cận bài toán tối ưu hóa trong doanh nghiệp."',
        'Sáng tạo': '"AI không chỉ là công cụ - đó là cánh cửa mở ra thế giới của những khả năng vô tận và đột phá!"',
        'Thuyết phục': '"Hãy tưởng tượng: AI có thể giúp doanh nghiệp của bạn tăng hiệu suất lên 300% chỉ trong 3 tháng. Bạn có muốn biết bí quyết?"',
        'Trung lập': '"Nghiên cứu cho thấy việc ứng dụng AI trong doanh nghiệp có thể cải thiện hiệu quả hoạt động từ 25-40%."',
        'Truyền cảm hứng': '"Mỗi bước tiến trong AI không chỉ là công nghệ mới, mà là cơ hội để chúng ta tạo ra tương lai tốt đẹp hơn!"'
    };
    
    previewTone.textContent = toneMap[this.value] || toneMap['Chuyên nghiệp'];
});

// Tooltip cho info icon
const infoIcons = document.querySelectorAll('.info-icon');
const tooltip = document.getElementById('tooltip');

infoIcons.forEach(icon => {
    icon.addEventListener('mouseenter', function(e) {
        const tooltipText = this.getAttribute('data-tooltip');
        tooltip.textContent = tooltipText;
        tooltip.classList.add('show');
        
        const rect = this.getBoundingClientRect();
        tooltip.style.left = rect.left + 'px';
        tooltip.style.top = (rect.bottom + 5) + 'px';
    });
    
    icon.addEventListener('mouseleave', function() {
        tooltip.classList.remove('show');
    });
});

// Xử lý nút Generate
const generateBtn = document.getElementById('generateBtn');
generateBtn.addEventListener('click', async function(e) {
    e.preventDefault();
    
    const user_query = document.getElementById('user_query').value.trim();
    const title = document.getElementById('articleTitle').value.trim();
    const content_type = document.getElementById('content_type').value;
    const writing_tone = document.getElementById('writing_tone').value;
    const language = document.getElementById('language').value;
    const bot = document.getElementById('bot').value;
    const article_length = document.getElementById('article_length').value;
    const custom_instructions = document.getElementById('custom_instructions').value;
    const metaDescription = document.getElementById('metaDescription').value;
    const internalLinks = document.getElementById('internalLinks').value;
    
    // Validate
    if (!user_query || !content_type || !writing_tone || !language || !bot) {
        showNotification('Vui lòng điền đầy đủ các trường bắt buộc!', 'warning');
        return;
    }

    showLoading(true);

    try {
        // Xử lý internal links
        const internalLinksArray = internalLinks 
            ? internalLinks.split('\n')
                           .map(link => link.trim())
                           .filter(link => link.startsWith('http'))
            : [];

        // Tạo request data
        const requestData = {
            user_query: user_query,
            top_news: [], // Có thể thêm sau nếu cần
            target_language: language,
            config: {
                article_type: content_type,
                tone: writing_tone,
                language: language,
                bot_id: bot,
                article_length: article_length.toString(),
                article_title: title || undefined,
                custom_instructions: custom_instructions || undefined,
                meta_description: metaDescription || undefined,
                internal_links: internalLinksArray.length > 0 ? internalLinksArray : undefined,
                secondary_keywords: getSecondaryKeywords().length > 0 ? getSecondaryKeywords() : undefined
            }
        };

        console.log('📦 Request data gửi đi:', JSON.stringify(requestData, null, 2));
        
        // Gọi API tạo bài viết
        const response = await fetch(`${API_BASE_URL}/ai/contents`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData)
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            // Lưu kết quả vào sessionStorage
            sessionStorage.setItem('articleResult', JSON.stringify(result));
            sessionStorage.setItem('articleTitle', title || result.article.title);
            sessionStorage.setItem('mainKeyword', user_query);
            
            showNotification('Bài viết đã được tạo thành công! Đang chuyển hướng...', 'success');
            
            // Chuyển hướng sang trang xem kết quả
            setTimeout(() => {
                window.location.href = 'ket-qua-bai-viet.php';
            }, 1500);
            
        } else {
            throw new Error(result.message || 'Không thể tạo bài viết');
        }
        
    } catch (error) {
        console.error('Lỗi tạo bài viết:', error);
        showNotification(`Lỗi: ${error.message}`, 'error');
    } finally {
        showLoading(false);
    }
});

// Xử lý lưu nháp
const saveDraftBtn = document.getElementById('saveDraft');
saveDraftBtn.addEventListener('click', function(e) {
    e.preventDefault();
    
    const draftData = {
        user_query: document.getElementById('user_query').value,
        articleTitle: document.getElementById('articleTitle').value,
        secondaryKeywords: getSecondaryKeywords(),
        content_type: document.getElementById('content_type').value,
        writing_tone: document.getElementById('writing_tone').value,
        language: document.getElementById('language').value,
        bot: document.getElementById('bot').value,
        article_length: document.getElementById('article_length').value,
        custom_instructions: document.getElementById('custom_instructions').value,
        metaDescription: document.getElementById('metaDescription').value,
        internalLinks: document.getElementById('internalLinks').value,
        timestamp: new Date().toISOString()
    };
    
    localStorage.setItem('articleDraft', JSON.stringify(draftData));
    showNotification('Nháp đã được lưu thành công!', 'success');
});

// Khôi phục nháp nếu có
function loadDraft() {
    const draft = localStorage.getItem('articleDraft');
    if (draft) {
        const draftData = JSON.parse(draft);
        
        // Khôi phục các trường
        document.getElementById('user_query').value = draftData.user_query || '';
        document.getElementById('articleTitle').value = draftData.articleTitle || '';
        
        // Khôi phục tags
        if (draftData.secondaryKeywords) {
            draftData.secondaryKeywords.forEach(keyword => addTag(keyword));
        }
        
        // Khôi phục select fields
        if (draftData.content_type) {
            document.getElementById('content_type').value = draftData.content_type;
        }
        if (draftData.writing_tone) {
            document.getElementById('writing_tone').value = draftData.writing_tone;
        }
        if (draftData.language) {
            document.getElementById('language').value = draftData.language;
        }
        if (draftData.bot) {
            document.getElementById('bot').value = draftData.bot;
        }
        
        // Khôi phục các trường khác
        document.getElementById('article_length').value = draftData.article_length || '1200';
        document.getElementById('custom_instructions').value = draftData.custom_instructions || '';
        document.getElementById('metaDescription').value = draftData.metaDescription || '';
        document.getElementById('internalLinks').value = draftData.internalLinks || '';
        
        // Kích hoạt các event để cập nhật preview
        articleLength.dispatchEvent(new Event('input'));
        if (draftData.writing_tone) {
            toneSelect.value = draftData.writing_tone;
            toneSelect.dispatchEvent(new Event('change'));
        }
        
        showNotification('Đã khôi phục nháp thành công!', 'info');
    }
}

// Hiển thị thông báo khi thay đổi cấu hình
const configElements = document.querySelectorAll('select, textarea, input');
configElements.forEach(element => {
    element.addEventListener('change', function() {
        this.style.borderColor = '#28a745';
        setTimeout(() => {
            this.style.borderColor = '#dee2e6';
        }, 1000);
    });
});

// Khởi tạo khi trang load
document.addEventListener('DOMContentLoaded', function() {
    // Tải cấu hình từ API
    loadConfigs();
    
    // Load draft nếu có
    loadDraft();
    
    // Khởi tạo phần thông tin cơ bản
    initialize();
    
    // Kích hoạt event cho độ dài
    articleLength.dispatchEvent(new Event('input'));
});