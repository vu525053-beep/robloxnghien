// ============================================================
// avt.js
// Avatar def.jpg
//
// CHỈ LÀM:
// 1. Chờ giao diện chính xuất hiện
// 2. Hiện avatar
//
// KHÔNG:
// - Ẩn popup
// - Quét toàn bộ DOM
// - Đụng vào nút Bạn Bè
// - Đụng vào Chat Nhóm
// - Đụng vào Quản trị
// - Đụng vào giao diện chính
// ============================================================

(function () {

    "use strict";

    // ========================================================
    // CẤU HÌNH
    // ========================================================

    const TOP = 75;
    const LEFT = 395;

    const SIZE = 200;

    const IMAGE = "def.jpg";


    // ========================================================
    // TẠO CSS
    // ========================================================

    const style = document.createElement("style");

    style.id = "vuscript-avatar-style";

    style.textContent = `
        #userAvatarBox {
            position: fixed !important;

            top: ${TOP}px !important;
            left: ${LEFT}px !important;

            width: ${SIZE}px !important;
            height: ${SIZE}px !important;

            border-radius: 50% !important;
            overflow: hidden !important;

            border: 3px solid rgba(255, 79, 154, 0.95) !important;

            box-shadow:
                0 0 10px rgba(255, 79, 154, 0.85),
                0 0 25px rgba(255, 79, 154, 0.65),
                0 0 40px rgba(255, 79, 154, 0.35) !important;

            background: rgba(20, 20, 35, 0.8);

            /*
             * Để thấp để không che giao diện
             */
            z-index: 10 !important;

            pointer-events: none !important;

            opacity: 0;

            transform: scale(0.8);

            transition:
                opacity 0.3s ease,
                transform 0.3s ease;
        }

        #userAvatarBox.vuscript-avatar-show {
            opacity: 1 !important;
            transform: scale(1) !important;
        }

        #userAvatarBox img {
            width: 100% !important;
            height: 100% !important;

            object-fit: cover !important;
            object-position: center !important;

            display: block !important;
        }
    `;

    document.head.appendChild(style);


    // ========================================================
    // TẠO AVATAR
    // ========================================================

    function createAvatar() {

        // Không tạo lần 2

        if (document.getElementById("userAvatarBox")) {
            return;
        }


        const box = document.createElement("div");

        box.id = "userAvatarBox";


        const img = document.createElement("img");

        img.src = IMAGE;

        img.alt = "Avatar";


        img.onerror = function () {

            console.warn(
                "[avt.js] Không tìm thấy def.jpg"
            );

        };


        box.appendChild(img);

        document.body.appendChild(box);


        // Hiệu ứng hiện

        requestAnimationFrame(function () {

            box.classList.add(
                "vuscript-avatar-show"
            );

        });

    }


    // ========================================================
    // KIỂM TRA GIAO DIỆN CHÍNH
    // ========================================================
    //
    // Không tìm class/id.
    // Chỉ kiểm tra xem chữ của nút chính đã xuất hiện chưa.
    //
    // Vì vậy không thể làm ẩn giao diện.
    // ========================================================

    function checkMain() {

        const text =
            document.body.innerText || "";


        const mainReady =

            text.includes(
                "MỞ ROBLOX VNG"
            ) ||

            text.includes(
                "MỞ ROBLOX QUỐC TẾ"
            );


        if (mainReady) {

            createAvatar();

            return true;

        }


        return false;

    }


    // ========================================================
    // CHỜ LOADING XONG
    // ========================================================

    function waitForMain() {

        /*
         * Kiểm tra mỗi 500ms.
         *
         * Không MutationObserver.
         * Không quét từng phần tử.
         * Không can thiệp DOM ngoài avatar.
         */

        const timer = setInterval(
            function () {

                if (checkMain()) {

                    clearInterval(timer);

                }

            },
            500
        );


        // Kiểm tra ngay lần đầu

        checkMain();

    }


    // ========================================================
    // KHỞI ĐỘNG
    // ========================================================

    if (
        document.readyState === "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            waitForMain
        );

    } else {

        waitForMain();

    }

})();