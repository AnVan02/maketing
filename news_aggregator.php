<?php
class NewsAggregatorClient {
    private $base_url;
    private $api_base;
    
    public function __construct($base_url = "https://caiman-warm-swan.ngrok-free.app") {
        $this->base_url = rtrim($base_url, '/');
        $this->api_base = $this->base_url . "/api/v1";
    }
    
    private function makeRequest($endpoint, $payload) {
        $url = $this->api_base . $endpoint;
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'Accept: application/json'
        ]);
        curl_setopt($ch, CURLOPT_TIMEOUT, 60);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
        
        $response = curl_exec($ch);
        $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        curl_close($ch);
        if ($http_code !== 200) {
            throw new Exception("HTTP Error: " . $http_code . " - " . $error);
        }
        $result = json_decode($response, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception("JSON decode error: " . json_last_error_msg());
        }
        return $result;
    }
    
    public function runFullPipeline($query, $max_search_results = 5, $top_k_news = 3, $content_config = []) {
        $payload = [
            "query" => $query,
            "max_search_results" => $max_search_results,
            "top_k_news" => $top_k_news,
            "target_language" => "vi"
        ];
        
        // Thêm config nếu có
        if (!empty($content_config)) {
            $payload["content_config"] = $content_config;
        }
        
        return $this->makeRequest("/pipeline", $payload);
    }
    
    public function updatePromptConfig($config) {
        return $this->makeRequest("/content/update-prompt", $config);
    }
    
    public function getCurrentConfig() {
        $url = $this->api_base . "/content/current-config";
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Accept: application/json'
        ]);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
        
        $response = curl_exec($ch);
        $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($http_code !== 200) {
            throw new Exception("HTTP Error: " . $http_code);
        }
        
        return json_decode($response, true);
    }
}

class SEOArticleToHTML {
    private $styles;
    
    public function __construct() {
        $this->styles = $this->getStyles();
    }
    
    private function getStyles() {
        return '
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.7;
                color: #2d3748;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                padding: 40px 20px;
            }
            
            .article-container {
                max-width: 900px;
                margin: 0 auto;
                background: white;
                border-radius: 20px;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
                overflow: hidden;
                animation: fadeInUp 0.8s ease-out;
            }
            
