<?php require "./thanh-dieu-huong.php" ?>
<link rel="stylesheet" href="./thanh-dieu-huong.css">
<link rel="stylesheet" href="./css/thanh-dieu-huong.css">
<script src="./thanh-dieu-huong.js"></script>

<?php

// --- Chỉ sử dụng 1 block duy nhất ---
if (!isset($_SESSION['blocks'])) {
  $_SESSION['blocks'] = [
    ['id' => 'single_block', 'type' => 'text', 'content' => '<p>Đoạn văn bản của bạn. Nhấn Enter để xuống dòng bình thường.</p><p>Bạn có thể viết nhiều đoạn văn trong cùng một block.</p>']
  ];
}

// --- Helpers ---
function findIndex($id)
{
  foreach ($_SESSION['blocks'] as $i => $b) {
    if ($b['id'] === $id) return $i;
  }
  return -1;
}

// --- Xử lý AJAX (POST) ---
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
  $action = $_POST['action'];

  if ($action === 'edit') {
    $id = $_POST['id'] ?? '';
    $content = $_POST['content'] ?? '';
    $i = findIndex($id);
    if ($i >= 0) {
      $_SESSION['blocks'][$i]['content'] = $content;
      exit(json_encode(['ok' => true]));
    } else exit(json_encode(['ok' => false, 'msg' => 'Không tìm thấy block']));
  }

  if ($action === 'ai_chat') {
    $selectedText = $_POST['selected_text'] ?? '';
    $userMessage = $_POST['message'] ?? '';
    $blockId = $_POST['block_id'] ?? '';

    if (empty($selectedText) || empty($userMessage)) {
      exit(json_encode(['ok' => false, 'msg' => 'Thiếu dữ liệu']));
    }

    // Chỉ trả về userMessage
    $aiResponse = $userMessage;

    exit(json_encode([
      'ok' => true,
      'response' => $aiResponse,
      'block_id' => $blockId
    ]));
  }

  exit(json_encode(['ok' => false, 'msg' => 'Unknown action']));
}
?>

<link rel="stylesheet" href="./css/thanh-dieu-huong.css">


