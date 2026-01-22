document.addEventListener('DOMContentLoaded', async () => {
    const tableBody = document.getElementById('postsTableBody');
    const loadingState = document.getElementById('loadingState');
    const emptyState = document.getElementById('noDataState');

    // ===== BIẾN PHÂN TRANG =====
    let currentPage = 1;
    let itemsPerPage = 10;
    let totalItems = 0;
    let allPosts = [];

    // ===== LOAD DỮ LIỆU =====
    async function loadPosts() {
        if (loadingState) loadingState.style.display = 'block';
        if (emptyState) emptyState.style.display = 'none';

        try {
            // ⚠️ ĐỔI API NẾU CẦN
            const res = await apiRequest('/wordpress/posts');
            allPosts = res.data || res.posts || res || [];

            totalItems = allPosts.length;

            if (totalItems === 0) {
                tableBody.innerHTML = '';
                if (emptyState) emptyState.style.display = 'block';
                renderPagination();
                return;
            }

            renderTable();
            renderPagination();
        } catch (err) {
            console.error('Lỗi load bài viết:', err);
        } finally {
            if (loadingState) loadingState.style.display = 'none';
        }
    }

    // ===== RENDER BẢNG THEO TRANG =====
    function renderTable() {
        tableBody.innerHTML = '';

        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const pagePosts = allPosts.slice(startIndex, endIndex);

        pagePosts.forEach((post, index) => {
            const tr = document.createElement('tr');

            const title = post.title || post.post_title || 'Không có tiêu đề';
            const status = post.status || 'draft';
            const date = post.date
                ? new Date(post.date).toLocaleDateString('vi-VN')
                : '-';

            tr.innerHTML = `
                <td style="text-align:center;">${startIndex + index + 1}</td>
                <td>${title}</td>
                <td>${status}</td>
                <td>${date}</td>
                <td>
                    ${post.image ? `<img src="${post.image}" style="width:60px;">` : '-'}
                </td>
                <td>
                    <a href="${post.link || '#'}" target="_blank" class="btn-use-sm">Xem</a>
                </td>
            `;
            tableBody.appendChild(tr);
        });
    }

    // ===== RENDER NÚT PHÂN TRANG =====
    function renderPagination() {
        const container = document.getElementById('paginationControls');
        container.innerHTML = '';

        const totalPages = Math.ceil(totalItems / itemsPerPage);
        if (totalPages <= 1) return;

        // Nút Trước
        const prev = document.createElement('button');
        prev.textContent = 'Trước';
        prev.disabled = currentPage === 1;
        prev.onclick = () => {
            currentPage--;
            renderTable();
            renderPagination();
        };
        container.appendChild(prev);

        // Nút số trang
        for (let i = 1; i <= totalPages; i++) {
            const btn = document.createElement('button');
            btn.textContent = i;
            btn.className = i === currentPage ? 'active' : '';
            btn.onclick = () => {
                currentPage = i;
                renderTable();
                renderPagination();
            };
            container.appendChild(btn);
        }

        // Nút Sau
        const next = document.createElement('button');
        next.textContent = 'Sau';
        next.disabled = currentPage === totalPages;
        next.onclick = () => {
            currentPage++;
            renderTable();
            renderPagination();
        };
        container.appendChild(next);
    }

    // ===== LOAD LẦN ĐẦU =====
    await loadPosts();

    // Làm mới
    window.refreshPostsTable = async () => {
        currentPage = 1;
        await loadPosts();
    };
});

document.getElementById('wpCard').addEventListener('click', () => {
    window.location.href = 'wordpress.php';
});

document.getElementById('analyticsCard').addEventListener('click', () =>{
    window.location.href ="analytics.php";
});
