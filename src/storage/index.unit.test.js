const chai = require('chai');

const { expect } = chai;

describe(__filename, () => {
  it('successfully does nothing', async () => {
    const two = 2;
    expect(two).to.equal(2);
  });
});
