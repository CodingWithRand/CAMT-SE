// 1) Accordion 
const accButtons = document.querySelectorAll('.acc');

accButtons.forEach(btn => {
  btn.addEventListener('click', () => {
     // --- Write code to find this button's panel by aria-controls ---

    accButtons.forEach(btn => {
      const panel = document.getElementById(btn.getAttribute('aria-controls'));
      panel.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      panel.hidden = true
      panel.style.maxHeight = 0
    })

    const panel = document.getElementById(btn.getAttribute('aria-controls'));
    
    // Write code to check if this one is currently open?
    if(btn.getAttribute('aria-expanded') === 'false'){
      btn.setAttribute('aria-expanded', 'true');
      panel.hidden = false
      panel.style.maxHeight = panel.scrollHeight + 'px'
    }else{
      btn.setAttribute('aria-expanded', 'false');
      panel.hidden = true
      panel.style.maxHeight = 0
    }

   // --- Write toggle the clicked one ---
    panel.classList.toggle('open');


  });
});

// 2) Modal (ESC + backdrop + basic focus trap)
const openModalBtn = document.getElementById('openModalBtn');
const modalOverlay = document.getElementById('modalOverlay');
const closeModalBtn = document.getElementById('closeModalBtn');
const dialog = modalOverlay.querySelector('.dialog');
let lastFocus = null;

function getFocusable(container){
  return Array.from(container.querySelectorAll('a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'))
    .filter(el => !el.hasAttribute('disabled'));
}
function openModal(){
  lastFocus = document.activeElement;
  modalOverlay.classList.add('open');
  modalOverlay.setAttribute('aria-hidden','false');
  dialog.focus();
  document.addEventListener('keydown', onDialogKeydown);
}
function closeModal(){
  modalOverlay.classList.remove('open');
  modalOverlay.setAttribute('aria-hidden','true');
  document.removeEventListener('keydown', onDialogKeydown);
  if (lastFocus) lastFocus.focus();
}
function onDialogKeydown(e){
  // write code to close modal on ESC key
  if(e.key === "Escape"){
    closeModal()
    return
  }

  if (e.key === 'Tab'){
    const nodes = getFocusable(dialog);
    if (!nodes.length) return;
    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    if (e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
  }
}
// --- Write code to add event listeners for open/close buttons and backdrop ---
openModalBtn.addEventListener('click', openModal);
closeModalBtn.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', closeModal);
dialog.addEventListener('click', e => e.stopPropagation());

// 3) Image slider (prev/next)
const track = document.querySelector('.track');
const slides = document.querySelectorAll('.track img');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
let i = 0;

// write function go(n) code to move the track left/right by updating transform: translateX(...) style
function go(n){
  i = (n+slides.length)%slides.length
  document.querySelector(".track").style.transform = `translateX(${-i*800}px)`; // 100% doesn't move the image fully
  document.querySelector(".track").style.transition = "transform 400ms ease-in-out"
}

// write event listener code for prevBtn and nextBtn
prevBtn.addEventListener('click', () => go(i-1));
nextBtn.addEventListener('click', () => go(i+1));

// 4) Theme toggle (micro‑interaction)
const themeBtn = document.getElementById('themeToggleBtn');
let dark = false;
// write code to toggle dark mode with a smooth transition

themeBtn.addEventListener('click', () => {
  document.documentElement.classList.toggle('dark');
  dark = !dark
})

// });