import { useWalletAuth } from "@/hook/useWalletAuth";
import { RainbowConnect } from "./RainbowConnect";
import { useAccount, useDisconnect } from "wagmi";
import { useAppSelector, useAppDispatch } from "@/redux/hook";
import { logout } from "@/redux/slices/authSlice";

export default function WalletLogin({ disabled }: { disabled: boolean }) {
  const { loginWithWallet } = useWalletAuth();
  const { isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const dispatch = useAppDispatch();
  const {
    user: { isAuthenticated },
  } = useAppSelector((state: any) => state.auth);

  const handleLogin = async () => {
    try {
      const user = await loginWithWallet();
      console.log("Logged in user:", user);
    } catch (err) {
      console.error("Wallet login failed:", err);
    }
  };

  const handleLogout = () => {
    // Disconnect wallet
    disconnect();
    // Clear redux + localStorage
    dispatch(logout());
  };

  return (
    <div className="flex flex-col gap-4 items-center">
      <RainbowConnect disabled={disabled} />

      {isConnected && !isAuthenticated && (
        <button
          onClick={handleLogin}
          className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
        >
          Login with Wallet
        </button>
      )}

      {isConnected && isAuthenticated && (
        <button
          onClick={handleLogout}
          className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
        >
          Logout 
        </button>
      )}
    </div>
  );
}
