// ============================================================
// ad.js - HỆ THỐNG QUẢN TRỊ VÀ CO GIÃN TỰ DO TUYỆT ĐỐI
// ============================================================

(function () {
    "use strict";

    const ADMIN_PASSWORD_KEY = "vuscript_admin_pass";
    const DEFAULT_PASS = "vj"; 
    const STORAGE_PREFIX = "vuscript_smart_layout_";

    if (!localStorage.getItem(ADMIN_PASSWORD_KEY)) {
        localStorage.setItem(ADMIN_PASSWORD_KEY, DEFAULT_PASS);
    }

    const style = document.createElement("style");
    style.id = "ad-script-style";
    style.textContent = `
        #adFloatingBtn {
            position: fixed !important;
            bottom: 20px !important;
            right: 20px !important;
            width: 45px !important;
            height: 45px !important;
            border-radius: 50% !important;
            background: linear-gradient(135deg, #ff4f9a, #70695a) !important;
            color: white !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            font-size: 20px !important;
            cursor: pointer !important;
            z-index: 999999 !important;
            box-shadow: 0 4px 15px rgba(0,0,0,0.4) !important;
            border: 2px solid rgba(255,255,255,0.3) !important;
            transition: transform 0.2s !important;
        }
        #adFloatingBtn:hover { transform: scale(1.1) !important; }

        #adOverlay, #adCodeModal {
            position: fixed !important;
            inset: 0 !important;
            background: rgba(0, 0, 0, 0.75) !important;
            z-index: 1000000 !important;
            display: none !important;
            align-items: center !important;
            justify-content: center !important;
            padding: 20px !important;
            box-sizing: border-box !important;
            font-family: Arial, sans-serif !important;
        }
        #adOverlay.adShow, #adCodeModal.adShow { display: flex !important; }
        
        .adPanelBox {
            width: min(550px, 95vw) !important;
            background: linear-gradient(145deg, rgba(37, 35, 57, 0.98), rgba(23, 24, 42, 0.98)) !important;
            border: 1px solid rgba(255, 79, 154, 0.6) !important;
            border-radius: 15px !important;
            padding: 20px !important;
            color: white !important;
            box-shadow: 0 15px 45px rgba(0,0,0,0.6) !important;
            box-sizing: border-box !important;
        }
        .adTitle {
            font-size: 16px !important;
            font-weight: bold !important;
            margin-bottom: 12px !important;
            display: flex !important;
            justify-content: space-between !important;
            align-items: center !important;
            color: #ff4f9a !important;
        }
        .adInput {
            width: 100% !important;
            padding: 10px !important;
            margin-bottom: 12px !important;
            border-radius: 8px !important;
            border: 1px solid rgba(255,255,255,0.2) !important;
            background: rgba(0,0,0,0.4) !important;
            color: white !important;
            box-sizing: border-box !important;
            font-size: 13px !important;
        }
        .adBtn {
            width: 100% !important;
            padding: 10px !important;
            border-radius: 8px !important;
            border: none !important;
            background: #ff4f9a !important;
            color: white !important;
            font-weight: bold !important;
            cursor: pointer !important;
            font-size: 14px !important;
        }
        .adBtn:hover { filter: brightness(1.15) !important; }
        .adCloseBtn { background: transparent !important; border: none !important; color: #ff4f9a !important; font-size: 22px !important; cursor: pointer !important; }

        #adToolbar {
            position: fixed !important;
            top: 15px !important;
            left: 50% !important;
            transform: translateX(-50%) !important;
            background: rgba(20, 20, 35, 0.95) !important;
            border: 1px solid #ff4f9a !important;
            padding: 10px 20px !important;
            border-radius: 30px !important;
            z-index: 999998 !important;
            display: none !important;
            gap: 12px !important;
            align-items: center !important;
            box-shadow: 0 5px 20px rgba(0,0,0,0.5) !important;
            font-family: Arial, sans-serif !important;
            flex-wrap: wrap;
            justify-content: center;
        }
        #adToolbar.adShow { display: flex !important; }
        .adToolBtn {
            background: rgba(255,79,154,0.2) !important;
            border: 1px solid #ff4f9a !important;
            color: white !important;
            padding: 6px 14px !important;
            border-radius: 20px !important;
            cursor: pointer !important;
            font-size: 13px !important;
            font-weight: bold !important;
        }
        .adToolBtn:hover { background: #ff4f9a !important; }

        .ad-edit-active {
            outline: 2px dashed #ff4f9a !important;
            outline-offset: 3px !important;
            cursor: move !important;
        }
        .ad-resizer {
            position: absolute !important;
            right: 2px !important;
            bottom: 2px !important;
            width: 16px !important;
            height: 16px !important;
            background: #00ffcc !important;
            cursor: se-resize !important;
            display: none !important;
            z-index: 99999 !important;
            border-radius: 3px !important;
            box-shadow: 0 0 5px rgba(0,0,0,0.8);
        }
        .ad-edit-active .ad-resizer { display: block !important; }

        #adCodeOutput {
            width: 100% !important;
            height: 250px !important;
            background: #12121c !important;
            color: #00ffcc !important;
            border: 1px solid rgba(255,255,255,0.2) !important;
            border-radius: 8px !important;
            padding: 10px !important;
            font-family: monospace !important;
            font-size: 12px !important;
            box-sizing: border-box !important;
            resize: vertical !important;
            margin-bottom: 12px !important;
        }
    `;
    document.head.appendChild(style);

    function getElementIdentifier(el) {
        if (el.id) return `#${el.id}`;
        if (el.className && typeof el.className === "string") {
            const cleanClasses = el.className.replace(/ad-edit-active/g, "").trim().split(/\s+/).filter(Boolean);
            if (cleanClasses.length > 0) return `.${cleanClasses[0]}`;
        }
        return el.tagName.toLowerCase();
    }

    function restoreLayout() {
        const elements = document.querySelectorAll("div, section, article, header, footer, nav, button, img");
        elements.forEach((el, index) => {
            const identifier = getElementIdentifier(el) + "_" + index;
            const savedData = localStorage.getItem(STORAGE_PREFIX + identifier);
            if (savedData) {
                try {
                    const data = JSON.parse(savedData);
                    if (data.transform) el.style.setProperty("transform", data.transform, "important");
                    if (data.width) el.style.setProperty("width", data.width, "important");
                    if (data.height) el.style.setProperty("height", data.height, "important");
                    if (data.position) el.style.setProperty("position", data.position, "important");
                } catch (e) {}
            }
        });
    }

    function saveElementLayout(el, index) {
        const identifier = getElementIdentifier(el) + "_" + index;
        const data = {
            selector: getElementIdentifier(el),
            transform: el.style.transform,
            width: el.style.width,
            height: el.style.height,
            position: el.style.position
        };
        localStorage.setItem(STORAGE_PREFIX + identifier, JSON.stringify(data));
    }

    function initAdminUI() {
        if (document.getElementById("adFloatingBtn")) return;

        const floatBtn = document.createElement("div");
        floatBtn.id = "adFloatingBtn";
        floatBtn.innerHTML = "🔒";
        document.body.appendChild(floatBtn);

        const overlay = document.createElement("div");
        overlay.id = "adOverlay";
        overlay.innerHTML = `
            <div class="adPanelBox">
                <div class="adTitle">
                    <span>🔐 ĐĂNG NHẬP QUYỀN ADMIN</span>
                    <button class="adCloseBtn" id="adCloseModal">×</button>
                </div>
                <input type="password" id="adPassInput" class="adInput" placeholder="Nhập mật khẩu (mặc định: vj)...">
                <button class="adBtn" id="adLoginBtn">Xác Nhận</button>
            </div>
        `;
        document.body.appendChild(overlay);

        const codeModal = document.createElement("div");
        codeModal.id = "adCodeModal";
        codeModal.innerHTML = `
            <div class="adPanelBox">
                <div class="adTitle">
                    <span>📋 PHÂN TÍCH & TRÍCH XUẤT CODE NGUYÊN BẢN</span>
                    <button class="adCloseBtn" id="adCloseCodeModal">×</button>
                </div>
                <p style="font-size: 12px; color: #aaa; margin-bottom: 8px;">Dưới đây là mã phân tích kích thước và vị trí đã được tối ưu:</p>
                <textarea id="adCodeOutput" readonly></textarea>
                <button class="adBtn" id="adCopyCodeBtn">📋 Sao Chép Đoạn Mã</button>
            </div>
        `;
        document.body.appendChild(codeModal);

        const toolbar = document.createElement("div");
        toolbar.id = "adToolbar";
        toolbar.innerHTML = `
            <span style="color: #ff4f9a; font-weight: bold; font-size: 13px;">⚙️ QUẢN TRỊ</span>
            <button class="adToolBtn" id="adToggleEditBtn">🖱️ Bật Kéo Thả</button>
            <button class="adToolBtn" id="adExtractCodeBtn" style="background: rgba(0,255,204,0.2); border-color: #00ffcc;">💾 Phân Tích & Lấy Code</button>
            <button class="adToolBtn" id="adResetLayoutBtn" style="background: rgba(255,165,0,0.2); border-color: orange;">🔄 Reset</button>
            <button class="adToolBtn" id="adLogoutBtn" style="background: rgba(255,0,0,0.2); border-color: red;">Thoát</button>
        `;
        document.body.appendChild(toolbar);

        floatBtn.addEventListener("click", () => overlay.classList.add("adShow"));
        document.getElementById("adCloseModal").addEventListener("click", () => overlay.classList.remove("adShow"));
        document.getElementById("adCloseCodeModal").addEventListener("click", () => codeModal.classList.remove("adShow"));

        document.getElementById("adLoginBtn").addEventListener("click", verifyPassword);
        document.getElementById("adPassInput").addEventListener("keypress", (e) => { if (e.key === "Enter") verifyPassword(); });

        document.getElementById("adLogoutBtn").addEventListener("click", () => {
            toolbar.classList.remove("adShow");
            floatBtn.style.display = "flex";
            disableEditMode();
            alert("Đã thoát chế độ Admin!");
        });

        document.getElementById("adToggleEditBtn").addEventListener("click", toggleEditMode);
        document.getElementById("adExtractCodeBtn").addEventListener("click", generateSmartPatchCode);

        document.getElementById("adCopyCodeBtn").addEventListener("click", () => {
            const textarea = document.getElementById("adCodeOutput");
            textarea.select();
            document.execCommand("copy");
            alert("Đã sao chép!");
        });

        document.getElementById("adResetLayoutBtn").addEventListener("click", () => {
            if (confirm("Xóa toàn bộ cấu hình đã lưu và đưa về mặc định?")) {
                Object.keys(localStorage).forEach(k => {
                    if (k.startsWith(STORAGE_PREFIX)) localStorage.removeItem(k);
                });
                location.reload();
            }
        });
    }

    function verifyPassword() {
        const pass = document.getElementById("adPassInput").value;
        const savedPass = localStorage.getItem(ADMIN_PASSWORD_KEY) || DEFAULT_PASS;
        if (pass === savedPass) {
            document.getElementById("adOverlay").classList.remove("adShow");
            document.getElementById("adFloatingBtn").style.display = "none";
            document.getElementById("adToolbar").classList.add("adShow");
            alert("Đăng nhập thành công!");
        } else {
            alert("Sai mật khẩu! (Mật khẩu: vj)");
        }
    }

    let isEditActive = false;
    function toggleEditMode() {
        isEditActive = !isEditActive;
        const btn = document.getElementById("adToggleEditBtn");
        if (isEditActive) {
            btn.style.background = "#ff4f9a";
            btn.textContent = "✅ Đang Bật Kéo Thả";
            enableEditMode();
        } else {
            btn.style.background = "rgba(255,79,154,0.2)";
            btn.textContent = "🖱️ Bật Kéo Thả";
            disableEditMode();
        }
    }

    function generateSmartPatchCode() {
        let patchReport = `// --- BẢN PHÂN TÍCH TỌA ĐỘ VÀ KÍCH THƯỚC ---\n`;
        let count = 0;

        Object.keys(localStorage).forEach(k => {
            if (k.startsWith(STORAGE_PREFIX)) {
                try {
                    const data = JSON.parse(localStorage.getItem(k));
                    if (data && data.selector) {
                        patchReport += `\n/* Thành phần: ${data.selector} */\n`;
                        patchReport += `document.querySelector("${data.selector}").style.cssText += \`\n`;
                        if (data.position) patchReport += `    position: ${data.position} !important;\n`;
                        if (data.transform) patchReport += `    transform: ${data.transform} !important;\n`;
                        if (data.width) patchReport += `    width: ${data.width} !important;\n`;
                        if (data.height) patchReport += `    height: ${data.height} !important;\n`;
                        patchReport += `\`;\n`;
                        count++;
                    }
                } catch(e) {}
            }
        });

        if (count === 0) {
            patchReport = "// Chưa có thành phần nào thay đổi!";
        }

        document.getElementById("adCodeOutput").value = patchReport;
        document.getElementById("adCodeModal").classList.add("adShow");
    }

    let currentEl = null;
    let currentIndex = -1;
    let startX = 0, startY = 0, origX = 0, origY = 0;

    function enableEditMode() {
        const elements = document.querySelectorAll("div, section, article, header, footer, nav, button, img");
        elements.forEach((el, index) => {
            if (!el.closest("#adToolbar") && !el.closest("#adOverlay") && !el.closest("#adCodeModal") && el.id !== "adFloatingBtn") {
                el.classList.add("ad-edit-active");
                if (!el.querySelector(".ad-resizer")) {
                    const resizer = document.createElement("div");
                    resizer.className = "ad-resizer";
                    if (window.getComputedStyle(el).position === "static") {
                        el.style.position = "relative";
                    }
                    el.appendChild(resizer);
                    resizer.addEventListener("mousedown", (e) => startResizingGlobal(e, el, index));
                }
            }
        });
        document.addEventListener("mousedown", startDraggingGlobal);
    }

    function disableEditMode() {
        document.querySelectorAll(".ad-edit-active").forEach(el => {
            el.classList.remove("ad-edit-active");
            const resizer = el.querySelector(".ad-resizer");
            if (resizer) resizer.remove();
        });
        document.removeEventListener("mousedown", startDraggingGlobal);
    }

    function startDraggingGlobal(e) {
        if (!isEditActive || e.target.classList.contains("ad-resizer")) return;
        const target = e.target.closest(".ad-edit-active");
        if (!target) return;

        e.preventDefault();
        e.stopPropagation();
        currentEl = target;

        const allEls = Array.from(document.querySelectorAll("div, section, article, header, footer, nav, button, img"));
        currentIndex = allEls.indexOf(target);

        const computed = window.getComputedStyle(currentEl);
        if (computed.position === "static") currentEl.style.position = "relative";
        currentEl.style.zIndex = "99999";

        startX = e.clientX;
        startY = e.clientY;

        const matrix = new DOMMatrix(computed.transform);
        origX = matrix.m41;
        origY = matrix.m42;

        document.addEventListener("mousemove", onDraggingGlobal);
        document.addEventListener("mouseup", stopDraggingGlobal);
    }

    function onDraggingGlobal(e) {
        if (!currentEl) return;
        e.preventDefault();
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        currentEl.style.transform = `translate(${origX + dx}px, ${origY + dy}px)`;
    }

    function stopDraggingGlobal() {
        if (currentEl && currentIndex !== -1) {
            saveElementLayout(currentEl, currentIndex);
        }
        document.removeEventListener("mousemove", onDraggingGlobal);
        document.removeEventListener("mouseup", stopDraggingGlobal);
        currentEl = null;
        currentIndex = -1;
    }

    // --- CƠ CHẾ CO GIÃN TỰ DO ĐƯỢC NÂNG CẤP ---
    let currentResizeEl = null;
    let resizeIndex = -1;
    let startW = 0, startH = 0, startMouseX = 0, startMouseY = 0;

    function startResizingGlobal(e, el, index) {
        if (!isEditActive) return;
        e.stopPropagation();
        e.preventDefault();

        currentResizeEl = el;
        resizeIndex = index;

        // Ép buộc xóa mọi giới hạn kích thước cứng (max/min) từ file gốc để co giãn hoàn toàn tự do
        currentResizeEl.style.setProperty("max-width", "none", "important");
        currentResizeEl.style.setProperty("max-height", "none", "important");
        currentResizeEl.style.setProperty("min-width", "20px", "important");
        currentResizeEl.style.setProperty("min-height", "20px", "important");

        currentResizeEl.style.width = currentResizeEl.offsetWidth + "px";
        currentResizeEl.style.height = currentResizeEl.offsetHeight + "px";
        currentResizeEl.style.zIndex = "99999";

        startMouseX = e.clientX;
        startMouseY = e.clientY;
        startW = currentResizeEl.offsetWidth;
        startH = currentResizeEl.offsetHeight;

        document.addEventListener("mousemove", onResizingGlobal);
        document.addEventListener("mouseup", stopResizingGlobal);
    }

    function onResizingGlobal(e) {
        if (!currentResizeEl) return;
        e.preventDefault();
        const dw = e.clientX - startMouseX;
        const dh = e.clientY - startMouseY;
        
        currentResizeEl.style.setProperty("width", Math.max(20, startW + dw) + "px", "important");
        currentResizeEl.style.setProperty("height", Math.max(20, startH + dh) + "px", "important");
    }

    function stopResizingGlobal() {
        if (currentResizeEl && resizeIndex !== -1) {
            saveElementLayout(currentResizeEl, resizeIndex);
        }
        document.removeEventListener("mousemove", onResizingGlobal);
        document.removeEventListener("mouseup", stopResizingGlobal);
        currentResizeEl = null;
        resizeIndex = -1;
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => { restoreLayout(); initAdminUI(); });
    } else {
        restoreLayout();
        initAdminUI();
    }
})();