import React from 'react';
import * as S from 'components/Topics/Topic/Messages/Filters/Filters.styled';
import { Button } from 'components/common/Button/Button';

interface InfoModalProps {
  toggleIsOpen(): void;
}

const InfoModal: React.FC<InfoModalProps> = ({ toggleIsOpen }) => {
  return (
    <S.InfoModal>
      <S.InfoParagraph>
        <b>Variables bound to groovy context:</b> partition, timestampMs,
        keyAsText, valueAsText, header, key (json if possible), value (json if
        possible).
      </S.InfoParagraph>
      <S.InfoParagraph>
        <b>JSON parsing logic:</b>
      </S.InfoParagraph>
      <S.InfoParagraph>
        Key and Value (if they can be parsed to JSON) they are bound as JSON
        objects, otherwise bound as nulls.
      </S.InfoParagraph>
      <S.InfoParagraph>
        <b>Sample filters:</b>
      </S.InfoParagraph>
      <ol aria-label="info-list">
        <S.ListItem>
          <code>keyAsText != null && keyAsText ~&quot;([Gg])roovy&quot;</code> -
          regex for key as a string
        </S.ListItem>
        <S.ListItem>
          <code>
            value.name == &quot;iS.ListItemax&quot; && value.age &gt; 30
          </code>{' '}
          - in case value is json
        </S.ListItem>
        <S.ListItem>
          <code>value == null && valueAsText != null</code> - search for values
          that are not nulls and are not json
        </S.ListItem>
        <S.ListItem>
          <code>
            headers.sentBy == &quot;some system&quot; &&
            headers[&quot;sentAt&quot;] == &quot;2020-01-01&quot;
          </code>
        </S.ListItem>
        <S.ListItem>
          multiline filters are also allowed:
          <S.InfoParagraph>
            <pre>
              def name = value.name
              <br />
              def age = value.age
              <br />
              name == &quot;iliax&quot; && age == 30
              <br />
            </pre>
          </S.InfoParagraph>
        </S.ListItem>
      </ol>
      <S.ButtonContainer>
        <Button
          buttonSize="M"
          buttonType="secondary"
          type="button"
          onClick={toggleIsOpen}
        >
          Ok
        </Button>
      </S.ButtonContainer>
    </S.InfoModal>
  );
};

export default InfoModal;
