/* =========================================
   Navigation JS
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    const header = document.querySelector('header');

    // Mobile Menu Toggle
    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', (e) => {
            e.preventDefault();
            const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
            const newState = !isExpanded;
            menuToggle.setAttribute('aria-expanded', newState);
            mobileMenu.classList.toggle('active');

            // Toggle body scroll
            document.body.style.overflow = newState ? 'hidden' : 'auto';
        });
    }

    // Sticky Header Effect
    if (header) {
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
    }

    // Close mobile menu on link click
    const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link, .mobile-nav-logo');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (mobileMenu && mobileMenu.classList.contains('active')) {
                menuToggle.setAttribute('aria-expanded', 'false');
                mobileMenu.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
        });
    });

    // Close mobile menu on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileMenu && mobileMenu.classList.contains('active')) {
            menuToggle.setAttribute('aria-expanded', 'false');
            mobileMenu.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    });

    // Close mobile menu when clicking outside (on overlay background)
    if (mobileMenu) {
        const menuContent = mobileMenu.querySelector('.mobile-menu-content');
        mobileMenu.addEventListener('click', (e) => {
            // Close if clicking on the overlay itself, but not on menu content or links
            if (e.target === mobileMenu || (!menuContent.contains(e.target) && !e.target.closest('.mobile-nav'))) {
                menuToggle.setAttribute('aria-expanded', 'false');
                mobileMenu.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
        });
    }
});

