import { Table } from "rizzui";
import { flexRender, Table as TanStackTableTypes } from "@tanstack/react-table";

type TablePropsTypes<T> = {
  table: TanStackTableTypes<T>;
};

export default function MainTable<T>({ table }: TablePropsTypes<T>) {
  const footers = table
    .getFooterGroups()
    .map((group) => group.headers.map((header) => header.column.columnDef.footer))
    .flat()
    .filter(Boolean);

  return (
    <div className="w-full overflow-x-auto overflow-y-hidden custom-scrollbar">
      <Table
        className="!shadow-none !border-0 bg-white dark:bg-boxdark"
        style={{
          width: table.getTotalSize(),
        }}
      >
        <Table.Header className="bg-gray-2 dark:bg-meta-4 !border-y-0">
          {table.getHeaderGroups().map((headerGroup) => {
            return (
              <Table.Row key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <Table.Head
                      key={header.id}
                      colSpan={header.colSpan}
                      style={{
                        width: header.getSize(),
                      }}
                      className="!text-start"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </Table.Head>
                  );
                })}
              </Table.Row>
            );
          })}
        </Table.Header>
        <Table.Body className="bg-white dark:bg-boxdark">
          {table.getRowModel().rows.map((row) => (
            <Table.Row 
              className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
              key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <Table.Cell
                  key={cell.id}
                  className="!text-start"
                  style={{
                    width: cell.column.getSize(),
                  }}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </Table.Cell>
              ))}
            </Table.Row>
          ))}
        </Table.Body>

        {footers.length > 0 && (
          <Table.Footer>
            {table.getFooterGroups().map((footerGroup) => (
              <Table.Row key={footerGroup.id}>
                {footerGroup.headers.map((footer) => {
                  return (
                    <Table.Cell key={footer.id}>
                      {footer.isPlaceholder ? null : (
                        <>{flexRender(footer.column.columnDef.footer, footer.getContext())}</>
                      )}
                    </Table.Cell>
                  );
                })}
              </Table.Row>
            ))}
          </Table.Footer>
        )}
      </Table>
    </div>
  );
}