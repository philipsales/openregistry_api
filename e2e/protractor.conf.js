// Protractor configuration file, see link for more information
// https://github.com/angular/protractor/blob/master/lib/config.ts

const { SpecReporter } = require('jasmine-spec-reporter');

exports.config = {
  allScriptsTimeout: 110000,
  specs: [
    './config/custom.config.js',
    './src/app/biobank/biobank.form.spec.js',
    './src/app/biobank/biobank.case.spec.js'
  ],
  capabilities: {
    'browserName': 'chrome',
    'chromeOptions': {
      'args': [
      'show-fps-counter=true',
      '--window-size=1280,1024'
    ]
    }
  },
  directConnect: true,
  baseUrl: 'http://localhost:4200/',
  framework: 'jasmine',
  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 300000,
    print: function() {}
  },
  onPrepare() {
    require('ts-node').register({
      project: 'tsconfig.e2e.json'
    });
    jasmine.getEnv().addReporter(new SpecReporter({ spec: { displayStacktrace: true } }));
  }
};
