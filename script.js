const menu = document.getElementById('menu');
const nav = document.getElementById('nav');
menu.addEventListener('click', () => nav.classList.toggle('open'));
document.querySelectorAll('#nav a').forEach(a => a.addEventListener('click', () => nav.classList.remove('open')));

// Add your real profile links before publishing.
const LINKEDIN_URL = ''; // e.g. https://www.linkedin.com/in/your-profile/
const EMAIL = '';         // e.g. you@example.com
const linkedin = document.getElementById('linkedin');
const email = document.getElementById('email');
if (LINKEDIN_URL) linkedin.href = LINKEDIN_URL;
else linkedin.addEventListener('click', e => { e.preventDefault(); alert('Add your LinkedIn URL in script.js first.'); });
if (EMAIL) email.href = `mailto:${EMAIL}`;
else email.addEventListener('click', e => { e.preventDefault(); alert('Add your email address in script.js first.'); });
