// Typing hero header text animation

const typingText = document.getElementById('typing-text');
const textToType = [
    "Cozy workplace...",
    "Comfortable chairs...",
    "Spacious desks...",
    "Quiet environment...",
    "Productive atmosphere..."
];

const wait = async (ms) => new Promise(resolve => setTimeout(() => resolve(), ms));

async function typing() {
    typingText.textContent = '';
    
    while(true) {
        for(const text of textToType) {
            for(const char of text) {
                await wait(100);
                typingText.textContent = typingText.textContent + char;
            }
            await wait(5000);
            for(let i = text.length; i >= 0; i--) {
                await wait(50);
                typingText.textContent = text.substring(0, i);
            }
        }
    }
}

typing();

// Menu page navigation (paper)

const menuPages = document.querySelectorAll('#menu .page');
menuPages.forEach((page, i) => {
    if(i > 1) page.style.display = 'none';
    page.addEventListener('click', () => {
        // next page
        if(page.classList.contains('focus') && !page.classList.contains('unfocus')) {
            if(i === menuPages.length - 1){
                menuPages[0].classList.remove('unfocus');
                menuPages[0].classList.add('focus');
                menuPages[0].style.display = 'flex';
                setTimeout(() => menuPages[1].style.display = 'flex', 500);
            }else{
                page.nextElementSibling?.classList.remove('unfocus');
                page.nextElementSibling?.classList.add('focus');
                page.nextElementSibling.style.display = 'flex';
                if(i === menuPages.length - 2) setTimeout(() => menuPages[0].style.display = 'flex', 500);
                else setTimeout(() => page.nextElementSibling.nextElementSibling.style.display = 'flex', 500);
            }
            page.classList.remove('focus');
            page.classList.add('unfocus');
            
            setTimeout(() => page.style.display = 'none', 500);
        }
        //previous page
        else if(!page.classList.contains('focus') && page.classList.contains('unfocus')){
            if(i === menuPages.length - 1){
                page.previousElementSibling.classList.remove('focus')
                page.previousElementSibling.classList.add('unfocus')
                setTimeout(() => {
                    menuPages[0].style.display = 'flex'
                    page.previousElementSibling.style.display = 'none'
                }, 500);
            }else if(i === 0){
                menuPages[menuPages.length - 1].classList.remove('focus');
                menuPages[menuPages.length - 1].classList.add('unfocus');
                setTimeout(() => {
                    page.nextElementSibling.style.display = 'flex';
                    menuPages[menuPages.length - 1].style.display = 'none';
                }, 500);
            }else{
                page.previousElementSibling?.classList.remove('focus');
                page.previousElementSibling?.classList.add('unfocus');
                setTimeout(() => {
                    page.nextElementSibling.style.display = 'flex';
                    page.previousElementSibling.style.display = 'none';
                }, 500);
            }
            page.style.display = "flex";
            page.classList.remove('unfocus');
            page.classList.add('focus');
        }
    });
    page.addEventListener('mouseover', () => page.style.opacity = '0.75');
    page.addEventListener('mouseout', () => page.style.opacity = '');
    page.childNodes.forEach(child => {
        child.addEventListener('click', (e) => e.stopPropagation())
        child.addEventListener('mouseover', (e) => e.stopPropagation());
    });
});

// Carousel functionality

const carouselBelt = document.querySelector('.carousel .belt > div');
const carouselItems = document.querySelectorAll('.c-img');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');

let currentIndex = 1; // Start with showing the main focus image

function updateCarousel() {
    carouselItems.forEach(item => item.classList.remove('main-focus', 'non-focus'));
    carouselItems.forEach((item, i) => {
        if (i === currentIndex) item.classList.add('main-focus');
        else item.classList.add('non-focus');
    });
}

prevBtn.addEventListener('click', () => {
    currentIndex = currentIndex - 1;
    if(currentIndex === 0);
    else if(currentIndex < 0) currentIndex = carouselBelt.childElementCount - 1;
    else currentIndex = currentIndex % carouselBelt.childElementCount;
    updateCarousel();
    carouselBelt.style.transform = `translateX(${-33.33 * (currentIndex - 1)}%)`;
})

nextBtn.addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % carouselBelt.childElementCount;
    updateCarousel();
    carouselBelt.style.transform = `translateX(${-33.33 * (currentIndex - 1)}%)`;
});

updateCarousel();

// Accordion
const questions = document.querySelectorAll('#faq .question');

