"use client";
import { Card, CardContent } from "@/components/ui/card";
import { Info, MonitorStop, Plus } from "lucide-react";
import SpecTable from "@/components/spec-item";
import { Button } from "@/components/ui/button";
import RegisterDeviceModal from "./register";

export default function DeviceSetup() {
  return (
    <div className="max-w-[650px] min-h-screen mx-auto py-10">
      <h1 className="font-bold text-xl mb-2">Device Setup</h1>
      <p className="text-gray-600">
        Register new devices and view current device information.
      </p>
      <Card className="my-6">
        <CardContent>
          <div className="flex gap-2">
            <MonitorStop />
            <p className="text-lg font-semibold">Current Device Information</p>
          </div>

          <SpecTable
            className="my-4"
            rows={[
              { label: "Browser", value: "Chrome 122" },
              { label: "Operating System:", value: "Windows 11" },
            ]}
          />

          <div className="bg-[#F0FDF4] my-4 rounded-lg p-4 flex gap-2 text-[#327C3F]">
            <Info />
            <div>
              <p className="font-semibold">
                This device is registered and authorized
              </p>
              <p className="text-sm mt-1">
                This device is connected to the glasstronics ecosystem and is an
                authorized device.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      <RegisterDeviceModal>
        <Button>
          <Plus />
          Register New Device
        </Button>
      </RegisterDeviceModal>
    </div>
  );
}
