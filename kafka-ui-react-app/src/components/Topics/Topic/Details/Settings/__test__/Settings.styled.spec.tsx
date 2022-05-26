import React from 'react';
import { screen } from '@testing-library/react';
import { render } from 'lib/testHelpers';
import { ConfigItemCell } from 'components/Topics/Topic/Details/Settings/Settings.styled';

describe('Settings styled Components', () => {
  describe('ConfigItemCell Component', () => {
    const renderComponent = (
      props: Partial<{ $hasCustomValue: boolean }> = {}
    ) => {
      return render(
        <table>
          <tbody>
            <tr>
              <ConfigItemCell
                $hasCustomValue={
                  '$hasCustomValue' in props ? !!props.$hasCustomValue : false
                }
              />
            </tr>
          </tbody>
        </table>
      );
    };
    it('should check the true rendering ConfigItemList', () => {
      renderComponent({ $hasCustomValue: true });
      expect(screen.getByRole('cell')).toHaveStyleRule(
        'font-weight',
        '500 !important'
      );
    });

    it('should check the true rendering ConfigItemList', () => {
      renderComponent();
      expect(screen.getByRole('cell')).toHaveStyleRule(
        'font-weight',
        '400 !important'
      );
    });
  });
});
