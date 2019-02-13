/**
 * Portfolio
 * ScreenView.js
 *
 * @author Brandon Li <brandon.li820@icloud.com> 
 * Created on 2/13/19
 * Copyright © 2019 Brandon Li. All rights reserved.
 *
 * File for the screen View
 * Uses ONLY Node.js
 *
 * ## Description of ScreenView:
 * ScreenView is the actual tree being played out.
 * 
 * For example:
 *    Html  <- Document
 *     |
 *    body
 *     |
 *   wrapper <- ScreenView
 *    / \
 *   A   B <- Node.js
 *  / \
 * D   E
 *
 * The advantage of this is that you can add children to a specific id/class.
 * However it will be searched through the root node and not the body.
 */


"use strict";
export default class ScreenView {
  /**
   * Creates a Screen View
   * @public
   * @constructor
   *
   * @param {Node} rootNode - the rootNode of the screenView
   * this will add this node to the body.
   */
  constructor( rootNode ){
    // @public
    this.rootNode = rootNode;
    // get the body
    // @private
    this.body = document.getElementsByTagName( "body" )[ 0 ];
    rootNode.parent = this.body;
    this.body.appendChild( rootNode.DOMobject ); // this will display it
  } 
  /**
   * Delete the bond between the body and the root Node
   * @public
   * This will remove it from the display ( the nodes itself wont be disposed! )
   */
  dispose(){
    this.body.innerHTML = "";
    this.rootNode.parent = null;
  }
  /**
   * add child to a parent inside the tree
   * @public
   *
   * @param {Object} [options] - Object with its attributes.
   * options { all @required
   *   node: {node} - the node object being added
   *   parentType: - the search method ["class", "id"]
   *   parentString: - the id/class name of the parent to search for
   * }
   * This will add it to the first instance of it inside of the root Order list
   */
  addChild( options ){ 
    // append the child to the parent
    let rootOrder = this.rootOrderList
    if ( options.parentType === "class" ){
      rootOrder.filter( node => node.class === options.parentString )
      let parentNode;
      for ( var i = 0; i < rootOrder.length; i++ ){
        if ( rootOrder[ i ].class === options.parentString ){
          parentNode = rootOrder[ i ];
          break;
        }
      }
      if ( !parentNode ) return;
      if ( parentNode.class != options.parentString ) return;
      parentNode.addChild( options.node );
    }
    if ( options.parentType === "id" ){
      rootOrder.filter( node => node.id === options.parentString )
      let parentNode;
      for ( var i = 0; i < rootOrder.length; i++ ){
        if ( rootOrder[ i ].id === options.parentString ){
          parentNode = rootOrder[ i ];
          break;
        }
      }
      if ( !parentNode ) return;
      if ( parentNode.id != options.parentString ) return;
      parentNode.addChild( options.node );
    }
  }
  /**
   * return the root order traversal in a list format
   * @private
   * @recursive
   * @return {array}  the root order representation of the tree
   */
  get rootOrderList(){
    let arr = [];
    arr.push( this.rootNode )
    if ( !this.rootNode.children.length ) return arr;
    rootHelper( this.rootNode )
    function rootHelper( node ){
      if ( node.children.length === 0 ) arr.push( node );
      for ( var i = 0; i < node.children.length; i++ ){
        rootHelper( node.children[ i ] );
      }
    }
    return arr;
  }
}
