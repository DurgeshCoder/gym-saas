import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingDashboard() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      <div className="flex flex-col gap-3">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 h-full">
          <Skeleton className="w-full h-[400px] rounded-xl" />
        </div>
        
        <div className="lg:col-span-8 h-full">
          <Skeleton className="w-full h-[400px] rounded-xl" />
        </div>

        <div className="lg:col-span-12">
          <Skeleton className="w-full h-[500px] rounded-xl" />
        </div>
      </div>
    </div>
  );
}
