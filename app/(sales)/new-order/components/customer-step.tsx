import { UseFormReturn } from "react-hook-form";
import Link from "next/link";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TabsContent } from "@/components/ui/tabs";
import { OrderFormValues } from "../schema";

export function CustomerStep({
  form,
  onNext,
}: {
  form: UseFormReturn<OrderFormValues>;
  onNext: () => void;
}) {
  return (
    <TabsContent
      value="customer"
      className="mt-0 outline-none max-w-xl mx-auto"
    >
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-[#1E202E] tracking-tight">
            Customer Information
          </h2>
          <p className="text-neutral-500 mt-2 text-sm">
            Provide customer details for notifications and pickup confirmation.
          </p>
        </div>

        <div className="space-y-4">
          <FormField
            control={form.control}
            name="customerName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#1E202E] font-medium text-sm">
                  Customer Name <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter customer name"
                    className="bg-background shadow-none h-11 px-4 placeholder:text-neutral-400 font-medium text-neutral-800"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#1E202E] font-medium text-sm">
                  Email <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="customer@example.com"
                    className="bg-background shadow-none h-11 px-4 placeholder:text-neutral-400 font-medium text-neutral-800"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[#1E202E] font-medium text-sm">
                  Phone
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="(555) 123-4567"
                    className="bg-background shadow-none h-11 px-4 placeholder:text-neutral-400 font-medium text-neutral-800"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Footer Actions */}
        <div className="pt-6 flex items-center gap-3">
          <Button
            type="button"
            onClick={onNext}
            className="bg-[#0A0D1E] text-white hover:bg-[#1E202E] px-8 h-10 rounded-md font-medium"
          >
            Next
          </Button>
          <Link href="/">
            <Button
              variant="outline"
              type="button"
              className="bg-white text-neutral-700 border-neutral-200 hover:bg-background px-6 h-10 rounded-md font-medium"
            >
              Cancel
            </Button>
          </Link>
        </div>
      </div>
    </TabsContent>
  );
}
