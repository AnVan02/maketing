<?php include 'db.php'; ?>
<!DOCTYPE html>
<html lang="vi">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Intel Core Ultra - Kỷ Nguyên AI Mới</title>
    <link rel="stylesheet" href="style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
</head>

<body>

    <!-- Nav Bar -->
    <nav class="navbar">
        <div class="logo">VNT TECH</div>
        <div class="menu">
            <a href="#">Sản phẩm</a> <a href="#">Giải pháp</a> <a href="#">Hỗ trợ</a>
        </div>
        <button class="btn-login">Đăng nhập / Liên hệ</button>
    </nav>

    <!-- Hero Section -->
    <header class="hero">
        <div class="hero-content">
            <span class="tag">THẾ HỆ MỚI NHẤT</span>
            <h1>Intel Core Ultra:<br>Kỷ Nguyên AI Mới</h1>
            <p>Đột phá với hiệu năng AI tích hợp, thời lượng pin tối ưu và đồ họa mạnh mẽ.</p>
            <div class="btns">
                <button class="btn-primary">Tìm hiểu thêm</button>
                <button class="btn-outline">Trải nghiệm</button>
            </div>
        </div>
        <div class="hero-img">
            <img src="https://www.intel.com/content/dam/www/central-libraries/us/en/images/2023-09/core-ultra-badge-transparent.png" alt="Chip">
        </div>
    </header>

    <!-- Sản phẩm chủ lực -->
    <section class="products">
        <h2>Sản phẩm Chủ lực</h2>
        <div class="product-grid">
            <div class="p-card">
                <h3>Intel Core™ Ultra</h3>
                <p>Hiệu năng AI đột phá cho laptop thế hệ mới.</p>
            </div>
            <div class="p-card">
                <h3>Intel® Xeon®</h3>
                <p>Sức mạnh xử lý cho trung tâm dữ liệu hiện đại.</p>
            </div>
            <div class="p-card">
                <h3>Intel® Core™ i Series</h3>
                <p>Hiệu năng tin cậy cho mọi nhu cầu sử dụng.</p>
            </div>
        </div>
    </section>

    <!-- TIN TỨC MỚI NHẤT (PHẦN KẾT NỐI SQL) -->
    <section class="news-section">
        <div class="section-header">
            <h2>Tin tức mới nhất</h2>
            <a href="#">Xem tất cả ></a>
        </div>

        <div class="news-container">
            <?php
            // Lấy bài viết nổi bật
            $featured = $conn->query("SELECT * FROM news WHERE is_featured = 1 LIMIT 1")->fetch_assoc();
            ?>
            <div class="news-big" style="background-image: linear-gradient(transparent, rgba(0,0,0,0.9)), url('<?php echo $featured['image_url']; ?>')">
                <span class="category-tag"><?php echo $featured['category']; ?></span>
                <div class="news-info">
                    <h3><?php echo $featured['title']; ?></h3>
                    <p><?php echo $featured['summary']; ?></p>
                    <small><?php echo date('d/m/Y', strtotime($featured['created_at'])); ?></small>
                </div>
            </div>

            <div class="news-list">
                <?php
                // Lấy 3 bài viết nhỏ
                $others = $conn->query("SELECT * FROM news WHERE is_featured = 0 LIMIT 3");
                while ($row = $others->fetch_assoc()):
                ?>
                    <div class="news-item">
                        <img src="<?php echo $row['image_url']; ?>" alt="news">
                        <div class="news-item-text">
                            <span class="category-small"><?php echo $row['category']; ?></span>
                            <h4><?php echo $row['title']; ?></h4>
                            <small><?php echo date('d/m/Y', strtotime($row['created_at'])); ?></small>
                        </div>
                    </div>
                <?php endwhile; ?>
            </div>
        </div>
    </section>

    <!-- Footer Banner -->
    <footer class="footer-banner">
        <div class="banner-box">
            <h2>Lợi ích đối tác chiến lược</h2>
            <p>Tham gia mạng lưới đối tác toàn cầu của chúng tôi.</p>
            <button class="btn-primary">Hợp tác ngay</button>
        </div>
    </footer>
    <style>
        :root {
            --bg-dark: #01050a;
            --intel-blue: #0071c5;
            --card-bg: #0b111a;
        }

        body {
            margin: 0;
            padding: 0;
            font-family:sans-serif;
            background-color: var(--bg-dark);
            color: white;
        }

        .navbar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px 8%;
            background: rgba(1, 5, 10, 0.8);
            position: sticky;
            top: 0;
            z-index: 1000;
        }

        .hero {
            display: flex;
            align-items: center;
            padding: 100px 8%;
            background: radial-gradient(circle at top right, #002d5a, var(--bg-dark));
        }

        .hero-content h1 {
            font-size: 3.5rem;
            line-height: 1.2;
        }

        /* News Section Grid */
        .news-section {
            padding: 80px 8%;
        }

        .section-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
        }

        .news-container {
            display: grid;
            grid-template-columns: 1.5fr 1fr;
            gap: 25px;
        }

        .news-big {
            height: 500px;
            border-radius: 20px;
            background-size: cover;
            background-position: center;
            position: relative;
            padding: 40px;
            display: flex;
            flex-direction: column;
            justify-content: flex-end;
            transition: 0.3s;
        }

        .news-big:hover {
            transform: scale(1.02);
        }

        .news-list {
            display: flex;
            flex-direction: column;
            gap: 20px;
        }

        .news-item {
            display: flex;
            gap: 15px;
            background: var(--card-bg);
            padding: 15px;
            border-radius: 12px;
            transition: 0.3s;
        }

        .news-item img {
            width: 120px;
            height: 80px;
            border-radius: 8px;
            object-fit: cover;
        }

        .category-tag {
            background: var(--intel-blue);
            padding: 5px 12px;
            border-radius: 4px;
            font-size: 12px;
            width: fit-content;
        }

        .btn-primary {
            background: var(--intel-blue);
            border: none;
            color: white;
            padding: 12px 25px;
            border-radius: 5px;
            cursor: pointer;
        }

        /* Footer banner */
        .footer-banner {
            padding: 100px 8%;
            text-align: center;
        }

        .banner-box {
            background: linear-gradient(45deg, #001a33, #004a87);
            padding: 60px;
            border-radius: 25px;
        }
    </style>
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            // Hiệu ứng Fade In cho các card khi cuộn trang
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }
                });
            }, {
                threshold: 0.1
            });

            document.querySelectorAll('.news-item, .p-card').forEach(item => {
                item.style.opacity = '0';
                item.style.transform = 'translateY(20px)';
                item.style.transition = '0.6s ease-out';
                observer.observe(item);
            });
        });
    </script>
</body>

</html>