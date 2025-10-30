// ============================================
// CONFIGURATION - UPDATE THESE VALUES
// ============================================
const GOOGLE_API_KEY = 'AIzaSyAE-LndV0JgF-btRYjd2iW0j0CoA1XueaA';
const SHEET_ID = '1geWvT54dderCwMsVR0QvQ6X7j90_Lb0V6RaL3Gq0ddQ';
const SHEET_NAME = 'Kate&Otep'; // Change if your sheet has a different name

// Column configuration for your sheet structure:
// A = Time Stamp, B = Guest Name, C = Email, D = Attendance, E = Dietary, F = Full Party
const COLUMN_CONFIG = {
    GUEST_NAME: 1,      // Column B (0-indexed)
    EMAIL: 2,           // Column C (0-indexed)
    ATTENDANCE: 3,      // Column D (0-indexed)
    DIETARY: 4,         // Column E (0-indexed)
    TIMESTAMP: 0,       // Column A (0-indexed)
    FULL_PARTY: 5       // Column F (0-indexed)
};

// ============================================
// Burger Menu Toggle
// ============================================
function toggleMenu() {
    const burger = document.querySelector('.burger-menu');
    const mobileMenu = document.querySelector('.mobile-menu');
    
    burger.classList.toggle('active');
    mobileMenu.classList.toggle('active');
    
    // Prevent body scrolling when menu is open
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
            // Close mobile menu if open
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
        // Close mobile menu if open
        const mobileMenu = document.querySelector('.mobile-menu');
        const burger = document.querySelector('.burger-menu');
        
        if (mobileMenu && mobileMenu.classList.contains('active')) {
            mobileMenu.classList.remove('active');
            burger.classList.remove('active');
            document.body.style.overflow = '';
        }
        
        // Scroll to RSVP section if it exists
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

// Observe elements with fade-in class
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

// Close mobile menu on window resize if larger than mobile breakpoint
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
// GOOGLE SHEETS API FUNCTIONS
// ============================================

let isVerified = false;
let guestListCache = null;

// Fetch all guest data from Google Sheets
async function fetchGuestList() {
    if (guestListCache) {
        return guestListCache;
    }
    
    const range = `${SHEET_NAME}!B:B`; // Only Column B (Guest Name)
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${range}?key=${GOOGLE_API_KEY}`;
    
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Failed to fetch guest list');
        }
        
        const data = await response.json();
        guestListCache = data.values || [];
        return guestListCache;
    } catch (error) {
        console.error('Error fetching guest list:', error);
        throw error;
    }
}

// Verify guest names (without party size check)
async function verifyGuests(namesString) {
    const inputNames = namesString.split(',').map(name => name.trim().toLowerCase());
    
    try {
        const guestList = await fetchGuestList();
        
        // Skip header row (index 0)
        for (let i = 1; i < guestList.length; i++) {
            const row = guestList[i];
            const sheetName = (row[0] || '').toString().trim().toLowerCase();
            
            // Check if any input name matches
            if (inputNames.includes(sheetName)) {
                return {
                    success: true,
                    message: `✓ Verified! Welcome ${row[0]}!`,
                    rowIndex: i + 1 // Store for later update (1-indexed for Sheets API)
                };
            }
        }
        
        return {
            success: false,
            message: 'Sorry, we could not find your name on the guest list. Please check the spelling or contact the couple.'
        };
    } catch (error) {
        throw new Error('Unable to verify guest list. Please try again.');
    }
}

// Submit RSVP to Google Sheets
async function submitRSVP(rowIndex, names, email, attendance, dietary) {
    const timestamp = new Date().toISOString();
    
    // Update: A=Timestamp, C=Email, D=Attendance, E=Dietary, F=Full Party Names
    const range = `${SHEET_NAME}!A${rowIndex}:F${rowIndex}`;
    const values = [
        [timestamp, '', email, attendance, dietary, names]
    ];
    
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${range}?valueInputOption=RAW&key=${GOOGLE_API_KEY}`;
    
    try {
        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                values: values
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to submit RSVP');
        }
        
        return {
            success: true,
            message: 'Thank you! Your RSVP has been recorded.'
        };
    } catch (error) {
        console.error('Error submitting RSVP:', error);
        throw error;
    }
}

// ============================================
// RSVP FORM FUNCTIONALITY
// ============================================

let verifiedData = null;

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
        verifiedData = null;
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
            const result = await verifyGuests(names);
            
            if (result.success) {
                isVerified = true;
                verifiedData = result;
                showMessage(verificationMsg, result.message, 'success');
            } else {
                isVerified = false;
                verifiedData = null;
                showMessage(verificationMsg, result.message, 'error');
            }
        } catch (error) {
            console.error('Verification error:', error);
            showMessage(verificationMsg, 'Unable to verify. Please try again or contact the couple.', 'error');
        } finally {
            verifyBtn.disabled = false;
            verifyBtn.textContent = 'Verify';
        }
    });
    
    // Form submission
    rsvpForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (!isVerified || !verifiedData) {
            showMessage(verificationMsg, 'Please verify your guest name(s) first', 'error');
            return;
        }
        
        const names = guestNamesInput.value.trim();
        const email = document.getElementById('email').value.trim();
        const attendance = document.querySelector('input[name="attendance"]:checked').value;
        const dietary = document.getElementById('dietaryRestrictions').value.trim();
        
        const submitBtn = rsvpForm.querySelector('.submit-btn');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';
        
        try {
            const result = await submitRSVP(verifiedData.rowIndex, names, email, attendance, dietary);
            
            if (result.success) {
                showMessage(verificationMsg, result.message, 'success');
                rsvpForm.reset();
                isVerified = false;
                verifiedData = null;
                
                // Show success message
                setTimeout(() => {
                    alert('Thank you! Your RSVP has been recorded. We can\'t wait to celebrate with you!');
                }, 500);
            } else {
                showMessage(verificationMsg, result.message || 'Failed to submit RSVP', 'error');
            }
        } catch (error) {
            console.error('Submission error:', error);
            showMessage(verificationMsg, 'Unable to submit RSVP. Please try again or contact the couple.', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'RSVP';
        }
    });
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

// Initialize carousel dots
document.addEventListener('DOMContentLoaded', function() {
    updateDots();
    
    // Auto-advance carousel every 5 seconds
    setInterval(() => {
        moveCarousel(1);
    }, 5000);
});