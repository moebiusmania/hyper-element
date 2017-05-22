/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 4);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__hyper_element__ = __webpack_require__(3);




/***/ }),
/* 1 */
/***/ (function(module, exports) {

var hyperHTML = (function () {'use strict';

  /*! (C) 2017 Andrea Giammarchi @WebReflection (MIT) */

  // hyperHTML \o/
  //
  // var render = hyperHTML.bind(document.body);
  // setInterval(() => render`
  //  <h1>⚡️ hyperHTML ⚡️</h1>
  //  <p>
  //    ${(new Date).toLocaleString()}
  //  </p>
  // `, 1000);
  function hyperHTML(statics) {
    return  EXPANDO in this &&
            this[EXPANDO].s === statics ?
              update.apply(this, arguments) :
              upgrade.apply(this, arguments);
  }

  // A wire ➰ is a bridge between a document fragment
  // and its inevitably lost list of rendered nodes
  //
  // var render = hyperHTML.wire(optObj);
  // render`
  //  <div>Hello Wired!</div>
  // `;
  //
  // Every single invocation will return that div
  // or the list of elements it contained as Array.
  // This simplifies most task where hyperHTML
  // is used to create the node itself, instead of
  // populating an already known and bound one.
  hyperHTML.wire = function wire(obj, type) {
    return arguments.length < 1 ?
      wireContent('html') :
      (obj == null ?
        wireContent(type || 'html') :
        wireWeakly(obj, type || 'html')
      );
  };

  // - - - - - - - - - - - - - - - - - -  - - - - -

  // -------------------------
  // DOM parsing & traversing
  // -------------------------

  // setup attributes for updates
  //
  // <p class="${state.class}" onclick="${event.click}"></p>
  //
  // Note: always use quotes around attributes, even for events,
  //       booleans, or numbers, otherwise this function fails.
  function attributesSeeker(node, actions) {
    for (var
      attribute,
      value = IE ? uid : uidc,
      attributes = slice.call(node.attributes),
      i = 0,
      length = attributes.length;
      i < length; i++
    ) {
      attribute = attributes[i];
      if (attribute.value === value) {
        // with IE the order doesn't really matter
        // as long as the right attribute is addressed
        actions.push(setAttribute(node, IE ?
          node.getAttributeNode(IEAttributes.shift()) :
          attribute
        ));
      }
    }
  }

  // traverse the whole node in search of editable content
  // decide what each future update should change
  //
  // <div atr="${some.attribute}">
  //    <h1>${some.HTML}</h1>
  //    <p>
  //      ${some.text}
  //    </p>
  // </div>
  function lukeTreeWalker(node, actions) {
    for (var
      child, text,
      childNodes = slice.call(node.childNodes),
      length = childNodes.length,
      i = 0; i < length; i++
    ) {
      child = childNodes[i];
      switch (child.nodeType) {
        case 1:
          attributesSeeker(child, actions);
          lukeTreeWalker(child, actions);
          break;
        case 8:
          if (child.textContent === uid) {
            if (length === 1) {
              actions.push(setAnyContent(node));
              node.removeChild(child);
            } else if (
              (i < 1 || childNodes[i - 1].nodeType === 1) &&
              (i + 1 === length || childNodes[i + 1].nodeType === 1)
            ) {
              actions.push(setVirtualContent(child));
            } else {
              text = node.ownerDocument.createTextNode('');
              actions.push(setTextContent(text));
              node.replaceChild(text, child);
            }
          }
          break;
        case 3:
          if (node.nodeName === 'STYLE' && child.textContent === uidc) {
            actions.push(setTextContent(node));
          }
          break;
      }
    }
  }


  // -------------------------
  // DOM manipulating
  // -------------------------

  // update regular bound nodes
  //
  // var render = hyperHTML.bind(node);
  // function update() {
  //  render`template`;
  // }
  function setAnyContent(node) {
    return function any(value) {
      switch (typeof value) {
        case 'string':
          node.innerHTML = value;
          break;
        case 'number':
        case 'boolean':
          node.textContent = value;
          break;
        default:
          if (Array.isArray(value)) {
            if (value.length === 1) {
              any(value[0]);
            } else if(typeof value[0] === 'string') {
              any(value.join(''));
            } else {
              var i = indexOfDiffereces(node.childNodes, value);
              if (-1 < i) {
                updateViaArray(node, value, i);
              }
            }
          } else {
            populateNode(node, value);
          }
          break;
      }
    };
  }

  // update attributes node
  //
  // render`<a href="${url}" onclick="${click}">${name}</a>`;
  //
  // Note: attributes with a special meaning like DOM Level 0
  //       listeners or accessors properties are directly set
  function setAttribute(node, attribute) {
    var
      name = attribute.name,
      isEvent = name.slice(0, 2) === 'on',
      isSpecial = name in node && !SHOULD_USE_ATTRIBUTE.test(name),
      oldValue
    ;
    if (isSpecial) node.removeAttribute(name);
    return isSpecial ?
      function specialAttr(newValue) {
        if (oldValue !== newValue) {
          oldValue = newValue;
          if (isEvent) {
            node[name] = 'handleEvent' in newValue ?
              newValue.handleEvent.bind(newValue) :
              newValue;
          } else {
            node[name] = newValue;
          }
        }
      } :
      function attr(newValue) {
        if (oldValue !== newValue) {
          attribute.value = (oldValue = newValue);
        }
      };
  }

  // update the "emptiness"
  // this function is used when template literals
  // have sneaky html/fragment capable
  // updates in the wild (no spaces around)
  //
  // render`
  //  <p>Content before</p>${
  //  'any content in between'
  //  }<p>Content after</p>
  // `;
  //
  // Note: this is the most expensive
  //       update of them all.
  function setVirtualContent(node) {
    var
      fragment = document.createDocumentFragment(),
      childNodes = []
    ;
    return function any(value) {
      var i, parentNode = node.parentNode;
      switch (typeof value) {
        case 'string':
        case 'number':
        case 'boolean':
          removeNodeList(childNodes, 0);
          injectHTML(fragment, value);
          childNodes = slice.call(fragment.childNodes);
          parentNode.insertBefore(fragment, node);
          break;
        default:
          if (Array.isArray(value)) {
            if (value.length === 0) {
              any(value[0]);
            } else if(typeof value[0] === 'string') {
              any(value.join(''));
            } else {
              i = indexOfDiffereces(childNodes, value);
              if (-1 < i) {
                removeNodeList(childNodes, i);
                value = value.slice(i);
                appendNodes(fragment, value);
                parentNode.insertBefore(fragment, node);
                childNodes.push.apply(childNodes, value);
              }
            }
          } else {
            removeNodeList(childNodes, 0);
            childNodes = value.nodeType === 11 ?
              slice.call(value.childNodes) :
              [value];
            parentNode.insertBefore(value, node);
          }
          break;
      }
    };
  }

  // basic closure to update nodes textContent
  //
  // render`
  //  <p>
  //    ${'spaces around means textContent'}
  //  </p>`;
  function setTextContent(node) {
    var oldValue;
    return function text(newValue) {
      if (oldValue !== newValue) {
        node.textContent = (oldValue = newValue);
      }
    };
  }


  // -------------------------
  // Helpers
  // -------------------------

  // it does exactly what it says
  function appendNodes(node, childNodes) {
    for (var
      i = 0,
      length = childNodes.length;
      i < length; i++
    ) {
      node.appendChild(childNodes[i]);
    }
  }

  // given two collections, find
  // the first index that has different content.
  // If the two lists are the same, return -1
  // to indicate no differences were found.
  function indexOfDiffereces(a, b) {
    if (a === b) return -1;
    var
      i = 0,
      aLength = a.length,
      bLength = b.length
    ;
    while (i < aLength) {
      if (i < bLength && a[i] === b[i]) i++;
      else return i;
    }
    return i === bLength ? -1 : i;
  }

  // inject HTML into a template node
  // and populate a fragment with resulting nodes
  //
  // IE9~IE11 are not compatible with the template tag.
  // If the content is a partial part of a table there is a fallback.
  // Not the most elegant/robust way but good enough for common cases.
  // (I don't want to include a whole DOM parser for IE only here).
  function injectHTML(fragment, html) {
    var
      fallback = IE && /^[^\S]*?<(t(?:head|body|foot|r|d|h))/i.test(html),
      template = fragment.ownerDocument.createElement('template')
    ;
    template.innerHTML = fallback ? ('<table>' + html + '</table>') : html;
    if (fallback) {
      template = {childNodes: template.querySelectorAll(RegExp.$1)};
    }
    appendNodes(
      fragment,
      slice.call((template.content || template).childNodes)
    );
  }

  // accordingly with the kind of child
  // it puts its content into a parent node
  function populateNode(parent, child) {
    switch (child.nodeType) {
      case 1:
        var childNodes = parent.childNodes;
        if (0 < childNodes.length) {
          if (childNodes[0] === child) {
            removeNodeList(childNodes, 1);
            break;
          }
        }
        resetAndPopulate(parent, child);
        break;
      case 11:
        if (-1 < indexOfDiffereces(parent.childNodes, child.childNodes)) {
          resetAndPopulate(parent, child);
        }
        break;
      case 3:
        parent.textContent = child.textContent;
        break;
    }
  }

  // it does exactly what it says
  function removeNodeList(list, startIndex) {
    var length = list.length, child;
    while (startIndex < length--) {
      child = list[length];
      child.parentNode.removeChild(child);
    }
  }

  // drop all nodes and append a node
  function resetAndPopulate(parent, child) {
    parent.textContent = '';
    parent.appendChild(child);
  }

  // the first time a hyperHTML.wire() is invoked
  // remember the list of nodes that should be updated
  // at every consequent render call.
  // The resulting function might return the very first node
  // or the Array of all nodes that might need updates.
  function setupAndGetContent(node) {
    for (var
      child,
      children = [],
      childNodes = node.childNodes,
      i = 0,
      length = childNodes.length;
      i < length; i++
    ) {
      child = childNodes[i];
      if (
        1 === child.nodeType ||
        0 < trim.call(child.textContent).length
      ) {
        children.push(child);
      }
    }
    length = children.length;
    return length < 2 ?
      ((child = length < 1 ? node : children[0]),
      function () { return child; }) :
      function () { return children; };
  }

  // remove and/or and a list of nodes through an array
  function updateViaArray(node, childNodes, i) {
    var fragment = node.ownerDocument.createDocumentFragment();
    if (0 < i) {
      removeNodeList(node.childNodes, i);
      appendNodes(fragment, childNodes.slice(i));
      node.appendChild(fragment);
    } else {
      appendNodes(fragment, childNodes);
      resetAndPopulate(node, fragment);
    }
  }

  // create a new wire for generic DOM content
  function wireContent(type) {
    var content, container, fragment, render, setup, template;
    return function update(statics) {
      if (template !== statics) {
        setup = true;
        template = statics;
        fragment = document.createDocumentFragment();
        container = type === 'svg' ?
          document.createElementNS('http://www.w3.org/2000/svg', 'svg') :
          fragment;
        render = hyperHTML.bind(container);
      }
      render.apply(null, arguments);
      if (setup) {
        setup = false;
        if (type === 'svg') {
          appendNodes(fragment, slice.call(container.childNodes));
        }
        content = setupAndGetContent(fragment);
      }
      return content();
    };
  }

  // returns or create a weak wire by ID
  function wireByID(wires, id, type) {
    return wires[id] || (wires[id] = wireContent(type));
  }

  // setup a weak reference if needed and return a wire by ID
  function wireWeakly(obj, type) {
    var
      wires = wm.get(obj) || (wm.set(obj, wires = {}), wires),
      i = type.indexOf(':')
    ;
    return i < 0 ?
      wireByID(wires, type, type) :
      wireByID(wires, type.slice(i + 1), type.slice(0, i) || 'html');
  }

  // -------------------------
  // Template setup
  // -------------------------

  // each known hyperHTML update is
  // kept as simple as possible.
  function update() {
    for (var
      i = 1,
      length = arguments.length,
      updates = this[EXPANDO].u;
      i < length; i++
    ) {
      updates[i - 1](arguments[i]);
    }
    return this;
  }

  // but the first time, it needs to be setup.
  // From now on, only update(statics) will be called
  // unless this node won't be used for other renderings.
  function upgrade(statics) {
    var
      updates = [],
      html = statics.join(uidc)
    ;
    if (IE) {
      IEAttributes = [];
      injectHTML(this, html.replace(no, comments));
    } else if (this.nodeType === 1) {
      this.innerHTML = html;
    } else {
      injectHTML(this, html);
    }
    lukeTreeWalker(this, updates);
    this[EXPANDO] = {s: statics, u: updates};
    return update.apply(this, arguments);
  }

  // -------------------------
  // local variables
  // -------------------------

  var
    // some attribute might be present on the element prototype but cannot be set directly
    SHOULD_USE_ATTRIBUTE = /^style$/i,
    // avoids WeakMap to avoid memory pressure, use CSS compatible syntax for IE
    EXPANDO = '_hyper_html: ',
    // use a pseudo unique id to avoid conflicts and normalize CSS style for IE
    uid = EXPANDO + ((Math.random() * new Date) | 0) + ';',
    // use comment nodes with pseudo unique content to setup
    uidc = '<!--' + uid + '-->',
    // threat it differently
    IE = 'documentMode' in document,
    no = IE && new RegExp('([^\\S][a-z]+[a-z0-9_-]*=)([\'"])' + uidc + '\\2', 'g'),
    comments = IE && function ($0, $1, $2) {
      IEAttributes.push($1.slice(1, -1));
      return $1 + $2 + uid + $2;
    },
    // verify empty textContent on .wire() setup
    trim = EXPANDO.trim || function () {
      return this.replace(/^\s+|\s+$/g, '');
    },
    // convert DOM.childNodes into arrays to avoid
    // DOM mutation backfiring on loops
    slice = [].slice,
    // used for weak references
    // if WeakMap is not available
    // it uses a configurable, non enumerable,
    // quick and dirty expando property.
    wm = typeof WeakMap === typeof wm ?
      {
        get: function (obj) { return obj[EXPANDO]; },
        set: function (obj, value) {
          Object.defineProperty(obj, EXPANDO, {
            configurable: true,
            value: value
          });
        }
      } :
      new WeakMap(),
    IEAttributes
  ;

  // -------------------------
  // ⚡️ ️️The End ➰
  // -------------------------
  return hyperHTML;

}());

// umd.KISS
try { module.exports = hyperHTML; } catch(o_O) {}


/***/ }),
/* 2 */
/***/ (function(module, exports) {

module.exports = "h1{\r\n    font-weight: 300;\r\n}\r\nli.active{\r\n    color: blue;\r\n}\r\nsection > div{\r\n    display: none;\r\n}\r\nsection > div.open{\r\n    display: block;\r\n}\r\nh1:hover,\r\nnav ul li:hover{\r\n    cursor: pointer;\r\n}"

/***/ }),
/* 3 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_hyperhtml__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_hyperhtml___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_hyperhtml__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__style_css__ = __webpack_require__(2);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__style_css___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1__style_css__);





customElements.define('hyper-element', class extends HTMLElement {

  /**
  * Element initialization
  *
  * @return {null}
  */
  constructor(){
    super();
    
    this.html = __WEBPACK_IMPORTED_MODULE_0_hyperhtml___default.a.bind(
      this.attachShadow({mode: 'open'})
    );

    this._state = {
      token: null,
      open: false,
      endpoint: 'https://jsonplaceholder.typicode.com',
      links: {
        posts: [],
        todos: [],
        albums: []
      },
      active: 0
    };

    this.__update = {
      set: (target,name,val) => {
        this._state = Object.assign({}, this._state, {[name]: val});
        this.__render(this._state);
        return true;
      }
    }

    this.state = new Proxy(this._state, this.__update);
  }

  __render(state){
    this.html`<style>${__WEBPACK_IMPORTED_MODULE_1__style_css___default.a}</style>
    <section>
      <h1 onclick="${this._open.bind(this)}">Hyper element <small>(Click to open/close)</small></h1>
      <div class="${this._computeOpen(state.open)}">
        <nav>
          <ul>
            <li class="${this._activeTab(state.active,0)}" onclick="${this._switch.bind(this)}" data-index="0">Posts</li>
            <li class="${this._activeTab(state.active,1)}" onclick="${this._switch.bind(this)}" data-index="1">Todos</li>
            <li class="${this._activeTab(state.active,2)}" onclick="${this._switch.bind(this)}" data-index="2">Albums</li>
          </ul>
        </nav>
      
        <ul>${this._getCollection(state.active, state.links).map(e => {
          return __WEBPACK_IMPORTED_MODULE_0_hyperhtml___default.a.wire(e)`<li id="${e.id}">${e.title}</li>`
        })}</ul>
      </div>
    </section>`; 
  }

  _computeOpen(open){
    return open ? 'open' : '';
  }

  _open(evt){
    evt.preventDefault();
    this.state.open = !this._state.open;
  }

  _switch(evt){
    const index = parseInt(evt.target.dataset.index);
    this.state.active = index;
  }

  _getCollection(index,links){
    const sections = ['posts', 'todos', 'albums'];
    return links[sections[index]] || [];
  }

  _activeTab(index,check){
    return (index === check) ? 'active' : '';
  }

  /**
  * When the component is attached into the DOM.
  *
  * @return {null}
  */
  connectedCallback(){
    this.__render(this._state);

    Promise.all([
      fetch(this.state.endpoint + '/posts').then(r => r.json()),
      fetch(this.state.endpoint + '/todos').then(r => r.json()),
      fetch(this.state.endpoint + '/albums').then(r => r.json())
    ]).then(data => {
      const obj = {
        posts: data[0],
        todos: data[1],
        albums: data[2]
      }

      this.state.links = Object.assign({}, this.state.links, obj);
    });
  }

});

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(0);


/***/ })
/******/ ]);
//# sourceMappingURL=app.js.map