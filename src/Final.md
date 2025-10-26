# Java summary for Final Exams

## Loops
ใช้สำหรับรันคำสั่งซ้ำๆมากกว่า 1 ครั้ง จนกว่าจะเข้าเงื่อนไขแล้วจึงหลุดออกจาก loop
### While loop
```java
    // Code before loop
    while(condition){
        // Code
    }
    // Code after loop
```
**ลำดับการทำงาน**
1. เช็คเงื่อนไข (condition) ในวงเล็บก่อนว่าเป็นจริงไหม
2. ถ้าเป็นจริง ทำคำสั่งตามโค้ดใน `{}`
3. ถ้าไม่ ทำคำสั่งตามโค้ดหลังจาก loop (นอก `{}`)

```java
    do {
        // Code
    } while(condition);
```
อีกรูปแบบหนึ่งของ while loop เรียกว่า do-while loop
**ลำดับการทำงาน**
1. ทำคำสั่งตามโค้ดใน `{}` **do** รอบนึงก่อน
2. เช็คเงื่อนไข (condition) ในวงเล็บ while ว่าเป็นจริงไหม
3. ถ้าเป็นจริง กลับไปทำคำสั่งตามโค้ดใน `{}` **do** อีกรอบ
4. ถ้าไม่ ออกจาก loop

### For loop
```java
for(initial-statement; condition; after-loop-statement){
    // Code
}

// e.g.
for(int i = 1; i<=10; i++){
    System.out.println(i);
}

// โค้ดในรูปแบบ while loop
int i = 1;
while(i<=10){
    System.out.println(i);
    i++;
}
```

**ลำดับการทำงาน**
1. ทำคำสั่ง `initial-statement` เป็นอันดับแรก (เป็นโค้ดอะไรก็ได้ แต่มักใช้เป็นโค้ดกำหนดค่าตัวแปร เช่น `int i = 1`)
2. เช็คเงื่อนไข `condition`
3. รันคำสั่งตามโค้ดใน `{}`
4. ทำคำสั่ง `after-loop-statement` (เป็นโค้ดอะไรก็ได้ แต่มักใช้เป็นโค้ดเพิ่ม/ลดค่าตัวแปร เช่น `i++`)
5. กลับไปทำข้อ 2 - 4 จนกว่าเงื่อนไขจะเช็คไม่เป็นจริงแล้วหลุดออกจาก loop

`initial-statement`, `condition`, `after-loop-statement` สามารถเว้นไว้ ไม่ใส่ได้ ไม่ได้ทำให้ code error

`initial-statement` กับ `after-loop-statement` สามารถใส่ได้มากกว่า 1 โดยเอา `,` ขั้น

```java
int i = 1;
for(; i<=10; i++){}
// initial-statement ออกไปอยู่ข้างนอกวงเล็บ for แทน

for(int i = 1, j = 10; i<j; i++, j--){}
// initial-statement กำหนดตัวแปร 2 ตัว (i, j) และ after-loop-statement เพิ่มค่า i และลดค่า j

for(;;){}
// ในวงเล็บ for ไม่ใส่อะไรเลย มีค่าเท่ากับ while(true){} (ควรใช้ while(true) แทน)
```

### Nested Loop
คือเอา loop ซ้อน loop ไปเรื่อยๆ หลายๆชั้น
```java
int count = 0;
// Loop ชั้นแรก - While Loop
while(count <= 200){
    // Loop ชั้นที่ 2 - For Loop
    for(int i = 0; i<10; i++){
        System.out.print(count*i + " ");
    }
    System.out.println();
    count++;
}
```

### Break & Continue
**Break** ใช้ทำให้โค้ดหลุดออกจาก loop 1 loop
```java
for(int n = 1; i<=100; i++) {
    System.out.println(i)
    if(n == 10){
        System.out.println("Nah, I'll stop counting.");
        break;
    }
}
// ถ้า n มีค่าเพิ่มเป็น 10 แล้วให้หลุดออกจาก loop
```

**Continue** ใช้ข้ามโค้ดไปการทำซ้ำครั้งถัดไปใน loop
```java
for(int n = 1; i<=100; i++) {
    if(n == 69){
        System.out.println("🤔");
        continue;
    }
    System.out.println(i);
}
// loop นี้จะแสดงค่าตัวเลขออกมาทุกตัวยกเว้นเลข 69 จะขึ้นเป็น "🤔" แทน
```

