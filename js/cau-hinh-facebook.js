
// ============================================
// 1. API HELPER & CONFIGS (GLOBAL SCOPE)
// ============================================

// --- // Load các option cấu hình (độ dài bài, tone, ngôn ngữ, AI model…)---
async function loadOptions() {
    try {
        // Gọi API lấy config hệ thống
        const data = await apiRequest('/facebook/config');
        // Hàm helper để đổ option vào <select>
        const fill = (id, arr, label = "Chọn...") => {
            const selectEl = document.getElementById(id);
            if (!selectEl) return;
            // Reset option
            selectEl.innerHTML = `<option value="">${label}</option>`;
            if (!arr) return;
            // thêm từng optio 
            arr.forEach(i => {
                const opt = document.createElement('option');
                opt.value = i;
                opt.textContent = i;
                selectEl.appendChild(opt);
            });
        };
        // đổ dữ liệu vào các dropdown
        if (data) {
            fill('content_lengths', data.content_lengths, 'Chọn độ dài bài viết');
            fill('content_types', data.content_types, 'Chọn loại bài viết');
            fill('writing_tones', data.writing_tones, 'Chọn tone giọng');
            fill('languages', data.languages, 'Chọn ngôn ngữ ');
            fill('bots', data.bots, 'Chọn AI Model');
        }
    } catch (e) {
        console.error("❌ Lỗi loadOptions:", e);
    }
}

async function loadConfigs() {
    console.log("🚀 Đang tải cấu hình Facebook...");

    // 1. Tải các lựa chọn từ hệ thống
    await loadOptions();

    // 2. Tải danh sách cấu hình của người dùng
    await loadUserConfigs();

    // 3. Kiểm tra xem có cấu hình nào được chọn từ trang quản lý không
    let selectedConfig = sessionStorage.getItem('selected_facebook_config');

    if (selectedConfig) {
        try {
            const config = JSON.parse(selectedConfig);
            applyConfigToUI(config);
            sessionStorage.removeItem('selected_facebook_config'); // Xóa sau khi dùng
            return;
        } catch (e) { console.error(e); }
    }

    // 4. Nếu không có cấu hình được chọn, lấy cấu hình mặc định của người dùng từ API
    try {
        const defaultConfig = await apiRequest('/facebook/config/user/default');
        if (defaultConfig) {
            // Hiển thị các thông số của cấu hình mặc định lên giao diện
            applyConfigToUI(defaultConfig);

            // Set dropdown value if exists
            const configSelect = document.getElementById('config_template');
            if (configSelect) {
                configSelect.value = defaultConfig.id;
            }
        }
    } catch (e) {
        console.warn("⚠️ Không lấy được cấu hình mặc định:", e.message);
    }
}

async function loadUserConfigs() {
    const configSelect = document.getElementById('config_template');
    if (!configSelect) return;

    try {
        const response = await apiRequest('/facebook/config/user');
        let configs = [];
        if (response && response.configs) configs = response.configs;
        else if (Array.isArray(response)) configs = response;

        // Lưu vào window để dùng sau
        window.userConfigs = configs;

        // Giữ lại option đầu tiên và option cuối (+ Thêm mẫu)
        const firstOpt = configSelect.options[0];
        const lastOpt = Array.from(configSelect.options).find(opt => opt.value === 'add-new');

        configSelect.innerHTML = '';
        if (firstOpt) configSelect.appendChild(firstOpt);

        configs.forEach(cfg => {
            const opt = document.createElement('option');
            opt.value = cfg.id;
            opt.textContent = cfg.name;
            configSelect.appendChild(opt);
        });

        if (lastOpt) configSelect.appendChild(lastOpt);
    } catch (e) {
        console.error("❌ Lỗi loadUserConfigs:", e);
    }
}

