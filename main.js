// ============================================
// Invitation Gate - envelope landing screen
// shown before the invitation. Clicking the
// envelope plays an opening animation, fades
// the gate out, then reveals the site beneath.
// ============================================
(function() {
    const gate = document.getElementById('invitation-gate');
    const envelope = document.getElementById('openInvitation');
    if (!gate || !envelope) return;

    document.body.style.overflow = 'hidden';
    let opened = false;

    function openInvitation() {
        if (opened) return;
        opened = true;
        envelope.classList.add('opening');
        document.body.style.overflow = '';

        setTimeout(function() {
            gate.classList.add('gate-hidden');
        }, 450);

        setTimeout(function() {
            gate.style.display = 'none';
        }, 1150);
    }

    envelope.addEventListener('click', openInvitation);
})();

// ============================================
// Attire Grid - remove (not just hide) the extra
// outfit photo cells on mobile so their images
// never load on small screens. Desktop is untouched
// since this only runs when the mobile breakpoint matches.
// ============================================
if (window.matchMedia('(max-width: 767px)').matches) {
    document.addEventListener('DOMContentLoaded', function() {
        const selectors = [
            '.attire-photo-men-1',
            '.attire-photo-men-2',
            '.attire-photo-men-3',
            '.attire-photo-women-4',
            '.attire-photo-women-5',
            '.attire-photo-women-6',
            '.attire-photo-men-4',
            '.attire-photo-men-5',
            '.attire-photo-men-6'
        ];
        selectors.forEach(function(selector) {
            const cell = document.querySelector('.attire-grid > ' + selector);
            if (cell) cell.remove();
        });

        // Add 1 empty box (no photo yet) below the existing mobile cells
        const grid = document.querySelector('.attire-grid');
        if (grid) {
            const extra1 = document.createElement('div');
            extra1.className = 'attire-cell attire-photo attire-extra-box-1';
            grid.appendChild(extra1);
        }

        function divideIntoSixBoxes(el, images) {
            if (!el) return;
            for (let i = 0; i < 6; i++) {
                const sub = document.createElement('div');
                sub.className = 'attire-sub-box';
                if (images && images[i]) {
                    sub.style.backgroundImage = "url('images/" + images[i] + "')";
                }
                el.appendChild(sub);
            }
        }

        // Divide the 3rd child (women-3) into 6 equal sub-boxes with women1-3 and men1-3
        divideIntoSixBoxes(document.querySelector('.attire-grid > .attire-photo-women-3'), [
            'women1.png', 'women2.png', 'women3.png',
            'men1.png', 'men2.png', 'men3.png'
        ]);

        // Divide the 4th child (extra box) into 6 equal sub-boxes with women4-6 and men4-6
        divideIntoSixBoxes(document.querySelector('.attire-grid > .attire-extra-box-1'), [
            'women4.png', 'women5.png', 'women6.png',
            'men4.png', 'men5.png', 'men6.png'
        ]);

        // Add the wedding-colors reminder text into the 2nd child (women-2)
        const women2 = document.querySelector('.attire-grid > .attire-photo-women-2');
        if (women2) {
            const caption = document.createElement('p');
            caption.className = 'attire-women2-caption';
            caption.textContent = 'Guests are respectfully requested to follow our wedding colors.';
            women2.appendChild(caption);
        }

        // Move the white and yellow flowers into the hero section on mobile
        const hero = document.querySelector('#hero');
        const yellowFlower = document.querySelector('.story-yellowflower');
        const whiteFlower = document.querySelector('.story-whiteflower');
        if (hero && yellowFlower) hero.appendChild(yellowFlower);
        if (hero && whiteFlower) hero.appendChild(whiteFlower);
    });
}

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

// Parallax effect for hero background (GPU-composited via transform)
const heroEl = document.querySelector('.hero');
let parallaxTicking = false;

window.addEventListener('scroll', () => {
    if (parallaxTicking || !heroEl) return;
    parallaxTicking = true;

    requestAnimationFrame(() => {
        const scrolled = window.pageYOffset;
        if (scrolled <= heroEl.offsetHeight) {
            heroEl.style.setProperty('--parallax-y', `${scrolled * 0.3}px`);
        }
        parallaxTicking = false;
    });
}, { passive: true });

