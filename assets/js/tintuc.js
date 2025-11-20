/* ---------- Utility AJAX ---------- */
function ajaxPost(data){ 
  return fetch('', { method:'POST', headers:{'Content-Type':'application/x-www-form-urlencoded'}, body:new URLSearchParams(data) })
         .then(r => r.json());
}

/* ---------- Add text ---------- */
document.getElementById('btnAddText').addEventListener('click', () => {
  ajaxPost({action:'add_text', text:'<p>Nội dung mới</p>'}).then(res=>{
    if(!res.ok) return alert('Lỗi thêm text');
    // reload blocks từ server để đồng bộ (đơn giản)
    location.reload();
  });
});

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

/* ---------- Drag & reorder blocks + drop thêm ảnh ---------- */
const blocksEl = document.getElementById('blocks');
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

function sendOrderToServer(){
  const ids = [...blocksEl.querySelectorAll('.block')].map(el => el.dataset.id);
  ajaxPost({action:'reorder', order: JSON.stringify(ids)}).then(res=>{
    if(!res.ok) console.warn('Reorder lỗi', res.msg);
  });
}

/* ---------- Preview ---------- */
document.getElementById('btnPreview').addEventListener('click', ()=>{
  ajaxPost({action:'get'}).then(res=>{
    if(!res.ok) return alert('Không lấy được dữ liệu preview');
    let html = '<!doctype html><html><head><meta charset="utf-8"><title>Preview</title><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{font-family:Arial;padding:20px;line-height:1.6;max-width:900px;margin:0 auto}img{max-width:100%}</style></head><body>';
    res.blocks.forEach(b=>{
      if(b.type === 'text') html += b.content;
      else if(b.type === 'code') html += '<pre><code>'+b.content+'</code></pre>';
      else html += '<p><img src="'+b.content+'" alt=""></p>';
    });
    html += '</body></html>';
    const w = window.open('', '_blank');
    w.document.open();
    w.document.write(html);
    w.document.close();
  });
});

/* ---------- Preview items drag (RIGHT column) ---------- */
/* Now dragging preview-item WILL add image if dropped into editor */
document.querySelectorAll('.preview-item').forEach(pi=>{
  pi.addEventListener('dragstart', e=>{
    e.dataTransfer.setData('text/plain', pi.dataset.src);
    e.dataTransfer.effectAllowed = 'copy';
  });
  // double click to copy URL into input
  pi.addEventListener('dblclick', ()=> {
    const url = pi.dataset.src;
    document.getElementById('imgUrl').value = url;
  });
});

/* ---------- Init: attach drag handlers for any new blocks created server-side --- */
(function initAttach(){
  document.querySelectorAll('.block').forEach(attachDragForBlock);
})();
