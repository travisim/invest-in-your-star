import { useState, useEffect } from 'react';

// This is a placeholder for the actual wallet integration logic
const fakeWallet = {
  isConnected: () => false,
  connect: () => Promise.resolve('G...'),
  disconnect: () => Promise.resolve(),
  getAddress: () => Promise.resolve('G...'),
};

export const useWallet = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | undefined>(undefined);

  useEffect(() => {
    setIsConnected(fakeWallet.isConnected());
    if (fakeWallet.isConnected()) {
      fakeWallet.getAddress().then(setAddress);
    }
  }, []);

  const connect = async () => {
    const addr = await fakeWallet.connect();
    setAddress(addr);
    setIsConnected(true);
  };

  const disconnect = async () => {
    await fakeWallet.disconnect();
    setAddress(undefined);
    setIsConnected(false);
  };

  return { isConnected, address, connect, disconnect };
};
