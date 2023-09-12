jest.mock('./ch-5.util');
jest.mock('uuid', () => ({ v4: () => '123456789' }));

describe('Calculate Profit', () => {
  test('it should calculate profit value', () => {
    expect(0).toBe(1);
  });
});

describe('Test UUID generation', () => {
  test('it should generate random UUID.', () => {
    expect(0).toBe(1);
  });
});