import type { ReactElement } from "react";

export type Confirmation = confirmOptions & {
	id: string | number;
	message: string | ReactElement;
	open: boolean;
	onConfirm: () => Promise<void> | void;
	loading: boolean;
};

export interface confirmOptions {
	title?: string;
	confirmText?: string;
	cancelText?: string;
	isDelete?: boolean;
	shouldCloseOnConfirm?: boolean;
}

export interface ConfirmationsContextValue {
	openConfirmModal: (
		message: string | ReactElement,
		onConfirm: () => Promise<void> | void,
		options?: confirmOptions
	) => void;
	closeConfirmModal: () => void;
	setLoading: (loading: boolean) => void;
}
