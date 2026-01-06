/* =========================================
   Navigation JS
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    const header = document.querySelector('header');

    // Mobile Menu Toggle
    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', () => {
            const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
            menuToggle.setAttribute('aria-expanded', !isExpanded);
            mobileMenu.classList.toggle('active');

            // Toggle body scroll
            document.body.style.overflow = isExpanded ? 'auto' : 'hidden';
        });
    }

    // Sticky Header Effect
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 100) {
            header.classList.add('header-scrolled');
        } else {
            header.classList.remove('header-scrolled');
        }

        lastScroll = currentScroll;
    });

    // Close mobile menu on link click
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (mobileMenu && mobileMenu.classList.contains('active')) {
                menuToggle.setAttribute('aria-expanded', 'false');
                mobileMenu.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
        });
    });
});

