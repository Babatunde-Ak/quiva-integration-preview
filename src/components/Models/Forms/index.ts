import * as Yup from "yup";
export const phoneRegExp = /^(?:\+?2340?|0)[789][01]\d{8}$/;

export const LoginSchema = Yup.object().shape({
	email: Yup.string()
		.email("Invalid email address")
		.required("Email is required"),
	password: Yup.string().required("Password is required"),
});
