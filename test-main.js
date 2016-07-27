"use strict";

let allTestFiles = [],
    TEST_REGEXP = /(-spec|-test)\.js$/i;

// Get a list of all the test files to include
Object.keys(window.__karma__.files).forEach(file => {
  if (TEST_REGEXP.test(file)) {
    let normalizedTestModule = file.replace(/^\/base\/|\.js$/g, '');
    allTestFiles.push(normalizedTestModule);
    console.log('Test to load: ' + normalizedTestModule);
  }
});

Promise.all(allTestFiles.map(function (file) {
  console.log('Load Test File: ' + file);
  return System.import(/*'base/' + */file + '.js');
}))
  .then(function() {
    window.__karma__.start();
  })
  .catch(error => {
    console.error(error);
    console.error(error.stack);
    console.error(error.toString());
    throw(error);
  });
