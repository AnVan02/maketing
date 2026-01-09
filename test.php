<!DOCTYPE html>
<html lang="vi">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AIS - Landing Page</title>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700;800;900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        :root {
            --dark-blue: #061a35;
            --bright-blue: #007bff;
            --text-gray: #666;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Montserrat', sans-serif;
            background: #fff;
            color: #333;
            line-height: 1.6;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 20px;
        }

        /* HEADER */
        header {
            padding: 25px 0;
            position: absolute;
            width: 100%;
            z-index: 10;
        }

        .nav-wrap {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .logo {
            color: white;
            font-weight: 900;
            font-size: 24px;
        }

        nav a {
            color: rgba(255, 255, 255, 0.8);
            text-decoration: none;
            margin-left: 30px;
            font-size: 14px;
            font-weight: 600;
        }

        /* HERO SECTION */
        .hero {
            background: linear-gradient(135deg, #0b2545 0%, #13315c 100%);
            padding: 150px 0 100px;
            border-bottom-left-radius: 150px;
            color: white;
            position: relative;
            overflow: hidden;
        }

        .hero-flex {
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .hero-content {
            flex: 1;
            z-index: 2;
        }

        .hero h1 {
            font-size: 48px;
            font-weight: 800;
            line-height: 1.2;
            margin-bottom: 20px;
        }

        .search-box {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            padding: 5px 5px 5px 20px;
            border-radius: 50px;
            display: flex;
            max-width: 500px;
            margin-bottom: 20px;
        }

        .search-box input {
            background: none;
            border: none;
            color: white;
            flex: 1;
            outline: none;
        }

        .search-box button {
            background: var(--bright-blue);
            color: white;
            border: none;
            padding: 10px 25px;
            border-radius: 50px;
            cursor: pointer;
            font-weight: 600;
        }

        .tags {
            display: flex;
            gap: 10px;
            margin-bottom: 40px;
        }

        .tag {
            background: rgba(255, 255, 255, 0.1);
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 12px;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .hero-stats {
            display: flex;
            gap: 40px;
            margin-top: 50px;
        }

        .stat-item strong {
            font-size: 30px;
            display: block;
        }

        .stat-item span {
            font-size: 12px;
            opacity: 0.7;
        }

        /* CỤM ẢNH HERO (PHẢI) */
        .hero-images {
            flex: 1;
            position: relative;
            height: 450px;
        }

        .ais-watermark {
            position: absolute;
            right: -50px;
            top: 0;
            font-size: 200px;
            font-weight: 900;
            color: transparent;
            -webkit-text-stroke: 1px rgba(255, 255, 255, 0.1);
            z-index: 0;
        }

        .img-card {
            position: absolute;
            border-radius: 15px;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
        }

        .img-1 {
            width: 180px;
            height: 250px;
            left: 0;
            top: 100px;
            z-index: 2;
        }

        .img-2 {
            width: 250px;
            height: 350px;
            left: 140px;
            top: 0;
            z-index: 3;
        }

        .img-3 {
            width: 200px;
            height: 150px;
            left: 350px;
            top: 150px;
            z-index: 1;
        }

        .img-card img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        /* PARTNERS */
        .partners {
            padding: 60px 0;
            text-align: center;
        }

        .partners p {
            color: var(--bright-blue);
            font-weight: 700;
            font-size: 12px;
            text-transform: uppercase;
            margin-bottom: 30px;
        }

        .partner-logos {
            display: flex;
            justify-content: center;
            gap: 50px;
            align-items: center;
            opacity: 0.5;
            filter: grayscale(1);
        }

        .partner-logos img {
            height: 30px;
        }

        /* SECTION PROPERNESS */
        .properness {
            padding: 100px 0;
            text-align: center;
            position: relative;
        }

        .bg-text-large {
            font-size: 120px;
            font-weight: 900;
            color: #f0f4f8;
            position: absolute;
            width: 100%;
            top: 50px;
            z-index: -1;
        }

        .properness h2 {
            font-size: 24px;
            color: var(--dark-blue);
            margin-bottom: 60px;
        }

        .timeline {
            position: relative;
            max-width: 800px;
            margin: 0 auto;
        }

        .timeline::before {
            content: '';
            position: absolute;
            left: 50%;
            width: 1px;
            background: #eee;
            height: 100%;
            top: 0;
        }

        .step {
            margin-bottom: 80px;
            position: relative;
            z-index: 2;
            background: white;
            padding: 20px;
            display: inline-block;
            width: 100%;
        }

        .step-num {
            font-size: 40px;
            font-weight: 800;
            color: #333;
            display: block;
            margin-bottom: 10px;
        }

        .step h3 {
            font-size: 20px;
            margin-bottom: 10px;
        }

        .step p {
            font-size: 14px;
            color: var(--text-gray);
            max-width: 400px;
            margin: 0 auto;
        }

        /* FEATURES GRID */
        .grid-features {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 20px;
            margin-bottom: 80px;
        }

        .feat-card {
            border-radius: 20px;
            overflow: hidden;
            background: #fff;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
            position: relative;
            height: 350px;
        }

        .feat-left {
            background: linear-gradient(to right, white 50%, transparent), url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800');
            background-size: cover;
            padding: 50px;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }

        .feat-left h3 {
            font-size: 24px;
            color: var(--dark-blue);
            max-width: 300px;
            margin-bottom: 20px;
        }

        .btn-round {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: #eef5ff;
            color: var(--bright-blue);
            display: flex;
            align-items: center;
            justify-content: center;
            text-decoration: none;
        }

        .feat-right {
            padding: 30px;
            display: flex;
            flex-direction: column;
        }

        .feat-right img {
            width: 100%;
            border-radius: 10px;
            margin-top: auto;
        }

        /* FAQ */
        .faq {
            padding: 80px 0;
            text-align: center;
        }

        .faq h2 {
            margin-bottom: 40px;
            color: var(--dark-blue);
        }

        .faq-item {
            max-width: 800px;
            margin: 0 auto 15px;
            background: #fff;
            border: 1px solid #eee;
            padding: 20px 30px;
            border-radius: 12px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            cursor: pointer;
            transition: 0.3s;
        }

        .faq-item:hover {
            border-color: var(--bright-blue);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
        }

        .faq-item i {
            color: #87ceeb;
        }

        @media (max-width: 992px) {
            .hero-flex {
                flex-direction: column;
                text-align: center;
            }

            .search-box {
                margin: 0 auto 20px;
            }

            .tags {
                justify-content: center;
            }

            .hero-images {
                display: none;
            }

            .grid-features {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>

<body>

    <header>
        <div class="container nav-wrap">
            <div class="logo">AIS</div>
            <nav>
                <a href="#">Giới thiệu</a>
                <a href="#">Dịch vụ</a>
                <a href="#">Bảng giá</a>
                <a href="#">Liên hệ</a>
            </nav>
        </div>
    </header>

    <section class="hero">
        <div class="container hero-flex">
            <div class="hero-content">
                <h1>Định chuẩn mới cho<br>sáng tạo nội dung</h1>
                <div class="search-box">
                    <input type="text" placeholder="Nhập từ khóa hoặc yêu cầu của bạn...">
                    <button>Gửi đi <i class="fa-solid fa-paper-plane"></i></button>
                </div>
                <div class="tags">
                    <span class="tag">Theo bài viết</span>
                    <span class="tag">Tạo tin</span>
                    <span class="tag">Tối ưu SEO</span>
                </div>
                <div class="hero-stats">
                    <div class="stat-item">
                        <strong>150%</strong>
                        <span>Hiệu suất</span>
                    </div>
                    <div class="stat-item">
                        <strong>85%</strong>
                        <span>Hiệu quả</span>
                    </div>
                </div>
            </div>

            <div class="hero-images">
                <div class="ais-watermark">AIS</div>
                <div class="img-card img-1">
                    <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400" alt="">
                </div>
                <div class="img-card img-2">
                    <img src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=400" alt="">
                </div>
                <div class="img-card img-3">
                    <img src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=400" alt="">
                </div>
            </div>
        </div>
    </section>

    <section class="partners container">
        <p>Khách hàng của chúng tôi</p>
        <div class="partner-logos">
            <img src="https://upload.wikimedia.org/wikipedia/vi/thumb/d/d4/Vinamilk_logo_2023.svg/1200px-Vinamilk_logo_2023.svg.png" alt="">
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/7-eleven_logo.svg/1200px-7-eleven_logo.svg.png" alt="">
            <img src="https://upload.wikimedia.org/wikipedia/vi/thumb/9/94/Vingroup_logo.svg/1200px-Vingroup_logo.svg.png" alt="">
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/BIDV_Logo.svg/1200px-BIDV_Logo.svg.png" alt="">
        </div>
    </section>

    <section class="properness">
        <div class="bg-text-large">PROPERNESS</div>
        <div class="container">
            <h2>Nâng tầm chuẩn mực</h2>
            <div class="timeline">
                <div class="step">
                    <span class="step-num">1</span>
                    <h3>Nhập yêu cầu</h3>
                    <p>Người dùng nhập yêu cầu mong muốn (vấn đề, chủ đề, hoặc từ khóa) vào hệ thống của chúng tôi.</p>
                </div>
                <div class="step">
                    <span class="step-num">2</span>
                    <h3>AIS phân tích & viết</h3>
                    <p>AIS phân tích dữ liệu, nghiên cứu hành vi và thị trường để viết nội dung chuẩn SEO và chuyên sâu.</p>
                </div>
                <div class="step">
                    <span class="step-num">3</span>
                    <h3>Chỉnh sửa & tối ưu</h3>
                    <p>Đội ngũ chuyên gia kiểm tra, tinh chỉnh nội dung để đảm bảo tính xác thực và tự nhiên nhất.</p>
                </div>
            </div>
        </div>
    </section>

    <section class="container grid-features">
        <div class="feat-card feat-left">
            <h3>Khai mở tiềm năng và nâng tầm chiến lược với Marketing thông minh</h3>
            <a href="#" class="btn-round"><i class="fa-solid fa-arrow-right"></i></a>
        </div>
        <div class="feat-card feat-right">
            <h3>SEO All-In-One</h3>
            <p style="font-size: 13px; color: #666; margin: 10px 0;">Nền tảng tự động hóa toàn diện cho marketer chuyên nghiệp.</p>
            <img src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=400" alt="">
        </div>
    </section>

    <section class="faq container">
        <h2>Câu hỏi thường gặp</h2>
        <div class="faq-item"><span>Nền tảng AIS là gì?</span> <i class="fa-solid fa-arrow-right"></i></div>
        <div class="faq-item"><span>Nội dung của AIS tạo ra có vượt được AI check không?</span> <i class="fa-solid fa-arrow-right"></i></div>
        <div class="faq-item"><span>Bảng giá AIS như thế nào?</span> <i class="fa-solid fa-arrow-right"></i></div>
        <div class="faq-item"><span>AIS có cam kết hiệu quả đầu ra không?</span> <i class="fa-solid fa-arrow-right"></i></div>
    </section>

    <footer style="background:#061a35; height: 100px; margin-top: 50px;"></footer>

</body>

</html>