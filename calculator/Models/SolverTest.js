/**
 * Learning App
 * SolverTest.js
 *
 * @author Brandon Li <brandon.li820@icloud.com> 
 * Created on 1/19/19
 * Copyright © 2019 Brandon Li. All rights reserved.
 *
 * module that takes in a string and solves it
 *
 * ## Functionality:
 *  test the button model for the equals button on several strings
 */
 
'use strict';
 //modules
import Button from "./button.js";
var solver = new Button( "=" );

export default class SolverTest {
  test(){
    var test1 = "1(1+((1+1)(1+1+1(1+1+1+1(1+1+1+1+1)))))";
    console.log( "testing... this: " + test1 )
    assert(solver.handlePressed(test1,0).newString === "21")
    console.log( "done!" + " " + test1 +" does equal " + "21")

    var test2 = "1(2+((3+4)(55+1+1(1+1+1+1(1+1+1+1+1" ;
    console.log( "testing... this: " + test2 )
    assert(solver.handlePressed(test2,0).newString === "450")
    console.log( "done!" + " " + test2 +" does equal " + "450")

    var test3 = "5×662÷536102456752";
    console.log( "testing... this: " + test3 )

    assert(solver.handlePressed(test3,0).newString === "6.174192933294465e-9")
    console.log( "done!" + " " + test3 +" does equal " + "6.174192933294465e-9")

    var test4 = "^(^(^(^(^3";
    console.log( "testing... this: " + test4 )

    assert(solver.handlePressed(test4,0).newString === "Error: syntax")
    console.log( "done!" + " " + test3 +" does equal " + "Error: syntax")

    console.log("all tests passed!")
  }
}


function assert(condition, message) {
  if (!condition) {
    message = message || "Assertion failed";
    if (typeof Error !== "undefined") {
        throw new Error(message);
    }
    throw message; 
  }
}
