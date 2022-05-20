import * as actions from 'redux/actions';

describe('Actions', () => {
  describe('dismissAlert', () => {
    it('creates a REQUEST action', () => {
      const id = 'alert-id1';
      expect(actions.dismissAlert(id)).toEqual({
        type: 'DISMISS_ALERT',
        payload: id,
      });
    });
  });
});
