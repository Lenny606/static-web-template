document.addEventListener('DOMContentLoaded', () => {
    const scrollToTopBtn = document.getElementById('scrollToTopBtn');

    if (scrollToTopBtn) {
        // Show/Hide button based on scroll position
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                scrollToTopBtn.classList.remove('opacity-0', 'pointer-events-none');
                scrollToTopBtn.classList.add('opacity-100', 'pointer-events-auto');
            } else {
                scrollToTopBtn.classList.remove('opacity-100', 'pointer-events-auto');
                scrollToTopBtn.classList.add('opacity-0', 'pointer-events-none');
            }
        });

        // Scroll to top on click
        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
});
