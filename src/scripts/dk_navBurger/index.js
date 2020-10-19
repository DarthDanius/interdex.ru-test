import {animHandler, setEventDelay} from '../dk_lib'
import 'dk_nav-burger/index.scss'

export class Burger{// use lib/animHandler()

  constructor(nav, options=null) {

    this.defaultOptions = {
      icon: '',
      classListCloseAnimate:'slideUp',
      classListOpenAnimate: 'slideDown',
      classNavBurger: 'nav_burger',
      classNavOpen: 'nav_burger_open',
      classBtnOpen: 'btn_burger_open',
      button: '',
      breakpoint: 880
    }

    this.state = {
      visible: false,
      position: 'close',
      init: false
    }

    this.elements = {
      nav: null,
      list: null,
      button: null,
      icon: null
    }

    this.options = (options) ? Object.assign(this.defaultOptions, options) : this.defaultOptions;
    if ( !$(nav).length ) {
      console.log(`Элемент nav не найден по селектору ${nav}`)
      return false;
    } else {
      this.elements.nav = $(nav).eq(0);
      this.elements.list = $('ul', this.elements.nav);
      if (this.elements.list.length === 0) {
        console.log(`Элемент ul не найден`)
        return false;
      }
    }

    if ( $(`${this.options.button}`).length ) {
      this.elements.button = $(`${this.options.button}`).eq(0);
    } else {
      this.elements.button = $(`<button class="nav__btn btn btn_burger" type="button">`);

      if (this.options.icon) {
        this.elements.icon = this.options.icon;
      } else {
        this.elements.icon = $(`
        <svg class="btn__icon btn__icon_svg" xmlns='http://www.w3.org/2000/svg' aria-hidden="true" focusable="false" viewBox="0 0 145 103">
          <g class="btn__group" id="icon-nav">
            <polygon class="btn__element" points="0,85 0,103 145,103 145,85 "/>
            <polygon class="btn__element" points="0,43 0,61 145,61 145,43 "/>
            <polygon class="btn__element" points="145,0 0,0 0,18 145,18 "/>
          </g>
        </svg>`);
      }
      this.elements.button.append(this.elements.icon);
      this.elements.nav.prepend(this.elements.button);
    }

    this.elements.button.on('click', () => {
      if ( !this.btnClose( {elements:this.elements, options: this.options, state: this.state} ) ) {
        this.btnOpen( {elements:this.elements, options: this.options, state: this.state} )
      }
    });

    this.controller();

    const resizeInit = setEventDelay(null, ()=>this.controller(), 500)// замыкание метода с таймером
    window.addEventListener('resize', (e) => resizeInit(e), false)
  }

  controller(){

    // console.log(this.state)
    if (this.state.init === false) {
      this.state.visible = ( document.documentElement.clientWidth <= this.options.breakpoint );
      this.state.init = true;

      if (this.state.visible === true) {
        this.elements.nav.addClass(this.options.classNavBurger);
        // this.elements.nav.prepend(this.elements.button);
      } else if (this.state.visible === false) {
        this.elements.nav.removeClass(this.options.classNavBurger);
        // this.elements.button.remove();
      }
      // console.log(this.state);
      return
    }

    let newStateVisible = ( document.documentElement.clientWidth <= this.options.breakpoint );
    if ( newStateVisible !== this.state.visible ) {
      this.state.visible = newStateVisible;
      if (this.state.visible === true) {
        this.elements.nav.addClass(this.options.classNavBurger);
        // this.elements.nav.prepend(this.elements.button);
      } else if (this.state.visible === false) {
        this.elements.nav.removeClass(this.options.classNavBurger);
        // this.elements.button.remove();
      }
    }
  }

  btnClose( {elements, options, state} = {elements:this.elements, options: this.options, state: this.state} ) {
    console.log(state);
    if (state.position === 'close') {
      return false
    } else {
      elements.button.removeClass(options.classBtnOpen);
      animHandler( elements.list, options.classListCloseAnimate )
      .then( (r) => {
        elements.nav.removeClass(options.classNavOpen);
        elements.list.removeClass(options.classListCloseAnimate);
      } );
      state.position = 'close';
      return true;
    }
  }

  btnOpen( {elements, options, state} = {elements:this.elements, options: this.options, state: this.state} ) {
    console.log(state);
    if (state.position === 'open') {
      return false
    } else {
      elements.button.addClass(options.classBtnOpen);
      elements.nav.addClass(options.classNavOpen);
      animHandler( elements.list, options.classListOpenAnimate )
      .then( (r) => {
        elements.list.removeClass(options.classListOpenAnimate);
      } );
      state.position = 'open';
      return true;
    }
  }
}