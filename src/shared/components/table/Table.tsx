import type { ReactNode } from "react";
import { classNames } from "../../utils/classNames";

export type TableColumn<T> = {
  key: string;
  header: string;
  align?: "left" | "right" | "center";
  className?: string;
  headerClassName?: string;
  cellClassName?: string;
  render: (row: T) => ReactNode;
};

type TableProps<T> = {
  columns: TableColumn<T>[];
  rows: T[];
  rowKey: (row: T, index: number) => string;
  emptyState?: ReactNode;
  rowClassName?: (row: T, index: number) => string;
  tableClassName?: string;
  wrapperClassName?: string;
};

const alignClass: Record<NonNullable<TableColumn<unknown>["align"]>, string> = {
  left: "text-left",
  right: "text-right",
  center: "text-center",
};

export const Table = <T,>({
  columns,
  rows,
  rowKey,
  emptyState,
  rowClassName,
  tableClassName,
  wrapperClassName,
}: TableProps<T>) => {
  if (rows.length === 0) {
    return <>{emptyState ?? null}</>;
  }

  return (
    <div className={classNames("overflow-x-auto", wrapperClassName)}>
      <table className={classNames("w-full min-w-190 table-fixed text-sm", tableClassName)}>
        <thead>
          <tr className="text-xs uppercase tracking-[0.12em] text-neutral-40">
            {columns.map((column) => (
              <th
                key={column.key}
                className={classNames(
                  "pb-2",
                  alignClass[column.align ?? "left"],
                  column.className,
                  column.headerClassName,
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr
              key={rowKey(row, index)}
              className={classNames(
                "border-t border-neutral-90 text-primary-10",
                rowClassName?.(row, index),
              )}
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={classNames(
                    "py-2",
                    alignClass[column.align ?? "left"],
                    column.className,
                    column.cellClassName,
                  )}
                >
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
