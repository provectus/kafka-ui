import userEvent from '@testing-library/user-event';
import { screen } from '@testing-library/react';
import { render } from 'lib/testHelpers';
import React from 'react';
import InfoModal from 'components/Topics/Topic/Details/Messages/Filters/InfoModal';

describe('InfoModal component', () => {
  it('closes InfoModal', () => {
    const toggleInfoModal = jest.fn();
    render(<InfoModal toggleIsOpen={toggleInfoModal} />);
    userEvent.click(screen.getByRole('button', { name: 'Ok' }));
    expect(toggleInfoModal).toHaveBeenCalledTimes(1);
  });
});
