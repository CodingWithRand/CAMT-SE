const nav = document.querySelector('nav');
const branding = document.querySelector('#branding');

branding.addEventListener('mouseover',  (e) => {
    e.stopPropagation();
    if(window.innerWidth < 768) nav.classList.add('show');
})

branding.addEventListener('touchstart', (e) => {
    e.stopPropagation();
    if(window.innerWidth >= 768) return
    if(!nav.classList.contains('show')) nav.classList.add('show');
    else nav.classList.remove('show');
})

nav.addEventListener('mouseover',  (e) => {
    e.stopPropagation();
    if(window.innerWidth < 768) nav.classList.add('show');
})

nav.addEventListener('touchstart', (e) => e.stopPropagation())

document.addEventListener('touchstart',  () => {
    if(window.innerWidth < 768) nav.classList.remove('show');
})
document.addEventListener('mouseout',  () => {
    if(window.innerWidth < 768) nav.classList.remove('show');
})

 document.getElementById('signout')?.addEventListener('click', async () => {
    try {
        const response  = await fetch('/api/logout', { method: "POST", credentials: "include" })
        if (!response.ok) {
            const error = await response.json();
            showToast(error.error || notfmsg("errors", "logout_failed"));
            return;
        }
        localStorage.removeItem('theme');
        localStorage.removeItem('font-family');
        localStorage.removeItem('font-size');
        localStorage.removeItem('preferences_applied')
        window.location.href = '/login';
    } catch (error) {
        showToast(notfmsg("errors", "logout_failed"));
    }
});