// Gift List Modal
(() => {
    const overlay = document.getElementById('giftModalOverlay');
    const modal = document.getElementById('giftModal');
    const closeBtn = document.getElementById('giftModalClose');
    const scrollThumb = document.getElementById('giftModalScrollThumb');
    const openBtns = [
        document.getElementById('giftListBtnDesktop'),
        document.getElementById('giftListBtnMobile')
    ];

    if (!overlay) return;

    const updateScrollThumb = () => {
        if (!modal || !scrollThumb) return;
        const { scrollTop, scrollHeight, clientHeight } = modal;
        if (scrollHeight <= clientHeight) {
            scrollThumb.style.height = '0px';
            return;
        }
        const trackHeight = clientHeight - 32; // matches track's top/bottom inset
        const thumbHeight = 90;
        const maxThumbTop = trackHeight - thumbHeight;
        const thumbTop = (scrollTop / (scrollHeight - clientHeight)) * maxThumbTop;
        scrollThumb.style.height = `${thumbHeight}px`;
        scrollThumb.style.top = `${thumbTop}px`;
    };

    const openModal = (e) => {
        if (e) e.preventDefault();
        if (modal) modal.scrollTop = 0;
        overlay.classList.add('active');
        requestAnimationFrame(updateScrollThumb);
    };

    const closeModal = () => {
        overlay.classList.remove('active');
    };

    openBtns.forEach(btn => btn && btn.addEventListener('click', openModal));
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
        closeBtn.addEventListener('touchend', (e) => {
            e.preventDefault();
            closeModal();
        });
    }

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeModal();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && overlay.classList.contains('active')) closeModal();
    });

    if (modal) {
        modal.addEventListener('scroll', updateScrollThumb, { passive: true });
    }
    window.addEventListener('resize', updateScrollThumb);
})();

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
let currentWeddingCode = 'OK27';
let currentPartyId = null;

document.addEventListener('DOMContentLoaded', function() {
    const continueBtn = document.getElementById('continueBtn');
    const selectBtn = document.getElementById('selectBtn');
    const searchAgainLink = document.getElementById('searchAgainLink');
    const rsvpForm = document.getElementById('rsvpForm');
    const searchName = document.getElementById('searchName');
    const searchError = document.getElementById('searchError');
    const backBtn2 = document.getElementById('backBtn2');
    const backBtn3 = document.getElementById('backBtn3');
    
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
            const nameSearch = name.toLowerCase();
            const searchWords = nameSearch.split(/\s+/).filter(Boolean);
            const snapshot = await db.collection('parties')
                .where('weddingCode', '==', currentWeddingCode)
                .get();

            const matches = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                if (data.namesSearch && data.namesSearch.some(n => searchWords.every(word => n.includes(word)))) {
                    matches.push({ id: doc.id, ...data });
                }
            });

            if (matches.length === 1) {
                const matchedParty = matches[0];
                currentPartyId = matchedParty.id;
                foundGuests = matchedParty.members.map(m => ({ name: m.name }));
                displayGuestList(foundGuests, matchedParty.rsvpResponses || []);
                setTimeout(() => {
                    showStep(2);
                }, 100);
            } else if (matches.length > 1) {
                showError('More than one guest matches that name. Please enter your full name (first and last) to narrow it down.');
            } else {
                showError('Name not found. Please check the spelling or contact the couple.');
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
        const guestResponses = [];

        foundGuests.forEach((guest, index) => {
            const selectedRadio = document.querySelector(`input[name="guest-${index}-attendance"]:checked`);
            if (selectedRadio) {
                guestResponses.push({ name: guest.name, attendance: selectedRadio.value });
            }
            // Unselected members remain pending — they can search their own name later
        });

        if (guestResponses.length === 0) {
            alert('Please select attendance for at least one person.');
            return;
        }

        selectedGuest = {
            guests: guestResponses,
            primaryGuest: foundGuests[0]
        };

        showStep(3);
    });
    
    // Search again link
    searchAgainLink.addEventListener('click', function(e) {
        e.preventDefault();
        resetForm();
        showStep(1);
    });

    // Back buttons
    backBtn2.addEventListener('click', function() {
        resetForm();
        showStep(1);
    });

    backBtn3.addEventListener('click', function() {
        showStep(2);
    });
    
    // Step 3: Submit RSVP
    rsvpForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (!selectedGuest) {
            alert('Please select a guest first');
            return;
        }
        
        const submitBtn = rsvpForm.querySelector('.rsvp-submit-btn');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';

        try {
            // Fetch existing responses to preserve unselected members
            const partyDoc = await db.collection('parties').doc(currentPartyId).get();
            const existingData = partyDoc.data();
            const existing = existingData.rsvpResponses || [];

            // Merge: new responses override existing ones, others stay
            const merged = [...existing];
            selectedGuest.guests.forEach(newR => {
                const idx = merged.findIndex(r => r.name === newR.name);
                if (idx >= 0) merged[idx] = newR;
                else merged.push(newR);
            });

            // Party is fully submitted only when all members have responded
            const allMembers = existingData.members || [];
            const allResponded = allMembers.every(m => merged.some(r => r.name === m.name));

            const guestEmail = document.getElementById('email').value.trim();
            const dietary = document.getElementById('dietaryRestrictions').value.trim();

            await db.collection('parties').doc(currentPartyId).update({
                rsvpSubmitted: allResponded,
                rsvpResponses: merged,
                email: guestEmail,
                dietary: dietary,
                submittedAt: firebase.firestore.FieldValue.serverTimestamp()
            });

            showRsvpSuccess();
            resetForm();
            showStep(1);
        } catch (error) {
            console.error('Submission error:', error);
            alert('Unable to submit RSVP. Please try again or contact the couple.');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit RSVP';
        }
    });
});

