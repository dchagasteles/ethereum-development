import { expect } from 'chai';

import { runTestSuite, TestVars } from './lib';

runTestSuite('Greeter', (vars: TestVars) => {
  it('greeting', async () => {
    const { Greeter } = vars;
    expect(await Greeter.greet()).to.equal('greeting');
  });
});
