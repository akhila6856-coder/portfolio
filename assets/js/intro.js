/* ================================================
   FAANG INTRO SCREEN — Derangula Akhila Portfolio
   Sequence:
   1. Gold floating particles (background layer)
   2. Circuit-board lines grow across screen
   3. Lines converge to bright central node
   4. Node pulses → content fades in
   5. Type "Building Intelligent Solutions"
   6. Morph → "Software Engineer  •  AI/ML Enthusiast"
   7. Tagline fade-up
   8. Progress bar 0→100% with % counter
   9. Exit: particles scatter + zoom into Hero
================================================ */

(function () {
    'use strict';

    /* ---- Link intro CSS ---- */
    const introLink = document.createElement('link');
    introLink.rel   = 'stylesheet';
    introLink.href  = 'assets/css/intro.css';
    document.head.insertBefore(introLink, document.head.firstChild);

    /* ---- Respect prefers-reduced-motion ---- */
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ================================================
       SKIP LOGIC
    ================================================ */
    let skippable = false;
    setTimeout(() => { skippable = true; }, 1000);

    function trySkip() { if (skippable) exitIntro(); }

    document.addEventListener('keydown',     trySkip);
    document.addEventListener('pointerdown', trySkip);

    /* ================================================
       CANVAS SETUP — shared by both layers
    ================================================ */
    const W = () => window.innerWidth;
    const H = () => window.innerHeight;
    const CX = () => W() / 2;
    const CY = () => H() / 2;

    /* ---- Particle canvas (background) ---- */
    const pCanvas = document.getElementById('introCanvas');
    const pCtx    = pCanvas ? pCanvas.getContext('2d') : null;

    /* ---- Circuit canvas (midground) ---- */
    const cCanvas = document.getElementById('circuitCanvas');
    const cCtx    = cCanvas ? cCanvas.getContext('2d') : null;

    function resizeAll() {
        if (pCanvas) { pCanvas.width = W(); pCanvas.height = H(); }
        if (cCanvas) { cCanvas.width = W(); cCanvas.height = H(); }
    }
    window.addEventListener('resize', resizeAll);
    resizeAll();

    /* ================================================
       LAYER 1 — FLOATING GOLD PARTICLES
    ================================================ */
    let particles   = [];
    let scattering  = false;
    let pFrame;

    function makeParticle() {
        return {
            x:     Math.random() * W(),
            y:     Math.random() * H(),
            r:     Math.random() * 1.6 + 0.3,
            alpha: Math.random() * 0.45 + 0.08,
            vx:    (Math.random() - 0.5) * 0.32,
            vy:    (Math.random() - 0.5) * 0.32,
            pulse: Math.random() * Math.PI * 2,
        };
    }

    for (let i = 0; i < 120; i++) particles.push(makeParticle());

    function drawParticles() {
        if (!pCtx) return;
        pCtx.clearRect(0, 0, W(), H());

        particles.forEach(p => {
            p.pulse += 0.018;
            const a = p.alpha * (0.7 + 0.3 * Math.sin(p.pulse));

            if (scattering) {
                p.vx *= 1.06;
                p.vy *= 1.06;
                p.alpha *= 0.95;
            }

            p.x += p.vx;
            p.y += p.vy;

            if (p.x < 0) p.x = W();
            if (p.x > W()) p.x = 0;
            if (p.y < 0) p.y = H();
            if (p.y > H()) p.y = 0;

            pCtx.beginPath();
            pCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            pCtx.fillStyle = `rgba(255,215,0,${a})`;
            pCtx.shadowColor = 'rgba(255,215,0,0.8)';
            pCtx.shadowBlur  = 4;
            pCtx.fill();
        });

        pFrame = requestAnimationFrame(drawParticles);
    }

    if (!reducedMotion) drawParticles();

    /* ================================================
       LAYER 2 — CIRCUIT BOARD ANIMATION
    ================================================ */
    /*
       Algorithm:
       - Spawn N "traces" from random edge points
       - Each trace travels in L-shaped segments (horizontal then vertical)
       - After ~60% of total duration, traces start converging toward centre
       - At 85% they all arrive at centre → node bursts
       - Node pulses, then content text appears
    */

    let cFrame;
    let circuitDone = false;
    let nodeRadius  = 0;
    let nodePulse   = 0;
    let nodeAlpha   = 0;
    let nodeActive  = false;

    /* Build traces */
    function buildTraces(count) {
        const traces = [];
        const sides  = ['top','bottom','left','right'];

        for (let i = 0; i < count; i++) {
            const side = sides[i % sides.length];
            let sx, sy;

            if (side === 'top')    { sx = Math.random() * W();  sy = 0; }
            if (side === 'bottom') { sx = Math.random() * W();  sy = H(); }
            if (side === 'left')   { sx = 0;  sy = Math.random() * H(); }
            if (side === 'right')  { sx = W(); sy = Math.random() * H(); }

            /* each trace is a list of waypoints */
            const waypoints = generatePath(sx, sy);

            traces.push({
                points:   [{ x: sx, y: sy }],   /* drawn so far */
                waypoints,
                wpIdx:    0,
                progress: 0,           /* 0–1 along current segment */
                speed:    0.012 + Math.random() * 0.014,
                alpha:    0.55 + Math.random() * 0.35,
                width:    0.8 + Math.random() * 0.8,
                done:     false,
                converging: false,
            });
        }
        return traces;
    }

    /* Generate L-shaped path: random segments then aim at centre */
    function generatePath(sx, sy) {
        const pts = [];
        let cx2 = sx, cy2 = sy;
        const steps = 3 + Math.floor(Math.random() * 3);

        for (let s = 0; s < steps; s++) {
            /* alternate horizontal / vertical */
            if (s % 2 === 0) {
                cx2 = Math.random() * W();
            } else {
                cy2 = Math.random() * H();
            }
            pts.push({ x: cx2, y: cy2 });
        }
        return pts;
    }

    /* Redirect all active traces toward screen centre */
    function convergeTraces(traces) {
        traces.forEach(t => {
            if (t.done) return;
            t.converging = true;
            const last = t.points[t.points.length - 1];
            /* 2-step L-turn toward centre */
            t.waypoints = [
                { x: CX(), y: last.y },
                { x: CX(), y: CY() },
            ];
            t.wpIdx     = 0;
            t.progress  = 0;
            t.speed     = 0.02 + Math.random() * 0.015; /* speed up */
        });
    }

    const traces = reducedMotion ? [] : buildTraces(22);
    let converged = false;

    /* Schedule convergence */
    const CIRCUIT_DURATION = 2200;   /* ms total for circuit phase */
    const CONVERGE_AT      = 1200;   /* ms after start → redirect */

    setTimeout(() => {
        if (!circuitDone) convergeTraces(traces);
        converged = true;
    }, CONVERGE_AT);

    function drawCircuit() {
        if (!cCtx) return;
        cCtx.clearRect(0, 0, W(), H());

        let allArrived = converged;

        traces.forEach(t => {
            if (t.done) return;

            /* Advance along waypoints */
            if (t.wpIdx < t.waypoints.length) {
                const from = t.points[t.points.length - 1];
                const to   = t.waypoints[t.wpIdx];

                t.progress += t.speed;

                if (t.progress >= 1) {
                    t.points.push({ x: to.x, y: to.y });
                    t.wpIdx++;
                    t.progress = 0;
                }

                /* If converging and reached centre, mark done */
                if (t.converging && t.wpIdx >= t.waypoints.length) {
                    t.done = true;
                }
            } else {
                if (!t.converging) {
                    /* non-converging trace reached its random end → stop */
                    t.done = true;
                }
            }

            /* Check if still moving toward centre */
            if (!t.done) allArrived = false;

            /* Draw the trace */
            drawTrace(t);
        });

        /* Draw central node */
        if (nodeActive) {
            nodePulse += 0.06;
            nodeAlpha = Math.min(nodeAlpha + 0.04, 1);
            const pulseR = nodeRadius + Math.sin(nodePulse) * 5;

            /* outer glow rings */
            for (let ring = 3; ring >= 1; ring--) {
                const gAlpha = nodeAlpha * (0.08 * ring);
                cCtx.beginPath();
                cCtx.arc(CX(), CY(), pulseR * (1 + ring * 0.55), 0, Math.PI * 2);
                cCtx.strokeStyle = `rgba(255,215,0,${gAlpha})`;
                cCtx.lineWidth   = 1.5;
                cCtx.stroke();
            }

            /* core node */
            const grad = cCtx.createRadialGradient(CX(), CY(), 0, CX(), CY(), pulseR);
            grad.addColorStop(0,   `rgba(255,240,180,${nodeAlpha})`);
            grad.addColorStop(0.4, `rgba(255,215,0,${nodeAlpha * 0.85})`);
            grad.addColorStop(1,   `rgba(255,215,0,0)`);

            cCtx.beginPath();
            cCtx.arc(CX(), CY(), pulseR, 0, Math.PI * 2);
            cCtx.fillStyle = grad;
            cCtx.fill();

            /* bright centre dot */
            cCtx.beginPath();
            cCtx.arc(CX(), CY(), 4, 0, Math.PI * 2);
            cCtx.fillStyle = `rgba(255,255,220,${nodeAlpha})`;
            cCtx.shadowColor = '#FFD700';
            cCtx.shadowBlur  = 20;
            cCtx.fill();
            cCtx.shadowBlur  = 0;
        }

        /* Once ALL converging traces arrived → burst node */
        if (!circuitDone) {
            const arrivedCount = traces.filter(t => t.done).length;
            if (arrivedCount > 0 && arrivedCount >= traces.filter(t => t.converging).length) {
                circuitDone = true;
                nodeActive  = true;
                /* Grow node from 0 → 40px */
                let grow = 0;
                const growInterval = setInterval(() => {
                    grow += 3;
                    nodeRadius = Math.min(grow, 40);
                    if (grow >= 40) clearInterval(growInterval);
                }, 16);
            }
        }

        cFrame = requestAnimationFrame(drawCircuit);
    }

    function drawTrace(t) {
        if (t.points.length < 1) return;

        const full = [...t.points];

        /* Add interpolated current point */
        if (t.wpIdx < t.waypoints.length) {
            const from = full[full.length - 1];
            const to   = t.waypoints[t.wpIdx];
            full.push({
                x: from.x + (to.x - from.x) * t.progress,
                y: from.y + (to.y - from.y) * t.progress,
            });
        }

        if (full.length < 2) return;

        /* Draw full path */
        cCtx.beginPath();
        cCtx.moveTo(full[0].x, full[0].y);
        for (let i = 1; i < full.length; i++) {
            cCtx.lineTo(full[i].x, full[i].y);
        }

        /* Dim when scattering */
        const a = scattering ? t.alpha * 0.3 : t.alpha;

        cCtx.strokeStyle = `rgba(255,215,0,${a * 0.6})`;
        cCtx.lineWidth   = t.width;
        cCtx.shadowColor = 'rgba(255,215,0,0.4)';
        cCtx.shadowBlur  = 4;
        cCtx.stroke();

        /* Bright travelling tip */
        const tip = full[full.length - 1];
        cCtx.beginPath();
        cCtx.arc(tip.x, tip.y, t.width + 1, 0, Math.PI * 2);
        cCtx.fillStyle   = `rgba(255,215,0,${a})`;
        cCtx.shadowColor = '#FFD700';
        cCtx.shadowBlur  = 8;
        cCtx.fill();
        cCtx.shadowBlur  = 0;

        /* Small junction dots at corners */
        for (let i = 1; i < t.points.length; i++) {
            cCtx.beginPath();
            cCtx.arc(t.points[i].x, t.points[i].y, 2, 0, Math.PI * 2);
            cCtx.fillStyle = `rgba(255,215,0,${a * 0.7})`;
            cCtx.fill();
        }
    }

    if (!reducedMotion) drawCircuit();

    /* ================================================
       TYPING ENGINE (unchanged)
    ================================================ */
    const typingEl = document.getElementById('introTyping');

    function typeText(text, speed, done) {
        if (!typingEl) { if (done) done(); return; }
        let i = 0;
        typingEl.textContent = '';
        function tick() {
            if (i < text.length) {
                typingEl.textContent += text[i++];
                setTimeout(tick, speed);
            } else {
                if (done) done();
            }
        }
        tick();
    }

    function eraseText(speed, done) {
        if (!typingEl) { if (done) done(); return; }
        function tick() {
            if (typingEl.textContent.length > 0) {
                typingEl.textContent = typingEl.textContent.slice(0, -1);
                setTimeout(tick, speed);
            } else {
                if (done) done();
            }
        }
        tick();
    }

    /* ================================================
       PROGRESS BAR (unchanged)
    ================================================ */
    const fillEl    = document.getElementById('introFill');
    const percentEl = document.getElementById('introPercent');

    function animateProgress(from, to, duration, done) {
        const start = performance.now();
        const range = to - from;
        function step(now) {
            const t      = Math.min((now - start) / duration, 1);
            const eased  = 1 - Math.pow(1 - t, 3);
            const val    = Math.round(from + range * eased);
            if (fillEl)    fillEl.style.width   = val + '%';
            if (percentEl) percentEl.textContent = val + '%';
            if (t < 1) requestAnimationFrame(step);
            else if (done) done();
        }
        requestAnimationFrame(step);
    }

    /* ================================================
       EXIT SEQUENCE (unchanged)
    ================================================ */
    function exitIntro() {
        document.removeEventListener('keydown',     trySkip);
        document.removeEventListener('pointerdown', trySkip);

        const screen = document.getElementById('introScreen');
        if (!screen) return;

        scattering = true;

        setTimeout(() => {
            screen.classList.add('exit');
            screen.addEventListener('transitionend', () => {
                cancelAnimationFrame(pFrame);
                cancelAnimationFrame(cFrame);
                screen.classList.add('gone');
                document.body.classList.add('loaded');
                window.dispatchEvent(new Event('introComplete'));
            }, { once: true });
        }, 150);
    }

    /* ================================================
       MAIN SEQUENCE
       Circuit runs for ~1.4s first, then content appears
    ================================================ */
    function runSequence() {
        const tagline = document.getElementById('introTagline');

        /* Wait for circuit to build + node to appear (~1.5s) before typing */
        const textDelay = reducedMotion ? 0 : 1500;

        /* Progress starts immediately */
        animateProgress(0, 40, 1400, null);

        setTimeout(() => {

            /* Phase 1 — type first phrase */
            animateProgress(40, 65, 1200, null);

            typeText('Building Intelligent Solutions', 52, () => {

                setTimeout(() => {
                    animateProgress(65, 82, 700, null);

                    eraseText(26, () => {

                        typeText('Software Engineer  •  AI/ML Enthusiast', 40, () => {

                            /* Tagline */
                            if (tagline) tagline.classList.add('visible');

                            /* Final progress */
                            animateProgress(82, 100, 600, () => {

                                setTimeout(exitIntro, 520);
                            });
                        });
                    });
                }, 600);
            });

        }, textDelay);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', runSequence);
    } else {
        runSequence();
    }

}());
