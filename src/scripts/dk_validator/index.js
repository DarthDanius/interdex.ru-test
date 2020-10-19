import 'jquery.maskedinput/src/jquery.maskedinput.js'

export class Validator{// use jquery.maskedinput.js => jquery 3.4.x

  constructor(el, setting=null){

    this.options;
    this.rules;
    this.init = false;
    this.target;
    this.targetTag;
    this.form = null;
    this.fields = []
    this.submit = null;
    this.function = null

    if ( el.jquery === undefined) el = $(el );
    if ( el[0].tagName.match(/(input|form|textarea)/i) ) {
      this.target = el;
      this.targetTag = el[0].tagName.toLowerCase();
    }
    else {
      console.log(`Элемент <${el[0].tagName}> не является формой или полем`);
      return;
    };
    if ( this.targetTag === 'form' ) {
      this.form = this.target;
      this.form.attr('novalidate', 'novalidate');
      this.fields = $.makeArray( $( `input[type!="button"][type!="submit"][type!="reset"], textarea`, this.form[0] ) ).map( (el) => { return {element: el} } );
      this.submit = $('[type="submit"]', this.form[0]);
    } else if ( !this.target.attr('type').match( /(button|submit|reset)/i ) ) {
        this.fields = [{element: this.target[0]}];
    } else {
      console.log(`Элемент <${el[0].tagName}> не является полем. Тип ${this.target.attr('type')}`);
      this.init = false;
      return;
    }

    this.defaultSetting = {
      options: {
        accentSelector: '', // элемент, которому добавляются классы валидации. По умолчанию - поле.
        parentSelector: '', // элемент, следом за которым вставляется сообщение. По умолчанию - поле.
        messageElement: 'span',
        messageClass: 'form__message',
        messageAnimShowClass:'',
        messageAnimHideClass:'',
        errorClass: 'fail',
        validClass: 'success',
      },
      rules: {// список именованных наборов правил
        name: {// именованный набор правил
          required: {// правило
            value: true,
            message: 'пустое поле'
          }
        },
        phone: {
          required: true,
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
        }
      },
    }

    this.rules = (setting) ? Object.assign({}, this.defaultSetting.rules, setting.rules) : this.defaultSetting.rules;
    this.options = (setting) ? Object.assign({}, this.defaultSetting.options, setting.options) : this.defaultSetting.options;

    this.methods = {
      required: function( field, value = true, message = 'пустое поле', parent){
        let valid = Boolean( field.element.value.trim() );
        if (!valid) {
          field.message.text(message);
          parent.showMessage(field)
        } else {
          parent.hideMessage(field)
        }
        return valid;
      },
      pattern: function(field, value, message, parent){
        let fieldElementValue = field.element.value.trim();
        if (fieldElementValue === "") return true;
        let valid = field.element.value.trim().match(value);
        if (!valid) {
          field.message.text(message);
          parent.showMessage(field)
        } else {
          parent.hideMessage(field)
        }
        return valid;
      },
      checked: function(field, value, message, parent){
        let valid = field.element.checked;
        if (!valid) {
          field.message.text(message);
          parent.showMessage(field)
        } else {
          parent.hideMessage(field)
        }
        return valid;
      }
    }

    // фильтруем, создаем элементы сообщений, присваиваем обработчики событий

    let fieldsSort = [];
    for ( let field of this.fields ) {
      let methodExist = false;
      let currentRules = {};
      for ( let setOfRules of Object.entries(this.rules) ) {
        if ( field.element.getAttribute('name') === setOfRules[0] ) {
          methodExist = true;
          currentRules = setOfRules[1];
          if ( setOfRules[1].pattern && setOfRules[1].pattern.mask ) {
            $(field.element).mask(setOfRules[1].pattern.mask);
            field.element.addEventListener('blur', (e) => {field.change = true} );// на маскированном эл-те не работает событие 'change'
          }
          break;
        }
      }
      if (methodExist) {
        field.type = $(field.element).attr('type') || field.element.tagName.toLowerCase();
        field.options = { ...this.options, ...currentRules.options };
        // messageElement
        field.message = (field.options.messageElement) ? $(`<${field.options.messageElement}>`) : $(`<${this.options.messageElement}>`);
        // accentSelector элемент, которому добавляются классы валидации. По умолчанию - поле. сосед || родитель
        let accentElement = field.element;
        const accentSelector = field.options.accentSelector;
        if (accentSelector) {
          const $fieldElement = $(field.element);
          if ( $fieldElement.siblings(`${accentSelector}`).length) accentElement = $fieldElement.siblings(`${accentSelector}`)[0];
          else if ( $fieldElement.parent(`${accentSelector}`).length) accentElement = $fieldElement.parent(`${accentSelector}`)[0];
          else console.log(`элемент с селектором ${accentSelector} не найден`)
        }
        field.accentElement = accentElement;
        field.message.addClass(field.options.messageClass);
        // parentSelector
        const parentSelector = field.options.parentSelector;
        if ( parentSelector ) {
          let parent = $(field.element).parent(`${field.options.parentSelector}`);
          if (parent.length) { 
            field.message.insertAfter(parent) 
          } else field.message.insertAfter(field.element);
        } else {
          field.message.insertAfter(field.element);
        }

        if (field.type === 'checkbox') {
          const validateHandler = (e) => {
            field.change = true
            this.validate([field]) 
          }
          if (field.options.onClick) {
            let f = field.options.onClick
            let handler = (e) => {
              f(e, validateHandler, field)
            }
            field.element.addEventListener('click', handler);
          } else {
            field.element.addEventListener('change', validateHandler);
          }
        } else {
          field.element.addEventListener('blur', (e) => this.validate([field]) );
          field.element.addEventListener('change', (e) => field.change = true);
        }
        fieldsSort.push(field);
      }
    }
    this.fields = fieldsSort;
  }

