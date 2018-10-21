(function () {
	'use strict';

	function createCommonjsModule(fn, module) {
		return module = { exports: {} }, fn(module, module.exports), module.exports;
	}

	var smoothscroll = createCommonjsModule(function (module, exports) {
	/* smoothscroll v0.4.0 - 2018 - Dustan Kasten, Jeremias Menichelli - MIT License */
	(function () {

	  // polyfill
	  function polyfill() {
	    // aliases
	    var w = window;
	    var d = document;

	    // return if scroll behavior is supported and polyfill is not forced
	    if (
	      'scrollBehavior' in d.documentElement.style &&
	      w.__forceSmoothScrollPolyfill__ !== true
	    ) {
	      return;
	    }

	    // globals
	    var Element = w.HTMLElement || w.Element;
	    var SCROLL_TIME = 468;

	    // object gathering original scroll methods
	    var original = {
	      scroll: w.scroll || w.scrollTo,
	      scrollBy: w.scrollBy,
	      elementScroll: Element.prototype.scroll || scrollElement,
	      scrollIntoView: Element.prototype.scrollIntoView
	    };

	    // define timing method
	    var now =
	      w.performance && w.performance.now
	        ? w.performance.now.bind(w.performance)
	        : Date.now;

	    /**
	     * indicates if a the current browser is made by Microsoft
	     * @method isMicrosoftBrowser
	     * @param {String} userAgent
	     * @returns {Boolean}
	     */
	    function isMicrosoftBrowser(userAgent) {
	      var userAgentPatterns = ['MSIE ', 'Trident/', 'Edge/'];

	      return new RegExp(userAgentPatterns.join('|')).test(userAgent);
	    }

	    /*
	     * IE has rounding bug rounding down clientHeight and clientWidth and
	     * rounding up scrollHeight and scrollWidth causing false positives
	     * on hasScrollableSpace
	     */
	    var ROUNDING_TOLERANCE = isMicrosoftBrowser(w.navigator.userAgent) ? 1 : 0;

	    /**
	     * changes scroll position inside an element
	     * @method scrollElement
	     * @param {Number} x
	     * @param {Number} y
	     * @returns {undefined}
	     */
	    function scrollElement(x, y) {
	      this.scrollLeft = x;
	      this.scrollTop = y;
	    }

	    /**
	     * returns result of applying ease math function to a number
	     * @method ease
	     * @param {Number} k
	     * @returns {Number}
	     */
	    function ease(k) {
	      return 0.5 * (1 - Math.cos(Math.PI * k));
	    }

	    /**
	     * indicates if a smooth behavior should be applied
	     * @method shouldBailOut
	     * @param {Number|Object} firstArg
	     * @returns {Boolean}
	     */
	    function shouldBailOut(firstArg) {
	      if (
	        firstArg === null ||
	        typeof firstArg !== 'object' ||
	        firstArg.behavior === undefined ||
	        firstArg.behavior === 'auto' ||
	        firstArg.behavior === 'instant'
	      ) {
	        // first argument is not an object/null
	        // or behavior is auto, instant or undefined
	        return true;
	      }

	      if (typeof firstArg === 'object' && firstArg.behavior === 'smooth') {
	        // first argument is an object and behavior is smooth
	        return false;
	      }

	      // throw error when behavior is not supported
	      throw new TypeError(
	        'behavior member of ScrollOptions ' +
	          firstArg.behavior +
	          ' is not a valid value for enumeration ScrollBehavior.'
	      );
	    }

	    /**
	     * indicates if an element has scrollable space in the provided axis
	     * @method hasScrollableSpace
	     * @param {Node} el
	     * @param {String} axis
	     * @returns {Boolean}
	     */
	    function hasScrollableSpace(el, axis) {
	      if (axis === 'Y') {
	        return el.clientHeight + ROUNDING_TOLERANCE < el.scrollHeight;
	      }

	      if (axis === 'X') {
	        return el.clientWidth + ROUNDING_TOLERANCE < el.scrollWidth;
	      }
	    }

	    /**
	     * indicates if an element has a scrollable overflow property in the axis
	     * @method canOverflow
	     * @param {Node} el
	     * @param {String} axis
	     * @returns {Boolean}
	     */
	    function canOverflow(el, axis) {
	      var overflowValue = w.getComputedStyle(el, null)['overflow' + axis];

	      return overflowValue === 'auto' || overflowValue === 'scroll';
	    }

	    /**
	     * indicates if an element can be scrolled in either axis
	     * @method isScrollable
	     * @param {Node} el
	     * @param {String} axis
	     * @returns {Boolean}
	     */
	    function isScrollable(el) {
	      var isScrollableY = hasScrollableSpace(el, 'Y') && canOverflow(el, 'Y');
	      var isScrollableX = hasScrollableSpace(el, 'X') && canOverflow(el, 'X');

	      return isScrollableY || isScrollableX;
	    }

	    /**
	     * finds scrollable parent of an element
	     * @method findScrollableParent
	     * @param {Node} el
	     * @returns {Node} el
	     */
	    function findScrollableParent(el) {
	      var isBody;

	      do {
	        el = el.parentNode;

	        isBody = el === d.body;
	      } while (isBody === false && isScrollable(el) === false);

	      isBody = null;

	      return el;
	    }

	    /**
	     * self invoked function that, given a context, steps through scrolling
	     * @method step
	     * @param {Object} context
	     * @returns {undefined}
	     */
	    function step(context) {
	      var time = now();
	      var value;
	      var currentX;
	      var currentY;
	      var elapsed = (time - context.startTime) / SCROLL_TIME;

	      // avoid elapsed times higher than one
	      elapsed = elapsed > 1 ? 1 : elapsed;

	      // apply easing to elapsed time
	      value = ease(elapsed);

	      currentX = context.startX + (context.x - context.startX) * value;
	      currentY = context.startY + (context.y - context.startY) * value;

	      context.method.call(context.scrollable, currentX, currentY);

	      // scroll more if we have not reached our destination
	      if (currentX !== context.x || currentY !== context.y) {
	        w.requestAnimationFrame(step.bind(w, context));
	      }
	    }

	    /**
	     * scrolls window or element with a smooth behavior
	     * @method smoothScroll
	     * @param {Object|Node} el
	     * @param {Number} x
	     * @param {Number} y
	     * @returns {undefined}
	     */
	    function smoothScroll(el, x, y) {
	      var scrollable;
	      var startX;
	      var startY;
	      var method;
	      var startTime = now();

	      // define scroll context
	      if (el === d.body) {
	        scrollable = w;
	        startX = w.scrollX || w.pageXOffset;
	        startY = w.scrollY || w.pageYOffset;
	        method = original.scroll;
	      } else {
	        scrollable = el;
	        startX = el.scrollLeft;
	        startY = el.scrollTop;
	        method = scrollElement;
	      }

	      // scroll looping over a frame
	      step({
	        scrollable: scrollable,
	        method: method,
	        startTime: startTime,
	        startX: startX,
	        startY: startY,
	        x: x,
	        y: y
	      });
	    }

	    // ORIGINAL METHODS OVERRIDES
	    // w.scroll and w.scrollTo
	    w.scroll = w.scrollTo = function() {
	      // avoid action when no arguments are passed
	      if (arguments[0] === undefined) {
	        return;
	      }

	      // avoid smooth behavior if not required
	      if (shouldBailOut(arguments[0]) === true) {
	        original.scroll.call(
	          w,
	          arguments[0].left !== undefined
	            ? arguments[0].left
	            : typeof arguments[0] !== 'object'
	              ? arguments[0]
	              : w.scrollX || w.pageXOffset,
	          // use top prop, second argument if present or fallback to scrollY
	          arguments[0].top !== undefined
	            ? arguments[0].top
	            : arguments[1] !== undefined
	              ? arguments[1]
	              : w.scrollY || w.pageYOffset
	        );

	        return;
	      }

	      // LET THE SMOOTHNESS BEGIN!
	      smoothScroll.call(
	        w,
	        d.body,
	        arguments[0].left !== undefined
	          ? ~~arguments[0].left
	          : w.scrollX || w.pageXOffset,
	        arguments[0].top !== undefined
	          ? ~~arguments[0].top
	          : w.scrollY || w.pageYOffset
	      );
	    };

	    // w.scrollBy
	    w.scrollBy = function() {
	      // avoid action when no arguments are passed
	      if (arguments[0] === undefined) {
	        return;
	      }

	      // avoid smooth behavior if not required
	      if (shouldBailOut(arguments[0])) {
	        original.scrollBy.call(
	          w,
	          arguments[0].left !== undefined
	            ? arguments[0].left
	            : typeof arguments[0] !== 'object' ? arguments[0] : 0,
	          arguments[0].top !== undefined
	            ? arguments[0].top
	            : arguments[1] !== undefined ? arguments[1] : 0
	        );

	        return;
	      }

	      // LET THE SMOOTHNESS BEGIN!
	      smoothScroll.call(
	        w,
	        d.body,
	        ~~arguments[0].left + (w.scrollX || w.pageXOffset),
	        ~~arguments[0].top + (w.scrollY || w.pageYOffset)
	      );
	    };

	    // Element.prototype.scroll and Element.prototype.scrollTo
	    Element.prototype.scroll = Element.prototype.scrollTo = function() {
	      // avoid action when no arguments are passed
	      if (arguments[0] === undefined) {
	        return;
	      }

	      // avoid smooth behavior if not required
	      if (shouldBailOut(arguments[0]) === true) {
	        // if one number is passed, throw error to match Firefox implementation
	        if (typeof arguments[0] === 'number' && arguments[1] === undefined) {
	          throw new SyntaxError('Value could not be converted');
	        }

	        original.elementScroll.call(
	          this,
	          // use left prop, first number argument or fallback to scrollLeft
	          arguments[0].left !== undefined
	            ? ~~arguments[0].left
	            : typeof arguments[0] !== 'object' ? ~~arguments[0] : this.scrollLeft,
	          // use top prop, second argument or fallback to scrollTop
	          arguments[0].top !== undefined
	            ? ~~arguments[0].top
	            : arguments[1] !== undefined ? ~~arguments[1] : this.scrollTop
	        );

	        return;
	      }

	      var left = arguments[0].left;
	      var top = arguments[0].top;

	      // LET THE SMOOTHNESS BEGIN!
	      smoothScroll.call(
	        this,
	        this,
	        typeof left === 'undefined' ? this.scrollLeft : ~~left,
	        typeof top === 'undefined' ? this.scrollTop : ~~top
	      );
	    };

	    // Element.prototype.scrollBy
	    Element.prototype.scrollBy = function() {
	      // avoid action when no arguments are passed
	      if (arguments[0] === undefined) {
	        return;
	      }

	      // avoid smooth behavior if not required
	      if (shouldBailOut(arguments[0]) === true) {
	        original.elementScroll.call(
	          this,
	          arguments[0].left !== undefined
	            ? ~~arguments[0].left + this.scrollLeft
	            : ~~arguments[0] + this.scrollLeft,
	          arguments[0].top !== undefined
	            ? ~~arguments[0].top + this.scrollTop
	            : ~~arguments[1] + this.scrollTop
	        );

	        return;
	      }

	      this.scroll({
	        left: ~~arguments[0].left + this.scrollLeft,
	        top: ~~arguments[0].top + this.scrollTop,
	        behavior: arguments[0].behavior
	      });
	    };

	    // Element.prototype.scrollIntoView
	    Element.prototype.scrollIntoView = function() {
	      // avoid smooth behavior if not required
	      if (shouldBailOut(arguments[0]) === true) {
	        original.scrollIntoView.call(
	          this,
	          arguments[0] === undefined ? true : arguments[0]
	        );

	        return;
	      }

	      // LET THE SMOOTHNESS BEGIN!
	      var scrollableParent = findScrollableParent(this);
	      var parentRects = scrollableParent.getBoundingClientRect();
	      var clientRects = this.getBoundingClientRect();

	      if (scrollableParent !== d.body) {
	        // reveal element inside parent
	        smoothScroll.call(
	          this,
	          scrollableParent,
	          scrollableParent.scrollLeft + clientRects.left - parentRects.left,
	          scrollableParent.scrollTop + clientRects.top - parentRects.top
	        );

	        // reveal parent in viewport unless is fixed
	        if (w.getComputedStyle(scrollableParent).position !== 'fixed') {
	          w.scrollBy({
	            left: parentRects.left,
	            top: parentRects.top,
	            behavior: 'smooth'
	          });
	        }
	      } else {
	        // reveal element in viewport
	        w.scrollBy({
	          left: clientRects.left,
	          top: clientRects.top,
	          behavior: 'smooth'
	        });
	      }
	    };
	  }

	  {
	    // commonjs
	    module.exports = { polyfill: polyfill };
	  }

	}());
	});
	var smoothscroll_1 = smoothscroll.polyfill;

	/**
	 * addStyleFromObj - Adds inline-style to a given HTML Element from the given
	 *  style Object.
	 *
	 * @param {Element} $el   The HTML Element to which the styles will be added.
	 * @param {object} styleObj The object which contains the styles. Must be
	 *  formatted in the format { 'property' : 'value' } where 'property' is the
	 *  CSS property and 'value' is the value to which it should be set.
	 *  E.g. { color : 'purple' } will set $el's color to purple.
	 *
	 * @returns {Element} If the given styleObj is not an object or is null or
	 *  undefined, will return false. If styles are successfully added, returns the
	 *  HTML Element.
	 */
	function addStyleFromObj($el, styleObj) {
	  if (
	    styleObj === null
	    || styleObj === undefined
	    || (!(typeof styleObj === 'object'))
	  ) { return false; }
	  let styleString = '';
	  Object.keys(styleObj).forEach((prop) => {
	    styleString += `${prop}: ${styleObj[prop]};`;
	  });
	  $el.setAttribute('style', styleString);
	  return $el;
	}

	/**
	 * addClasses - Add classes to an HTML Element.
	 *
	 * @param {Element} $el  The HTML Element to which the classes will be added.
	 * @param {string || Array} klasses A single string or an array of strings
	 *  representing the classes to be added to $el.
	 *
	 * @returns {Element} The original $el with classes attached.
	 */
	function addClasses($el, klasses) {
	  if (!klasses) return $el;
	  if (Array.isArray(klasses)) {
	    klasses.forEach((klass) => {
	      if (typeof klass === 'string' && klass.length > 0) $el.classList.add(klass);
	    });
	  } else {
	    $el.classList.add(klasses);
	  }
	  return $el;
	}

	/**
	 * generateElement - Quickly generates an HTML element with given tagName,
	 *  classes, and id.
	 *
	 * @param {string} [tagName=div] The tag name to use for the element.
	 * @param {string|string[]}  [klasses=[]]  A single string or an array of
	 *  strings representing the classes to be added to the element.
	 * @param {object} [options={}] An optional object containing attributes to be
	 *  added to the element. Each key must be a valid HTML attribute and the value
	 *  must be a string.
	 *
	 * @returns {Element} The newly-created HTML element.
	 */
	function generateElement(tagName = 'div', options = {}) {
	  const $el = document.createElement(tagName);
	  if (options && typeof options === 'object') {
	    Object.keys(options).forEach((attr) => {
	      if (attr === 'style') {
	        addStyleFromObj($el, options[attr]);
	      } else if (attr === 'klasses') {
	        addClasses($el, options[attr]);
	      } else if (attr === 'textContent') {
	        $el.textContent = options[attr];
	      } else {
	        $el.setAttribute(attr, options[attr]);
	      }
	      return null;
	    });
	  }
	  return $el;
	}
	/**
	 * generateButton - Quickly generate a button element
	 *
	 * @param {string} [value=Button] Description
	 * @param {array}  [klasses=[]]   Description
	 * @param {string} [id=]          Description
	 *
	 * @returns {type} Description
	 */
	function generateButton(
	  value = 'Button',
	  options = {},
	) {
	  const $btn = generateElement('button', options);
	  $btn.innerHTML = value;
	  return $btn;
	}

	const hoverCardClass = 'hover-card';
	const baseClass = 'r_menu';
	const ctnClass = `${baseClass}__ctn`;
	const navClass = `${baseClass}__nav`;
	const hiddenClass = `${navClass}--hidden`;
	const btnClass = `${baseClass}__button`;
	const targetClass = 'menuTarget';

	/**
	 * HeadingMenu - A HeadingMenu finds all elements with the class "menuTarget"
	 *  and generates links to them.
	 *
	 */
	const HeadingMenu = {

	  /**
	   * init - Initialize the menu.
	   *
	   * @returns {HeadingMenu} Returns the new Menu.
	   */
	  init() {
	    this.ctn = generateElement('div', { klasses: ctnClass });
	    this.toggleBtn = generateButton('Menu', { klasses: btnClass });
	    this.toggleBtn.addEventListener('click', this.toggleDisplay.bind(this));
	    this.ctn.appendChild(this.toggleBtn);

	    this.nav = generateElement('nav', { klasses: [navClass, hiddenClass] });
	    this.ctn.appendChild(this.nav);

	    this.links = this.generateLinks();
	    document.body.appendChild(this.ctn);
	    this.resizeCtn();
	    document.addEventListener('click', (e) => {
	      if (!this.ctn.contains(e.target)) this.hide();
	    });
	  },

	  /**
	   * resizeCtn - Resize the container based on its contents.
	   *
	   */
	  resizeCtn() {
	    const btnRect = this.toggleBtn.getBoundingClientRect();
	    if (this.ctn.classList.contains(hoverCardClass)) {
	      this.ctn.style.maxWidth = `${window.innerWidth}px`;
	      this.ctn.style.maxHeight = `${window.innerHeight}px`;
	      this.ctn.style.paddingRight = `${btnRect.width * 1.5}px`;
	    } else {
	      this.ctn.style.maxWidth = `${btnRect.width + 10}px`;
	      this.ctn.style.maxHeight = `${btnRect.height + 10}px`;
	    }
	  },

	  /**
	   * generateLinks - Find
	   *
	   * @returns {type} Description
	   */
	  generateLinks() {
	    this.links = [];
	    const targets = document.querySelectorAll(`.${targetClass}`);
	    targets.forEach((target) => {
	      const link = generateElement(
	        'a',
	        {
	          href: `#${target.id}`,
	          textContent: target.textContent,
	        },
	      );
	      link.addEventListener('click', (e) => {
	        e.preventDefault();
	        this.hide.call(this);
	        target.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
	      });
	      this.links.push(link);
	      this.nav.appendChild(link);
	    });
	  },

	  /**
	   * hide - Hide the menu.
	   *
	   */
	  hide() {
	    if (this.ctn.classList.contains(hoverCardClass)) {
	      this.ctn.classList.remove(hoverCardClass);
	      this.nav.classList.add(hiddenClass);
	      this.toggleBtn.innerHTML = 'Menu';
	      this.resizeCtn();
	    }
	  },

	  /**
	   * display - Display the menu.
	   *
	   */
	  display() {
	    if (this.nav.classList.contains(hiddenClass)) {
	      this.ctn.classList.add(hoverCardClass);
	      this.nav.classList.remove(hiddenClass);
	      this.toggleBtn.innerHTML = '&times;';
	      this.resizeCtn();
	    }
	  },

	  /**
	   * toggleDisplay - Hides or shows the menu.
	   *
	   */
	  toggleDisplay() {
	    if (this.nav.classList.contains(hiddenClass)) {
	      this.display();
	    } else {
	      this.hide();
	    }
	  },
	};

	document.addEventListener('DOMContentLoaded', () => {
	  smoothscroll.polyfill();
	  const menu = Object.create(HeadingMenu);
	  menu.init();
	});

}());
//# sourceMappingURL=rbrandlib.js.map
