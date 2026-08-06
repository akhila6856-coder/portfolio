/* ================================================
   NAVBAR — Hamburger + Scroll-Spy + Scroll BG
================================================ */

const hamburger = document.getElementById('hamburger');
const navLinks  = document.querySelector('.nav-links');
const navItems  = document.querySelectorAll('.nav-links a');
const navbar    = document.querySelector('.navbar');

/* ---- Hamburger toggle ---- */
hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('open');
});

/* Close on link click */
navItems.forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinks.classList.remove('open');
    });
});

/* Close on outside click */
document.addEventListener('click', (e) => {
    if (!navbar.contains(e.target)) {
        hamburger.classList.remove('active');
        navLinks.classList.remove('open');
    }
});

/* Keyboard support */
hamburger.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        hamburger.click();
    }
});

/* ---- Navbar background on scroll — stays BLACK ---- */
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(0,0,0,0.97)';
        navbar.classList.add('scrolled');
    } else {
        navbar.style.background = 'rgba(0,0,0,0.85)';
        navbar.classList.remove('scrolled');
    }
}, { passive: true });

/* ---- Scroll-Spy ---- */
const sections = document.querySelectorAll('section[id]');

function activateNavLink() {
    const scrollY = window.scrollY;

    sections.forEach(section => {
        const top    = section.offsetTop - 110;
        const height = section.offsetHeight;
        const id     = section.getAttribute('id');
        const link   = document.querySelector(`.nav-links a[href="#${id}"]`);

        if (link && scrollY >= top && scrollY < top + height) {
            navItems.forEach(a => a.classList.remove('active'));
            link.classList.add('active');
        }
    });
}

window.addEventListener('scroll', activateNavLink, { passive: true });
activateNavLink();
