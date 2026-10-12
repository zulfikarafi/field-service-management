/* eslint-disable @typescript-eslint/no-explicit-any */
import MainTable from "./Table";
import TablePagination from "./Pagination";
import { Table } from "@tanstack/react-table";

interface TanStackTableProps {
  table: Table<any>;
}

export default function TanStackTable({ table }: TanStackTableProps) {
  return (
    <>
      <MainTable table={table} />
      <TablePagination table={table} />
    </>
  );
}