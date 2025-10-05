# Ch.5 JavaScript
## พื้นฐาน
### Print and String Literals
การ print ข้อความ ใช้ `console.log()`
```javascript
console.log("Hello, World");
```
สำหรับการเชื่อมข้อความกับตัวแปร สามารถทำได้ 2 แบบ
```javascript
// แบบที่ 1 เหมือน Java
let world = "World"
let helloWorld = "Hello, " + world
// แบบที่ 2 Template Literals
let lorem = "Lorem"
let loremIpsum = `${lorem} Ipsum`
```
### การประกาศตัวแปร
- `const` คือ การประกาศตัวแปรแบบค่าคงที่ กำหนดค่าซ้ำไม่ได้
- `let` คือ การประกาศตัวแปรทั่วไป เปลี่ยนค่าซ้ำได้

### การประกาศ function
1. การประกาศฟังก์ชันมีชื่อ
    ```javascript
    function fname(param){
        // code goes here
    }
    // เรียกใช้ฟังก์ชัน
    fname(param)
    ```
2. การประกาศฟังก์ชันไร้ชื่อ
    ```javascript
    // แบบที่ 1
    window.addEventListener(function (param) {
        // code goes here
    })
    // แบบที่ 2 (Arrow function)
    window.addEventListener((param) => {
        // code goes here
    })
    ```
### เงื่อนไข
`if`, `else`, `else if`, Ternary Expression เหมือนกับ Java
```javascript
if(condition){
    // code when condition is true
}else if(condition2){
    // code when condition2 is true
}else{
    // code when neither of the conditions are true
}
let bool = condition3 ? true : false
```
### Loop
ตอนนี้ loop ที่ใช้ส่วนใหญ่จะเป็น foreach loop คือวนซ้ำการทำงานตามจำนวนสมาชิกที่มีใน Array
```javascript
let arr = ["a", "b", "c", "d"]
arr.forEach((elem, i) => {
    // elem (parameter ตัวที่ 1) คือ ตัวแปรเก็บค่าสมาชิกสำหรับการวนทำงานรอบนี้
    // i (parameter ตัวที่ 2) คือ ตำแหน่งของสมาชิกตัวนั้น
    // เช่น loop รอบแรก elem = "a", i = 0
    // elem และ i ไม่จำเป็นต้องเขียน loop ก็สามารถทำงานได้
})
```

## DOM (Document Object Model)
คือการแสดงส่วนประกอบต่างๆของหน้าเว็บ ในรูปแบบของ tree แต่ละ HTML element ในหน้าเว็บจะถูกเรียกว่า node

โค้ด JavaScript ที่ใช้ควบคุม node ต่างๆ จะถูกใส่ไว้ใน tag \<script\> ในไฟล์ HTML
(More detail later)

