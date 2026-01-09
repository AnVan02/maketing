// ============================================
// 1. API HELPER & CONFIGS (GLOBAL SCOPE)
// ============================================

async function apiRequest(endpoint, method = 'GET', body = null) {
    // Đảm bảo endpoint bắt đầu bằng api/v1/
    let cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    if (!cleanEndpoint.startsWith('api/v1/')) {
        cleanEndpoint = 'api/v1/' + cleanEndpoint;
    }

    const url = `api-handler.php?endpoint=${cleanEndpoint}`;
    const options = {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        }
    };

    // Thêm Token nếu có
    const token = localStorage.getItem('access_token');
    if (token) {
        options.headers['Authorization'] = `Bearer ${token}`;
    }

    if (body) {
        options.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.message || `API Error ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("API Request Failed:", error);
        throw error;
    }
}


async function loadConfigs() {
    console.log("🚀 Đang tải cấu hình hệ thống...");
    const selectIds = ['content_lengths', 'content_types', 'writing_tones', 'languages', 'bots'];

    selectIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = '<option value="">Đang tải dữ liệu...</option>';
    });
    try {
        // const data = await apiRequest('ui/configs');

        console.log("✅ Configs loaded:", data);

        const populate = (id, items, label) => {
            const el = document.getElementById(id);
            if (!el) return;
            el.innerHTML = `<option value="">${label}</option>`;
            if (items && Array.isArray(items)) {
                items.forEach(i => {
                    const opt = document.createElement('option');
                    opt.value = i;
                    opt.textContent = i;
                    el.appendChild(opt);
                });
            }
        };

        populate('content_lengths', data.content_lengths, 'Chọn độ dài bài viết ')
        populate('content_types', data.content_types, 'Chọn loại bài viết');
        populate('writing_tones', data.writing_tones, 'Chọn tone giọng');
        populate('languages', data.languages, 'Chọn ngôn ngữ');
        populate('bots', data.bots, 'Chọn AI Model');

        return true;

    } catch (e) {
        console.error("❌ Lỗi loadConfigs:", e);
        if (typeof showNotification === 'function') {
            showNotification("Không kết nối được API. Dùng cấu hình mặc định.", "warning");
        }
        createDefaultConfigs();
        return false;
    }
}

function createDefaultConfigs() {
    const defaults = {
        content_lengths: ["Ngắn (900-1200 từ)", "Trung bình (1500-1800 từ)", "Dài (2000-2500 từ)"],
        content_types: ["Blog SEO", "Tin tức", "Hướng dẫn"],
        writing_tones: ["Chuyên nghiệp", "Thuyết phục", "Sáng tạo"],
        languages: ["Tiếng Việt", "Tiếng Anh", "Tiếng Thái"],
        bots: ["GPT-4.1", "Gemini-2.5-flash"]
    };


    const fill = (id, arr) => {
        const el = document.getElementById(id);
        if (el) {
            el.innerHTML = '<option value="">Chọn...</option>';
            arr.forEach(x => el.innerHTML += `<option value="${x}">${x}</option>`);
        }
    }

    fill('content_lengths', defaults.content_lengths);
    fill('content_types', defaults.content_types);
    fill('writing_tones', defaults.writing_tones);
    fill('languages', defaults.languages);
    fill('bots', defaults.bots);
}

// ============================================
// 2. MAIN LOGIC (DOM READY)
// ============================================
document.addEventListener('DOMContentLoaded', function () {
    // Elements
    const inputIdea = document.getElementById('input-idea');
    const previewBtn = document.getElementById('preview-btn');
    const resetBtn = document.getElementById('reset-btn');
    const videoContainer = document.getElementById('video-container');
    const facebookPreview = document.getElementById('facebook-preview');
    const previewContent = document.getElementById('preview-content');
    const previewImage = document.getElementById('preview-image');

    // Optional elements (may not exist in DOM yet)
    const imageInput = document.getElementById('image-input');
    const uploadArea = document.getElementById('upload-area');
    const removeImageBtn = document.getElementById('remove-image-btn');

    // Helper functions
    function showFacebookPreview() {
        if (videoContainer) videoContainer.style.display = 'none';
        if (facebookPreview) facebookPreview.style.display = 'block';

        // Update content from Input Idea if available
        const inputIdea = document.getElementById('input-idea');
        const previewContent = document.getElementById('preview-content');
        if (inputIdea && previewContent) {
            const val = inputIdea.value.trim();
            if (val) {
                previewContent.innerText = val;
            }
        }
    }

    function showVideo() {
        if (facebookPreview) facebookPreview.style.display = 'none';
        if (videoContainer) videoContainer.style.display = 'block';
    }

    // // 1. Live preview content
    // if (inputIdea && previewContent) {
    //     inputIdea.addEventListener('input', function () {
    //         const text = this.value.trim();
    //         if (text === '') {
    //             previewContent.innerHTML = '<span style="color:#888; font-style:italic; font-size:15px;">Nhập nội dung để xem trước bài viết...</span>';
    //         } else {
    //             previewContent.innerText = text;
    //         }
    //     });

    //     // "Khi click vào 'Yêu cầu đầu vào' -> ẨN VIDEO – HIỆN PREVIEW FACEBOOK"
    //     inputIdea.addEventListener('focus', showFacebookPreview);
    // }

    // 2. Button Handlers

    // "Khi click vào ... hoặc bấm 'Xem trước' -> HIỆN CONFIG SECTION"
    const previewBtnMain = document.getElementById('preview-btn') || document.querySelector('.preview-btn-main');
    if (previewBtnMain) {
        previewBtnMain.addEventListener('click', function () {
            // Hide Main View
            const mainView = document.getElementById('main-view');
            if (mainView) mainView.style.display = 'none';
            // Show Config Section
            const configSection = document.getElementById('config-section');
            if (configSection) {
                configSection.style.display = 'block';
                // Focus on Name Input
                const configNameInput = document.getElementById('config_name_input');
                if (configNameInput) configNameInput.focus();
            }
        });
    }

    // Back to List Button Logic
    const backListBtn = document.getElementById('back-list-btn');
    if (backListBtn) {
        backListBtn.addEventListener('click', function (e) {
            e.preventDefault();
            // Hide Config Section
            const configSection = document.getElementById('config-section');
            if (configSection) configSection.style.display = 'none';
            // Show Main View
            const mainView = document.getElementById('main-view');
            if (mainView) mainView.style.display = 'block';
        });
    }

    // Config Section Interactions
    const configSection = document.getElementById('config-section');
    const saveConfigBtn = document.getElementById('save-config-btn');
    const toggleImage = document.getElementById('toggle-image');
    const modalImageGroup = document.getElementById('modal-image-group');
    const modalUploadTrigger = document.getElementById('modal-upload-trigger');
    const modalFileInput = document.getElementById('modal-file-input');

    // Toggle Image Section Visibility
    if (toggleImage && modalImageGroup) {
        toggleImage.addEventListener('change', function () {
            modalImageGroup.style.display = this.checked ? 'block' : 'none';
        });
    }

    // Image Upload
    if (modalUploadTrigger && modalFileInput) {
        modalUploadTrigger.addEventListener('click', () => modalFileInput.click());
        modalFileInput.addEventListener('change', function () {
            if (this.files && this.files[0]) {
                const placeholder = modalUploadTrigger.querySelector('.file-upload-placeholder');
                if (placeholder) placeholder.innerText = this.files[0].name;

                const reader = new FileReader();
                reader.onload = function (e) {
                    if (previewImage) {
                        previewImage.src = e.target.result;
                    }
                };
                reader.readAsDataURL(this.files[0]);
            }
        });
    }

    if (saveConfigBtn) {
        saveConfigBtn.addEventListener('click', function () {
            // Validate Name
            const nameInput = document.getElementById('config_name_input');
            const configName = nameInput ? nameInput.value.trim() : `Cấu hình ${new Date().toLocaleTimeString()}`;

            // Collect Data
            const newConfig = {
                id: Date.now(),
                name: configName,
                length: document.getElementById('content_lengths').value,
                creativity: document.getElementById('creativity_level').value,
                type: document.getElementById('content_types').value,
                tone: document.getElementById('writing_tones').value,
                model: document.getElementById('bots').value,
                language: document.getElementById('languages').value,
                // Toggles need specific IDs or query
                emoji: document.querySelector('.toggle-row:nth-child(1) input') ? document.querySelector('.toggle-row:nth-child(1) input').checked : false,
                hashtag: document.querySelector('.toggle-row:nth-child(2) input') ? document.querySelector('.toggle-row:nth-child(2) input').checked : false,
                image: toggleImage ? toggleImage.checked : false,
                article_count: 0,
                created_at: new Date().toLocaleDateString('vi-VN')
            };

            // Save to LocalStorage
            const configs = JSON.parse(localStorage.getItem('user_configs')) || [];
            configs.push(newConfig);
            localStorage.setItem('user_configs', JSON.stringify(configs));
            console.log('Saved new config:', newConfig);

            // 1. Hide Config Section
            if (configSection) configSection.style.display = 'none';

            // 2. Show Main View
            const mainView = document.getElementById('main-view');
            if (mainView) mainView.style.display = 'block';

            // 3. Show Preview (Right Panel logic)
            showFacebookPreview();

            // 4. Handle Mock Data / Image Visibility
            if (toggleImage && toggleImage.checked) {
                if (previewImage && previewImage.src && previewImage.src !== window.location.href) {
                    previewImage.style.display = 'block';
                }
            } else {
                if (previewImage) previewImage.style.display = 'none';
            }

            alert("Đã lưu cấu hình và áp dụng!");
        });
    }

    // "Bấm 'Khôi phục' -> quay lại VIDEO"
    if (resetBtn) {
        resetBtn.addEventListener('click', function () {
            showVideo();

            // Reset content
            if (inputIdea) inputIdea.value = '';
            if (previewContent) previewContent.innerHTML = '<span style="color:#65676b; font-style:italic;">Nhập nội dung để xem trước bài viết...</span>';
            if (previewImage) {
                previewImage.src = '';
                previewImage.style.display = 'none';
            }
            if (imageInput) imageInput.value = '';
        });
    }

    // 3. Image Upload Logic (Safeguarded)
    if (uploadArea && imageInput) {
        uploadArea.addEventListener('click', () => imageInput.click());
        imageInput.addEventListener('change', function () {
            if (this.files && this.files[0]) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    if (previewImage) {
                        previewImage.src = e.target.result;
                        previewImage.style.display = 'block';
                    }
                };
                reader.readAsDataURL(this.files[0]);
            }
        });
    }

    if (removeImageBtn && previewImage && imageInput) {
        removeImageBtn.addEventListener('click', function () {
            previewImage.src = '';
            previewImage.style.display = 'none';
            imageInput.value = '';
        });
    }

    // 4. Guide / Misc
    const guideBtns = document.querySelectorAll('.guide-btn, #guide-btn');
    guideBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            alert('Hướng dẫn sử dụng:\n- Nhập ý tưởng vào ô "Yêu cầu đầu vào"\n- Bấm "Xem trước →" để tạo bài viết bằng AI');
        });
    });

    // 5. Facebook Interaction Buttons (Mock)
    document.querySelectorAll('.action-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const action = this.classList[1];
            if (action === 'like-btn') {
                this.innerHTML = '<i class="fas fa-thumbs-up" style="color: #1877f2;"></i> Đã thích';
                this.style.color = '#1877f2';
            } else if (action === 'comment-btn') {
                alert('Chức năng bình luận (chỉ để minh họa)');
            } else if (action === 'share-btn') {
                alert('Chức năng chia sẻ (chỉ để minh họa)');
            }
        });
    });

    // Initial State
    showVideo();
    loadConfigs();

});