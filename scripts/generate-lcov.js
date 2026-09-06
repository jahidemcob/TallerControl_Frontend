const fs = require('fs');
const { createCoverageMap } = require('istanbul-lib-coverage');
const reports = require('istanbul-reports');

const coverage = JSON.parse(
  fs.readFileSync('./coverage/frontend/coverage-final.json', 'utf-8')
);

const map = createCoverageMap(coverage);

const context = require('istanbul-lib-report').createContext({
  dir: './coverage/frontend',
  coverageMap: map,
});

const report = reports.create('lcovonly');
report.execute(context);

console.log('✅ lcov.info generado');