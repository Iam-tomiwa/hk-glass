import { useMemo, useState, useRef, useCallback } from "react";
import type { DataGridProps, RowModel, ColumnDef } from "./types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowDown, ArrowUp, Braces, MoreHorizontal } from "lucide-react";
import EmptyState from "../empty-state";
import ErrorMsg from "../error-msg";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "../ui/button";
import { Skeleton } from "../ui/skeleton";
import { Pagination } from "../ui/pagination";

// Virtual scrolling hook
function useVirtualScrolling(
  totalItems: number,
  itemHeight: number = 52, // Default row height
  containerHeight: number = 400,
  overscan: number = 5,
) {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleRange = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + overscan,
      totalItems,
    );

    return {
      start: Math.max(0, startIndex - overscan),
      end: endIndex,
      visibleStart: startIndex,
      visibleEnd: Math.min(
        startIndex + Math.ceil(containerHeight / itemHeight),
        totalItems,
      ),
    };
  }, [scrollTop, itemHeight, containerHeight, totalItems, overscan]);

  const totalHeight = totalItems * itemHeight;
  const offsetY = visibleRange.start * itemHeight;

  return {
    visibleRange,
    totalHeight,
    offsetY,
    setScrollTop,
  };
}

interface VirtualDataGridProps extends DataGridProps {
  enableVirtualScrolling?: boolean;
  rowHeight?: number;
  containerHeight?: number;
  overscan?: number;
}

