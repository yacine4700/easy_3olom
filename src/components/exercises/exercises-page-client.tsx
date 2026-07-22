"use client";

import { ClipboardList } from "lucide-react";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { CollectionsView } from "@/components/exercises/collections-view";
import { ExercisesView } from "@/components/exercises/exercises-view";

/**
 * Client page for the Exercises module. Tabs switch between the two
 * sub-modules (Collections + Exercises). Each tab mounts its own
 * orchestrator view that owns filter state and CRUD dialogs.
 */
export function ExercisesPageClient() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <div className="bg-brand/10 text-brand flex size-7 items-center justify-center rounded-md">
            <ClipboardList className="size-4" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">التمارين</h1>
        </div>
        <p className="text-muted-foreground text-sm">
          إدارة السلاسل والتمارين.
        </p>
      </div>

      <Tabs defaultValue="collections" className="w-full">
        <TabsList>
          <TabsTrigger value="collections">السلاسل</TabsTrigger>
          <TabsTrigger value="exercises">التمارين</TabsTrigger>
        </TabsList>

        <TabsContent value="collections" className="mt-4">
          <CollectionsView />
        </TabsContent>
        <TabsContent value="exercises" className="mt-4">
          <ExercisesView />
        </TabsContent>
      </Tabs>
    </div>
  );
}
