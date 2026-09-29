// ============================================
// Invitation Gate - envelope landing screen
// shown before the invitation. Clicking the
// envelope plays an opening animation, fades
// the gate out, then reveals the site beneath.
// ============================================
(function() {
    const gate = document.getElementById('invitation-gate');
    const envelope = document.getElementById('openInvitation');
    const saveTheDate = document.getElementById('save-the-date');
    if (!gate || !envelope) return;

    // Set to true to play the save-the-date video after the envelope opens.
    const PLAY_TRANSITION_VIDEO = false;

    document.body.style.overflow = 'hidden';
    let opened = false;

    function playSaveTheDate() {
        if (!PLAY_TRANSITION_VIDEO || !saveTheDate) return;
        const video = document.getElementById('transitionVideo');

        saveTheDate.style.display = 'flex';
        saveTheDate.classList.add('active');

        function finish() {
            saveTheDate.classList.add('fading-out');
            setTimeout(function() {
                saveTheDate.style.display = 'none';
            }, 600);
        }

        if (video) {
            const isDesktop = window.matchMedia('(min-width: 770px)').matches;
            const src = isDesktop ? 'videos/desktop.mp4' : 'videos/mobile.mp4';
            if (!video.src || video.src.indexOf(src) === -1) {
                video.src = src;
                video.load();
            }
            video.currentTime = 0;
            const playPromise = video.play();
            if (playPromise && playPromise.catch) {
                playPromise.catch(function() {
                    // Autoplay was blocked - fall back to a fixed delay
                    setTimeout(finish, 4000);
                });
            }
            video.addEventListener('ended', finish, { once: true });
        } else {
            setTimeout(finish, 4000);
        }
    }

    function openInvitation() {
        if (opened) return;
        opened = true;
        envelope.classList.add('opening');
        document.body.style.overflow = '';

        setTimeout(function() {
            gate.classList.add('gate-hidden');
            playSaveTheDate();
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
if (window.matchMedia('(max-width: 769px)').matches) {
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

        // Move the white and yellow flowers into the hero section on phones
        // (tablets 600-769px keep them in place)
        if (window.matchMedia('(max-width: 599px)').matches) {
            const hero = document.querySelector('#hero');
            const yellowFlower = document.querySelector('.story-yellowflower');
            const whiteFlower = document.querySelector('.story-whiteflower');
            if (hero && yellowFlower) hero.appendChild(yellowFlower);
            if (hero && whiteFlower) hero.appendChild(whiteFlower);
        }
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

// ============================================
// Gift Reservations - connected to a Google Sheet
// via a Google Apps Script Web App. The sheet has
// columns: Item | Reserved | ReservedBy | Email.
// See gift-reservations-setup.md for the Apps
// Script code and deployment steps.
// ============================================
(() => {
    const GIFT_SCRIPT_URL = 'PASTE_YOUR_DEPLOYED_APPS_SCRIPT_URL_HERE';
    const grid = document.getElementById('giftGrid');
    if (!grid) return;

    const GIFT_ITEMS = [
        { name: 'Portable Power Station', img: 'images/portable.png', url: 'https://ph.ecoflow.com/products/delta-3-portable-power-station?variant=53798337380662' },
        { name: 'Coffee Machine', img: 'images/coffeemaker.png', url: '#' },
        { name: 'Oven Toaster / Airfryer', img: 'images/oventoaster.png', url: 'https://shopee.ph/Eureka-20L-Air-Fryer-Oven-High-Capacity-Electric-Toaster-Bake-Grill-EEAO-20L-i.1461663903.28334659912' },
        { name: 'Rice Cooker', img: 'images/ricecooker.png', url: '#' },
        { name: 'Microwave', img: 'images/microwave.png', url: 'https://shopee.ph/Midea-20L-Inverter-Quattro-Series-Mechanical-Microwave-Oven-(Black)-i.129365759.25314855728' },
        { name: 'Blender', img: 'images/blender.png', url: 'https://shopee.ph/PHILIPS-Blender-HR2041-10-4-Star-Blade-1-Speed-Setting-and-Pulse-Smoothie-Juicer-1L-450W-i.296368531.10092029415' },
        { name: 'Vacuum Cleaner', img: 'images/vacuum.png', url: 'https://shopee.ph/Deerma-VC20-Plus-Vacuum-Cleaner-Handheld-Cordless-Stick-Aspirator-Lightweight-Vacuum-5500Pa-i.330250330.5062121543' },
        { name: 'Robot Vacuum', img: 'images/robotvacuum.png', url: 'https://shopee.ph/-BESTSELLER-eufy-by-Anker-Omni-C20-Robot-Vacuum-Mop-All-in-One-Station-7000Pa-Suction-i.251064806.41060236254' },
        { name: 'Air Purifier', img: 'images/airpurifier.png', url: 'https://shopee.ph/Levoit-Core-P350-Pet-Care-Air-Purifier-Effective-33-m%C2%B2-H13-True-HEPA-Filter-i.512761824.14987528183' },
        { name: 'Humidifier', img: 'images/humidifier.png', url: 'https://shopee.ph/Deerma-PX310W-Humidifier-Essential-Oil-Diffuser-Aromatherapy-Diffuser-3-Speed-Timing-300ML-i.330250330.25934694381' },
        { name: 'Charging Station', img: 'images/chargingstation.png', url: 'https://shopee.ph/UGREEN-200W-GaN-Charger-8-in-1-Desktop-Laptop-Fast-Charging-Stand-For-iPhone-16-15-Pro-Max-Macbook-Air-Xiaomi-Samsung-Tablets-i.98350209.44450804183' },
        { name: 'Indoor Camera', img: 'images/indoorcamera.png', url: 'https://shopee.ph/IMOU-Ranger-Dual-Pro-Dual-Lens-CCTV-Wireless-Security-Indoor-Camera-Connect-Cellphone-WiFi-Audio-i.1357126550.43150148436' },
        { name: 'Cat Automatic Dry Food Machine', img: 'images/dryfoodmachine.png', url: 'https://shopee.ph/Rojeco-2L-Automatic-Cat-Feeder-Button-WIFI-Version-Dog-Food-Dispenser-Smart-Control-Timed-Feeder-i.549150104.17998285051' },
        { name: 'Cat Automatic Wet Food Machine', img: 'images/catautomoatic.png', url: 'https://shopee.ph/ROJECO-Automatic-Wet-Food-Feeder-for-Pets-With-Ice-box-6-Meal-Feeder-with-Programmable-Timer-For-Cats-and-Dogs-i.549150104.29663558229' },
        { name: 'Cat Water Fountain', img: 'images/catwater fountain.png', url: 'https://shopee.ph/product/549150104/28456000237' },
        { name: 'Extension Cord', img: 'images/extensioncord.png', url: 'https://shopee.ph/Deli-Universal-Hole-Vertical-Socket-4-8-12-Group-1A2C-1.6-3M-Extension-Cord-ET764-i.332268558.26237053153' },
        { name: 'Rechargeable Battery', img: 'images/rechargablebatt.png', url: 'https://shopee.ph/imuto-Rechargeable-AA-AAA-Battery-Li-ion-with-Charger-8-Pcs-1.5V-3000-1300mwh-Camera-Batteries-i.1407241126.28631254458' },
        { name: 'Philips Oneturn Iron Steamer', img: 'images/ironsteamer.png', url: '#' }
    ];

    const VIEW_ICON = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 14L14.5 9.5M9 6H5a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-4M14 4h6v6M20 4l-8 8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    const RESERVE_ICON = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 12v9H4v-9M2 7h20v5H2V7zM12 22V7M12 7C10 2 6 2 6 5s3 2 6 2zM12 7c2-5 6-5 6-2s-3 2-6 2z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';

    GIFT_ITEMS.forEach(function(item) {
        const card = document.createElement('div');
        card.className = 'gift-card';
        card.dataset.gift = item.name;
        card.innerHTML =
            '<div class="gift-card-img-wrap">' +
                '<img src="' + item.img + '" alt="' + item.name + '" class="gift-card-img">' +
                '<span class="gift-card-reserved-stamp">Reserved</span>' +
            '</div>' +
            '<div class="gift-card-body">' +
                '<p class="gift-card-name">' + item.name + '</p>' +
                '<span class="gift-card-badge" hidden>&check; Reserved</span>' +
                '<div class="gift-card-actions">' +
                    '<a href="' + item.url + '" class="gift-card-view-btn" target="_blank" rel="noopener">' + VIEW_ICON + '<span class="gift-card-btn-label"> View Gift</span></a>' +
                    '<button type="button" class="gift-card-reserve-btn">' + RESERVE_ICON + '<span class="gift-card-btn-label"> Reserve Gift</span></button>' +
                '</div>' +
            '</div>';
        grid.appendChild(card);
    });

    const cards = Array.from(grid.querySelectorAll('.gift-card'));
    let pendingCard = null;

    const reserveOverlay = document.getElementById('reserveModalOverlay');
    const reserveClose = document.getElementById('reserveModalClose');
    const reserveCancel = document.getElementById('reserveModalCancel');
    const reserveConfirm = document.getElementById('reserveModalConfirm');
    const reserveNameInput = document.getElementById('reserveNameInput');
    const reserveEmailInput = document.getElementById('reserveEmailInput');

    function renderReserved(card, reservedBy) {
        card.classList.add('is-reserved');
        const badge = card.querySelector('.gift-card-badge');
        if (badge) {
            badge.hidden = false;
            badge.textContent = reservedBy ? ('✓ Reserved by ' + reservedBy) : '✓ Reserved';
        }
        // .gift-card-actions stays visible - CSS hides just the Reserve
        // Gift button for .is-reserved cards, leaving View Gift visible.
    }

    function loadGiftStatus() {
        if (!GIFT_SCRIPT_URL || GIFT_SCRIPT_URL.indexOf('PASTE_YOUR') === 0) {
            console.warn('Gift list is not connected to a spreadsheet yet - set GIFT_SCRIPT_URL in main.js.');
            return;
        }
        fetch(GIFT_SCRIPT_URL + '?action=list')
            .then(function(res) { return res.json(); })
            .then(function(data) {
                // data is expected as: { "Item Name": { reserved: true, reservedBy: "Name" }, ... }
                cards.forEach(function(card) {
                    const giftName = card.dataset.gift;
                    const info = data[giftName];
                    if (info && info.reserved) {
                        renderReserved(card, info.reservedBy);
                    }
                });
            })
            .catch(function(err) {
                console.error('Could not load gift reservation status:', err);
            });
    }

    function openReserveModal(card) {
        pendingCard = card;
        if (reserveNameInput) reserveNameInput.value = '';
        if (reserveEmailInput) reserveEmailInput.value = '';
        if (reserveConfirm) {
            reserveConfirm.disabled = false;
            reserveConfirm.textContent = 'Reserve Gift';
        }
        if (reserveOverlay) reserveOverlay.classList.add('active');
        if (reserveNameInput) reserveNameInput.focus();
    }

    function closeReserveModal() {
        pendingCard = null;
        if (reserveOverlay) reserveOverlay.classList.remove('active');
    }

    grid.addEventListener('click', function(e) {
        const reserveBtn = e.target.closest('.gift-card-reserve-btn');
        if (reserveBtn) {
            openReserveModal(reserveBtn.closest('.gift-card'));
        }
    });

    if (reserveClose) reserveClose.addEventListener('click', closeReserveModal);
    if (reserveCancel) reserveCancel.addEventListener('click', closeReserveModal);
    if (reserveOverlay) {
        reserveOverlay.addEventListener('click', function(e) {
            if (e.target === reserveOverlay) closeReserveModal();
        });
    }
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && reserveOverlay && reserveOverlay.classList.contains('active')) {
            closeReserveModal();
        }
    });

    if (reserveConfirm) {
        reserveConfirm.addEventListener('click', function() {
            if (!pendingCard) return;
            const giftName = pendingCard.dataset.gift;
            const name = reserveNameInput ? reserveNameInput.value.trim() : '';
            const email = reserveEmailInput ? reserveEmailInput.value.trim() : '';

            if (!name) {
                reserveNameInput.focus();
                return;
            }

            if (!GIFT_SCRIPT_URL || GIFT_SCRIPT_URL.indexOf('PASTE_YOUR') === 0) {
                // TEST MODE: no spreadsheet connected yet, so just preview the
                // reserved look locally (not saved, resets on page refresh).
                renderReserved(pendingCard, name);
                closeReserveModal();
                return;
            }

            const card = pendingCard;
            reserveConfirm.disabled = true;
            reserveConfirm.textContent = 'Saving...';

            fetch(GIFT_SCRIPT_URL, {
                method: 'POST',
                mode: 'cors',
                cache: 'no-cache',
                headers: { 'Content-Type': 'text/plain' },
                redirect: 'follow',
                body: JSON.stringify({ action: 'reserve', item: giftName, name: name, email: email })
            })
                .then(function(res) { return res.json(); })
                .then(function(result) {
                    if (result.success) {
                        renderReserved(card, name);
                        closeReserveModal();
                    } else {
                        alert(result.message || 'That gift may have just been reserved by someone else - please refresh and check.');
                        reserveConfirm.disabled = false;
                        reserveConfirm.textContent = 'Reserve Gift';
                    }
                })
                .catch(function(err) {
                    console.error('Could not save gift reservation:', err);
                    alert('Unable to reserve this gift right now. Please try again.');
                    reserveConfirm.disabled = false;
                    reserveConfirm.textContent = 'Reserve Gift';
                });
        });
    }

    const giftListBtns = [
        document.getElementById('giftListBtnDesktop'),
        document.getElementById('giftListBtnMobile')
    ];
    giftListBtns.forEach(function(btn) {
        if (btn) btn.addEventListener('click', function() {
            // Refetch every time the modal opens (not just once) so a gift
            // someone else just reserved shows up-to-date instead of stale.
            loadGiftStatus();
        });
    });
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
    if (window.innerWidth > 769) {
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

// ============================================
// Add to Calendar - hero button (replaces the
// old scroll-down indicator)
// ============================================
(function() {
    const wrap = document.getElementById('addToCalendarWrap');
    const btn = document.getElementById('addToCalendarBtn');
    const menu = document.getElementById('addToCalendarMenu');
    if (!wrap || !btn || !menu) return;

    // The Google Calendar and .ics links live in Index.html so they work
    // even if other scripts fail; this only toggles the menu.
    function closeMenu() {
        menu.hidden = true;
    }

    btn.addEventListener('click', function(e) {
        e.stopPropagation();
        menu.hidden = !menu.hidden;
    });

    document.addEventListener('click', function(e) {
        if (!wrap.contains(e.target)) closeMenu();
    });
})();

// ============================================
// Venue Map Modal - opened from the "Click the
// map" card in the Wedding Schedule section
// ============================================
(function() {
    const trigger = document.getElementById('mapCardLink');
    const overlay = document.getElementById('mapModalOverlay');
    const closeBtn = document.getElementById('mapModalClose');
    if (!trigger || !overlay) return;

    function openModal(e) {
        e.preventDefault();
        overlay.classList.add('active');
    }

    function closeModal() {
        overlay.classList.remove('active');
    }

    trigger.addEventListener('click', openModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) closeModal();
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && overlay.classList.contains('active')) closeModal();
    });
})();