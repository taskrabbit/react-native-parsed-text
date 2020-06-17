/**
 * If you want to provide a custom regexp, this is the configuration to use.
 * -- For historical reasons, all regexps are processed as if they have the global flag set.
 * -- Use the nonExhaustiveModeMaxMatchCount property to match a limited number of matches.
 * Note: any additional keys/props are permitted, and will be returned as-is!
 * @typedef {Object} CustomParseShape
 * @property {RegExp} pattern
 * @property {Function} [renderText] arbitrary function to rewrite the matched string into something else
 * @property {Function} [onPress]
 * @property {Function} [onLongPress]
 */
/**
 * Class to encapsulate the business logic of converting text into matches & props
 */
class TextExtraction {
  /**
   * @param {String} text - Text to be parsed
   * @param {CustomParseShape[]} patterns - Patterns to be used when parsed,
   *                                 any extra attributes, will be returned from parse()
   */
  constructor(text, patterns) {
    this.text = text;
    this.patterns = patterns || [];
  }

  /**
   * Returns parts of the text with their own props
   * @public
   * @return {Object[]} - props for all the parts of the text
   */
  parse() {
    let parsedTexts = [{ children: this.text }];
    this.patterns.forEach((pattern) => {
      let newParts = [];

      parsedTexts.forEach((parsedText) => {
        // Only allow for now one parsing
        if (parsedText._matched) {
          newParts.push(parsedText);

          return;
        }

        let parts = [];
        let textLeft = parsedText.children;
        let indexOfMatchedString = 0;

        /** @type {RegExpExecArray} */
        let matches;
        // Global RegExps are stateful, this makes it start at 0 if reused
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/exec
        pattern.pattern.lastIndex = 0;
        while (textLeft && (matches = pattern.pattern.exec(textLeft))) {
          let previousText = textLeft.substr(0, matches.index);
          indexOfMatchedString = matches.index;

          parts.push({ children: previousText });

          parts.push(
            this.getMatchedPart(
              pattern,
              matches[0],
              matches,
              indexOfMatchedString,
            ),
          );

          textLeft = textLeft.substr(matches.index + matches[0].length);
          indexOfMatchedString += matches[0].length - 1;
          // Global RegExps are stateful, this makes it operate on the "remainder" of the string
          pattern.pattern.lastIndex = 0;
        }

        parts.push({ children: textLeft });

        newParts.push(...parts);
      });

      parsedTexts = newParts;
    });

    // Remove _matched key.
    parsedTexts.forEach((parsedText) => delete parsedText._matched);

    return parsedTexts.filter((t) => !!t.children);
  }

  // private

  /**
   * @protected
   * @param {ParseShape} matchedPattern - pattern configuration of the pattern used to match the text
   * @param {String} text - Text matching the pattern
   * @param {String[]} matches - Result of the RegExp.exec
   * @param {Integer} index - Index of the matched string in the whole string
   * @return {Object} props for the matched text
   */
  getMatchedPart(matchedPattern, text, matches, index) {
    let props = {};

    Object.keys(matchedPattern).forEach((key) => {
      if (key === 'pattern' || key === 'renderText') {
        return;
      }

      if (typeof matchedPattern[key] === 'function') {
        // Support onPress / onLongPress functions
        props[key] = () => matchedPattern[key](text, index);
      } else {
        // Set a prop with an arbitrary name to the value in the match-config
        props[key] = matchedPattern[key];
      }
    });

    let children = text;
    if (
      matchedPattern.renderText &&
      typeof matchedPattern.renderText === 'function'
    ) {
      children = matchedPattern.renderText(text, matches);
    }

    return {
      ...props,
      children: children,
      _matched: true,
    };
  }
}

export default TextExtraction;
