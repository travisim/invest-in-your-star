import React from 'react';
import { PageLayout } from '../../components/layout';
import { WalletConnect } from '../../components/features/wallet';

const Login = () => {
  return (
    <PageLayout>
      <h2>Login</h2>
      <WalletConnect />
    </PageLayout>
  );
};

export default Login;
