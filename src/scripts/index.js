import '../styles/vendor.scss';
import '../styles/index.scss';
import { SliderSystem } from './sliderSystem'
import { Validator } from './dk_validator';
import { PopUp } from './dk_popup';
import { DropDownList } from './dk_dropDownList';
import { setEventDelay, animHandler, replaceClass, wait, log } from './dk_lib';
import { Scroll } from './dk_toggleHideScroll';
import SimpleBar from 'simplebar';
import 'simplebar/dist/simplebar.css';
import "regenerator-runtime/runtime";

SimpleBar.removeObserver()

const scroll = new Scroll();

const MEDIA_MOBILE = 768 - 1

const SLIDER_SYSTEM_OPTIONS_MAIN = {
  size: 4,
  $handlerCont: $('#handler-sort'),
  slick: {
    infinite: false,
    zIndex: 5,
    arrows: true,
    accessibility: false,
    draggable: false,
    centerMode: false,
  },
  responsive: [
    {
      breakpoint: MEDIA_MOBILE,
      settings: {
        size: 1
      },
      slick: {
        arrows: false,
        accessibility: true,
        draggable: true,
        centerMode: true,
      },
    },
    {
      breakpoint: 575,
      settings: "unwrap"
    }
  ]
}

const SLIDER_SYSTEM_OPTIONS_SECONDARY = {
  size: 2,
  slick: {
    infinite: false,
    zIndex: 5,
    arrows: true,
    accessibility: false,
    draggable: false,
    centerMode: false,
  },
  responsive: [
    {
      breakpoint: MEDIA_MOBILE,
      settings: {
        size: 1
      },
      slick: {
        arrows: false,
        accessibility: true,
        draggable: true,
        centerMode: true,
        centerPadding: '39px',
      },
    }
  ]
}

const FORM_OPTIONS = {
  options: {
    accentSelector: '', // элемент, которому добавляются классы валидации. По умолчанию - поле.
    accentSelector: '',
    messageElement: 'span',
    messageClass: 'form__message',
    messageAnimShowClass:'',
    messageAnimHideClass:'',
    errorClass: 'accent',
    validClass: 'success',
  },
  rules: {// список именованных наборов правил
    name: {// именованный набор правил
      required: {// правило
        value: true,
        message: 'Укажите своё имя'
      }
    },
    place: {
      required: {
        value: true,
        message: 'Укажите континент, страну или город'
      }
    },
    phone: {
      pattern: {
        value: /\+7\s\(\d{3}\)\s\d{3}-\d{4}/,
        message: 'невалидный номер',
        mask: '+7 (999) 999-9999'
      }
    },
    email: {
      required: true,
      pattern: {
        value: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/i,
        message: 'невалидный адрес e-mail'
      }
    },
    "cb-consent": {
      checked: true,
      options: {
        message: false,
        parentSelector: ".form__container-checkbox-small",
        errorClass: 'form__label_checkbox-small_accent',
        validClass: 'success',
        accentSelector: '.form__label_checkbox-small',
      }
    }
  },
}

function menuInit(setting={}) {
  const $menu = setting.menu || $('[data-type="slide-menu-container"]', $menu)
  const $content_container_scroll = $('.menu__container-scroll', $menu)
  const $content = setting.content || $('[data-type="slide-menu-content"]', $menu)
  const $btn = setting.btn || $('.menu__btn-nav', $menu)
  const classOpen = setting.classOpen || 'menu_open';
  scroll.add($menu);

  async function animate(){
    if (!$menu.hasClass(classOpen)) {
      $menu.addClass(classOpen)
      replaceClass($menu, 'visible', 'invisible')
      $btn.addClass('btn-nav_open');
      scroll.hide();
      await animHandler($content, () => replaceClass($content, 'slideCloseRight', 'slideOpenRight'))
    } else {
      replaceClass($menu, 'visible', 'invisible', true)
      $btn.removeClass('btn-nav_open')
      $content.removeClass('slideOpenRight')
      await animHandler($content, () => replaceClass($content, 'slideCloseRight', 'slideOpenRight', true))
      $menu.removeClass(classOpen)
      scroll.show();
    }
  }

  $btn.click( wait(animate) )
  return {
    $menu,
    $content_container_scroll,
    $content,
    $button: $btn,
    classOpen
    }
}

function formInit(setting={}) {
  const $form = $("#form");
  const cb_consent_popup = new PopUp();
  cb_consent_popup.$popupButtonYes = $('<button class="popup__btn btn btn_yellow">согласен</button>')
  cb_consent_popup.$popupButtonNo = $('<button class="popup__btn btn btn_yellow">не согласен</button>')
  const $popup_text = $(`
    <p class="popup__text">
      Lorem ipsum dolor sit amet consectetur adipisicing elit. Minima blanditiis deserunt consectetur accusantium ullam vero quibusdam modi a alias sed? Enim reiciendis autem hic vero neque quia, porro quibusdam eum.
    </p>
  `)
  const $popup_group_row = $('<div class="popup__group-row"></div>')
  $popup_group_row.append(cb_consent_popup.$popupButtonYes)
  $popup_group_row.append(cb_consent_popup.$popupButtonNo)
  cb_consent_popup.append($popup_text)
  cb_consent_popup.append($popup_group_row)

  FORM_OPTIONS.rules['cb-consent'].options.onClick = (e, validateHandler, field) => {
    e.preventDefault();
    cb_consent_popup.$popupButtonYes.click(()=>{
      field.element.checked = true
      validateHandler(e)
      cb_consent_popup.hide()
    })
    cb_consent_popup.$popupButtonNo.click(()=>{
      field.element.checked = false
      cb_consent_popup.hide()
      validateHandler(e)
    })
    cb_consent_popup.show()
  }

  const validator = new Validator($form, FORM_OPTIONS);
  validator.form.on('submit', (e) => {
    e.preventDefault();
  })
  const popup = new PopUp();
  const handler = ()=>{
    let valid = validator.validate();
    
    if (valid) {
      popup.show();
      popup.insert(`<div class="popup__loader loader"></div>`)
      const message = `
      <p class="popup__message">Данные успешно выведены в консоль</p>
      <div class="popup__ok ok"></div>
      `
      setTimeout( ()=>popup.insert(message), 1000, message )
    }
  }
  validator.submit.on('click', setEventDelay(null, handler, 1000, true) )
}

