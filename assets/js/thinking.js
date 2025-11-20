let currentStep = 3;
let progressPercent = 40;

function updateProgress(step, percent) {
    currentStep = step;
    progressPercent = percent;
    
    document.querySelector('.progress-line-filled').style.width = percent + '%';
    
    const steps = document.querySelectorAll('.step');
    const stepCards = document.querySelectorAll('.step-card');
    
    steps.forEach((stepEl, index) => {
        const stepNum = index + 1;
        const circle = stepEl.querySelector('.step-circle');
        
        stepEl.classList.remove('completed', 'active', 'inactive');
        
        if (stepNum < currentStep) {
            stepEl.classList.add('completed');
            circle.innerHTML = '✓';
        } else if (stepNum === currentStep) {
            stepEl.classList.add('active');
            circle.innerHTML = '⚙';
        } else {
            stepEl.classList.add('inactive');
            circle.innerHTML = stepNum;
        }
    });
    
    stepCards.forEach((card, index) => {
        const stepNum = index + 1;
        const status = card.querySelector('.step-status');
        
        card.classList.remove('completed', 'active', 'inactive');
        
        if (stepNum < currentStep) {
            card.classList.add('completed');
            status.innerHTML = '✓';
        } else if (stepNum === currentStep) {
            card.classList.add('active');
            status.innerHTML = '⚙';
        } else {
            card.classList.add('inactive');
            status.innerHTML = stepNum;
        }
    });
    
    const titles = [
        'ĐANG NGHIÊN CỨU TỪ KHÓA',
        'ĐANG TỔNG HỢP THÔNG TIN',
        'ĐANG PHÁT TRIỂN NỘI DUNG',
        'ĐANG KIỂM TRA & SỬA LỖI',
        'HOÀN TẤT'
    ];
    document.querySelector('.main-title').textContent = titles[currentStep - 1];
}

function autoProgress() {
    let step = 1;
    let percent = 0;
    
    const interval = setInterval(() => {
        percent += 2;
        
        if (percent >= 25 && step === 1) step = 2;
        if (percent >= 50 && step === 2) step = 3;
        if (percent >= 75 && step === 3) step = 4;
        if (percent >= 100 && step === 4) step = 5;
        
        updateProgress(step, Math.min(percent, 100));
        
        if (percent >= 100) {
            clearInterval(interval);
            document.querySelector('.time-info').innerHTML = '<span style="color: #4CAF50; font-weight: bold;">✓ Đã hoàn thành!</span>';
        }
    }, 100);
}