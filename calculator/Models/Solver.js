/**
 * Coveral
 * Solver.js
 *
 * @author Brandon Li <brandon.li820@icloud.com>
 * Created on 1/19/19
 * Copyright © 2019 Brandon Li. All rights reserved.
 *
 * module that takes in a string and solves it
 *
 * ## Functionality:
 *  Solves a string
 */

'use strict';

// modules
import Stack from "../../Stack/Stack.js";
import Precedence from "./Precedence.js";

export default class Solver {
  /**
   * @constructor
   * @public
   * enscapulate the precedence module
   */
  constructor( str, round, mode ){
    this.precedence = new Precedence();
    this.str = str;
    this.mode = mode;
    this.str = this.solve( this.transformToList( this.str ) );
    if ( round ){
      this.str = Math.round( parseFloat( this.str ) * Math.pow( 10, round ) )
                 / Math.pow( 10, round )
      this.str = "" + this.str // turn back to string
    }
  }
  /**
   * the function that solves the string
   * @public
   * @recursive
   * @param {array} list - the list representation of the string
   */
  solve( list ){
    // unary operators, prepend a '0'
    if ( list[ 0 ] === "-" || list[ 0 ] === "+" ){
      list = [ "0" ].concat( list );
    }
    var values = new Stack(); // stack for the values
    var operators = new Stack(); // stack for the operators
    var index = 0; // index to keep track of where we are
    /**
     * Loop through the list. Always push number to the values stack.
     * If the operator stack is empty, then push the operator.
     * Otherwise, if the precedence of the operator is greater than the last
     * one in the operator stack, add it normally
     * If the precedence of the operator is less than or equal to the last one
     * in operator stack then solve it first then add normally
     * Once you reach the end, unwind both stacks and return the answer
     */
    while ( index < list.length ){
      if ( this.precedence.isNumber( list[ index ] ) ) {
        // always push numbers
        values.push( list[ index ] );
      }
      else if ( this.precedence.isFunction( list[ index ] ) ||
                list[ index ] === "√" ){
        /**
         * step 1: add a times if there is something in front
         * step 2: remove the part of the list with the stuff
         * inside the parenthesis and the function, and solve
         * that and push it to the value stack
         */
        var before = false;
        if ( index != 0 && ( list[ index - 1 ] === ")" ||
             this.precedence.isNumber( list[ index - 1 ] ) ) ){
          before = true;
        }
        if ( this.precedence.isNumber( list[ index + 1 ] ) ){
          // no parenthesis after the function.
          let newValue = this.evalFunction( list[ index + 1 ], list[ index ] )
          list.removeFrom( index, index + 2 );
          list.splice( index, 0, newValue)
          if (before){
            list.splice( index, 0, "×")
          }
          continue;
        }

        if ( list[ index + 1 ] === "(" ){
          if ( index != 0 && ( list[ index - 1 ] === ")" ||
            this.precedence.isNumber( list[ index - 1 ] ) ) ){
            operators.push( "×" )
          }
          let after = false;
          let corresodingIndex = this.getCloseIndex( list, index + 1 );
          if ( corresodingIndex != list.length - 1 &&
              ( list[ corresodingIndex + 1 ] === "(" ||
                this.precedence.isNumber( list[ corresodingIndex + 1 ] ) ) ||
                this.precedence.isFunction( list[ corresodingIndex + 1 ] ) ){
            after = true;
          }
          if ( corresodingIndex - 1 === index + 1 ){
            throw new Error( "() with nothing inside" )
          }
          let trig = list[ index ];
          let newlist = list.removeFrom( index , corresodingIndex + 1 );
          newlist = newlist.removeFrom( 2, newlist.length - 1 );
          let newValue = this.evalFunction( this.solve( newlist ), trig )
          values.push( newValue );
          if ( after ){
            operators.push( "×" )
          }
          continue;

        }
        else{
          throw new Error( "" + list[ index + 1 ] + " is unrecognized")
        }
      }
      else if ( list[index] === "(" ){
        /**
         * step 1: add a times if there is something in front
         * step 2: remove the part of the list with the stuff
         * inside the parenthesis, and solve that and push it
         * to the value stack
         */
        if ( index != 0 && ( list[ index - 1 ] === ")" ||
             this.precedence.isNumber( list[ index - 1 ] ) ) ){
          operators.push( "×")
        }
        // keep a flag, since the list is going to change
        let after = false;
        let corresodingIndex = this.getCloseIndex( list, index );

        if ( corresodingIndex != list.length - 1 &&
              ( list[ corresodingIndex + 1 ] === "(" ||
                this.precedence.isNumber( list[ corresodingIndex + 1 ] ) ||
                this.precedence.isFunction( list[ corresodingIndex + 1 ] ) ) ){
          after = true;
        }
        if ( corresodingIndex - 1 === index ){
          throw new Error( "() with nothing inside" )
        }
        let newlist = list.removeFrom( index, corresodingIndex + 1 );
        newlist = newlist.removeFrom( 1, newlist.length - 1 );
        let newValue = this.solve( newlist );
        values.push( newValue );
        if ( after ){
          operators.push( "×" )
        }
        continue;
      }
      else if ( this.precedence.isOperator( list[ index ] ) ){
        if ( operators.length() === 0 ) operators.push( list[ index ] );

        else if ( this.precedence.getPrecedence( list[ index ] )
                  <= this.precedence.getPrecedence(
                            operators.arr[ operators.length() - 1 ] ) ){
          let value2 = values.pop();
          let value1 = values.pop();
          let operator = operators.pop();
          values.push( this.operate( value1, value2, operator ) );
          continue;
        }
        else {
          operators.push( list[ index ] );
        }
      }
      index ++;
    }
    return this.solveStack( values, operators )
  }
  /**
   * unwinds both stacks and solves it
   * @private
   * @param {stack} val - the value stack
   * @param {stack} ops - the operator stack
   */
  solveStack( val, ops ){
    let values = val;
    let operators = ops;
    while ( operators.length() > 0 ){
      let value2 = values.pop();
      let value1 = values.pop();
      let operator = operators.pop();
      values.push( this.operate( value1, value2, operator ) );
    }
    if ( values.length() != 1 ){
      throw new Error( "syntax" )
    }
    return values.arr[ 0 ];
  }
  /**
   * returns if two values are almost equal
   * @private
   * @param {number} d1 - first number
   * @param {number} d2 - second number
   */
  almostEqual( d1, d2 ){
    var epsilon = Math.pow( 10, -2 )
    return Math.abs( d2 - d1 ) < epsilon
  }
  /**
   * solves based on the trig function
   * @private
   * @param {string} value - the string value of the arguement
   * @param {string} operator - the operator
   */
  evalFunction( value, operator ){
    if ( isNaN( value ) ){
        throw new Error("syntax");
    }
    value = parseFloat( value) ;
    if ( operator === "sin" ) {
      if ( this.mode == "deg" ) value *= Math.PI / 180
      return "" + Math.sin( value );
    }
    if ( operator === "cos" ) {
      if ( this.mode == "deg" ) value *= Math.PI / 180
      return "" + Math.cos( value );
    }
    if ( operator === "tan" ) {
      if ( this.mode == "deg" ) value *= Math.PI / 180
      if ( this.almostEqual( Math.cos(value), 0 ) ){
        throw new Error("Domain on tan");
      }
      return "" + Math.tan( value );
    }
    if ( operator === "csc" ) {
      if ( this.mode == "deg" ) value *= Math.PI / 180
      if ( this.almostEqual( Math.sin(value), 0 ) ){
        throw new Error("Domain on tan");
      }
      return "" + 1 / Math.sin( value );
    }
    if ( operator === "sec" ) {
      if ( this.mode == "deg" ) value *= Math.PI / 180
      if ( this.almostEqual( Math.cos(value), 0 ) ){
        throw new Error("Domain on tan");
      }
      return "" + 1 / Math.cos( value );
    }
    if ( operator === "cot" ) {
      if ( this.mode == "deg" ) value *= Math.PI / 180
      if ( this.almostEqual( Math.sin(value), 0 ) ){
        throw new Error("Domain on cot");
      }
      return "" + 1 / Math.tan( value );
    }

    if ( operator === "arcsin" ) {
      if ( value < -1 || value > 1 ){
        throw new Error( "domain on arcsin")
      }
      if ( this.mode == "deg" ) {
        return "" + Math.asin( value )*180/Math.PI;
      }
      return "" + Math.asin( value );
    }
    if ( operator === "arccos" ) {
      if ( value < -1 || value > 1 ){
        throw new Error( "domain on arccos")
      }
      if ( this.mode == "deg" ) {
        return "" + Math.acos( value )*180/Math.PI;
      }
      return "" + Math.acos( value );
    }
    if ( operator === "arctan" ) {
      if ( this.mode == "deg" ) {
        return "" + Math.atan( value )*180/Math.PI;
      }
      return "" + Math.atan( value );
    }
    if ( operator === "√" ){
      if ( value < 0 ){
        throw new Error("sqrt of a negative")
      }
      return "" + Math.sqrt( value )
    }
  }
   /**
   * solves based on the operator of two arguements
   * @private
   * @param {string} value1 - the string value of the first arg
   * @param {string} value1 - the string value of the 2nd arg
   * @param {string} operator - the operator
   */
  operate( value1, value2, operator ){
    if (isNaN(value1) || isNaN(value2)){
        throw new Error("syntax");
    }
    value1 = parseFloat(value1);
    value2 = parseFloat(value2);
    if ( operator === "+" ) return "" + ( value1 + value2 );
    if ( operator === "-" ) return "" + ( value1 - value2 );
    if ( operator === "×") return "" + ( value1 * value2 );
    if ( operator === "÷") return "" + ( value1 / value2 );
    if ( operator === "^") return "" + Math.pow( value1, value2 );
    if ( operator === "%"){ // modulus
      if ( !Number.isInteger( value1 ) || !Number.isInteger( value2 ) ) {
        throw new Error("modulus with non integer value");
      }
      return "" + ( value1 % value2 );
    }
    throw new Error( "Unrecognized operator: " + operator )
  }
  /**
   * Transform the string into a meaningful list
   * For example getNextNumber( "1+5-cos(3)" ) ->
   * ["1", "+", "5", "-", "cos", "(", "3", ")"]
   * @param {str} - the string that goes in.
   * @private
   * @return {array} - the result array
   */
  transformToList( str ){
    var index = 0;
    var result = [];
    while ( index < str.length ){
      var current = str.charAt( index );

      if ( this.precedence.isNumber( current ) ){ // is a number
        let nextDigit = this.getNextNumber( str, index );
        result.push( nextDigit.result );
        index = nextDigit.index;
      }
      else {
        let nextDigit = this.getNextOperator( str, index );
        result.push( nextDigit.result );
        index = nextDigit.index;
      }
    }
    return result;
  }

