import { useWallet, useAccountId } from '@buidlerlabs/hashgraph-react-wallets';
import { HashpackConnector } from '@buidlerlabs/hashgraph-react-wallets/connectors';
import { MainButton } from ".";
import { toast } from "react-toastify";
import { useCallback } from 'react';

export default function HashConnectButton() {
  const { data: accountId } = useAccountId();
  const { 
    isConnected, 
    connect, 
    disconnect, 
    isLoading: isConnecting, 
    extensionReady,
    error 
  } = useWallet(HashpackConnector);

  const handleConnect = useCallback(async () => {
    try {
      if (!extensionReady) {
        toast.error("Please install the HashPack extension to connect your wallet.");
        window.open('https://www.hashpack.app/', '_blank');
        return;
      }
      
      const result = await connect();
      if (result) {
        toast.success(`Connected successfully! Account: ${accountId}`);
        console.log("Connected to HashPack:", result);
      }
    } catch (error) {
      console.error("Error connecting to HashPack:", error);
      toast.error("Failed to connect wallet. Please try again.");
    }
  }, [connect, extensionReady, accountId]);

  const handleDisconnect = useCallback(async () => {
    try {
      await disconnect();
      toast.info("Wallet disconnected");
    } catch (error) {
      console.error("Error disconnecting:", error);
      toast.error("Error disconnecting wallet");
    }
  }, [disconnect]);

  // Handle connection errors
  if (error) {
    toast.error(`Wallet error: ${error.message}`);
  }

  return (
    <div className="flex flex-col items-center p-4 space-y-4">
      {isConnected && accountId ? (
        <div className="text-center space-y-2">
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-green-700 font-medium">✓ Wallet Connected</p>
            <p className="text-green-600 text-sm font-mono">{accountId}</p>
          </div>
          <button
            onClick={handleDisconnect}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <div className="text-center space-y-2">
          {!extensionReady && (
            <p className="text-amber-600 text-sm">
              HashPack extension not detected
            </p>
          )}
          <MainButton
            onClick={handleConnect}
            disabled={isConnecting || !extensionReady}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isConnecting ? "Connecting..." : "Connect with HashPack"}
          </MainButton>
        </div>
      )}
    </div>
  );
}