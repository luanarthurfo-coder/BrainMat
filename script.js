document.addEventListener('DOMContentLoaded', () => {
    // Header Scroll Effect
    const header = document.getElementById('header');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Mobile Menu Toggle
    const hamburger = document.querySelector('.hamburger-menu');
    const navLinks = document.querySelector('.nav-links');
    const links = document.querySelectorAll('.nav-links li a');

    if (hamburger) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            // Toggle icon from bars to times
            const icon = hamburger.querySelector('i');
            if (navLinks.classList.contains('active')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }

    // Close mobile menu when a link is clicked
    links.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            const icon = hamburger.querySelector('i');
            if (icon) {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    });

    // Smooth Scroll for Anchor Links (polishing default behavior)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Intersection Observer for Fade-In Animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            } else {
                entry.target.classList.remove('animate-in');
            }
        });
    }, observerOptions);

    // Elements to animate
    // Elements to animate - Expanded list for broader effect
    const animatedElements = document.querySelectorAll('.hero-text, .hero-image, .section-header, .benefit-card, .syllabus-block, .syllabus-card, .about-content, .stat-card, .cta-card');

    animatedElements.forEach((el) => {
        el.style.opacity = '0';
        // Start smaller and slightly lower
        el.style.transform = 'translateY(40px) scale(0.9)';
        // Smooth zoom-in transition
        el.style.transition = 'all 0.8s cubic-bezier(0.22, 1, 0.36, 1)';
        observer.observe(el);
    });

    // Help Popup Scroll Effect (Minimize on scroll down)
    const helpPopup = document.querySelector('.help-popup');
    let lastScrollY = window.scrollY;

    window.addEventListener('scroll', () => {
        if (!helpPopup) return;

        const currentScrollY = window.scrollY;

        // Minimize if scrolling down and not at top
        if (currentScrollY > lastScrollY && currentScrollY > 100) {
            helpPopup.classList.add('minimized');
        }
        // Expand if scrolling up
        else if (currentScrollY < lastScrollY) {
            helpPopup.classList.remove('minimized');
        }

        lastScrollY = currentScrollY;
    });

    // Add CSS class for animation via JS to keep styles clean
    const style = document.createElement('style');
    style.innerHTML = `
        .animate-in {
            opacity: 1 !important;
            transform: translateY(0) scale(1) !important;
        }
        @media (max-width: 768px) {
            .diag-step .option-btn {
                transform: none !important;
                transition: none !important;
            }
            .animate-in {
                transform: none !important;
            }
        }
    `;
    document.head.appendChild(style);
    // Syllabus Accordion
    const accordions = document.querySelectorAll('.accordion-header');

    accordions.forEach(acc => {
        acc.addEventListener('click', function () {
            this.classList.toggle('active');
            const content = this.nextElementSibling;

            if (content.style.maxHeight) {
                // Close
                content.style.maxHeight = null;
                content.classList.remove('active');
            } else {
                // Open
                content.classList.add('active');
                content.style.maxHeight = content.scrollHeight + "px";
            }
        });
    });
});
