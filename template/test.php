<?php
session_start();
header('Content-Type: text/html; charset=utf-8');

// --- Khởi tạo mẫu nếu chưa có ---
if (!isset($_SESSION['blocks'])) {
    $_SESSION['blocks'] = [
        ['id' => uniqid('b_'), 'type' => 'text',  'content' => '<p>Đoạn văn mẫu: bấm vào để chỉnh sửa. Thử nhấn Enter để tách block.</p>'],
        ['id' => uniqid('b_'), 'type' => 'image', 'content' => 'https://via.placeholder.com/600x300?text=Ảnh+Mẫu']
    ];
}

// --- Helpers ---
function findIndex($id){
    foreach ($_SESSION['blocks'] as $i => $b) {
        if ($b['id'] === $id) return $i;
    }
    return -1;
}

// --- Xử lý AJAX (POST) ---
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
    $action = $_POST['action'];

    if ($action === 'add_text') {
        $text = $_POST['text'] ?? '<p>Nội dung mới</p>';
        $afterId = $_POST['after_id'] ?? null;
        $block = ['id'=>uniqid('b_'),'type'=>'text','content'=>$text];
        if ($afterId !== null) {
            $i = findIndex($afterId);
            if ($i >= 0) {
                array_splice($_SESSION['blocks'], $i + 1, 0, [$block]);
                exit(json_encode(['ok'=>true,'block'=>$block,'position'=>$i+1]));
            }
        }
        array_unshift($_SESSION['blocks'],$block);
        exit(json_encode(['ok'=>true,'block'=>$block,'position'=>0]));
    }

    if ($action === 'add_code') {
        $code = $_POST['code'] ?? '<pre><code>// Mã nguồn</code></pre>';
        $afterId = $_POST['after_id'] ?? null;
        $block = ['id'=>uniqid('b_'),'type'=>'code','content'=>$code];
        if ($afterId !== null) {
            $i = findIndex($afterId);
            if ($i >= 0) {
                array_splice($_SESSION['blocks'], $i + 1, 0, [$block]);
                exit(json_encode(['ok'=>true,'block'=>$block,'position'=>$i+1]));
            }
        }
        array_unshift($_SESSION['blocks'],$block);
        exit(json_encode(['ok'=>true,'block'=>$block,'position'=>0]));
    }

    if ($action === 'add_image_by_url') {
        $url = trim($_POST['url'] ?? '');
        if ($url === '') exit(json_encode(['ok'=>false,'msg'=>'URL rỗng']));
        $block = ['id'=>uniqid('b_'),'type'=>'image','content'=>$url];
        array_push($_SESSION['blocks'],$block); // thêm cuối
        exit(json_encode(['ok'=>true,'block'=>$block]));
    }

    if ($action === 'delete') {
        $id = $_POST['id'] ?? '';
        $i = findIndex($id);
        if ($i>=0) {
            array_splice($_SESSION['blocks'],$i,1);
            exit(json_encode(['ok'=>true]));
        } else exit(json_encode(['ok'=>false,'msg'=>'Không tìm thấy block']));
    }

    if ($action === 'edit') {
        $id = $_POST['id'] ?? '';
        $content = $_POST['content'] ?? '';
        $i = findIndex($id);
        if ($i>=0) {
            $_SESSION['blocks'][$i]['content'] = $content;
            exit(json_encode(['ok'=>true]));
        } else exit(json_encode(['ok'=>false,'msg'=>'Không tìm thấy block']));
    }

    if ($action === 'split') {
        // split sau vị trí con trỏ: client gửi id và rightContent (HTML)
        $id = $_POST['id'] ?? '';
        $right = $_POST['right'] ?? '';
        $i = findIndex($id);
        if ($i>=0) {
            $newBlock = ['id'=>uniqid('b_'),'type'=>'text','content'=>$right === '' ? '<p></p>' : $right];
            array_splice($_SESSION['blocks'],$i+1,0,[$newBlock]);
            exit(json_encode(['ok'=>true,'new'=>$newBlock,'pos'=>$i+1]));
        } else exit(json_encode(['ok'=>false,'msg'=>'Không tìm thấy block để split']));
    }

    if ($action === 'reorder') {
        $order = json_decode($_POST['order'] ?? '[]', true);
        if (!is_array($order)) exit(json_encode(['ok'=>false,'msg'=>'Dữ liệu không hợp lệ']));
        $map = [];
        foreach ($_SESSION['blocks'] as $b) $map[$b['id']] = $b;
        $new = [];
        foreach ($order as $id) {
            if (isset($map[$id])) $new[] = $map[$id];
        }
        // thêm những block còn thiếu (an toàn)
        foreach ($_SESSION['blocks'] as $b) if (!in_array($b,$new,true)) $new[] = $b;
        $_SESSION['blocks'] = $new;
        exit(json_encode(['ok'=>true]));
    }

    if ($action === 'get') {
        exit(json_encode(['ok'=>true,'blocks'=>$_SESSION['blocks']]));
    }

    exit(json_encode(['ok'=>false,'msg'=>'Unknown action']));
}
?>
<!doctype html>
<html lang="vi">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<link href="https://fonts.googleapis.com/css2?family=Montserrat&display=swap" rel="stylesheet">
<title>Soạn thảo kéo thả - All-in-one</title>
<style>
  :root{
    --bg:#f5f6f8;
    --card:#fff;
    --muted:#6b7280;
    --green:#10b981;
    --blue:#2563eb;
    --orange:#f59e0b;
    --red:#ef4444;
    --border:#e5e7eb;
    --light-blue:#eff6ff;
  }
  *{
    box-sizing:border-box;
    margin:0;
    padding:0
  }
  body{
    margin:0;
    font-family:Montserrat;
    background:var(--bg);
    color:#111;
    line-height:1.5
  }
  
  /* Top green banner */
  .top-banner{
    background:var(--green);
    color:#fff;
    padding:10px 20px;
    text-align:center;
    font-size:14px;
  }
  
  /* Main header */
  .main-header{
    background:#fff;
    border-bottom:1px solid var(--border);
    padding:16px 24px;
    display:flex;
    align-items:center;
    justify-content:space-between;
    position:sticky;
    top:0;
    z-index:100;
  }
  .header-left{display:flex;align-items:center;gap:20px;flex:1}
  .logo{font-size:20px;font-weight:bold;color:var(--blue)}
  .breadcrumbs{color:var(--muted);font-size:14px}
  .breadcrumbs a{color:var(--muted);text-decoration:none}
  .breadcrumbs a:hover{color:var(--blue)}
  .article-title{font-size:18px;font-weight:600;color:#111;margin-left:8px}
  .header-right{display:flex;align-items:center;gap:16px}
  .word-count{color:var(--muted);font-size:14px}
  .seo-score{display:flex;align-items:center;gap:8px}
  .seo-circle{
    width:50px;
    height:50px;
    border-radius:50%;
    background:conic-gradient(var(--green) 0deg 306deg, #e5e7eb 306deg 360deg);
    display:flex;
    align-items:center;
    justify-content:center;
    color:#fff;
    font-weight:bold;
    font-size:16px;
    position:relative;
  }
  .seo-circle::before{
    content:'';
    position:absolute;
    width:38px;
    height:38px;
    background:#fff;
    border-radius:50%;
  }
  .seo-circle span{position:relative;z-index:1}
  .seo-label{font-size:14px;color:var(--muted)}
  .btn{padding:8px 16px;border-radius:6px;border:none;cursor:pointer;font-size:14px;font-weight:500;transition:all 0.2s}
  .btn-save{background:#fff;border:1px solid var(--border);color:#111}
  .btn-save:hover{background:#f9fafb}
  .btn-publish{background:var(--blue);color:#fff}
  .btn-publish:hover{background:#1d4ed8}
  .btn-close{background:transparent;border:none;font-size:20px;cursor:pointer;color:var(--muted);padding:4px 8px}
  .btn-close:hover{color:#111}
  
  /* Main container */
  .main-container{
    display:flex;
    height:calc(100vh - 120px);
    overflow:hidden;
  }
  
  /* Left sidebar */
  .left-sidebar{
    width:280px;
    background:#fff;
    border-right:1px solid var(--border);
    padding:20px;
    overflow-y:auto;
  }
  .sidebar-section{margin-bottom:32px}
  .sidebar-title{
    font-size:14px;
    font-weight:600;
    color:#111;
    margin-bottom:12px;
    text-transform:uppercase;
    letter-spacing:0.5px;
  }
  .structure-list{list-style:none}
  .structure-item{
    padding:10px 12px;
    margin-bottom:4px;
    border-radius:6px;
    cursor:pointer;
    font-size:14px;
    color:#374151;
    transition:all 0.2s;
  }
  .structure-item:hover{background:var(--light-blue)}
  .structure-item.active{
    background:var(--light-blue);
    color:var(--blue);
    font-weight:500;
  }
  .seo-list{list-style:none}
  .seo-item{
    padding:8px 0;
    font-size:13px;
    color:#374151;
    display:flex;
    align-items:center;
    gap:8px;
  }
  .seo-bullet{
    width:8px;
    height:8px;
    border-radius:50%;
    flex-shrink:0;
  }
  .seo-bullet.green{background:var(--green)}
  .seo-bullet.orange{background:var(--orange)}
  
  /* Main editor area */
  .main-editor{
    flex:1;
    background:var(--bg);
    overflow-y:auto;
    padding:24px;
  }
  .editor-toolbar{
    background:#fff;
    padding:12px 16px;
    border-radius:8px;
    margin-bottom:16px;
    display:flex;
    gap:8px;
    align-items:center;
    flex-wrap:wrap;
    border:1px solid var(--border);
  }
  .toolbar-select{
    padding:6px 10px;
    border:1px solid var(--border);
    border-radius:4px;
    font-size:13px;
    background:#fff;
  }
  .toolbar-btn{
    padding:6px 10px;
    border:1px solid var(--border);
    background:#fff;
    border-radius:4px;
    cursor:pointer;
    font-size:13px;
    display:inline-flex;
    align-items:center;
    justify-content:center;
    min-width:32px;
    height:32px;
  }
  .toolbar-btn:hover{background:#f9fafb}
  .toolbar-btn.active{background:var(--light-blue);border-color:var(--blue)}
  .toolbar-divider{
    width:1px;
    height:24px;
    background:var(--border);
    margin:0 4px;
  }
  .editor-content{
    background:#fff;
    border-radius:8px;
    padding:24px;
    min-height:400px;
    border:1px solid var(--border);
  }
  .block{
    margin-bottom:24px;
    position:relative;
    padding:16px;
    border-radius:8px;
    border:1px solid transparent;
    transition:all 0.2s;
  }
  .block:hover{border-color:var(--border);background:#fafafa}
  .block.dragging{opacity:0.5}
  .block .toolbar{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px;padding-bottom:12px;border-bottom:1px solid #f3f4f6}
  .contenteditable{
    min-height:60px;
    padding:8px;
    border-radius:6px;
    outline:none;
    line-height:1.6;
  }
  .contenteditable:focus{background:#fafafa}
  .contenteditable h1{font-size:28px;font-weight:bold;margin:16px 0}
  .contenteditable h2{font-size:24px;font-weight:bold;margin:14px 0}
  .contenteditable h3{font-size:20px;font-weight:bold;margin:12px 0}
  .contenteditable p{margin:8px 0}
  .contenteditable ul, .contenteditable ol{margin:8px 0;padding-left:24px}
  .close-btn{
    position:absolute;
    top:8px;
    right:8px;
    background:var(--red);
    color:#fff;
    border:0;
    border-radius:4px;
    padding:4px 8px;
    font-size:12px;
    cursor:pointer;
    opacity:0;
    transition:opacity 0.2s;
  }
  .block:hover .close-btn{opacity:1}
  .block-actions{
    display:flex;
    gap:8px;
    justify-content:center;
    padding:12px 0;
    margin-top:12px;
    border-top:1px solid #f3f4f6;
  }
  .block-action-btn{
    display:flex;
    align-items:center;
    gap:6px;
    padding:8px 16px;
    border-radius:6px;
    border:1px solid var(--border);
    background:#fff;
    color:var(--blue);
    cursor:pointer;
    font-size:13px;
    transition:all 0.2s;
  }
  .block-action-btn:hover{background:var(--light-blue);border-color:var(--blue)}
  .block img{max-width:100%;border-radius:8px;margin:8px 0}
  .edit-note{font-size:12px;color:var(--muted);margin-top:8px;padding-top:8px;border-top:1px solid #f3f4f6}
  
  /* Right sidebar */
  .right-sidebar{
    width:360px;
    background:#fff;
    border-left:1px solid var(--border);
    padding:20px;
    overflow-y:auto;
  }
  .sidebar-section-title{
    font-size:16px;
    font-weight:600;
    color:#111;
    margin-bottom:16px;
  }
  .image-search{
    position:relative;
    margin-bottom:16px;
  }
  .image-search input{
    width:100%;
    padding:10px 12px 10px 36px;
    border:1px solid var(--border);
    border-radius:6px;
    font-size:14px;
  }
  .image-search::before{
    content:'🔍';
    position:absolute;
    left:12px;
    top:50%;
    transform:translateY(-50%);
    font-size:16px;
  }
  .image-grid{
    display:grid;
    grid-template-columns:repeat(2,1fr);
    gap:12px;
    margin-bottom:24px;
  }
  .image-placeholder{
    aspect-ratio:4/3;
    background:#f3f4f6;
    border-radius:8px;
    border:2px dashed var(--border);
    display:flex;
    align-items:center;
    justify-content:center;
    color:var(--muted);
    font-size:12px;
  }
  .references-list{
    list-style:none;
    margin-bottom:16px;
  }
  .reference-item{
    display:flex;
    align-items:center;
    gap:12px;
    padding:12px;
    background:#f9fafb;
    border-radius:6px;
    margin-bottom:8px;
  }
  .reference-icon{
    width:32px;
    height:32px;
    background:var(--light-blue);
    border-radius:4px;
    display:flex;
    align-items:center;
    justify-content:center;
    font-size:14px;
    flex-shrink:0;
  }
  .reference-info{flex:1;min-width:0}
  .reference-title{
    font-size:13px;
    font-weight:500;
    color:#111;
    margin-bottom:2px;
    white-space:nowrap;
    overflow:hidden;
    text-overflow:ellipsis;
  }
  .reference-domain{
    font-size:12px;
    color:var(--muted);
  }
  .reference-actions{
    display:flex;
    gap:8px;
  }
  .reference-btn{
    background:transparent;
    border:none;
    cursor:pointer;
    padding:4px;
    color:var(--muted);
    font-size:16px;
  }
  .reference-btn:hover{color:var(--blue)}
  .reference-btn.delete:hover{color:var(--red)}
  .btn-add-ref{
    width:100%;
    padding:10px;
    background:#fff;
    border:1px solid var(--border);
    border-radius:6px;
    color:var(--blue);
    cursor:pointer;
    font-size:14px;
    font-weight:500;
  }
  .btn-add-ref:hover{background:var(--light-blue)}
  
  /* Meta description input */
  .meta-description{
    margin-top:24px;
    padding-top:24px;
    border-top:1px solid var(--border);
  }
  .meta-description label{
    display:block;
    font-size:14px;
    font-weight:500;
    margin-bottom:8px;
    color:#111;
  }
  .meta-description textarea{
    width:100%;
    padding:10px;
    border:1px solid var(--border);
    border-radius:6px;
    font-size:14px;
    font-family:inherit;
    resize:vertical;
    min-height:80px;
  }
  .meta-word-count{
    font-size:12px;
    color:var(--muted);
    margin-top:4px;
  }
  
  /* Responsive */
  @media (max-width:1200px){
    .left-sidebar{width:240px}
    .right-sidebar{width:300px}
  }
  @media (max-width:900px){
    .main-container{flex-direction:column}
    .left-sidebar,.right-sidebar{width:100%;height:auto;max-height:300px}
    .main-editor{flex:1}
  }
</style>
</head>
<body>
  <!-- Top green banner -->
  <div class="top-banner">
    Bản nháp AI vì đã sẵn sàng. Bạn có thể chỉnh sửa nếu cần thiết
  </div>

  <!-- Main header -->
  <div class="main-header">
    <div class="header-left">
      <div class="logo">AIS</div>

      <div class="breadcrumbs">
        <a href="#">Trang chủ</a> > <a href="#">Cấu hình</a> > Bài viết
      </div>
      <div class="article-title">Hướng dẫn toàn diện về SEO cho người mới bắt đầu</div>
    </div>
    <div class="header-right">
      <span class="word-count">1,247 từ</span>
      <div class="seo-score">
        <div class="seo-circle">
          <span>85</span>
        </div>
        <span class="seo-label">SEO</span>
      </div>
      <button class="btn btn-save" id="btnSave">Lưu</button>
      <button class="btn btn-publish" id="btnPublish">Xuất bản </button>
      <button class="btn" id="btnPreview">Xem bản nháp</button>
      <button class="btn-close" onclick="window.close()">×</button>
    </div>
  </div>

  <!-- Main container -->
  <div class="main-container">
    <!-- Left sidebar -->
    <div class="left-sidebar">
      <div class="sidebar-section">
        <div class="sidebar-title">Cấu trúc bài viết</div>
        <ul class="structure-list">
          <li class="structure-item active">Giới thiệu về SEO</li>
          <li class="structure-item">Tầm quan trọng của SEO</li>
          <li class="structure-item">Các yếu tố SEO cơ bản</li>
          <li class="structure-item">Từ khóa và nghiên cứu</li>
          <li class="structure-item">Tối ưu On-page</li>
          <li class="structure-item">Kết luận</li>
        </ul>
      </div>
      <div class="sidebar-section">
        <div class="sidebar-title">Đánh giá SEO</div>
        <ul class="seo-list">
          <li class="seo-item">
            <span class="seo-bullet green"></span>
            <span>Mật độ từ khóa tốt (2.3%)</span>
          </li>
          <li class="seo-item">
            <span class="seo-bullet orange"></span>
            <span>Thiếu meta description</span>
          </li>
          <li class="seo-item">
            <span class="seo-bullet green"></span>
            <span>Cấu trúc heading tốt</span>
          </li>
        </ul>
      </div>
    </div>

    <!-- Main editor -->
    <div class="main-editor">
      <div class="editor-toolbar">
        <select class="toolbar-select" onchange="changeHeading(this.value)">
          <option value="">Tiêu đề 1</option>
          <option value="h1">Tiêu đề 1</option>
          <option value="h2">Tiêu đề 2</option>
          <option value="h3">Tiêu đề 3</option>
        </select>
        <div class="toolbar-divider"></div>
        <button class="toolbar-btn" onclick="formatText('bold')" title="Bold"><b>B</b></button>
        <button class="toolbar-btn" onclick="formatText('italic')" title="Italic"><i>I</i></button>
        <button class="toolbar-btn" onclick="formatText('insertUnorderedList')" title="Danh sách">•</button>
        <button class="toolbar-btn" onclick="formatText('insertOrderedList')" title="Danh sách số">1.</button>
        <button class="toolbar-btn" onclick="formatText('createLink')" title="Link">🔗</button>
        <button class="toolbar-btn" onclick="formatText('formatBlock','blockquote')" title="Trích dẫn">"</button>
        <div class="toolbar-divider"></div>
        <button class="toolbar-btn" onclick="aiRewrite()" title="Viết lại">✨ Viết lại</button>
        <button class="toolbar-btn" onclick="aiExpand()" title="Mở rộng">Mở rộng</button>
        <button class="toolbar-btn" onclick="aiCondense()" title="Rút gọn">Rút gọn</button>
        <div class="toolbar-divider"></div>
        <button class="toolbar-btn" onclick="undo()" title="Hoàn tác">↶</button>
        <button class="toolbar-btn" onclick="redo()" title="Làm lại">↷</button>
      </div>

      <div class="editor-content" id="blocks">
      <!-- Blocks sẽ được render bởi PHP -->
      <?php foreach ($_SESSION['blocks'] as $b): ?>
        <div class="block" data-id="<?php echo $b['id'] ?>" draggable="true">
          <button class="close-btn" onclick="deleteBlock('<?php echo $b['id'] ?>')">Xóa</button>

          <?php if ($b['type'] === 'code'): ?>
            <div class="toolbar">
              <button onclick="formatCodeBlock('<?php echo $b['id'] ?>')">Format</button>
            </div>
            <div class="contenteditable" contenteditable="true" style="font-family:monospace;background:#f8f9fa;padding:12px;border-radius:6px;white-space:pre-wrap"
                 onblur="saveEdit('<?php echo $b['id'] ?>', this.innerHTML)"
                 oninput="debounceSave('<?php echo $b['id'] ?>', this.innerHTML, 700)">
              <?php echo htmlspecialchars($b['content']) ?>
            </div>
            <div class="edit-note small">Loại: Mã nguồn</div>
          <?php elseif ($b['type'] === 'text'): ?>
            <div class="toolbar">
              <button onclick="formatBlock('<?php echo $b['id'] ?>','h1')">H1</button>
              <button onclick="formatBlock('<?php echo $b['id'] ?>','h2')">H2</button>
              <button onclick="formatBlock('<?php echo $b['id'] ?>','h3')">H3</button>
              <button onclick="formatBlock('<?php echo $b['id'] ?>','formatBlock','p')">P</button>
              <button onclick="formatBlock('<?php echo $b['id'] ?>','bold')"><b>B</b></button>
              <button onclick="formatBlock('<?php echo $b['id'] ?>','italic')"><i>I</i></button>
              <button onclick="formatBlock('<?php echo $b['id'] ?>','underline')"><u>U</u></button>
              <button onclick="formatBlock('<?php echo $b['id'] ?>','justifyleft')">Left</button>
              <button onclick="formatBlock('<?php echo $b['id'] ?>','justifycenter')">Center</button>
              <button onclick="formatBlock('<?php echo $b['id'] ?>','justifyright')">Right</button>
              <select onchange="changeFontSize('<?php echo $b['id'] ?>', this.value)">
                <option value="">Cỡ chữ</option>
                <option value="12px">12</option>
                <option value="14px">14</option>
                <option value="16px">16</option>
                <option value="18px">18</option>
                <option value="24px">24</option>
              </select>
              <input type="color" onchange="changeColor('<?php echo $b['id'] ?>', this.value)" title="Màu chữ">
            </div>
            <div class="toolbal">
              
            <div class="contenteditable" contenteditable="true"
                 onblur="saveEdit('<?php echo $b['id'] ?>', this.innerHTML)"
                 onkeydown="handleKeyDown(event, '<?php echo $b['id'] ?>')"
                 oninput="debounceSave('<?php echo $b['id'] ?>', this.innerHTML, 700)">
              <?php echo $b['content'] ?>
            </div>
            <div class="edit-note small">Nhấn Enter để tách block tại vị trí con trỏ.</div>
          <?php else: ?>
            <img src="<?php echo htmlspecialchars($b['content']) ?>" style="max-width:100%;border-radius:8px">
            <div class="edit-note small">Loại: Hình ảnh</div>
          <?php endif; ?>
          <div class="block-actions">
            <button class="block-action-btn" data-tooltip="Thêm ô văn bản" onclick="addTextBlockAfter('<?php echo $b['id'] ?>')">
              <span class="icon">+</span>
              <span>Văn bản</span>
            </button>
          </div>
        </div>
      <?php endforeach; ?>
      
      <!-- Meta description section -->
      <div class="meta-description">
        <label>Mô tả ngắn (Meta Description)</label>
        <textarea id="metaDescription" placeholder="Nhập mô tả ngắn cho bài viết..." oninput="updateMetaWordCount()"></textarea>
        <div class="meta-word-count"><span id="metaWordCount">0</span> từ</div>
      </div>
    </div>
  </div>

  <!-- Right sidebar -->
  <div class="right-sidebar">
    <div class="sidebar-section">
      <div class="sidebar-section-title">Hình ảnh gợi ý</div>
      <div class="image-search">
        <input type="text" placeholder="Tìm hình theo từ khóa" id="imageSearch">
      </div>
      <div class="image-grid" id="imageGrid">
        <div class="image-placeholder"></div>
        <div class="image-placeholder"></div>
        <div class="image-placeholder"></div>
        <div class="image-placeholder"></div>
      </div>
    </div>

    <div class="sidebar-section">
      <div class="sidebar-section-title">Nguồn tham khảo <span style="font-weight:normal;color:var(--muted)">(3 nguồn)</span></div>
      <ul class="references-list" id="referencesList">
        <li class="reference-item">
          <div class="reference-icon">📰</div>
          <div class="reference-info">
            <div class="reference-title">Nguồn A</div>
            <div class="reference-domain">domain.com</div>
          </div>
          <div class="reference-actions">
            <button class="reference-btn" title="Mở liên kết">🔗</button>
            <button class="reference-btn delete" title="Xóa">×</button>
          </div>
        </li>
        <li class="reference-item">
          <div class="reference-icon">📰</div>
          <div class="reference-info">
            <div class="reference-title">Nguồn B</div>
            <div class="reference-domain">domain.com</div>
          </div>
          <div class="reference-actions">
            <button class="reference-btn" title="Mở liên kết">🔗</button>
            <button class="reference-btn delete" title="Xóa">×</button>
          </div>
        </li>
        <li class="reference-item">
          <div class="reference-icon">📰</div>
          <div class="reference-info">
            <div class="reference-title">Nguồn C</div>
            <div class="reference-domain">domain.com</div>
          </div>
          <div class="reference-actions">
            <button class="reference-btn" title="Mở liên kết">🔗</button>
            <button class="reference-btn delete" title="Xóa">×</button>
          </div>
        </li>
      </ul>
      <button class="btn-add-ref" onclick="addReference()">+ Thêm nguồn tham khảo</button>
    </div>
  </div>
</div>

<script>
/* ---------- Utility AJAX ---------- */
function ajaxPost(data){ 
  return fetch('', { method:'POST', headers:{'Content-Type':'application/x-www-form-urlencoded'}, body:new URLSearchParams(data) })
         .then(r => r.json());
}

/* ---------- Toolbar functions ---------- */
function changeHeading(value){
  if(!value) return;
  document.execCommand('formatBlock', false, value);
}

function formatText(cmd, arg){
  if(cmd === 'formatBlock' && arg){
    document.execCommand('formatBlock', false, arg);
  } else {
    document.execCommand(cmd, false, null);
  }
}

function aiRewrite(){
  alert('Tính năng viết lại AI sẽ được triển khai');
}

function aiExpand(){
  alert('Tính năng mở rộng AI sẽ được triển khai');
}

function aiCondense(){
  alert('Tính năng rút gọn AI sẽ được triển khai');
}

function undo(){
  document.execCommand('undo', false, null);
}

function redo(){
  document.execCommand('redo', false, null);
}

/* ---------- Meta description word count ---------- */
function updateMetaWordCount(){
  const textarea = document.getElementById('metaDescription');
  const countEl = document.getElementById('metaWordCount');
  const text = textarea.value.trim();
  const wordCount = text ? text.split(/\s+/).length : 0;
  countEl.textContent = wordCount;
}

/* ---------- Structure navigation ---------- */
document.querySelectorAll('.structure-item').forEach(item => {
  item.addEventListener('click', function(){
    document.querySelectorAll('.structure-item').forEach(i => i.classList.remove('active'));
    this.classList.add('active');
    // Scroll to section (implement based on your needs)
  });
});

/* ---------- Reference delete buttons ---------- */
document.querySelectorAll('.reference-btn.delete').forEach(btn => {
  btn.addEventListener('click', function(){
    this.closest('.reference-item').remove();
  });
});

/* ---------- Save and Publish ---------- */
document.getElementById('btnSave').addEventListener('click', () => {
  alert('Đã lưu bài viết');
});

document.getElementById('btnPublish').addEventListener('click', () => {
  if(confirm('Bạn có chắc muốn xuất bản bài viết này?')){
    alert('Bài viết đã được xuất bản');
  }
});

/* ---------- Add text ---------- */
// Removed btnAddText - using block actions instead

/* ---------- Add text block after specific block ---------- */
function addTextBlockAfter(blockId){
  ajaxPost({action:'add_text', text:'<p>Nội dung mới</p>', after_id:blockId}).then(res=>{
    if(!res.ok) return alert('Lỗi thêm block văn bản');
    // Insert new block after current block
    insertNewBlockAfter(blockId, res.block);
  });
}

/* ---------- Add image by URL ---------- */
function addImageByUrl(){
  const url = document.getElementById('imgUrl').value.trim();
  if(!url) return alert('Nhập URL ảnh');
  ajaxPost({action:'add_image_by_url', url}).then(res=>{
    if(!res.ok) return alert(res.msg || 'Lỗi thêm ảnh');
    location.reload();
  });
}

/* ---------- Delete ---------- */
function deleteBlock(id){
  if(!confirm('Bạn có chắc muốn xóa block này?')) return;
  ajaxPost({action:'delete', id}).then(res=>{
    if(res.ok) location.reload();
    else alert('Xóa thất bại: '+(res.msg||''));
  });
}

/* ---------- Save edit ---------- */
function saveEdit(id, html){
  ajaxPost({action:'edit', id:id, content: html}).then(res=>{
    if(!res.ok) console.warn('Lưu thất bại', res.msg);
  });
}

/* debounce save on typing */
let debounceTimers = {};
function debounceSave(id, html, ms){
  if(debounceTimers[id]) clearTimeout(debounceTimers[id]);
  debounceTimers[id] = setTimeout(()=>{ saveEdit(id, html); }, ms);
}

/* ---------- Format commands (toolbar) ---------- */
function formatBlock(id, cmd, arg){
  const el = document.querySelector('.block[data-id="'+id+'"] .contenteditable');
  el.focus();
  if(cmd === 'formatBlock' && arg){
    document.execCommand('formatBlock', false, arg);
  } else if (cmd === 'h1' || cmd === 'h2' || cmd === 'h3'){
    document.execCommand('formatBlock', false, cmd);
  } else if (cmd === 'bold' || cmd === 'italic' || cmd === 'underline'){
    document.execCommand(cmd);
  } else if (cmd === 'justifyleft') document.execCommand('justifyLeft');
  else if (cmd === 'justifycenter' || cmd === 'justifycenter') document.execCommand('justifyCenter');
  else if (cmd === 'justifyright') document.execCommand('justifyRight');
  // save after change
  saveEdit(id, el.innerHTML);
}

function changeFontSize(id, size){
  const el = document.querySelector('.block[data-id="'+id+'"] .contenteditable');
  el.focus();
  if(!size) return;
  // wrap selection in span with font-size
  document.execCommand('fontSize', false, 7); // use size 7 as placeholder
  // replace <font size="7">...</font> -> <span style="font-size:SIZE">
  el.innerHTML = el.innerHTML.replace(/<font[^>]*size="7"[^>]*>(.*?)<\/font>/gi, '<span style="font-size:'+size+'">$1</span>');
  saveEdit(id, el.innerHTML);
}

function changeColor(id, color){
  const el = document.querySelector('.block[data-id="'+id+'"] .contenteditable');
  el.focus();
  document.execCommand('foreColor', false, color);
  saveEdit(id, el.innerHTML);
}

function formatCodeBlock(id){
  const el = document.querySelector('.block[data-id="'+id+'"] .contenteditable');
  el.focus();
  // Format code block if needed
  saveEdit(id, el.innerHTML);
}

/* ---------- Split on Enter at caret position ---------- */
function handleKeyDown(e, id){
  if(e.key === 'Enter'){
    e.preventDefault();
    const sel = window.getSelection();
    if(!sel.rangeCount) return;
    const range = sel.getRangeAt(0);

    // clone range to get HTML right of caret
    const rightRange = range.cloneRange();
    rightRange.setEndAfter(document.querySelector('.block[data-id="'+id+'"] .contenteditable').lastChild || document.querySelector('.block[data-id="'+id+'"] .contenteditable'));
    // create container to extract right html
    const frag = rightRange.cloneContents();
    // create temporary div to put fragment and get innerHTML
    const tmp = document.createElement('div');
    tmp.appendChild(frag);
    const rightHtml = tmp.innerHTML.trim();

    // To get left HTML, create range from start to caret
    const leftRange = range.cloneRange();
    leftRange.setStartBefore(document.querySelector('.block[data-id="'+id+'"] .contenteditable').firstChild || document.querySelector('.block[data-id="'+id+'"] .contenteditable'));
    const leftFrag = leftRange.cloneContents();
    const tmp2 = document.createElement('div'); tmp2.appendChild(leftFrag);
    const leftHtml = tmp2.innerHTML.trim();

    // Save leftHtml into current block, and send rightHtml to server to insert new block after current
    const el = document.querySelector('.block[data-id="'+id+'"] .contenteditable');
    el.innerHTML = leftHtml || '<p></p>';
    saveEdit(id, el.innerHTML);

    ajaxPost({action:'split', id:id, right: rightHtml}).then(res=>{
      if(res.ok){
        insertNewBlockAfter(id, res.new);
      } else {
        alert('Split thất bại: '+(res.msg||''));
      }
    });
  }
}

/* Insert new block DOM after given id using server response */
function insertNewBlockAfter(id, newBlock){
  const cur = document.querySelector('.block[data-id="'+id+'"]');
  if(!cur) { location.reload(); return; }
  // build DOM for new block
  const div = document.createElement('div');
  div.className = 'block';
  div.dataset.id = newBlock.id;
  div.draggable = true;

  const btn = document.createElement('button');
  btn.className = 'close-btn';
  btn.textContent = 'Xóa';
  btn.onclick = ()=> deleteBlock(newBlock.id);
  div.appendChild(btn);

  if(newBlock.type === 'image'){
    const img = document.createElement('img');
    img.src = newBlock.content;
    img.style.maxWidth = '100%';
    img.style.borderRadius = '8px';
    div.appendChild(img);
    const note = document.createElement('div'); note.className='edit-note small'; note.textContent='Loại: Hình ảnh'; div.appendChild(note);
  } else if(newBlock.type === 'code'){
    const toolbar = document.createElement('div'); toolbar.className='toolbar';
    toolbar.innerHTML = `<button onclick="formatCodeBlock('${newBlock.id}')">Format</button>`;
    div.appendChild(toolbar);

    const content = document.createElement('div');
    content.className = 'contenteditable';
    content.style.fontFamily = 'monospace';
    content.style.background = '#f8f9fa';
    content.style.padding = '12px';
    content.style.borderRadius = '6px';
    content.style.whiteSpace = 'pre-wrap';
    content.contentEditable = true;
    content.onblur = ()=> saveEdit(newBlock.id, content.innerHTML);
    content.oninput = ()=> debounceSave(newBlock.id, content.innerHTML, 700);
    content.innerHTML = newBlock.content || '<pre><code>// Mã nguồn</code></pre>';
    div.appendChild(content);

    const note = document.createElement('div'); note.className='edit-note small'; note.textContent='Loại: Mã nguồn';
    div.appendChild(note);
  } else {
    const toolbar = document.createElement('div'); toolbar.className='toolbar';
    toolbar.innerHTML = `
      <button onclick="formatBlock('${newBlock.id}','h1')">H1</button>
      <button onclick="formatBlock('${newBlock.id}','h2')">H2</button>
      <button onclick="formatBlock('${newBlock.id}','h3')">H3</button>
      <button onclick="formatBlock('${newBlock.id}','formatBlock','p')">P</button>
      <button onclick="formatBlock('${newBlock.id}','bold')"><b>B</b></button>
      <button onclick="formatBlock('${newBlock.id}','italic')"><i>I</i></button>
      <button onclick="formatBlock('${newBlock.id}','underline')"><u>U</u></button>
      <button onclick="formatBlock('${newBlock.id}','justifyleft')">Left</button>
      <button onclick="formatBlock('${newBlock.id}','justifycenter')">Center</button>
      <button onclick="formatBlock('${newBlock.id}','justifyright')">Right</button>
      <select onchange="changeFontSize('${newBlock.id}', this.value)">
        <option value="">Cỡ chữ</option>
        <option value="12px">12</option>
        <option value="14px">14</option>
        <option value="16px">16</option>
        <option value="18px">18</option>
        <option value="24px">24</option>
      </select>
      <input type="color" onchange="changeColor('${newBlock.id}', this.value)" title="Màu chữ">
    `;
    div.appendChild(toolbar);

    const content = document.createElement('div');
    content.className = 'contenteditable';
    content.contentEditable = true;
    content.onblur = ()=> saveEdit(newBlock.id, content.innerHTML);
    content.onkeydown = (e)=> handleKeyDown(e, newBlock.id);
    content.oninput = ()=> debounceSave(newBlock.id, content.innerHTML, 700);
    content.innerHTML = newBlock.content || '<p></p>';
    div.appendChild(content);

    const note = document.createElement('div'); note.className='edit-note small'; note.textContent='Nhấn Enter để tách block tại vị trí con trỏ.';
    div.appendChild(note);
  }

  // Add action buttons to new block
  const actions = document.createElement('div');
  actions.className = 'block-actions';
  actions.innerHTML = `
    <button class="block-action-btn" data-tooltip="Thêm ô văn bản" onclick="addTextBlockAfter('${newBlock.id}')">
      <span class="icon">+</span>
      <span>Văn bản</span>
    </button>
  `;
  div.appendChild(actions);

  // insert after current
  if(cur.nextSibling) cur.parentNode.insertBefore(div, cur.nextSibling);
  else cur.parentNode.appendChild(div);

  attachDragForBlock(div);

  // put caret at start of new block
  const newContent = div.querySelector('.contenteditable');
  if(newContent){
    placeCaretAtStart(newContent);
    saveEdit(newBlock.id, newContent.innerHTML);
  }
}

/* Helper to place caret at start of element */
function placeCaretAtStart(el){
  el.focus();
  const range = document.createRange();
  range.selectNodeContents(el);
  range.collapse(true);
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
}

// hiện thị

/* ---------- Drag & reorder blocks + drop thêm ảnh ---------- */
const blocksEl = document.getElementById('blocks');
if(!blocksEl) console.error('Blocks container not found');
let dragSrc = null;

function attachDragForBlock(el){
  el.addEventListener('dragstart', e=>{
    dragSrc = el;
    el.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    // Lưu ID block vào dataTransfer để phân biệt với drop thêm ảnh
    e.dataTransfer.setData('text/block-id', el.dataset.id);
  });

  el.addEventListener('dragend', e=>{
    el.classList.remove('dragging');
    dragSrc = null;
    sendOrderToServer();
  });
}

document.querySelectorAll('.block').forEach(attachDragForBlock);

blocksEl.addEventListener('dragover', e=>{
  e.preventDefault();
  const dragging = document.querySelector('.block.dragging');
  if(!dragging) return;
  const after = getDragAfterElement(blocksEl, e.clientY);
  if(after == null) blocksEl.appendChild(dragging);
  else blocksEl.insertBefore(dragging, after);
});

blocksEl.addEventListener('drop', e=>{
  e.preventDefault();

  // 1️⃣ Kiểm tra xem drop đến từ block trong editor (reorder)
  const blockId = e.dataTransfer.getData('text/block-id');
  if(blockId){
    // reorder block => chỉ cần gửi order thôi
    sendOrderToServer();
    return;
  }

  // 2️⃣ Kiểm tra xem drop đến từ preview-item (URL) => thêm block mới
  const url = e.dataTransfer.getData('text/plain') || '';
  if(url && (url.startsWith('http') || url.startsWith('data:'))) {
    ajaxPost({action:'add_image_by_url', url}).then(res=>{
      if(!res.ok) return alert('Không thêm được ảnh: '+(res.msg||''));
      location.reload();
    });
  }
});

// Helper xác định vị trí drop
function getDragAfterElement(container, y){
  const draggableElements = [...container.querySelectorAll('.block:not(.dragging)')];
  let closest = null;
  let closestOffset = Number.NEGATIVE_INFINITY;
  draggableElements.forEach(child=>{
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    if(offset < 0 && offset > closestOffset){
      closestOffset = offset;
      closest = child;
    }
  });
  return closest;
}

// Gửi thứ tự mới lên server
function sendOrderToServer(){
  const ids = [...blocksEl.querySelectorAll('.block')].map(el => el.dataset.id);
  ajaxPost({action:'reorder', order: JSON.stringify(ids)}).then(res=>{
    if(!res.ok) console.warn('Reorder lỗi', res.msg);
  });
}

document.getElemantById('btnPreview').addEventListener('click', ()=>{
    ajaxPost ({action: 'get'}).then(res=>{
        let html = '<!doctype html><html><head><meta charset="utf-8"><title>Preview</title><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{font-family:Arial;padding:20px;line-height:1.6;max-width:900px;margin:0 auto}img{max-width:100%}</style></head><body>';
        res.blocks.forEach(b=>{
          if (b.type === 'text') html +=b.content;
          else if (b.typr === 'code') html += '<pre><code>'+b.content + '</code></pre>';
          else html += '<p><img src="' +b.content+'" alt=""></p>';

        });
        html +='<body></html>';
        const w = windown.open('','_blank');
        w.document.open();
        w.document.write(html);
        w.document.close();
    });
});



/* ---------- Add reference ---------- */
function addReference(){
  const url = prompt('Nhập URL nguồn tham khảo:');
  if(!url) return;
  const domain = new URL(url).hostname;
  const title = prompt('Nhập tiêu đề nguồn:') || 'Nguồn mới';
  
  const list = document.getElementById('referencesList');
  const item = document.createElement('li');
  item.className = 'reference-item';
  item.innerHTML = `
    <div class="reference-icon">📰</div>
    <div class="reference-info">
      <div class="reference-title">${title}</div>
      <div class="reference-domain">${domain}</div>
    </div>
    <div class="reference-actions">
      <button class="reference-btn" title="Mở liên kết" onclick="window.open('${url}', '_blank')">🔗</button>
      <button class="reference-btn delete" title="Xóa" onclick="this.closest('.reference-item').remove()">×</button>
    </div>
  `;
  list.appendChild(item);
}

/* ---------- Image search and drag ---------- */
document.getElementById('imageSearch').addEventListener('keypress', function(e){
  if(e.key === 'Enter'){
    const keyword = this.value.trim();
    if(keyword){
      // Implement image search here
      console.log('Search images for:', keyword);
    }
  }
});

// Make image placeholders draggable
document.querySelectorAll('.image-placeholder').forEach(placeholder => {
  placeholder.addEventListener('dragstart', e=>{
    // For now, use placeholder URL
    e.dataTransfer.setData('text/plain', 'https://via.placeholder.com/600x300?text=Image');
    e.dataTransfer.effectAllowed = 'copy';
  });
});

/* ---------- Init: attach drag handlers for any new blocks created server-side --- */
(function initAttach(){
  document.querySelectorAll('.block').forEach(attachDragForBlock);
})();
</script>
</body>
</html>
