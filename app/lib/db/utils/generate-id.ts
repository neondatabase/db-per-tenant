import { customAlphabet } from "nanoid";

const NO_LOOKALIKES = "346789ABCDEFGHJKLMNPQRTUVWXYabcdefghijkmnpqrtwxyz"; // Numbers and english alphabet without lookalikes: 1, l, I, 0, O, o, u, v, 5, S, s, 2, Z.
const DEFAULT_ID_LENGTH = 14;

const prefixMapping = {
	user: "usr",
	document: "doc",
};

type Options = {
	object: keyof typeof prefixMapping;
	length?: number;
};

/**
 * Generates a public-facing ID with a specified prefix from a predefined set and a custom length. It excludes visually similar characters to avoid confusion.
 * @example
 * // Returns an ID string like "acc_X7Yk92ndA31f"
 * generateId({ prefix: 'account', length: 14 });
 */

export const generateId = ({ object, length = DEFAULT_ID_LENGTH }: Options) => {
	const nanoid = customAlphabet(NO_LOOKALIKES, length);

	const prefix = prefixMapping[object];

	return `${prefix}_${nanoid()}`;
};
