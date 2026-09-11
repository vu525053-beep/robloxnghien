(() => {
    "use strict";

    /*
    ================================================================
                    VUSCRIPT CHAT.JS
       GLASS CHAT + RAINBOW BORDER + PASTE IMAGE
    ================================================================

    File này KHÔNG tạo chat mới.

    Nó nâng cấp chat có sẵn trong index.html:

        #chatModal
        #modalChatList
        #modalChatInput

    Hỗ trợ:

        Ctrl + V ảnh
        Preview ảnh
        Gửi ảnh
        Hiển thị ảnh
        Phóng to ảnh
        Kính trong suốt
        Viền cầu vồng
        Giao tiếp với index.html

    AI vẫn do index.html quản lý.
    ================================================================
    */


    /* ============================================================
       CONFIG
       ============================================================ */

    const STYLE_ID =
        "vuscript-chat-style";

    const CHAT_CLASS =
        "vuscript-chat-upgraded";

    const VERSION =
        "6.0.0";

    const IMAGE_TYPE =
        "image";

    let initialized =
        false;

    let firebaseListenerReady =
        false;

    let pendingImage =
        null;

    let latestFirebaseSnapshot =
        null;

    let renderingMessages =
        false;

    let renderTimer =
        null;

    let observerReady =
        false;


    /* ============================================================
       ELEMENT HELPERS
       ============================================================ */

    function getChat() {

        return document.getElementById(
            "chatModal"
        );
    }


    function getList() {

        return document.getElementById(
            "modalChatList"
        );
    }


    function getInput() {

        return document.getElementById(
            "modalChatInput"
        );
    }


    /* ============================================================
       FIREBASE HELPER
       ============================================================ */

    function getDatabase() {

        try {

            if (
                typeof db !==
                "undefined" &&
                db
            ) {

                return db;
            }

        } catch (e) {}

        try {

            if (
                window.db
            ) {

                return window.db;
            }

        } catch (e) {}

        return null;
    }


    function getMessagesRef() {

        const database =
            getDatabase();

        if (!database) {
            return null;
        }

        try {

            return database.ref(
                "messages"
            );

        } catch (e) {

            console.error(
                "[VUSCRIPT CHAT] Firebase error:",
                e
            );

            return null;
        }
    }


    /* ============================================================
       USER HELPER
       ============================================================ */

    function getCurrentUser() {

        try {

            if (
                typeof currentUser !==
                "undefined" &&
                currentUser
            ) {

                return currentUser;
            }

        } catch (e) {}


        try {

            if (
                window.currentUser
            ) {

                return window.currentUser;
            }

        } catch (e) {}


        return (
            localStorage.getItem(
                "vuscript_name"
            ) ||
            "Khách"
        );
    }


    /* ============================================================
       CSS
       ============================================================ */

    function injectCSS() {

        if (
            document.getElementById(
                STYLE_ID
            )
        ) {

            return;
        }


        const style =
            document.createElement(
                "style"
            );


        style.id =
            STYLE_ID;


        style.textContent = `

/* ================================================================
   CHAT WINDOW
   ================================================================ */

#chatModal.${CHAT_CLASS} {

    width:
        min(680px, calc(100vw - 16px)) !important;

    height:
        min(760px, calc(100vh - 16px)) !important;

    max-width:
        calc(100vw - 16px) !important;

    max-height:
        calc(100vh - 16px) !important;

    min-height:
        420px !important;

    position:
        fixed !important;

    left:
        50% !important;

    top:
        50% !important;

    transform:
        translate(-50%, -50%) !important;

    display:
        none;

    flex-direction:
        column !important;

    overflow:
        hidden !important;

    box-sizing:
        border-box !important;

    padding:
        0 !important;

    margin:
        0 !important;

    color:
        #ffffff !important;

    background:
        linear-gradient(
            135deg,
            rgba(255,255,255,.105),
            rgba(255,255,255,.035)
        ) !important;

    border:
        1px solid
        rgba(255,255,255,.24) !important;

    border-radius:
        25px !important;

    backdrop-filter:
        blur(13px)
        saturate(125%) !important;

    -webkit-backdrop-filter:
        blur(13px)
        saturate(125%) !important;

    box-shadow:
        0 25px 80px
        rgba(0,0,0,.18),

        inset 0 0 0 1px
        rgba(255,255,255,.035) !important;

    isolation:
        isolate !important;
}


/* ================================================================
   RAINBOW BORDER
   ================================================================ */

#chatModal.${CHAT_CLASS}::before {

    content:
        "";

    position:
        absolute;

    inset:
        -2px;

    padding:
        2px;

    border-radius:
        27px;

    background:
        linear-gradient(
            90deg,

            #ff006e,
            #ff00ff,
            #7c3aed,
            #00b7ff,
            #00ffd5,
            #00ff87,
            #ffe600,
            #ff7a00,
            #ff006e
        );

    background-size:
        500% 500%;

    animation:
        vuscriptRainbow
        2.4s
        linear
        infinite;

    -webkit-mask:
        linear-gradient(#000 0 0) content-box,
        linear-gradient(#000 0 0);

    -webkit-mask-composite:
        xor;

    mask-composite:
        exclude;

    pointer-events:
        none;

    z-index:
        999;

    filter:
        drop-shadow(
            0 0 5px
            rgba(255,0,255,.45)
        )

        drop-shadow(
            0 0 13px
            rgba(0,190,255,.28)
        );
}


@keyframes vuscriptRainbow {

    0% {
        background-position:
            0% 50%;
    }

    25% {
        background-position:
            100% 50%;
    }

    50% {
        background-position:
            100% 100%;
    }

    75% {
        background-position:
            0% 100%;
    }

    100% {
        background-position:
            0% 50%;
    }
}


/* ================================================================
   HEADER
   ================================================================ */

#chatModal.${CHAT_CLASS}
.modalHeader {

    flex:
        0 0 auto !important;

    min-height:
        82px !important;

    box-sizing:
        border-box !important;

    margin:
        0 !important;

    padding:
        15px 17px !important;

    display:
        flex !important;

    align-items:
        center !important;

    justify-content:
        space-between !important;

    gap:
        10px !important;

    background:
        linear-gradient(
            180deg,
            rgba(255,255,255,.075),
            rgba(255,255,255,.018)
        ) !important;

    border:
        0 !important;

    border-bottom:
        1px solid
        rgba(255,255,255,.12) !important;

    backdrop-filter:
        blur(12px) !important;

    -webkit-backdrop-filter:
        blur(12px) !important;
}


#chatModal.${CHAT_CLASS}
.modalHeader > span:first-child {

    color:
        #ffffff !important;

    font-size:
        17px !important;

    font-weight:
        850 !important;

    letter-spacing:
        -.2px;

    text-shadow:
        0 2px 12px
        rgba(0,0,0,.20);
}


/* ================================================================
   HEADER BUTTONS
   ================================================================ */

#chatModal.${CHAT_CLASS}
.chatHeaderActions {

    display:
        flex !important;

    align-items:
        center !important;

    gap:
        8px !important;
}


#chatModal.${CHAT_CLASS}
.resetChatBtn {

    height:
        36px !important;

    padding:
        0 14px !important;

    border:
        1px solid
        rgba(255,255,255,.18) !important;

    border-radius:
        10px !important;

    background:
        linear-gradient(
            135deg,
            rgba(255,72,105,.98),
            rgba(244,63,94,.88)
        ) !important;

    color:
        #ffffff !important;

    font-size:
        10px !important;

    font-weight:
        850 !important;

    cursor:
        pointer !important;

    transition:
        .18s ease !important;
}


#chatModal.${CHAT_CLASS}
.resetChatBtn:hover {

    transform:
        translateY(-1px);

    filter:
        brightness(1.08);
}


#chatModal.${CHAT_CLASS}
.closeModal {

    width:
        36px !important;

    height:
        36px !important;

    padding:
        0 !important;

    display:
        flex !important;

    align-items:
        center !important;

    justify-content:
        center !important;

    border:
        1px solid
        rgba(255,255,255,.12) !important;

    border-radius:
        11px !important;

    background:
        rgba(255,255,255,.045) !important;

    color:
        #ff4f9a !important;

    cursor:
        pointer !important;

    transition:
        .20s ease !important;
}


#chatModal.${CHAT_CLASS}
.closeModal:hover {

    transform:
        rotate(90deg)
        scale(1.05);

    background:
        rgba(255,255,255,.08) !important;
}


/* ================================================================
   AI STATUS
   ================================================================ */

#vuscriptChatStatus {

    flex:
        0 0 auto !important;

    box-sizing:
        border-box !important;

    min-height:
        42px !important;

    margin:
        10px 15px 0 !important;

    padding:
        9px 12px !important;

    display:
        flex !important;

    align-items:
        center !important;

    gap:
        8px !important;

    border:
        1px solid
        rgba(255,255,255,.15) !important;

    border-radius:
        12px !important;

    background:
        rgba(255,255,255,.055) !important;

    backdrop-filter:
        blur(10px) !important;

    -webkit-backdrop-filter:
        blur(10px) !important;

    color:
        rgba(255,255,255,.78) !important;

    font-size:
        10px !important;

    font-weight:
        700 !important;
}


.vuscript-status-dot {

    width:
        7px;

    height:
        7px;

    flex:
        0 0 7px;

    border-radius:
        50%;

    background:
        #22c55e;

    box-shadow:
        0 0 9px
        rgba(34,197,94,.75);

    animation:
        vuscriptDotPulse
        1.8s
        ease-in-out
        infinite;
}


@keyframes vuscriptDotPulse {

    0%,100% {
        opacity:
            .55;

        transform:
            scale(.82);
    }

    50% {
        opacity:
            1;

        transform:
            scale(1.15);
    }
}


/* ================================================================
   META
   ================================================================ */

#vuscriptChatMeta {

    flex:
        0 0 auto !important;

    min-height:
        20px !important;

    margin:
        7px 17px 0 !important;

    padding:
        0 !important;

    display:
        flex !important;

    justify-content:
        space-between !important;

    align-items:
        center !important;

    color:
        rgba(255,255,255,.52) !important;

    font-size:
        9px !important;

    font-weight:
        700 !important;
}


/* ================================================================
   MESSAGE BOX
   ================================================================ */

#chatModal.${CHAT_CLASS}
.chatMessagesBox {

    flex:
        1 1 auto !important;

    min-height:
        130px !important;

    height:
        auto !important;

    box-sizing:
        border-box !important;

    margin:
        9px 15px 0 !important;

    padding:
        13px 11px !important;

    display:
        flex !important;

    flex-direction:
        column !important;

    gap:
        9px !important;

    overflow-y:
        auto !important;

    overflow-x:
        hidden !important;

    border:
        1px solid
        rgba(255,255,255,.19) !important;

    border-radius:
        16px !important;

    background:
        rgba(255,255,255,.045) !important;

    backdrop-filter:
        blur(5px)
        saturate(120%) !important;

    -webkit-backdrop-filter:
        blur(5px)
        saturate(120%) !important;

    box-shadow:
        inset 0 0 0 1px
        rgba(255,255,255,.018) !important;

    scrollbar-width:
        thin;

    scrollbar-color:
        rgba(255,79,154,.40)
        transparent;
}


#chatModal.${CHAT_CLASS}
.chatMessagesBox::-webkit-scrollbar {

    width:
        5px;
}


#chatModal.${CHAT_CLASS}
.chatMessagesBox::-webkit-scrollbar-track {

    background:
        transparent;
}


#chatModal.${CHAT_CLASS}
.chatMessagesBox::-webkit-scrollbar-thumb {

    border-radius:
        999px;

    background:
        linear-gradient(
            180deg,
            rgba(255,79,154,.60),
            rgba(139,92,246,.48)
        );
}


/* ================================================================
   MESSAGE
   ================================================================ */

#chatModal.${CHAT_CLASS}
.msgRow {

    width:
        fit-content !important;

    max-width:
        88% !important;

    box-sizing:
        border-box !important;

    padding:
        8px 10px !important;

    border:
        1px solid
        rgba(255,255,255,.12) !important;

    border-radius:
        13px !important;

    background:
        rgba(255,255,255,.065) !important;

    color:
        rgba(255,255,255,.90) !important;

    font-size:
        11px !important;

    line-height:
        1.5 !important;

    word-break:
        break-word !important;

    backdrop-filter:
        blur(7px) !important;

    -webkit-backdrop-filter:
        blur(7px) !important;

    animation:
        vuscriptMessageIn
        .20s
        ease both;
}


#chatModal.${CHAT_CLASS}
.msgRow b {

    color:
        #ff72aa !important;

    font-weight:
        850 !important;
}


@keyframes vuscriptMessageIn {

    from {

        opacity:
            0;

        transform:
            translateY(5px)
            scale(.985);
    }

    to {

        opacity:
            1;

        transform:
            translateY(0)
            scale(1);
    }
}


/* ================================================================
   IMAGE MESSAGE
   ================================================================ */

.vuscript-message-image {

    display:
        block !important;

    max-width:
        min(430px, 76vw) !important;

    max-height:
        360px !important;

    width:
        auto !important;

    height:
        auto !important;

    margin:
        5px 0 1px !important;

    border:
        1px solid
        rgba(255,255,255,.20) !important;

    border-radius:
        13px !important;

    object-fit:
        contain !important;

    cursor:
        zoom-in !important;

    background:
        rgba(255,255,255,.025) !important;

    box-shadow:
        0 8px 25px
        rgba(0,0,0,.10) !important;

    transition:
        .18s ease !important;
}


.vuscript-message-image:hover {

    transform:
        scale(1.012);

    filter:
        brightness(1.05);
}


/* ================================================================
   IMAGE PREVIEW
   ================================================================ */

.vuscript-image-preview {

    position:
        absolute;

    left:
        15px;

    right:
        15px;

    bottom:
        72px;

    z-index:
        50;

    display:
        none;

    align-items:
        center;

    gap:
        9px;

    box-sizing:
        border-box;

    padding:
        8px;

    border:
        1px solid
        rgba(255,255,255,.20);

    border-radius:
        13px;

    background:
        rgba(255,255,255,.075);

    backdrop-filter:
        blur(15px);

    -webkit-backdrop-filter:
        blur(15px);

    box-shadow:
        0 12px 35px
        rgba(0,0,0,.16);
}


.vuscript-image-preview.show {

    display:
        flex;
}


.vuscript-image-preview img {

    width:
        58px;

    height:
        58px;

    flex:
        0 0 58px;

    object-fit:
        cover;

    border-radius:
        10px;

    border:
        1px solid
        rgba(255,255,255,.20);
}


.vuscript-preview-info {

    flex:
        1;

    min-width:
        0;

    color:
        rgba(255,255,255,.76);

    font-size:
        9px;

    line-height:
        1.4;

    font-weight:
        700;
}


.vuscript-preview-remove {

    width:
        30px;

    height:
        30px;

    flex:
        0 0 30px;

    border:
        1px solid
        rgba(255,255,255,.14);

    border-radius:
        9px;

    background:
        rgba(239,68,68,.12);

    color:
        #fb7185;

    font-size:
        17px;

    cursor:
        pointer;
}


/* ================================================================
   INPUT
   ================================================================ */

#chatModal.${CHAT_CLASS}
.chatInputRow {

    flex:
        0 0 auto !important;

    box-sizing:
        border-box !important;

    margin:
        11px 15px 15px !important;

    padding:
        0 !important;

    display:
        flex !important;

    align-items:
        center !important;

    gap:
        8px !important;
}


#chatModal.${CHAT_CLASS}
.chatInputRow input {

    flex:
        1 1 auto !important;

    min-width:
        0 !important;

    height:
        47px !important;

    box-sizing:
        border-box !important;

    padding:
        0 13px !important;

    border:
        1px solid
        rgba(255,255,255,.18) !important;

    border-radius:
        13px !important;

    outline:
        none !important;

    background:
        rgba(255,255,255,.060) !important;

    backdrop-filter:
        blur(9px) !important;

    -webkit-backdrop-filter:
        blur(9px) !important;

    color:
        #ffffff !important;

    font-size:
        11px !important;

    transition:
        .18s ease !important;
}


#chatModal.${CHAT_CLASS}
.chatInputRow input::placeholder {

    color:
        rgba(255,255,255,.43) !important;
}


#chatModal.${CHAT_CLASS}
.chatInputRow input:focus {

    border-color:
        rgba(255,79,154,.45) !important;

    background:
        rgba(255,255,255,.080) !important;

    box-shadow:
        0 0 0 3px
        rgba(255,79,154,.065) !important;
}


/* ================================================================
   SEND BUTTON
   ================================================================ */

#chatModal.${CHAT_CLASS}
.chatInputRow button {

    flex:
        0 0 84px !important;

    width:
        84px !important;

    height:
        47px !important;

    box-sizing:
        border-box !important;

    border:
        1px solid
        rgba(255,255,255,.15) !important;

    border-radius:
        13px !important;

    background:
        linear-gradient(
            135deg,
            rgba(255,79,154,.98),
            rgba(236,72,153,.90)
        ) !important;

    color:
        #ffffff !important;

    font-size:
        11px !important;

    font-weight:
        900 !important;

    cursor:
        pointer !important;

    transition:
        .17s ease !important;
}


#chatModal.${CHAT_CLASS}
.chatInputRow button:hover {

    transform:
        translateY(-1px);

    filter:
        brightness(1.07);
}


/* ================================================================
   EMPTY
   ================================================================ */

.vuscript-chat-empty {

    flex:
        1;

    min-height:
        150px;

    display:
        flex;

    flex-direction:
        column;

    align-items:
        center;

    justify-content:
        center;

    text-align:
        center;

    color:
        rgba(255,255,255,.70);

    pointer-events:
        none;
}


.vuscript-empty-icon {

    width:
        56px;

    height:
        56px;

    display:
        flex;

    align-items:
        center;

    justify-content:
        center;

    margin-bottom:
        10px;

    border:
        1px solid
        rgba(255,79,154,.27);

    border-radius:
        16px;

    background:
        rgba(255,255,255,.04);

    font-size:
        25px;
}


.vuscript-chat-empty strong {

    font-size:
        13px;

    margin-bottom:
        3px;
}


.vuscript-chat-empty span {

    font-size:
        10px;

    color:
        rgba(255,255,255,.48);
}


/* ================================================================
   IMAGE VIEWER
   ================================================================ */

#vuscriptImageViewer {

    position:
        fixed !important;

    inset:
        0 !important;

    z-index:
        9999999 !important;

    display:
        flex !important;

    align-items:
        center !important;

    justify-content:
        center !important;

    padding:
        20px !important;

    box-sizing:
        border-box !important;

    background:
        rgba(0,0,0,.38) !important;

    backdrop-filter:
        blur(14px) !important;

    -webkit-backdrop-filter:
        blur(14px) !important;

    cursor:
        zoom-out !important;
}


#vuscriptImageViewer img {

    max-width:
        95vw !important;

    max-height:
        92vh !important;

    width:
        auto !important;

    height:
        auto !important;

    object-fit:
        contain !important;

    border:
        1px solid
        rgba(255,255,255,.25) !important;

    border-radius:
        16px !important;

    box-shadow:
        0 25px 80px
        rgba(0,0,0,.30) !important;
}


/* ================================================================
   MOBILE
   ================================================================ */

@media (max-width:600px) {

    #chatModal.${CHAT_CLASS} {

        width:
            calc(100vw - 10px) !important;

        height:
            calc(100vh - 10px) !important;

        max-width:
            calc(100vw - 10px) !important;

        max-height:
            calc(100vh - 10px) !important;

        border-radius:
            21px !important;
    }


    #chatModal.${CHAT_CLASS}
    .modalHeader {

        min-height:
            68px !important;

        padding:
            10px 11px !important;
    }


    #chatModal.${CHAT_CLASS}
    .modalHeader > span:first-child {

        font-size:
            13px !important;
    }


    #chatModal.${CHAT_CLASS}
    .resetChatBtn {

        padding:
            0 10px !important;
    }


    #chatModal.${CHAT_CLASS}
    .chatMessagesBox {

        margin:
            8px 9px 0 !important;
    }


    #chatModal.${CHAT_CLASS}
    .chatInputRow {

        margin:
            9px !important;
    }


    #chatModal.${CHAT_CLASS}
    .chatInputRow button {

        flex-basis:
            72px !important;

        width:
            72px !important;
    }


    .vuscript-image-preview {

        left:
            9px;

        right:
            9px;
    }


    .vuscript-message-image {

        max-width:
            72vw !important;

        max-height:
            280px !important;
    }
}

        `;


        document.head.appendChild(
            style
        );
    }


    /* ============================================================
       STATUS
       ============================================================ */

    function createStatus() {

        const chat =
            getChat();

        if (!chat) {
            return;
        }


        const header =
            chat.querySelector(
                ".modalHeader"
            );


        if (
            !document.getElementById(
                "vuscriptChatStatus"
            )
        ) {

            const status =
                document.createElement(
                    "div"
                );


            status.id =
                "vuscriptChatStatus";


            status.innerHTML = `

                <span
                    class="vuscript-status-dot"
                ></span>

                <span
                    class="vuscript-status-text"
                >
                    AI đang quan sát chat • Chờ "ê AI"
                </span>

            `;


            if (header) {

                header.insertAdjacentElement(
                    "afterend",
                    status
                );
            }
        }


        if (
            !document.getElementById(
                "vuscriptChatMeta"
            )
        ) {

            const meta =
                document.createElement(
                    "div"
                );


            meta.id =
                "vuscriptChatMeta";


            meta.innerHTML = `

                <span id="vuscriptChatMode">
                    Chế độ: Quan sát
                </span>

                <span id="vuscriptChatCounter">
                    0 tin nhắn
                </span>

            `;


            const status =
                document.getElementById(
                    "vuscriptChatStatus"
                );


            if (status) {

                status.insertAdjacentElement(
                    "afterend",
                    meta
                );
            }
        }
    }


    /* ============================================================
       IMAGE PREVIEW
       ============================================================ */

    function createImagePreview() {

        const chat =
            getChat();

        if (!chat) {
            return;
        }


        if (
            chat.querySelector(
                ".vuscript-image-preview"
            )
        ) {

            return;
        }


        const preview =
            document.createElement(
                "div"
            );


        preview.className =
            "vuscript-image-preview";


        preview.innerHTML = `

            <img
                class="vuscript-preview-img"
                alt="Ảnh chuẩn bị gửi"
            >

            <div
                class="vuscript-preview-info"
            >
                Ảnh đã dán
            </div>

            <button
                type="button"
                class="vuscript-preview-remove"
                title="Bỏ ảnh"
            >
                ×
            </button>

        `;


        const inputRow =
            chat.querySelector(
                ".chatInputRow"
            );


        if (inputRow) {

            chat.insertBefore(
                preview,
                inputRow
            );
        }


        const removeButton =
            preview.querySelector(
                ".vuscript-preview-remove"
            );


        if (removeButton) {

            removeButton.addEventListener(
                "click",
                () => {

                    clearPendingImage();
                }
            );
        }
    }


    function showImagePreview(
        dataUrl,
        originalSize
    ) {

        createImagePreview();


        const chat =
            getChat();


        const preview =
            chat?.querySelector(
                ".vuscript-image-preview"
            );


        if (!preview) {
            return;
        }


        const image =
            preview.querySelector(
                ".vuscript-preview-img"
            );


        const info =
            preview.querySelector(
                ".vuscript-preview-info"
            );


        if (image) {

            image.src =
                dataUrl;
        }


        if (info) {

            info.textContent =
                "Ảnh đã dán • " +
                formatBytes(
                    originalSize
                ) +
                " • Bấm Gửi";
        }


        preview.classList.add(
            "show"
        );
    }


    function clearPendingImage() {

        pendingImage =
            null;


        const chat =
            getChat();


        const preview =
            chat?.querySelector(
                ".vuscript-image-preview"
            );


        if (preview) {

            preview.classList.remove(
                "show"
            );
        }
    }


    /* ============================================================
       FORMAT BYTES
       ============================================================ */

    function formatBytes(
        bytes
    ) {

        if (
            !bytes ||
            bytes <= 0
        ) {

            return "0 KB";
        }


        if (
            bytes <
            1024 * 1024
        ) {

            return (
                Math.round(
                    bytes / 1024
                ) +
                " KB"
            );
        }


        return (
            (
                bytes /
                1024 /
                1024
            ).toFixed(1) +
            " MB"
        );
    }


    /* ============================================================
       COMPRESS IMAGE
       ============================================================ */

    function compressImage(
        file
    ) {

        return new Promise(
            (resolve, reject) => {

                if (
                    !file ||
                    !file.type.startsWith(
                        "image/"
                    )
                ) {

                    reject(
                        new Error(
                            "File không phải ảnh."
                        )
                    );

                    return;
                }


                const reader =
                    new FileReader();


                reader.onload = () => {

                    const img =
                        new Image();


                    img.onload = () => {

                        const MAX =
                            1280;


                        let width =
                            img.naturalWidth ||
                            img.width;


                        let height =
                            img.naturalHeight ||
                            img.height;


                        if (
                            width >
                            MAX
                        ) {

                            height =
                                height *
                                MAX /
                                width;

                            width =
                                MAX;
                        }


                        if (
                            height >
                            MAX
                        ) {

                            width =
                                width *
                                MAX /
                                height;

                            height =
                                MAX;
                        }


                        width =
                            Math.round(
                                width
                            );


                        height =
                            Math.round(
                                height
                            );


                        const canvas =
                            document.createElement(
                                "canvas"
                            );


                        canvas.width =
                            width;

                        canvas.height =
                            height;


                        const ctx =
                            canvas.getContext(
                                "2d"
                            );


                        if (!ctx) {

                            reject(
                                new Error(
                                    "Không tạo được canvas."
                                )
                            );

                            return;
                        }


                        ctx.drawImage(
                            img,
                            0,
                            0,
                            width,
                            height
                        );


                        /*
                         * Ưu tiên WebP.
                         */

                        let dataUrl =
                            canvas.toDataURL(
                                "image/webp",
                                0.72
                            );


                        /*
                         * Nếu quá lớn,
                         * giảm chất lượng.
                         */

                        if (
                            dataUrl.length >
                            900000
                        ) {

                            dataUrl =
                                canvas.toDataURL(
                                    "image/webp",
                                    0.58
                                );
                        }


                        if (
                            dataUrl.length >
                            1200000
                        ) {

                            dataUrl =
                                canvas.toDataURL(
                                    "image/jpeg",
                                    0.52
                                );
                        }


                        if (
                            dataUrl.length >
                            1500000
                        ) {

                            dataUrl =
                                canvas.toDataURL(
                                    "image/jpeg",
                                    0.40
                                );
                        }


                        resolve(
                            dataUrl
                        );
                    };


                    img.onerror =
                        () => {

                            reject(
                                new Error(
                                    "Không đọc được ảnh."
                                )
                            );
                        };


                    img.src =
                        reader.result;
                };


                reader.onerror =
                    () => {

                        reject(
                            new Error(
                                "Không đọc được dữ liệu ảnh."
                            )
                        );
                    };


                reader.readAsDataURL(
                    file
                );
            }
        );
    }


    /* ============================================================
       CTRL + V
       ============================================================ */

    function setupPasteImage() {

        const input =
            getInput();


        if (!input) {

            return;
        }


        if (
            input.dataset
                .vuscriptPasteInstalled ===
            "1"
        ) {

            return;
        }


        input.dataset
            .vuscriptPasteInstalled =
            "1";


        input.addEventListener(
            "paste",
            async (event) => {

                const clipboard =
                    event.clipboardData;


                if (!clipboard) {
                    return;
                }


                const items =
                    clipboard.items;


                if (!items) {
                    return;
                }


                let imageFile =
                    null;


                for (
                    let i = 0;
                    i < items.length;
                    i++
                ) {

                    const item =
                        items[i];


                    if (
                        item.kind ===
                        "file" &&

                        item.type.startsWith(
                            "image/"
                        )
                    ) {

                        imageFile =
                            item.getAsFile();

                        break;
                    }
                }


                /*
                 * Nếu Ctrl+V chữ,
                 * không can thiệp.
                 */

                if (!imageFile) {
                    return;
                }


                /*
                 * Chặn browser dán ảnh
                 * vào input.
                 */

                event.preventDefault();


                try {

                    const dataUrl =
                        await compressImage(
                            imageFile
                        );


                    pendingImage = {

                        dataUrl:
                            dataUrl,

                        type:
                            imageFile.type,

                        originalSize:
                            imageFile.size,

                        name:
                            imageFile.name ||
                            "pasted-image"
                    };


                    showImagePreview(
                        dataUrl,
                        imageFile.size
                    );


                    console.log(
                        "[VUSCRIPT CHAT] Đã nhận ảnh từ Ctrl+V."
                    );


                } catch (error) {

                    console.error(
                        "[VUSCRIPT CHAT] Paste image error:",
                        error
                    );


                    alert(
                        "Không thể xử lý ảnh này."
                    );
                }

            }
        );
    }


    /* ============================================================
       SEND IMAGE
       ============================================================ */

    async function sendPendingImage() {

        if (!pendingImage) {

            return false;
        }


        const messagesRef =
            getMessagesRef();


        if (!messagesRef) {

            alert(
                "Firebase Database chưa sẵn sàng."
            );

            return true;
        }


        const image =
            pendingImage;


        const message = {

            sender:
                getCurrentUser(),

            text:
                "[Hình ảnh]",

            type:
                IMAGE_TYPE,

            imageData:
                image.dataUrl,

            imageType:
                image.type,

            time:
                Date.now()
        };


        try {

            await messagesRef.push(
                message
            );


            clearPendingImage();


            const input =
                getInput();


            if (input) {

                input.focus();
            }


            console.log(
                "[VUSCRIPT CHAT] Đã gửi ảnh."
            );


        } catch (error) {

            console.error(
                "[VUSCRIPT CHAT] Send image error:",
                error
            );


            alert(
                "Gửi ảnh thất bại.\n\n" +
                "Có thể Firebase Rules đang giới hạn dữ liệu."
            );
        }


        /*
         * true = đã xử lý,
         * không cho handler cũ gửi thêm.
         */

        return true;
    }


    /* ============================================================
       INTERCEPT SEND
       ============================================================ */

    function setupSendButton() {

        const chat =
            getChat();


        const input =
            getInput();


        if (
            !chat ||
            !input
        ) {

            return;
        }


        const button =
            chat.querySelector(
                ".chatInputRow button"
            );


        if (button) {

            if (
                button.dataset
                    .vuscriptImageSendInstalled !==
                "1"
            ) {

                button.dataset
                    .vuscriptImageSendInstalled =
                    "1";


                button.addEventListener(
                    "click",
                    async (event) => {

                        if (
                            !pendingImage
                        ) {

                            /*
                             * Không có ảnh:
                             * để index.html xử lý
                             * tin nhắn chữ.
                             */

                            return;
                        }


                        event.preventDefault();

                        event.stopImmediatePropagation();


                        await sendPendingImage();

                    },
                    true
                );
            }
        }


        /*
         * Enter khi đang có ảnh.
         */

        if (
            input.dataset
                .vuscriptImageEnterInstalled !==
            "1"
        ) {

            input.dataset
                .vuscriptImageEnterInstalled =
                "1";


            input.addEventListener(
                "keydown",
                async (event) => {

                    if (
                        event.key !==
                        "Enter"
                    ) {

                        return;
                    }


                    if (
                        event.shiftKey
                    ) {

                        return;
                    }


                    if (
                        !pendingImage
                    ) {

                        return;
                    }


                    event.preventDefault();

                    event.stopImmediatePropagation();


                    await sendPendingImage();

                },
                true
            );
        }
    }


    /* ============================================================
       IMAGE CHECK
       ============================================================ */

    function isImageMessage(
        data
    ) {

        return (
            data &&
            data.type ===
                IMAGE_TYPE &&
            typeof data.imageData ===
                "string" &&
            data.imageData.startsWith(
                "data:image/"
            )
        );
    }


    /* ============================================================
       RENDER ONE MESSAGE
       ============================================================ */

    function createMessageElement(
        key,
        data
    ) {

        const row =
            document.createElement(
                "div"
            );


        row.className =
            "msgRow";


        row.dataset.messageId =
            key || "";


        const name =
            document.createElement(
                "b"
            );


        name.textContent =
            `${data.sender || "Ai đó"}: `;


        row.appendChild(
            name
        );


        /*
         * ============================
         * IMAGE
         * ============================
         */

        if (
            isImageMessage(data)
        ) {

            const image =
                document.createElement(
                    "img"
                );


            image.className =
                "vuscript-message-image";


            image.src =
                data.imageData;


            image.alt =
                "Ảnh trong tin nhắn";


            image.loading =
                "lazy";


            image.decoding =
                "async";


            image.addEventListener(
                "click",
                () => {

                    openImageViewer(
                        data.imageData
                    );
                }
            );


            row.appendChild(
                image
            );


            return row;
        }


        /*
         * ============================
         * TEXT
         * ============================
         */

        const text =
            document.createElement(
                "span"
            );


        text.textContent =
            data.text || "";


        row.appendChild(
            text
        );


        return row;
    }


    /* ============================================================
       EMPTY STATE
       ============================================================ */

    function showEmptyState() {

        const list =
            getList();


        if (!list) {
            return;
        }


        if (
            list.querySelector(
                ".vuscript-chat-empty"
            )
        ) {

            return;
        }


        const empty =
            document.createElement(
                "div"
            );


        empty.className =
            "vuscript-chat-empty";


        empty.innerHTML = `

            <div
                class="vuscript-empty-icon"
            >
                💬
            </div>

            <strong>
                Chưa có tin nhắn
            </strong>

            <span>
                Nhắn một câu để bắt đầu cuộc trò chuyện.
            </span>

        `;


        list.appendChild(
            empty
        );
    }


    function removeEmptyState() {

        const list =
            getList();


        if (!list) {
            return;
        }


        const empty =
            list.querySelector(
                ".vuscript-chat-empty"
            );


        if (empty) {

            empty.remove();
        }
    }


    /* ============================================================
       UPDATE COUNTER
       ============================================================ */

    function updateCounter(
        count
    ) {

        const counter =
            document.getElementById(
                "vuscriptChatCounter"
            );


        if (counter) {

            counter.textContent =
                `${count} tin nhắn`;
        }
    }


    /* ============================================================
       RENDER ALL
       ============================================================ */

    function renderSnapshot(
        snapshot
    ) {

        const list =
            getList();


        if (
            !list ||
            !snapshot
        ) {

            return;
        }


        if (renderingMessages) {

            return;
        }


        renderingMessages =
            true;


        try {

            list.innerHTML =
                "";


            if (
                !snapshot.exists()
            ) {

                updateCounter(
                    0
                );

                showEmptyState();

                return;
            }


            removeEmptyState();


            let count =
                0;


            snapshot.forEach(
                (child) => {

                    const data =
                        child.val() ||
                        {};


                    const row =
                        createMessageElement(
                            child.key,
                            data
                        );


                    list.appendChild(
                        row
                    );


                    count++;
                }
            );


            updateCounter(
                count
            );


            requestAnimationFrame(
                () => {

                    list.scrollTop =
                        list.scrollHeight;
                }
            );


        } finally {

            /*
             * Đợi MutationObserver của
             * index.html chạy xong.
             */

            setTimeout(
                () => {

                    renderingMessages =
                        false;

                },
                40
            );
        }
    }


    /* ============================================================
       SCHEDULE RENDER
       ============================================================ */

    function scheduleRender(
        snapshot
    ) {

        latestFirebaseSnapshot =
            snapshot;


        clearTimeout(
            renderTimer
        );


        renderTimer =
            setTimeout(
                () => {

                    renderSnapshot(
                        snapshot
                    );

                },
                25
            );
    }


    /* ============================================================
       FIREBASE LISTENER
       ============================================================ */

    function setupFirebaseRenderer() {

        if (
            firebaseListenerReady
        ) {

            return;
        }


        const ref =
            getMessagesRef();


        if (!ref) {

            /*
             * Firebase của index.html
             * có thể chưa khởi tạo.
             */

            setTimeout(
                setupFirebaseRenderer,
                500
            );

            return;
        }


        firebaseListenerReady =
            true;


        ref.on(
            "value",
            (snapshot) => {

                latestFirebaseSnapshot =
                    snapshot;


                scheduleRender(
                    snapshot
                );
            }
        );


        /*
         * Lấy dữ liệu hiện tại ngay lập tức.
         */

        ref.once(
            "value"
        )
        .then(
            (snapshot) => {

                latestFirebaseSnapshot =
                    snapshot;

                scheduleRender(
                    snapshot
                );
            }
        )
        .catch(
            (error) => {

                console.error(
                    "[VUSCRIPT CHAT] Firebase read error:",
                    error
                );
            }
        );
    }


    /* ============================================================
       GUARD INDEX RENDERER
       ============================================================

       index.html cũ vẫn có listener:

           messages.on("child_added", ...)

       Khi nó ghi lại:

           Vũ: [Hình ảnh]

       Observer phát hiện và render lại từ Firebase,
       lần này ảnh thật sẽ được sử dụng.
    */

    function setupRenderGuard() {

        const list =
            getList();


        if (!list) {

            setTimeout(
                setupRenderGuard,
                500
            );

            return;
        }


        if (observerReady) {
            return;
        }


        observerReady =
            true;


        const observer =
            new MutationObserver(
                () => {

                    if (
                        renderingMessages
                    ) {

                        return;
                    }


                    if (
                        !latestFirebaseSnapshot
                    ) {

                        return;
                    }


                    /*
                     * Chỉ sửa lại khi renderer
                     * cũ thực sự đã ghi đè.
                     */

                    const imagePlaceholder =
                        list.querySelector(
                            ".msgRow"
                        );


                    if (
                        !imagePlaceholder
                    ) {

                        return;
                    }


                    /*
                     * Nếu Firebase có ảnh,
                     * kiểm tra DOM có ảnh tương ứng.
                     */

                    let firebaseHasImage =
                        false;


                    try {

                        latestFirebaseSnapshot
                            .forEach(
                                (child) => {

                                    if (
                                        isImageMessage(
                                            child.val()
                                        )
                                    ) {

                                        firebaseHasImage =
                                            true;
                                    }
                                }
                            );

                    } catch (e) {}


                    if (
                        !firebaseHasImage
                    ) {

                        return;
                    }


                    const actualImages =
                        list.querySelectorAll(
                            ".vuscript-message-image"
                        );


                    /*
                     * Có ảnh rồi thì không cần
                     * render lại.
                     */

                    if (
                        actualImages.length
                    ) {

                        return;
                    }


                    /*
                     * Renderer cũ đã biến ảnh
                     * thành [Hình ảnh].
                     */

                    const hasPlaceholder =
                        list.textContent.includes(
                            "[Hình ảnh]"
                        );


                    if (
                        hasPlaceholder
                    ) {

                        scheduleRender(
                            latestFirebaseSnapshot
                        );
                    }

                }
            );


        observer.observe(
            list,
            {
                childList:
                    true,

                subtree:
                    true
            }
        );
    }


    /* ============================================================
       IMAGE VIEWER
       ============================================================ */

    function openImageViewer(
        src
    ) {

        if (!src) {
            return;
        }


        const old =
            document.getElementById(
                "vuscriptImageViewer"
            );


        if (old) {

            old.remove();
        }


        const viewer =
            document.createElement(
                "div"
            );


        viewer.id =
            "vuscriptImageViewer";


        const image =
            document.createElement(
                "img"
            );


        image.src =
            src;


        image.alt =
            "Ảnh phóng to";


        viewer.appendChild(
            image
        );


        viewer.addEventListener(
            "click",
            () => {

                viewer.remove();
            }
        );


        document.body.appendChild(
            viewer
        );
    }


    /* ============================================================
       ESC CLOSE IMAGE
       ============================================================ */

    function setupEscape() {

        if (
            document.body.dataset
                .vuscriptEscapeReady ===
            "1"
        ) {

            return;
        }


        document.body.dataset
            .vuscriptEscapeReady =
            "1";


        document.addEventListener(
            "keydown",
            (event) => {

                if (
                    event.key !==
                    "Escape"
                ) {

                    return;
                }


                const viewer =
                    document.getElementById(
                        "vuscriptImageViewer"
                    );


                if (viewer) {

                    viewer.remove();
                }


                if (
                    pendingImage
                ) {

                    clearPendingImage();
                }
            }
        );
    }


    /* ============================================================
       AI STATUS
       ============================================================ */

    function setAIStatus(
        mode
    ) {

        const text =
            document.querySelector(
                "#vuscriptChatStatus .vuscript-status-text"
            );


        const modeElement =
            document.getElementById(
                "vuscriptChatMode"
            );


        if (
            mode === "ai" ||
            mode === "chatting"
        ) {

            if (text) {

                text.textContent =
                    'AI đang trò chuyện • Đã bật bằng "ê AI"';
            }


            if (modeElement) {

                modeElement.textContent =
                    "Chế độ: Trò chuyện với AI";
            }


            return;
        }


        if (
            mode === "muted" ||
            mode === "silent"
        ) {

            if (text) {

                text.textContent =
                    'AI đang im lặng • Gõ "ê AI" để gọi lại';
            }


            if (modeElement) {

                modeElement.textContent =
                    "Chế độ: Quan sát / im";
            }


            return;
        }


        if (text) {

            text.textContent =
                'AI đang quan sát chat • Chờ "ê AI"';
        }


        if (modeElement) {

            modeElement.textContent =
                "Chế độ: Quan sát";
        }
    }


    /* ============================================================
       COMMUNICATION BRIDGE
       ============================================================ */

    function setupCommunication() {

        window.VuscriptChat = {

            version:
                VERSION,


            refresh: function () {

                injectCSS();

                createStatus();

                createImagePreview();

                setupPasteImage();

                setupSendButton();

                setupFirebaseRenderer();

                setupRenderGuard();
            },


            setAIStatus:
                function(mode) {

                    setAIStatus(
                        mode
                    );
                },


            clearImage:
                function() {

                    clearPendingImage();
                },


            hasImage:
                function() {

                    return !!pendingImage;
                },


            getInfo:
                function() {

                    const list =
                        getList();


                    return {

                        version:
                            VERSION,

                        chat:
                            !!getChat(),

                        input:
                            !!getInput(),

                        firebase:
                            !!getMessagesRef(),

                        pasteImage:
                            true,

                        pendingImage:
                            !!pendingImage,

                        messages:
                            list
                                ? list.querySelectorAll(
                                    ".msgRow"
                                ).length
                                : 0
                    };
                }
        };


        /*
         * index.html có thể gọi:

            window.dispatchEvent(
                new CustomEvent(
                    "vuscript:chat-command",
                    {
                        detail: {
                            command: "refresh"
                        }
                    }
                )
            );

         */


        window.addEventListener(
            "vuscript:chat-command",
            (event) => {

                const command =
                    event.detail?.command;


                if (
                    command ===
                    "refresh"
                ) {

                    window.VuscriptChat
                        .refresh();

                    return;
                }


                if (
                    command ===
                    "ai"
                ) {

                    setAIStatus(
                        "ai"
                    );

                    return;
                }


                if (
                    command ===
                    "muted"
                ) {

                    setAIStatus(
                        "muted"
                    );

                    return;
                }


                if (
                    command ===
                    "observe"
                ) {

                    setAIStatus(
                        "observe"
                    );
                }
            }
        );


        /*
         * Cho AI trong index.html
         * giao tiếp với giao diện.
         */

        window.addEventListener(
            "vuscript:ai-state",
            (event) => {

                const state =
                    event.detail?.state ||
                    "observe";


                setAIStatus(
                    state
                );
            }
        );
    }


    /* ============================================================
       WATCH CHAT CREATED LATE
       ============================================================ */

    function waitForChat() {

        const chat =
            getChat();


        if (!chat) {

            setTimeout(
                waitForChat,
                300
            );

            return;
        }


        init();
    }


    /* ============================================================
       INIT
       ============================================================ */

    function init() {

        if (initialized) {

            return;
        }


        const chat =
            getChat();


        if (!chat) {

            return;
        }


        initialized =
            true;


        injectCSS();


        chat.classList.add(
            CHAT_CLASS
        );


        createStatus();

        createImagePreview();

        setupPasteImage();

        setupSendButton();

        setupFirebaseRenderer();

        setupRenderGuard();

        setupEscape();

        setupCommunication();


        setAIStatus(
            "observe"
        );


        console.log(
            `%c[VUSCRIPT CHAT.JS]%c v${VERSION} loaded`,
            "font-weight:900;color:#ff4f9a",
            "color:#ddd"
        );


        console.log(
            "%cCtrl + V%c ảnh để dán vào chat.",
            "font-weight:900;color:#00d9ff",
            "color:#ddd"
        );
    }


    /* ============================================================
       START
       ============================================================ */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            waitForChat,
            {
                once:
                    true
            }
        );

    } else {

        waitForChat();
    }


})();