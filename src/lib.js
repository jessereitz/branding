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
export function addStyleFromObj($el, styleObj) {
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
export function addClasses($el, klasses) {
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
export function generateElement(tagName = 'div', options = {}) {
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
export function generateButton(
  value = 'Button',
  options = {},
) {
  const $btn = generateElement('button', options);
  $btn.innerHTML = value;
  return $btn;
}
