'use client';

import * as React from 'react';
import {
  type ColumnDef,
  type RowData,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { ChevronDown, ChevronsUpDown, ChevronUp } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Channel, TopPage } from '@/lib/admin/analytics';
import type { PageRow, QueryRow } from '@/lib/admin/gsc';

declare module '@tanstack/react-table' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    align?: 'right';
  }
}

const nf = new Intl.NumberFormat('en-NZ');

// Generic sortable table. Columns are defined by the typed wrappers below (all
// client) so no render functions cross the server/client boundary.
function DataTable<TData>({
  columns,
  data,
  initialSort,
}: {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  initialSort?: SortingState;
}) {
  const [sorting, setSorting] = React.useState<SortingState>(initialSort ?? []);
  // TanStack Table's useReactTable returns fresh functions each render by design;
  // the react-hooks "incompatible-library" memoization warning is a known false
  // positive for it.
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((hg) => (
          <TableRow key={hg.id} className="hover:bg-transparent">
            {hg.headers.map((header) => {
              const right = header.column.columnDef.meta?.align === 'right';
              const sorted = header.column.getIsSorted();
              return (
                <TableHead key={header.id} className={right ? 'text-right' : undefined}>
                  {header.isPlaceholder ? null : header.column.getCanSort() ? (
                    <button
                      type="button"
                      onClick={header.column.getToggleSortingHandler()}
                      className={`inline-flex items-center gap-1 transition-colors hover:text-charcoal ${
                        right ? 'flex-row-reverse' : ''
                      }`}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {sorted === 'asc' ? (
                        <ChevronUp className="size-3.5" />
                      ) : sorted === 'desc' ? (
                        <ChevronDown className="size-3.5" />
                      ) : (
                        <ChevronsUpDown className="size-3.5 opacity-40" />
                      )}
                    </button>
                  ) : (
                    flexRender(header.column.columnDef.header, header.getContext())
                  )}
                </TableHead>
              );
            })}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows.map((row) => (
          <TableRow key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <TableCell
                key={cell.id}
                className={cell.column.columnDef.meta?.align === 'right' ? 'text-right' : undefined}
              >
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function shortPath(url: string): string {
  try {
    return new URL(url).pathname || url;
  } catch {
    return url.replace(/^sc-domain:/, '');
  }
}

// ── Analytics: most-viewed pages ───────────────────────────────────────────
export function TopPagesTable({ data }: { data: TopPage[] }) {
  const columns: ColumnDef<TopPage, unknown>[] = [
    {
      accessorKey: 'title',
      header: 'Page',
      cell: ({ row }) => (
        <span className="block max-w-[28rem] truncate">
          {row.original.title || row.original.path}
        </span>
      ),
      enableSorting: false,
    },
    {
      accessorKey: 'views',
      header: 'Views',
      cell: ({ getValue }) => nf.format(getValue<number>()),
      meta: { align: 'right' },
    },
  ];
  return <DataTable columns={columns} data={data} initialSort={[{ id: 'views', desc: true }]} />;
}

// ── Analytics: traffic sources ─────────────────────────────────────────────
export function ChannelsTable({ data }: { data: Channel[] }) {
  const columns: ColumnDef<Channel, unknown>[] = [
    { accessorKey: 'name', header: 'Source', enableSorting: false },
    {
      accessorKey: 'sessions',
      header: 'Visits',
      cell: ({ getValue }) => nf.format(getValue<number>()),
      meta: { align: 'right' },
    },
  ];
  return <DataTable columns={columns} data={data} initialSort={[{ id: 'sessions', desc: true }]} />;
}

// ── SEO: top search queries ────────────────────────────────────────────────
export function SearchQueriesTable({ data }: { data: QueryRow[] }) {
  const columns: ColumnDef<QueryRow, unknown>[] = [
    {
      accessorKey: 'query',
      header: 'Search term',
      cell: ({ getValue }) => (
        <span className="block max-w-[20rem] truncate">{getValue<string>()}</span>
      ),
      enableSorting: false,
    },
    {
      accessorKey: 'clicks',
      header: 'Clicks',
      cell: ({ getValue }) => nf.format(getValue<number>()),
      meta: { align: 'right' },
    },
    {
      accessorKey: 'position',
      header: 'Spot',
      cell: ({ getValue }) => getValue<number>().toFixed(0),
      meta: { align: 'right' },
    },
  ];
  return <DataTable columns={columns} data={data} initialSort={[{ id: 'clicks', desc: true }]} />;
}

// ── SEO: landing pages from search ─────────────────────────────────────────
export function SearchPagesTable({ data }: { data: PageRow[] }) {
  const columns: ColumnDef<PageRow, unknown>[] = [
    {
      accessorKey: 'page',
      header: 'Page',
      cell: ({ getValue }) => (
        <span className="block max-w-[22rem] truncate font-mono text-[14px]">
          {shortPath(getValue<string>())}
        </span>
      ),
      enableSorting: false,
    },
    {
      accessorKey: 'clicks',
      header: 'Clicks',
      cell: ({ getValue }) => nf.format(getValue<number>()),
      meta: { align: 'right' },
    },
  ];
  return <DataTable columns={columns} data={data} initialSort={[{ id: 'clicks', desc: true }]} />;
}
