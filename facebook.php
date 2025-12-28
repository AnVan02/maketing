<?php require "thanh-dieu-huong.php" ?>

<link rel="stylesheet" href="./css/thanh-dieu-huong.css">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
<link rel="stylesheet" href="./css/facebook.css">

<div class="app-body">
     <main class="content-area">
          <div class="page-header">
               <h1 class="page-title">Cấu hình bài Facebook</h1>
               <div class="step-indicator">Bước 1/3</div>
          </div>

          <div class="tip-box">
               <img src="https://img.icons8.com/color/48/000000/light-bulb.png" alt="Tip" class="tip-icon">
               <p><strong>Mẹo:</strong> Nội dung càng rõ ràng, bài Facebook càng dễ chạm đúng người bạn muốn!</p>
          </div>

          <div class="gird-layout">
               <!-- Cột trái -->
               <div class="card">
                    <h2 class="card-title">Thông tin cơ bản</h2>
                    <div class="form-group">
                         <label>Yêu cầu đầu vào *</label>
                         <textarea id="input-idea" placeholder="Ví dụ: giới thiệu laptop ROSA made in Vietnam...">Trí ân Ngày Nhà giáo Việt Nam</textarea>
                    </div>

                    <h2 class="card-title">Cấu hình nội dung</h2>
                    <div class="form-group">
                         <label>Độ dài bài viết</label>
                         <select id="length">
                              <option selected>Ngắn (50-200 từ)</option>
                              <option>Dài hơn (200-500 từ)</option>
                              <option>Rất dài (>500 từ)</option>
                         </select>
                    </div>

                    <div class="form-group">
                         <label>Loại bài viết</label>
                         <select id="type">
                              <option selected>Bài quảng cáo</option>
                              <option>Bài thông thường</option>
                              <option>Bài kể chuyện</option>
                         </select>
                    </div>

                    <div class="form-group">
                         <label>Tone giọng</label>
                         <select id="tone">
                              <option selected>Chuyên nghiệp, đáng tin cậy</option>
                              <option>Thân thiện, gần gũi</option>
                              <option>Hài hước</option>
                              <option>Cảm xúc</option>
                         </select>
                    </div>

                    <div class="form-group">
                         <label>Model</label>
                         <select id="model">
                              <option selected>Gemini 2.5 Pro</option>
                         </select>
                         <label style="display:inline-block;margin-top:8px;">Ngôn ngữ</label>
                         <select id="language">
                              <option selected>Tiếng Việt</option>
                         </select>
                    </div>

                    <div class="form-group">
                         <div class="checkbox-group">
                              <input type="checkbox" id="emoji">
                              <label for="emoji">Đi kèm biểu tượng (emoji)</label>
                         </div>
                         <div class="checkbox-group">
                              <input type="checkbox" id="hashtag" checked>
                              <label for="hashtag">Đi kèm thẻ bắt đầu hashtag</label>
                         </div>
                         <div class="checkbox-group">
                              <input type="checkbox" id="image" checked>
                              <label for="image">Đi kèm hình ảnh</label>
                         </div>
                    </div>

                    <div class="form-group">
                         <div class="image-upload-area" id="upload-area">
                              <i class="fas fa-cloud-upload-alt" style="font-size:40px;color:#1877f2;"></i>
                              <p>Tải ảnh bằng trợ lý AI5</p>
                         </div>
                         <input type="file" id="image-input" accept="image/*" style="display:none;">
                    </div>

                    <button class="preview-btn" id="preview-btn">Xem trước →</button>
               </div>

               <!-- Cột phải -->
               <div class="card preview-card">
                    <div class="preview-header">
                         <h2 class="card-title">Xem trước bài viết</h2>
                         <div>
                              <button class="preview-btn-small" id="reset-btn">Khởi phục</button>
                              <button class="preview-btn-small" style="margin-left:8px;" id="guide-btn">Hướng dẫn</button>
                         </div>
                    </div>

                    <div class="facebook-post-wrapper">
                         <div class="facebook-post">
                              <div class="post-header">
                                   <img src="https://via.placeholder.com/40?text=R" class="avatar" id="preview-avatar" alt="Avatar">
                                   <div class="user-info">
                                        <div class="user-name" id="preview-name">ROSA AI Computer</div>
                                        <div class="post-time">Vừa xong</div>
                                   </div>
                              </div>

                              <div class="post-content" id="preview-content">
                                   ROSA chính thức ra mắt dòng laptop made in Vietnam đầu tiên. Đánh dấu bước đi tiên lực mới trên hành trình chinh phục công nghệ!
                              </div>

                              <img src="" class="post-image" id="preview-image" alt="Post image">

                              <div class="post-stats">
                                   <span>1 Bình luận . 46 Lượt chia sẻ</span>
                                   <span>36K lượt yêu thích</span>
                              </div>

                              <div class="post-actions">
                                   <div class="action-btn"><i class="fas fa-thumbs-up"></i> Thích</div>
                                   <div class="action-btn"><i class="fas fa-comment"></i> Bình luận</div>
                                   <div class="action-btn"><i class="fas fa-share"></i> Chia sẻ</div>
                              </div>
                         </div>
                    </div>
               </div>
          </div>
     </main>
</div>

<script src="./js/thanh-dieu-huong.js"></script>
<script src="./js/facebook.js"></script>