// Trilium Notes Image Zoom Widget
// check for updates:
// https://github.com/Nriver/image-zoom-widget/releases

// Access translations based on the selected language
const i18n = key => translations.trans[config.lang][key];

class ImagePreviewWidget extends api.NoteContextAwareWidget {
    get position() {
        return 100;
    }
    get parentWidget() {
        return 'center-pane';
    }

    isEnabled() {
        return super.isEnabled();
    }

    doRender() {
        this.$widget = $(`
            <style>
                /* Modal box styles */
                .image-preview-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0, 0, 0, 0.8);
                    display: none;
                    justify-content: center;
                    align-items: center;
                    z-index: 10000;
                    overflow: hidden;
                }

                /* Image styles */
                .image-preview-modal img {
                    transition: transform 0.3s ease;
                    cursor: grab;
                    position: relative;
                }

                /* Cursor style when dragging */
                .image-preview-modal img.grabbing {
                    cursor: grabbing;
                }

                /* Right-click menu styles */
                .context-menu {
                    position: absolute;
                    background-color: var(--menu-background-color);
                    border: 1px solid var(--menu-text-color);
                    color: var(--menu-text-color);
                    padding: 5px;
                    z-index: 10001;
                    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
                }

                .context-menu div {
                    padding: 5px;
                    cursor: pointer;
                }

                .context-menu div:hover {
                    background-color: var(--hover-item-background-color);
                    color: var(--hover-item-text-color);
                }
            </style>
        `);
        return this.$widget;
    }

    async refreshWithNote(note) {
        if (note.type !== 'text') {
            return;
        }

        $(document).ready(function () {
            const container = $("div.note-split:not(.hidden-ext) > div.scrolling-container > div.note-detail");

            // Retrieve zoom scale configuration from the config object
            const { minZoomScale, maxZoomScale, zoomFactor, executeDelay } = config;
            if (minZoomScale === undefined || maxZoomScale === undefined || zoomFactor === undefined) {
                console.error('Error: Zoom scale configuration missing!');
                return;
            }

            // Enable image preview functionality
            function enableImagePreview($images) {
                const modal = document.querySelector('.image-preview-modal') || document.createElement('div');
                modal.classList.add('image-preview-modal');
                const modalImage = modal.querySelector('img') || document.createElement('img');
                modal.appendChild(modalImage);
                if (!document.body.contains(modal)) {
                    document.body.appendChild(modal);
                }

                function closeModal() {
                    modal.style.display = 'none';
                    modalImage.style.transform = 'scale(1)';
                    modalImage.dataset.scale = 1;
                    modalImage.style.left = '0px';
                    modalImage.style.top = '0px';
                }

                modal.addEventListener('click', (event) => {
                    if (event.target !== modalImage) {
                        closeModal();
                    }
                });

                $images.each(function () {
                    const img = this;
                    img.style.cursor = 'pointer';
                    img.addEventListener('click', (e) => {
                        e.stopPropagation();
                        modalImage.src = img.src;
                        modal.style.display = 'flex';
                    });
                });

                document.addEventListener('keydown', (event) => {
                    if (event.key === 'Escape') {
                        closeModal();
                    }
                });

                let isDragging = false;
                let startX = 0;
                let startY = 0;
                let initialLeft = 0;
                let initialTop = 0;

                modalImage.addEventListener('mousedown', (e) => {
                    isDragging = true;
                    startX = e.clientX;
                    startY = e.clientY;
                    initialLeft = parseInt(modalImage.style.left || 0);
                    initialTop = parseInt(modalImage.style.top || 0);
                    modalImage.classList.add('grabbing');
                    e.preventDefault();
                });

                document.addEventListener('mousemove', (e) => {
                    if (isDragging) {
                        const deltaX = e.clientX - startX;
                        const deltaY = e.clientY - startY;
                        modalImage.style.left = `${initialLeft + deltaX}px`;
                        modalImage.style.top = `${initialTop + deltaY}px`;
                    }
                });

                document.addEventListener('mouseup', () => {
                    if (isDragging) {
                        isDragging = false;
                        modalImage.classList.remove('grabbing');
                    }
                });

                modalImage.dataset.scale = 1;

                // Bind wheel event only once
                if (!modalImage.dataset.wheelBound) {
                    modal.addEventListener('wheel', (event) => {
                        event.preventDefault();
                        let scale = parseFloat(modalImage.dataset.scale);
                        scale *= event.deltaY < 0 ? zoomFactor : 1 / zoomFactor;
                        scale = Math.min(Math.max(scale, minZoomScale), maxZoomScale);
                        console.log('image scale', scale);
                        modalImage.dataset.scale = scale;
                        modalImage.style.transform = `scale(${scale})`;
                    });
                    modalImage.dataset.wheelBound = 'true'; // Mark the wheel event as bound
                }

                // Add right-click menu for download
                modalImage.addEventListener('contextmenu', (e) => {
                    e.preventDefault();

                    const existingMenu = document.querySelector('.context-menu');
                    if (existingMenu) {
                        document.body.removeChild(existingMenu);
                    }

                    const menu = document.createElement('div');
                    menu.classList.add('context-menu');
                    menu.style.top = `${e.clientY}px`;
                    menu.style.left = `${e.clientX}px`;

                    const downloadOption = document.createElement('div');
                    downloadOption.textContent = i18n('downloadImage');
                    downloadOption.addEventListener('click', () => {
                        const a = document.createElement('a');
                        a.href = modalImage.src;
                        a.download = 'image';
                        a.click();
                        document.body.removeChild(menu);
                    });

                    menu.appendChild(downloadOption);

                    const copyOption = document.createElement('div');
                    copyOption.textContent = i18n('copyImage');
                    copyOption.addEventListener('click', async () => {
						const img = await fetch(modalImage.src);
                        const blob = await img.blob();
                        navigator.clipboard.write([new ClipboardItem({ 'image/png' : blob })]);
                    });

                    menu.appendChild(copyOption);
                    document.body.appendChild(menu);

                    document.addEventListener(
                        'click',
                        () => {
                            if (document.body.contains(menu)) {
                                document.body.removeChild(menu);
                            }
                        },
                        { once: true }
                    );
                });
            }

            function bindImageEvents(container) {
                const images = container.find("img");
                enableImagePreview(images);
            }

            // Monitor DOM changes for newly added images
            const observer = new MutationObserver(() => {
                bindImageEvents(container);
            });

            observer.observe(container[0], {
                childList: true,
                subtree: true,
            });

            // Initial bind for existing images
            setTimeout(() => bindImageEvents(container), executeDelay);
        });
    }
}

module.exports = new ImagePreviewWidget();