// Display guest list with each guest's existing RSVP status
function displayGuestList(guests, existingResponses = []) {
    const guestList = document.getElementById('guestList');

    if (!guestList) {
        console.error('Guest list container not found');
        return;
    }

    guestList.innerHTML = '';

    guests.forEach((guest, index) => {
        const existing = existingResponses.find(r => r.name === guest.name);
        const status = existing?.attendance; // 'yes', 'no', or undefined (pending)

        const guestItem = document.createElement('div');
        guestItem.className = 'guest-attendance-item';

        // Name + current status badge
        const nameRow = document.createElement('div');
        nameRow.className = 'guest-name-row';

        const nameLabel = document.createElement('span');
        nameLabel.className = 'guest-name-label';
        nameLabel.textContent = guest.name;

        const badge = document.createElement('span');
        if (status === 'yes') {
            badge.className = 'rsvp-status-badge badge-attending';
            badge.textContent = '✓ Attending';
        } else if (status === 'no') {
            badge.className = 'rsvp-status-badge badge-declined';
            badge.textContent = '✗ Not Attending';
        } else {
            badge.className = 'rsvp-status-badge badge-pending';
            badge.textContent = '· Pending';
        }

        nameRow.appendChild(nameLabel);
        nameRow.appendChild(badge);
        guestItem.appendChild(nameRow);

        // Show radio buttons for pending and not-attending (can change mind), hide for attending
        if (status !== 'yes') {
            const radioContainer = document.createElement('div');
            radioContainer.className = 'guest-radio-group';

            const attendLabel = document.createElement('label');
            attendLabel.className = 'guest-radio-label';
            const attendRadio = document.createElement('input');
            attendRadio.type = 'radio';
            attendRadio.name = `guest-${index}-attendance`;
            attendRadio.value = 'yes';
            attendLabel.appendChild(attendRadio);
            attendLabel.appendChild(document.createTextNode(' Will Attend'));

            const notAttendLabel = document.createElement('label');
            notAttendLabel.className = 'guest-radio-label';
            const notAttendRadio = document.createElement('input');
            notAttendRadio.type = 'radio';
            notAttendRadio.name = `guest-${index}-attendance`;
            notAttendRadio.value = 'no';
            notAttendRadio.checked = status === 'no';
            notAttendLabel.appendChild(notAttendRadio);
            notAttendLabel.appendChild(document.createTextNode(' Will Not Attend'));

            radioContainer.appendChild(attendLabel);
            radioContainer.appendChild(notAttendLabel);
            guestItem.appendChild(radioContainer);
        }

        guestList.appendChild(guestItem);

        // Add separator line except for last item
        if (index < guests.length - 1) {
            const separator = document.createElement('div');
            separator.className = 'guest-separator';
            guestList.appendChild(separator);
        }
    });
}

function showStep(stepNumber) {
    console.log('Showing step:', stepNumber);
    
    // Hide all steps and remove active class
    document.querySelectorAll('.rsvp-step').forEach(step => {
        step.style.display = 'none';
        step.classList.remove('active');
    });
    
    // Show the requested step
    const targetStep = document.getElementById(`step${stepNumber}`);
    if (targetStep) {
        targetStep.style.display = 'block';
        
        // Add active class after a tiny delay for animation
        setTimeout(() => {
            targetStep.classList.add('active');
        }, 10);
        
        console.log('Step', stepNumber, 'is now visible');
        
        // Scroll to step
        setTimeout(() => {
            targetStep.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
    } else {
        console.error('Step', stepNumber, 'not found');
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
// RSVP Success Modal
// ============================================
function showRsvpSuccess() {
    const modal = document.getElementById('rsvpSuccessModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeRsvpSuccess() {
    const modal = document.getElementById('rsvpSuccessModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// ============================================
// FAQ Accordion Functionality
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', function() {
            item.classList.toggle('active');
        });
    });
});