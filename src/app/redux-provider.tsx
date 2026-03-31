"use client";
import { Provider } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import LoadingBar, { LoadingBarRef } from "react-top-loading-bar";
import { ToastContainer } from "react-toastify";
import store from "@/components/set-up/redux/store";

const queryClient = new QueryClient();
export const loadingBarRef = React.createRef<LoadingBarRef | null>();

export default function ReduxProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<>
			<LoadingBar
				color='#031C4F'
				ref={loadingBarRef as React.RefObject<LoadingBarRef>}
				height={5}
			/>
			<QueryClientProvider client={queryClient}>
				<ToastContainer position='top-right' hideProgressBar />
				<Provider store={store}>{children}</Provider>
			</QueryClientProvider>
		</>
	);
}