const DataGrid = function (props: VirtualDataGridProps) {
  const {
    rows,
    columns,
    disableSelectionOnClick = true,
    checkboxSelection = false,
    onSelectionChange = () => {},
    page = 0,
    setPage = () => {},
    pageSize = 0,
    loading = false,
    error = null,
    isPaginated = false,
    emptyStateProps,
    isError,
    className,
    bordered = false,
    tableHeaderClass = "px-4",
    paginationClass = "pb-4",
    // Virtual scrolling props
    enableVirtualScrolling = false,
    rowHeight = 52,
    containerHeight = 400,
    overscan = 5,
    totalItems,
    itemLabel,
  } = props;

  const [selection, setSelection] = useState<RowModel["id"][]>([]);
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [orderBy, setOrderBy] = useState("");

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const tableBodyRef = useRef<HTMLTableSectionElement>(null);

  const columnsMap = useMemo(() => {
    const map: { [key: string]: ColumnDef } = {};
    columns.forEach((column) => (map[column.field] = column));
    return map;
  }, [columns]);

  const rowModels: RowModel[] = useMemo(() => {
    const rowModels = rows.map((row, i) => ({
      id: row?.id || `row_${i}`,
      data: row,
      selected: selection.includes(row?.id || `row_${i}`),
    }));

    if (orderBy) {
      const columnDef = columnsMap[orderBy];
      rowModels.sort((a, b) => {
        const valA = columnDef.valueGetter
          ? columnDef.valueGetter(a.data)
          : a.data[columnDef.field];
        const valB = columnDef.valueGetter
          ? columnDef.valueGetter(b.data)
          : b.data[columnDef.field];

        if (order === "desc") return valA > valB ? -1 : valA === valB ? 0 : 1;
        else return valA > valB ? 1 : valA === valB ? 0 : -1;
      });
    }

    return rowModels;
  }, [rows, selection, order, orderBy, columnsMap]);

  // Virtual scrolling logic
  const { visibleRange, totalHeight, offsetY, setScrollTop } =
    useVirtualScrolling(rowModels.length, rowHeight, containerHeight, overscan);

  const visibleRows = useMemo(() => {
    if (!enableVirtualScrolling) return rowModels;
    return rowModels.slice(visibleRange.start, visibleRange.end);
  }, [rowModels, visibleRange, enableVirtualScrolling]);

  // Handle scroll events
  const handleScroll = useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      if (!enableVirtualScrolling) return;
      setScrollTop(event.currentTarget.scrollTop);
    },
    [enableVirtualScrolling, setScrollTop],
  );

  // Flags
  const allRowsSelected = rows.length > 0 && selection.length === rows.length;
  const someRowsSelected =
    selection.length > 0 && selection.length < rows.length;

  // Pre-calculate row IDs once to avoid repeated mapping
  const rowIds = useMemo(
    () => rows.map((el, i) => el?.id || `row_${i}`),
    [rows],
  );

  function handleRowClick(rowModel: RowModel) {
    if (disableSelectionOnClick && !checkboxSelection) return;
    setSelection((currentSelection) => {
      const isSelected = currentSelection.includes(rowModel.id);
      const newSelection = isSelected
        ? currentSelection.filter((id) => id !== rowModel.id)
        : [...currentSelection, rowModel.id];

      const selectedRows = rows.filter((row, i) =>
        newSelection.includes(row?.id || `row_${i}`),
      );
      onSelectionChange(selectedRows);
      return newSelection;
    });
  }

  function handleCheckboxSelection() {
    const newSelection =
      someRowsSelected || selection.length === 0 ? rowIds : [];
    setSelection(newSelection);
    const selectedRows = newSelection.length
      ? rows.filter((row, i) => newSelection.includes(row?.id || `row_${i}`))
      : [];

    onSelectionChange(selectedRows);
  }

  function sortHandler(fieldName: string) {
    return () => {
      const isAsc = fieldName === orderBy && order === "asc";
      setOrder(isAsc ? "desc" : "asc");
      setOrderBy(fieldName);
    };
  }

  // Optimize page change handler to prevent rapid successive calls
  const handlePageChange = useCallback(
    (newPage: number) => {
      if (newPage !== page) {
        setPage(newPage);
        setSelection([]);
        onSelectionChange([]);
      }
    },
    [page, setPage, onSelectionChange],
  );

  const tableContent = (
    <Table style={props.tableStyle}>
      <TableHeader className="sticky bg-card -top-1 z-10">
        <TableRow className="bg-gray-50">
          {checkboxSelection && (
            <TableHead className="w-12">
              <Checkbox
                checked={allRowsSelected}
                onCheckedChange={handleCheckboxSelection}
                aria-label="Select all"
              />
            </TableHead>
          )}

          {columns.map((column, i) => (
            <TableHead
              key={column.field + i}
              style={{ minWidth: column.width }}
              className={
                column.align === "right"
                  ? "text-right"
                  : column.align === "center"
                    ? "text-center"
                    : "text-left"
              }
            >
              {column.sortable ? (
                <button
                  className="flex items-center gap-1 font-medium"
                  onClick={sortHandler(column.field)}
                  title={`Sort ${column.headerName}`}
                >
                  {column.headerName || column.field}
                  {orderBy === column.field &&
                    (order === "asc" ? (
                      <ArrowUp size={16} />
                    ) : (
                      <ArrowDown size={16} />
                    ))}
                </button>
              ) : (
                <span className="font-medium">
                  {column.headerName || column.field}
                </span>
              )}
            </TableHead>
          ))}
          {/* extra column for row action (row.action is a reserved column) */}
          {rowModels[0]?.data?.actions && <TableHead></TableHead>}
        </TableRow>
      </TableHeader>

      <TableBody ref={tableBodyRef}>
        {/* Virtual scrolling spacer for items above visible area */}
        {enableVirtualScrolling && offsetY > 0 && (
          <TableRow style={{ height: offsetY }}>
            <TableCell colSpan={columns.length + (checkboxSelection ? 1 : 0)} />
          </TableRow>
        )}

        {loading ? (
          <>
            {Array.from(new Array(20)).map((_el, i) => (
              <TableRow key={"row-" + i} role="checkbox">
                {checkboxSelection && (
                  <TableCell className="w-12">
                    <Skeleton className="w-4 h-4" />
                  </TableCell>
                )}
                {Array.from(new Array(columns.length)).map((_el, k) => (
                  <TableCell key={"col-" + k} align="left">
                    <Skeleton className="w-full h-[10px]" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </>
        ) : isError ? (
          <TableRow>
            <TableCell
              colSpan={columns.length + (checkboxSelection ? 1 : 0)}
              className="h-24"
            >
              <ErrorMsg error={error} />
            </TableCell>
          </TableRow>
        ) : visibleRows.length <= 0 ? (
          <TableRow>
            <TableCell
              colSpan={columns.length + (checkboxSelection ? 1 : 0)}
              className="h-24 text-center"
            >
              <EmptyState
                title="No Data Found"
                icon={<Braces />}
                {...emptyStateProps}
              />
            </TableCell>
          </TableRow>
        ) : (
          visibleRows.map((rowModel, i) => {
            const actualIndex = enableVirtualScrolling
              ? visibleRange.start + i
              : i;
            return (
              <TableRow
                key={`${actualIndex}-${rowModel?.id}`}
                data-state={rowModel.selected ? "selected" : undefined}
                style={
                  enableVirtualScrolling ? { height: rowHeight } : undefined
                }
                onClick={(ev) => {
                  ev.stopPropagation();
                  if (disableSelectionOnClick) return;
                  handleRowClick(rowModel);
                }}
              >
                {checkboxSelection && (
                  <TableCell className="w-12">
                    <Checkbox
                      checked={rowModel.selected}
                      onCheckedChange={() => handleRowClick(rowModel)}
                      onClick={(ev) => ev.stopPropagation()}
                      aria-label={`Select row ${actualIndex}`}
                    />
                  </TableCell>
                )}

                {columns.map((column, i) => (
                  <TableCell
                    key={column.field + i}
                    className={
                      column.align === "right"
                        ? "text-right"
                        : column.align === "center"
                          ? "text-center"
                          : "text-left"
                    }
                  >
                    {column.renderCell
                      ? column.renderCell(rowModel.data)
                      : column.valueGetter
                        ? column.valueGetter(rowModel.data)
                        : rowModel.data[column.field]}
                  </TableCell>
                ))}

                {rowModel?.data.actions && (
                  <TableCell>
                    <DropdownMenu modal={false}>
                      <DropdownMenuTrigger>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {rowModel?.data.actions}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                )}
              </TableRow>
            );
          })
        )}

        {/* Virtual scrolling spacer for items below visible area */}
        {enableVirtualScrolling && (
          <tr
            style={{
              height: Math.max(
                0,
                totalHeight - offsetY - visibleRows.length * rowHeight,
              ),
            }}
          >
            <td colSpan={columns.length + (checkboxSelection ? 1 : 0)} />
          </tr>
        )}
      </TableBody>
    </Table>
  );

  return (
    <div className={cn("w-full h-full", className)}>
      <div
        className={cn("rounded-md flex flex-col h-full", bordered && "border")}
      >
        <div className={cn("flex items-center", tableHeaderClass)}>
          {checkboxSelection && (
            <div className="flex-1 text-sm text-muted-foreground">
              {selection.length} of {rows.length} row(s) selected.
            </div>
          )}
          {props.tableHeader}
        </div>

        {enableVirtualScrolling ? (
          <div
            ref={scrollContainerRef}
            className="overflow-auto"
            style={{ height: containerHeight }}
            onScroll={handleScroll}
          >
            {tableContent}
          </div>
        ) : (
          <div className="overflow-auto">{tableContent}</div>
        )}

        {isPaginated && !enableVirtualScrolling && (
          <div className={cn(paginationClass)}>
            <Pagination
              current={page}
              onPageChange={handlePageChange}
              totalPages={pageSize}
              totalItems={totalItems}
              itemsPerPage={
                rows.length > 0
                  ? Math.ceil((totalItems ?? rows.length) / pageSize)
                  : 20
              }
              itemLabel={itemLabel}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default DataGrid;
