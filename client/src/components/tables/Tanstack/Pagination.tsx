/* eslint-disable @typescript-eslint/no-explicit-any */
import { ActionIcon, Select, SelectOption, Text } from "rizzui";
import { type Table as ReactTableType } from "@tanstack/react-table";
import { HiChevronDoubleLeft, HiChevronDoubleRight, HiChevronLeft, HiChevronRight } from "react-icons/hi2";

const options = [
  { value: 5, label: "5" },
  { value: 10, label: "10" },
  { value: 15, label: "15" },
  { value: 20, label: "20" },
];

export default function TablePagination<TData extends Record<string, any>>({
  table,
}: {
  table: ReactTableType<TData>;
}) {
  return (
    <div className="flex w-full items-center justify-between p-2 @container">
      <div className="hidden @2xl:block">
        <Text className="text-gray-700 dark:text-gray-300">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </Text>
      </div>
      <div className="flex w-full items-center justify-between gap-6 @2xl:w-auto @2xl:gap-12 mt-4">
        <div className="flex items-center gap-4">
          <Text className="hidden font-medium text-gray-900 dark:text-gray-100 @md:block">Rows per page</Text>
          <Select
            options={options}
            className="w-[70px]"
            value={table.getState().pagination.pageSize}
            onChange={(v) => {
              table.setPageSize(Number((v as SelectOption).value));
            }}
            selectClassName="font-semibold text-sm ring-0 shadow-sm h-9 bg-white dark:bg-boxdark text-gray-900 dark:text-gray-100 border-gray-300 dark:border-strokedark"
            optionClassName="justify-center font-medium bg-white dark:bg-boxdark text-gray-900 dark:text-gray-100"
            dropdownClassName="bg-white dark:bg-boxdark border-gray-200 dark:border-strokedark shadow-lg dark:shadow-gray-900/20"
          />
        </div>
        <Text className="hidden font-medium text-gray-900 dark:text-gray-100 @3xl:block">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount().toLocaleString()}
        </Text>
        <div className="grid grid-cols-4 gap-2">
          <ActionIcon
            rounded="lg"
            variant="outline"
            aria-label="Go to first page"
            onClick={() => table.firstPage()}
            disabled={!table.getCanPreviousPage()}
            className="text-gray-900 dark:text-gray-100 bg-white dark:bg-boxdark border-gray-300 dark:border-strokedark shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 disabled:text-gray-400 dark:disabled:text-gray-600 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:border-gray-200 dark:disabled:border-gray-700 disabled:shadow-none transition-colors duration-200"
          >
            <HiChevronDoubleLeft className="size-5" />
          </ActionIcon>
          <ActionIcon
            rounded="lg"
            variant="outline"
            aria-label="Go to previous page"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="text-gray-900 dark:text-gray-100 bg-white dark:bg-boxdark border-gray-300 dark:border-strokedark shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 disabled:text-gray-400 dark:disabled:text-gray-600 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:border-gray-200 dark:disabled:border-gray-700 disabled:shadow-none transition-colors duration-200"
          >
            <HiChevronLeft className="size-5" />
          </ActionIcon>
          <ActionIcon
            rounded="lg"
            variant="outline"
            aria-label="Go to next page"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="text-gray-900 dark:text-gray-100 bg-white dark:bg-boxdark border-gray-300 dark:border-strokedark shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 disabled:text-gray-400 dark:disabled:text-gray-600 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:border-gray-200 dark:disabled:border-gray-700 disabled:shadow-none transition-colors duration-200"
          >
            <HiChevronRight className="size-5" />
          </ActionIcon>
          <ActionIcon
            rounded="lg"
            variant="outline"
            aria-label="Go to last page"
            onClick={() => table.lastPage()}
            disabled={!table.getCanNextPage()}
            className="text-gray-900 dark:text-gray-100 bg-white dark:bg-boxdark border-gray-300 dark:border-strokedark shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 disabled:text-gray-400 dark:disabled:text-gray-600 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:border-gray-200 dark:disabled:border-gray-700 disabled:shadow-none transition-colors duration-200"
          >
            <HiChevronDoubleRight className="size-5" />
          </ActionIcon>
        </div>
      </div>
    </div>
  );
}
