export const failurePayloadWithoutId = {
  title: 'title',
  message: 'message',
  subject: 'topic',
};

export const failurePayloadWithId = {
  ...failurePayloadWithoutId,
  subjectId: '12345',
};
