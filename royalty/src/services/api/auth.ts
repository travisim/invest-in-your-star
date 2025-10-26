// Placeholder for SEP-10 authentication
export const getChallenge = async () => {
  // const response = await fetch('/api/auth/sep10/challenge');
  // return response.json();
  return Promise.resolve({ challenge: '...' });
};

export const verifyChallenge = async (signedChallenge: string) => {
  // const response = await fetch('/api/auth/sep10/verify', {
  //   method: 'POST',
  //   body: JSON.stringify({ signedChallenge }),
  // });
  // return response.json();
  return Promise.resolve({ token: 'jwt...' });
};
