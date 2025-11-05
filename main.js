// ============================================
// CONFIGURATION - UPDATE THIS URL ONLY
// ============================================
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxH3XEZ13rd_YFBVOw5z4nCAqk8_u3MFedt2k3zGcOME2YgipjpjvccGxhQPIx6Lu02nw/exec';

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

let foundGuests = [];
let selectedGuest = null;

document.addEventListener('DOMContentLoaded', function() {
    const continueBtn = document.getElementById('continueBtn');
    const selectBtn = document.getElementById('selectBtn');
    const searchAgainLink = document.getElementById('searchAgainLink');
    const rsvpForm = document.getElementById('rsvpForm');
    const searchName = document.getElementById('searchName');
    const searchError = document.getElementById('searchError');
    
    // Step 1: Search for guest
    continueBtn.addEventListener('click', async function() {
        const name = searchName.value.trim();
        
        if (!name) {
            showError('Please enter a name');
            return;
        }
        
        continueBtn.disabled = true;
        continueBtn.textContent = 'Searching...';
        searchError.style.display = 'none';
        
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
                    action: 'search',
                    name: name
                })
            });
            
            const result = await response.json();
            
            console.log('Search result:', result); // Debug log
            
            if (result.success && result.guests && result.guests.length > 0) {
                foundGuests = result.guests;
                console.log('Found guests:', foundGuests); // Debug log
                displayGuestList(result.guests);
                
                // Small delay to ensure DOM is ready
                setTimeout(() => {
                    showStep(2);
                }, 100);
            } else {
                showError(result.message || 'Name not found');
            }
        } catch (error) {
            console.error('Search error:', error);
            showError('Unable to search. Please try again or contact the couple.');
        } finally {
            continueBtn.disabled = false;
            continueBtn.textContent = 'Continue';
        }
    });
    
    // Step 2: Select guest from list
    selectBtn.addEventListener('click', function() {
        const selectedRadio = document.querySelector('input[name="guestSelect"]:checked');
        
        if (!selectedRadio) {
            alert('Please select your name from the list');
            return;
        }
        
        const guestIndex = parseInt(selectedRadio.value);
        selectedGuest = foundGuests[guestIndex];
        
        showStep(3);
    });
    
    // Search again link
    searchAgainLink.addEventListener('click', function(e) {
        e.preventDefault();
        resetForm();
        showStep(1);
    });
    
    // Step 3: Submit RSVP
    rsvpForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (!selectedGuest) {
            alert('Please select a guest first');
            return;
        }
        
        const formData = {
            action: 'submit',
            selectedGuest: selectedGuest,
            email: document.getElementById('email').value.trim(),
            attendance: document.querySelector('input[name="attendance"]:checked').value,
            dietary: document.getElementById('dietaryRestrictions').value.trim()
        };
        
        const submitBtn = rsvpForm.querySelector('.rsvp-submit-btn');
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
                alert(result.message);
                resetForm();
                showStep(1);
            } else {
                alert(result.message || 'Unable to submit RSVP');
            }
        } catch (error) {
            console.error('Submission error:', error);
            alert('Unable to submit RSVP. Please try again or contact the couple.');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit RSVP';
        }
    });
    
    // Initialize carousel
    updateDots();
    setInterval(() => {
        moveCarousel(1);
    }, 5000);
});

// FIXED: Display guest list with proper styling and selection
function displayGuestList(guests) {
    const guestList = document.getElementById('guestList');
    
    if (!guestList) {
        console.error('Guest list container not found');
        return;
    }
    
    guestList.innerHTML = '';
    
    console.log('Displaying', guests.length, 'guests'); // Debug log
    
    guests.forEach((guest, index) => {
        const box = document.createElement('div');
        box.className = 'guest-name-box';
        box.dataset.index = index;
        
        // Create radio input (hidden)
        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = 'guestSelect';
        radio.value = index;
        radio.id = `guest-${index}`;
        radio.style.display = 'none';
        
        // Create label for the name
        const label = document.createElement('label');
        label.htmlFor = `guest-${index}`;
        label.textContent = guest.name;
        label.style.cursor = 'pointer';
        label.style.display = 'block';
        label.style.width = '100%';
        
        // Add click handler to the box
        box.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Guest selected:', guest.name); // Debug log
            
            // Remove selected class from all boxes
            document.querySelectorAll('.guest-name-box').forEach(b => {
                b.classList.remove('selected');
            });
            // Add selected class to clicked box
            this.classList.add('selected');
            // Check the radio
            radio.checked = true;
        });
        
        box.appendChild(radio);
        box.appendChild(label);
        guestList.appendChild(box);
    });
    
    console.log('Guest list populated with', guestList.children.length, 'items'); // Debug log
}

function showStep(stepNumber) {
    console.log('Showing step:', stepNumber); // Debug log
    
    // Hide all steps
    document.querySelectorAll('.rsvp-step').forEach(step => {
        step.style.display = 'none';
    });
    
    // Show the requested step
    const targetStep = document.getElementById(`step${stepNumber}`);
    if (targetStep) {
        targetStep.style.display = 'block';
        
        console.log('Step', stepNumber, 'is now visible'); // Debug log
        console.log('Step HTML:', targetStep.innerHTML.substring(0, 200)); // Show first 200 chars
        
        // Scroll to step
        setTimeout(() => {
            targetStep.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
    } else {
        console.error('Step', stepNumber, 'not found'); // Debug log
    }
}

function showError(message) {
    const searchError = document.getElementById('searchError');
    searchError.textContent = message;
    searchError.style.display = 'block';
}

function resetForm() {
    document.getElementById('searchName').value = '';
    document.getElementById('searchError').style.display = 'none';
    document.getElementById('rsvpForm').reset();
    foundGuests = [];
    selectedGuest = null;
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