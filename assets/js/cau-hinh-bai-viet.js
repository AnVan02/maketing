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

// Xử lý gợi ý AI
const aiSuggestBtn = document.getElementById('aiSuggestBtn');
const articleTitle = document.getElementById('articleTitle');
const mainKeyword = document.getElementById('mainKeyword');

aiSuggestBtn.addEventListener('click', function() {
    this.disabled = true;
    this.textContent = 'Đang tạo...';
    
    setTimeout(() => {
        const keyword = mainKeyword.value || 'công nghệ AI';
        const suggestions = [
            `Top 10 ${keyword} tốt nhất năm 2024`,
            `Hướng dẫn chi tiết về ${keyword} cho người mới`,
            `${keyword}: Những điều bạn cần biết`,
            `Cách tối ưu hiệu quả với ${keyword}`
        ];
        
        articleTitle.value = suggestions[Math.floor(Math.random() * suggestions.length)];
        this.disabled = false;
        this.textContent = 'Gợi ý bằng AI';
    }, 1500);
});

// Xử lý tùy chọn nâng cao
const advancedToggle = document.getElementById('advancedToggle');
const advancedContent = document.getElementById('advancedContent');

advancedToggle.addEventListener('click', function() {
    this.classList.toggle('open');
    advancedContent.classList.toggle('open');
});

// Cập nhật preview khi thay đổi độ dài
const articleLength = document.getElementById('articleLength');
const previewLength = document.getElementById('previewLength');
const previewTime = document.getElementById('previewTime');
const previewStructure = document.getElementById('previewStructure');

articleLength.addEventListener('change', function() {
    const lengthMap = {
        'short': { text: '800-1200 từ', time: '2-3 phút', structure: ['Phần mở đầu (100-150 từ)', '3-4 phần nội dung chính', 'Kết luận và CTA'] },
        'medium': { text: '1200-2000 từ', time: '3-5 phút', structure: ['Phần mở đầu (150-200 từ)', '5-6 phần nội dung chính', 'Case study & Ví dụ', 'Kết luận và CTA'] },
        'long': { text: '2000-3000 từ', time: '5-8 phút', structure: ['Phần mở đầu chi tiết (200-300 từ)', '7-10 phần nội dung sâu', 'Case study & Phân tích', 'FAQ', 'Kết luận và CTA'] }
    };
    
    const selected = lengthMap[this.value];
    previewLength.textContent = selected.text;
    previewTime.textContent = selected.time;
    
    previewStructure.innerHTML = selected.structure.map(item => 
        `<li><span class="bullet"></span> ${item}</li>`
    ).join('');
});

// Cập nhật tone giọng preview
const toneSelect = document.getElementById('tone');
const previewTone = document.getElementById('previewTone');

toneSelect.addEventListener('change', function() {
    const toneMap = {
        'professional': '"Trong thời đại công nghệ 4.0, việc ứng dụng AI vào doanh nghiệp không chỉ là xu hướng mà đã trở thành yếu tố quyết định."',
        'friendly': '"Bạn đã bao giờ tự hỏi làm thế nào AI có thể giúp công việc của bạn dễ dàng hơn? Hãy cùng khám phá nhé!"',
        'expert': '"Kiến trúc học sâu và các mô hình transformer đang định hình lại cách chúng ta tiếp cận bài toán tối ưu hóa trong doanh nghiệp."',
        'casual': '"AI ngày nay không còn xa lạ nữa! Bắt đầu với những công cụ đơn giản, bạn sẽ thấy sự khác biệt ngay!"'
    };
    
    previewTone.textContent = toneMap[this.value] || toneMap['professional'];
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
generateBtn.addEventListener('click', function() {
    const keyword = mainKeyword.value;
    const title = articleTitle.value;
    
    if (!keyword || !title) {
        alert('Vui lòng điền đầy đủ từ khóa chính và tiêu đề bài viết!');
        return;
    }
    
    this.disabled = true;
    this.innerHTML = '<span class="edit-icon">⏳</span> Đang tạo bài viết...';
    
    setTimeout(() => {
        alert('Bài viết đã được tạo thành công! Chuyển sang bước 2/3...');
        this.disabled = false;
        this.innerHTML = '<span class="edit-icon">✍️</span> Generate bài viết';
    }, 2000);
});

// Xử lý lưu nháp
const saveDraftBtn = document.getElementById('saveDraft');
saveDraftBtn.addEventListener('click', function(e) {
    e.preventDefault();
    const draftData = {
        mainKeyword: mainKeyword.value,
        title: articleTitle.value,
        length: articleLength.value,
        tone: toneSelect.value
    };
    
    alert('Nháp đã được lưu thành công!');
    console.log('Draft saved:', draftData);
});

// xử lý bài viết
document.getElementById('articleForm').addEventListener('submit', function() {
    document.getElementById('submitBtn').disabled = true;
    document.getElementById('submitBtn').innerHTML = '<div class="loading"></div>Đang xử lý...';
});

// Hiển thị thông báo khi thay đổi cấu hình
const configElements = document.querySelectorAll('select, textarea');
configElements.forEach(element => {
    element.addEventListener('change', function() {
        // Có thể thêm hiệu ứng visual khi thay đổi cấu hình
        this.style.borderColor = '#28a745';
        setTimeout(() => {
            this.style.borderColor = '#dee2e6';
        }, 1000);
    });
});