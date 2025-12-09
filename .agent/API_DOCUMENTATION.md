# TÀI LIỆU API - CÁCH UI GỌI ĐẾN SERVER

## 📌 TỔNG QUAN

Hệ thống sử dụng **JavaScript Fetch API** để giao tiếp với Backend Server qua giao thức HTTP/HTTPS.

**Base URL hiện tại:**
```
http://172.16.1.78:8080/api/v1
```

---

## 🔗 DANH SÁCH ENDPOINTS

### 1. **Load Cấu Hình Hệ Thống** (Khởi động trang)
**Endpoint:** `GET /ui/configs`

**Mục đích:** Lấy danh sách các tùy chọn cho dropdown (Loại bài, Tone giọng, Ngôn ngữ, AI Model)

**Request:**
```javascript
fetch('http://172.16.1.78:8080/api/v1/ui/configs', {
    method: "GET",
    headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true"
    }
})
```

**Response mong đợi:**
```json
{
    "content_types": ["Blog SEO", "Tin tức", "Hướng dẫn"],
    "writing_tones": ["Chuyên nghiệp", "Thuyết phục", "Sáng tạo"],
    "languages": ["Tiếng Việt", "Tiếng Anh", "Tiếng Thái"],
    "bots": ["GPT-4.1", "Gemini-2.5-flash"]
}
```

---

## 🌐 QUY TRÌNH NGUỒN INTERNET (4 BƯỚC)

### Bước 1: Crawl Tin Tức
**Endpoint:** `POST /crawl/news`

**Mục đích:** Tìm kiếm tin tức liên quan đến từ khóa từ Internet

**Request Body:**
```json
{
    "query": "máy tính AI cho doanh nghiệp",
    "max_results": 5
}
```

**Response:**
```json
{
    "success": true,
    "results": [
        {
            "title": "Tiêu đề bài viết",
            "url": "https://example.com/article",
            "snippet": "Mô tả ngắn...",
            "published_date": "2024-12-09"
        }
    ]
}
```

**Code thực tế:**
```javascript
const response = await fetch(`${API_BASE_URL}/crawl/news`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
        query: user_query,
        max_results: 5
    })
});
const data = await response.json();
crawledArticles = data.results; // Lưu vào biến toàn cục
```

---

### Bước 2: Crawl Chi Tiết Bài Viết
**Endpoint:** `POST /crawl/crawl`

**Mục đích:** Lấy nội dung đầy đủ của các bài viết đã tìm được

**Request Body:**
```json
{
    "articles": [
        {
            "title": "...",
            "url": "https://example.com/article"
        }
    ]
}
```

**Response:**
```json
{
    "articles": [
        {
            "title": "...",
            "url": "...",
            "content": "Nội dung đầy đủ bài viết...",
            "images": ["url1.jpg", "url2.jpg"]
        }
    ]
}
```

---

### Bước 3: Lọc Tin Tức & Tạo Dàn Ý
**Endpoint:** `POST /ai/news-filterings`

**Mục đích:** AI phân tích các bài viết và tạo dàn ý (outline) phù hợp

**Request Body:**
```json
{
    "articles": [...],
    "main_keyword": "máy tính AI",
    "secondary_keywords": ["AI doanh nghiệp", "máy tính thông minh"],
    "article_title": "Top 5 máy tính AI cho doanh nghiệp",
    "top_k": 3
}
```

**Response:**
```json
{
    "outline": [
        {
            "section": "Giới thiệu",
            "content": "..."
        },
        {
            "section": "Phần 1: Lợi ích của AI",
            "content": "..."
        }
    ],
    "selected_articles": [...]
}
```

**Code:**
```javascript
const payload = {
    articles: detailedArticles,
    main_keyword: user_query,
    secondary_keywords: ['tag1', 'tag2'],
    article_title: title,
    top_k: 3
};

const response = await fetch(`${API_BASE_URL}/ai/news-filtering`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
});

filteredOutline = await response.json();
```

---

### Bước 4: Tạo Nội Dung Hoàn Chỉnh
**Endpoint:** `POST /ai/contents`

**Mục đích:** AI viết bài hoàn chỉnh dựa trên dàn ý và cấu hình người dùng

**Request Body:**
```json
{
    "top_news": [
        {
            "rank": 1,
            "title": "...",
            "url": "...",
            "images": [],
            "content_preview": "..."
        }
    ],
    "target_language": "Tiếng Việt",
    "config": {
        "bot_id": "GPT-4.1",
        "article_length": "2000",
        "tone": "Chuyên nghiệp",
        "article_type": "Blog SEO",
        "custome_instructions": null
    },
    "title": "Tiêu đề bài viết",
    "outline": [...],
    "main_keyword": "máy tính AI",
    "secondary_keywords": ["AI doanh nghiệp"]
}
```

**Response:**
```json
{
    "success": true,
    "content": "Nội dung bài viết đầy đủ...",
    "metadata": {
        "word_count": 2000,
        "seo_score": 85
    }
}
```

---

## 📁 QUY TRÌNH NGUỒN PRIVATE (1 BƯỚC)

### Tạo Bài Từ Dữ Liệu Riêng
**Endpoint:** `POST /ui/generate`

**Mục đích:** Tạo bài viết từ file/text/link mà người dùng đã upload

