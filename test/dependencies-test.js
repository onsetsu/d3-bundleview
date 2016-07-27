"use strict";

var expect = chai.expect;
import * as focalStorage from './../src/external/focalStorage.js';
import * as $ from 'https://code.jquery.com/jquery-2.1.4.js';

describe('Include external code', function() {
  it('get an 404 when fetching a non existing file with an xmlhttp get request from github', function(done) {
    focalStorage.setItem("testItem", "1234").then(function() {
      $.get("https://code.jquery.com/jquery-2.1.4.js", undefined,
          function(result) {
            done();
          }).fail(function(err, status) {
            done(err);
          })
    });
  });
});
