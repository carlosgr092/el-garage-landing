/**
 * El Garage Euro Car - Script
 * Includes: General UI, Lightbox, and GSAP Animations (Stacking + Premium Gallery)
 */

document.addEventListener('DOMContentLoaded', () => {

    // ============================================
    // 1. GENERAL UI INTERACTIONS (No GSAP dependency)
    // ============================================

    // --- Mobile Nav ---
    const navToggle = document.querySelector('.nav-toggle');
    const nav = document.querySelector('.nav');

    if (navToggle && nav) {
        navToggle.addEventListener('click', () => {
            nav.classList.toggle('active');
            navToggle.textContent = nav.classList.contains('active') ? '✕' : '☰';
        });
    }

    // --- Header Background on Scroll ---
    const header = document.querySelector('.header');
    let ticking = false;

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                if (window.scrollY > 100) {
                    header?.classList.add('scrolled');
                } else {
                    header?.classList.remove('scrolled');
                }
                ticking = false;
            });
            ticking = true;
        }
    });

    // --- Smooth Scroll for Anchors ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
                // Close mobile nav if open
                if (nav && nav.classList.contains('active')) {
                    nav.classList.remove('active');
                    if (navToggle) navToggle.textContent = '☰';
                }
            }
        });
    });

    // --- Lazy Loading ---
    const lazyImages = document.querySelectorAll('img[data-src]');
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            });
        }, { rootMargin: '100px' });

        lazyImages.forEach(img => imageObserver.observe(img));
    }


    // ============================================
    // 2. UNIVERSAL LIGHTBOX
    // ============================================
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = lightbox?.querySelector('img');
    const lightboxClose = lightbox?.querySelector('.lightbox-close');

    // Select both gallery items and general preview items
    const lightboxTriggers = document.querySelectorAll('.hof-item, .preview-item, .gallery-item');

    lightboxTriggers.forEach(item => {
        item.addEventListener('click', () => {
            const img = item.querySelector('img');
            if (!img || !lightbox || !lightboxImg) return;

            // Update Source
            lightboxImg.src = img.src;
            lightboxImg.alt = img.alt;

            // FLIP Animation Start Position (if GSAP available)
            if (typeof gsap !== 'undefined') {
                const rect = img.getBoundingClientRect();
                gsap.set(lightboxImg, {
                    position: 'fixed',
                    left: rect.left,
                    top: rect.top,
                    width: rect.width,
                    height: rect.height,
                    objectFit: 'cover',
                    borderRadius: getComputedStyle(img).borderRadius,
                    opacity: 1
                });
            }

            // Show Lightbox
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';

            // Animate to Center (if GSAP available)
            if (typeof gsap !== 'undefined') {
                gsap.to(lightboxImg, {
                    left: '50%',
                    top: '50%',
                    xPercent: -50,
                    yPercent: -50,
                    width: 'min(90vw, 1200px)',
                    height: 'auto',
                    objectFit: 'contain',
                    duration: 0.5,
                    ease: 'power3.out'
                });
            }
        });
    });

    // Close Function
    const closeLightbox = () => {
        if (!lightbox) return;

        if (typeof gsap !== 'undefined' && lightboxImg) {
            gsap.to(lightboxImg, {
                scale: 0.8,
                opacity: 0,
                duration: 0.3,
                ease: 'power2.in',
                onComplete: () => {
                    lightbox.classList.remove('active');
                    document.body.style.overflow = '';
                    gsap.set(lightboxImg, { clearProps: 'all' });
                }
            });
        } else {
            lightbox.classList.remove('active');
            document.body.style.overflow = '';
        }
    };

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) closeLightbox();
        });
    }
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox?.classList.contains('active')) closeLightbox();
    });


    // ============================================
    // 3. GSAP ANIMATIONS (Stacking + Gallery)
    // ============================================
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);

        // --- A. Main Page Card Stacking ---
        const mainSections = document.querySelectorAll('.hero, .intro-section, .services-section, .preview-section, .footer');
        mainSections.forEach((section) => {
            ScrollTrigger.create({
                trigger: section,
                start: 'top top',
                end: '+=100%',
                pin: true,
                pinSpacing: false,
                scrub: true,
                anticipatePin: 1,
                fastScrollEnd: true,
                preventOverlaps: true
            });
        });

        const categorySections = document.querySelectorAll('.category-section');

        // 1. Cinematic Section Entry (Restored Premium Effects)
        categorySections.forEach((section) => {
            const sectionId = section.id;
            // Target children explicitly for better control
            const content = section.querySelector('.container');
            const header = section.querySelector('.category-header');
            const grid = section.querySelector('.hof-grid');

            // Safety check
            if (!content) return;

            // Ensure initial visibility is handled by GSAP to avoid FOUC or stuck states
            // We don't set opacity: 0 in CSS, we let GSAP handle it

            // Common ScrollTrigger Config for deep scrubbing
            const scrubConfig = {
                trigger: section,
                start: "top 95%", // Start animating as soon as it enters
                end: "top 20%",   // Finish when near the top (long scroll area)
                scrub: 1.5,       // Smooth scrubbing delay
                toggleActions: "play reverse play reverse"
            };

            // Unique transitions per section
            switch (sectionId) {
                case 'polarizado': // Horizontal Slide
                    gsap.fromTo(content,
                        { x: 150, opacity: 0, filter: 'blur(5px)' },
                        {
                            x: 0,
                            opacity: 1,
                            filter: 'blur(0px)',
                            ease: 'power2.out',
                            scrollTrigger: scrubConfig
                        }
                    );
                    break;

                case 'detallado': //  Zoom Out
                    gsap.fromTo(content,
                        { scale: 1.2, opacity: 0 },
                        {
                            scale: 1,
                            opacity: 1,
                            ease: 'power2.out',
                            scrollTrigger: scrubConfig
                        }
                    );
                    break;

                case 'pintura': // Reveal Wipe
                    gsap.fromTo(content,
                        { clipPath: 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)', opacity: 0 },
                        {
                            clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
                            opacity: 1,
                            ease: 'power2.inOut',
                            scrollTrigger: scrubConfig
                        }
                    );
                    break;

                case 'calipers': // 3D Tilt Up
                    gsap.fromTo(content,
                        { y: 150, opacity: 0, rotationX: 45, transformPerspective: 1000 },
                        {
                            y: 0,
                            opacity: 1,
                            rotationX: 0,
                            ease: 'power2.out',
                            scrollTrigger: scrubConfig
                        }
                    );
                    break;

                default: // Fallback Fade Up
                    gsap.fromTo(content,
                        { y: 100, opacity: 0 },
                        {
                            y: 0,
                            opacity: 1,
                            ease: 'power2.out',
                            scrollTrigger: scrubConfig
                        }
                    );
            }
        });

        // 2. Hover Effects (Global - Run once)
        const galleryItems = document.querySelectorAll('.hof-item');
        if (galleryItems.length > 0) {
            galleryItems.forEach(item => {
                const img = item.querySelector('img');
                const overlay = item.querySelector('.hof-item-overlay');

                item.addEventListener('mouseenter', () => {
                    gsap.to(item, { scale: 1.05, boxShadow: '0 20px 40px rgba(0,0,0,0.4)', duration: 0.4 });
                    if (img) gsap.to(img, { scale: 1.1, duration: 0.4 });
                    if (overlay) gsap.to(overlay, { opacity: 1, duration: 0.3 });
                });

                item.addEventListener('mouseleave', () => {
                    gsap.to(item, { scale: 1, boxShadow: '0 5px 15px rgba(0,0,0,0.2)', duration: 0.4 });
                    if (img) gsap.to(img, { scale: 1, duration: 0.4 });
                    if (overlay) gsap.to(overlay, { opacity: 0, duration: 0.3 });
                });

                // 3D Tilt
                item.addEventListener('mousemove', (e) => {
                    const rect = item.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    const centerX = rect.width / 2;
                    const centerY = rect.height / 2;

                    gsap.to(item, {
                        rotateX: (y - centerY) / 10,
                        rotateY: (centerX - x) / 10,
                        duration: 0.4,
                        ease: 'power1.out',
                        transformPerspective: 1000
                    });
                });

                item.addEventListener('mouseleave', () => {
                    gsap.to(item, { rotateX: 0, rotateY: 0, duration: 0.6, ease: 'elastic.out(1, 0.5)' });
                });
            });

            // 3. Simple Parallax
            galleryItems.forEach((item, index) => {
                const speed = [0.1, 0.2, 0.05, 0.15][index % 4];
                gsap.to(item, {
                    scrollTrigger: {
                        trigger: item,
                        start: 'top bottom',
                        end: 'bottom top',
                        scrub: 1
                    },
                    yPercent: -20 * speed,
                    ease: 'none'
                });
            });
        }

        // Refresh ScrollTrigger on resize
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => ScrollTrigger.refresh(), 200);
        });

        console.log('%c✓ GSAP & Gallery Effects Active', 'color: #D4AF37; font-weight: bold;');
    }

    console.log('%c🚗 El Garage Euro Car Loaded', 'font-size: 16px; font-weight: bold;');
});
