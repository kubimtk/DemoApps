module.exports = {
  default: {
    require: [
      'features/step_definitions/**/*.ts',
      'src/setupTests.ts'
    ],
    requireModule: ['ts-node/register'],
    format: [
      'progress-bar',
      'html:cucumber-report.html',
      'json:cucumber-report.json'
    ],
    paths: [
      '../inventory.feature',
      '../english.inventory.feature'
    ],
    publishQuiet: true
  }
};

