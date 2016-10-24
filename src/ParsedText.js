import React from 'react';
import ReactNative from 'react-native';

import TextExtraction from './lib/TextExtraction';

const PATTERNS = {
  url: /(https?:\/\/|www\.)[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&\/\/=]*)/,
  phone: /[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}/,
  email: /\S+@\S+\.\S+/,
};

const defaultParseShape = React.PropTypes.shape({
  ...ReactNative.Text.propTypes,
  type: React.PropTypes.oneOf(Object.keys(PATTERNS)).isRequired,
});

const customParseShape = React.PropTypes.shape({
  ...ReactNative.Text.propTypes,
  pattern: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.instanceOf(RegExp)]).isRequired,
});

class ParsedText extends React.Component {
  state = {
    measured: false,
    shouldShowReadMore: false,
    showAllText: false,
  };

  static displayName = 'ParsedText';

  static propTypes = {
    ...ReactNative.Text.propTypes,
    parse: React.PropTypes.arrayOf(
      React.PropTypes.oneOfType([defaultParseShape, customParseShape]),
    ),

    /*
      Use for ReadMore...
    */
    numberOfLines: React.PropTypes.number,
    renderRevealedFooter: React.PropTypes.func,
    renderTruncatedFooter: React.PropTypes.func,
    readMoreText: React.PropTypes.string,
    hideText: React.PropTypes.string,
  };

  static defaultProps = {
    parse: null,
    readMoreText: 'Read more',
    hideText: 'Hide',
  };

  async componentDidMount() {
    if (this.props.numberOfLines) {
      await nextFrameAsync();

      // Get the height of the text with no restriction on number of lines
      const fullHeight = await measureHeightAsync(this._root);
      this.setState({ measured: true });
      await nextFrameAsync();

      // Get the height of the text now that number of lines has been set
      const limitedHeight = await measureHeightAsync(this._root);

      if (fullHeight > limitedHeight) {
        this.setState({ shouldShowReadMore: true });
      }
    }
  }

  setNativeProps(nativeProps) {
    this._root.setNativeProps(nativeProps);
  }

  getPatterns() {
    return this.props.parse.map((option) => {
      const {type, ...patternOption} = option;
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
    if (!this.props.parse)                       { return this.props.children; }
    if (typeof this.props.children !== 'string') { return this.props.children; }

    const textExtraction = new TextExtraction(this.props.children, this.getPatterns());

    return textExtraction.parse().map((props, index) => {
      return (
        <ReactNative.Text
          key={`parsedText-${index}`}
          {...props}
        />
      );
    });
  }

  render() {
    return (
      <ReactNative.View>
        <ReactNative.Text
          ref={ref => this._root = ref}
          {...this.props}
          numberOfLines={ this.state.measured && !this.state.showAllText ? this.props.numberOfLines : 1000 }>
          {this.getParsedText()}
        </ReactNative.Text>
        {this._maybeRenderReadMore()}
      </ReactNative.View>
    );
  }

  _handlePressReadMore = () => {
    this.setState({ showAllText: true });
  }

  _handlePressReadLess = () => {
    this.setState({ showAllText: false });
  }

  _maybeRenderReadMore() {
    let {
      shouldShowReadMore,
      showAllText,
    } = this.state;

    if (shouldShowReadMore && !showAllText) {
      if (this.props.renderTruncatedFooter) {
        return this.props.renderTruncatedFooter(this._handlePressReadMore);
      }

      return (
        <ReactNative.Text style={styles.button} onPress={this._handlePressReadMore}>
          {this.props.readMoreText}
        </ReactNative.Text>
      )
    } else if (shouldShowReadMore && showAllText) {
      if (this.props.renderRevealedFooter) {
        return this.props.renderRevealedFooter(this._handlePressReadLess);
      }

      return (
        <ReactNative.Text style={styles.button} onPress={this._handlePressReadLess}>
          {this.props.hideText}
        </ReactNative.Text>
      );
    }
  }
}

function measureHeightAsync(component) {
  return new Promise(resolve => {
    component.measure((x, y, w, h) => {
      resolve(h);
    });
  });
}

function nextFrameAsync() {
  return new Promise(resolve => requestAnimationFrame(() => resolve()));
}


const styles = ReactNative.StyleSheet.create({
  button: {
    color: '#888',
    marginTop: 5,
  },
});

export default ParsedText;
