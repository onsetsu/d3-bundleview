"use strict";

var expect = chai.expect;
import uuidGenerator from './../src/client/app/generator.js';

describe('Import Chain', function() {
  it('should allow to import functionality over transitively over multiple modules', function() {
    var uuidGen = uuidGenerator();

    expect(uuidGen().split('-').length).to.equal(5);
  });
});
