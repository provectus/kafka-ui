import React from 'react';
import { render } from 'lib/testHelpers';
import * as S from 'components/common/table/TableHeaderCell/TableHeaderCell.styled';
import { SortOrder } from 'generated-sources';
import { screen } from '@testing-library/react';
import { theme } from 'theme/theme';

describe('TableHeaderCell.Styled', () => {
  describe('Title Component', () => {
    const DEFAULT_TITLE_TEXT = 'Text';
    const setUpComponent = (
      props: Partial<S.TitleProps> = {},
      text: string = DEFAULT_TITLE_TEXT
    ) => {
      render(
        <S.Title
          isOrderable={'isOrderable' in props ? props.isOrderable : true}
          isOrdered={'isOrdered' in props ? props.isOrdered : true}
          sortOrder={props.sortOrder || SortOrder.ASC}
        >
          {text || DEFAULT_TITLE_TEXT}
        </S.Title>
      );
    };
    describe('test the default Parameters', () => {
      beforeEach(() => {
        setUpComponent();
      });
      it('should test the props of Title Component', () => {
        const titleElement = screen.getByText(DEFAULT_TITLE_TEXT);
        expect(titleElement).toBeInTheDocument();
        expect(titleElement).toHaveStyle(
          `color: ${theme.table.th.color.active};`
        );
        expect(titleElement).toHaveStyleRule(
          'border-bottom-color',
          theme.table.th.color.active,
          {
            modifier: '&:before',
          }
        );
      });
    });

    describe('Custom props', () => {
      it('should test the sort order styling of Title Component', () => {
        setUpComponent({
          sortOrder: SortOrder.DESC,
        });

        const titleElement = screen.getByText(DEFAULT_TITLE_TEXT);
        expect(titleElement).toBeInTheDocument();
        expect(titleElement).toHaveStyleRule(
          'color',
          theme.table.th.color.active
        );
        expect(titleElement).toHaveStyleRule(
          'border-top-color',
          theme.table.th.color.active,
          {
            modifier: '&:after',
          }
        );
      });

      it('should test the Title Component styling without the ordering', () => {
        setUpComponent({
          isOrderable: false,
          isOrdered: false,
        });

        const titleElement = screen.getByText(DEFAULT_TITLE_TEXT);
        expect(titleElement).toHaveStyleRule('cursor', 'default');
      });
    });
  });

  describe('Preview Component', () => {
    const DEFAULT_TEXT = 'DEFAULT_TEXT';
    it('should render the preview and check themes values', () => {
      render(<S.Preview>{DEFAULT_TEXT}</S.Preview>);
      const element = screen.getByText(DEFAULT_TEXT);
      expect(element).toBeInTheDocument();
      expect(element).toHaveStyleRule(
        'background',
        theme.table.th.backgroundColor.normal
      );
      expect(element).toHaveStyleRule(
        'color',
        theme.table.th.previewColor.normal
      );
    });
  });
});
