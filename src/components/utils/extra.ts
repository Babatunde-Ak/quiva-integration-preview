import React from "react";
import { toast } from "react-toastify";
import type { LoadingBarRef } from "react-top-loading-bar";

export const loadingBarRef = React.createRef<LoadingBarRef | null>();
type voidFn = () => void;
let resetState: voidFn = () => {};

export const APICall = async (
	fn: (...args: any) => Promise<any>,
	args?: any,
	showSuccessToast: boolean = false,
	showLoadingBar: boolean = true,
) => {
	try {
		showLoadingBar && loadingBarRef.current?.continuousStart();
		const response =
			args &&
			typeof args[Symbol.iterator] === "function" &&
			!(typeof args == "string")
				? await fn(...args)
				: await fn(args);
		showSuccessToast && toast(response.data.message, { type: "success" });
		showLoadingBar && loadingBarRef.current?.complete();
		return response;
	} catch (error: any) {
		if (error.response) {
			showSuccessToast && toast(error.response.data.message, { type: "error" });

			if (error.response.status == 401) {
				resetState();
			}
		}
		showLoadingBar && loadingBarRef.current?.complete();
		throw error;
	}
};

export function formatDateYMD(dateString: string) {
	const date = new Date(dateString);
	const formattedDate = date.toLocaleDateString("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
	});
	return formattedDate; // Returns the formatted date string
}

export function getYearRange() {
	const now = new Date(); // Get the current date
	const year = now.getFullYear(); // Get the current year

	// Create the beginning of the current year (January 1st)
	const startOfYear = new Date(year, 0, 1); // Months are 0-indexed, so 0 is January
	const startOfYearFormatted = startOfYear.toISOString().split("T")[0];

	// Create the end of the current year (December 31st)
	const endOfYear = new Date(year, 11, 31); // Months are 0-indexed, so 11 is December
	const endOfYearFormatted = endOfYear.toISOString().split("T")[0];

	return {
		start: startOfYearFormatted,
		end: endOfYearFormatted,
	};
}

export function formatDateAndTime(timestamp: string): string {
	const date = new Date(timestamp);

	// Extracting year, month, and day
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0"); // Adding 1 because months are 0-indexed
	const day = String(date.getDate()).padStart(2, "0");

	// Extracting hours and minutes in 12-hour format
	let hours = date.getHours();
	const minutes = String(date.getMinutes()).padStart(2, "0");
	const ampm = hours >= 12 ? "PM" : "AM"; // Determine AM or PM

	// Convert hours to 12-hour format
	hours = hours % 12;
	hours = hours ? hours : 12; // Handle midnight (0 hours)

	// Format hours to always be 2 digits
	const formattedHours = String(hours).padStart(2, "0");

	// Forming the formatted date string in yyyy-mm-dd format
	const formattedDate = `${year}-${month}-${day}`;

	// Forming the formatted time string in hh:mm AM/PM format
	const formattedTime = `${formattedHours}:${minutes} ${ampm}`;

	// Combining date and time
	return `${formattedDate} | ${formattedTime}`;
}

export function formatDateAndTimeAlt(timestamp: string) {
	const date = new Date(timestamp);

	// Extracting year, month, and day
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0"); // Adding 1 because months are 0-indexed
	const day = String(date.getDate()).padStart(2, "0");

	// Extracting hours and minutes
	const hours = String(date.getHours()).padStart(2, "0");
	const minutes = String(date.getMinutes()).padStart(2, "0");

	// Forming the formatted date string in yyyy-mm-dd format
	const formattedDate = `${year}-${month}-${day}`;

	// Forming the formatted time string in hh:mm format
	const formattedTime = `${hours}:${minutes}`;

	return {
		year: formattedDate,
		time: formattedTime,
	};
}

export function getTimeDifferenceInMinutes(
	startsAt: string,
	endsAt: string,
): number {
	const startDate = new Date(startsAt);
	const endDate = new Date(endsAt);

	const differenceInMilliseconds = endDate.getTime() - startDate.getTime();
	const differenceInMinutes = differenceInMilliseconds / (1000 * 60);

	return Math.abs(differenceInMinutes); // Return absolute value to handle cases where endsAt is before startsAt
}
export const NewFormatDateTime = (
	dateString: string,
	options: {
		locale?: string;
		dateOptions?: Intl.DateTimeFormatOptions;
		timeOptions?: Intl.DateTimeFormatOptions;
	} = {},
) => {
	const {
		locale = "en-US",
		dateOptions = { month: "long", day: "numeric", year: "numeric" },
		timeOptions = { hour: "2-digit", minute: "2-digit" },
	} = options;
	const date = new Date(dateString);
	return {
		date: date.toLocaleDateString(locale, dateOptions),
		time: date.toLocaleTimeString(locale, timeOptions),
	};
};
