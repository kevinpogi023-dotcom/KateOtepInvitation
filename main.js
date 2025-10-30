// ============================================
// CONFIGURATION - UPDATE THIS URL ONLY
// ============================================
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzQ_BsdVg1yF0vpkSUzU9rDHH__XPMT6HLhwNqGsugLumaE-4Mjuk8BDDtKFy93ujli7Q/exec';

// ============================================
// Burger Menu Toggle
// ============================================
function toggleMenu() {
    const burger = document.querySelector('.burger-menu');
    const mobileMenu = document.querySelector('.mobile-menu');
    
    burger.classList.toggle('active');
    mobileMenu.classList.toggle('active');
    
    if (mobileMenu.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
    }
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        
        if (target) {
            const mobileMenu = document.querySelector('.mobile-menu');
            const burger = document.querySelector('.burger-menu');
            
            if (mobileMenu && mobileMenu.classList.contains('active')) {
                mobileMenu.classList.remove('active');
                burger.classList.remove('active');
                document.body.style.overflow = '';
            }
            
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// RSVP button functionality
const rsvpButtons = document.querySelectorAll('.rsvp-btn');
rsvpButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const mobileMenu = document.querySelector('.mobile-menu');
        const burger = document.querySelector('.burger-menu');
        
        if (mobileMenu && mobileMenu.classList.contains('active')) {
            mobileMenu.classList.remove('active');
            burger.classList.remove('active');
            document.body.style.overflow = '';
        }
        
        const rsvpSection = document.getElementById('rsvp');
        if (rsvpSection) {
            rsvpSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Parallax effect for hero background
window.addEventListener('scroll', () => {
    const hero = document.querySelector('.hero');
    const scrolled = window.pageYOffset;
    const parallaxSpeed = 0.5;
    
    if (hero) {
        hero.style.backgroundPositionY = `${scrolled * parallaxSpeed}px`;
    }
});

// Add animation on scroll for elements
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.querySelectorAll('.fade-in').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
    observer.observe(el);
});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    const burger = document.querySelector('.burger-menu');
    const mobileMenu = document.querySelector('.mobile-menu');
    
    if (mobileMenu && mobileMenu.classList.contains('active') && 
        !burger.contains(e.target) && 
        !mobileMenu.contains(e.target)) {
        mobileMenu.classList.remove('active');
        burger.classList.remove('active');
        document.body.style.overflow = '';
    }
});

// Close mobile menu on window resize
window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
        const mobileMenu = document.querySelector('.mobile-menu');
        const burger = document.querySelector('.burger-menu');
        
        if (mobileMenu && mobileMenu.classList.contains('active')) {
            mobileMenu.classList.remove('active');
            burger.classList.remove('active');
            document.body.style.overflow = '';
        }
    }
});

// ============================================
// RSVP FORM FUNCTIONALITY
// ============================================

let isVerified = false;
let verifiedRowIndex = null;

document.addEventListener('DOMContentLoaded', function() {
    const verifyBtn = document.getElementById('verifyBtn');
    const guestNamesInput = document.getElementById('guestNames');
    const rsvpForm = document.getElementById('rsvpForm');
    
    // Create verification message element
    const verificationMsg = document.createElement('div');
    verificationMsg.className = 'verification-message';
    verificationMsg.style.marginTop = '10px';
    guestNamesInput.parentNode.parentNode.appendChild(verificationMsg);
    
    // Reset verification when names change
    guestNamesInput.addEventListener('input', function() {
        isVerified = false;
        verifiedRowIndex = null;
        verificationMsg.textContent = '';
        verificationMsg.className = 'verification-message';
    });
    
    // Verify guests
    verifyBtn.addEventListener('click', async function() {
        const names = guestNamesInput.value.trim();
        
        if (!names) {
            showMessage(verificationMsg, 'Please enter guest name(s)', 'error');
            return;
        }
        
        verifyBtn.disabled = true;
        verifyBtn.textContent = 'Verifying...';
        
        try {
            const response = await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                mode: 'cors',
                cache: 'no-cache',
                headers: {
                    'Content-Type': 'text/plain',
                },
                redirect: 'follow',
                body: JSON.stringify({
                    action: 'verify',
                    names: names
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                isVerified = true;
                verifiedRowIndex = result.rowIndex;
                showMessage(verificationMsg, result.message, 'success');
            } else {
                isVerified = false;
                verifiedRowIndex = null;
                showMessage(verificationMsg, result.message, 'error');
            }
        } catch (error) {
            console.error('Verification error:', error);
            showMessage(verificationMsg, 'Unable to verify. Please try again or contact the couple.', 'error');
            isVerified = false;
            verifiedRowIndex = null;
        } finally {
            verifyBtn.disabled = false;
            verifyBtn.textContent = 'Verify';
        }
    });
    
    // Form submission
    rsvpForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (!isVerified) {
            showMessage(verificationMsg, 'Please verify your guest name(s) first', 'error');
            return;
        }
        
        const formData = {
            action: 'submit',
            names: guestNamesInput.value.trim(),
            email: document.getElementById('email').value.trim(),
            attendance: document.querySelector('input[name="attendance"]:checked').value,
            dietary: document.getElementById('dietaryRestrictions').value.trim()
        };
        
        const submitBtn = rsvpForm.querySelector('.submit-btn');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';
        
        try {
            const response = await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                mode: 'cors',
                cache: 'no-cache',
                headers: {
                    'Content-Type': 'text/plain',
                },
                redirect: 'follow',
                body: JSON.stringify(formData)
            });
            
            const result = await response.json();
            
            if (result.success) {
                showMessage(verificationMsg, result.message, 'success');
                
                // Show success alert
                setTimeout(() => {
                    alert('Thank you! Your RSVP has been recorded. We can\'t wait to celebrate with you!');
                    rsvpForm.reset();
                    isVerified = false;
                    verifiedRowIndex = null;
                    verificationMsg.textContent = '';
                }, 500);
            } else {
                showMessage(verificationMsg, result.message, 'error');
            }
        } catch (error) {
            console.error('Submission error:', error);
            showMessage(verificationMsg, 'Unable to submit RSVP. Please try again or contact the couple.', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'RSVP';
        }
    });
    
    // Initialize carousel
    updateDots();
    setInterval(() => {
        moveCarousel(1);
    }, 5000);
});

function showMessage(element, message, type) {
    element.textContent = message;
    element.className = `verification-message ${type}`;
}

// ============================================
// CAROUSEL FUNCTIONALITY
// ============================================
let currentSlide = 0;

function moveCarousel(direction) {
    const images = document.querySelectorAll('.carousel-img');
    const totalSlides = images.length;
    
    images[currentSlide].classList.remove('active');
    currentSlide = (currentSlide + direction + totalSlides) % totalSlides;
    images[currentSlide].classList.add('active');
    updateDots();
}

function updateDots() {
    const dotsContainer = document.querySelector('.carousel-dots');
    const images = document.querySelectorAll('.carousel-img');
    
    if (!dotsContainer) return;
    
    dotsContainer.innerHTML = '';
    
    images.forEach((_, index) => {
        const dot = document.createElement('span');
        dot.className = 'dot' + (index === currentSlide ? ' active' : '');
        dot.onclick = () => goToSlide(index);
        dotsContainer.appendChild(dot);
    });
}

function goToSlide(index) {
    const images = document.querySelectorAll('.carousel-img');
    images[currentSlide].classList.remove('active');
    currentSlide = index;
    images[currentSlide].classList.add('active');
    updateDots();
}