**Request Body:**
```json
{
    "user_query": "máy tính AI",
    "source_type": "private",
    "config": {
        "title": "Bài viết về máy tính AI",
        "type": "Blog SEO",
        "tone": "Chuyên nghiệp",
        "lang": "Tiếng Việt",
        "bot": "GPT-4.1",
        "len": "2000",
        "context": "Nội dung bổ sung từ textarea...",
        "website": "https://mywebsite.com"
    },
    "private_data": {
        "files": [
            {
                "name": "document.pdf",
                "size": 102400,
                "type": "application/pdf",
                "base64": "data:application/pdf;base64,JVBERi0xLjQK..."
            }
        ],
        "text": "Nội dung text người dùng nhập...",
        "links": [
            { "url": "https://product.com/item1" }
        ]
    }
}
```

**Response:**
```json
{
    "success": true,
    "content": "Nội dung bài viết...",
    "outline": [...],
    "metadata": {...}
}
```

**Code:**
```javascript
const payload = {
    user_query: user_query,
    source_type: 'private',
    config: {
        title: title,
        type: content_type,
        tone: writing_tone,
        lang: language,
        bot: bot,
        len: article_length,
        context: context,
        website: website
    },
    private_data: {
        files: selectedFiles,
        text: tempTextContent,
        links: productLinks
    }
};

const response = await fetch(`${API_BASE_URL}/ui/generate`, {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true"
    },
    body: JSON.stringify(payload)
});

const result = await response.json();
```

---

## ⚙️ CƠ CHẾ XỬ LÝ LỖI

### 1. Timeout (Hết thời gian chờ)
Hiện tại code **KHÔNG** có timeout. Nếu server phản hồi chậm, UI sẽ đợi mãi.

**Khuyến nghị:** Thêm `AbortController` với timeout 30 giây:
```javascript
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 30000);

fetch(url, {
    signal: controller.signal,
    ...
});
clearTimeout(timeoutId);
```

### 2. Lỗi Mạng (Network Error)
Nếu server không chạy hoặc mất mạng, `fetch` sẽ throw error:
```javascript
catch (error) {
    console.error("❌ Lỗi:", error);
    showNotification(`Lỗi: ${error.message}`, "error");
    showLoading(false);
}
```

### 3. Lỗi HTTP (4xx, 5xx)
Nếu server trả về mã lỗi (VD: 404, 500):
```javascript
if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
}
```

---

## 📊 LUỒNG DỮ LIỆU HOÀN CHỈNH

```
[Người dùng nhập liệu]
        ↓
[Nhấn nút "Tạo dàn ý"]
        ↓
[JavaScript thu thập dữ liệu từ form]
        ↓
┌─────────────────────────────────────┐
│   Nguồn Internet?                   │
├─────────────────────────────────────┤
│ YES → Chạy 4 bước:                  │
│   1. /crawl/news                    │
│   2. /crawl/crawl                   │
│   3. /ai/news-filtering             │
│   4. /ai/contents                   │
│                                     │
│ NO → Chạy 1 bước:                   │
│   1. /ui/generate                   │
└─────────────────────────────────────┘
        ↓
[Lưu kết quả vào sessionStorage]
        ↓
[Chuyển hướng sang dan-y-bai-viet.php]
```

---

## 🔐 HEADERS QUAN TRỌNG

```javascript
headers: {
    "Content-Type": "application/json",        // Báo server nhận JSON
    "ngrok-skip-browser-warning": "true"       // Bỏ qua cảnh báo ngrok
}
```

---

## 💾 LƯU TRỮ DỮ LIỆU

### LocalStorage (Tồn tại lâu dài)
- `uploadedFilesData`: File đã upload
- `maxCompletedStep`: Bước đã hoàn thành
- `tempTextContent`: Nội dung text
- `productLinks`: Danh sách link sản phẩm
- `crawledArticles`: Tin tức đã crawl
- `filteredOutline`: Dàn ý đã lọc

### SessionStorage (Chỉ tồn tại trong phiên)
- `apiResult`: Kết quả từ API
- `generationSource`: Nguồn dữ liệu ('internet' hoặc 'private')
- `pipelineData`: Payload đã gửi

---

## 🧪 CÁCH TEST API

### 1. Dùng Browser Console
```javascript
// Test load configs
fetch('http://172.16.1.78:8080/api/v1/ui/configs', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
})
.then(r => r.json())
.then(d => console.log(d));
```

### 2. Dùng Postman/Thunder Client
- Method: POST
- URL: `http://172.16.1.78:8080/api/v1/crawl/news`
- Body (JSON):
```json
{
    "query": "test keyword",
    "max_results": 3
}
```

### 3. Kiểm tra Network Tab
1. Mở DevTools (F12)
2. Tab **Network**
3. Nhấn nút "Tạo dàn ý"
4. Xem các request được gửi đi

---

## 📝 GHI CHÚ

- Tất cả API đều dùng **POST** trừ `/ui/configs` (GET)
- Server phải hỗ trợ **CORS** để UI gọi được
- Nếu dùng ngrok, nhớ thêm header `ngrok-skip-browser-warning`
- Response luôn phải là **JSON** hợp lệ

---

**Tài liệu này được tạo tự động bởi Antigravity AI**
*Cập nhật lần cuối: 2025-12-10*
