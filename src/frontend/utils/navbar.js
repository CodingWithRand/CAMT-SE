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