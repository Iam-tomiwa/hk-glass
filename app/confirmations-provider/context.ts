"use client";

import { createContext } from "react";
import type { ConfirmationsContextValue } from "./types";

const context = createContext<ConfirmationsContextValue>({
	openConfirmModal: () => {},
	closeConfirmModal: () => {},
	setLoading: () => {},
});
export default context;
