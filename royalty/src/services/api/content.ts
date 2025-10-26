export const createContent = async (metadata: any) => {
  // const response = await fetch('/api/creator/contents', {
  //   method: 'POST',
  //   body: JSON.stringify(metadata),
  // });
  // return response.json();
  return Promise.resolve({ content_id: '123' });
};

export const createOffering = async (offering: any) => {
  // const response = await fetch('/api/creator/offerings', {
  //   method: 'POST',
  //   body: JSON.stringify(offering),
  // });
  // return response.json();
  return Promise.resolve({ token_id: '...', sale_id: '...' });
};
