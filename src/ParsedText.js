import React from 'react';
import ReactNative from 'react-native';
import PropTypes from 'prop-types';

import TextExtraction from './lib/TextExtraction';

const PATTERNS = {
  url: /(https?:\/\/|www\.)[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&\/\/=]*)/i,
  phone: /[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,7}/,
  email: /\S+@\S+\.\S+/,
};

const defaultParseShape = PropTypes.shape({
  ...ReactNative.Text.propTypes,
  type: PropTypes.oneOf(Object.keys(PATTERNS)).isRequired,
});

const customParseShape = PropTypes.shape({
  ...ReactNative.Text.propTypes,
  pattern: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(RegExp)]).isRequired,
});

class ParsedText extends React.Component {

  static displayName = 'ParsedText';

  static propTypes = {
    ...ReactNative.Text.propTypes,
    parse: PropTypes.arrayOf(
      PropTypes.oneOfType([defaultParseShape, customParseShape]),
    ),
    childrenProps: PropTypes.shape(ReactNative.Text.propTypes),
  };

  static defaultProps = {
    parse: null,
    childrenProps: {},
  };

  setNativeProps(nativeProps) {
    this._root.setNativeProps(nativeProps);
  }

  getPatterns() {
    return this.props.parse.map((option) => {
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

    const textExtraction = new TextExtraction(this.props.children, this.getPatterns());
    if (ReactNative.Platform.OS === 'android') {
      return this.androidParsedText(textExtraction);
    }
    return this.iosParsedText(textExtraction);
  }

  /**
   * Parse text for ios devices
   * @param textExtraction
   */
  iosParsedText = (textExtraction) => {
    return textExtraction.parse().map((props, index) => {
      return (
        <ReactNative.Text
          key={`parsedText-${index}`}
          {...this.props.childrenProps}
          {...props}
        />
      );
    });
  }

  /**
   * Parse text for android devices
   * @returns {any[]}
   * @param textExtraction
   */
  androidParsedText = (textExtraction) => {
    const parts = [];
    let row = [];
    textExtraction.parse().map((props, index) => {
        if (ReactNative.Platform.OS === 'android') {
          const { style: parentStyle } = this.props;
          const { style, ...remainder } = props;
          if (typeof props.children === 'string') {
            props.children = props.children.replace(/\n/ig, '');
          }
          if (style && style.textAlign === 'center') {
            parts.push({ wrapType: 'Text', items: row });
            row = [];
            row.push({
              wrapType: 'View',
              el: (<ReactNative.Text
                key={`parsedText-${index}-view`}
                {...this.props.childrenProps}
                {...props}
                style={[parentStyle, style]}
              />)
            });
            parts.push({ wrapType: 'View', items: row });
            row = [];
          } else {
            row.push({
              wrapType: 'Text',
              el: (<ReactNative.Text
                key={`parsedText-${index}-text`}
                {...this.props.childrenProps}
                {...props}
                style={[parentStyle, style]}
              />)
            });
          }
        }
      }
    );
    if (row.length) {
      parts.push({ wrapType: row[0].wrapType, items: row });
    }
    return parts.map((part, index) => {
      if (part.wrapType === 'Text') {
        return (<ReactNative.Text key={`wrap_${index}`}>
          {part.items.map((item) => (item.el))}
        </ReactNative.Text>);
      }
      return (<ReactNative.View key={`wrap_${index}`}>{part.items.map((item) => (item.el))}</ReactNative.View>);
    });
  }

  render() {
    if (ReactNative.Platform.OS === 'android') {
      return (
        <ReactNative.View
          ref={ref => this._root = ref}
        >
          {this.getParsedText()}
        </ReactNative.View>
      );
    }
    return (
      <ReactNative.Text
        ref={ref => this._root = ref}
        {...this.props}
      >
        {this.getParsedText()}
      </ReactNative.Text>
    );
  }

}

export default ParsedText;
