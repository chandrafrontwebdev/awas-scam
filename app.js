/* =========================================
   APP.JS - AWAS-SCAM! ULTIMATE EDITION (V5)
========================================= */

let threatStack = JSON.parse(localStorage.getItem('awasScamThreatStack')) || []; 

// Database Blacklist Ultimate
const scamKeywords = [
    '.apk', 'undangan digital', 'undangan pernikahan.apk', 'cek resi', 'paket anda', 
    'kurir j&t', 'kurir jne', 'surat tilang', 'tagihan pln', 'tagihan pajak', 
    'rekening diblokir', 'klik link ini', 'buka tautan', 'maxwin', 'gacor', 'slot', 
    'judol', 'judi', 'modal receh', 'depo', 'wd', 'scatter', 'zeus', 'mahjong', 
    'olympus', 'pola rtp', 'rtp live', 'jackpot', 'pinjol', 'dana cair', 
    'hadiah uang tunai', 'salah transfer', 'kode otp'
];

// Tangkap semua elemen HTML
const navScanner = document.getElementById('nav-scanner');
const navHistory = document.getElementById('nav-history');
const pageScanner = document.getElementById('page-scanner');
const pageHistory = document.getElementById('page-history');
const btnClearHistory = document.getElementById('btn-clear-history');
const tabText = document.getElementById('tab-text');
const tabImage = document.getElementById('tab-image');
const textInputArea = document.getElementById('text-input-area');
const imageInputArea = document.getElementById('image-input-area');
const messageInput = document.getElementById('message-input');
const imageUpload = document.getElementById('image-upload');
const imagePreview = document.getElementById('image-preview');
const previewText = document.getElementById('preview-text');
const btnScan = document.getElementById('btn-scan');
const scanStatus = document.getElementById('scan-status');
const ocrLoading = document.getElementById('ocr-loading');
const extractedTextDisplay = document.getElementById('extracted-text-display');
const threatStackContainer = document.getElementById('threat-stack-container');

// Elemen Fitur Baru
const scamCountDisplay = document.getElementById('scam-count');
const detectedKeywordDisplay = document.getElementById('detected-keyword-display');
const btnShareWA = document.getElementById('btn-share-wa');

let currentMode = 'text';
let uploadedImage = null;

// Navigasi SPA
navScanner.addEventListener('click', () => {
    navScanner.classList.add('active'); navHistory.classList.remove('active');
    pageScanner.classList.remove('hidden'); pageHistory.classList.add('hidden');
});
navHistory.addEventListener('click', () => {
    navHistory.classList.add('active'); navScanner.classList.remove('active');
    pageHistory.classList.remove('hidden'); pageScanner.classList.add('hidden');
    renderThreatStack();
});

// Switch Tab
tabText.addEventListener('click', () => {
    currentMode = 'text'; tabText.classList.add('active'); tabImage.classList.remove('active');
    textInputArea.classList.remove('hidden'); imageInputArea.classList.add('hidden');
});
tabImage.addEventListener('click', () => {
    currentMode = 'image'; tabImage.classList.add('active'); tabText.classList.remove('active');
    imageInputArea.classList.remove('hidden'); textInputArea.classList.add('hidden');
});

// Upload Gambar
imageUpload.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        uploadedImage = file;
        const reader = new FileReader();
        reader.onload = function(e) {
            imagePreview.src = e.target.result;
            imagePreview.style.display = 'block'; previewText.style.display = 'none';
        }
        reader.readAsDataURL(file);
    }
});

