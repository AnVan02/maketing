document.addEventListener('DOMContentLoaded', function () {
    const inputIdea = document.getElementById('input-idea');
    const previewContent = document.getElementById('preview-content');
    const previewImage = document.getElementById('preview-image');
    const imageInput = document.getElementById('image-input');
    const uploadArea = document.getElementById('upload-area');

    // Live preview nội dung khi gõ
    inputIdea.addEventListener('input', function () {
        const text = this.value.trim();
        if (text === '') {
            previewContent.innerHTML = '<span style="color:#888; font-style:italic; font-size:15px;">Nhập nội dung để xem trước bài viết...</span>';
        } else {
            previewContent.textContent = text;
        }
    });

    // Upload ảnh
    uploadArea.addEventListener('click', () => imageInput.click());

    imageInput.addEventListener('change', function () {
        if (this.files && this.files[0]) {
            const reader = new FileReader();
            reader.onload = function (e) {
                previewImage.src = e.target.result;
                previewImage.style.display = 'block';
            };
            reader.readAsDataURL(this.files[0]);
        }
    });

    // Nút Xem trước → (sau này sẽ gọi API AI)
    document.getElementById('preview-btn').addEventListener('click', function () {
        const data = {
            idea: inputIdea.value.trim(),
            length: document.getElementById('length').value,
            type: document.getElementById('type').value,
            tone: document.getElementById('tone').value,
            model: document.getElementById('model').value,
            language: document.getElementById('language').value,
            emoji: document.getElementById('emoji').checked,
            hashtag: document.getElementById('hashtag').checked,
            image: document.getElementById('image').checked
        };

        // Thay đoạn alert này bằng fetch API thực tế
        console.log('Dữ liệu gửi đi:', data);
        alert('Đã thu thập dữ liệu sẵn sàng gửi API:\n' + JSON.stringify(data, null, 2));
    });

    // Nút Khởi phục
    document.getElementById('reset-btn').addEventListener('click', function () {
        inputIdea.value = '';
        previewContent.innerHTML = '<span style="color:#65676b; font-style:italic;">Nhập nội dung để xem trước bài viết...</span>';
        previewImage.src = '';
        previewImage.style.display = 'none';
        imageInput.value = '';
    });

    // Nút Hướng dẫn (tùy chọn)
    document.getElementById('guide-btn').addEventListener('click', function () {
        alert('Hướng dẫn sử dụng:\n- Nhập ý tưởng vào ô "Yêu cầu đầu vào"\n- Tùy chỉnh các thiết lập bên dưới\n- Bấm "Xem trước →" để tạo bài viết bằng AI');
    });
});