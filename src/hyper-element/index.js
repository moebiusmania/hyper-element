'use strict';

import hyperHTML from 'hyperhtml';
import css from './style.css';

customElements.define('hyper-element', class extends HTMLElement {

  /**
  * Element initialization
  *
  * @return {null}
  */
  constructor(){
    super();
    
    this.html = hyperHTML.bind(
      this.attachShadow({mode: 'open'})
    );

    this._state = {
      token: null,
      open: false,
      endpoint: 'http://jsonplaceholder.typicode.com',
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
    this.html`<style>${css}</style>
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
          return hyperHTML.wire(e)`<li id="${e.id}">${e.title}</li>`
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