import { NextFunction, Request, Response } from "express";
import { IS_DEV } from "./general";

// const IS_DEV = process.env.IS_DEV === "true";

export interface DevModeErrorResponse {
	errorMessage: string,
	errorCode: number,
	lineNumber?: number,
	filePath: string
}


export class RouteError extends Error {
	wrappedError: Error | null = null;
	errorCode: 400 | 418;
	constructor(
		errorCode: 400 | 418,
		message: string,
		wrappedError?: Error
	) {
		super(message);
		this.errorCode = errorCode;
		if (wrappedError) {
			this.wrappedError = wrappedError;
		}
	}
}

export const getErrorInfo = (e: Error): { lineNumber?: number, filePath: string }=> {
	let initiator = 'unknown place';
	if (e?.stack) {
		let isFirst = true;
		const splitStack = e.stack.split('\n');
		for (const line of splitStack) {
			const matches = line.match(/^\s+at\s+(.*)/);
			if (matches) {
				if (!isFirst) {
					initiator = matches[1];
					break;
				}
				isFirst = false;
			}
		}
	}
	const initiatorItems = initiator.split(":");
	const lineNumber = Number(initiatorItems[initiatorItems.length - 2]);
	let filePath = "";
	for (const item of initiatorItems) {
		if (item.endsWith(".js") || item.endsWith(".ts")) {
			filePath = item;
		}
	}
	return {
		lineNumber: !Number.isNaN(lineNumber) ? lineNumber : undefined,
		filePath
	};
};

export const errorHandlingMiddleware = (err: Error, req: Request, res: Response, _: NextFunction) => {
	if (!(err instanceof RouteError)) {
		throw err;
	}
	console.error(err);
	if (err.wrappedError) {
		console.error(err.wrappedError);
	}
	if (!IS_DEV) {
		return res.sendStatus(err.errorCode).end();
	}
	const { lineNumber, filePath } = getErrorInfo(err);
	const errorResponse: DevModeErrorResponse = {
		errorMessage: err.message,
		errorCode: err.errorCode,
		lineNumber,
		filePath
	};
	return res.json(errorResponse).end();
};

