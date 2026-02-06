/**
 * El Garage Euro Car - Premium GSAP Animations
 * With Preloader + Corrected Animations
 */

document.addEventListener('DOMContentLoaded', () => {

    // ============================================
    // 1. PRELOADER SYSTEM
    // ============================================
    const preloader = document.getElementById('preloader');
    const progressBar = document.getElementById('preloader-progress');

    let loadedAssets = 0;
    let totalAssets = 0;

    // Count assets to load
    const images = document.querySelectorAll('img');
    const video = document.querySelector('.hero-video');

    totalAssets = images.length + (video ? 1 : 0);
    if (totalAssets === 0) totalAssets = 1; // Prevent division by zero

    function updateProgress() {
        loadedAssets++;
        const percent = Math.min((loadedAssets / totalAssets) * 100, 100);

        if (progressBar) {
            progressBar.style.width = percent + '%';
        }

        if (loadedAssets >= totalAssets) {
            finishLoading();
        }
    }

    function finishLoading() {
        // Small delay for smooth feel
        setTimeout(() => {
            if (typeof gsap !== 'undefined' && preloader) {
                // Animate preloader out
                gsap.to(preloader, {
                    yPercent: -100,
                    duration: 0.8,
                    ease: 'power3.inOut',
                    onComplete: () => {
                        preloader.remove();
                        initAllAnimations();
                    }
                });
            } else {
                if (preloader) preloader.remove();
                initAllAnimations();
            }
        }, 300);
    }

    // Track image loading
    images.forEach(img => {
        if (img.complete) {
            updateProgress();
        } else {
            img.addEventListener('load', updateProgress);
            img.addEventListener('error', updateProgress); // Count errors too
        }
    });

    // Track video loading
    if (video) {
        if (video.readyState >= 3) {
            updateProgress();
        } else {
            video.addEventListener('canplaythrough', updateProgress, { once: true });
            video.addEventListener('error', updateProgress, { once: true });
            // Fallback timeout for slow videos
            setTimeout(() => {
                if (loadedAssets < totalAssets) updateProgress();
            }, 5000);
        }
    }

    // Fallback: If nothing loads after 8 seconds, proceed anyway
    setTimeout(() => {
        if (preloader && preloader.parentNode) {
            finishLoading();
        }
    }, 8000);

    // ============================================
    // 2. GENERAL UI (No GSAP dependency)
    // ============================================
    const navToggle = document.querySelector('.nav-toggle');
    const nav = document.querySelector('.nav');

    if (navToggle && nav) {
        navToggle.addEventListener('click', () => {
            nav.classList.toggle('active');
            navToggle.textContent = nav.classList.contains('active') ? '✕' : '☰';
        });
    }

    // Header scroll effect
    const header = document.querySelector('.header');
    window.addEventListener('scroll', () => {
        header?.classList.toggle('scrolled', window.scrollY > 100);
    }, { passive: true });

    // Smooth scroll anchors
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                if (nav?.classList.contains('active')) {
                    nav.classList.remove('active');
                    if (navToggle) navToggle.textContent = '☰';
                }
            }
        });
    });

    // ============================================
    // 3. LIGHTBOX
    // ============================================
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = lightbox?.querySelector('img');
    const lightboxClose = lightbox?.querySelector('.lightbox-close');
    const lightboxTriggers = document.querySelectorAll('.hof-item, .preview-item, .gallery-item');

    lightboxTriggers.forEach(item => {
        item.addEventListener('click', () => {
            const img = item.querySelector('img');
            if (!img || !lightbox || !lightboxImg) return;

            lightboxImg.src = img.src;
            lightboxImg.alt = img.alt;

            if (typeof gsap !== 'undefined') {
                const rect = img.getBoundingClientRect();
                gsap.set(lightboxImg, {
                    position: 'fixed', left: rect.left, top: rect.top,
                    width: rect.width, height: rect.height,
                    objectFit: 'cover', borderRadius: getComputedStyle(img).borderRadius, opacity: 1
                });
            }

            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';

            if (typeof gsap !== 'undefined') {
                gsap.to(lightboxImg, {
                    left: '50%', top: '50%', xPercent: -50, yPercent: -50,
                    width: 'min(90vw, 1200px)', height: 'auto', objectFit: 'contain',
                    duration: 0.5, ease: 'power3.out'
                });
            }
        });
    });

    const closeLightbox = () => {
        if (!lightbox) return;
        if (typeof gsap !== 'undefined' && lightboxImg) {
            gsap.to(lightboxImg, {
                scale: 0.9, opacity: 0, duration: 0.25, ease: 'power2.in',
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

    lightboxClose?.addEventListener('click', closeLightbox);
    lightbox?.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox?.classList.contains('active')) closeLightbox();
    });

    // ============================================
    // 4. MAIN ANIMATION INIT FUNCTION
    // ============================================
    function initAllAnimations() {
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
            console.warn('GSAP not loaded');
            return;
        }

        gsap.registerPlugin(ScrollTrigger);

        // Reduced motion check
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) {
            console.log('Reduced motion enabled - animations simplified');
        }

        // ============================================
        // LENIS SMOOTH SCROLL
        // ============================================
        if (typeof Lenis !== 'undefined' && !prefersReducedMotion) {
            const lenis = new Lenis({
                duration: 1.2,
                easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                direction: 'vertical',
                gestureDirection: 'vertical',
                smooth: true,
                mouseMultiplier: 1,
                smoothTouch: false,
                touchMultiplier: 2,
            });

            function raf(time) {
                lenis.raf(time);
                requestAnimationFrame(raf);
            }
            requestAnimationFrame(raf);

            gsap.ticker.add((time) => lenis.raf(time * 1000));
            gsap.ticker.lagSmoothing(0);
        }

        // ============================================
        // HERO TITLE - Clean reveal
        // ============================================
        const heroTitle = document.querySelector('.hero-title');
        const galleryHeroTitle = document.querySelector('.gallery-hero-title');

        [heroTitle, galleryHeroTitle].filter(el => el).forEach(title => {
            if (typeof SplitType !== 'undefined') {
                const text = new SplitType(title, { types: 'chars' });

                gsap.from(text.chars, {
                    opacity: 0,
                    y: 60,
                    rotateX: -45,
                    transformPerspective: 800,
                    duration: 1,
                    stagger: { amount: 0.6, from: 'start' },
                    ease: 'power3.out',
                    delay: 0.2,
                    clearProps: 'all'
                });
            }
        });

        // ============================================
        // INTRO SECTION - Smooth parallax
        // ============================================
        const introSection = document.querySelector('.intro-section');
        if (introSection && !prefersReducedMotion) {
            const introImage = introSection.querySelector('.intro-image');
            const introLabel = introSection.querySelector('.intro-label');
            const introTitle = introSection.querySelector('.intro-title');
            const introDesc = introSection.querySelector('.intro-desc');

            // Subtle parallax
            if (introImage) {
                gsap.to(introImage, {
                    yPercent: -10,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: introSection,
                        start: 'top bottom',
                        end: 'bottom top',
                        scrub: 2
                    }
                });
            }

            // Content reveal - OPTIMIZED
            const introTl = gsap.timeline({
                scrollTrigger: {
                    trigger: introSection,
                    start: 'top 85%', // Earlier trigger
                    toggleActions: 'play none none none' // No reverse for smooth scroll
                }
            });

            if (typeof SplitType !== 'undefined' && introTitle) {
                const introChars = new SplitType(introTitle, { types: 'chars' });

                introTl
                    .from(introLabel, {
                        opacity: 0, x: -20,
                        duration: 0.35, ease: 'power2.out'
                    })
                    .from(introChars.chars, {
                        opacity: 0, y: 25,
                        duration: 0.4, stagger: 0.012, ease: 'power2.out',
                        clearProps: 'all'
                    }, '-=0.2')
                    .from(introDesc, {
                        opacity: 0, y: 15,
                        duration: 0.35, ease: 'power2.out'
                    }, '-=0.25')
                    .from(introImage, {
                        opacity: 0, scale: 0.97, x: 30,
                        duration: 0.5, ease: 'power2.out',
                        clearProps: 'scale,x'
                    }, '-=0.3');
            }
        }

        // ============================================
        // STATS SECTION - Counter
        // ============================================
        const statsSection = document.querySelector('.stats-section');
        if (statsSection) {
            const statItems = statsSection.querySelectorAll('.stat-item');
            const statNumbers = statsSection.querySelectorAll('.stat-number');
            const originalValues = Array.from(statNumbers).map(n => n.textContent);

            const statsTl = gsap.timeline({
                scrollTrigger: {
                    trigger: statsSection,
                    start: 'top 80%',
                    end: 'top 30%',
                    toggleActions: 'play none none reverse',
                    onEnter: () => {
                        statNumbers.forEach((el, i) => {
                            const text = originalValues[i];
                            const num = parseInt(text);
                            if (!isNaN(num)) {
                                const suffix = text.includes('+') ? '+' : (text.includes('%') ? '%' : '');
                                gsap.fromTo({ val: 0 }, { val: 0 }, {
                                    val: num, duration: 1.8, delay: i * 0.1,
                                    ease: 'power2.out',
                                    onUpdate: function () {
                                        el.textContent = Math.round(this.targets()[0].val) + suffix;
                                    }
                                });
                            }
                        });
                    },
                    onLeaveBack: () => {
                        statNumbers.forEach((n, i) => n.textContent = originalValues[i]);
                    }
                }
            });

            statsTl.from(statItems, {
                opacity: 0, y: 40, scale: 0.95,
                duration: 0.6, stagger: 0.1, ease: 'power3.out',
                clearProps: 'all'
            });
        }

        // ============================================
        // SERVICES SECTION - CORRECTED (no aggressive flip)
        // ============================================
        const servicesSection = document.querySelector('.services-section');
        if (servicesSection && !prefersReducedMotion) {
            const serviceHeader = servicesSection.querySelector('.section-header');
            const serviceTitle = servicesSection.querySelector('.section-title');
            const serviceCards = servicesSection.querySelectorAll('.service-card');

            const servicesTl = gsap.timeline({
                scrollTrigger: {
                    trigger: servicesSection,
                    start: 'top 85%', // Earlier trigger
                    toggleActions: 'play none none none' // No reverse
                }
            });

            if (typeof SplitType !== 'undefined' && serviceTitle) {
                const titleChars = new SplitType(serviceTitle, { types: 'chars' });

                servicesTl
                    .from(serviceHeader, {
                        opacity: 0, y: 30,
                        duration: 0.5, ease: 'power3.out'
                    })
                    .from(titleChars.chars, {
                        opacity: 0, y: 30,
                        duration: 0.5, stagger: 0.015, ease: 'power3.out',
                        clearProps: 'all'
                    }, '-=0.3')
                    // CORRECTED: Simple elegant animation, no rotateY:-90
                    .from(serviceCards, {
                        opacity: 0,
                        y: 60,
                        scale: 0.96,
                        duration: 0.7,
                        stagger: 0.12,
                        ease: 'power3.out',
                        clearProps: 'all'
                    }, '-=0.2');
            }

            // Subtle hover 3D (max 8 degrees)
            serviceCards.forEach(card => {
                const img = card.querySelector('img');

                card.addEventListener('mouseenter', () => {
                    gsap.to(card, {
                        scale: 1.02,
                        boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                        duration: 0.3, ease: 'power2.out'
                    });
                    if (img) gsap.to(img, { scale: 1.05, duration: 0.4 });
                });

                card.addEventListener('mouseleave', () => {
                    gsap.to(card, {
                        scale: 1, rotateX: 0, rotateY: 0,
                        boxShadow: '0 5px 20px rgba(0,0,0,0.2)',
                        duration: 0.4, ease: 'power2.out'
                    });
                    if (img) gsap.to(img, { scale: 1, duration: 0.4 });
                });

                // Subtle 3D tilt (max 8 degrees)
                card.addEventListener('mousemove', (e) => {
                    const rect = card.getBoundingClientRect();
                    const x = (e.clientX - rect.left) / rect.width - 0.5;
                    const y = (e.clientY - rect.top) / rect.height - 0.5;

                    gsap.to(card, {
                        rotateY: x * 8,
                        rotateX: -y * 8,
                        transformPerspective: 800,
                        duration: 0.2,
                        ease: 'power1.out'
                    });
                });
            });
        }

        // ============================================
        // GALLERY COLLAGE - OPTIMIZED for smoothness
        // ============================================
        const previewSection = document.querySelector('.preview-section');
        const galleryCollage = document.querySelector('.gallery-collage');

        if (previewSection && galleryCollage && !prefersReducedMotion) {
            const collageImgs = galleryCollage.querySelectorAll('.collage-img');
            const collageCta = galleryCollage.querySelector('.collage-cta');
            const previewHeader = previewSection.querySelector('.section-header');
            const previewTitle = previewSection.querySelector('.section-title');

            const collageTl = gsap.timeline({
                scrollTrigger: {
                    trigger: previewSection,
                    start: 'top 85%', // Trigger earlier for smoother experience
                    toggleActions: 'play none none none' // Play once, no reverse
                }
            });

            if (typeof SplitType !== 'undefined' && previewTitle) {
                const previewChars = new SplitType(previewTitle, { types: 'chars' });

                collageTl
                    .from(previewHeader, {
                        opacity: 0, y: 20,
                        duration: 0.4, ease: 'power2.out'
                    })
                    .from(previewChars.chars, {
                        opacity: 0, y: 20,
                        duration: 0.3, stagger: 0.01, ease: 'power2.out',
                        clearProps: 'all'
                    }, '-=0.2');
            }

            // Faster, smoother image reveal
            collageImgs.forEach((img, i) => {
                collageTl.from(img, {
                    opacity: 0,
                    scale: 0.9,
                    duration: 0.4,
                    ease: 'power2.out',
                    clearProps: 'opacity,scale'
                }, i === 0 ? '-=0.1' : '-=0.3');
            });

            if (collageCta) {
                collageTl.from(collageCta, {
                    opacity: 0,
                    scale: 0.95,
                    duration: 0.3,
                    ease: 'power2.out',
                    clearProps: 'all'
                }, '-=0.2');
            }

            // CORRECTED: Magnetic hover that doesn't break CSS
            let isHovering = false;

            galleryCollage.addEventListener('mouseenter', () => { isHovering = true; });
            galleryCollage.addEventListener('mouseleave', () => {
                isHovering = false;
                // Reset to original positions
                collageImgs.forEach(img => {
                    gsap.to(img, {
                        x: 0, y: 0,
                        duration: 0.5,
                        ease: 'power2.out'
                    });
                });
            });

            galleryCollage.addEventListener('mousemove', (e) => {
                if (!isHovering) return;

                const rect = galleryCollage.getBoundingClientRect();
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const mouseX = e.clientX - rect.left - centerX;
                const mouseY = e.clientY - rect.top - centerY;

                collageImgs.forEach((img, i) => {
                    const depth = (i + 1) * 0.15; // Very subtle
                    gsap.to(img, {
                        x: mouseX * depth,
                        y: mouseY * depth,
                        duration: 0.4,
                        ease: 'power2.out'
                    });
                });
            });
        }

        // ============================================
        // FOOTER
        // ============================================
        const footer = document.querySelector('.footer');
        if (footer && !prefersReducedMotion) {
            const footerElements = [
                footer.querySelector('.footer-cta-title'),
                footer.querySelector('.footer-cta-text'),
                footer.querySelector('.whatsapp-btn'),
                footer.querySelector('.footer-social'),
                footer.querySelector('.footer-tagline')
            ].filter(el => el);

            const footerTl = gsap.timeline({
                scrollTrigger: {
                    trigger: footer,
                    start: 'top 80%',
                    end: 'top 30%',
                    toggleActions: 'play none none reverse'
                }
            });

            footerTl.from(footerElements, {
                opacity: 0, y: 40,
                duration: 0.6, stagger: 0.08, ease: 'power3.out',
                clearProps: 'all'
            });
        }

        // ============================================
        // WHATSAPP FLOAT VISIBILITY
        // ============================================
        const whatsappFloat = document.querySelector('.whatsapp-float');
        const introSec = document.querySelector('.intro-section');

        if (whatsappFloat) {
            if (introSec) {
                ScrollTrigger.create({
                    trigger: introSec,
                    start: 'top 80%',
                    onEnter: () => whatsappFloat.classList.add('visible'),
                    onLeaveBack: () => whatsappFloat.classList.remove('visible')
                });
            }

            if (window.scrollY > window.innerHeight * 0.5) {
                whatsappFloat.classList.add('visible');
            }
        }



        // ============================================
        // GALLERY PAGE - CORRECTED (no laggy gsap.set in loop)
        // ============================================
        // ============================================
        // MAIN PAGE CARD STACKING (Index Only)
        // ============================================
        if (document.querySelector('.hero') && !document.querySelector('.gallery-hero')) {
            const mainSections = document.querySelectorAll('.hero, .intro-section, .services-section, .preview-section, .footer');
            mainSections.forEach((section) => {
                ScrollTrigger.create({
                    trigger: section,
                    start: 'top top',
                    end: '+=100%',
                    pin: true,
                    pinSpacing: false,
                    scrub: true,
                    anticipatePin: 1
                });
            });
        }

        // ============================================
        // GALLERY PAGE - BENTO/FLIP ANIMATION
        // ============================================
        // ============================================
        // SCRUB BENTO GALLERY - FLIP ANIMATION
        // ============================================
        let scrubFlipCtx;
        
        const createScrubBentoFlip = () => {
            let galleryElement = document.querySelector("#scrub-gallery");
            if (!galleryElement) return;

            let galleryItems = galleryElement.querySelectorAll(".scrub-item");

            // Revert previous context if exists
            if (scrubFlipCtx) {
                scrubFlipCtx.revert();
            }
            galleryElement.classList.remove("scrub-gallery--final");

            scrubFlipCtx = gsap.context(() => {
                // Temporarily add the final class to capture the final state
                galleryElement.classList.add("scrub-gallery--final");
                const flipState = Flip.getState(galleryItems);
                galleryElement.classList.remove("scrub-gallery--final");

                const flip = Flip.to(flipState, {
                    simple: true,
                    ease: "expoScale(1, 5)"
                });

                const tl = gsap.timeline({
                    scrollTrigger: {
                        trigger: galleryElement,
                        start: "center center",
                        end: "+=100%",
                        scrub: true,
                        pin: galleryElement.parentNode
                    }
                });
                tl.add(flip);
                
                return () => gsap.set(galleryItems, { clearProps: "all" });
            });
        };

        if (typeof Flip !== 'undefined') {
            createScrubBentoFlip();
            window.addEventListener("resize", () => {
                gsap.delayedCall(0.2, createScrubBentoFlip);
            });

            // Standard Flip for other simple grids (Detallado/Calipers) if needed or reuse same logic
            // For now, let's keep it specific as requested for "Mejores Autos" first
            const otherGalleries = document.querySelectorAll('.gallery--bento:not(#gallery-best-cars)');
            otherGalleries.forEach(gallery => {
                // Simple static grid or ScrollTrigger batch for others?
                // User said "1 en las otras 2 eres libre".
                // Let's use Batch for them to avoid conflict with complex Flip if not needed
                const items = gallery.querySelectorAll('.gallery__item');
                ScrollTrigger.batch(items, {
                    onEnter: batch => gsap.from(batch, { opacity: 0, y: 30, stagger: 0.1 })
                });
            });


            // ============================================
            // GALLERY PAGE - HORIZONTAL SCROLL (Pintura)
            // ============================================
            const horizontalSections = gsap.utils.toArray(".horiz-gallery-wrapper");
            horizontalSections.forEach(function (sec) {
                const pinWrap = sec.querySelector(".horiz-gallery-strip");
                if (!pinWrap) return;

                // Calculate width dynamically
                const getScrollAmount = () => {
                    let pinWrapWidth = pinWrap.scrollWidth;
                    return -(pinWrapWidth - window.innerWidth + 100); // +100 for end padding
                };

                gsap.to(pinWrap, {
                    x: getScrollAmount,
                    ease: "none",
                    scrollTrigger: {
                        trigger: sec,
                        start: "center center",
                        end: () => `+=${pinWrap.scrollWidth * 0.8}`, // Adjust drag length
                        pin: true,
                        scrub: 1,
                        invalidateOnRefresh: true,
                        // markers: true
                    }
                });
            });

            // ============================================
            // GALLERY PAGE - COMPARISON SLIDER
            // ============================================
            gsap.utils.toArray(".comparisonSection").forEach(section => {
                let tl = gsap.timeline({
                    scrollTrigger: {
                        trigger: section,
                        start: "center center",
                        end: () => "+=" + section.offsetWidth,
                        scrub: true,
                        pin: true,
                        anticipatePin: 1
                    },
                    defaults: { ease: "none" }
                });

                // Animate the container one way...
                tl.fromTo(section.querySelector(".afterImage"),
                    { xPercent: 100, x: 0 },
                    { xPercent: 0 }
                )
                    // ...and the image the opposite way (at the same time)
                    .fromTo(section.querySelector(".afterImage img"),
                        { xPercent: -100, x: 0 },
                        { xPercent: 0 },
                        0
                    );
            });

            // Re-calc on resize? Not usually needed for scrub unless breakpoints change layout significantly.
            // Flip has internal logic.
        } else {
            console.warn("GSAP Flip plugin not found");
        }

        // Refresh on resize
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => ScrollTrigger.refresh(), 200);
        });

        console.log('%c✓ All animations initialized', 'color: #D4AF37; font-weight: bold;');
    }

    // If no preloader exists, init immediately
    if (!preloader) {
        if (typeof gsap !== 'undefined') {
            initAllAnimations();
        }
    }

    console.log('%c🚗 El Garage Euro Car', 'font-size: 14px; font-weight: bold; color: #D4AF37;');
});
