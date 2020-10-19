import { Scroll } from '../dk_toggleHideScroll';

export class PopUp{
  constructor( el, setting={} ){

    const scroll = new Scroll;

    this.defaultSetting = {
      classContainer: 'popup__container',
      classWindow: 'popup__window',
      classVisible: 'visible',
      classHide: 'hide'
    }

    this.setting = { ...this.defaultSetting, ...setting };

    this.wrap = $(`<div class="${this.setting.classContainer} ${this.setting.classHide}" tabindex="1"></div>`);
    this.window = $(`<div class="${this.setting.classWindow}"></div>`);

    this.wrap.append( this.window );
    $('body').append( this.wrap );
    this.wrap.focus();

    this.show = function() {
      this.wrap.removeClass(`${this.setting.classHide}`)
      scroll.hide();
    }

    this.hide = function() {
      this.wrap.addClass(`${this.setting.classHide}`)
      scroll.show();
    }

    this.wrap.on('click', ()=>{
      this.hide();
    })

    this.insert = function(html){
      this.window.html(`${html}`);
    }

    this.append = function($el){
      this.window.append($el);
    }
    // this.insert = this.insert.bind(this)
  }
}