"use strict";

import * as $ from 'https://code.jquery.com/jquery-2.1.4.js';

var expect = chai.expect;

describe('Eval', function() {
  it('should eval 3 + 4 to 7', function() {
    expect(eval('3+4')).to.equal(7);
    expect($.trim('  thing with whitespaces  ')).to.equal('thing with whitespaces');
  });
});
