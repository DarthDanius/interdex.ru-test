export async function animHandler($el, ...cls) {// animHandler( element || $element, 'className' || ['className'] || function)
  return new Promise((resolve) => {
    const el = ($el.jquery === undefined) ? $el : $el[0]
    el.onanimationend = (e) => resolve(e);
    el.ontransitionend = (e) => resolve(e);
    if (typeof cls[0] === 'function') {
      cls[0]($el);
    } else {
      cls.forEach( (i)=>{el.classList.add(i)});
    }
    setTimeout(()=> { return resolve(true) }, 5000)
  })
};

export function replaceClass(el, replaceableClass, replacementClass, revers=false) {
  if (!el) return
  if (el.jquery) el = el[0];
  if (revers) [replaceableClass, replacementClass] = [replacementClass, replaceableClass]
  if (replaceableClass !== '') el.classList.remove(replaceableClass);
  if (replacementClass !== '') el.classList.add(replacementClass);
}
let name
export function setEventDelay(arg, f, ms, init=false, ...args) { // задержка для функции. init = true выполнить функцию до установки таймера.
  let timer = null;
  function eventToArgs(e, args){
    const argsLength = args.length
    if (argsLength <= args.length) {
      args[0] = e
    } else {
      args.unshift(e)
    }
  }
  function executor(e) {
    console.log(f.name + e.type)

    if (!timer) {
      if (init) {
        timer = setTimeout(() => {
          clearTimeout(timer);
          timer = null;
        }, ms, e);
        eventToArgs(e, args)
        f(arg, ...args);
      }
      else {
        timer = setTimeout(
          function() {
            clearTimeout(timer);
            timer = null;
            eventToArgs(e, args)
            f(arg, ...args);
          },
          ms,
          e
        )
      }
    }
  }

  return executor
}

export function setDelay(response, ms) {
  return new Promise((resolve) => {
    setTimeout( (r) => resolve(r), ms, response);
  })
};

export function wait(f, ...args){
  let wait;
  return async function() {
    if (wait === undefined) wait = false
    if (!wait) {
      wait = true
      await f(...args)
      wait = false
    }
  }
}

export function log(content, message = null) {
  if (!message) message = String(content);
  console.info(message)
  console.log(content)
}