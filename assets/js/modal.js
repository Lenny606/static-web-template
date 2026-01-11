/**
 * Reusable Image Modal
 * Scans for images matching the selector and enables a lightbox/modal view.
 */

class ImageModal {
    constructor(selector = '.project-gallery img, .narrative-visual img, .project-hero-bg img') {
        this.images = Array.from(document.querySelectorAll(selector));
        this.currentIndex = 0;
        this.isOpen = false;

        if (this.images.length === 0) {
            console.warn('ImageModal: No images found for selector:', selector);
            return;
        }

        this.init();
    }

    init() {
        this.createModalHTML();
        this.addEventListeners();
    }

    createModalHTML() {
        // Check if modal already exists
        if (document.querySelector('.image-modal-overlay')) return;

        const modalHTML = `
            <div class="image-modal-overlay" id="image-modal" aria-hidden="true" role="dialog">
                <button class="image-modal-close" aria-label="Close modal">
                    <span class="material-symbols-outlined">close</span>
                </button>
                
                <button class="image-modal-nav image-modal-prev" aria-label="Previous image">
                    <span class="material-symbols-outlined">chevron_left</span>
                </button>
                
                <div class="image-modal-content">
                    <img src="" alt="" class="image-modal-img" id="modal-image">
                    <div class="image-modal-caption" id="modal-caption"></div>
                </div>
                
                <button class="image-modal-nav image-modal-next" aria-label="Next image">
                    <span class="material-symbols-outlined">chevron_right</span>
                </button>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Cache elements
        this.modal = document.getElementById('image-modal');
        this.modalImg = document.getElementById('modal-image');
        this.modalCaption = document.getElementById('modal-caption');
        this.closeBtn = this.modal.querySelector('.image-modal-close');
        this.prevBtn = this.modal.querySelector('.image-modal-prev');
        this.nextBtn = this.modal.querySelector('.image-modal-next');
    }

    addEventListeners() {
        // click events for images
        this.images.forEach((img, index) => {
            img.style.cursor = 'pointer';
            img.addEventListener('click', (e) => {
                e.preventDefault();
                this.openModal(index);
            });
        });

        // Navigation and Close
        this.closeBtn.addEventListener('click', () => this.closeModal());
        this.prevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.prevImage();
        });
        this.nextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.nextImage();
        });

        // Click outside to close
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal || e.target.classList.contains('image-modal-content')) {
                this.closeModal();
            }
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (!this.isOpen) return;

            if (e.key === 'Escape') this.closeModal();
            if (e.key === 'ArrowLeft') this.prevImage();
            if (e.key === 'ArrowRight') this.nextImage();
        });

        // Touch swipe support
        let touchStartX = 0;
        let touchEndX = 0;

        this.modal.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        this.modal.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe();
        }, { passive: true });

        this.handleSwipe = () => {
            const threshold = 50;
            if (touchEndX < touchStartX - threshold) this.nextImage();
            if (touchEndX > touchStartX + threshold) this.prevImage();
        };
    }

    openModal(index) {
        this.currentIndex = index;
        this.updateModalContent();
        this.modal.classList.add('open');
        this.modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
        this.isOpen = true;
    }

    closeModal() {
        this.modal.classList.remove('open');
        this.modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        this.isOpen = false;

        // Slight delay to clear src after transition for cleaner reopen
        setTimeout(() => {
            if (!this.isOpen) this.modalImg.src = '';
        }, 300);
    }

    updateModalContent() {
        const currentImg = this.images[this.currentIndex];

        // Fade out slightly before changing (optional, keeping it simple for now)
        this.modalImg.src = currentImg.src; // Or define a data-full-size attribute
        this.modalImg.alt = currentImg.alt;

        const caption = currentImg.getAttribute('alt') || '';
        if (caption) {
            this.modalCaption.textContent = caption;
            this.modalCaption.style.display = 'block';
        } else {
            this.modalCaption.style.display = 'none';
        }

        // Preload adjacent images
        this.preloadImage(this.currentIndex + 1);
        this.preloadImage(this.currentIndex - 1);
    }

    nextImage() {
        this.currentIndex = (this.currentIndex + 1) % this.images.length;
        this.updateModalContent();
    }

    prevImage() {
        this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
        this.updateModalContent();
    }

    preloadImage(index) {
        const realIndex = (index + this.images.length) % this.images.length;
        const img = new Image();
        img.src = this.images[realIndex].src;
    }
}

// Auto-init on load if script is included directly
document.addEventListener('DOMContentLoaded', () => {
    // Check if we are on a page that needs this
    // We can expose the class globally to manual init or just auto init
    window.ImageModal = ImageModal;
});
