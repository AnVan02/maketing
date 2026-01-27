// ============================================
// 1. API HELPER & CONFIGS (GLOBAL SCOPE)
// ============================================
const processedFiles = new Set();


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
            opt.textContent = cfg.is_default ? `${cfg.name} (Mặc định)` : cfg.name;
            configSelect.appendChild(opt);
        });

        if (lastOpt) configSelect.appendChild(lastOpt);
    } catch (e) {
        console.error("❌ Lỗi loadUserConfigs:", e);
    }
}

// State
let editingFacebookConfigId = null;

function applyConfigToUI(config) {
    if (!config) return;
    console.log("🛠 Đang áp dụng cấu hình:", config.name);

    editingFacebookConfigId = config.id || config.config_id || null;

    const mapping = {
        'config_name_input': config.name || config.config_name,
        'bots': config.bot_id || config.model,
        'content_types': config.article_type || config.type,
        'content_lengths': config.article_length || config.length,
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
    // Bài viết nháp
    async function loadDraftFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const urlDraftId = urlParams.get('draft_id');
        if (!urlDraftId) return;

        console.log("Loading draft from URL:", urlDraftId);
        try {
            // API chi tiết bài viết nháp
            const res = await apiRequest(`/facebook/publish/posts/${urlDraftId}`);
            if (res) {
                // Map API response to UI
                // Support both direct object or response.data wrapper
                const data = res.data || res;

                if (data.article_content || data.content || data.message) {
                    const content = data.article_content || data.content || data.message;
                    if (inputIdea) inputIdea.value = data.article_topic || "";
                    if (previewContent) {
                        previewContent.innerHTML = content.replace(/\n/g, '<br>');
                        updatePreviewVisibility();
                    }
                    if (publishBtn) publishBtn.style.display = 'block';
                }

                draftPostId = urlDraftId;

                // Save this as the current active draft so page reloads don't lose it
                saveDraft();
            }
        } catch (e) {
            console.error("Lỗi tải draft từ URL:", e);
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
    const aisToggleModal = document.getElementById('ais-assistant-toggle-modal');

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
            // Update: recognize http/https URLs as well
            const isVideo = src.startsWith('data:video') || src.match(/\.(mp4|mov|avi|wmv|webm)($|\?)/i);

            if (isVideo) {
                const video = document.createElement('video');
                video.src = src;
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

    // --- Kết nối API Facebook mặc định ---
    async function loadDefaultConnection() {
        console.log("🔍 Đang kiểm tra kết nối Facebook...");
        try {
            const data = await apiRequest('/facebook/connections/default');
            if (data && data.page_id) {
                console.log("📌 Đã tìm thấy kết nối:", data.page_id);
                currentDefaultConnection = data;
                if (connectedPageName) {
                    connectedPageName.textContent = `Sẵn sàng: ${data.page_id}`;
                    connectedPageName.style.color = '#16a34a';
                }

                // Cập nhật thông tin Page vào khung Preview nếu có token
                if (data.page_access_token) {
                    try {
                        // Thử lấy tên và ảnh từ Facebook Graph API
                        const fbRes = await fetch(`https://graph.facebook.com/v18.0/${data.page_id}?access_token=${data.page_access_token}&fields=name,picture.type(large)`);
                        const fbData = await fbRes.json();

                        if (fbData && fbData.name) {
                            const pName = document.getElementById('preview-user-name');
                            const pAvatar = document.getElementById('preview-user-avatar');

                            if (pName) {
                                pName.innerHTML = `${fbData.name} <i class="fas fa-check-circle" style="color: #1877f2; margin-left: 10px; font-size: 15px;"></i>`;
                            }
                            if (pAvatar && fbData.picture && fbData.picture.data && fbData.picture.data.url) {
                                pAvatar.src = fbData.picture.data.url;
                                pAvatar.style.background = 'transparent';
                            }

                            // Cập nhật lại thanh trạng thái cho đẹp hơn
                            if (connectedPageName) connectedPageName.textContent = `Sẵn sàng: ${fbData.name}`;
                        }
                    } catch (err) {
                        console.warn("⚠️ Không thể lấy thông tin chi tiết Page từ Facebook:", err);
                    }
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

    // --- tạo nội dung bài viết ---
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
                    // Cấu trúc response có thể có .data hoặc không
                    const resData = response.data || response;

                    // Lưu lại ID bài viết nháp mà AI vừa tạo
                    draftPostId = resData.draft_id || resData.draft_post_id || resData.id;

                    // Hiển thị nội dung ra khung Preview (thay thế xuống dòng bằng thẻ <br>)
                    const finalContent = resData.content || resData.article_content || "";
                    previewContent.innerHTML = finalContent.replace(/\n/g, '<br>');

                    // Hiện nút Đăng bài sau khi đã có nội dung
                    if (publishBtn) publishBtn.style.display = 'block';

                    console.log("✅ Đã tạo nội dung AI thành công, draftPostId:", draftPostId);
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
        // Khởi tạo kết quả mặc định
        const result = { photos: [], videos: [] };

        // Không có media -> trả về rỗng
        if (!allSelectedImages || allSelectedImages.length === 0) {
            console.log("⚠️ Không có media để upload");
            return result;
        }

        const photosBlobs = [];
        const videosBlobs = [];
        const photosUrls = [];
        const videosUrls = [];

        // Chuyển base64 (DataURL) -> Blob để upload
        const dataURLtoBlob = (dataurl) => {
            try {
                const arr = dataurl.split(',');
                if (arr.length < 2) return null;
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

        // Phân loại tệp và URL
        for (let i = 0; i < allSelectedImages.length; i++) {
            const item = allSelectedImages[i];

            // Ưu tiên File object gốc
            if (allFileObjects[i]) {
                const blob = allFileObjects[i];
                if (blob.type.startsWith('video/')) {
                    videosBlobs.push(blob);
                } else {
                    photosBlobs.push(blob);
                }
                continue;
            }

            // DataURL (Base64) từ draft
            if (item.startsWith('data:')) {
                const blob = dataURLtoBlob(item);
                if (blob) {
                    if (blob.type.startsWith('video/')) {
                        videosBlobs.push(blob);
                    } else {
                        photosBlobs.push(blob);
                    }
                }
            }
            // Remote URL
            else if (item.startsWith('http')) {
                if (item.match(/\.(mp4|mov|avi|wmv|webm)($|\?)/i)) {
                    videosUrls.push(item);
                } else {
                    photosUrls.push(item);
                }
            }
        }

        // --- BƯỚC 1: Upload Blobs (Local Files) ---

        // Upload Photos (Blobs)
        if (photosBlobs.length > 0) {
            try {
                const fd = new FormData();
                photosBlobs.forEach((blob, i) => {
                    const ext = blob.type.split('/')[1] || 'jpg';
                    fd.append('files[]', blob, `image_${Date.now()}_${i}.${ext}`);
                });
                fd.append('media_type', 'photo');

                console.log("📤 Uploading", photosBlobs.length, "photos (file)...");
                const res = await apiRequestFormData('/facebook/publish/media/upload', fd);

                if (res && res.success && res.media_ids) {
                    result.photos = result.photos.concat(res.media_ids);
                    console.log(`✅ Uploaded ${res.media_ids.length} photos (file)`);
                } else {
                    throw new Error(res.message || "Upload Photos Failed");
                }
            } catch (e) {
                console.error("❌ Lỗi upload Photos (File):", e);
                throw e;
            }
        }

        // Upload Videos (Blobs)
        if (videosBlobs.length > 0) {
            try {
                const fd = new FormData();
                videosBlobs.forEach((blob, i) => {
                    const ext = blob.type.split('/')[1] || 'mp4';
                    fd.append('files[]', blob, `video_${Date.now()}_${i}.${ext}`);
                });
                fd.append('media_type', 'video');

                console.log("📤 Uploading", videosBlobs.length, "videos (file)...");
                const res = await apiRequestFormData('/facebook/publish/media/upload', fd);

                if (res && res.success && res.media_ids) {
                    result.videos = result.videos.concat(res.media_ids);
                    console.log(`✅ Uploaded ${res.media_ids.length} videos (file)`);
                } else {
                    throw new Error(res.message || "Upload Videos Failed");
                }
            } catch (e) {
                console.error("❌ Lỗi upload Videos (File):", e);
                throw e;
            }
        }

        // --- BƯỚC 2: Upload URLs (Remote Files) ---

        // Upload Photos (URLs)
        if (photosUrls.length > 0) {
            try {
                // Validate URLs
                const validUrls = photosUrls.filter(url =>
                    url && (url.startsWith('http://') || url.startsWith('https://'))
                );

                if (validUrls.length === 0) {
                    console.warn("⚠️ Không có URL ảnh hợp lệ");
                } else {
                    const payload = {
                        sources: validUrls,
                        media_type: 'photo'
                    };

                    console.log("📤 Uploading", validUrls.length, "photos (URL)...");
                    const res = await apiRequest('/facebook/publish/media/upload-urls', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });

                    if (res && res.success && res.media_ids) {
                        result.photos = result.photos.concat(res.media_ids);
                        console.log(`✅ Uploaded ${res.media_ids.length} photos (URL)`);
                    } else {
                        throw new Error(res.message || "Không thể tải ảnh từ URL");
                    }
                }
            } catch (e) {
                console.error("❌ Lỗi upload Photos (URL):", e);
                throw new Error("Lỗi tải ảnh từ URL: " + e.message);
            }
        }

        // Upload Videos (URLs)
        if (videosUrls.length > 0) {
            try {
                // Validate URLs
                const validUrls = videosUrls.filter(url =>
                    url && (url.startsWith('http://') || url.startsWith('https://'))
                );

                if (validUrls.length === 0) {
                    console.warn("⚠️ Không có URL video hợp lệ");
                } else {
                    const payload = {
                        sources: validUrls,
                        media_type: 'video'
                    };

                    console.log("📤 Uploading", validUrls.length, "videos (URL)...");
                    const res = await apiRequest('/facebook/publish/media/upload-urls', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });

                    if (res && res.success && res.media_ids) {
                        result.videos = result.videos.concat(res.media_ids);
                        console.log(`✅ Uploaded ${res.media_ids.length} videos (URL)`);
                    } else {
                        throw new Error(res.message || "Không thể tải video từ URL");
                    }
                }
            } catch (e) {
                console.error("❌ Lỗi upload Videos (URL):", e);
                throw new Error("Lỗi tải video từ URL: " + e.message);
            }
        }

        // Trả về kết quả cuối cùng
        console.log("✅ Upload hoàn tất:", result);
        return result;
    }

    // --- Phần đăng bài lên Facebook (khi nhân nút đăng) ---
    if (publishBtn) {
        publishBtn.onclick = async () => {
            // ✅ Lấy nội dung text từ khung preview
            const previewContentEl = document.getElementById('preview-content');
            if (!previewContentEl) {
                return alert("⚠️ Không tìm thấy khung xem trước!");
            }

            const currentContent = previewContentEl.innerHTML
                .replace(/<br\s*\/?>/gi, '\n')
                .replace(/<[^>]+>/g, '')
                .trim();

            console.log("📝 Nội dung bài viết:", currentContent); // Debug

            if (!currentContent || currentContent === 'Nhập nội dung để xem trước bài viết...') {
                return alert("⚠️ Vui lòng nhập nội dung bài viết!");
            }

            if (!currentDefaultConnection || !currentDefaultConnection.page_id) {
                return alert("⚠️ Chưa có thông tin Fanpage!");
            }

            try {
                publishBtn.disabled = true;
                publishBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang đăng...';

                // BƯỚC 1: Đảm bảo có draft_post_id
                let finalDraftId = draftPostId;

                if (!finalDraftId || isNaN(parseInt(finalDraftId))) {
                    console.log("📝 Tạo draft mới...");
                    const configId = document.getElementById('config_template')?.value;

                    const draftRes = await apiRequest('/facebook/generate/content', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            config_id: configId && !isNaN(parseInt(configId)) ? parseInt(configId) : 1,
                            topic: inputIdea?.value || "Bài viết Facebook",
                            content: currentContent
                        })
                    });

                    console.log("📥 Draft Response:", draftRes);

                    if (draftRes && (draftRes.success || draftRes.data)) {
                        const dataObj = draftRes.data || draftRes;
                        finalDraftId = dataObj.draft_id || dataObj.id || dataObj.draft_post_id;
                        
                        if (finalDraftId) {
                            draftPostId = finalDraftId;
                            console.log("✅ Draft ID:", finalDraftId);
                        } else {
                            throw new Error("API không trả về draft_id");
                        }
                    } else {
                        throw new Error(draftRes?.message || "Không thể tạo draft");
                    }
                }

                // Kiểm tra lại finalDraftId
                const parsedDraftId = parseInt(finalDraftId);
                if (isNaN(parsedDraftId)) {
                    throw new Error("ID bài viết không hợp lệ: " + finalDraftId);
                }

                // BƯỚC 2: Upload media
                console.log("📤 Đang upload media...");
                const media = await uploadAllMedia();
                console.log("✅ Media uploaded:", media);

                // BƯỚC 3: Đăng bài
                const payload = {
                    draft_post_id: parsedDraftId,
                    page_id: String(currentDefaultConnection.page_id),
                    message: currentContent,   // ✅ Facebook Graph API chuẩn dùng field này
                    content: currentContent,   // ✅ Một số backend custom dùng field này
                    photo_ids: media.photos || [],
                    video_ids: media.videos || [],
                    published: true
                };

                console.log("📤 Publish Payload:", payload);

                const response = await apiRequest('/facebook/publish/posts/publish', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                console.log('📥 Publish Response:', response);

                if (response && response.success) {
                    alert('✅ Đăng bài thành công!');
                    clearDraft();
                    location.reload();
                } else {
                    throw new Error(response?.message || "Đăng bài thất bại");
                }

            } catch (e) {
                console.error("❌ Publish Error:", e);
                alert("❌ Lỗi: " + e.message);
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

    // --- AIS Assistant Click Logic ---
    async function handleAIGenerateImage(e) {
        if (e) e.preventDefault();

        // Check if connection is ready
        if (!currentDefaultConnection) {
            return alert("Vui lòng kết nối Facebook trước khi tạo ảnh!");
        }

        const prompt = window.prompt("Nhập mô tả cho hình ảnh bạn muốn tạo:", inputIdea?.value || "");
        if (!prompt) return;

        const btn = e.currentTarget;
        const originalHtml = btn.innerHTML;

        try {
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang tạo...';
            btn.style.pointerEvents = 'none';

            // We assume there's an endpoint for generating images
            const res = await apiRequest('/ai/images/generate', {
                method: 'POST',
                body: JSON.stringify({
                    prompt: prompt,
                    config_id: document.getElementById('config_template')?.value
                })
            });

            if (res && res.success && res.image_url) {
                // Thêm URL ảnh mới vào danh sách
                allSelectedImages.push(res.image_url);
                allFileObjects.push(null); // Marker that this is a remote URL

                renderImageGrid(allSelectedImages);
                updatePlaceholderText();
                saveDraft();

                if (publishBtn) publishBtn.style.display = 'block';
            } else {
                alert("Lỗi khi tạo hình ảnh: " + (res.message || "Không có phản hồi từ AI"));
            }
        } catch (error) {
            console.error("Error generating AI image:", error);
            alert("Lỗi kết nối: " + error.message);
        } finally {
            btn.innerHTML = originalHtml;
            btn.style.pointerEvents = 'auto';
        }
    }

    // if (aisToggle) aisToggle.onclick = handleAIGenerateImage;
    if (aisToggleModal) aisToggleModal.onclick = handleAIGenerateImage;
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

        // Thêm flag để tránh duplicate event listener
        if (!mainFileInput.dataset.listenerAttached) {
            mainFileInput.dataset.listenerAttached = 'true';
            mainFileInput.addEventListener('change', function () {
                handleMultipleImages(this.files);
            });
        }

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

        // --- NEW: PASTE URL LOGIC ---
        window.addEventListener('paste', async (e) => {
            // Tránh việc thêm 2 lần nếu đang paste vào ô nhập link cụ thể
            if (e.target && e.target.id === 'image-url-input') return;

            const pasteData = e.clipboardData.getData('text');
            if (!pasteData) return;

            // Check if the pasted text is a URL
            if (pasteData.startsWith('http://') || pasteData.startsWith('https://')) {
                // Determine if it's an image or video URL
                const isMedia = pasteData.match(/\.(jpeg|jpg|png|gif|webp|mp4|mov|avi|wmv|webm)($|\?)/i);

                if (isMedia) {
                    allSelectedImages.push(pasteData);
                    allFileObjects.push(null); // Marker for remote URL

                    renderImageGrid(allSelectedImages);
                    updatePlaceholderText();
                    saveDraft();

                    if (publishBtn) publishBtn.style.display = 'block';
                }
            }
        });

        // --- NEW: LINK INPUT LOGIC ---
        const addUrlBtn = document.getElementById('add-url-btn');
        const imageUrlInput = document.getElementById('image-url-input');

        if (addUrlBtn && imageUrlInput) {
            addUrlBtn.addEventListener('click', function () {
                const url = imageUrlInput.value.trim();
                if (!url) return alert("Vui lòng nhập link ảnh hoặc video!");

                if (url.startsWith('http://') || url.startsWith('https://')) {
                    allSelectedImages.push(url);
                    allFileObjects.push(null);

                    renderImageGrid(allSelectedImages);
                    updatePlaceholderText();
                    saveDraft();

                    imageUrlInput.value = '';
                    if (publishBtn) publishBtn.style.display = 'block';
                    console.log("✅ Đã thêm ảnh/video từ link nhập vào:", url);
                } else {
                    alert("Vui lòng nhập định dạng link hợp lệ (http/https)");
                }
            });

            imageUrlInput.addEventListener('keypress', function (e) {
                if (e.key === 'Enter') {
                    addUrlBtn.click();
                }
            });
        }
    }

    // Toggle Visibility of Upload Box in Main View
    // Removed dependency between toggle and upload box to keep them separate
    /*
    if (toggleImageMain && mainUploadTrigger) {
        toggleImageMain.addEventListener('change', function () {
            mainUploadTrigger.style.display = this.checked ? 'flex' : 'none';
        });
    }
    */
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
                is_default: document.getElementById('is_default')?.checked || false
            };

            try {
                saveConfigBtn.disabled = true;
                saveConfigBtn.textContent = 'ĐANG LƯU...';

                let url = '/facebook/config';
                let method = 'POST';

                if (editingFacebookConfigId) {
                    url = `/facebook/config/user/${editingFacebookConfigId}`;
                    method = 'PUT';
                }

                await apiRequest(url, {
                    method: method,
                    body: JSON.stringify(payload)
                });

                alert(editingFacebookConfigId ? "Cập nhật thành công!" : "Đã lưu cấu hình mới thành công!");

                if (configSection) configSection.style.display = 'none';
                if (mainView) mainView.style.display = 'block';

                // Reload list
                await loadUserConfigs();
                editingFacebookConfigId = null;

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

                    // Reset form fields
                    document.getElementById('config_name_input').value = '';
                    document.getElementById('bots').value = '';
                    document.getElementById('content_lengths').value = '';
                    document.getElementById('content_types').value = '';
                    document.getElementById('writing_tones').value = '';
                    document.getElementById('languages').value = '';
                    if (document.getElementById('creativity_level')) document.getElementById('creativity_level').value = 50;
                    if (document.getElementById('is_default')) document.getElementById('is_default').checked = false;

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
            // Khôi phục lại cấu hình mặc định cho các dropdown
            loadConfigs();
            console.log("Đã khôi phục văn bản và cấu hình mặc định.");
        });
    }

    // --- AIS Assistant Image Generation ---
    const aiImageModal = document.getElementById('aiImageModal');
    const aiAssistantToggle = document.getElementById('ais-assistant-toggle');
    const aiAssistantToggleModal = document.getElementById('ais-assistant-toggle-modal');
    const closeAiImageModal = document.getElementById('closeAiImageModal');
    const generateAiImageBtn = document.getElementById('generateAiImageBtn');
    const aiImagePrompt = document.getElementById('aiImagePrompt');
    const generatedImagesList = document.getElementById('generatedImagesList');
    const aiImageResult = document.getElementById('aiImageResult');

    function openAiImageModal(e) {
        if (e) e.preventDefault();
        if (aiImageModal) {
            aiImageModal.style.display = 'flex';
            if (inputIdea && !aiImagePrompt.value) {
                aiImagePrompt.value = "Hình ảnh minh họa cho: " + inputIdea.value;
            }
        }
    }

    if (aiAssistantToggle) aiAssistantToggle.onclick = openAiImageModal;
    if (aiAssistantToggleModal) aiAssistantToggleModal.onclick = openAiImageModal;
    if (closeAiImageModal) closeAiImageModal.onclick = () => aiImageModal.style.display = 'none';

    if (generateAiImageBtn) {
        generateAiImageBtn.onclick = async () => {
            const prompt = aiImagePrompt.value.trim();
            if (!prompt) return alert("Vui lòng nhập mô tả ảnh!");

            try {
                generateAiImageBtn.disabled = true;
                generateAiImageBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang tạo...';

                const response = await apiRequest('ai/images/generate', {
                    method: 'POST',
                    body: {
                        prompt: prompt,
                        n: 2,
                        size: "1024x1024"
                    }
                });

                if (response && response.success && response.images) {
                    aiImageResult.style.display = 'block';
                    generatedImagesList.innerHTML = response.images.map(img => `
                        <img src="${img.url}" class="generated-preview-img" style="width: 100%; border-radius: 8px; cursor: pointer; border: 2px solid transparent; transition: 0.2s;">
                    `).join('');

                    // Add click handlers to generated images
                    document.querySelectorAll('.generated-preview-img').forEach(img => {
                        img.onclick = () => {
                            // Add to selected images
                            allSelectedImages.push(img.src);
                            allFileObjects.push(null);
                            renderImageGrid(allSelectedImages);
                            updatePlaceholderText();
                            saveDraft();
                            aiImageModal.style.display = 'none';
                            showNotification("Đã thêm ảnh AI thành công!", "success");
                        };
                        img.onmouseover = function () { this.style.borderColor = '#1877f2'; };
                        img.onmouseout = function () { this.style.borderColor = 'transparent'; };
                    });
                }
            } catch (error) {
                alert("Lỗi tạo ảnh: " + error.message);
            } finally {
                generateAiImageBtn.disabled = false;
                generateAiImageBtn.innerHTML = '<i class="fas fa-magic"></i> Bắt đầu tạo';
            }
        };
    }

    // --- 5. INITIALIZATION ---
    updatePreviewVisibility();
    await loadConfigs();
    await loadDefaultConnection();
    loadDraft();
    await loadDraftFromURL();

    // --- Xử lý Hẹn giờ đăng bài ---
    const scheduleModal = document.getElementById('scheduleModal');
    const btnActionSchedule = document.querySelector('.btn-action-schedule');
    const closeScheduleModal = document.getElementById('closeScheduleModal');
    const cancelSchedule = document.getElementById('cancelSchedule');
    const confirmSchedule = document.getElementById('confirmSchedule');
    const scheduleTimeInput = document.getElementById('scheduleTime');

    if (btnActionSchedule && scheduleModal) {
        btnActionSchedule.addEventListener('click', () => {
            scheduleModal.style.display = 'flex';
            // Set default time to now + 30 mins
            const now = new Date();
            now.setMinutes(now.getMinutes() + 30);
            now.setMinutes(now.getMinutes() - now.getTimezoneOffset()); // Local time adjustment
            scheduleTimeInput.value = now.toISOString().slice(0, 16);
        });
    }

    const hideScheduleModal = () => {
        if (scheduleModal) scheduleModal.style.display = 'none';
    };

    if (closeScheduleModal) closeScheduleModal.addEventListener('click', hideScheduleModal);
    if (cancelSchedule) cancelSchedule.addEventListener('click', hideScheduleModal);

    if (confirmSchedule) {
    confirmSchedule.addEventListener('click', async () => {
        const timeVal = scheduleTimeInput.value;
        if (!timeVal) return alert("⚠️ Vui lòng chọn thời gian đăng!");

        const selectedTime = new Date(timeVal).getTime();
        const nowTime = new Date().getTime();
        const diffMinutes = (selectedTime - nowTime) / (1000 * 60);

        if (diffMinutes < 15) {
            return alert("⚠️ Thời gian hẹn đăng phải cách hiện tại ít nhất 15 phút!");
        }

        if (!currentDefaultConnection || !currentDefaultConnection.page_id) {
            return alert("⚠️ Chưa có thông tin Fanpage!");
        }

        try {
            confirmSchedule.disabled = true;
            confirmSchedule.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';

            // ✅ BƯỚC 1: Lấy nội dung text từ preview
            const previewContentEl = document.getElementById('preview-content');
            if (!previewContentEl) {
                throw new Error("Không tìm thấy khung xem trước!");
            }

            const currentContent = previewContentEl.innerHTML
                .replace(/<br\s*\/?>/gi, '\n')
                .replace(/<[^>]+>/g, '')
                .trim();
            console.log("📝 Nội dung hẹn giờ:", currentContent);

            if (!currentContent || currentContent === 'Nhập nội dung để xem trước bài viết...') {
                throw new Error("Vui lòng nhập nội dung bài viết!");
            }

            // ✅ BƯỚC 2: Đảm bảo có draft_post_id
            let finalDraftId = draftPostId;

            if (!finalDraftId || isNaN(parseInt(finalDraftId))) {
                console.log("📝 Tạo draft mới cho hẹn giờ...");
                const configId = document.getElementById('config_template')?.value;

                const draftRes = await apiRequest('/facebook/generate/content', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        config_id: configId && !isNaN(parseInt(configId)) ? parseInt(configId) : 1,
                        topic: inputIdea?.value || "Bài viết Facebook",
                        message: currentContent,
                        content: currentContent
                    })
                });

                console.log("📥 Draft Response (Schedule):", draftRes);

                if (draftRes && (draftRes.success || draftRes.data)) {
                    const dataObj = draftRes.data || draftRes;
                    finalDraftId = dataObj.draft_id || dataObj.id || dataObj.draft_post_id;

                    if (finalDraftId) {
                        draftPostId = finalDraftId;
                        console.log("✅ Draft ID (Schedule):", finalDraftId);
                    } else {
                        throw new Error("API không trả về draft_id");
                    }
                } else {
                    throw new Error(draftRes?.message || "Không thể tạo draft");
                }
            }

            // Kiểm tra lại finalDraftId
            const parsedDraftId = parseInt(finalDraftId);
            if (isNaN(parsedDraftId)) {
                throw new Error("ID bài viết không hợp lệ: " + finalDraftId);
            }

            // ✅ BƯỚC 3: Upload media
            console.log("📤 Đang upload media cho hẹn giờ...");
            const media = await uploadAllMedia();
            console.log("✅ Media uploaded (Schedule):", media);

            // ✅ BƯỚC 4: Tạo payload hẹn giờ
            const scheduledTimeISO = new Date(timeVal).toISOString();

            const payload = {
                draft_post_id: parsedDraftId,
                page_id: String(currentDefaultConnection.page_id),
                message: currentContent,
                content: currentContent,
                published: false,
                scheduled_time: scheduledTimeISO,  // ✅ ISO format: "2025-01-27T14:30:00.000Z"
                photo_ids: media.photos || [],
                video_ids: media.videos || []
            };

            console.log("📤 Schedule Payload:", payload);
            console.log("🕒 Scheduled Time (ISO):", scheduledTimeISO);

            console.log("📤 Schedule Payload:", payload);

            // ✅ BƯỚC 5: Gọi API hẹn giờ
            const response = await apiRequest(`/facebook/publish/posts/scheduled/${parsedDraftId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            console.log('📥 Schedule Response:', response);

            if (response && response.success) {
                const scheduledTimeStr = new Date(timeVal).toLocaleString('vi-VN', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                });
                
                alert(`✅ Đã lên lịch đăng bài thành công!\n\nThời gian: ${scheduledTimeStr}`);
                hideScheduleModal();
                clearDraft();
                location.reload();
            } else {
                throw new Error(response?.message || "Lỗi khi hẹn giờ đăng bài");
            }

        } catch (e) {
            console.error("❌ Schedule Error:", e);
            alert("❌ Lỗi hẹn giờ: " + e.message);
        } finally {
            confirmSchedule.disabled = false;
            confirmSchedule.innerHTML = '<i class="fas fa-calendar-check"></i> Xác nhận';
        }
    });
}

});
sua ở dây