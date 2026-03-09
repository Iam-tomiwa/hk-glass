/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  CSSProperties,
  ReactElement,
  SetStateAction,
  Dispatch,
  ReactNode,
} from "react";
import type { EmptyStateProps } from "../empty-state";

export type RowId = number | string;

export interface RowData {
  [key: string]: any;
}

export interface ColumnDef {
  field: string;
  headerName?: string;
  width?: number;
  align?: "center" | "left" | "right";
  padding?: "checkbox" | "none" | "default";
  sortable?: boolean;
  valueGetter?: (data: any) => any;
  renderCell?: (data: any) => ReactElement;
}

export interface RowModel {
  id: RowId;
  data: RowData;
  selected: boolean;
}

export interface DataGridRef {
  setSelection: Dispatch<SetStateAction<RowId[]>>;
}

export interface DataGridProps {
  rows: RowData[];
  columns: ColumnDef[];
  rowCount?: number;
  pageSize?: number;
  rowsPerPageOptions?: number[];
  disableSelectionOnClick?: boolean;
  checkboxSelection?: boolean;
  onSelectionChange?: (selection: RowData[]) => void;
  page?: number;
  setPage?: (page: number) => void;
  loading?: boolean;
  tableStyle?: CSSProperties;
  isPaginated?: boolean;
  isLoading?: boolean;
  isError?: boolean;
  isSuccess?: boolean;
  error?: unknown;
  emptyStateProps?: EmptyStateProps;
  className?: string;
  tableHeaderClass?: string;
  bordered?: boolean;
  tableHeader?: ReactNode;
  paginationClass?: string;
  totalItems?: number;
  itemLabel?: string;
}
