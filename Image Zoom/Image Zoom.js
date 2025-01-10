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
                modal.addEventListener('wheel', (event) => {
                    event.preventDefault();
                    let scale = parseFloat(modalImage.dataset.scale);
                    scale *= event.deltaY < 0 ? zoomFactor : 1 / zoomFactor;
                    scale = Math.min(Math.max(scale, minZoomScale), maxZoomScale);
                    modalImage.dataset.scale = scale;
                    modalImage.style.transform = `scale(${scale})`;
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
