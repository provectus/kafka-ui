import { formatTimestamp } from 'lib/dateTimeHelpers';

describe('dateTimeHelpers', () => {
  describe('formatTimestamp', () => {
    it('should check the empty case', () => {
      expect(formatTimestamp('')).toBe('');
    });

    it('should check the invalid case', () => {
      expect(formatTimestamp('invalid')).toBe('');
    });

    it('should output the correct date', () => {
      const date = new Date();
      const formattedDate = formatTimestamp(date);
      const formattedTimestamp = formatTimestamp(date.getTime());

      const expected = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}, ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
      expect(formattedDate).toBe(expected);
      expect(formattedTimestamp).toBe(expected); const date = new Date();
      expect(formatTimestamp(date)).toBe(
        date.toLocaleString([], { hour12: false })
      );
      expect(formatTimestamp(date.getTime())).toBe(
        date.toLocaleString([], { hour12: false })
      );
    });
  });
});