function applyConfigToUI(config) {
    if (!config) return;
    console.log("🛠 Đang áp dụng cấu hình:", config.name);

    const mapping = {
        'config_name_input': config.name,
        'bots': config.bot_id || config.model,
        'content_types': config.article_type,
        'content_lengths': config.article_length,
        'writing_tones': config.tone,
        'languages': config.language
    };

    for (const [id, value] of Object.entries(mapping)) {
        const el = document.getElementById(id);
        if (el && value) el.value = value;
    }

    // Creativity slider
    const slider = document.getElementById('creativity_level');
    const sliderVal = document.getElementById('creativity_val');
    if (slider && config.temperature !== undefined) {
        const val = config.temperature * 100;
        slider.value = val;
        if (sliderVal) sliderVal.textContent = val + '%';
    }
}

// ============================================
// 2. MAIN LOGIC (DOM READY)
// ============================================

document.addEventListener('DOMContentLoaded', async function () {
    // Basic elements
    const inputIdea = document.getElementById('input-idea');
    const previewBtn = document.getElementById('preview-btn');
    const resetBtn = document.getElementById('reset-btn');
    const facebookPreview = document.getElementById('facebook-preview');
    const previewContent = document.getElementById('preview-content');
    const previewImage = document.getElementById('preview-image');
    const generateAiBtn = document.getElementById('generate-ai-btn');
    const publishBtn = document.getElementById('publish-btn');
    const connectedPageName = document.getElementById('connected-page-name');

    // State
    let draftPostId = null;
    let uploadedMediaIds = { photos: [], videos: [] };
    let currentDefaultConnection = null;

    // Persistence for multiple images
    let allSelectedImages = [];
    let allFileObjects = []; // Parallel array to store original File objects for better upload performance

    // --- // Lưu trạng thái nháp (nội dung + ảnh + config)---
    function saveDraft() {
        try {
            const draftData = {
                topic: inputIdea.value,
                content: previewContent.innerHTML,
                draftPostId: draftPostId,
                selectedImages: allSelectedImages,
                configId: document.getElementById('config_template')?.value
            };
            localStorage.setItem('fb_post_draft', JSON.stringify(draftData));
        } catch (e) {
            console.warn("Không thể lưu nháp do dữ liệu quá lớn.");
        }
    }
    // load lại nháp khi reload trang 
    function loadDraft() {
        try {
            const saved = localStorage.getItem('fb_post_draft');
            if (!saved) return;
            const draftData = JSON.parse(saved);
            if (draftData.topic) {
                inputIdea.value = draftData.topic;
            }
            if (draftData.content && draftData.content !== 'Ý tưởng của bạn là gì ?') {
                previewContent.innerHTML = draftData.content;
                updatePreviewVisibility();
                if (publishBtn) publishBtn.style.display = 'block';
            }
            if (draftData.draftPostId !== undefined && draftData.draftPostId !== null) {
                draftPostId = draftData.draftPostId;
            }
            if (draftData.selectedImages && draftData.selectedImages.length > 0) {
                allSelectedImages = draftData.selectedImages;
                // Sync allFileObjects with nulls for drafted items
                allFileObjects = new Array(allSelectedImages.length).fill(null);
                renderImageGrid(allSelectedImages);
                updatePlaceholderText();
            }
            if (draftData.configId) {
                const cfgSelect = document.getElementById('config_template');
                if (cfgSelect) cfgSelect.value = draftData.configId;
            }
        } catch (e) {
            console.error("Lỗi loadDraft:", e);
        }
    }

    function clearDraft() {
        localStorage.removeItem('fb_post_draft');
    }

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
        saveDraft();
    }

    // Helper: Handle Multiple Images Processing
    async function handleMultipleImages(files) {
        if (!files || files.length === 0) return;

        const gridContainer = document.getElementById('image-grid-container');
        if (!gridContainer) return;

        const fileArray = Array.from(files);
        // Validation: Filter invalid files
        const validFiles = fileArray.filter(file => {
            const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
            const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);

            // Kiểm tra nếu file không phải là ảnh hoặc video hợp lệ
            if (!isImage && !isVideo) {
                alert(`Tệp "${file.name}" không đúng định dạng! Chỉ chấp nhận ảnh (JPG, PNG, GIF, WebP) hoặc Video (MP4, MOV, AVI, WMV).`);
                return false;
            }

            // Giới hạn dung lượng: Ảnh < 10MB
            if (isImage && file.size > MAX_IMAGE_SIZE) {
                alert(`Ảnh "${file.name}" quá lớn (Max 10MB).`);
                return false;
            }

            // Giới hạn dung lượng: Video < 100MB
            if (isVideo && file.size > MAX_VIDEO_SIZE) {
                alert(`Video "${file.name}" quá lớn (Max 100MB).`);
                return false;
            }
            return true;
        });

        if (validFiles.length === 0) return;

        // Use Promise.all to ensure we process all files and maintain order
        const readers = validFiles.map(file => {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve({ file: file, preview: e.target.result });
                reader.onerror = () => resolve(null); // safely handle errors
                reader.readAsDataURL(file);
            });
        });

        const results = await Promise.all(readers);

        results.forEach(item => {
            if (item) {
                allSelectedImages.push(item.preview);
                allFileObjects.push(item.file);
            }
        });

        renderImageGrid(allSelectedImages);
        updatePlaceholderText();
        try {
            saveDraft();
        } catch (e) {
            console.warn("Dữ liệu quá lớn để lưu nháp (localStorage quota).");
        }
    }
    function updatePlaceholderText() {
        if (mainUploadTrigger) {
            const placeholder = mainUploadTrigger.querySelector('.file-upload-placeholder');
            if (placeholder) {
                placeholder.innerText = allSelectedImages.length > 0
                    ? `Đã chọn ${allSelectedImages.length} tệp (Nhấn để thêm...)`
                    : 'Duyệt hình ảnh của bạn tại đây';
            }
        }
    }



    function removeImage(index) {
        allSelectedImages.splice(index, 1);
        if (allFileObjects.length > index) allFileObjects.splice(index, 1);
        renderImageGrid(allSelectedImages);
        updatePlaceholderText();

        if (allSelectedImages.length === 0) {
            const gridContainer = document.getElementById('image-grid-container');
            if (gridContainer) gridContainer.style.display = 'none';
        }
        saveDraft();
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

            const src = results[i];
            const isVideo = src.startsWith('data:video');

            if (isVideo) {
                const video = document.createElement('video');
                video.src = src;
                // video.controls = true; // No controls in grid preview, click to lightbox
                video.style.width = '100%';
                video.style.height = '100%';
                video.style.objectFit = 'cover';
                video.onclick = () => openLightbox(src);
                wrap.appendChild(video);

                // Add play icon overlay
                const icon = document.createElement('div');
                icon.innerHTML = '<i class="fas fa-play-circle"></i>';
                icon.style.position = 'absolute';
                icon.style.top = '50%';
                icon.style.left = '50%';
                icon.style.transform = 'translate(-50%, -50%)';
                icon.style.color = '#fff';
                icon.style.fontSize = '24px';
                icon.style.pointerEvents = 'none';
                wrap.appendChild(icon);

            } else {
                const img = document.createElement('img');
                img.src = src;
                img.onclick = () => openLightbox(src);
                wrap.appendChild(img);
            }

            const deleteBtn = document.createElement('span');
            deleteBtn.className = 'remove-img-btn';
            deleteBtn.innerHTML = '&times;';
            deleteBtn.onclick = (e) => {
                e.stopPropagation();
                removeImage(i);
            };

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

        const isVideo = src.startsWith('data:video');
        let videoEl = document.getElementById('lightbox-video-el');

        if (isVideo) {
            if (!videoEl) {
                videoEl = document.createElement('video');
                videoEl.id = 'lightbox-video-el';
                videoEl.controls = true;
                videoEl.style.maxWidth = '100%';
                videoEl.style.maxHeight = '90vh';
                videoEl.style.display = 'none';
                // Insert after img
                lightboxImg.insertAdjacentElement('afterend', videoEl);
            }
            lightboxImg.style.display = 'none';
            videoEl.src = src;
            videoEl.style.display = 'block';
        } else {
            if (videoEl) {
                videoEl.pause();
                videoEl.style.display = 'none';
            }
            lightboxImg.src = src;
            lightboxImg.style.display = 'block';
        }
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

    // --- Facebook Connection ---
    async function loadDefaultConnection() {
        try {
            const data = await apiRequest('/facebook/connections/default');
            if (data && data.page_id) {
                currentDefaultConnection = data;
                if (connectedPageName) {
                    connectedPageName.textContent = `Sẵn sàng: ${data.page_id}`;
                    connectedPageName.style.color = '#16a34a';
                }
            } else {
                if (connectedPageName) {
                    connectedPageName.textContent = 'Chưa kết nối Facebook';
                    connectedPageName.style.color = '#ef4444';
                }
            }
        } catch (e) {
            console.error("Lỗi loadDefaultConnection:", e);
            if (connectedPageName) connectedPageName.textContent = 'Lỗi kết nối';
        }
    }

    // --- trạng thái nháp ---
    if (generateAiBtn) {
        generateAiBtn.onclick = async () => {
            const topic = inputIdea.value.trim();
            if (!topic) return alert("Vui lòng nhập ý tưởng/chủ đề bài viết!");

            const configId = document.getElementById('config_template').value;
            // Validate configId is present and is a number
            if (!configId || configId === 'add-new' || isNaN(parseInt(configId))) {
                return alert("Vui lòng chọn một chiến dịch quảng cáo hợp lệ!");
            }

            try {
                generateAiBtn.disabled = true;
                generateAiBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang viết bài...';

                const response = await apiRequest('/facebook/generate/content', {
                    method: 'POST',
                    body: JSON.stringify({
                        config_id: parseInt(configId),
                        topic: topic
                    })
                });

                if (response && response.success) {
                    // Lưu lại ID bài viết nháp mà AI vừa tạo
                    draftPostId = response.draft_post_id;

                    // Hiển thị nội dung ra khung Preview (thay thế xuống dòng bằng thẻ <br>)
                    previewContent.innerHTML = response.content.replace(/\n/g, '<br>');
                    // Hiện nút Đăng bài sau khi đã có nội dung
                    if (publishBtn) publishBtn.style.display = 'block';

                    saveDraft(); // Lưu lại bản nháp vào LocalStorage
                }

            } catch (e) {
                alert("Lỗi tạo nội dung: " + (typeof e.message === 'object' ? JSON.stringify(e.message) : e.message));
            } finally {
                generateAiBtn.disabled = false;
                generateAiBtn.innerHTML = '<i class="fas fa-magic"></i> Viết bài với AI';
            }
        };
    }

    // photo 
    const ALLOWED_IMAGE_TYPES = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp'
    ];

    const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

    // video
    const ALLOWED_VIDEO_TYPES = [
        'video/mp4',
        'video/quicktime',
        'video/x-msvideo',
        'video/x-ms-wmv',
        'video/avi',
        'video/wmv'
    ];

    const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB

    async function uploadAllMedia() {
        // Không có media -> tra về rỗng 
        if (!allSelectedImages || allSelectedImages.length === 0) return { photos: [], videos: [] };

        const photosBlobs = [];
        const videosBlobs = [];

        // chuyển base54 (DataURL) -> blog để upload 
        const dataURLtoBlob = (dataurl) => {
            try {
                const arr = dataurl.split(',');
                const mime = arr[0].match(/:(.*?);/)[1];
                const bstr = atob(arr[1]);
                let n = bstr.length;
                const u8arr = new Uint8Array(n);
                while (n--) {
                    u8arr[n] = bstr.charCodeAt(n);
                }
                return new Blob([u8arr], { type: mime });
            } catch (e) {
                console.error("Error converting Blob:", e);
                return null;
            }
        };

        // Upload ảnh hoặc video lên Facebook
        for (let i = 0; i < allSelectedImages.length; i++) {
            let blob = null;

            // Prioritize original file object (from current session upload)
            if (allFileObjects[i]) {
                blob = allFileObjects[i];
            } else {
                // Fallback to converting Base64 from draft
                blob = dataURLtoBlob(allSelectedImages[i]);
            }

            if (blob) {
                // Phân loại tệp để gửi vào mảng tương ứng
                if (blob.type.startsWith('video/')) {
                    videosBlobs.push(blob);
                } else {
                    photosBlobs.push(blob);
                }
            }
        }
        let photoIds = [];
        let videoIds = [];

        // --- BƯỚC A: Tải Ảnh lên Facebook ---
        if (photosBlobs.length > 0) {
            try {
                const fd = new FormData();
                // Gom tất cả ảnh vào một lần gửi (multipart/form-data)
                photosBlobs.forEach((blob, i) => {
                    const ext = blob.type.split('/')[1] || 'jpg';
                    fd.append('files[]', blob, `image_${Date.now()}_${i}.${ext}`);
                });
                fd.append('media_type', 'photo');

                const res = await apiRequestFormData('/facebook/publish/media/upload', fd);
                if (res && res.success && res.media_ids) {
                    photoIds = res.media_ids; // Nhận về mảng ID ảnh từ Facebook
                    console.log(`[Facebook API] ${res.message || 'Upload Photos Successful'}`);
                } else {
                    throw new Error(res.message || "Upload Photos Failed (Unknown Error)");
                }
            } catch (e) {
                console.error("Lỗi upload Photos:", e);
                throw e; // Dừng quá trình đăng bài nếu upload ảnh lỗi
            }
        }

        // --- BƯỚC B: Tải Video lên Facebook ---
        if (videosBlobs.length > 0) {
            try {
                const fd = new FormData();
                videosBlobs.forEach((blob, i) => {
                    const ext = blob.type.split('/')[1] || 'mp4';
                    fd.append('files[]', blob, `video_${Date.now()}_${i}.${ext}`);
                });
                fd.append('media_type', 'video');

                const res = await apiRequestFormData('/facebook/publish/media/upload', fd);
                if (res && res.success && res.media_ids) {
                    videoIds = res.media_ids; // Nhận về mảng ID video từ Facebook
                    console.log(`[Facebook API] ${res.message || 'Upload Videos Successful'}`);
                } else {
                    throw new Error(res.message || "Upload Videos Failed (Unknown Error)");
                }
            } catch (e) {
                console.error("Lỗi upload Videos:", e);
                throw e;
            }
        }
        // Trả về tất cả IDs đã upload thành công
        return { photos: photoIds, videos: videoIds };
    }

    // --- Phần đăng bài lên Facebook (khi nhân nút đăng) ---
    if (publishBtn) {
        publishBtn.onclick = async () => {
            // Kiểm tra ID bài viết nháp
            if (!draftPostId) {
                console.error("Lỗi: draftPostId đang bị null!");
                return alert("Vui lòng nhấn 'Viết bài với AI' để tạo nội dung trước!");
            }

            // Kiểm tra ID Fanpage
            if (!currentDefaultConnection || !currentDefaultConnection.page_id) {
                console.error("Lỗi: page_id không tồn tại!", currentDefaultConnection);
                return alert("Chưa có thông tin Fanpage để đăng bài!");
            }

            try {
                publishBtn.disabled = true;
                publishBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang đăng...';

                // BƯỚC 1: Tải tất cả ảnh/video đang có lên server Facebook trước
                const media = await uploadAllMedia();

                // BƯỚC 2: Chuẩn bị gói dữ liệu (Payload) gửi lệnh đăng bài
                const payload = {
                    draft_post_id: parseInt(draftPostId), // ID nội dung bài nháp
                    page_id: String(currentDefaultConnection.page_id), // ID Fanpage đích
                    photo_ids: media.photos || [], // Các ID ảnh đã upload ở BƯỚC 1
                    video_ids: media.videos || [], // Các ID video đã upload ở BƯỚC 1
                    published: true // true = Đăng ngay, false = Lưu nháp trên Facebook
                };

                // Hiển thị dữ liệu gửi đi trong Console để kiểm tra lỗi nếu cần
                console.log("Dữ liệu gửi đi (Payload):", payload);

                // BƯỚC 3: Gọi API thực hiện đăng bài lên tường Fanpage
                const response = await apiRequest('/facebook/publish/posts/publish', {
                    method: 'POST',
                    body: JSON.stringify(payload)
                });

                if (response && response.success) {
                    alert("Đăng bài thành công!");
                    clearDraft();
                    location.reload();
                } else {
                    // Hiển thị chi tiết lỗi từ Backend
                    console.error("Backend Error:", response);
                    alert("Lỗi từ máy chủ: " + (response.detail ? JSON.stringify(response.detail) : "Không xác định"));
                }
            } catch (e) {
                console.error("Exception:", e);
                alert("Đã xảy ra lỗi kết nối: " + e.message);
            } finally {
                publishBtn.disabled = false;
                publishBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Đăng bài ngay';
            }
        };
    }

    // --- Interaction for Post Actions ---
    const btnLike = document.getElementById('btn-like');
    const btnComment = document.getElementById('btn-comment');

    // --- AIS Assistant Link & Label State controlled by Toggle Switch ---
    const aisToggle = document.getElementById('ais-assistant-toggle');
    const labelImageToggle = document.getElementById('label-image-toggle');

    function updateAisLinkState() {
        const isChecked = toggleImageMain && toggleImageMain.checked;
        // Update AIS Link
        if (aisToggle) {
            if (isChecked) {
                aisToggle.classList.add('active');
            } else {
                aisToggle.classList.remove('active');
            }
        }

        // Update Label
        if (labelImageToggle) {
            if (isChecked) {
                labelImageToggle.classList.add('active');
            } else {
                labelImageToggle.classList.remove('active');
            }
        }
    }
    if (toggleImageMain) {
        toggleImageMain.addEventListener('change', updateAisLinkState);
        // Initialize
        updateAisLinkState();
    }
    const btnShare = document.getElementById('btn-share');

    if (btnLike) {
        btnLike.addEventListener('click', function () {
            this.classList.toggle('active');
            console.log("Liked toggled");
        });
    }
    if (btnComment) {
        btnComment.addEventListener('click', function () {
            const isActive = this.classList.toggle('active');
            const commentBox = document.querySelector('.comment-section-premium');
            if (commentBox) {
                commentBox.classList.toggle('show');
                if (commentBox.classList.contains('show')) {
                    commentBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    // Focus comment input when opened
                    const input = document.getElementById('add-comment-input');
                    if (input) setTimeout(() => input.focus(), 300);
                }
            }
        });
    } if (btnShare) {
        btnShare.addEventListener('click', function () {
            this.classList.toggle('active');
            // alert("Bạn đã nhấn chia sẻ bài viết này!");
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

        const folderUploadBtn = document.getElementById('folder-upload-btn');
        const folderInput = document.getElementById('folder-input');

        // Allow clicking the main box to select files (default behavior)
        mainUploadTrigger.addEventListener('click', function (e) {
            // If the click originated from the folder button, do nothing here (handled separately)
            if (e.target && (e.target.id === 'folder-upload-btn' || e.target.closest('#folder-upload-btn'))) {
                return;
            }
            mainFileInput.click();
        });

        // Folder Upload Logic
        if (folderUploadBtn && folderInput) {
            folderUploadBtn.addEventListener('click', function (e) {
                e.stopPropagation(); // Prevent mainUploadTrigger click
                e.preventDefault();
                folderInput.click();
            });

            folderInput.addEventListener('change', function () {
                // this.files contains all files in the directory
                handleMultipleImages(this.files);
            });
        }

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
                const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/') || f.type.startsWith('video/'));
                if (files.length > 0) {
                    handleMultipleImages(files);
                } else {
                    alert('Vui lòng chỉ chọn file hình ảnh hoặc video!');
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

        modalUploadTrigger.addEventListener('dragover', function (e) {
            e.preventDefault();
            this.style.borderColor = '#2563eb';
            this.style.backgroundColor = '#eff6ff';
        });

        modalUploadTrigger.addEventListener('dragleave', function () {
            this.style.borderColor = '#e2e8f0';
            this.style.backgroundColor = '#fff';
        });

        modalUploadTrigger.addEventListener('drop', function (e) {
            e.preventDefault();
            this.style.borderColor = '#e2e8f0';
            this.style.backgroundColor = '#fff';

            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/') || f.type.startsWith('video/'));
                if (files.length > 0) {
                    handleMultipleImages(files);
                } else {
                    alert('Vui lòng chỉ chọn file hình ảnh hoặc video!');
                }
            }
        });
    }

    // --- Thêm video ---
    const toggleVideoModal = document.getElementById('toggle-video');
    const modalVideoGroup = document.getElementById('modal-video-group');
    const modalVideoTrigger = document.getElementById('modal-video-upload-trigger');
    const modalVideoInput = document.getElementById('modal-video-file-input');

    if (toggleVideoModal && modalVideoGroup) {
        toggleVideoModal.addEventListener('change', function () {
            modalVideoGroup.style.display = this.checked ? 'block' : 'none';
        });
    }

    if (modalVideoTrigger && modalVideoInput) {
        modalVideoTrigger.addEventListener('click', () => modalVideoInput.click());
        modalVideoInput.addEventListener('change', function () {
            handleMultipleImages(this.files);
        });

        modalVideoTrigger.addEventListener('dragover', function (e) {
            e.preventDefault();
            this.style.borderColor = '#2563eb';
            this.style.backgroundColor = '#eff6ff';
        });

        modalVideoTrigger.addEventListener('dragleave', function () {
            this.style.borderColor = '#e2e8f0';
            this.style.backgroundColor = '#fff';
        });

        modalVideoTrigger.addEventListener('drop', function (e) {
            e.preventDefault();
            this.style.borderColor = '#e2e8f0';
            this.style.backgroundColor = '#fff';

            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('video/'));
                if (files.length > 0) {
                    handleMultipleImages(files);
                } else {
                    alert('Vui lòng chỉ chọn file Video!');
                }
            }
        });
    }

    if (saveConfigBtn) {
        saveConfigBtn.addEventListener('click', async function () {
            const nameInput = document.getElementById('config_name_input');
            const name = nameInput ? nameInput.value.trim() : '';
            if (!name) return alert("Vui lòng nhập tên cấu hình!");

            const payload = {
                name: name,
                bot_id: document.getElementById('bots').value,
                article_length: document.getElementById('content_lengths').value,
                article_type: document.getElementById('content_types').value,
                tone: document.getElementById('writing_tones').value,
                language: document.getElementById('languages').value,
                temperature: parseFloat(document.getElementById('creativity_level')?.value || 50) / 100,
                is_default: false
            };

            try {
                saveConfigBtn.disabled = true;
                saveConfigBtn.textContent = 'ĐANG LƯU...';

                await apiRequest('/facebook/config', {
                    method: 'POST',
                    body: JSON.stringify(payload)
                });
                // alert("Đã lưu cấu hình thành công!");

                if (configSection) configSection.style.display = 'none';
                if (mainView) mainView.style.display = 'block';

                // Optional: Reload list if needed
                await loadUserConfigs();

            } catch (error) {
                alert("Lỗi: " + error.message);
            } finally {
                saveConfigBtn.disabled = false;
                saveConfigBtn.textContent = 'LƯU CẤU HÌNH';
            }
        });
    }

    const configSelect = document.getElementById('config_template');
    if (configSelect) {
        configSelect.addEventListener('change', function () {
            if (this.value === 'add-new') {
                if (mainView) mainView.style.display = 'none';
                if (configSection) {
                    configSection.style.display = 'block';
                    const pageBody = document.querySelector('.page-body');
                    if (pageBody) {
                        pageBody.scrollTo({
                            top: 0,
                            behavior: 'smooth'
                        });
                    }
                }
            } else if (this.value && this.value !== '') {
                const found = (window.userConfigs || []).find(c => c.id == this.value);
                if (found) {
                    applyConfigToUI(found);
                }
            }
        });
    }

    // --- 4. RESET ACTION ---
    if (resetBtn) {
        resetBtn.addEventListener('click', function () {
            if (inputIdea) {
                // Đưa về nội dung mặc định của hệ thống
                inputIdea.value = '';
                updateText();
            }
            // Không xóa allSelectedImages để giữ lại hình ảnh đã đăng thêm
            console.log("Đã khôi phục văn bản mặc định, giữ nguyên danh sách hình ảnh.");
        });
    }

    // --- 5. INITIALIZATION ---
    updatePreviewVisibility();
    await loadConfigs();
    await loadDefaultConnection();
    loadDraft();
});