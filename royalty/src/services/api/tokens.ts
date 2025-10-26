export const getQuote = async (contentId: string, amount: number) => {
  // const response = await fetch(`/api/offerings/${contentId}/quote?amount=${amount}`);
  // return response.json();
  return Promise.resolve({ cost: 100 * amount });
};

export const buyTokens = async (contentId: string, amount: number) => {
  // const response = await fetch(`/api/offerings/${contentId}/buy`, {
  //   method: 'POST',
  //   body: JSON.stringify({ amount }),
  // });
  // return response.json();
  return Promise.resolve({ success: true });
};
