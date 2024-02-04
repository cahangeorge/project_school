
import bcrypt from "bcryptjs"

export function invariantResponse(
	condition: any,
	message: any | (() => any),
	responseInit?: ResponseInit,
): asserts condition {
	if (!condition) {
		throw new Response(typeof message === 'function' ? message() : message, {
			status: 400,
			...responseInit,
		})
	}
}

export async function checkPasswords (input_psw: string, user_psw: string) {
	const isCorrectPassword = await bcrypt.compare(
		input_psw,
		user_psw
	) // check if passwords are the same
}

export async function encryptPassword(pass: string) {
	const password = await bcrypt.hash(pass, 10) // hash the password

	return password
}