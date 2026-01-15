// ============================================
// 1. API HELPER & CONFIGS (GLOBAL SCOPE)
// ============================================

// Local helper for API calls (renamed to avoid collision with bao-mat.js)
async function localApiRequest(endpoint, method = 'GET', body = null) {
    const url = `api-proxy.php?endpoint=${endpoint}`;
    const options = {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        }
    };
    if (body) {
        options.body = JSON.stringify(body);
    }

    try {
        
        const response = await fetch(url, options);
        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`API Error ${response.status}: ${errText}`);
        }
        return await response.json();
    } catch (error) {
        console.error("API Request Failed:", error);
        throw error;
    }
}

async function loadConfigs() {
    console.log("🚀 Đang tải cấu hình hệ thống...");
    return true;
}

// ============================================
// 2. MAIN LOGIC (DOM READY)
// ============================================
document.addEventListener('DOMContentLoaded', function () {
    // Basic elements
    const inputIdea = document.getElementById('input-idea');
    const previewBtn = document.getElementById('preview-btn');
    const resetBtn = document.getElementById('reset-btn');
    const facebookPreview = document.getElementById('facebook-preview');
    const previewContent = document.getElementById('preview-content');
    const previewImage = document.getElementById('preview-image');

    // Persistence for multiple images
    let allSelectedImages = [];

    // UI View Sections
    const mainView = document.getElementById('main-view');
    const configSection = document.getElementById('config-section');

    // Step 1 - Left Column Elements
    const toggleImageMain = document.getElementById('toggle-image-main');
    const mainUploadTrigger = document.getElementById('main-upload-trigger');
    const mainFileInput = document.getElementById('main-file-input');

    // Modal / Config Section Elements
    const saveConfigBtn = document.getElementById('save-config-btn');
    const toggleImageModal = document.getElementById('toggle-image');
    const modalImageGroup = document.getElementById('modal-image-group');
    const modalUploadTrigger = document.getElementById('modal-upload-trigger');
    const modalFileInput = document.getElementById('modal-file-input');

    // Helper: Show Preview Block
    function updatePreviewVisibility() {
        if (facebookPreview) facebookPreview.style.display = 'block';
    }

    // Helper: Sync Text from Left to Right
    function updateText() {
        if (!inputIdea || !previewContent) return;
        const val = inputIdea.value;
        if (val.trim() === '') {
            previewContent.innerHTML = '<span style="color:#65676b; font-style:italic;">Nhập nội dung để xem trước bài viết...</span>';
        } else {
            // Convert newline to <br> for display
            previewContent.innerHTML = val.replace(/\n/g, '<br>');
        }
        console.log("Preview updated with:", val); // Debug log
    }

    // Helper: Handle Multiple Images Processing
    function handleMultipleImages(files) {
        if (!files || files.length === 0) return;

        const gridContainer = document.getElementById('image-grid-container');
        if (!gridContainer) return;

        const fileArray = Array.from(files);
        let loadedCount = 0;

        fileArray.forEach((file) => {
            const reader = new FileReader();
            reader.onload = function (e) {
                allSelectedImages.push(e.target.result);
                loadedCount++;

                if (loadedCount === fileArray.length) {
                    renderImageGrid(allSelectedImages);
                    updatePlaceholderText();
                }
            };
            reader.readAsDataURL(file);
        });
    }

    function updatePlaceholderText() {
        if (mainUploadTrigger) {
            const placeholder = mainUploadTrigger.querySelector('.file-upload-placeholder');
            if (placeholder) {
                placeholder.innerText = allSelectedImages.length > 0
                    ? `Đã chọn ${allSelectedImages.length} ảnh (Bấm để thêm...)`
                    : 'Duyệt hình ảnh của bạn tại đây';
            }
        }
    }

    function removeImage(index) {
        allSelectedImages.splice(index, 1);
        renderImageGrid(allSelectedImages);
        updatePlaceholderText();

        if (allSelectedImages.length === 0) {
            const gridContainer = document.getElementById('image-grid-container');
            if (gridContainer) gridContainer.style.display = 'none';
        }
    }

    function renderImageGrid(results) {
        const gridContainer = document.getElementById('image-grid-container');
        if (!gridContainer) return;

        gridContainer.innerHTML = '';
        const count = results.length;
        gridContainer.className = 'facebook-image-grid'; // Reset classes

        if (count === 0) {
            gridContainer.style.display = 'none';
            return;
        }

        if (count === 1) {
            gridContainer.classList.add('count-1');
        } else if (count === 2) {
            gridContainer.classList.add('count-2');
        } else if (count === 3) {
            gridContainer.classList.add('count-3');
        } else if (count === 4) {
            gridContainer.classList.add('count-4');
        } else {
            gridContainer.classList.add('count-more');
        }

        const displayLimit = count > 4 ? 4 : count;

        for (let i = 0; i < displayLimit; i++) {
            const wrap = document.createElement('div');
            wrap.className = 'image-item-wrapper';

            if (i === 3 && count > 4) {
                wrap.classList.add('more-overlay');
                wrap.setAttribute('data-more', `+${count - 3}`);
            }

            const img = document.createElement('img');
            img.src = results[i];
            img.onclick = () => openLightbox(results[i]);

            const deleteBtn = document.createElement('span');
            deleteBtn.className = 'remove-img-btn';
            deleteBtn.innerHTML = '&times;';
            deleteBtn.onclick = (e) => {
                e.stopPropagation();
                removeImage(i);
            };

            wrap.appendChild(img);
            wrap.appendChild(deleteBtn);
            gridContainer.appendChild(wrap);
        }

        gridContainer.style.display = 'grid';
        if (previewImage) previewImage.style.display = 'none';
        updatePreviewVisibility();
    }

    // Lightbox Logic
    const lightboxModal = document.getElementById('lightbox-modal');
    const lightboxImg = document.getElementById('lightbox-img');
    const closeLightbox = document.querySelector('.close-lightbox');

    function openLightbox(src) {
        if (!lightboxModal || !lightboxImg) return;
        lightboxImg.src = src;
        lightboxModal.style.display = "block";
    }

    if (closeLightbox) {
        closeLightbox.onclick = function () {
            lightboxModal.style.display = "none";
        }
    }

    if (lightboxModal) {
        lightboxModal.onclick = function (e) {
            if (e.target === lightboxModal) {
                lightboxModal.style.display = "none";
            }
        }
    }

    // --- Interaction for Post Actions ---
    const btnLike = document.getElementById('btn-like');
    const btnComment = document.getElementById('btn-comment');
    const btnShare = document.getElementById('btn-share');

    if (btnLike) {
        btnLike.addEventListener('click', function () {
            this.classList.toggle('active');
            console.log("Liked toggled");
        });
    }

    if (btnComment) {
        btnComment.addEventListener('click', function () {
            this.classList.toggle('active');
            // Mock a focus or scrolling to comments
            const commentBox = document.querySelector('.comment-section-premium');
            if (commentBox) {
                commentBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        });
    }

    if (btnShare) {
        btnShare.addEventListener('click', function () {
            this.classList.toggle('active');
            alert("Bạn đã nhấn chia sẻ bài viết này!");
        });
    }

    // --- 1. TEXTAREA LIVE PREVIEW ---
    if (inputIdea) {
        inputIdea.addEventListener('input', updateText);
        inputIdea.addEventListener('keyup', updateText);
        inputIdea.addEventListener('change', updateText);
        // Initial sync
        updateText();
    }

    // --- 2. IMAGE UPLOAD & DRAG & DROP (MAIN) ---
    if (mainUploadTrigger && mainFileInput) {
        mainUploadTrigger.addEventListener('click', () => mainFileInput.click());

        mainFileInput.addEventListener('change', function () {
            handleMultipleImages(this.files);
        });

        mainUploadTrigger.addEventListener('dragover', function (e) {
            e.preventDefault();
            this.style.borderColor = '#2563eb';
            this.style.backgroundColor = '#eff6ff';
        });

        mainUploadTrigger.addEventListener('dragleave', function () {
            this.style.borderColor = '#e2e8f0';
            this.style.backgroundColor = '#fff';
        });

        mainUploadTrigger.addEventListener('drop', function (e) {
            e.preventDefault();
            this.style.borderColor = '#e2e8f0';
            this.style.backgroundColor = '#fff';

            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
                if (files.length > 0) {
                    handleMultipleImages(files);
                } else {
                    alert('Vui lòng chỉ chọn file hình ảnh!');
                }
            }
        });
    }

    // Toggle Visibility of Upload Box in Main View
    if (toggleImageMain && mainUploadTrigger) {
        toggleImageMain.addEventListener('change', function () {
            mainUploadTrigger.style.display = this.checked ? 'flex' : 'none';
        });
    }
    // --- 3. CONFIG SECTION (MODAL) LOGIC ---
    if (previewBtn) {
        previewBtn.addEventListener('click', function () {
            if (mainView) mainView.style.display = 'none';
            if (configSection) {
                configSection.style.display = 'block';
                const configNameInput = document.getElementById('config_name_input');
                if (configNameInput) configNameInput.focus();

                const pageBody = document.querySelector('.page-body');
                if (pageBody) {
                    pageBody.scrollTo({
                        top: 0,
                        behavior: 'smooth'
                    });
                }
            }
        });
    }

    const backListBtn = document.getElementById('back-list-btn');
    if (backListBtn) {
        backListBtn.addEventListener('click', function (e) {
            e.preventDefault();
            if (configSection) configSection.style.display = 'none';
            if (mainView) {
                mainView.style.display = 'block';
                const pageBody = document.querySelector('.page-body');
                if (pageBody) {
                    pageBody.scrollTo({
                        top: 0,
                        behavior: 'smooth'
                    });
                }
            }
        });
    }

    if (toggleImageModal && modalImageGroup) {
        toggleImageModal.addEventListener('change', function () {
            modalImageGroup.style.display = this.checked ? 'block' : 'none';
        });
    }

    if (modalUploadTrigger && modalFileInput) {
        modalUploadTrigger.addEventListener('click', () => modalFileInput.click());
        modalFileInput.addEventListener('change', function () {
            handleMultipleImages(this.files);
        });
    }

    if (saveConfigBtn) {
        saveConfigBtn.addEventListener('click', function () {
            const nameInput = document.getElementById('config_name_input');
            const configName = nameInput && nameInput.value.trim() !== '' ? nameInput.value.trim() : `Cấu hình ${new Date().toLocaleTimeString()}`;

            const newConfig = {
                id: Date.now(),
                name: configName,
                length: document.getElementById('content_lengths').value,
                type: document.getElementById('content_types').value,
                tone: document.getElementById('writing_tones').value,
                model: document.getElementById('bots').value,
                language: document.getElementById('languages').value,
                created_at: new Date().toLocaleDateString('vi-VN')
            };

            const configs = JSON.parse(localStorage.getItem('user_configs')) || [];
            configs.push(newConfig);
            localStorage.setItem('user_configs', JSON.stringify(configs));

            if (configSection) configSection.style.display = 'none';
            if (mainView) mainView.style.display = 'block';
            updatePreviewVisibility();

            alert("Đã lưu cấu hình thành công!");
        });
    }

    // --- 4. RESET ACTION ---
    if (resetBtn) {
        resetBtn.addEventListener('click', function () {
            if (inputIdea) {
                // Đưa về nội dung mặc định của hệ thống
                inputIdea.value = 'Tri ân Ngày Nhà giáo Việt Nam';
                updateText();
            }
            // Không xóa allSelectedImages để giữ lại hình ảnh đã đăng thêm
            console.log("Đã khôi phục văn bản mặc định, giữ nguyên danh sách hình ảnh.");
        });
    }

    // --- 5. INITIALIZATION ---
    updatePreviewVisibility();
    loadConfigs();
});