import * as slick from 'slick-carousel/slick/slick';
import { setEventDelay, replaceClass } from './dk_lib';

class SliderSystem {

  constructor($sliderContainer, sliderSystemOpt = {}) {

    this.$slider = $sliderContainer
    this.optionsSlick = sliderSystemOpt.slick
    this.optionsSlickCurrent = null
    this.optionsDefault = {
      size: 1,
      responsive: [
        // {
        //   breakpoint: 799,
        //   settings: {
        //     size: 1,
        //   }
        // }
      ],
      classWrap: 'slider__slide-wrap',
      classHandlerItem: 'handler__item',
      classActive: "active",
      classDisabled: "disabled",
      classHide: "hide"
    }
    this.options = {...this.optionsDefault, ...sliderSystemOpt}
    this.optionsCurrent = null
    this.init = false
    this.breakpoints = this.options.responsive.sort( (a, b) => {
      if (a.breakpoint != b.breakpoint) {
        return a.breakpoint - b.breakpoint;
      }
      return a.breakpoint - b.breakpoint;
    })
    this.previousBreakpoint = null
    this.visibleSlides = this.$slider.children()

    const init = () => {
      // console.info('init')
      let windowWidth = document.documentElement.clientWidth
      if (this.breakpoints.length) {
        let currentBreakpoint = this.breakpoints.find( item => windowWidth <= item.breakpoint)
        if (!this.init || this.previousBreakpoint !== currentBreakpoint) {
          if (currentBreakpoint && typeof currentBreakpoint.settings !== 'string') {
            this.optionsSlickCurrent = {...this.optionsSlick, ...currentBreakpoint.slick}
            this.optionsCurrent = currentBreakpoint ? {...this.options, ...currentBreakpoint.settings} : this.options
          } else {
            this.optionsSlickCurrent = this.optionsSlick
            this.optionsCurrent = this.options
          }
          if ( currentBreakpoint && (currentBreakpoint.settings === 'unwrap') ) {
            // console.info('UNWRAP')
            if (!this.init) return
            this.initSliderSystem(this.optionsCurrent, true)
            this.previousBreakpoint = currentBreakpoint
            return
          }
          this.initSliderSystem(this.optionsCurrent)
          this.previousBreakpoint = currentBreakpoint
          this.init = true
        }
      }
    }
    init()
    let onResizeHandler = setEventDelay(null, init, 1000)
    window.addEventListener('resize', onResizeHandler)
  }

  wrapSlides(size = 1) {
    let $slides = this.visibleSlides
    let subarrays = [];
    for (let i = 0; i <Math.ceil($slides.length/size); i ++){
      subarrays[i] = $slides.slice( i*size, i*size + size );
    }
    subarrays = subarrays.map($subarray => {
      let $wrap = $(`<div class="${this.options.classWrap}" />`);
      $wrap.append($subarray)
      this.$slider.append($wrap)
      return $wrap
    })

    return subarrays;
  }

  unwrapSlides() {
    const $slider = this.$slider
    const $wraps = $(`.${this.options.classWrap}`, $slider)
    if (!$wraps.length) return
    $wraps.children().prependTo($slider)
    $wraps.remove();
  }

  handlerSortInit(options = {$handlerCont: null}) {
    // создает элементы управления основываясь на слайдах.
    const $slider = this.$slider
    const {$handlerCont, classActive, classDisabled, classHide} = options
    if (!$handlerCont) return
    const _this = this

    let $slides = $('[data-slide]', $slider);
    let slides = $.makeArray($slides).map( slide => {
      return {
        element: slide,
        value: $('[data-tag]' ,slide).text().trim().toLowerCase().split(',')[0]
      }
    })
    
    let buttons = Array.from(new Set(slides.map( slide => slide.value) )).sort();
    buttons = buttons.map(button => {
      const $element = $(`<li class="${this.options.classHandlerItem}">${button}</li>`);
      $handlerCont.append($element)
      return {
        element: $element[0],
        active: true,
        value: button
      }
    })

    function sortSlides() {
      _this.visibleSlides = []
      for (let slide of slides) {
        let match = false
        for (let button of buttons) {
          if ( !match && (button.active && button.value.indexOf(slide.value) !== -1) ) {
            slide.element.classList.remove(classHide)
            _this.visibleSlides.push(slide.element)
            match = true;
            break
          }
        }
        if (!match) slide.element.classList.add(classHide)
      }
    }

    function select(target) {
      // состояние кнопок
      let currentButton = buttons.find( (button) => {
        let valid = button.element === target;
        return valid;
      } );
      if (currentButton.active) {
        currentButton.active = false;
        replaceClass(currentButton.element, classActive, classDisabled)
      } else {
        currentButton.active = true;
        replaceClass(currentButton.element, classActive, classDisabled, true)
      }
    }

    $handlerCont.on('click', (e) => {
      select(e.target);
      sortSlides();
      this.initSliderSystem(this.optionsCurrent);
    })
  }

  initSliderSystem(options = {size: null, $handlerCont: null}, destruct = false) {
    if (!options) return
    const $slider = this.$slider
    const {size, $handlerCont, classHide} = options
    const classWrap = this.options.classWrap

    if (!this.init) {
      if ($handlerCont) this.handlerSortInit(options);
    } else {
      if ($slider.hasClass('slick-slider')) {
        $slider.slick('slickUnfilter')
        $slider.slick('unslick')
      }
      this.unwrapSlides()
    }

    if (destruct) {
      if ($handlerCont) $handlerCont.addClass(classHide)
    } else {
      if ($handlerCont) $handlerCont.removeClass(classHide)
      this.wrapSlides(size);
      $slider.slick(this.optionsSlickCurrent);
      $slider.slick('slickFilter', function() {
        return $(`.${classWrap}`, this).length === 1;
      });
    }
  }
}

export {SliderSystem}