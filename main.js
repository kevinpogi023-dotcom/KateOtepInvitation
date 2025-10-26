// ============================================
// CONFIGURATION - UPDATE THIS URL ONLY
// ============================================
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzQvnt9bhnDNAAXyn-Qw6V9udBZE041QVPp0LFuikkC_fFQZ42RlE5__ydA293RwL46/exec';

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
// RSVP FORM WITH VERIFY BUTTON
// ============================================
const rsvpForm = document.getElementById('rsvpForm');
let guestVerified = false;
let verifiedGuestInfo = null;

if (rsvpForm) {
    const guestNamesInput = document.getElementById('guestNames');
    const verifyBtn = document.getElementById('verifyBtn');
    
    // Create verification message element
    const verificationMessage = document.createElement('div');
    verificationMessage.className = 'verification-message';
    verificationMessage.style.display = 'none';
    
    // Insert after the input-with-button div
    const inputWithButton = document.querySelector('.input-with-button');
    if (inputWithButton) {
        inputWithButton.parentNode.insertBefore(verificationMessage, inputWithButton.nextSibling);
    }
    
    // Reset verification when user types after verifying
    if (guestNamesInput) {
        guestNamesInput.addEventListener('input', () => {
            if (guestVerified) {
                guestVerified = false;
                verificationMessage.style.display = 'none';
                if (verifyBtn) {
                    verifyBtn.classList.remove('verified');
                    verifyBtn.textContent = 'Verify';
                }
            }
        });
        
        // Allow pressing Enter to verify
        guestNamesInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && verifyBtn) {
                e.preventDefault();
                verifyBtn.click();
            }
        });
    }
    
    // Verify button click handler
    if (verifyBtn) {
        verifyBtn.addEventListener('click', async () => {
            const names = guestNamesInput.value.trim();
            
            if (names.length < 3) {
                alert('Please enter at least one name to verify.');
                guestNamesInput.focus();
                return;
            }
            
            // Show loading state
            verifyBtn.disabled = true;
            verifyBtn.classList.add('loading');
            verifyBtn.textContent = 'Checking...';
            
            verificationMessage.innerHTML = '<span class="verification-loading">Checking guest list...</span>';
            verificationMessage.style.display = 'block';
            verificationMessage.classList.remove('verified', 'not-found', 'partial');
            
            try {
                const response = await fetch(GOOGLE_SCRIPT_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'verify',
                        guestNames: names
                    })
                });
                
                const result = await response.json();
                
                if (result.verified) {
                    // All guests verified
                    guestVerified = true;
                    verifiedGuestInfo = result;
                    verificationMessage.className = 'verification-message verified';
                    
                    let guestList = result.verifiedGuests.map(g => g.name).join(', ');
                    let seatsText = result.totalSeatsReserved === 1 ? 'seat' : 'seats';
                    
                    verificationMessage.innerHTML = `
                        <div class="verification-icon">✓</div>
                        <div class="verification-content">
                            <strong>All guests verified!</strong>
                            <p>${guestList}</p>
                            <p class="seats-info">Total: ${result.totalSeatsReserved} ${seatsText} reserved</p>
                        </div>
                    `;
                    verificationMessage.style.display = 'flex';
                    
                    // Update button to show verified state
                    verifyBtn.classList.remove('loading');
                    verifyBtn.classList.add('verified');
                    verifyBtn.textContent = '✓ Verified';
                    verifyBtn.disabled = false;
                    
                } else if (result.notFoundGuests && result.notFoundGuests.length > 0) {
                    // Some guests not found
                    guestVerified = false;
                    verificationMessage.className = 'verification-message partial';
                    
                    let verifiedList = result.verifiedGuests.length > 0 
                        ? `<p class="verified-names">✓ Found: ${result.verifiedGuests.map(g => g.name).join(', ')}</p>` 
                        : '';
                    
                    let notFoundList = `<p class="not-found-names">✗ Not found: ${result.notFoundGuests.join(', ')}</p>`;
                    
                    verificationMessage.innerHTML = `
                        <div class="verification-icon">⚠</div>
                        <div class="verification-content">
                            <strong>Some guests not found</strong>
                            ${verifiedList}
                            ${notFoundList}
                            <p class="helper-text">Please check spelling or contact us.</p>
                        </div>
                    `;
                    verificationMessage.style.display = 'flex';
                    
                    // Reset button
                    verifyBtn.classList.remove('loading', 'verified');
                    verifyBtn.textContent = 'Verify';
                    verifyBtn.disabled = false;
                    
                } else {
                    // No guests found
                    guestVerified = false;
                    verificationMessage.className = 'verification-message not-found';
                    verificationMessage.innerHTML = `
                        <div class="verification-icon">✗</div>
                        <div class="verification-content">
                            <strong>Guests not found</strong>
                            <p>We couldn't find these names on our guest list. Please check your spelling or contact us for assistance.</p>
                        </div>
                    `;
                    verificationMessage.style.display = 'flex';
                    
                    // Reset button
                    verifyBtn.classList.remove('loading', 'verified');
                    verifyBtn.textContent = 'Verify';
                    verifyBtn.disabled = false;
                }
            } catch (error) {
                console.error('Verification error:', error);
                verificationMessage.className = 'verification-message not-found';
                verificationMessage.innerHTML = `
                    <div class="verification-icon">✗</div>
                    <div class="verification-content">
                        <strong>Connection Error</strong>
                        <p>Unable to connect to the server. Please check your internet connection and try again.</p>
                    </div>
                `;
                verificationMessage.style.display = 'flex';
                
                // Reset button
                verifyBtn.classList.remove('loading', 'verified');
                verifyBtn.textContent = 'Verify';
                verifyBtn.disabled = false;
            }
        });
    }
    
    // Form submission
    rsvpForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Check if guests are verified
        if (!guestVerified) {
            alert('Please verify your guest names before submitting your RSVP. Click the "Verify" button first.');
            if (verifyBtn) verifyBtn.focus();
            return;
        }
        
        const submitBtn = rsvpForm.querySelector('.submit-btn');
        const originalBtnText = submitBtn.textContent;
        
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';
        
        const formData = {
            guestNames: guestNamesInput.value,
            email: document.getElementById('email').value,
            attendance: document.querySelector('input[name="attendance"]:checked')?.value,
            dietaryRestrictions: document.getElementById('dietaryRestrictions').value,
            verified: true,
            totalSeats: verifiedGuestInfo?.totalSeatsReserved || 0
        };
        
        // Check if attendance is selected
        if (!formData.attendance) {
            alert('Please select whether you can attend or not.');
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText;
            return;
        }
        
        try {
            await fetch(GOOGLE_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            
            // Show success message
            submitBtn.textContent = '✓ RSVP Submitted!';
            submitBtn.style.backgroundColor = '#4CAF50';
            
            // Reset form
            rsvpForm.reset();
            verificationMessage.style.display = 'none';
            guestVerified = false;
            if (verifyBtn) {
                verifyBtn.classList.remove('verified');
                verifyBtn.textContent = 'Verify';
            }
            
            // Show success alert
            alert('Thank you! Your RSVP has been submitted successfully. We look forward to celebrating with you!');
            
            // Reset button after 3 seconds
            setTimeout(() => {
                submitBtn.textContent = originalBtnText;
                submitBtn.style.backgroundColor = '';
                submitBtn.disabled = false;
            }, 3000);
            
        } catch (error) {
            console.error('Error:', error);
            alert('There was an error submitting your RSVP. Please try again or contact us directly.');
            submitBtn.textContent = originalBtnText;
            submitBtn.disabled = false;
        }
    });
}