### การรับค่า HTML Element
1. **querySelector** คือการเลือก HTML element **ตัวแรก**ที่ตรงตามรูปแบบของ [CSS Selector](./Ch.3.md/#css-selectors) ที่ป้อนเข้า
2. **querySelectorAll** คือการเลือก HTML element **ทุกตัว**ที่ตรงตามรูปแบบของ [CSS Selector](./Ch.3.md/#css-selectors) ที่ป้อนเข้า
3. **getElementById** คือการเลือก HTML element ตัวที่มี `id` ตรงตามค่าที่ป้อนเข้า
4. **getElementByClassName** คือการเลือก HTML element **ทุกตัว**ที่มี `class` ตรงตามค่าที่ป้อนเข้า
4. **getElementByTagName** คือการเลือก HTML element **ทุกตัว**ที่เป็นประเภทเดียวกับค่าที่ป้อนเข้า
```html
<body>
    <nav class="special-navbar"> <!-- elem1 -->
        <ul>
            <!-- elem2 and elem5 start -->
            <li id="about-me">
                <a class="link">About me</a> <!-- elem4 --> 
            </li>
            <li id="my-project">
                <a class="link">My Project</a> <!-- elem4 --> 
            </li>
            <li id="contact">
                <a class="link">Contact</a> <!-- elem4 --> 
            </li> <!-- elem3 -->
            <!-- elem2 and elem5 end -->
        </ul>
    </nav>

    <!-- Inline Script -->
    <script>
        let elem1 = document.querySelector(".special-navbar"); // เลือก element ที่มี class "special-navbar"
        let elem2 = document.querySelectorAll(".special-navbar ul li"); // เลือกทุก <li> ที่อยู่ภายใต้ <ul> และ element ที่มี class "special-navbar" ค่าที่ได้เป็น array
        let elem3 = document.getElementById("contact") // เลือก element ที่มี id = contact 
        let elem4 = document.getElementByClassName("link") // เลือก element ทุกตัวที่มี class = link ค่าที่ได้เป็น array
        let elem5 = document.getElementByTagName("li") // เลือก <li> ทุกตัว ค่าที่ได้เป็น array
    </script>
</body>
```

### การเปลี่ยน Property ต่างๆของ HTML Element
กำหนดตัวแปรที่จะใช้อธิบายให้ดังนี้
```html
<img id="imaginary" src="./roblox.png" alt="roblox slogan" title="powering imagination">
```
```javascript
let imaginaryElem = document.getElementById("imaginary")
```
1. เปลี่ยน style (Inline CSS)
    ```javascript
    console.log(imaginaryElem.style.color) // แสดงค่าสีของข้อความใน imaginaryElem
    imaginaryElem.style.color = "red"; // เปลี่ยนสีข้อความเป็นสีแดง
    imaginaryElem.style.fontSize = "40px"; // เปลี่ยนขนาดข้อความให้ใหญ่ขึ้น เป็น 40 pixels
    ```
2. เพิ่ม ลบ class
    ```javascript
    let ieClasses = imaginaryElem.classList // เรียกค่าชื่อ class ทั้งหมดของ imaginaryElem ให้ผลลัพธ์เป็น array
    imaginaryElem.classList.add("c"); // เพิ่ม class "c" เข้าไป ถ้ายังไม่มี
    imaginaryElem.classList.remove("c"); // ลบ class "c" ออก ถ้ามี
    imaginaryElem.classList.toggle("c"); 
    // ถ้ามี class "c" ลบออก
    // ถ้าไม่มี class "c" เพิ่มเข้าไป
    ```
3. การปรับค่า content ของ element <br>
สมมติให้โครงสร้าง HTML มา
    ```html
    <p id="sleepin-time">
        For some reason, I'm so
        <b><i>tired</i></b>.
        Must go to sleep now, I guess.
    </p>
    ```
    ```javascript
    let sleepingQuote = document.getElementById("sleepin-time");
    let emphasis = document.querySelector("b");
    console.log(sleepingQuote.textContent) // แสดงเฉพาะค่าข้อความใน sleepingQuote ผลลัพธ์: For some reason, I'm so tired. Must go to sleep now, I guess.
    console.log(emphasis.innerHTML) // แสดง content ทั้งหมดของ <b> ผลลัพธ์: <i>tired</i>
    console.log(emphasis.outerHTML) // แสดงทั้ง element ของ <b> ผลลัพธ์: <b><i>tired</i></b>
    emphasis.innerHTML = "<span>lively</span>"; // เปลี่ยน content ของ <b> โดยข้อความที่เป็น HTML element จะแสดงตามโค้ด HTML ด้วย จากตัวอย่างผลลัพธ์จะแสดงข้อความ lively ที่เป็นตัวหนาอย่างเดียว ไม่เอียง
    emphasis.outerHTML = "<span>lively</span>"; // เปลี่ยนทั้ง <b> โดยข้อความที่เป็น HTML element จะแสดงตามโค้ด HTML จากตัวอย่างผลลัพธ์จะแสดงข้อความ lively ธรรมดา ไม่หนา ไม่เอียง
    emphasis.textContent = "<span>lively</span>" // เปลี่ยน content ของ <b> โดยแสดงข้อความที่กำหนดไปตรงๆ ผลลัพธ์: <span>lively</span>
    ```
4. เปลี่ยนค่า attribute ต่างๆ ของ element
    ```javascript
    console.log(imaginaryElem.getAttribute("alt")) // แสดงค่าใน attribute "alt" ("roblox slogan") ออกมา
    imaginaryElem.setAttribute("src", "./robloxNmc") // เปลี่ยนค่าใน attribute "src" เป็น "./robloxNmc" จาก "./roblox"
    ```

5. Dataset <br>
    คือ ค่าที่ได้จาก attribute `data-<name>` ต่างๆ เอาไว้ใช้เก็บข้อมูลเพิ่มเติม เช่น
    ```javascript
    console.log(imaginaryElem.dataset.state) // แสดงค่าที่ได้จาก attribute "data-state"
    imaginaryElem.dataset.state = "true" // เปลี่ยนค่า attribute นั้นเป็น "true"
    console.log(imaginaryElem.dataset.index) // แสดงค่าที่ได้จาก attribute "data-index"
    ```

### การสร้าง Element
ทำได้ 3 แบบ ให้โครงสร้าง HTML ดังนี้
```html
<div id="root">
    <!-- Waiting for elements to render -->
<div>
```
```javascript
// แบบที่ 1
let p = document.createElement("p"); // สร้าง element <p>
let text = document.createTextNode("Hello World"); // สร้างข้อความ "Hello World"
p.appendChild(text) // ใส่ข้อความใน <p>
document.getElementById("root") // ใส่ <p> ใน <div> id = root'
```
1. ใช้ฟังก์ชันสร้าง element และ Text แล้วเพิ่มไปใน element แม่
2. สร้าง element แล้ว set `textContent` จึงใส่ใน element จากนั้นเพิ่มไปใน element แม่
3. กำหนด `innerHTML` ใน element แม่ ด้วยโค้ด HTML โดยตรง

### Event
คือ สิ่งที่เกิดขึ้นโดยการกระทำจาก user หรือตัว browser เอง เช่น การคลิก การกดปุ่มที่คีย์บอร์ด วิธีที่ดีที่สุดในการเพิ่ม Event คือ ใช้ฟังก์ชัน `addEventListner(ชื่อ Event, function ที่จะให้ทำงานเมื่อเกิด event นั้นขึ้น)` นี่ตัวอย่างชื่อ Event ที่ใช้บ่อยๆ
<table>
    <tr>
        <th>Event</th>
        <th>ทำงานเมื่อ</th>
    </tr>
    <tr>
        <td>click</td>
        <td>ผู้ใช้กด element นั้น</td>
    </tr>
    <tr>
        <td>mouseover</td>
        <td>ผู้ใช้เอา cursor mouse วางไว้บน element นั้น</td>
    </tr>
    <tr>
        <td>mouseout</td>
        <td>ผู้ใช้เอา cursor mouse ออกจาก element นั้น</td>
    </tr>
    <tr>
        <td>keydown</td>
        <td>ผู้ใช้กดปุ่มบนคีย์บอร์ด</td>
    </tr>
    <tr>
        <td>keyup</td>
        <td>ผู้ใช้ปล่อยปุ่มที่กดบนคีย์บอร์ด</td>
    </tr>
    <tr>
        <td>input</td>
        <td>ผู้ใช้ป้อนข้อมูลใน input</td>
    </tr>
    <tr>
        <td>submit</td>
        <td>ผู้ใช้กดส่งฟอร์ม</td>
    </tr>
</table>

หากต้องการถอน Event นั้นออก จะใช้ฟังก์ชัน `removeEventListener(ชื่อ Event, function ที่จะให้ทำงานเมื่อเกิด event นั้นขึ้น)`

```javascript
let btn = document.querySelector("button");
function btnclick(){
    console.log("Button clicked!");
}
btn.addEventListener("click", btnclick); // เพิ่มฟังก์ชันการทำงานของ btnclick ให้กับ event click
// เมื่อคลิกปุ่มแล้ว จะแสดงข้อความ "Button clicked!"
btn.removeEventListener("click", btnclick); // ลบฟังก์ชันการทำงานของ btnclick ออกจาก event click
// เมื่อคลิกปุ่มแล้ว จะไม่มีอะไรเกิดขึ้น
```

ในการเขียนโค้ดขั้นสูงขึ้น เราจะได้ทำงานกับ **Event Object**
```javascript
btn.addEventListener("keydown", (e) => {
    //e = Event Object
})
```
ซึ่งโดยพื้นฐานแล้ว Event Object จะมี property ต่างๆดังนี้
- `e.type`: ชื่อ/ประเภท event
- `e.timeStamp`: เวลาที่ event ถูกสร้างขึ้น
- `e.currentTarget`: HTML element ที่ event ถูกเพิ่มเข้าไป (จากตัวอย่างคือ \<button\>)
- `e.target`: HTML element ที่ทำให้เกิด event ขึ้น (เช่น ในปุ่มมี \<p\> 3 ตัว คลิกที่ \<p\> ตัวที่ 3 `e.target` จะเป็น \<p\> ตัวที่ 3)

สำหรับ property อื่นๆ จะขึ้นอยู่กับประเภทของ event ที่เพิ่มเข้าไป เช่น
1. `mousedown`: `event.button` คือค่าของปุ่มบนเมาส์ที่กดลงไป `0` = คลิกซ้าย, `1` = คลิกปุ่มลูกกลิ้งตรงกลาง, `2` = คลิกขวา
2. `keydown`: `event.key` คือชื่อปุ่มบนคีย์บอร์ดที่กดลงไป

ฟังก์ชันพื้นฐานของ event จะมีอยู่ 2 ตัวคือ
1. `event.preventDefault()` จะป้องกันไม่ให้ฟังก์ชันการทำงานที่เป็น default ของ HTML Element นั้นทำงาน เช่น คลิกลิงก์ (\<a\>) ที่มี `event.preventDefault()` จะไม่พาไปในหน้าเว็บอื่น
2. `event.stopPropagation()` ในกรณีที่ parent element กับ child element มี event ประเภทเดียวกัน เช่น click ติดอยู่ เมื่อ trigger ให้ event ของ child element ทำงานแล้ว event ของ parent element จะทำงานด้วย เช่น
```html
<div>
    <button>Click</button>
</div>
<script>
    document.querySelector("div").addEventListener(() => alert("parent element clicked"))
    document.querySelector("button").addEventListener(() => alert("child element clicked"))
    // alert(text) คือการแจ้งเตือนผู้ใช้ด้วยข้อความบนหน้าเว็บ
</script>
```
เมื่อกดปุ่ม \<button\> จะมี alert ขึ้น 2 ครั้ง คือ "child element clicked" กับ "parent element clicked" เพราะทั้งการกด \<button\> ที่อยู่ใน \<div\> ก็เหมือนกด \<div\> ไปด้วย แต่จริงๆแล้วเราอยากให้ขึ้นแค่ครั้งเดียวของ \<button\> ดังนั้นเราจึงจะใช้ `event.stopPropagation()` ในการตัดการเชื่อมต่อระหว่าง \<button\> กับ \<div\>
```javascript
document.querySelector("div").addEventListener(() => alert("parent element clicked"))
document.querySelector("button").addEventListener((e) => {
    e.stopPropagation()
    alert("child element clicked")
})
```
คราวนี้ เมื่อกดปุ่มก็จะขึ้น alert ของปุ่มแค่เพียงครั้งเดียว

## เพิ่มเติม
### HTML Attributes
- ARIA (Accessible Rich Internet Applications) ช่วยในเรื่องของ Accessibility และใช้เพื่อให้ง่ายต่อ Developer คนอื่นๆในการพัฒนาเว็บต่อ
    ```html
    <div class="accordian" aria-expanded="true"> <!-- บอกว่าอันนี้กำลังเปิดขยายลงมา แสดง item ต่างๆ -->
    <div class="modal" aria-modal="true" role="dialog"> <!-- บอกว่านี่คือ Modal -->
    ```
- Dataset ดูข้อ 5 ใน [DOM Property](./Ch.5.md/#การเปลี่ยน-property-ต่างๆของ-html-element)
- `tabindex` เป็นตัวกำหนดว่า ถ้ากด Tab แล้ว element นั้นจะ focus ไหม `0` คือให้ focus `-1` คือไม่ให้ focus สามารถกำหนดเป็นค่าอื่นๆสำหรับทำ custom ได้ แต่ไม่ควรเพราะจะทำให้คนอื่นสับสนได้
### CSS Properties
- `transform: translateX()` คือการเลื่อน element ไปทางซ้าย(ค่าลบ)/ขวา(ค่าบวก)
- `transition: <property> <duration> <timing-function>` คือการทำให้การเปลี่ยนค่า property ที่กำหนดค่อยๆเปลี่ยนไปอย่าง smooth
    - `<property>`: property ที่กำหนดให้มี transition
    - `<duration>`: ระยะเวลา ควรใช้ประมาณ 150-300ms
    - `<timing-function>`: ใช้ `ease` หรือ `ease-in-out`
### Javascript
```javascript
new Audio("click.mp3").play(); // โหลดและเล่นเสียง
new Audio("click.mp3").pause(); // หยุดเล่นเสียง
```