### Notes
#### While Loop
- **Sentinel Value** คือค่าที่รับจากผู้ใช้ เอาไปใช้ในเงื่อนไข loop เพื่อให้ loop หยุด เช่น `while(i != 0)`, `0` จะเป็น Sentinel Value เมื่อผู้ใช้ป้อนค่า 0 โค้ดจะหลุดออกจาก loop
- **‼️อย่าใช้ค่าทศนิยมในเงื่อนไข loop‼️** เพราะผลลัพธ์ของค่าทศนิยมจากโค้ดอาจไม่ตรงกับการเทียบในเงื่อนไขเลย<sup>[1](/src/Midterm/Review1.md/#2-variable)<sup>
- **‼️อย่าลืม‼️** `;` ท้าย while ใน do-while loop
#### Others
- การใส่ `;` ท้าย `for()` หรือ `while()` จะไม่ขึ้นว่า code error ตอนรัน แต่ loop จะไม่ทำงาน เรียกว่า Logic Error ที่ loop ไม่ทำงานเพราะการใส่ `;` จะถือว่าเป็น loop ไม่มี body
- While loop มักใช้กับการทำงานวนซ้ำโดยไม่รู้จำนวนรอบ ส่วน For loop มักใช้กับการทำงานวนซ้ำที่รู้จำนวนรอบ

## Methods
ใช้รวมกลุ่มคำสั่งที่ใช้ซ้ำๆ Method ที่สร้างแล้วสามารถเอามาเรียกใช้ที่ไหนก็ได้ (Method ไหนก็ได้ เช่น ใน main) ใน class เดียวกัน หรือใน class อื่นๆ

### การสร้างและเรียกใช้ method
จะมี keywords ต่างๆดังนี้
```java
public class App {
    public static <method-data-type> methodName(<param-data-type> paramName...){
        // Code
        return paramName;
    }
    public static void main(String[] args){
        methodName();
        // เรียกใช้ method
    }
}
```
1. **method-data-type** กำหนดประเภทข้อมูลที่จะได้จาก method เมื่อเรียกใช้ method เช่น `int`, `boolean`, `String`, `void` (ไม่ return ค่าใดๆ)
2. **methodName** ตั้งชื่อ Method

3. **Parameter** คือค่าที่ป้อนให้กับ method เราสามารถกำหนดให้ method รับค่ากี่ค่าก็ได้
    - **param-data-type** กำหนดประเภทค่าที่ method จะรับ
    - **paramName** ตั้งชื่อตัวแปรสำหรับค่าที่ method นั้นจะรับ เอาไว้ใช้ใน method

### Pass by value
การส่งค่าให้ method เมื่อเรียกใช้ method จะเป็นการส่งค่าจริงๆให้กับ method ไปใช้ การกำหนดค่าใหม่ให้กับค่าที่ส่งมาจะไม่กระทบกับค่าเดิมทีที่ประกาศไว้
```java
public class App {
    public static void m(int x){
        x = 2;
        System.out.println(x); // แสดงค่า x เป็น 2
    }
    public static void main(String[] args){
        int x = 1;
        m(x);
        System.out.println(x); // แสดงค่า x ยังเป็น 1
    }
}
```

### Method Overload
คือการสร้าง method ชื่อซ้ำกัน แต่การรับค่าต่างกัน และการทำงานภายในอาจต่างกัน เช่น method นี้สามารถรับค่า 2 ค่า หรือ 3 ค่าก็ได้
```java
public class App {
    public static int sum(int x, int y) {
        return x + y; // ผลรวม 2 จำนวน
    }
    public static int sum(int x, int y, int z) {
        return x + y + z; // ผลรวม 3 จำนวน
    }
    public static double sum(int x, int y, double z) {
        return (x + y)/z; // ผลรวมระหว่าง x กับ y แล้วหาร z
    }
    public static String sum(int[] arr) {
        // Method รับค่า Array
        return "Im too lazy to do array thing"
    }
}
```

**Ambiguous Invocation** คือการ Overload Method ที่คล้ายกันเกินไป เป็น `Compile Error`
```java
public class App {
    public static double max(int num1, double num2) {
        if (num1 > num2) return num1;
        else return num2;
    }
    public static double max(double num1, int num2) {
        if (num1 > num2) return num1;
        else return num2;
    }
}
```

### Variable scope
```java
public static void m() {
    int i = 0;
    while(true){
        int i = 1; // ❌ ประกาศตัวแปรซ้ำไม่ได้ เพราะประกาศไปแล้ว
        int j = 2;
        break;
    }
    System.out.println(j); // ตัวแปร j ยังไม่ถือว่าได้ประกาศ
    int j = 3; // ✅ ประกาศตัวแปร
}
```
ในการประกาศตัวแปร ตัวแปรจะสามารถใช้ได้ภายใน block(`{}`) นั้นเท่านั้น (รวมถึง block อื่นๆที่อยู่ใน block นั้น)

## Arrays
ข้อมูลประเภทหนึ่งที่สามารถใส่เก็บค่าได้หลายๆค่าใน 1 ตัวแปร (เหมือน Set)
### การสร้าง Array
```java
int[] arr = new int[5]; // Recommended
// OR
int arr[] = new int[5];

// datatype[] arrName = new datatype[arraySize]
// datatype - ประเภทข้อมูล
// arraySize - ขนาดของ Array
```
เมื่อ Array ถูกสร้างออกมาแล้ว ค่า Default ของข้อมูลแต่ละตัวใน Array จะต่างกันไปตามประเภทข้อมูลของ Array เช่น
- Array ประเภท `int` จะมีค่า default เป็น `0`
- Array ประเภท `char` จะมีค่า default เป็น `\u0000`
- Array ประเภท `boolean` จะมีค่า default เป็น `false`

การกำหนดค่าให้กับ Array ที่สร้างขึ้นใหม่สามารถทำได้ดังนี้
```java
arr[1] = 9;
// ชื่อตัวแปรArray[เลขตำแหน่ง] = ค่าที่จะกำหนด
// เลขตำแหน่งของ Array จะเริ่มจาก 0 ถีง ขนาดของ array - 1 เช่น
```

การสร้าง Array อีกแบบนึงที่กำหนดค่าให้กับสมาชิกเลยในบรรทัดเดียว (‼️ต้องเขียนภายในบรรทัดเดียวเท่านั้น‼️) ทำได้แบบนี้
```java
int[] arr = {1, 3, 4, 5};
```
Annonymous Array สร้างเอาไว้ใช้ครั้งเดียว เช่น ตอนส่งค่าให้กับ method
```java
new int[]{1, 3, 4, 5};
```

### Property และการเข้าถึงค่าของ Array
- เราจะรู้ขนาดของ Array ที่สร้างได้จาก `length` -> `array.length`
- สำหรับ `String` ที่มีความคล้ายคลึงกับ Array (เพราะ `String` ประกอบไปด้วย `char` ต่างๆ) จะใช้ `length()`
- การเข้าถึงค่าทำได้โดย `arr[indexNumber]`

### การแสดงค่าใน Array
ใช้โค้ดนี้
```java
// 1D Array
public static void show1DArrContent(int[] arr) {
    for(int i = 0; i<arr.length; i++) {
        System.out.print(arr[i] + " ");
    }
}
// 2D Array
public static void show2DArrContent(int[] arr) {
    for(int i = 0; i<arr.length; i++) {
        for(int j = 0; i<arr[i].length; j++) {
            System.out.print(arr[i][j] + " ");
        }
    }
}
// ND Array
public static void showNDArrContent(int[] arr) {
    for(int i = 0; i<arr.length; i++) {
        for(int j = 0; i<arr[i].length; j++) {
            ...
            for(int z = 0; i<arr[i]...[y].length; z++) {
                System.out.print(arr[i]...[z] + " ");
            }
        }
    }
}
```

### Pass by reference
สำหรับการส่งค่าให้กับ method ทั่วไปจะเป็น [Pass by value](./Final.md/#pass-by-value) แต่สำหรับ Array ถ้าส่งค่าให้กับ method ไปใช้ แล้ว method ทำการเปลี่ยนค่าใน Array ค่านั่นจะถูกเปลี่ยนใน Array ต้นทางด้วย
```java
public class App {
    public static void changeArr(int[] arr) {
        arr[2] = 4;
    }
    public static void showArrContent(int[] arr) {
        for(int i = 0; i<arr.length; i++) {
            System.out.print(arr[i] + " ");
        }
    }
    public static void main(String[] args){
        int[] aR = {1, 2, 0, 4, 5}
        showArrContent(aR); // 1 2 0 4 5
        changeArr(aR);
        showArrContent(aR); // 1 2 4 4 5
    }
}
```

### 1D Array
Array 1 มิติ: {1, 2, 3, 4, 5, 6}

### 2D Array
Array 2 มิติ (ให้นึกถึงตาราง):
```java
{
    {1, 2, 3, 4, 5, 6}, // แถว 1
    {7, 8, 9, 10, 11, 12}, // แถว 2 
    {13, 14, 15, 16, 17, 18} // แถว 3
}
```

การสร้าง: `int[][] arr = new int[3][6];`
การเข้าถึงค่า: `int[2][3] // ค่าเป็น 16`

แต่ Array 2 มิติ ไม่จำเป็นต้องมีรูปแบบเป็นตาราง เช่น
```java
{
    {1, 2, 3, 4, 5},
    {6, 7, 8, 9},
    {10, 11, 12},
    {13, 14},
    {15}
}
```
รูปแบบนี้เรียกว่า `Ragged Array`

### ND Array
Array n มิติ เช่น Array 3 มิติ
```java
{ // มิติที่ 1
    { // มิติที่ 2
        { // มิติที่ 3 
            1, 2
        }, {3, 4}
    },
    {
        {7, 8}, {9, 10}
    }
}
```