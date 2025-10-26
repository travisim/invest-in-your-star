export const requestLicense = async (contentId: string, licenseDetails: any) => {
  // const response = await fetch(`/api/license/${contentId}/request`, {
  //   method: 'POST',
  //   body: JSON.stringify(licenseDetails),
  // });
  // return response.json();
  return Promise.resolve({ success: true });
};

export const activateLicense = async (contentId: string) => {
  // const response = await fetch(`/api/license/${contentId}/activate`, {
  //   method: 'POST',
  // });
  // return response.json();
  return Promise.resolve({ success: true });
};