questions.forEach((q, i) => {
    const accordion = q.querySelector(".accordion");
    const answer = q.querySelector(".answer");
    const arrow = accordion.querySelector("img");

    accordion.addEventListener('click', () => {
        if(JSON.parse(accordion.getAttribute("aria-expanded"))){
            arrow.style.rotate = "0deg";
            answer.classList.remove("show");
            answer.classList.add("hide");
        } else {
            arrow.style.rotate = "180deg";
            answer.classList.add("show");
            answer.classList.remove("hide");
        }
        accordion.setAttribute("aria-expanded", JSON.stringify(!JSON.parse(accordion.getAttribute("aria-expanded"))));
    })
})

// Star rating
const stars = document.querySelectorAll(".star-rating .star");
const ratingDescription = document.querySelector(".star-rating .rating-name");

stars.forEach((star, i) => {
    star.addEventListener('click', () => {
        star.querySelector("input").checked = true;
        Array.from(stars).map((s, j) => {
            if(j <= i) s.querySelector("img").src = "./imgs/star-filled.png";
            else s.querySelector("img").src = "./imgs/star-empty.png";
        })
        ratingDescription.textContent = star.dataset.ratingName;
    });
});

// Miscellaneous Responsiveness Tweaks

const faq = document.querySelector('#faq .title > div');
const menuLists = document.querySelectorAll('#menu .page .menu-list');
const menuItems = [
    {
        name: "Espresso",
        description: "Rich and bold espresso shot.",
        price: 3,
        imgSrc: "./imgs/espresso.png"
    },
    {
        name: "Espresso",
        description: "Rich and bold espresso shot.",
        price: 3,
        imgSrc: "./imgs/espresso.png"
    },
    {
        name: "Espresso",
        description: "Rich and bold espresso shot.",
        price: 3,
        imgSrc: "./imgs/espresso.png"
    },
    {
        name: "Espresso",
        description: "Rich and bold espresso shot.",
        price: 3,
        imgSrc: "./imgs/espresso.png"
    },
    {
        name: "Espresso",
        description: "Rich and bold espresso shot.",
        price: 3,
        imgSrc: "./imgs/espresso.png"
    },
    {
        name: "Espresso",
        description: "Rich and bold espresso shot.",
        price: 3,
        imgSrc: "./imgs/espresso.png"
    },
]

function updateMenuLayout() {
    menuLists.forEach(list => {
        if(window.innerWidth >= 1024 || window.innerWidth <= 640){
            let itemsInHTML = '';
            list.style.gridTemplateColumns = "100%";
            menuItems.forEach((item, i) => {
                if(i >= 3) return;
                itemsInHTML += `
                    <div class="item">
                        <div>
                            <img class="item-img" src="${item.imgSrc}" alt="${item.name}" />
                            <div class="item-data">
                                <div>
                                    <div class="item-name font-balsamiq-sans">${item.name}</div>
                                    <div class="description font-caveat">${item.description}</div>
                                </div>
                                <div class="price font-balsamiq-sans">$${item.price.toFixed(2)}</div>
                            </div>
                        </div>
                        <div class="order-actions">
                            <button class="add font-balsamiq-sans">+</button>
                            <button class="remove font-balsamiq-sans">x</button>
                            <span class="added-quantity font-balsamiq-sans"></span>
                        </div>
                    </div>
                `
            });
            list.innerHTML = itemsInHTML;
        }
        else if(window.innerWidth < 1024){
            let itemsInHTML = '';
            list.style.gridTemplateColumns = 'repeat(2, calc(50% - 0.5rem))'
            menuItems.forEach((item, i) => {
                if(i >= 6) return;
                itemsInHTML += `
                    <div class="item">
                        <div>
                            <img class="item-img" src="${item.imgSrc}" alt="${item.name}" />
                            <div class="item-data">
                                <div>
                                    <div class="item-name font-balsamiq-sans">${item.name}</div>
                                    <div class="description font-caveat">${item.description}</div>
                                </div>
                                <div class="price font-balsamiq-sans">$${item.price.toFixed(2)}</div>
                            </div>
                        </div>
                        <div class="order-actions">
                            <button class="add font-balsamiq-sans">+</button>
                            <button class="remove font-balsamiq-sans">x</button>
                            <span class="added-quantity font-balsamiq-sans"></span>
                        </div>
                    </div>
                `
            });
            list.innerHTML = itemsInHTML;
        }
    });
}

window.addEventListener('resize', () => {
    if(window.innerWidth <= 768) faq.innerHTML = `
        F<span>requently</span> A<span>sked</span> Q<span>uestions</span>
    `;
    else faq.textContent = "Frequently Asked Questions";
    updateMenuLayout();
});

if(window.innerWidth <= 768) faq.innerHTML = `
    F<span>requently</span> A<span>sked</span> Q<span>uestions</span>
`;
updateMenuLayout();