            @keyframes fadeInUp {
                from {
                    opacity: 0;
                    transform: translateY(30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            .article-header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 50px 40px;
                text-align: center;
            }
            
            .article-title {
                font-size: 2.8rem;
                font-weight: 800;
                margin-bottom: 20px;
                line-height: 1.2;
                text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
            }
            
            .article-meta {
                display: flex;
                justify-content: center;
                gap: 30px;
                flex-wrap: wrap;
                margin-top: 25px;
                opacity: 0.9;
            }
            
            .meta-item {
                background: rgba(255, 255, 255, 0.2);
                padding: 8px 16px;
                border-radius: 20px;
                backdrop-filter: blur(10px);
            }
            
            .article-content {
                padding: 50px 40px;
            }
            
            .content-section {
                margin-bottom: 40px;
            }
            
            h1 {
                color: #2d3748;
                font-size: 2.2rem;
                margin: 30px 0 20px 0;
                border-left: 5px solid #667eea;
                padding-left: 15px;
            }
            
            h2 {
                color: #4a5568;
                font-size: 1.8rem;
                margin: 25px 0 15px 0;
                border-left: 4px solid #764ba2;
                padding-left: 12px;
            }
            
            h3 {
                color: #718096;
                font-size: 1.4rem;
                margin: 20px 0 12px 0;
            }
            
            p {
                margin-bottom: 20px;
                font-size: 1.1rem;
                text-align: justify;
            }
            
            .keyword-badge {
                display: inline-block;
                background: #edf2f7;
                color: #4a5568;
                padding: 6px 12px;
                border-radius: 15px;
                margin: 5px;
                font-size: 0.9rem;
                border: 1px solid #e2e8f0;
            }
            
            .image-container {
                margin: 30px 0;
                text-align: center;
            }
            
            .article-image {
                max-width: 100%;
                height: auto;
                border-radius: 12px;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
                transition: transform 0.3s ease;
            }
            
            .article-image:hover {
                transform: scale(1.02);
            }
            
            .image-caption {
                margin-top: 10px;
                font-style: italic;
                color: #718096;
                font-size: 0.95rem;
            }
            
            ul, ol {
                margin: 20px 0;
                padding-left: 30px;
            }
            
            li {
                margin-bottom: 10px;
                font-size: 1.1rem;
            }
            
            blockquote {
                background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                color: white;
                padding: 25px;
                border-radius: 12px;
                margin: 25px 0;
                font-style: italic;
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
            }
            
            .references-section {
                background: #f7fafc;
                padding: 30px;
                border-radius: 12px;
                margin-top: 40px;
                border-left: 4px solid #667eea;
            }
            
            .references-title {
                color: #2d3748;
                font-size: 1.4rem;
                margin-bottom: 20px;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .reference-item {
                margin-bottom: 12px;
                padding: 12px;
                background: white;
                border-radius: 8px;
                border-left: 3px solid #764ba2;
                transition: transform 0.2s ease;
            }
            
            .reference-item:hover {
                transform: translateX(5px);
            }
            
            .reference-link {
                color: #667eea;
                text-decoration: none;
                font-weight: 500;
            }
            
            .reference-link:hover {
                text-decoration: underline;
            }
            
            .content-highlight {
                background: linear-gradient(120deg, #a8edea 0%, #fed6e3 100%);
                padding: 25px;
                border-radius: 12px;
                margin: 25px 0;
                border-left: 4px solid #667eea;
            }
            
            .publish-info {
                text-align: center;
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #e2e8f0;
                color: #718096;
                font-size: 0.9rem;
            }
            
            @media (max-width: 768px) {
                body {
                    padding: 20px 10px;
                }
                
                .article-title {
                    font-size: 2rem;
                }
                
                .article-content {
                    padding: 30px 20px;
                }
                
                .article-header {
                    padding: 30px 20px;
                }
            }
        </style>
        ';
    }
    
    public function markdownToHtml($markdown_text) {
        if (empty($markdown_text)) {
            return "";
        }
        
        $html_text = $markdown_text;
        
        // Xử lý code blocks
        $html_text = preg_replace('/```(.*?)```/s', '<div class="content-highlight">$1</div>', $html_text);
        
        // Tiêu đề
        $html_text = preg_replace('/^# (.*?)$/m', '<h1>$1</h1>', $html_text);
        $html_text = preg_replace('/^## (.*?)$/m', '<h2>$1</h2>', $html_text);
        $html_text = preg_replace('/^### (.*?)$/m', '<h3>$1</h3>', $html_text);
        
        // In đậm và in nghiêng
        $html_text = preg_replace('/\*\*(.*?)\*\*/', '<strong>$1</strong>', $html_text);
        $html_text = preg_replace('/\*(.*?)\*/', '<em>$1</em>', $html_text);
        
        // Blockquote
        $html_text = preg_replace('/^> (.*?)$/m', '<blockquote>$1</blockquote>', $html_text);
        
        // Hình ảnh
        $html_text = preg_replace(
            '/!\[(.*?)\]\((.*?)\)/', 
            '<div class="image-container"><img src="$2" alt="$1" class="article-image"><div class="image-caption">$1</div></div>', 
            $html_text
        );
        
        // Xử lý danh sách
        $lines = explode("\n", $html_text);
        $in_list = false;
        $result_lines = [];
        
        foreach ($lines as $line) {
            if (preg_match('/^- /', $line)) {
                $content = preg_replace('/^- /', '', $line);
                if (!$in_list) {
                    $result_lines[] = '<ul>';
                    $in_list = true;
                }
                $result_lines[] = '<li>' . $content . '</li>';
            } else {
                if ($in_list) {
                    $result_lines[] = '</ul>';
                    $in_list = false;
                }
                $result_lines[] = $line;
            }
        }
        
        if ($in_list) {
            $result_lines[] = '</ul>';
        }
        
        $html_text = implode("\n", $result_lines);
        
        return $html_text;
    }
    
    public function generateReferencesHtml($references) {
        if (empty($references)) {
            return '<p>Không có nguồn tham khảo</p>';
        }
        
        $ref_html = ['<div class="references-section">'];
        $ref_html[] = '<div class="references-title">📚 Nguồn Tham Khảo</div>';
        
        $i = 1;
        foreach ($references as $ref) {
            $title = htmlspecialchars($ref['title'] ?? "Bài tham khảo $i");
            $url = $ref['url'] ?? '#';
            $ref_html[] = "
                <div class=\"reference-item\">
                    <a href=\"$url\" target=\"_blank\" class=\"reference-link\">
                        $i. $title
                    </a>
                </div>
            ";
            $i++;
        }
        
        $ref_html[] = '</div>';
        return implode("\n", $ref_html);
    }
    
    public function generateKeywordsHtml($keywords) {
        if (empty($keywords)) {
            return '';
        }
        
        $keywords_html = ['<div style="margin: 20px 0;">'];
        foreach ($keywords as $keyword) {
            $keywords_html[] = '<span class="keyword-badge">#' . htmlspecialchars($keyword) . '</span>';
        }
        $keywords_html[] = '</div>';
        
        return implode("\n", $keywords_html);
    }
    
    public function convertToHtml($article_data) {
        $title = htmlspecialchars($article_data['title'] ?? 'Bài viết SEO');
        $meta_description = htmlspecialchars($article_data['meta_description'] ?? '');
        $content_markdown = $article_data['content'] ?? '';
        $keywords = $article_data['keywords'] ?? [];
        $references = $article_data['references'] ?? [];
        
        // Chuyển đổi markdown sang HTML
        $content_html = $this->markdownToHtml($content_markdown);
        
        // Tạo HTML hoàn chỉnh
        $html_output = "
<!DOCTYPE html>
<html lang=\"vi\">
<head>
    <meta charset=\"UTF-8\">
    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">
    <meta name=\"description\" content=\"$meta_description\">
    <title>$title</title>
    {$this->styles}
</head>
<body>
    <div class=\"article-container\">
        <header class=\"article-header\">
            <h1 class=\"article-title\">$title</h1>
            <div class=\"article-meta\">
                <div class=\"meta-item\">📖 " . str_word_count(strip_tags($content_html)) . " từ</div>
                <div class=\"meta-item\">🔑 " . count($keywords) . " từ khóa</div>
                <div class=\"meta-item\">📚 " . count($references) . " nguồn</div>
            </div>
        </header>
        
        <main class=\"article-content\">
            <div class=\"content-section\">
                <div class=\"content-highlight\">
                    <strong>📄 Mô tả:</strong> $meta_description
                </div>
                
                {$this->generateKeywordsHtml($keywords)}
            </div>
            
            <div class=\"content-section\">
                $content_html
            </div>
            
            {$this->generateReferencesHtml($references)}
            
            <div class=\"publish-info\">
                Được tạo tự động • " . date('d/m/Y H:i') . "
            </div>
        </main>
    </div>
</body>
</html>
";
        return $html_output;
    }
}

// Xử lý form
$query = $_POST['query'] ?? '';
$article_length = $_POST['article_length'] ?? '800-1200';
$tone = $_POST['tone'] ?? 'chuyên nghiệp';
$article_type = $_POST['article_type'] ?? 'blog';
$language = $_POST['language'] ?? 'vi';
$custom_instructions = $_POST['custom_instructions'] ?? '';

$result_html = '';
$error = '';
$processing = false;
$current_config = [];

// Lấy config hiện tại
try {
    $client = new NewsAggregatorClient("https://caiman-warm-swan.ngrok-free.app");
    $current_config = $client->getCurrentConfig();
} catch (Exception $e) {
    // Không hiển thị lỗi nếu không lấy được config
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && !empty($query)) {
    $processing = true;
    
    try {
        $client = new NewsAggregatorClient("https://caiman-warm-swan.ngrok-free.app");
        
        // Tạo config từ form
        $content_config = [
            "article_length" => $article_length,
            "tone" => $tone,
            "article_type" => $article_type,
            "language" => $language
        ];
        
        // Thêm custom instructions nếu có
        if (!empty($custom_instructions)) {
            $content_config["custom_instructions"] = $custom_instructions;
        }
        
        // Sử dụng Pipeline với config
        $pipeline_results = $client->runFullPipeline($query, 5, 3, $content_config);
        
        if (!$pipeline_results['success']) {
            throw new Exception("Pipeline failed: " . ($pipeline_results['error'] ?? 'Unknown error'));
        }
        
        if (!$pipeline_results['generated_content']['success']) {
            throw new Exception("Content generation failed: " . ($pipeline_results['generated_content']['message'] ?? 'Unknown error'));
        }
        
        $article = $pipeline_results['generated_content']['article'];
        
        // Convert to HTML và hiển thị
        $converter = new SEOArticleToHTML();
        $result_html = $converter->convertToHtml($article);
        
    } catch (Exception $e) {
        $error = $e->getMessage();
    }
    
    $processing = false;
}
?>

<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>News Aggregator - Tạo Bài Viết SEO</title>
    <style>
        .container {
            max-width: 1000px;
            margin: 0 auto;
            padding: 20px;
            font-family: Arial, sans-serif;
        }
        
        .form-section {
            background: #f8f9fa;
            padding: 30px;
            border-radius: 10px;
            margin-bottom: 30px;
            border: 1px solid #e9ecef;
        }
        
        .form-group {
            margin-bottom: 20px;
        }
        
        label {
            display: block;
            margin-bottom: 8px;
            font-weight: bold;
            color: #495057;
        }
        
        input[type="text"], select, textarea {
            width: 100%;
            padding: 12px;
            border: 2px solid #dee2e6;
            border-radius: 8px;
            font-size: 16px;
            transition: border-color 0.3s;
            background: white;
        }
        
        input[type="text"]:focus, select:focus, textarea:focus {
            outline: none;
            border-color: #007bff;
            box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
        }
        
        textarea {
            resize: vertical;
            min-height: 80px;
        }
        
        .config-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-bottom: 20px;
        }
        
        .config-item {
            display: flex;
            flex-direction: column;
        }
        
        button {
            background: #007bff;
            color: white;
            padding: 15px 30px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            font-weight: bold;
            transition: background 0.3s;
            width: 100%;
            margin-top: 10px;
        }
        
        button:hover {
            background: #0056b3;
        }
        
        button:disabled {
            background: #6c757d;
            cursor: not-allowed;
        }
        
        .error {
            background: #f8d7da;
            color: #721c24;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            border: 1px solid #f5c6cb;
        }
        
        .success {
            background: #d1ecf1;
            color: #0c5460;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            border: 1px solid #bee5eb;
        }
        
        .processing {
            background: #fff3cd;
            color: #856404;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            border: 1px solid #ffeaa7;
            text-align: center;
        }
        
        .loading {
            display: inline-block;
            width: 20px;
            height: 20px;
            border: 3px solid #f3f3f3;
            border-top: 3px solid #007bff;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-right: 10px;
        }
        
        .config-section {
            background: #e7f3ff;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            border-left: 4px solid #007bff;
        }
        
        .config-title {
            font-size: 1.2em;
            font-weight: bold;
            margin-bottom: 15px;
            color: #0056b3;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        @media (max-width: 768px) {
            .config-grid {
                grid-template-columns: 1fr;
            }
            
            .container {
                padding: 10px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1 style="text-align: center; color: #333; margin-bottom: 30px;">🚀 News Aggregator - Tạo Bài Viết SEO Tùy Chỉnh</h1>
        
        <div class="form-section">
            <form method="POST" id="articleForm">
                <div class="form-group">
                    <label for="query">📝 Nhập từ khóa để tạo bài viết:</label>
                    <input type="text" id="query" name="query" value="<?php echo htmlspecialchars($query); ?>" 
                           placeholder="Ví dụ: công nghệ AI 2024, xu hướng thời trang, du lịch Việt Nam..." required>
                </div>
                
                <div class="config-section">
                    <div class="config-title">⚙️ Cấu hình bài viết</div>
                    
                    <div class="config-grid">
                        <div class="config-item">
                            <label for="article_length">📏 Độ dài bài viết:</label>
                            <select id="article_length" name="article_length">
                                <option value="300-500" <?php echo $article_length === '300-500' ? 'selected' : ''; ?>>Ngắn (300-500 từ)</option>
                                <option value="500-800" <?php echo $article_length === '500-800' ? 'selected' : ''; ?>>Trung bình (500-800 từ)</option>
                                <option value="800-1200" <?php echo $article_length === '800-1200' ? 'selected' : ''; ?>>Chi tiết (800-1200 từ)</option>
                                <option value="1200-2000" <?php echo $article_length === '1200-2000' ? 'selected' : ''; ?>>Rất chi tiết (1200-2000 từ)</option>
                            </select>
                        </div>
                        
                        <div class="config-item">
                            <label for="tone">🎭 Tone giọng:</label>
                            <select id="tone" name="tone">
                                <option value="chuyên nghiệp" <?php echo $tone === 'chuyên nghiệp' ? 'selected' : ''; ?>>Chuyên nghiệp</option>
                                <option value="thân thiện" <?php echo $tone === 'thân thiện' ? 'selected' : ''; ?>>Thân thiện</option>
                                <option value="trang trọng" <?php echo $tone === 'trang trọng' ? 'selected' : ''; ?>>Trang trọng</option>
                                <option value="sáng tạo" <?php echo $tone === 'sáng tạo' ? 'selected' : ''; ?>>Sáng tạo</option>
                                <option value="thuyết phục" <?php echo $tone === 'thuyết phục' ? 'selected' : ''; ?>>Thuyết phục</option>
                            </select>
                        </div>
                        
                        <div class="config-item">
                            <label for="article_type">📄 Loại bài viết:</label>
                            <select id="article_type" name="article_type">
                                <option value="blog" <?php echo $article_type === 'blog' ? 'selected' : ''; ?>>📝 Blog SEO</option>
                                <option value="news" <?php echo $article_type === 'news' ? 'selected' : ''; ?>>📰 Tin tức</option>
                                <option value="review" <?php echo $article_type === 'review' ? 'selected' : ''; ?>>⭐ Đánh giá</option>
                                <option value="guide" <?php echo $article_type === 'guide' ? 'selected' : ''; ?>>📚 Hướng dẫn</option>
                                <option value="product" <?php echo $article_type === 'product' ? 'selected' : ''; ?>>🛍️ Giới thiệu sản phẩm</option>
                                <option value="landing" <?php echo $article_type === 'landing' ? 'selected' : ''; ?>>🎯 Landing Page</option>
                                <option value="toplist" <?php echo $article_type === 'toplist' ? 'selected' : ''; ?>>🏆 Top List/So sánh</option>
                            </select>
                        </div>
                        
                        <div class="config-item">
                            <label for="language">🌐 Ngôn ngữ:</label>
                            <select id="language" name="language">
                                <option value="vi" <?php echo $language === 'vi' ? 'selected' : ''; ?>>Tiếng Việt</option>
                                <option value="en" <?php echo $language === 'en' ? 'selected' : ''; ?>>English</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="custom_instructions">💡 Hướng dẫn tùy chỉnh (không bắt buộc):</label>
                        <textarea id="custom_instructions" name="custom_instructions" 
                                  placeholder="Ví dụ: Tập trung vào lợi ích cho người dùng, sử dụng ví dụ thực tế, tránh thuật ngữ kỹ thuật..."><?php echo htmlspecialchars($custom_instructions); ?></textarea>
                    </div>
                </div>
                
                <button type="submit" id="submitBtn" <?php echo $processing ? 'disabled' : ''; ?>>
                    <?php if ($processing): ?>
                        <div class="loading"></div>Đang xử lý...
                    <?php else: ?>
                        🎯 Tạo Bài Viết SEO
                    <?php endif; ?>
                </button>
            </form>
        </div>

        <?php if ($processing): ?>
            <div class="processing">
                <strong>⏳ Đang xử lý...</strong><br>
                <small>Hệ thống đang tìm kiếm, phân tích và tạo bài viết theo cấu hình của bạn. Vui lòng chờ trong giây lát...</small>
            </div>
        <?php endif; ?>

        <?php if ($error): ?>
            <div class="error">
                <strong>❌ Lỗi:</strong> <?php echo htmlspecialchars($error); ?>
            </div>
        <?php endif; ?>

        <?php if ($result_html): ?>
            <div class="success">
                <strong>✅ Thành công!</strong> Bài viết đã được tạo theo cấu hình của bạn và hiển thị bên dưới.
            </div>
            <?php echo $result_html; ?>
        <?php endif; ?>
    </div>

    <script>
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
    </script>
</body>
</html>