async function getJsonData() {
  const url = '../data/countries.json';
  let response = await fetch(url);

  if (response.ok) {
    let json = await response.json();
    return json
  } else {
    alert("Ошибка HTTP: " + response.status);
  }
}

function createSlide(data, type = 'main'){
  const {image, price, teg, title, route, description, accent} = data
  let $image, $price, $teg, $title, $route, $description, $accent;
  const $slide = $(`<div class="slider__slide" data-slide></div>`)
  const $imageContSize = $(`<div class="slider__image-cont-size"></div>`)
  $slide.append($imageContSize)
  const $imageContPosition = $(`<div class="slider__image-cont-position"></div>`)
  $imageContSize.append($imageContPosition)
  if (image) {
    $image = $(`<img src="${image}" alt="${title}" class="slider__image"></img>`)
    $imageContPosition.append($image)
  }
  if (price) {
    $price = $(`<span class="slider__price">${price}<span class="icon-rub"></span></span>`)
    $imageContPosition.append($price)
  }
  if (teg) {
    $teg = $(`<p class="slider__teg" data-tag>${teg}</p>`)
    $slide.append($teg)
  }
  if (title) {
    $title = $(`<h3 class="slider__title">${title}</h3>`)
    $slide.append($title)
  }
  if (route && type === 'main') {
    $route = $(`<p class="slider__route">${route}</p>`)
    $slide.append($route)
  }
  if (description && type === 'main') {
    $description = $(`<p class="slider__description">${description}</p>`)
    $slide.append($description)
  }
  if (accent && type === 'main') {
    $accent = $(`<span class="slider__accent">${accent}</span>`)
    $slide.append($accent)
  }
  return $slide

    // <div class="slider__slide" data-slide>
    //   <div class="slider__image-cont-size">
    //     <div class="slider__image-cont-position">
    //       <img src="${image}" alt="${title}" class="slider__image">
    //       <span class="slider__price">${price}</span>
    //     </div>
    //   </div>
    //   <p class="slider__teg" data-tag>${teg}</p>
    //   <h3 class="slider__title">${title}</h3>
    //   <p class="slider__route">${route}</p>
    //   <p class="slider__description">${description}</p>
    //   <span class="slider__accent">${accent}</span>
    // </div>
}

function getSliders(data, count, options) {

  const {$container, $button} = options
  const subarrays = [];
  let counter = 0;
  for (let i = 0; i <Math.ceil(data.length/count); i ++){
    subarrays[i] = data.slice( i*count, i*count + count );
  }

  function executor() {
    if (subarrays[counter]) {
      subarrays[counter].forEach( data => {
        let $slide = createSlide(data, 'main')
        $container.append($slide)
      })
      if (!subarrays[counter + 1]) $button.addClass('disabled')
      counter++
    }
  }
  executor()
  return executor

}

$(document).ready(()=>{

  //// слайдеры
  const data = getJsonData()
    .then( data => {
      const slidesMain = []
      const $sliderMain = $('#slider-main');
      SLIDER_SYSTEM_OPTIONS_MAIN.$handlerCont = $('#handler-sort');
      const slidesSecondary = []
      const $sliderSecondary = $('#slider-secondary');

      data.forEach( slideData => {
        const slide = createSlide(slideData, 'main')
        slidesMain.push(slide)
        $sliderMain.append(slide)
      })

      data.forEach( slideData => {
        const slide = createSlide(slideData, 'secondary')
        slidesSecondary.push(slide)
        $sliderSecondary.append(slide)
      })
    
      let sliderSystemMain = new SliderSystem($sliderMain, SLIDER_SYSTEM_OPTIONS_MAIN);
      let sliderSystemSecondary = new SliderSystem($sliderSecondary, SLIDER_SYSTEM_OPTIONS_SECONDARY);

      const $contentMobileButton = $('#load-more')
      const $contentMobileContainer = $('#content-mobile')
      $contentMobileButton.click(getSliders(data, 3, {$container: $contentMobileContainer, $button: $contentMobileButton}))

    })
    .catch( err => console.error(err) )

  // форма
  formInit();
  // меню
  const menu = menuInit();
  menu.simplebar = new SimpleBar(menu.$content_container_scroll[0], {autoHide: false})

  // drop-down-list
  const dropDown = new DropDownList($('.menu__form-menu'), 
    {
      expandWidthToElement: $('.form-menu').eq(0),
      expandHeightToElement: $('.menu__link-tel').eq(0),
    }
  );
  
  dropDown.elements.forEach( (item, index) => {
    item.simplebar = new SimpleBar(item.$listContainerScroll[0], 
    { 
      autoHide: false,
      classNames: {
        scrollbar: 'drop-down__scrollbar'
      }
    })
  })

})
