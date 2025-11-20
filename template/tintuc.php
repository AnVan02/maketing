<?php
session_start();
header('Content-Type: text/html; charset=utf-8');

// --- Khởi tạo mẫu nếu chưa có ---
if (!isset($_SESSION['blocks'])) {
    $_SESSION['blocks'] = [
        ['id' => uniqid('b_'), 'type' => 'text',  'content' => '<p></p>'],
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

    exit(json_encode(['ok'=>false,'msg'=>'<Unkn74>own action']));
}
?>
<!doctype html>
<html lang="vi">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<link href="https://fonts.googleapis.com/css2?family=Montserrat&display=swap" rel="stylesheet">
<link href="../assets/css/tintuc.css" rel="stylesheet">
<script src="../assets/js/tintuc.js"></script>

<title>Soạn thảo kéo thả văn bảng</title>
</head>
<body>

<div class="container">
  <div class="left">
    <div class="editor-header" style="display:flex;align-items:center;justify-content:space-between">
      <h2 style="margin:0">Soạn thảo / Nội dung</h2>
      <div>
        <button class="btn" id="btnPreview">Xem bản nháp</button>
        <button class="btn ghost" id="btnAddText">+ Thêm đoạn văn</button>
      </div>
    </div>


    <div class="editor-area" id="blocks">
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
              <input type="color" onchange="changeColor('<?php echo $b['id'] ?>', this.value)" title="">
            </div>
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
    </div>
  </div>

  <div class="right">
    <h2>Ảnh tham khảo</h2>
    <div class="drop-hint">Kéo ảnh từ đây vào khu soạn thảo để THÊM ảnh mới<br><span style="font-size:12px;color:#9ca3af">(hoặc double-click ảnh để copy URL vào ô)</span></div>

    <div class="preview-list" id="previewList">
      <div class="preview-item" draggable="true" data-src="https://via.placeholder.com/600x300?text=Ảnh+1">
        <img src="https://via.placeholder.com/200x120?text=1"><div class="meta">Ảnh 1</div>
      </div>
      <div class="preview-item" draggable="true" data-src="https://picsum.photos/seed/a/600/300">
        <img src="https://picsum.photos/seed/a/200/120"><div class="meta">Ảnh 2</div>
      </div>
      <div class="preview-item" draggable="true" data-src="https://picsum.photos/seed/b/600/300">
        <img src="https://picsum.photos/seed/b/200/120"><div class="meta">Ảnh 3</div>
      </div>
    </div>

    <hr style="margin:12px 0">

    <h3>Thêm ảnh bằng URL</h3>
    <div style="display:flex;gap:8px">
      <input id="imgUrl" placeholder="https://..." style="flex:1;padding:8px;border-radius:6px;border:1px solid #e5e7eb">
      <button class="btn" onclick="addImageByUrl()">Thêm</button>
    </div>
    <div class="small" style="margin-top:8px">Ảnh sẽ được thêm ở cuối nội dung (hoặc kéo thả để thêm tại vị trí bạn thả).</div>
  </div>
</div>

</body>
</html>
