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
        // Only works for text notes
        if (note.type !== 'text') {
            return;
        }

        $(document).ready(function () {
            var container = $("div.note-split:not(.hidden-ext) > div.scrolling-container > div.note-detail");

            // Retrieve zoom scale configuration from the config object
            const minZoomScale = config.minZoomScale;
            const maxZoomScale = config.maxZoomScale;
            const zoomFactor = config.zoomFactor;

            // Ensure all config variables are set
            if (minZoomScale === undefined || maxZoomScale === undefined || zoomFactor === undefined) {
                console.error('Error: Zoom scale configuration missing!');
                return;
            }

            function enableImagePreview($images) {
                // Create the modal element
                const modal = document.createElement('div');
                modal.classList.add('image-preview-modal');

                // Create the image inside the modal
                const modalImage = document.createElement('img');
                modal.appendChild(modalImage);

                // Append the modal to the body
                document.body.appendChild(modal);

                // Function to close the modal
                function closeModal() {
                    modal.style.display = 'none';
                    modalImage.style.transform = 'scale(1)'; // Reset scaling
                    modalImage.dataset.scale = 1; // Reset scale value
                    modalImage.style.left = '0px'; // Reset position
                    modalImage.style.top = '0px'; // Reset position
                }

                // Close the modal when clicking outside the image
                modal.addEventListener('click', (event) => {
                    if (event.target !== modalImage) {
                        closeModal();
                    }
                });

                // Bind click event to each image element
                $images.each(function () {
                    const img = this; // Get the current image element
                    img.style.cursor = 'pointer'; // Set cursor to pointer
                    img.addEventListener('click', (e) => {
                        e.stopPropagation(); // Prevent event bubbling to close the modal
                        modalImage.src = img.src;
                        modal.style.display = 'flex'; // Show the modal
                    });
                });

                // Close the modal when pressing the 'Esc' key
                document.addEventListener('keydown', (event) => {
                    if (event.key === 'Escape') {
                        closeModal();
                    }
                });

                // Dragging logic for the image
                let isDragging = false; // Whether the image is being dragged
                let startX = 0; // Initial X coordinate when mouse is pressed
                let startY = 0; // Initial Y coordinate when mouse is pressed
                let initialLeft = 0; // Initial left position of the image
                let initialTop = 0; // Initial top position of the image

                modalImage.addEventListener('mousedown', (e) => {
                    isDragging = true;
                    startX = e.clientX;
                    startY = e.clientY;
                    initialLeft = parseInt(modalImage.style.left || 0);
                    initialTop = parseInt(modalImage.style.top || 0);
                    modalImage.classList.add('grabbing'); // Add grabbing cursor style
                    e.preventDefault(); // Prevent text selection
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
                        modalImage.classList.remove('grabbing'); // Remove grabbing cursor style
                    }
                });

                // Mouse wheel zoom functionality
                modalImage.dataset.scale = 1; // Set initial zoom scale
                modal.addEventListener('wheel', (event) => {
                    event.preventDefault(); // Prevent page scroll
                    let scale = parseFloat(modalImage.dataset.scale);
                    if (event.deltaY < 0) {
                        scale *= zoomFactor; // Zoom in
                    } else {
                        scale /= zoomFactor; // Zoom out
                    }
                    // Limit zoom scale range using the config values
                    scale = Math.min(Math.max(scale, minZoomScale), maxZoomScale);
                    modalImage.dataset.scale = scale;
                    modalImage.style.transform = `scale(${scale})`;
                });
            }

            function performOperationWhenReady(container) {
                const images = container.find("img");
                enableImagePreview(images);
            }

            // Wait for the editor to load the content
            setTimeout(performOperationWhenReady, config.executeDelay, container);
        });
    }
}

module.exports = new ImagePreviewWidget();