  /**
   * Get the next number from a given index
   * For example getNextNumber( "12+4.6", 3 ) -> result:4.6, index: 6
   * @param {str} - the string that goes in.
   * @param {index} - starting index place
   * @private
   * @return {Object} {
   *   result: - the next number
   *   str: - the new index
   * }
   */
  getNextNumber( str, index ){
    var result = "";
    while ( true ){
      if ( this.precedence.isNumber( str.charAt( index ) ) ) { // is a number
        result += str.charAt(index);
        index ++;
      }
      else{
        return {
          result: result,
          index: index,
        }
      }
    }
  }
  /**
   * Get the next operator from a given index
   * @param {str} - the string that goes in.
   * @param {index} - starting index place
   * @private
   * @return {Object} {
   *   result: - the next operator
   *   str: - the new index
   * }
   */
  getNextOperator( str, index ){
    var result = "";
    if ( this.precedence.isOperator( str.charAt( index ) ) ){
      return {
        result: str.charAt( index ),
        index: index + 1
      }
    }
    if ( index <= str.length - 3 &&
         this.precedence.trig.has( str.substring( index, index + 3 ) ) ){
      return {
        result: str.substring( index, index + 3 ),
        index: index + 3
      }
    }
    if ( index <= str.length - 6 &&
         this.precedence.inverse.has( str.substring( index, index + 6 ) ) ){
      return {
        result: str.substring( index, index + 6 ),
        index: index + 6
      }
    }
    throw new Error( "syntax" );
  }
  /**
   * Get the corresponding close parenthesis index
   * @private
   */
  getCloseIndex( list, start ) {
    var count = 0;
    for ( var i = start + 1; i < list.length ; i++){
      if ( list[ i ] === "(" ) count --;
      if ( list[ i ] === ")" ) count ++;
      if ( count === 1 ) return i;
    }
    throw new Error( "parenthesis" )
  }

}

/**
 * remove a section of the array
 * @param {number} start - the starting spot to remove (inclusive)
 * @param {number} end - the ending spot to remove (not inclusive)
 * @return {array} result - the section that was removed
 */
Array.prototype.removeFrom = function( start, end ){
  let result = [];
  for ( var i = start; i < end; i ++ ){
    let removed = this.splice( start, 1 );
    result = result.concat( removed );
  }
  return result;
}