<title>Soạn thảo kéo thả - All-in-one với AI</title>
<style>
  :root {
    --bg: #f5f6f8;
    --card: #fff;
    --muted: #6b7280
  }

  * {
    box-sizing: border-box
  }

  body {
    margin: 0;
    font-family: 'Montserrat';
    background: var(--bg);
    color: #111
  }

  .container {
    display: flex;
    gap: 18px;
    height: 100vh;
    padding: 18px;

  }

  .left {
    flex: 1;
    min-width: 0;
    padding: 18px;
    background: transparent;
    overflow: auto;
    position: sticky
  }

  .editor-area {
    background: var(--card);
    padding: 16px;
    border-radius: 12px;
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06)
  }

  .right {
    width: 360px;
    padding: 18px
  }

  .editor-header {
    position: sticky;
    top: 0;
    background: var(--bg);
    z-index: 100;
    padding: 12px 0;
    margin-bottom: 12px;
    border-bottom: 1px solid #e5e7eb
  }

  h2 {
    margin: 0 0 12px 0
  }

  .controls {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 12px
  }

  button,
  input[type="button"] {
    cursor: pointer
  }

  .btn {
    padding: 8px 12px;
    border-radius: 8px;
    border: 0;
    background: #2563eb;
    color: #fff
  }

  .btn.ghost {
    background: #fff;
    border: 1px solid #e5e7eb;
    color: #111
  }

  .drop-hint {
    border: 2px dashed #cbd5e1;
    padding: 16px;
    border-radius: 8px;
    text-align: center;
    color: var(--muted);
    margin-bottom: 12px
  }

  .block {
    background: var(--card);
    padding: 10px;
    border-radius: 10px;
    margin-bottom: 12px;
    position: relative;
    border: 1px solid #eef2f7
  }

  .block.dragging {
    opacity: 0.6
  }

  .block .toolbar {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    margin-bottom: 8px
  }

  .toolbar button {
    padding: 6px 8px;
    border-radius: 6px;
    border: 1px solid #e6eefc;
    background: #fff;
    font-size: 13px
  }

  .contenteditable {
    min-height: 44px;
    padding: 8px;
    border-radius: 6px;
    outline: none;
    line-height: 1.6
  }

  .close-btn {
    position: absolute;
    top: 8px;
    right: 8px;
    background: #ef4444;
    color: #fff;
    border: 0;
    border-radius: 6px;
    padding: 4px 8px
  }

  .edit-note {
    font-size: 12px;
    color: var(--muted);
    margin-top: 6px
  }

  /* Block action buttons */
  .block-actions {
    display: flex;
    gap: 8px;
    justify-content: center;
    padding: 12px 0;
    margin-top: 12px;
    border-top: 1px solid #eef2f7;
    position: relative
  }

  .block-action-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    border-radius: 8px;
    border: 1px solid #e5e7eb;
    background: #fff;
    color: #2563eb;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s;
    position: relative
  }

  .block-action-btn:hover {
    background: #eff6ff;
    border-color: #93c5fd
  }

  .block-action-btn .icon {
    font-size: 16px;
    font-weight: bold
  }

  .block-action-btn[data-tooltip]:hover::after {
    content: attr(data-tooltip);
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    margin-bottom: 8px;
    padding: 6px 10px;
    background: #1f2937;
    color: #fff;
    border-radius: 6px;
    font-size: 12px;
    white-space: nowrap;
    z-index: 1000;
    pointer-events: none
  }

  .block-action-btn[data-tooltip]:hover::before {
    content: '';
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    margin-bottom: 2px;
    border: 5px solid transparent;
    border-top-color: #1f2937;
    z-index: 1000;
    pointer-events: none
  }

  /* preview column */
  .preview-list {
    display: flex;
    flex-direction: column;
    gap: 12px
  }

  .preview-item {
    background: var(--card);
    padding: 8px;
    border-radius: 8px;
    display: flex;
    gap: 10px;
    align-items: center;
    border: 1px solid #eef2f7;
    cursor: grab
  }

  .preview-item img {
    width: 100px;
    height: 60px;
    object-fit: cover;
    border-radius: 6px
  }

  .small {
    font-size: 13px;
    color: var(--muted)
  }

  .meta {
    font-size: 13px;
    color: #334155
  }

  /* responsive */
  @media (max-width:900px) {
    .container {
      flex-direction: column
    }

    .right {
      width: 100%
    }
  }

  /* Ẩn toolbar khi block không được chọn */
  .block .toolbar {
    opacity: 1;
    transition: opacity 0.15s ease;
  }

  .block.inactive .toolbar {
    opacity: 0;
    pointer-events: none;
  }

  /* AI Context Menu */
  .ai-context-menu {
    position: fixed;
    z-index: 10000;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    padding: 6px;
    min-width: 200px;
    display: none;
    opacity: 0;
    transform: scale(0.95) translateY(-10px);
    transition: all 0.15s ease;
    backdrop-filter: blur(10px);
  }

  .ai-context-menu.visible {
    display: block;
    opacity: 1;
    transform: scale(1) translateY(0);
  }

  .ai-context-menu-item {
    padding: 10px 14px;
    cursor: pointer;
    border-radius: 6px;
    font-size: 14px;
    color: #111;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: all 0.15s ease;
    margin: 2px 0;
  }

  .ai-context-menu-item:hover {
    background: #3b82f6;
    color: white;
    transform: translateX(2px);
  }

  .ai-context-menu-item.disabled {
    color: #9ca3af;
    cursor: not-allowed;
    pointer-events: none;
    opacity: 0.6;
  }

  .ai-context-menu-item.ai-option {
    color: #2563eb;
    font-weight: 500;
    border-left: 3px solid #2563eb;
  }

  .ai-context-menu-item.ai-option:hover {
    background: #2563eb;
    color: white;
    border-left-color: #1e40af;
  }

  .ai-context-menu-item.ai-quick-action {
    font-size: 13px;
    padding: 8px 12px;
  }

  .ai-context-menu-item.ai-quick-action:hover {
    background: #10b981;
    color: white;
  }

  /* Highlight selected text */
  ::selection {
    background: rgba(37, 99, 235, 0.2);
  }

  .contenteditable[contenteditable="true"]:focus {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
    border-radius: 4px;
  }

  /* AI Chat Modal */
  .ai-chat-modal {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 20000;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }

  .ai-chat-modal.active {
    display: flex;
  }

  .ai-chat-container {
    background: white;
    border-radius: 12px;
    width: 100%;
    max-width: 600px;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  }

  .ai-chat-header {
    padding: 16px 20px;
    border-bottom: 1px solid #e5e7eb;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .ai-chat-header h3 {
    margin: 0;
    font-size: 18px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .ai-chat-close {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #6b7280;
    padding: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
  }

  .ai-chat-close:hover {
    background: #f3f4f6;
    color: #111;
  }

  .ai-chat-body {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    min-height: 300px;
  }

  .ai-message {
    padding: 12px 16px;
    border-radius: 8px;
    max-width: 80%;
    word-wrap: break-word;
  }

  .ai-message.user {
    background: #2563eb;
    color: white;
    align-self: flex-end;
    margin-left: auto;
  }

  .ai-message.assistant {
    background: #f3f4f6;
    color: #111;
    align-self: flex-start;
  }

  .ai-chat-input-area {
    padding: 16px 20px;
    border-top: 1px solid #e5e7eb;
    display: flex;
    gap: 10px;
  }

  .ai-chat-input {
    flex: 1;
    padding: 10px 14px;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    font-size: 14px;
    font-family: 'Montserrat';
    resize: none;
    min-height: 44px;
    max-height: 120px;
  }

  .ai-chat-input:focus {
    outline: none;
    border-color: #2563eb;
  }

  .ai-chat-send {
    padding: 10px 20px;
    background: #2563eb;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
  }

  .ai-chat-send:hover {
    background: #1d4ed8;
  }

  .ai-chat-send:disabled {
    background: #9ca3af;
    cursor: not-allowed;
  }

  .ai-loading {
    display: flex;
    gap: 4px;
    align-items: center;
    color: #6b7280;
    font-size: 14px;
  }

  .ai-loading-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #6b7280;
    animation: bounce 1.4s infinite ease-in-out both;
  }

  .ai-loading-dot:nth-child(1) {
    animation-delay: -0.32s;
  }

  .ai-loading-dot:nth-child(2) {
    animation-delay: -0.16s;
  }

  @keyframes bounce {

    0%,
    80%,
    100% {
      transform: scale(0);
    }

    40% {
      transform: scale(1);
    }
  }

  /* Toast notifications */
  .toast {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 20px;
    background: #10b981;
    color: white;
    border-radius: 8px;
    z-index: 10000;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transition: all 0.3s ease;
    max-width: 300px;
  }

  .toast.error {
    background: #ef4444;
  }

  .toast.warning {
    background: #f59e0b;
  }

  /* Text selection highlight */
  .text-highlight {
    background: rgba(37, 99, 235, 0.3) !important;
    border-radius: 2px;
    padding: 1px 2px;
  }

  /* Paragraph spacing in contenteditable */
  .contenteditable p {
    margin: 0 0 8px 0;
  }

  .contenteditable p:last-child {
    margin-bottom: 0;
  }

  .contenteditable br {
    display: block;
    content: "";
    margin-bottom: 8px;
  }

  /* Image styling */
  .contenteditable img {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
    margin: 8px 0;
  }
