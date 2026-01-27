/* 
    Typescript Fundamental

    Typescript -> Superset of Javascript
    So its syntaxes are basically the same, with some extensions for type checking.

    Clarification javascript
    - auto-assign type to the variable
    - auto conversion for some cases e.g. 2*"10" -> 20
    - doesn't care whatever type you pass in a function
    - accessing non-existent property always result in undefined

    So, the problems are -> incorrect result, and when error happens, it's hard to debug.
    e.g. function sum(a, b) { console.log(a+b) }

    sum(10, 10) // Output: 20
    sum(10, "10") // Output: 1010
    sum(10) // Output: NaN (10 + undefined)

    Typescript deals with these inconsistent type. By preventing wrong type of data being passed in a function.
    So, everything, variables, parameters, etc. need to have a type -> declared with variable name.
    Also, it's widely used in modern frameworks and large projects.
*/

let numberVariable: number = 10; // variable declared as a "number".
let stringVariable: string = "10"; // variable declared as a "string".
let truthTable: boolean[] = [true, false]; // variable declared as a "boolean" array.

// take the example from the above
function sum(a: number, b: number): number {
    return a + b;
}
// function sum requires two arguments, both in type number, and return number type value.

console.log(sum(numberVariable, numberVariable)); // output: 20
// console.log(sum(numberVariable, stringVariable));
// Error: Argument of type 'string' is not assignable to parameter of type 'number'.

// Declaring a type. Come in handy when use with objects.
// Use 'type' when you want to declare a type variable which you want to union it later on.
type ComplexObject = {
    firstProp: number,
    secondProp: string,
    thirdProp: boolean
}

let complexObjectVariable: ComplexObject = {
    firstProp: 10,
    secondProp: "String",
    thirdProp: true,
    // thirdProp: "yes"
    // Error: Type 'string' is not assignable to type 'boolean'.
    // a: "a" 
    // Error: Object literal may only specify known properties, and 'a' does not exist in type 'ComplexObject'. 
}

// type union; combine multiple type together.
type choice = 'A' | 'B' | 'C' | 'D' // Declare with constant literal.
type numOrString = number | string // Declare with type literal.

const choiceVariable: choice = 'A'

const justNumber: numOrString = 10
const stringedNumber: numOrString = '10'
// both are allowed.

// Another way to declare a type.
// Work like OOP inheritance.
// Use 'interface' when you want to declare a type variable which you want to extend it later on.
interface Person {
    name: string,
    age: number
}

interface Student extends Person {
    sid: string
}
/* Student
 * name: string <- Inherited from Person
 * age: number  <- Inherited from Person
 * sid: string
 */

const studentVariable: Student = {
    name: "John",
    age: 20,
    sid: "123"
}

const personVariable: Person = {
    name: "John",
    age: 20,
}

/* 
    JSON (JavaScript Object Notation) 
    A data structure used for transferring data between sites/applications through the internet. (Often from API)
    with HTTP/HTTPS protocol. (Client -> Server, Server -> Client)
    The syntax for JSON is basically stricter version of JavaScript object syntax.
    1. All keys must be inside double quotes.
    2. String value must be inside double quotes.
    3. No comment allowed.
    4. No trailing comma.

    Example
    ```javascript
    {
        name: 'John',
        age: 20, // Trailing comma, this is fine in js.
    }
    ```

    In json, below is only the valid format.
    ```json
    {
        "name": "John",
        "age": 20
    }
    ```

    Usually, when transferring data, the json is in form of string.
    So, to use in code, we need to *parse* it.
    And if we want to send it, we need to *stringify* it.
*/

// Assume we got a json from API
const apiJson = `{
    "message": "OK!",
    "data": {
        "title": "Approaching Winter, Deepening New York Jazz",
        "isLive": true
    }
}`

// To parse it to JavaScript object, use the code below.
const parsed = JSON.parse(apiJson);
// Now, you can access the data inside. e.g.:
console.log(parsed.message, parsed.data);

parsed.data.isLive = false;
// To send back data, we need to stringify with the code below.
const stringified = JSON.stringify(parsed);
console.log(stringified, typeof stringified);

/* Import package & Export module */
// Default import, the name between 'import' and 'from' can be anything
import express from "express";
import xpress from "express";
// Both line works

// Named import, specified the names of object (1+) in that module you want to import here in {}
import { Request, Response } from "express";
// import { req, res } from "express"; 
// Error: Module '"express"' has no exported member 'req'/'res'.

// Default export
export default sum;
// Named export
export { parsed, stringified };

/* 
    Synchronous & Asynchronous 
    Normally, javascript & typescript run in synchronous.
    Meaning each line of code run in sequence, from upper line to lower line.
    
    But some tasks can take some time to complete, e.g. fetching data from API.
    So, to not freeze your app. Let's use asynchronous.

    Asynchronous means your code can run in parallel.
    The upper line code can finish after the lower line's if the lower line's take less time.

    e.g.
    (Synchronous)
*/
    console.log("Synchronous");
    function sync(v: number) {
        console.log(v);
    }
    sync(1);
    sync(2);
    sync(3);

/*
    Output:
    1
    2
    3

    (Asynchronous)
*/
    // Declare an asynchronous function with 'async' keyword.
    console.log("Asynchronous");
    async function Async(v: number, ms: number) {
        await new Promise(resolve => setTimeout(() => resolve(null), ms));
        if(v > 10) throw new Error("Too big -_-");
        console.log(v);
    }
    Async(1, 200);  // Show 1 after the code run for 200ms
    Async(2, 100);  // Show 2 after the code run for 100ms
    Async(3, 500);  // Show 3 after the code run for 500ms
/*   
    Output:
    2
    1
    3

    However, if you still want to run the code in sequence asynchronously, use 'await'.
    You can only use 'await' in asynchronous function.
    But asynchronous function can run without await
*/    
    (async () => {
        await new Promise(resolve => setTimeout(() => resolve(null), 1000));
        console.log("Asynchronous with await");
        await Async(1, 200);  // Show 1 after the code run for 200ms
        await Async(2, 100);  // Show 2 after the code run for 200 + 100ms (wait for 1 to show first)
        await Async(3, 500);  // Show 3 after the code run for 200 + 100 + 500ms (wait for 1 and 2 to show first)
    })()
/*
    Output:
    1
    2
    3

    You can also chain `.then()`/`.catch()`/`.finally()` instead of using `await`, but the code will look ugly.
    - `.then(callback)` for success
    - `.catch(callback)` for error
    - `.finally(callback)` for finally (everything is done)
*/  
    setTimeout(() => {
        console.log("Asynchronous with .then()/.catch()/.finally()");
        Async(1, 200)
            .then(
                () => 
                    Async(2, 100)
                        .then(
                            () => 
                                Async(3, 500)
                                    .catch(err => console.error(err))
                                    .finally(() => console.log("Done, yay!"))
                        )
                        .catch(err => console.error(err))
            )
            .catch(err => console.error(err))
    }, 2000);
/*
    Output:
    1
    2
    3

    Best practice:
    - Use `await` for asynchronous function
    - Put it in try-catch-finally block for error handling
*/
    (async () => {
        await new Promise(resolve => setTimeout(() => resolve(null), 3000));
        try {
            console.log("Asynchronous with try-catch-finally");
            await Async(1, 200);
            await Async(2, 100);
            await Async(11, 100); // This line will direct the code to catch block.
            await Async(3, 500);
        } catch (err) {
            console.error(err);
        } finally {
            console.log("Done, yay!");
        }
    })();