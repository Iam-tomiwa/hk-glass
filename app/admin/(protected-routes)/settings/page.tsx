"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Header } from "@/components/header";
import DeviceSetup from "./widgets/device-setup";
import CompanyDevices from "./widgets/company-devices";
import TwoFactorAuth from "./widgets/two-factor-auth";

export default function OrdersPage() {
  return (
    <div className="bg-[#F8F9FA]">
      <div className="mx-auto">
        {/* Header */}
        <Header
          title="Settings"
          className="border-b"
          description="Manage security, devices, and system configuration"
        />

        <Tabs orientation="horizontal" defaultValue="Device Setup">
          {/* Sidebar / Top Nav */}
          <div className="bg-background mb-6 border-b">
            <TabsList className="p-0 flex container h-auto w-full justify-start items-start space-x-4 bg-transparent overflow-x-auto rounded-none border-none">
              {[
                "Device Setup",
                "Company Devices",
                "Two factor Authentication",
              ].map((el) => (
                <TabsTrigger
                  key={el}
                  className="shadow-none! pt-4 pb-3 bg-none data-[state=active]:border-b rounded-none data-[state=active]:border-b-black h-full"
                  value={el}
                >
                  {el}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <TabsContent value="Device Setup">
            <DeviceSetup />
          </TabsContent>

          <TabsContent value="Company Devices">
            <CompanyDevices />
          </TabsContent>

          <TabsContent value="Two factor Authentication">
            <TwoFactorAuth />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
