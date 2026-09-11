/**
 * VUSCRIPT - Blu.js (Notification & Call Alert System with Custom Popup)
 * Tác dụng: Hiển thị bảng hỏi giữa màn hình web, ép người dùng chú ý bấm đồng ý nhận thông báo/gọi.
 */

class BluNotificationSystem {
    constructor() {
        this.audioRing = null;
        this.initRingtone();
        this.checkAndShowPermissionModal();
    }

    // 1. Kiểm tra xem đã cấp quyền chưa, nếu chưa thì hiện bảng popup giữa màn hình
    checkAndShowPermissionModal() {
        if (!("Notification" in window)) return;

        // Nếu chưa xin quyền hoặc đang ở trạng thái mặc định
        if (Notification.permission === "default") {
            this.createPermissionPopup();
        }
    }

    // 2. Tạo giao diện bảng popup bắt buộc chú ý nằm giữa màn hình
    createPermissionPopup() {
        // Tránh tạo trùng lặp nếu đã tồn tại
        if (document.getElementById('blu-custom-popup')) return;

        const overlay = document.createElement('div');
        overlay.id = 'blu-custom-popup';
        overlay.style.cssText = `
            position: fixed;
            inset: 0;
            background: rgba(0, 0, 0, 0.85);
            backdrop-filter: blur(5px);
            z-index: 9999999;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            animation: bluFadeIn 0.3s ease;
        `;

        overlay.innerHTML = `
            <div style="background: #121212; border: 2px solid #00ffcc; padding: 30px; border-radius: 16px; text-align: center; max-width: 380px; width: 90%; color: #fff; box-shadow: 0 0 30px rgba(0,255,204,0.3);">
                <div style="font-size: 40px; margin-bottom: 10px;">🔔</div>
                <h3 style="margin: 0 0 10px 0; color: #00ffcc; font-size: 20px;">Bật Thông Báo & Cuộc Gọi</h3>
                <p style="font-size: 14px; color: #bbb; line-height: 1.5; margin-bottom: 20px;">
                    Vui lòng bấm <b>Đồng ý</b> để nhận thông báo tin nhắn nổi ngoài màn hình và tính năng gọi thoại trực tiếp khi có người tương tác!
                </p>
                <button id="blu-agree-btn" style="background: #00ffcc; color: #000; border: none; padding: 12px 25px; font-weight: bold; border-radius: 8px; cursor: pointer; font-size: 15px; width: 100%; transition: 0.2s; box-shadow: 0 4px 10px rgba(0,255,204,0.2);">
                    ĐỒNG Ý VÀ TIẾP TỤC
                </button>
            </div>
        `;

        document.body.appendChild(overlay);

        // Xử lý sự kiện khi người dùng bấm nút "Đồng ý" trên bảng
        document.getElementById('blu-agree-btn').addEventListener('click', () => {
            Notification.requestPermission().then(permission => {
                if (permission === "granted") {
                    console.log("Blu.js: Người dùng đã đồng ý cấp quyền.");
                } else {
                    console.log("Blu.js: Người dùng từ chối cấp quyền.");
                }
            });

            // Mở khóa âm thanh
            if (this.audioRing) {
                this.audioRing.play().then(() => {
                    this.audioRing.pause();
                    this.audioRing.currentTime = 0;
                }).catch(() => {});
            }

            // Gỡ bỏ bảng popup ra khỏi màn hình
            overlay.remove();
        });
    }

    // 3. Chuẩn bị âm thanh chuông gọi
    initRingtone() {
        this.audioRing = new Audio('https://assets.mixkit.co/active_storage/sfx/1359/1359-preview.mp3');
        this.audioRing.loop = true;
    }

    /**
     * 4. Hiển thị thông báo tin nhắn nổi ngoài màn hình (giống Zalo)
     */
    showTextMessage(sender, message, avatar = "") {
        if ("Notification" in window && Notification.permission === "granted") {
            const options = {
                body: message,
                icon: avatar || "https://i.imgur.com/7gK764t.png",
                tag: "vuscript-chat",
                renotify: true
            };

            const notification = new Notification(`💬 Tin nhắn mới từ ${sender}`, options);

            notification.onclick = function(event) {
                event.preventDefault();
                window.focus();
                notification.close();
            };
        }
    }

    /**
     * 5. Kích hoạt chế độ gọi đến: Rung máy + Đổ chuông + Thông báo lớn
     */
    startIncomingCall(callerName) {
        if (this.audioRing) {
            this.audioRing.play().catch(e => console.log("Không thể phát âm thanh:", e));
        }

        if ("vibrate" in navigator) {
            navigator.vibrate([500, 300, 500, 300, 500, 300, 500, 300]);
        }

        if ("Notification" in window && Notification.permission === "granted") {
            const options = {
                body: `${callerName} đang gọi cho bạn... Nhấn để nghe máy!`,
                icon: "https://i.imgur.com/7gK764t.png",
                tag: "vuscript-call",
                requireInteraction: true
            };

            const callNotification = new Notification(`📞 Cuộc gọi đến từ ${callerName}`, options);
            
            callNotification.onclick = function(event) {
                event.preventDefault();
                window.focus();
                callNotification.close();
            };
        }
    }

    /**
     * 6. Dừng chuông và dừng rung
     */
    stopIncomingCall() {
        if (this.audioRing) {
            this.audioRing.pause();
            this.audioRing.currentTime = 0;
        }
        if ("vibrate" in navigator) {
            navigator.vibrate(0);
        }
    }
}

// Khởi tạo hệ thống
const bluSystem = new BluNotificationSystem();
