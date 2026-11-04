/* Forlink – small vanilla JavaScript used by every page. */
(function () {
    'use strict';

    document.documentElement.classList.remove('js-off');

    /* Public navigation (mobile) */
    var navToggle = document.querySelector('[data-nav-toggle]');
    if (navToggle) {
        var nav = document.querySelector('.site-nav') || document.querySelector('.app-nav');
        navToggle.addEventListener('click', function () {
            var open = nav.classList.toggle('open');
            navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    /* Mark the current page in the public navigation */
    var page = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
    document.querySelectorAll('.site-nav a[data-page]').forEach(function (a) {
        if (a.getAttribute('data-page') === page) { a.classList.add('active'); a.setAttribute('aria-current', 'page'); }
    });

    /* Scroll-triggered reveal */
    var revealEls = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window && revealEls.length) {
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (en) {
                if (en.isIntersecting) { en.target.classList.add('visible'); io.unobserve(en.target); }
            });
        }, { threshold: 0.12 });
        revealEls.forEach(function (el) { io.observe(el); });
    } else {
        revealEls.forEach(function (el) { el.classList.add('visible'); });
    }

    /* Show / hide password */
    document.querySelectorAll('[data-toggle-password]').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var input = btn.parentElement.querySelector('input');
            var show = input.type === 'password';
            input.type = show ? 'text' : 'password';
            btn.textContent = show ? 'Hide' : 'Show';
            btn.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
        });
    });

    /* Profile dropdown */
    document.querySelectorAll('[data-dropdown]').forEach(function (dd) {
        var btn = dd.querySelector('button.profile-btn');
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            var open = dd.classList.toggle('open');
            btn.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
        document.addEventListener('click', function (e) { if (!dd.contains(e.target)) { dd.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); } });
        document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { dd.classList.remove('open'); } });
    });

    /* Admin sidebar (mobile) */
    var sidebar = document.getElementById('sidebar');
    var scrim = document.querySelector('.side-scrim');
    document.querySelectorAll('[data-sidebar-toggle]').forEach(function (btn) {
        btn.addEventListener('click', function () {
            if (!sidebar) { return; }
            var open = sidebar.classList.toggle('open');
            if (scrim) { scrim.classList.toggle('open', open); }
        });
    });

    /* Confirm before destructive actions */
    document.querySelectorAll('[data-confirm]').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            if (!window.confirm(btn.getAttribute('data-confirm'))) { e.preventDefault(); }
        });
    });

    /* Footer year */
    document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

    /* Contact form: posts to actions.php, which stores the message in the database */
    var form = document.getElementById('contact-form');
    if (form) {
        var status = document.getElementById('contact-status');
        var tokenField = form.querySelector('input[name="csrf"]');
        var ready = fetch('actions.php?a=token', { credentials: 'same-origin' })
            .then(function (r) { return r.json(); })
            .then(function (j) { tokenField.value = j.token; })
            .catch(function () { /* handled on submit */ });

        form.addEventListener('submit', function (e) {
            e.preventDefault();
            var btn = form.querySelector('button[type="submit"]');
            status.className = 'flash';
            status.textContent = '';
            btn.disabled = true;
            ready.then(function () {
                if (!tokenField.value) { throw new Error('Could not reach the server. Make sure the site is running through PHP (see README).'); }
                return fetch('actions.php', { method: 'POST', body: new FormData(form), credentials: 'same-origin' });
            }).then(function (r) { return r.json(); }).then(function (j) {
                status.className = 'flash ' + (j.ok ? 'flash-success' : 'flash-error');
                status.textContent = j.message;
                if (j.ok) { form.reset(); fetch('actions.php?a=token', { credentials: 'same-origin' }).then(function (r) { return r.json(); }).then(function (t) { tokenField.value = t.token; }); }
            }).catch(function (err) {
                status.className = 'flash flash-error';
                status.textContent = err.message || 'Something went wrong. Please try again.';
            }).then(function () { btn.disabled = false; status.focus && status.focus(); });
        });
    }
})();
