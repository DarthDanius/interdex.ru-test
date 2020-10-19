export class Scroll {// use jquery

  constructor() {
    const $body = $('body');
    const slidebarWidth = window.innerWidth - $body.width();
    const $slidebarCap = $('<div class="system__slidebar">');
    this.visible = true;// состояние системного scrollbar
    this.fullScreenElement = new Set()
    
    $slidebarCap.css(
      {'width': slidebarWidth,
      'right': -slidebarWidth,
      'position': 'absolute',
      'height': '100vh',
      'top': 0
    });

    this.hide = function() {// спрятать системный scrollbar
      if (this.visible) {
        this.visible = false;
        let bodyWidthPercent = slidebarWidth / $body.width() * 100

        $body.css({
          'width': `${100 - bodyWidthPercent}%`,
          'overflowY': 'hidden'
        });

        $body.append($slidebarCap);

        this.fullScreenElement.forEach( (el) => {
          if (!el.jquery) el = $(el)
          el.css('padding-right', parseInt(el.css('padding-right')) + `${bodyWidthPercent}%`);
        })

        return true;
      }
    }

    this.show = function() {// показать системный scrollbar
      if (!this.visible) {
        this.visible = true;

        this.fullScreenElement.forEach( (el) => {
          if (!el.jquery) el = $(el)
          el.css('padding-right', '');
        })

        $slidebarCap.remove();

        $body.css({
          'width': '',
          'overflowY': ''
        });

        return true;
      }
    }

    this.add = function(el) {
      this.fullScreenElement.add(el)
    }

    this.delete = function(el) {
      this.fullScreenElement.delete(el)
    }
  }
}