</style>
</head>

<body>
  <div class="container">
    <div class="left">
      <div class="editor-header" style="display:flex;align-items:center;justify-content:space-between">
        <h2 style="margin:0">Soạn thảo / Nội dung</h2>
        <div>
          <button class="btn" id="btnPreview">Xem bản nháp</button>
          <button class="btn ghost" onclick="insertSampleImage()">+ Chèn ảnh</button>
        </div>
      </div>

      <div class="editor-area" id="blocks">
        <!-- Chỉ có 1 block duy nhất -->
        <?php foreach ($_SESSION['blocks'] as $b): ?>
          <div class="block" data-id="<?php echo $b['id'] ?>">
            <div class="toolbar">
              <button onclick="formatBlock('bold')"><b>B</b></button>
              <button onclick="formatBlock('italic')"><i>I</i></button>
              <button onclick="formatBlock('underline')"><u>U</u></button>
              <button onclick="formatBlock('insertUnorderedList')">• Danh sách</button>
              <button onclick="formatBlock('insertOrderedList')">1. Danh sách số</button>
              <select onchange="changeFontSize(this.value)">
                <option value="">Cỡ chữ</option>
                <option value="12px">12</option>
                <option value="14px">14</option>
                <option value="16px">16</option>
                <option value="18px">18</option>
                <option value="24px">24</option>
              </select>
              <input type="color" onchange="changeColor(this.value)" title="Màu chữ">
            </div>

            <div class="contenteditable" contenteditable="true"
              oninput="debounceSave('<?php echo $b['id'] ?>', this.innerHTML, 700)"
              onmouseup="handleTextSelection()"
              onkeyup="if(event.key==='ArrowLeft'||event.key==='ArrowRight'||event.key==='ArrowUp'||event.key==='ArrowDown') setTimeout(handleTextSelection, 50)"
              oncontextmenu="handleContextMenu(event, this)">
              <?php echo $b['content'] ?>
            </div>

            <div class="edit-note small">
              💡 Nhấn Enter để xuống dòng bình thường • Bôi đen văn bản và chuột phải để sử dụng AI
            </div>
          </div>
        <?php endforeach; ?>
      </div>
    </div>

    <div class="right">
      <h2>Ảnh tham khảo</h2>
      <div class="drop-hint">Double-click ảnh để chèn vào văn bản</div>

      <div class="preview-list" id="previewList">
        <div class="preview-item" data-src="https://via.placeholder.com/600x300?text=Ảnh+1">
          <img src="https://via.placeholder.com/200x120?text=1">
          <div class="meta">Ảnh 1</div>
        </div>
        <div class="preview-item" data-src="https://picsum.photos/seed/a/600/300">
          <img src="https://picsum.photos/seed/a/200/120">
          <div class="meta">Ảnh 2</div>
        </div>
        <div class="preview-item" data-src="https://picsum.photos/seed/b/600/300">
          <img src="https://picsum.photos/seed/b/200/120">
          <div class="meta">Ảnh 3</div>
        </div>
      </div>

      <hr style="margin:12px 0">

      <h3>Thêm ảnh bằng URL</h3>
      <div style="display:flex;gap:8px">
        <input id="imgUrl" placeholder="https://..." style="flex:1;padding:8px;border-radius:6px;border:1px solid #e5e7eb">
        <button class="btn" onclick="addImageByUrl()">Thêm</button>
      </div>
      <div class="small" style="margin-top:8px">Ảnh sẽ được chèn vào vị trí con trỏ.</div>
    </div>
  </div>

  <!-- AI Context Menu -->
  <div class="ai-context-menu" id="aiContextMenu">
    <!-- Will be populated by JavaScript -->
  </div>

  <!-- AI Chat Modal -->
  <div class="ai-chat-modal" id="aiChatModal">
    <div class="ai-chat-container">
      <div class="ai-chat-header">
        <h3><span>🤖</span> AI Trợ lý chỉnh sửa</h3>
        <button class="ai-chat-close" onclick="closeAiChat()">×</button>
      </div>
      <div class="ai-chat-body" id="aiChatBody">
        <div class="ai-message assistant">
          Xin chào! Tôi có thể giúp bạn chỉnh sửa văn bản đã chọn. Hãy cho tôi biết bạn muốn làm gì?
        </div>
      </div>
      <div class="ai-chat-input-area">
        <textarea
          class="ai-chat-input"
          id="aiChatInput"
          placeholder="Nhập yêu cầu của bạn... (ví dụ: Làm cho ngắn gọn hơn, Viết lại, Thêm từ khóa SEO...)"
          rows="2"
          onkeydown="handleAiChatKeyDown(event)"></textarea>
        <button class="ai-chat-send" id="aiChatSend" onclick="sendAiMessage()">Gửi</button>
      </div>
    </div>
  </div>

  <script>
    /* ---------- Utility AJAX ---------- */
    function ajaxPost(data) {
      return fetch('', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams(data)
        })
        .then(r => r.json());
    }

    /* ---------- Save edit ---------- */
    function saveEdit(id, html) {
      ajaxPost({
        action: 'edit',
        id: id,
        content: html
      }).then(res => {
        if (!res.ok) console.warn('Lưu thất bại', res.msg);
      });
    }

    /* debounce save on typing */
    let debounceTimers = {};

    function debounceSave(id, html, ms) {
      if (debounceTimers[id]) clearTimeout(debounceTimers[id]);
      debounceTimers[id] = setTimeout(() => {
        saveEdit(id, html);
      }, ms);
    }

    /* ---------- Format commands (toolbar) ---------- */
    function formatBlock(cmd) {
      const el = document.querySelector('.contenteditable');
      el.focus();
      document.execCommand(cmd, false, null);
      saveEdit('single_block', el.innerHTML);
    }

    function changeFontSize(size) {
      const el = document.querySelector('.contenteditable');
      el.focus();
      if (!size) return;
      document.execCommand('fontSize', false, 7);
      el.innerHTML = el.innerHTML.replace(/<font[^>]*size="7"[^>]*>(.*?)<\/font>/gi, '<span style="font-size:' + size + '">$1</span>');
      saveEdit('single_block', el.innerHTML);
    }

    function changeColor(color) {
      const el = document.querySelector('.contenteditable');
      el.focus();
      document.execCommand('foreColor', false, color);
      saveEdit('single_block', el.innerHTML);
    }

    /* ---------- Insert sample image ---------- */
    function insertSampleImage() {
      const el = document.querySelector('.contenteditable');
      el.focus();

      const images = [
        'https://picsum.photos/400/200?random=1',
        'https://picsum.photos/400/200?random=2',
        'https://picsum.photos/400/200?random=3'
      ];

      const randomImage = images[Math.floor(Math.random() * images.length)];
      const imgHTML = `<img src="${randomImage}" alt="Ảnh mẫu">`;

      document.execCommand('insertHTML', false, imgHTML);
      saveEdit('single_block', el.innerHTML);
      showToast('Đã chèn ảnh mẫu');
    }

    /* ---------- Add image by URL ---------- */
    function addImageByUrl() {
      const url = document.getElementById('imgUrl').value.trim();
      if (!url) return alert('Nhập URL ảnh');

      const el = document.querySelector('.contenteditable');
      el.focus();

      const imgHTML = `<img src="${url}" alt="Ảnh từ URL">`;
      document.execCommand('insertHTML', false, imgHTML);
      saveEdit('single_block', el.innerHTML);

      document.getElementById('imgUrl').value = '';
      showToast('Đã chèn ảnh từ URL');
    }

    /* ---------- Show preview ---------- */
    document.getElementById('btnPreview').addEventListener('click', () => {
      const el = document.querySelector('.contenteditable');
      const content = el.innerHTML;

      const w = window.open('', '_blank');
      w.document.open();
      w.document.write(`
    <!doctype html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Preview</title>
      <meta name="viewport" content="width=device-width,initial-scale=1">
      <style>
        body { 
          font-family: 'Montserrat';
          padding: 20px; 
          line-height: 1.6; 
          max-width: 900px; 
          margin: 0 auto;
        }
        img { 
          max-width: 100%; 
          height: auto;
          border-radius: 8px;
          margin: 10px 0;
        }
      </style>
    </head>
    <body>
      ${content}
    </body>
    </html>
  `);
      w.document.close();
    });

    /* ---------- AI Text Selection & Context Menu ---------- */
    let selectedTextData = {
      text: '',
      blockId: '',
      range: null
    };

    const aiContextMenu = document.getElementById('aiContextMenu');
    const aiChatModal = document.getElementById('aiChatModal');
    const aiChatBody = document.getElementById('aiChatBody');
    const aiChatInput = document.getElementById('aiChatInput');
    const aiChatSend = document.getElementById('aiChatSend');

    // Các quick actions AI
    const aiQuickActions = {
      summarize: {
        name: "Tóm tắt",
        prompt: "Hãy tóm tắt đoạn văn bản này một cách ngắn gọn, súc tích:"
      },
      rewrite: {
        name: "Viết lại",
        prompt: "Hãy viết lại đoạn văn bản này theo cách khác nhưng giữ nguyên ý nghĩa:"
      },
      expand: {
        name: "Mở rộng",
        prompt: "Hãy mở rộng và phát triển thêm ý cho đoạn văn bản này:"
      },
      simplify: {
        name: "Đơn giản hóa",
        prompt: "Hãy đơn giản hóa đoạn văn bản này để dễ hiểu hơn:"
      },
      formal: {
        name: "Trang trọng hóa",
        prompt: "Hãy chuyển đổi đoạn văn bản này sang văn phong trang trọng:"
      },
      casual: {
        name: "Thân thiện hóa",
        prompt: "Hãy chuyển đổi đoạn văn bản này sang văn phong thân thiện, gần gũi:"
      }
    };

    // Khởi tạo context menu với quick actions
    function initAiContextMenu() {
      const mainItem = document.createElement('div');
      mainItem.className = 'ai-context-menu-item ai-option';
      mainItem.id = 'aiMenuItem';
      mainItem.innerHTML = '<span>🤖</span><span>AI chỉnh sửa (chọn văn bản trước)</span>';
      mainItem.onclick = openAiChatFromContext;

      aiContextMenu.appendChild(mainItem);

      // Thêm separator
      const separator = document.createElement('div');
      separator.style.height = '1px';
      separator.style.background = '#e5e7eb';
      separator.style.margin = '4px 0';
      aiContextMenu.appendChild(separator);

      // Thêm quick actions
      Object.entries(aiQuickActions).forEach(([key, action]) => {
        const item = document.createElement('div');
        item.className = 'ai-context-menu-item ai-quick-action';
        item.innerHTML = `<span>⚡</span><span>${action.name}</span>`;
        item.onclick = () => executeQuickAiAction(key, action);
        aiContextMenu.appendChild(item);
      });
    }

    // Lưu thông tin văn bản đã chọn
    function handleTextSelection() {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) {
        return;
      }

      const range = selection.getRangeAt(0);
      const selectedText = selection.toString().trim();

      const block = document.querySelector('.block');
      if (!block || selectedText.length === 0) {
        selectedTextData = {
          text: '',
          blockId: '',
          range: null
        };
        return;
      }

      const blockId = block.dataset.id;
      const editableEl = document.querySelector('.contenteditable');
      if (!editableEl || editableEl.contentEditable !== 'true') {
        selectedTextData = {
          text: '',
          blockId: '',
          range: null
        };
        return;
      }

      selectedTextData = {
        text: selectedText,
        blockId: blockId,
        range: range.cloneRange()
      };
    }

    // Hiển thị context menu khi chuột phải
    function showAiContextMenu(e, sourceEditable) {
      if (e && e.preventDefault) {
        e.preventDefault();
        e.stopPropagation();
      }

      const editableEl = sourceEditable || (e ? e.target.closest('.contenteditable') : null);
      if (!editableEl || editableEl.contentEditable !== 'true') {
        hideAiContextMenu();
        return;
      }

      const block = document.querySelector('.block');
      if (!block) {
        hideAiContextMenu();
        return;
      }

      const blockId = block.dataset.id;
      if (!blockId) {
        hideAiContextMenu();
        return;
      }

      const selection = window.getSelection();
      const selectedText = selection ? selection.toString().trim() : '';
      const hasSelectedText = selectedText.length > 0;

      if (hasSelectedText && selection.rangeCount > 0) {
        selectedTextData = {
          text: selectedText,
          blockId: blockId,
          range: selection.getRangeAt(0).cloneRange()
        };

        highlightSelectedText(selection.getRangeAt(0));
      } else {
        selectedTextData = {
          text: '',
          blockId: '',
          range: null
        };
      }

      const aiMenuItem = document.getElementById('aiMenuItem');
      if (aiMenuItem) {
        if (hasSelectedText) {
          aiMenuItem.classList.remove('disabled');
          aiMenuItem.innerHTML = '<span>🤖</span><span>AI chỉnh sửa: "' +
            (selectedText.length > 20 ? selectedText.substring(0, 20) + '...' : selectedText) + '"</span>';
        } else {
          aiMenuItem.classList.add('disabled');
          aiMenuItem.innerHTML = '<span>🤖</span><span>AI chỉnh sửa (chọn văn bản trước)</span>';
        }
      }

      const menuX = Math.min(e.clientX, window.innerWidth - 220);
      const menuY = Math.min(e.clientY, window.innerHeight - 150);

      aiContextMenu.style.top = menuY + 'px';
      aiContextMenu.style.left = menuX + 'px';
      aiContextMenu.classList.add('visible');

      editableEl.focus();
    }

    // Hàm highlight text được chọn
    function highlightSelectedText(range) {
      const highlightSpan = document.createElement('span');
      highlightSpan.className = 'text-highlight';

      try {
        range.surroundContents(highlightSpan);

        setTimeout(() => {
          if (highlightSpan.parentNode) {
            const parent = highlightSpan.parentNode;
            while (highlightSpan.firstChild) {
              parent.insertBefore(highlightSpan.firstChild, highlightSpan);
            }
            parent.removeChild(highlightSpan);
          }
        }, 5000);
      } catch (e) {
        console.log('Cannot highlight selection');
      }
    }

    // Ẩn context menu
    function hideAiContextMenu() {
      aiContextMenu.classList.remove('visible');
    }

    // Mở popup chat AI từ context menu
    function openAiChatFromContext() {
      if (!selectedTextData.text || !selectedTextData.blockId) {
        alert('Vui lòng chọn văn bản trước');
        hideAiContextMenu();
        return;
      }

      hideAiContextMenu();
      openAiChat();
    }

    // Thực hiện quick AI action
    async function executeQuickAiAction(actionKey, action) {
      if (!selectedTextData.text || !selectedTextData.blockId) {
        alert('Vui lòng chọn văn bản trước');
        hideAiContextMenu();
        return;
      }

      hideAiContextMenu();

      const el = document.querySelector('.contenteditable');

      try {
        const response = await ajaxPost({
          action: 'ai_chat',
          selected_text: selectedTextData.text,
          message: action.prompt,
          block_id: selectedTextData.blockId
        });

        if (response.ok && response.response) {
          const selection = window.getSelection();
          if (selection.rangeCount > 0 && selectedTextData.range) {
            selection.removeAllRanges();
            selection.addRange(selectedTextData.range);
            document.execCommand('insertHTML', false, response.response);
            saveEdit('single_block', el.innerHTML);
          }

          showToast(`Đã ${action.name.toLowerCase()} văn bản thành công!`);
        } else {
          throw new Error(response.msg || 'Lỗi không xác định');
        }
      } catch (error) {
        console.error('AI Action error:', error);
        showToast('Lỗi khi xử lý văn bản: ' + error.message, 'error');
      }
    }

    // Mở popup chat AI
    function openAiChat() {
      if (!selectedTextData.text || !selectedTextData.blockId) {
        alert('Vui lòng chọn văn bản trước');
        return;
      }

      aiChatModal.classList.add('active');
      aiChatInput.focus();

      const welcomeMsg = aiChatBody.querySelector('.ai-message.assistant');
      aiChatBody.innerHTML = '';
      if (welcomeMsg) {
        aiChatBody.appendChild(welcomeMsg);
      }

      const selectedMsg = document.createElement('div');
      selectedMsg.className = 'ai-message assistant';
      selectedMsg.innerHTML = `<strong>Văn bản đã chọn:</strong><br>"${selectedTextData.text.substring(0, 100)}${selectedTextData.text.length > 100 ? '...' : ''}"`;
      aiChatBody.appendChild(selectedMsg);

      aiChatBody.scrollTop = aiChatBody.scrollHeight;
    }

    // Đóng popup chat AI
    function closeAiChat() {
      aiChatModal.classList.remove('active');
      aiChatInput.value = '';
    }

    // Gửi message đến AI
    async function sendAiMessage() {
      const message = aiChatInput.value.trim();
      if (!message || !selectedTextData.text || !selectedTextData.blockId) {
        return;
      }

      aiChatInput.disabled = true;
      aiChatSend.disabled = true;

      const userMsg = document.createElement('div');
      userMsg.className = 'ai-message user';
      userMsg.textContent = message;
      aiChatBody.appendChild(userMsg);
      aiChatInput.value = '';

      aiChatBody.scrollTop = aiChatBody.scrollHeight;

      const loadingMsg = document.createElement('div');
      loadingMsg.className = 'ai-message assistant ai-loading';
      loadingMsg.innerHTML = '<div class="ai-loading-dot"></div><div class="ai-loading-dot"></div><div class="ai-loading-dot"></div>';
      aiChatBody.appendChild(loadingMsg);
      aiChatBody.scrollTop = aiChatBody.scrollHeight;

      try {
        const response = await ajaxPost({
          action: 'ai_chat',
          selected_text: selectedTextData.text,
          message: message,
          block_id: selectedTextData.blockId
        });

        loadingMsg.remove();

        if (response.ok && response.response) {
          const aiMsg = document.createElement('div');
          aiMsg.className = 'ai-message assistant';
          aiMsg.innerHTML = response.response;
          aiChatBody.appendChild(aiMsg);

          const applyBtn = document.createElement('button');
          applyBtn.className = 'btn';
          applyBtn.style.marginTop = '8px';
          applyBtn.textContent = 'Áp dụng vào văn bản';
          applyBtn.onclick = () => applyAiResponse(response.response, selectedTextData);
          aiMsg.appendChild(applyBtn);
        } else {
          const errorMsg = document.createElement('div');
          errorMsg.className = 'ai-message assistant';
          errorMsg.textContent = 'Lỗi: ' + (response.msg || 'Không thể xử lý yêu cầu');
          aiChatBody.appendChild(errorMsg);
        }
      } catch (error) {
        loadingMsg.remove();
        const errorMsg = document.createElement('div');
        errorMsg.className = 'ai-message assistant';
        errorMsg.textContent = 'Lỗi kết nối: ' + error.message;
        aiChatBody.appendChild(errorMsg);
      }

      aiChatInput.disabled = false;
      aiChatSend.disabled = false;
      aiChatInput.focus();
      aiChatBody.scrollTop = aiChatBody.scrollHeight;
    }

    // Áp dụng kết quả AI vào văn bản
    function applyAiResponse(aiText, data) {
      const el = document.querySelector('.contenteditable');
      if (!el) return;

      const selection = window.getSelection();
      if (selection.rangeCount > 0 && data.range) {
        try {
          selection.removeAllRanges();
          selection.addRange(data.range);
          document.execCommand('insertHTML', false, aiText);

          saveEdit('single_block', el.innerHTML);

          closeAiChat();
          hideAiContextMenu();
        } catch (e) {
          el.innerHTML = aiText;
          saveEdit('single_block', el.innerHTML);
          closeAiChat();
          hideAiContextMenu();
        }
      }
    }

    // Handle Enter key trong chat input
    function handleAiChatKeyDown(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendAiMessage();
      }
    }

    // Hàm hiển thị toast message
    function showToast(message, type = 'success') {
      const toast = document.createElement('div');
      toast.className = `toast ${type === 'error' ? 'error' : ''}`;
      toast.textContent = message;

      document.body.appendChild(toast);

      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100px)';
        setTimeout(() => {
          if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
          }
        }, 300);
      }, 3000);
    }

    // Helper function cho context menu
    function handleContextMenu(e, editableEl) {
      showAiContextMenu(e, editableEl);
    }

    // Double click để chèn ảnh từ preview
    document.querySelectorAll('.preview-item').forEach(pi => {
      pi.addEventListener('dblclick', () => {
        const url = pi.dataset.src;
        const el = document.querySelector('.contenteditable');
        el.focus();

        const imgHTML = `<img src="${url}" alt="Ảnh từ thư viện">`;
        document.execCommand('insertHTML', false, imgHTML);
        saveEdit('single_block', el.innerHTML);

        showToast('Đã chèn ảnh từ thư viện');
      });
    });

    /* ---------- Khởi tạo khi trang load ---------- */
    document.addEventListener('DOMContentLoaded', function() {
      // Khởi tạo AI context menu
      initAiContextMenu();

      // Context menu event
      document.addEventListener('contextmenu', (e) => {
        const target = e.target;
        const editableEl = target.closest('.contenteditable');
        if (editableEl && editableEl.contentEditable === 'true') {
          showAiContextMenu(e, editableEl);
          return;
        }
        hideAiContextMenu();
      });

      // Click outside để ẩn context menu
      document.addEventListener('click', (e) => {
        if (!aiContextMenu.contains(e.target) && !aiChatModal.contains(e.target)) {
          hideAiContextMenu();
        }
      });

      // Ẩn context menu khi scroll
      document.addEventListener('scroll', hideAiContextMenu);

      // Close modal khi click background
      aiChatModal.addEventListener('click', (e) => {
        if (e.target === aiChatModal) {
          closeAiChat();
        }
      });

      console.log('Single block editor initialized with AI features');
    });
  </script>
</body>

</html>