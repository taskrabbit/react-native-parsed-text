import { expect } from 'chai';

import TextExtraction from '../src/lib/TextExtraction';

describe('TextExtraction', () => {

  describe('#parse', () => {

    it('returns an array with the text if there is no patterns', () => {
      const textExtraction = new TextExtraction('Some Text');

      expect(textExtraction.parse()).to.eql([{children: 'Some Text'}]);
    });

    it('returns an array with the text if the text cant be parsed', () => {
      const textExtraction = new TextExtraction('Some Text', [
        { pattern: /abcdef/ },
      ]);

      expect(textExtraction.parse()).to.eql([{children: 'Some Text'}]);
    });

    it('returns an array with the text and return only present values', () => {
      const textExtraction = new TextExtraction('abcdef', [
        { pattern: /abcdef/ },
      ]);

      expect(textExtraction.parse()).to.eql([{children: 'abcdef'}]);
    });

    it('returns an array with text parts if there is matches', () => {
      const textExtraction = new TextExtraction('hello my website is http://foo.bar, bar is good.', [
        { pattern: /bar/ },
      ]);

      expect(textExtraction.parse()).to.eql([
        {children: 'hello my website is http://foo.'},
        {children: 'bar'},
        {children: ', '},
        {children: 'bar'},
        {children: ' is good.'},
      ]);
    });

    it('pass the values to the callbacks', (done) => {
      const textExtraction = new TextExtraction('hello foo', [
        { pattern: /foo/, onPress: (value) => expect(value).to.eql('foo') && done() },
      ]);


      const parsedText = textExtraction.parse();

      expect(parsedText[0]).to.eql({children: 'hello '});
      expect(parsedText[1].children).to.eql('foo');
      expect(parsedText[1].onPress).to.be.instanceof(Function);

      parsedText[1].onPress();
    });

    it('only allow a text to be parsed once', () => {
      const textExtraction = new TextExtraction('hello my website is http://foo.bar, bar is good.', [
        { pattern: /(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?/ },
        { pattern: /bar/ },
      ]);

      expect(textExtraction.parse()).to.eql([
        {children: 'hello my website is '},
        {children: 'http://foo.bar'},
        {children: ', '},
        {children: 'bar'},
        {children: ' is good.'},
      ]);
    });

    it('respects the parsing order', () => {
      const textExtraction = new TextExtraction('hello my website is http://foo.bar, bar is good.', [
        { pattern: /bar/ },
        { pattern: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/ },
      ]);

      expect(textExtraction.parse()).to.eql([
        {children: 'hello my website is http://foo.'},
        {children: 'bar'},
        {children: ', '},
        {children: 'bar'},
        {children: ' is good.'},
      ]);
    });

  });

});
