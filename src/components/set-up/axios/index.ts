"use client";

import { AxiosStatic } from "axios";

export default function setupAxios(axios: AxiosStatic, store: any) {
	const QuivaComicAPI = process.env.NEXT_PUBLIC_API_URL || "";
	axios.defaults.headers.common["Accept"] = "application/json";
	axios.interceptors.request.use(
		(config: any) => {
			const {
				auth: { token },
			} = store.getState();

			if (token) {
				if (config.headers && config.url.includes(QuivaComicAPI)) {
					config.headers.Authorization = `Bearer ${token}`;
				}
			}
			return config;
		},

		(err: any) => Promise.reject(err),
	);
}