// Aksi Scan Utama
btnScan.addEventListener('click', async () => {
    scanStatus.className = 'status-box standby';
    scanStatus.innerText = 'MEMPROSES DATA...';
    extractedTextDisplay.classList.add('hidden');
    detectedKeywordDisplay.classList.add('hidden');
    btnShareWA.classList.add('hidden');
    
    let textToScan = "";

    if (currentMode === 'text') {
        textToScan = messageInput.value.trim();
        if (!textToScan) { alert("Masukkan teks dulu, bro!"); scanStatus.innerText = 'MENUNGGU INPUT...'; return; }
        processScan(textToScan);
    } else if (currentMode === 'image') {
        if (!uploadedImage) { alert("Upload gambar dulu, bro!"); scanStatus.innerText = 'MENUNGGU INPUT...'; return; }
        ocrLoading.classList.remove('hidden'); scanStatus.innerText = 'MENGEKSTRAK TEKS...'; btnScan.disabled = true;
        try {
            const result = await Tesseract.recognize(uploadedImage, 'ind');
            textToScan = result.data.text.trim();
            ocrLoading.classList.add('hidden'); btnScan.disabled = false;
            if (!textToScan) { scanStatus.className = 'status-box standby'; scanStatus.innerText = 'GAGAL MEMBACA TEKS.'; return; }
            extractedTextDisplay.innerText = "Teks Terdeteksi:\n" + textToScan;
            extractedTextDisplay.classList.remove('hidden');
            processScan(textToScan);
        } catch (error) {
            ocrLoading.classList.add('hidden'); btnScan.disabled = false; scanStatus.innerText = 'ERROR SAAT MEMBACA GAMBAR.';
        }
    }
});

// Algoritma Bedah Modus & Stack
function processScan(text) {
    const lowerText = text.toLowerCase();
    const caughtKeywords = scamKeywords.filter(keyword => lowerText.includes(keyword));

    if (caughtKeywords.length > 0) {
        scanStatus.className = 'status-box danger';
        scanStatus.innerText = '🚨 BAHAYA! TERDETEKSI MODUS PENIPUAN 🚨';
        
        // Tampilkan Keyword (Fitur 2)
        detectedKeywordDisplay.innerHTML = `⚠️ KATA KUNCI: <span style="color: #ff3131;">[ ${caughtKeywords.join(' / ')} ]</span>`;
        detectedKeywordDisplay.classList.remove('hidden');
        
        // Atur URL WhatsApp (Fitur 3)
        let waText = encodeURIComponent(`🚨 PERINGATAN SCAM!\nPesan berikut terdeteksi sebagai PENIPUAN oleh AwasScam!:\n\n"${text}"\n\n⚠️ Modus Terdeteksi: ${caughtKeywords.join(', ')}\nHarap waspada dan jangan diklik!`);
        btnShareWA.href = `https://api.whatsapp.com/send?text=${waText}`;
        btnShareWA.classList.remove('hidden');

        // LIFO Action
        threatStack.push(text);
        localStorage.setItem('awasScamThreatStack', JSON.stringify(threatStack));
        if (currentMode === 'text') { messageInput.value = ""; }
        
        renderThreatStack();
    } else {
        scanStatus.className = 'status-box safe';
        scanStatus.innerText = '✅ AMAN. TIDAK ADA INDIKASI PENIPUAN.';
    }
}

// Render UI
function renderThreatStack() {
    // FITUR 1: STATISTIK (Ini yang tadi macet bro, sekarang udah fix!)
    if(scamCountDisplay) {
        scamCountDisplay.innerText = threatStack.length;
    }

    threatStackContainer.innerHTML = ""; 
    if (threatStack.length === 0) {
        threatStackContainer.innerHTML = '<div class="stack-card empty-msg">Tumpukan ancaman masih kosong.</div>';
        return;
    }

    for (let i = threatStack.length - 1; i >= 0; i--) {
        const stackCard = document.createElement('div');
        stackCard.className = 'stack-card';
        let snippet = threatStack[i].length > 100 ? threatStack[i].substring(0, 100) + "..." : threatStack[i];
        stackCard.innerText = `[KASUS #${i + 1}] ${snippet}`;
        threatStackContainer.appendChild(stackCard);
    }
}

// Clear Memory
btnClearHistory.addEventListener('click', () => {
    if (confirm("Kosongkan seluruh tumpukan data karantina?")) {
        threatStack = []; localStorage.removeItem('awasScamThreatStack'); renderThreatStack();
    }
});

// Eksekusi render pertama saat web dibuka
renderThreatStack();