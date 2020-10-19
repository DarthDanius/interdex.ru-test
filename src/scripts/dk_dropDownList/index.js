import { animHandler, replaceClass, wait, log } from '../dk_lib'
import SimpleBar from 'simplebar';

export class DropDownList { // use jquery

  /* 
  <div class="drop-down">
    <button class="drop-down__button">Даты</button>
    <div class="drop-down__list-container-position">
      <div class="drop-down__list-container-scroll">
        <dl class="drop-down__list">
          <dt class="drop-down__title">title</dt>
          <dd class="drop-down__item">text</dd>
        </dl>
      </div>
    </div>
  </div>
  */


  constructor($container, options={}){

    if (!$container.jquery) $container = $($container);

    // this.elements = [
    //   {
    //     $input,
    //     $label,
    //     $container,
    //     $button,
    //     $listContainerPosition,
    //     $listContainerScroll,
    //     $list,
    //     status = 'close' | 'open' | 'changes'
    //   }
    // ]

    this.elements = []
    this.optionsDefault = {
      class_container_open: 'drop-down_open',
      class_container_scroll: 'drop-down_scroll',
      class_container: 'drop-down',
      class_button: 'drop-down__button',
      class_list_container_position: 'drop-down__list-container-position',
      class_list_container_scroll: 'drop-down__list-container-scroll',
      class_list: 'drop-down__list',
      class_title: 'drop-down__title',
      class_item: 'drop-down__item',
      class_hide: 'hide',
      text: 'заглавие',
      $expandWidthToElement: null,
      $expandHeightToElement: null,
    }
    this.status = '';
  
    this.options = { ...this.optionsDefault, ...options };

    if ($container[0].tagName.toLowerCase() !== "select") {
      let $elements = $("select", $container);
      if (!$elements.length) {
        log('элементы select не найдены', 'DropDownList: init')
        return false
      } else {
        $elements.each( (index, $element) => this.elements.push(pushElement($element)) )
      }
    } else {
      this.elements.push(pushElement($container))
    }

    this.elements.forEach( ( item, index ) => {
      item.$input.addClass('hide');
      item.$label.addClass('hide');
      item.index = index;
      createDropDownList(item, this.options, this).insertAfter(item.$input)
    })

    // const toggleClass = async (e) => {
    async function toggleClass(e) {
      if (this.status !== 'changes'){
        // закрыть открытые
        if (this.status === 'open') {
          let openItem = this.elements.find( item => {
            return item.status === 'open'
          })
          if (openItem && openItem.$button[0] !== e.target) {
            await animate(openItem, this.options, this)
          }
        }
        // открыть, если кнопка
        if (e.target.classList.contains(`${this.options.class_button}`)) {
          let currentItem = this.elements.find( (item) => {
            return item.$button[0] === e.target
          })
          await animate(currentItem, this.options, this)
        }
      }
    }
    toggleClass = toggleClass.bind(this)

    $(document).click( e => toggleClass(e) )

    // wait( () => {
    //   $(document).click( async e => toggleClass(e) )
    // })

    function pushElement(input) {
      const $input = $(input);
      const elId = $input.attr('id')

      let $label = $input.siblings(`[for="${elId}"]`).eq(0)

      if (!$label.length)  {
        const elParent = $input.parent()
        if (elParent[0].tagName.toLowerCase === 'label') {
          $label = elParent;
        }
      }

      if (!$label.length) {
        $label = $(`[for="${elId}"]`).eq(0);
      }

      if (!$label.length) {
        $label = null;
      }

      return {
        $input,
        $label
      }
    }

    function getPosToParent($children, $parent) {
      let posElem = $children.offset()
      let posParent = $parent.offset();
      return {
        top: posParent.top - posElem.top,
        left: posParent.left - posElem.left,
        parentWidth: $parent.width()
      }
    }

    async function animate(dropList, options, dropListObject) {
      // 1. сделать список видимым
      // 2. растянуть список и кнопку по ширине
      // 3. развернуть список
      const {$container, $listContainerPosition, $list, $button, simplebar} = {...dropList}
      let maxHeight = "";
      if (options.expandHeightToElement.length) {
        maxHeight = getPosToParent($container, options.expandHeightToElement).top
      }
      let {left, parentWidth:width} = getPosToParent($container, options.expandWidthToElement)
      let animWidth = ( left !== 0 || width !== $container.outerWidth() )

      if ( !$container.hasClass(`${options.class_container_open}`) ) {
        $container.addClass(`${options.class_container_open}`);
        dropListObject.status = dropList.status = 'changes';

        // z-index
        $button.css({'z-index': +$button.css('z-index') + 1})
        $listContainerPosition.css({'z-index': +$listContainerPosition.css('z-index') + 1})
        // позиция и ширина
        if (animWidth) {
          // позиция и ширина кнопки
          await animHandler( $button, ($el)=>$el.css({left, width}) );
          // позиция и ширина списка
          $listContainerPosition.css({left, width})
        }
        // прозрачность
        $list.css('opacity', 1)
        // высота
        const height = +$list.outerHeight() + +$button.outerHeight() + 30
        await animHandler( $listContainerPosition, ($el)=>$el.css(
          {
            'height': height,
            'max-height': maxHeight,
            'padding-bottom': 30,
            'padding-top': $button.outerHeight(),
          }
        ));
        // скроллирование
        if (height > maxHeight) $container.addClass(`${options.class_container_scroll}`)
        dropListObject.status = dropList.status = 'open';
      } else {
        dropListObject.status = dropList.status = 'changes';
        // dropListObject.status
        // z-index
        $button.css({'z-index': ''})
        $listContainerPosition.css({'z-index': ''})
        // скроллирование
        $container.removeClass(`${options.class_container_scroll}`)
        // прозрачность
        $list.css('opacity', '')
        // высота
        await animHandler( $listContainerPosition, ($el)=>$el.css( {'height': '','padding-bottom': ''} ) );
        // позиция и ширина
        if (animWidth) {
          // позиция и ширина списка
          $listContainerPosition.css({'left': '', 'width': ''})
          // позиция и ширина кнопки
          await animHandler( $button, ()=>$button.css({'left': '', 'width': ''}) );
        }
        $container.removeClass(`${options.class_container_open}`);
        dropListObject.status = dropList.status = 'close';
      }
      return dropList.status
    }

    function createDropDownList(dropList, options, dropListObject) {
      const $container = $(`<div class="${options.class_container}"></div>`)
      const labelText = (dropList.$label) ? dropList.$label.text() : options.text
      const $button = $(`<button class="${options.class_button}">${labelText}</button>`)
      const $listContainerPosition = $(`<div class="${options.class_list_container_position}"></div>`)
      const $listContainerScroll = $(`<div class="${options.class_list_container_scroll}"></div>`)
      const listType = ( $('optgroup', dropList.$input).length ) ? 'dl' : 'ul';
      const $list = $(`<${listType} class="${options.class_list}"></${listType}>`)

      dropList.$input.children().each( (index, item) => {
        let $el = null
        if (listType === 'dl') {
          if ( item.tagName.toLowerCase() === 'optgroup' ) {
            $el = $(`<dt class="${options.class_title}">${item.getAttribute('label')}</dt>`)

            $(item).children().each( (index, item) => {
              $el = $el.add($(`<dd class="${options.class_item}">${item.textContent.trim()}</dd>`))
            })

          } else {
            $el = $(`<dd class="${options.class_item}">${item.textContent.trim()}</dd>`)
          }
        }
        else {
          $el = $(`<li class="${options.class_item}">${item.textContent.trim()}</li>`)
        }
        $list.append($el)
      })
      $listContainerScroll.append($list)
      $listContainerPosition.append($listContainerScroll)
      $container.append($button)
      $container.append($listContainerPosition)

      dropList.$container = $container
      dropList.$button = $button
      dropList.$listContainerPosition = $listContainerPosition
      dropList.$listContainerScroll = $listContainerScroll
      dropList.$list = $list

      return $container
    }
  }
}