  showMessage(field){
    field.message.removeClass(field.options.messageAnimHideClass);
    field.message.removeClass(field.options.validClass);
    field.accentElement.classList.remove(field.options.validClass);
    field.message.addClass(field.options.errorClass);
    field.accentElement.classList.add(field.options.errorClass);
    field.message.addClass(field.options.messageAnimShowClass);
  }

  hideMessage(field){
    field.message.removeClass(field.options.messageAnimShowClass);
    field.message.removeClass(field.options.errorClass);
    field.accentElement.classList.remove(field.options.errorClass);
    field.message.addClass(field.options.validClass);
    field.accentElement.classList.add(field.options.validClass);
    field.message.addClass(field.options.messageAnimHideClass);
  }

  validate(fields = this.fields){
    for ( let field of fields ) {// [ {elements:object, message:'', valid:bool} ]
      let invalid = false;
      if (  field.change === false && field.valid !== undefined  ) continue;

      for ( let setOfRules of Object.entries(this.rules) ) {// setOfRules = [ "name", {rules} ]
        if ( field.element.getAttribute('name') === setOfRules[0] ) {// если есть именованный набор правил сопоставимый с атрибутом 'name'
          let rules = Object.entries(setOfRules[1]);// rules = [ [rule], rule] ]

          for ( let rule of rules ) {// rule = ["required", true] or ["pattern", {…}]  // применение методов
            if (rule[0] === 'options') continue;
            if (invalid) break;
            if ( this.methods[rule[0]]) {// если есть соответствующее правило в this.methods
              if ( typeof rule[1] === 'boolean' ) rule[1] = {value: rule[1]};// если в опциях правило записано кратко - привести в соответствие
              if ( this.methods[rule[0]]( field, rule[1].value, rule[1].message, this ) ) {// если правило валидно
                field.valid = true;
                field.change = false;
              } else {// если правило не валидно
                invalid = true;
                field.valid = false;
                field.change = false;
              }
            } else {
              console.log(`метод ${rule[0]} не задан`);
            }
          };
        }
      }
    }
    let allValid = this.fields.map( (field, i) => {
      return field.valid
    } );
    return allValid.every( (i) => i===true );
  }
}