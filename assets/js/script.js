/* ================================================
   MAIN SCRIPT
   - Page Loader dismiss
   - Scroll Progress Bar
   - Gold Cursor Glow
   - AOS init
   - Project Filter
   - Contact Form
   - Scroll-to-Top Button
================================================ */

/* ---- Page Loader — wait for intro to finish ---- */
function onIntroComplete() {
    document.body.classList.add('loaded');

    /* Re-init AOS after intro hides so elements animate fresh */
    if (typeof AOS !== 'undefined') {
        AOS.refreshHard();
    }
}

/* Intro fires custom event; fallback to window.load */
window.addEventListener('introComplete', onIntroComplete, { once: true });
window.addEventListener('load', () => {
    /* If intro already finished this is a no-op; otherwise safety net */
    setTimeout(() => {
        if (!document.body.classList.contains('loaded')) {
            onIntroComplete();
        }
    }, 4500);
});

/* ---- Scroll Progress Bar ---- */
const progressBar = document.getElementById('scrollProgress');

function updateProgress() {
    if (!progressBar) return;
    const scrollTop  = document.documentElement.scrollTop  || document.body.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const pct = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    progressBar.style.width = pct + '%';
}

window.addEventListener('scroll', updateProgress, { passive: true });

/* ---- Gold Cursor Glow (desktop only) ---- */
const cursorGlow = document.getElementById('cursorGlow');

if (cursorGlow && window.matchMedia('(pointer: fine)').matches) {
    document.addEventListener('mousemove', (e) => {
        cursorGlow.style.left = e.clientX + 'px';
        cursorGlow.style.top  = e.clientY + 'px';
    }, { passive: true });
}

/* ---- AOS Init ---- */
AOS.init({
    duration: 650,
    easing:   'ease-in-out',
    once:     true,
    offset:   70
});

/* ---- Project Filter ---- */
const filterBtns   = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.getAttribute('data-filter');

        projectCards.forEach(card => {
            const cat = card.getAttribute('data-category');
            if (filter === 'all' || cat === filter) {
                card.classList.remove('hidden');
            } else {
                card.classList.add('hidden');
            }
        });
    });
});

/* ---- Contact Form ---- */
const contactForm = document.getElementById('contactForm');

if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const btnText    = contactForm.querySelector('.btn-text');
        const btnLoading = contactForm.querySelector('.btn-loading');
        const formMsg    = document.getElementById('formMsg');

        const name    = document.getElementById('name').value.trim();
        const email   = document.getElementById('email').value.trim();
        const message = document.getElementById('message').value.trim();

        if (!name || !email || !message) {
            showMsg('error', 'Please fill in Name, Email, and Message.');
            return;
        }

        const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRe.test(email)) {
            showMsg('error', 'Please enter a valid email address.');
            return;
        }

        btnText.style.display    = 'none';
        btnLoading.style.display = 'flex';
        formMsg.className        = 'form-msg';
        formMsg.style.display    = 'none';

        setTimeout(() => {
            btnText.style.display    = 'flex';
            btnLoading.style.display = 'none';
            showMsg('success', "Message sent! I'll get back to you soon.");
            contactForm.reset();
        }, 1800);

        function showMsg(type, text) {
            formMsg.textContent = text;
            formMsg.className   = 'form-msg ' + type;
        }
    });
}

/* ---- Scroll-to-Top Button ---- */
const scrollTopBtn = document.getElementById('scrollTopBtn');

if (scrollTopBtn) {
    window.addEventListener('scroll', () => {
        if (document.documentElement.scrollTop > 300) {
            scrollTopBtn.style.display = 'flex';
        } else {
            scrollTopBtn.style.display = 'none';
        }
    }, { passive: true });

    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}
