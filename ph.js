// ============================================================
// ph.js - TRANG PHỤ + CÁC CUỘC BÌNH CHỌN
// Bản giữ nguyên chức năng + FIX TỌA ĐỘ/KÍCH THƯỚC
// ============================================================

(function () {
    "use strict";

    // ============================================================
    // 1. CHÈN CSS
    // ============================================================

    if (!document.getElementById("ph-script-style")) {

        const style = document.createElement("style");
        style.id = "ph-script-style";

        style.textContent = `

            /* ====================================================
               KHUNG CHỨA
               ==================================================== */

            #phContainer {
                width: 416px !important;
                min-width: 416px !important;
                max-width: 416px !important;

                height: 77px !important;
                min-height: 77px !important;
                max-height: 77px !important;

                margin: 10px auto;
                display: flex;
                flex-direction: column;
                gap: 8px;

                position: relative !important;

                z-index: 20;
                box-sizing: border-box !important;

                transform: translate(-10px, 51px) !important;
            }


            /* ====================================================
               KHUNG CHUNG
               ==================================================== */

            .phBox {
                box-sizing: border-box !important;

                border-radius: 12px;
                border: 1px solid rgba(255, 255, 255, 0.20);

                background:
                    linear-gradient(
                        135deg,
                        rgba(70, 69, 90, 0.80),
                        rgba(30, 31, 52, 0.88)
                    );

                box-shadow:
                    inset 0 1px 0 rgba(255,255,255,0.08),
                    0 5px 18px rgba(0,0,0,0.25);

                color: white;

                font-family: Arial, sans-serif;

                cursor: pointer;
                user-select: none;

                text-align: center;

                transition:
                    filter 0.18s ease,
                    box-shadow 0.18s ease;
            }


            /* ====================================================
               TRANG PHỤ
               ==================================================== */

            #phPageButton {

                position: relative !important;

                width: 174px !important;
                min-width: 174px !important;
                max-width: 174px !important;

                height: 22px !important;
                min-height: 22px !important;
                max-height: 22px !important;

                transform: translate(186px, 184px) !important;

                display: flex;

                align-items: center;
                justify-content: center;

                font-size: 14px;
                font-weight: bold;

                padding: 0 !important;

                box-sizing: border-box !important;
            }


            /* ====================================================
               CÁC CUỘC BÌNH CHỌN
               ==================================================== */

            #phPollButton {

                position: relative !important;

                width: 217px !important;
                min-width: 217px !important;
                max-width: 217px !important;

                height: 20px !important;
                min-height: 20px !important;
                max-height: 20px !important;

                transform: translate(200px, 117px) !important;

                display: flex;

                align-items: center;
                justify-content: center;

                font-size: 14px;
                font-weight: bold;

                padding: 0 !important;

                box-sizing: border-box !important;
            }


            /* ====================================================
               HIỆU ỨNG HOVER
               ==================================================== */

            .phBox:hover {

                filter: brightness(1.15);

                box-shadow:
                    inset 0 1px 0 rgba(255,255,255,0.12),
                    0 7px 20px rgba(0,0,0,0.35);
            }


            /* ====================================================
               HIỆU ỨNG NHẤN
               ==================================================== */

            .phBox:active {

                filter: brightness(0.95);
            }


            /* ====================================================
               OVERLAY
               ==================================================== */

            #phOverlay {

                position: fixed !important;

                inset: 0;

                background: rgba(0, 0, 0, 0.55);

                z-index: 50000;

                display: none;

                align-items: center;
                justify-content: center;

                padding: 20px;

                box-sizing: border-box;
            }


            #phOverlay.phShow {
                display: flex;
            }


            /* ====================================================
               PANEL BÌNH CHỌN
               ==================================================== */

            #phPollPanel {

                width: min(560px, 95vw);

                max-height: 80vh;

                overflow-y: auto;

                border-radius: 15px;

                border:
                    1px solid rgba(255, 79, 154, 0.65);

                background:
                    linear-gradient(
                        145deg,
                        rgba(37, 35, 57, 0.98),
                        rgba(23, 24, 42, 0.98)
                    );

                box-shadow:
                    0 0 25px rgba(255, 79, 154, 0.25),
                    0 15px 45px rgba(0,0,0,0.55);

                color: white;

                padding: 16px;

                box-sizing: border-box;
            }


            /* ====================================================
               HEADER BÌNH CHỌN
               ==================================================== */

            #phPollHeader {

                display: flex;

                align-items: center;
                justify-content: space-between;

                margin-bottom: 14px;

                font-size: 17px;

                font-weight: bold;
            }


            /* ====================================================
               NÚT ĐÓNG
               ==================================================== */

            #phPollClose {

                width: 32px;
                height: 32px;

                border: none;

                border-radius: 8px;

                background:
                    rgba(255, 79, 154, 0.15);

                color: #ff4f9a;

                font-size: 20px;

                font-weight: bold;

                cursor: pointer;
            }


            /* ====================================================
               ITEM BÌNH CHỌN
               ==================================================== */

            .phPollItem {

                padding: 13px;

                margin-bottom: 10px;

                border-radius: 11px;

                background:
                    rgba(255,255,255,0.07);

                border:
                    1px solid rgba(255,255,255,0.10);
            }


            .phPollTitle {

                font-size: 14px;

                font-weight: bold;

                margin-bottom: 9px;
            }


            .phPollOption {

                display: flex;

                align-items: center;

                justify-content: space-between;

                padding: 8px 10px;

                margin-top: 6px;

                border-radius: 8px;

                background:
                    rgba(0,0,0,0.20);

                font-size: 13px;
            }


            .phPollCount {

                color: #bfc3d1;

                font-size: 12px;
            }


            /* ====================================================
               KHÔNG CÓ BÌNH CHỌN
               ==================================================== */

            #phNoPoll {

                text-align: center;

                color: #aeb2c0;

                padding: 25px 10px;

                font-size: 14px;
            }


            /* ====================================================
               TRANG PHỤ
               ==================================================== */

            #phPageTitle {

                font-size: 17px;

                font-weight: bold;

                margin-bottom: 12px;
            }


            #phPageContent {

                color: #c5c8d2;

                font-size: 14px;

                line-height: 1.5;
            }

        `;

        document.head.appendChild(style);
    }


    // ============================================================
    // 2. TẠO GIAO DIỆN
    // ============================================================

    function createButtons() {

        if (document.getElementById("phContainer")) return;


        const container = document.createElement("div");

        container.id = "phContainer";


        // --------------------------------------------------------
        // TRANG PHỤ
        // --------------------------------------------------------

        const pageButton = document.createElement("div");

        pageButton.id = "phPageButton";

        pageButton.className = "phBox";

        pageButton.innerHTML =
            "📄 &nbsp; TRANG PHỤ";


        // --------------------------------------------------------
        // CÁC CUỘC BÌNH CHỌN
        // --------------------------------------------------------

        const pollButton = document.createElement("div");

        pollButton.id = "phPollButton";

        pollButton.className = "phBox";

        pollButton.innerHTML =
            "📊 &nbsp; CÁC CUỘC BÌNH CHỌN";


        // --------------------------------------------------------
        // ĐƯA VÀO CONTAINER
        // --------------------------------------------------------

        container.appendChild(pageButton);

        container.appendChild(pollButton);


        // ========================================================
        // TÌM VỊ TRÍ SCRIPT HUB
        // ========================================================

        let targetNode = null;

        const allDivs =
            document.querySelectorAll("div, button, a");


        for (let el of allDivs) {

            if (
                el.textContent &&
                el.textContent.includes(
                    "SCRIPT HUB ĐỈNH CAO"
                )
            ) {

                targetNode = el;

                break;
            }
        }


        // ========================================================
        // CHÈN CONTAINER
        // ========================================================

        if (targetNode) {

            let parentWrapper =
                targetNode.closest("div") ||
                targetNode.parentElement;


            if (
                parentWrapper &&
                parentWrapper.parentNode
            ) {

                parentWrapper.parentNode.insertBefore(
                    container,
                    parentWrapper
                );

            } else {

                targetNode.parentNode.insertBefore(
                    container,
                    targetNode
                );
            }

        } else {

            document.body.appendChild(container);
        }


        // ========================================================
        // SỰ KIỆN
        // ========================================================

        pageButton.addEventListener(
            "click",
            openPage
        );

        pollButton.addEventListener(
            "click",
            openPolls
        );


        // ========================================================
        // ÉP KÍCH THƯỚC + TỌA ĐỘ NGAY SAU KHI TẠO
        // ========================================================

        applyCoordinates();
    }


    // ============================================================
    // 3. FIX TỌA ĐỘ + KÍCH THƯỚC
    // ============================================================

    function applyCoordinates() {

        // --------------------------------------------------------
        // CÁC CUỘC BÌNH CHỌN
        // --------------------------------------------------------

        const pollButton =
            document.querySelector("#phPollButton");


        if (pollButton) {

            pollButton.style.setProperty(
                "position",
                "relative",
                "important"
            );

            pollButton.style.setProperty(
                "transform",
                "translate(200px, 117px)",
                "important"
            );

            pollButton.style.setProperty(
                "width",
                "217px",
                "important"
            );

            pollButton.style.setProperty(
                "min-width",
                "217px",
                "important"
            );

            pollButton.style.setProperty(
                "max-width",
                "217px",
                "important"
            );

            pollButton.style.setProperty(
                "height",
                "20px",
                "important"
            );

            pollButton.style.setProperty(
                "min-height",
                "20px",
                "important"
            );

            pollButton.style.setProperty(
                "max-height",
                "20px",
                "important"
            );

            pollButton.style.setProperty(
                "box-sizing",
                "border-box",
                "important"
            );
        }


        // --------------------------------------------------------
        // TRANG PHỤ
        // --------------------------------------------------------

        const pageButton =
            document.querySelector("#phPageButton");


        if (pageButton) {

            pageButton.style.setProperty(
                "position",
                "relative",
                "important"
            );

            pageButton.style.setProperty(
                "transform",
                "translate(186px, 184px)",
                "important"
            );

            pageButton.style.setProperty(
                "width",
                "174px",
                "important"
            );

            pageButton.style.setProperty(
                "min-width",
                "174px",
                "important"
            );

            pageButton.style.setProperty(
                "max-width",
                "174px",
                "important"
            );

            pageButton.style.setProperty(
                "height",
                "22px",
                "important"
            );

            pageButton.style.setProperty(
                "min-height",
                "22px",
                "important"
            );

            pageButton.style.setProperty(
                "max-height",
                "22px",
                "important"
            );

            pageButton.style.setProperty(
                "box-sizing",
                "border-box",
                "important"
            );
        }


        // --------------------------------------------------------
        // CONTAINER
        // --------------------------------------------------------

        const container =
            document.querySelector("#phContainer");


        if (container) {

            container.style.setProperty(
                "position",
                "relative",
                "important"
            );

            container.style.setProperty(
                "transform",
                "translate(-10px, 51px)",
                "important"
            );

            container.style.setProperty(
                "width",
                "416px",
                "important"
            );

            container.style.setProperty(
                "min-width",
                "416px",
                "important"
            );

            container.style.setProperty(
                "max-width",
                "416px",
                "important"
            );

            container.style.setProperty(
                "height",
                "77px",
                "important"
            );

            container.style.setProperty(
                "min-height",
                "77px",
                "important"
            );

            container.style.setProperty(
                "max-height",
                "77px",
                "important"
            );

            container.style.setProperty(
                "box-sizing",
                "border-box",
                "important"
            );
        }
    }


    // ============================================================
    // 4. TẠO OVERLAY
    // ============================================================

    function createOverlay() {

        if (
            document.getElementById("phOverlay")
        ) return;


        const overlay =
            document.createElement("div");

        overlay.id = "phOverlay";


        overlay.innerHTML = `

            <div id="phPollPanel">

                <div id="phPollHeader">

                    <span>
                        📊 CÁC CUỘC BÌNH CHỌN
                    </span>

                    <button id="phPollClose">
                        ×
                    </button>

                </div>

                <div id="phPollContent"></div>

            </div>

        `;


        document.body.appendChild(overlay);


        document
            .getElementById("phPollClose")
            .addEventListener(
                "click",
                closeOverlay
            );


        overlay.addEventListener(
            "click",
            function (e) {

                if (e.target === overlay) {

                    closeOverlay();
                }
            }
        );
    }


    // ============================================================
    // 5. MỞ BÌNH CHỌN
    // ============================================================

    function openPolls() {

        createOverlay();


        const panel =
            document.getElementById(
                "phPollPanel"
            );


        panel.innerHTML = `

            <div id="phPollHeader">

                <span>
                    📊 CÁC CUỘC BÌNH CHỌN
                </span>

                <button id="phPollClose">
                    ×
                </button>

            </div>

            <div id="phPollContent"></div>

        `;


        document
            .getElementById("phPollClose")
            .addEventListener(
                "click",
                closeOverlay
            );


        renderPolls();


        document
            .getElementById("phOverlay")
            .classList.add("phShow");
    }


    // ============================================================
    // 6. HIỂN THỊ BÌNH CHỌN
    // ============================================================

    function renderPolls() {

        const content =
            document.getElementById(
                "phPollContent"
            );


        let polls = [];


        try {

            polls = JSON.parse(
                localStorage.getItem(
                    "vuscript_polls"
                ) || "[]"
            );

        } catch (e) {

            polls = [];
        }


        if (polls.length === 0) {

            content.innerHTML =
                `<div id="phNoPoll">
                    Chưa có cuộc bình chọn nào.
                </div>`;

            return;
        }


        content.innerHTML = "";


        polls.forEach(function (poll) {

            const item =
                document.createElement("div");

            item.className =
                "phPollItem";


            const title =
                document.createElement("div");

            title.className =
                "phPollTitle";

            title.textContent =
                poll.title ||
                "Cuộc bình chọn";


            item.appendChild(title);


            if (
                Array.isArray(
                    poll.options
                )
            ) {

                poll.options.forEach(
                    function (option) {

                        const row =
                            document.createElement(
                                "div"
                            );

                        row.className =
                            "phPollOption";


                        const name =
                            document.createElement(
                                "span"
                            );

                        name.textContent =
                            option.name ||
                            "Lựa chọn";


                        const count =
                            document.createElement(
                                "span"
                            );

                        count.className =
                            "phPollCount";

                        count.textContent =
                            (Number(
                                option.votes
                            ) || 0) +
                            " người";


                        row.appendChild(name);

                        row.appendChild(count);

                        item.appendChild(row);
                    }
                );
            }


            content.appendChild(item);
        });
    }


    // ============================================================
    // 7. MỞ TRANG PHỤ
    // ============================================================

    function openPage() {

        createOverlay();


        const panel =
            document.getElementById(
                "phPollPanel"
            );


        panel.innerHTML = `

            <div id="phPageTitle">
                📄 TRANG PHỤ
            </div>

            <div id="phPageContent">

                Đây là trang phụ của Vuscript.
                <br><br>

                Nội dung trang này có thể được
                bổ sung sau.

                <br><br>

                <button
                    id="phPollCloseBtn"
                    style="
                        color:white;
                        background:rgba(255,79,154,.2);
                        width:100%;
                        border:1px solid rgba(255,79,154,.5);
                        border-radius:8px;
                        padding:9px;
                        cursor:pointer;
                    "
                >
                    Đóng
                </button>

            </div>

        `;


        document
            .getElementById(
                "phPollCloseBtn"
            )
            .addEventListener(
                "click",
                closeOverlay
            );


        document
            .getElementById("phOverlay")
            .classList.add("phShow");
    }


    // ============================================================
    // 8. ĐÓNG OVERLAY
    // ============================================================

    function closeOverlay() {

        const overlay =
            document.getElementById(
                "phOverlay"
            );


        if (overlay) {

            overlay.classList.remove(
                "phShow"
            );
        }
    }


    // ============================================================
    // 9. KHỞI CHẠY
    // ============================================================

    if (
        document.readyState === "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            function () {

                createButtons();

                applyCoordinates();
            }
        );

    } else {

        createButtons();

        applyCoordinates();
    }


    // ============================================================
    // 10. ĐẢM BẢO TỌA ĐỘ SAU KHI LOAD
    // ============================================================

    window.addEventListener(
        "load",
        function () {

            createButtons();

            applyCoordinates();
        }
    );

})();