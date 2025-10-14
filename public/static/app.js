// Interactive JavaScript for Monolite Landing Page

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all interactive features
    initSmoothScrolling();
    initParallaxEffects();
    initSliderInteraction();
    initFormValidation();
    initNavbarEffects();
    initAnimationTriggers();
    initPageLoader();
});

// Smooth scrolling for navigation links
function initSmoothScrolling() {
    const navLinks = document.querySelectorAll('nav a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80; // Account for fixed navbar
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Parallax effects for floating shapes
function initParallaxEffects() {
    const shapes = document.querySelectorAll('.shape');
    
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        
        shapes.forEach((shape, index) => {
            const speed = (index + 1) * 0.1;
            shape.style.transform = `translateY(${rate * speed}px)`;
        });
    });
}

// Enhanced slider interaction
function initSliderInteraction() {
    const sliderTrack = document.querySelector('.slider-track');
    const slides = document.querySelectorAll('.slide');
    
    if (!sliderTrack || !slides.length) return;
    
    let isHovered = false;
    let currentTransform = 0;
    
    // Pause animation on hover
    sliderTrack.addEventListener('mouseenter', () => {
        isHovered = true;
        sliderTrack.style.animationPlayState = 'paused';
    });
    
    sliderTrack.addEventListener('mouseleave', () => {
        isHovered = false;
        sliderTrack.style.animationPlayState = 'running';
    });
    
    // Add click interactions to slides
    slides.forEach((slide, index) => {
        slide.addEventListener('click', () => {
            // Add pulse effect
            slide.style.transform = 'scale(0.95)';
            setTimeout(() => {
                slide.style.transform = 'scale(1)';
            }, 150);
            
            // Add glow effect
            slide.classList.add('glow-purple');
            setTimeout(() => {
                slide.classList.remove('glow-purple');
            }, 1000);
        });
        
        // Add hover tilt effect
        slide.addEventListener('mousemove', (e) => {
            if (!isHovered) return;
            
            const rect = slide.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;
            
            slide.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
        });
        
        slide.addEventListener('mouseleave', () => {
            slide.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)';
        });
    });
}

// Form validation and interactions
function initFormValidation() {
    const form = document.querySelector('form');
    const inputs = document.querySelectorAll('input, textarea');
    
    if (!form) return;
    
    // Add floating label effect
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            input.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', () => {
            if (!input.value) {
                input.parentElement.classList.remove('focused');
            }
        });
        
        // Real-time validation
        input.addEventListener('input', () => {
            validateField(input);
        });
    });
    
    // Form submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const formData = new FormData(form);
        const button = form.querySelector('button[type="submit"]');
        
        // Show loading state
        const originalText = button.textContent;
        button.textContent = 'Sending...';
        button.disabled = true;
        
        // Simulate API call
        setTimeout(() => {
            button.textContent = 'Message Sent!';
            button.style.background = 'linear-gradient(to right, #10b981, #059669)';
            
            setTimeout(() => {
                button.textContent = originalText;
                button.disabled = false;
                button.style.background = '';
                form.reset();
            }, 2000);
        }, 1500);
    });
}

// Validate individual fields
function validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    
    // Remove existing error states
    field.classList.remove('error');
    
    // Validation rules
    if (field.type === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        isValid = emailRegex.test(value);
    } else if (field.required) {
        isValid = value.length > 0;
    }
    
    // Apply error state if invalid
    if (!isValid && value.length > 0) {
        field.classList.add('error');
    }
    
    return isValid;
}

// Navbar effects on scroll
function initNavbarEffects() {
    const navbar = document.querySelector('nav');
    let lastScrollY = window.scrollY;
    
    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;
        
        if (currentScrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        // Hide/show navbar based on scroll direction
        if (currentScrollY > lastScrollY && currentScrollY > 200) {
            navbar.style.transform = 'translateY(-100%)';
        } else {
            navbar.style.transform = 'translateY(0)';
        }
        
        lastScrollY = currentScrollY;
    });
}

// Animation triggers on scroll
function initAnimationTriggers() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                
                // Staggered animations for child elements
                const children = entry.target.querySelectorAll('.feature-card, .stat-card, .glass-card');
                children.forEach((child, index) => {
                    setTimeout(() => {
                        child.classList.add('animate-in');
                    }, index * 100);
                });
            }
        });
    }, observerOptions);
    
    // Observe sections
    const sections = document.querySelectorAll('section');
    sections.forEach(section => observer.observe(section));
}

// Page loader
function initPageLoader() {
    const loader = document.createElement('div');
    loader.className = 'page-loader';
    loader.innerHTML = '<div class="loader-logo"></div>';
    
    document.body.appendChild(loader);
    
    window.addEventListener('load', () => {
        setTimeout(() => {
            loader.style.opacity = '0';
            setTimeout(() => {
                loader.remove();
            }, 500);
        }, 1000);
    });
}

// Button interaction effects
document.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON') {
        createRippleEffect(e);
    }
});

function createRippleEffect(e) {
    const button = e.target;
    const ripple = document.createElement('span');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    ripple.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        background: rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        transform: scale(0);
        animation: ripple 0.6s ease-out;
        pointer-events: none;
    `;
    
    button.style.position = 'relative';
    button.style.overflow = 'hidden';
    button.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

// CSS for ripple animation
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(2);
            opacity: 0;
        }
    }
    
    .animate-in {
        animation: slideInUp 0.6s ease-out forwards;
    }
    
    @keyframes slideInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .scrolled {
        background: rgba(0, 0, 0, 0.8) !important;
        backdrop-filter: blur(20px);
    }
    
    .error {
        border-color: #ef4444 !important;
        box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.3) !important;
    }
    
    nav {
        transition: all 0.3s ease;
    }
`;
document.head.appendChild(style);

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        // Close any open modals or menus
        document.querySelectorAll('.modal, .menu').forEach(el => {
            el.classList.remove('active');
        });
    }
});

// Touch gesture support for mobile
let touchStartX = 0;
let touchStartY = 0;

document.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
});

document.addEventListener('touchmove', (e) => {
    if (!touchStartX || !touchStartY) return;
    
    const touchEndX = e.touches[0].clientX;
    const touchEndY = e.touches[0].clientY;
    
    const diffX = touchStartX - touchEndX;
    const diffY = touchStartY - touchEndY;
    
    // Horizontal swipe detection for slider
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
        const sliderTrack = document.querySelector('.slider-track');
        if (sliderTrack) {
            // Add swipe feedback
            sliderTrack.style.transition = 'transform 0.3s ease';
            setTimeout(() => {
                sliderTrack.style.transition = '';
            }, 300);
        }
    }
    
    touchStartX = 0;
    touchStartY = 0;
});

// Performance optimization
let ticking = false;

function optimizedScroll() {
    // Throttle scroll events for better performance
    if (!ticking) {
        requestAnimationFrame(() => {
            // Scroll-based animations here
            ticking = false;
        });
        ticking = true;
    }
}

window.addEventListener('scroll', optimizedScroll);

console.log('🚀 Monolite landing page loaded successfully!');