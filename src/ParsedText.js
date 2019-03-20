import React from 'react';
import { Text } from 'react-native';
import PropTypes from 'prop-types';

import TextExtraction from './lib/TextExtraction';

export const PATTERNS = {
  url: /(https?:\/\/|www\.)[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&\/=]*[-a-zA-Z0-9@:%_\+~#?&\/=])*/i,
  phone: /[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,7}/,
  email: /\S+@\S+\.\S+/,
};

const defaultParseShape = PropTypes.shape({
  ...Text.propTypes,
  type: PropTypes.oneOf(Object.keys(PATTERNS)).isRequired,
});

const customParseShape = PropTypes.shape({
  ...Text.propTypes,
  pattern: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(RegExp)])
    .isRequired,
});

class ParsedText extends React.Component {
  static displayName = 'ParsedText';

  static propTypes = {
    ...Text.propTypes,
    parse: PropTypes.arrayOf(
      PropTypes.oneOfType([defaultParseShape, customParseShape]),
    ),
    childrenProps: PropTypes.shape(Text.propTypes),
  };

  static defaultProps = {
    parse: null,
    childrenProps: {},
  };

  setNativeProps(nativeProps) {
    this._root.setNativeProps(nativeProps);
  }

  getPatterns() {
    return this.props.parse.map(option => {
      const { type, ...patternOption } = option;
      if (type) {
        if (!PATTERNS[type]) {
          throw new Error(`${option.type} is not a supported type`);
        }
        patternOption.pattern = PATTERNS[type];
      }

      return patternOption;
    });
  }

  getParsedText() {
    if (!this.props.parse) {
      return this.props.children;
    }
    if (typeof this.props.children !== 'string') {
      return this.props.children;
    }

    const textExtraction = new TextExtraction(
      this.props.children,
      this.getPatterns(),
    );

    return textExtraction.parse().map((props, index) => {
      return (
        <Text
          key={`parsedText-${index}`}
          {...this.props.childrenProps}
          {...props}
        />
      );
    });
  }

  render() {
    // Discard custom props before passing remainder to Text
    const { parse, childrenProps, ...remainder } = { ...this.props };

    return (
      <Text ref={ref => (this._root = ref)} {...remainder}>
        {this.getParsedText()}
      </Text>
    );
  }
}

export default ParsedText;
