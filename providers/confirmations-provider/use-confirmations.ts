import { useContext } from "react";
import context from "./context";
import type { ConfirmationsContextValue } from "./types";

const useConfirmations = (): ConfirmationsContextValue => useContext(context);
export default useConfirmations;
