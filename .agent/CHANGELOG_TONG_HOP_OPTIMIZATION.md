# Tối ưu hóa trang Tổng hợp - Không reload trang

## Ngày: 2026-01-10

## Mục tiêu
Tối ưu hóa trang `tong-hop.php` để **không cần reload toàn bộ trang** khi hiển thị dữ liệu. Thay vào đó, sử dụng **API pagination** để chỉ tải dữ liệu cần thiết.

---

## Các thay đổi chính

### 1. **Tối ưu hóa API Calls** (`js/tong-hop.js`)

#### Trước đây:
- Load **TẤT CẢ** bài viết (limit=1000) một lần khi trang load
- Lưu tất cả vào mảng `allArticles`
- Phân trang chỉ ở phía client (cắt mảng)
- **Vấn đề**: Chậm khi có nhiều dữ liệu, tốn băng thông

#### Bây giờ:
- Chỉ load **10 bài viết** mỗi lần (theo trang hiện tại)
- Sử dụng `offset` và `limit` để phân trang từ API
- Mỗi lần chuyển trang → gọi API mới
- **Lợi ích**: Nhanh hơn, tiết kiệm băng thông

```javascript
// Cũ
async function fetchArticles(limit = 1000, offset = 0) {
    // Load tất cả bài viết
    return response.articles; // Trả về mảng
}

// Mới
async function fetchArticles(limit = 10, offset = 0) {
    // Chỉ load số lượng cần thiết
    return {
        articles: response.articles,
        total: response.total // Tổng số để tính pagination
    };
}
```

---

### 2. **Chuyển trang không reload** (`js/tong-hop.js`)

#### Hàm `goToPage()` mới:
```javascript
async function goToPage(page) {
    // 1. Hiển thị loading
    renderArticles([], true);
    
    // 2. Tính offset
    const offset = (currentPage - 1) * itemsPerPage;
    
    // 3. Gọi API lấy dữ liệu trang mới
    const result = await fetchArticles(itemsPerPage, offset);
    
    // 4. Render dữ liệu mới
    renderArticles(result.articles);
    
    // 5. Cập nhật UI pagination
    updatePaginationInfo();
    renderPagination();
}
```

**Không còn**: `getArticlesForPage()` - không cần cắt mảng nữa

---

### 3. **Thêm nút Refresh** (`tong-hop.php`)

Thêm nút "Làm mới" để cập nhật dữ liệu mà **không cần F5**:

```html
<button id="refreshBtn" class="refresh-btn" onclick="refreshData()">
    <svg>...</svg>
    Làm mới
</button>
```

#### Hàm `refreshData()`:
```javascript
async function refreshData() {
    // 1. Lấy lại tổng số bài viết
    const result = await fetchArticles(itemsPerPage, 0);
    totalArticles = result.total;
    
    // 2. Cập nhật thống kê
    await updateStats();
    
    // 3. Hiển thị lại trang hiện tại
    await goToPage(currentPage);
}
```

---

### 4. **Loading State** (`js/tong-hop.js`)

Thêm trạng thái loading khi đang tải dữ liệu:

```javascript
function renderArticles(articles, isLoading = false) {
    if (isLoading) {
        // Hiển thị icon xoay + text "Đang tải dữ liệu..."
        tableBody.innerHTML = `
            <tr>
                <td colspan="6">
                    <svg>...</svg>
                    <span>Đang tải dữ liệu...</span>
                </td>
            </tr>
        `;
        return;
    }
    
    // Render bình thường...
}
```

---

### 5. **CSS Animations** (`css/tong-hop.css`)

#### Nút Refresh:
```css
.refresh-btn {
    padding: 8px 16px;
    border-radius: 99px;
    border: 1px solid #E5E7EB;
    display: flex;
    align-items: center;
    gap: 6px;
}

.refresh-btn:hover {
    border-color: var(--primary-blue);
    color: var(--primary-blue);
}

.refresh-btn:active svg {
    animation: rotate 0.6s ease-in-out;
}
```

#### Loading Animation:
```css
.activity-table tbody svg {
    animation: rotate 1s linear infinite;
}

@keyframes rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}
```

---

### 6. **Cập nhật Stats** (`js/tong-hop.js`)

Hàm `updateStats()` giờ là **async** và tự gọi API:

```javascript
async function updateStats() {
    // Lấy tất cả bài viết để tính thống kê
    const response = await apiRequest(`/seo/articles?limit=1000&offset=0`);
    
    const articles = response.articles;
    const publishedCount = articles.filter(a => a.published_at).length;
    const draftCount = articles.filter(a => !a.published_at).length;
    
    // Cập nhật UI
    statNumber.textContent = `${articles.length} bài`;
    subStat.textContent = `${draftCount} nháp · ${publishedCount} đã xuất bản`;
}
```

---

## So sánh hiệu năng

| Tính năng | Trước | Sau |
|-----------|-------|-----|
| **Load trang đầu** | Load 1000 bài | Load 10 bài |
| **Chuyển trang** | Cắt mảng (nhanh nhưng đã load hết) | Gọi API (chỉ load cần thiết) |
| **Refresh dữ liệu** | Phải F5 (reload toàn bộ) | Click nút (chỉ reload data) |
| **Băng thông** | Cao (load tất cả) | Thấp (load từng phần) |
| **Trải nghiệm** | Chậm khi nhiều data | Nhanh, mượt mà |

---

## Cách sử dụng

### 1. **Xem trang đầu tiên**
- Trang tự động load 10 bài viết đầu tiên
- Hiển thị loading animation trong khi tải

### 2. **Chuyển trang**
- Click số trang hoặc nút ‹ › 
- Tự động gọi API lấy 10 bài viết của trang đó
- Không reload toàn bộ trang

### 3. **Làm mới dữ liệu**
- Click nút "Làm mới" 
- Cập nhật thống kê + dữ liệu trang hiện tại
- Không cần F5

---

## Các file đã thay đổi

1. ✅ `js/tong-hop.js` - Logic chính
2. ✅ `tong-hop.php` - Thêm nút Refresh
3. ✅ `css/tong-hop.css` - Style cho nút + animation

---

## Lưu ý kỹ thuật

### API Response cần có:
```json
{
    "success": true,
    "articles": [...],
    "total": 150  // Tổng số bài viết (để tính pagination)
}
```

### Nếu API không trả về `total`:
Code sẽ fallback về `response.articles.length` nhưng pagination có thể không chính xác.

---

## Kết luận

✅ **Không còn reload trang** khi chuyển trang  
✅ **Chỉ load dữ liệu cần thiết** (10 bài/lần)  
✅ **Có nút Refresh** để cập nhật mà không F5  
✅ **Loading state** để UX tốt hơn  
✅ **Smooth animations** cho mọi thao tác  

**Kết quả**: Trang nhanh hơn, mượt mà hơn, tiết kiệm băng thông! 🚀
