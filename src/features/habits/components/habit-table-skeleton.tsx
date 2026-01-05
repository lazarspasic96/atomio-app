import { Skeleton } from "~/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";

export function HabitTableSkeleton() {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-9 w-28" />
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">
                <Skeleton className="h-4 w-12" />
              </TableHead>
              {Array.from({ length: 3 }).map((_, i) => (
                <TableHead key={i} className="text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-4 rounded" />
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 7 }).map((_, rowIndex) => (
              <TableRow key={rowIndex}>
                <TableCell>
                  <Skeleton className="h-4 w-36" />
                </TableCell>
                {Array.from({ length: 3 }).map((_, colIndex) => (
                  <TableCell key={colIndex} className="text-center">
                    <Skeleton className="mx-auto h-4 w-4 rounded" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
            {/* Summary row */}
            <TableRow className="bg-muted/50">
              <TableCell>
                <Skeleton className="h-4 w-28" />
              </TableCell>
              {Array.from({ length: 3 }).map((_, colIndex) => (
                <TableCell key={colIndex} className="text-center">
                  <Skeleton className="mx-auto h-4 w-8" />
                </TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
