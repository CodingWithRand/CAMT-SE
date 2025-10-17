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

const menu = document.getElementById('menu');
const menuItems = [
    {
        name: "Espresso",
        id: "00100121",
        description: "Rich and bold espresso shot.",
        price: 3,
        imgSrc: "./imgs/espresso.png"
    },
    {
        name: "Latte",
        id: "00100122",
        description: "Rich in coffee, cream and milk.",
        price: 3,
        imgSrc: "./imgs/latte.jpg"
    },
    {
        name: "Hot Chocolate",
        id: "00100123",
        description: "Good for kids",
        price: 3,
        imgSrc: "./imgs/hot-choco.jpg"
    },
    {
        name: "Mocha",
        id: "00100124",
        description: "Blend of espresso and chocolate.",
        price: 3,
        imgSrc: "./imgs/Mocha.jpg"
    },
    {
        name: "Cappuccino",
        id: "00100125",
        description: "Rich espresso with steamed milk.",
        price: 3,
        imgSrc: "./imgs/cappuccino.jpeg"
    },
    {
        name: "Americano",
        id: "00100126",
        description: "Black coffee with a hint of espresso.",
        price: 3,
        imgSrc: "./imgs/americano.jpg"
    },
]

for(let menuSet = 0; menuSet < Math.floor(menuItems.length / 3); menuSet++){
    const menuPage = document.createElement('div');
    menuPage.classList.add('page');
    if(menuSet === 0) menuPage.classList.add('focus');
    else menuPage.classList.add('unfocus');

    if(menuSet !== 1 && menuSet === Math.floor(menuItems.length / 3) - 1) menuPage.style.display = "none";
    menuPage.innerHTML = `
        <div class="title font-comforter-brush">Menu</div>
        <div class="menu-list"></div>
    `;

    menu.appendChild(menuPage);
}

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

            if(menuPages.length > 2) setTimeout(() => page.style.display = 'none', 500);
        }
        //previous page
        else if(!page.classList.contains('focus') && page.classList.contains('unfocus')){
            if(i === menuPages.length - 1){
                page.previousElementSibling.classList.remove('focus')
                page.previousElementSibling.classList.add('unfocus')
                setTimeout(() => {
                    menuPages[0].style.display = 'flex'
                    if(menuPages.length > 2) page.previousElementSibling.style.display = 'none'
                }, 500);
            }else if(i === 0){
                menuPages[menuPages.length - 1].classList.remove('focus');
                menuPages[menuPages.length - 1].classList.add('unfocus');
                setTimeout(() => {
                    page.nextElementSibling.style.display = 'flex';
                    if(menuPages.length > 2) menuPages[menuPages.length - 1].style.display = 'none';
                }, 500);
            }else{
                page.previousElementSibling?.classList.remove('focus');
                page.previousElementSibling?.classList.add('unfocus');
                setTimeout(() => {
                    page.nextElementSibling.style.display = 'flex';
                    if(menuPages.length > 2) page.previousElementSibling.style.display = 'none';
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

function updateMenuLayout() {

    // Adding Menu Items

    let set = 1;
    menuLists.forEach(list => {
        if(window.innerWidth >= 1024 || window.innerWidth <= 640){
            let itemsInHTML = '';
            list.style.gridTemplateColumns = "100%";
            for(let i = 3*(set-1); i<3*set; i++){
                if(i >= menuItems.length) break;
                itemsInHTML += `
                    <div class="item" data-item-name="${menuItems[i].name}">
                        <div>
                            <img class="item-img" src="${menuItems[i].imgSrc}" alt="${menuItems[i].name}" />
                            <div class="item-data">
                                <div>
                                    <div class="item-name font-balsamiq-sans">${menuItems[i].name}</div>
                                    <div class="description font-caveat">${menuItems[i].description}</div>
                                </div>
                                <div class="price font-balsamiq-sans">$${menuItems[i].price.toFixed(2)}</div>
                            </div>
                        </div>
                        <div class="order-actions">
                            <button class="add font-balsamiq-sans">+</button>
                            <button class="remove font-balsamiq-sans">&#8211;</button>
                            <span class="added-quantity font-balsamiq-sans" ${
                                (() => {
                                    let order = JSON.parse(localStorage.getItem("Order"));
                                    if(!order) return "";
                                    if(!order[menuItems[i].name]) return "";
                                    else return `data-count="${order[menuItems[i].name].count}"`
                                })()
                            }></span>
                        </div>
                    </div>
                `  
            }
            list.innerHTML = itemsInHTML;
        }
        else if(window.innerWidth < 1024){
            let itemsInHTML = '';
            list.style.gridTemplateColumns = 'repeat(2, calc(50% - 0.5rem))'
            for(let i = 6*(set-1); i<6*set; i++){
                if(i >= menuItems.length) break;
                itemsInHTML += `
                    <div class="item" data-item-name="${menuItems[i].name}">
                        <div>
                            <img class="item-img" src="${menuItems[i].imgSrc}" alt="${menuItems[i].name}" />
                            <div class="item-data">
                                <div>
                                    <div class="item-name font-balsamiq-sans">${menuItems[i].name}</div>
                                    <div class="description font-caveat">${menuItems[i].description}</div>
                                </div>
                                <div class="price font-balsamiq-sans">$${menuItems[i].price.toFixed(2)}</div>
                            </div>
                        </div>
                        <div class="order-actions">
                            <button class="add font-balsamiq-sans">+</button>
                            <button class="remove font-balsamiq-sans">&#8211;</button>
                            <span class="added-quantity font-balsamiq-sans" ${
                                (() => {
                                    let order = JSON.parse(localStorage.getItem("Order"));
                                    if(!order) return "";
                                    if(!order[menuItems[i].name]) return "";
                                    else return `data-count="${order[menuItems[i].name].count}"`
                                })()
                            }></span>
                        </div>
                    </div>
                ` 
            }
            list.innerHTML = itemsInHTML;
        }
        set++;
    });

    // Adding Menu Items Add & Remove Buttons Functionality

    const menuItemElements = document.querySelectorAll(".menu-list .item");
    menuItemElements.forEach((mie) => {
        const addBtn = mie.querySelector(".order-actions .add");
        const removeBtn = mie.querySelector(".order-actions .remove");
        const quantity = mie.querySelector(".order-actions .added-quantity");

        addBtn.onclick = () => {
            if(quantity.dataset.count === undefined) quantity.dataset.count = 0;
            quantity.dataset.count = parseInt(quantity.dataset.count) + 1;
            if(!localStorage.getItem("Order")) localStorage.setItem("Order", JSON.stringify({}));
            let order = JSON.parse(localStorage.getItem("Order"));
            if(!order[mie.dataset.itemName]){
                order[mie.dataset.itemName] = {};
                order[mie.dataset.itemName]["metadata"] = menuItems.find(item => item.name === mie.dataset.itemName);
            }
            order[mie.dataset.itemName]["count"] = quantity.dataset.count;
            localStorage.setItem("Order", JSON.stringify(order));
        };
        removeBtn.onclick = () => {
            if(quantity.dataset.count === undefined) quantity.dataset.count = 0;
            let order = JSON.parse(localStorage.getItem("Order"));
            if(parseInt(quantity.dataset.count) - 1 <= 0){
                quantity.removeAttribute('data-count');
                delete order[mie.dataset.itemName];
            } else {
                quantity.dataset.count = parseInt(quantity.dataset.count) - 1;
                order[mie.dataset.itemName]["count"] = quantity.dataset.count;
            }
            localStorage.setItem("Order", JSON.stringify(order));
        };
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

// Reserve & Order
const rnoBtns = document.querySelectorAll("#reserve-btns .btn");

rnoBtns.forEach((rooBtn) => {
    rooBtn.addEventListener('click', () => {
        if(rooBtn.dataset.targetModal === "pickup-info"){
            if(!localStorage.getItem("Order") || localStorage.getItem("Order") === "{}"){
                alert("You have not added anything to the order yet.");
                return;
            }
        }
        document.getElementById(rooBtn.dataset.targetModal).showModal();
    })
})

const modalCloseBtns = document.querySelectorAll("dialog.modal .modal-close-btn");
modalCloseBtns.forEach((mcb) => {
    mcb.addEventListener('click', () => mcb.parentElement.parentElement.close());
})

// Pickup Info Modal
const pickupInfoModal = document.getElementById("pickup-info")
let subtotal = 0;
let total = 0;

pickupInfoModal.querySelector("form").addEventListener('submit', (e) => {
    e.preventDefault();

    const piForm = e.target;
    const pName = piForm.querySelector("input#name");
    const pTel = piForm.querySelector("input#tel");
    const pTime = piForm.querySelector("select#pickup-time");
    const ppayMethod = piForm.querySelector("select#payment-method");

    localStorage.setItem("Pickup Info", JSON.stringify({
        name: pName.value,
        tel: pTel.value,
        ptime: pTime.value,
        payment: ppayMethod.value
    }))

    // Creating Bill from queried info

    // Order items
    const billItemList = billModal.querySelector("table.bill-item-list tbody");
    const finalizedOrderData = Object.values(JSON.parse(localStorage.getItem("Order")));
    let showingBillItemList = "";
    finalizedOrderData.forEach((item) => {
        showingBillItemList += `
            <tr class="font-caveat">
                <td>${item.metadata.name}</td>
                <td>${item.metadata.id}</td>
                <td>$${item.metadata.price.toFixed(2)}</td>
                <td>${item.count}</td>
            </tr>
        `
    })
    billItemList.innerHTML = showingBillItemList

    // Bill Summary
    const billSummary = billModal.querySelector(".bill-summary")
    const pd = billSummary.querySelector(".pickup tbody");
    const s = billSummary.querySelector(".summary tbody");

    // Pickup Info
    const fpd = Object.values(JSON.parse(localStorage.getItem("Pickup Info")));
    function pickupInfo(i) {
        switch(i) {
            case 1:
                pd.querySelector(`tr:nth-of-type(${i}) td:nth-of-type(2)`).textContent = fpd[0];
                break;
            case 2:
                pd.querySelector(`tr:nth-of-type(${i}) td:nth-of-type(2)`).textContent = `${fpd[i] > 60 ? "Over 1 hour" : `In ~${fpd[2]} minutes`}`;
                break;
            case 3:
                switch(fpd[i]) {
                    case "mobile-banking":
                        pd.querySelector(`tr:nth-of-type(${i}) td:nth-of-type(2)`).textContent = "Mobile Banking";
                        break;
                    case "cash":
                        pd.querySelector(`tr:nth-of-type(${i}) td:nth-of-type(2)`).textContent = "Cash (At the counter)";
                        break;
                }
                break;
        }
    }
    for(let i = 1; i <= pd.childElementCount; i++) pickupInfo(i);

    // Real Summary
    subtotal = 0;
    function summary(i) {
        switch(i) {
            case 1:
                for(const oi of finalizedOrderData) subtotal += oi.metadata.price * oi.count;
                s.querySelector(`tr:nth-of-type(${i}) td:nth-of-type(2)`).textContent = `$${subtotal.toFixed(2)}`;
                break;
            case 2:
                // Thailand taxes rate
                s.querySelector(`tr:nth-of-type(${i}) td:nth-of-type(2)`).textContent = `$${(subtotal*0.07).toFixed(2)}`;
                break;
            case 4:
                s.querySelector(`tr:nth-of-type(${i}) td:nth-of-type(2)`).textContent = `$${(subtotal*0.07 + subtotal).toFixed(2)}`;
                break;
        }
    }
    for(let i = 1; i <= s.childElementCount; i++) summary(i);

    billModal.showModal();
    pickupInfoModal.close();
})

pickupInfoModal.querySelector("form .form-item.type-1 input[type='tel']").addEventListener('input', (e) => {
    // Stick with the Thai mobile phone number pattern
    if(e.target.value.length === 1 && e.target.value !== "0") e.target.value = ""
    if(e.target.value.match(/([^\d])/g)) e.target.value = e.target.value.replace(/([^\d])/g, '');
});

// Bill Modal
const billModal = document.getElementById("bill-modal")

function showSuccessAndClose(modal){
    modal.querySelector("span.success").style.display = "flex";
    setTimeout(() => {
        modal.querySelector("span.success").style.display = "none";
        modal.close();
    }, 3000);
}

billModal.querySelector("#tip-amount").addEventListener('input', (e) => {
    if(e.target.value.match(/([^\d.])/g)){
        e.target.value = e.target.value.replace(/([^\d.])/g, '');
        return;
    }
    billModal.querySelector(".bill-summary .summary tr:nth-of-type(4) td:nth-of-type(2)").textContent = `$${(subtotal + (subtotal * 0.07) + Number(e.target.value)).toFixed(2)}`
    total = (subtotal + (subtotal * 0.07) + Number(e.target.value)).toFixed(2)
})

billModal.querySelector(".bill-summary .order-btn button:nth-of-type(1)").addEventListener('click', () => {
    // Dealing with order submission (Later)
    if(JSON.parse(localStorage.getItem("Pickup Info")).payment === "mobile-banking") {
        document.getElementById("qr-payment").querySelector("p span").textContent = total;
        document.getElementById("qr-payment").showModal();
    }
    // Reset order data and pickup data
    subtotal = 0;
    total = 0;
    showSuccessAndClose(billModal);
    localStorage.removeItem("Order");
    localStorage.removeItem("Pickup Info");
    updateMenuLayout();
})

billModal.querySelector(".bill-summary .order-btn button:nth-of-type(2)").addEventListener('click', () => billModal.close())

// Other modals (Reserve Table, Reserve Meeting Room)
const reserveTableModal = document.getElementById("reserve-table");
const reserveMeetingRoomModal = document.getElementById("reserve-meeting-room");

reserveMeetingRoomModal.querySelector("form").addEventListener('submit', (e) => {
    e.preventDefault();
    showSuccessAndClose(reserveMeetingRoomModal);
})

reserveTableModal.querySelector("form").addEventListener('submit', (e) => {
    e.preventDefault();
    showSuccessAndClose(reserveTableModal);
})

// Dealing with data structure for backend later.