/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useCallback, useState, useRef } from "react";
import { QrReader } from "@cmdnio/react-qr-reader";
import { Button } from "./ui/button";
import { Image as ImageIcon } from "lucide-react";
import { BrowserQRCodeReader } from "@zxing/browser";
import { cn } from "@/lib/utils";

type QrCodeScannerProps = {
  className?: string;
  facingMode?: "environment" | "user";
  onResult?: (result: any) => void;
};

const QrCodeScanner = ({
  className,
  facingMode = "environment",
  onResult = () => {},
}: QrCodeScannerProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [legacyMode, setLegacyMode] = useState(false);
  const [message, setMessage] = useState("");
  const [lastScannedResult, setLastScannedResult] = useState<string | null>(
    null,
  );

  const handleScanResult = useCallback(
    (result: string | null) => {
      if (!result) return setMessage("No QR detected.");
      if (result === lastScannedResult) return;
      setLastScannedResult(result);
      onResult(result);
    },
    [onResult, lastScannedResult],
  );

  const handleScanError = useCallback((err: Error) => {
    setMessage(err.message);
  }, []);

  const handleQrImageSelection = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        const reader = new FileReader();
        reader.onload = async () => {
          const imageUrl = reader.result as string;
          const img = new Image();

          img.onload = async () => {
            try {
              const canvas = document.createElement("canvas");
              const ctx = canvas.getContext("2d");
              if (!ctx) throw new Error("Could not create canvas context");
              canvas.width = img.width;
              canvas.height = img.height;
              ctx.drawImage(img, 0, 0);

              const codeReader = new BrowserQRCodeReader();
              try {
                const result = await codeReader.decodeFromCanvas(canvas);
                handleScanResult(result.getText());
              } catch (_) {
                setMessage(
                  "No QR code found in image. Please try another image.",
                );
              }
            } catch (_) {
              handleScanError(new Error("Failed to process image"));
            }
          };

          img.onerror = () =>
            handleScanError(new Error("Failed to load image"));
          img.src = imageUrl;
        };
        reader.readAsDataURL(file);
      } catch (error) {
        handleScanError(error as Error);
      }
    },
    [handleScanResult, handleScanError],
  );

  return (
    <div className={cn("flex flex-col w-full h-full", className)}>
      {/* Scanner / upload area */}
      {legacyMode ? (
        <div className="flex-1 flex items-center justify-center">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleQrImageSelection}
            style={{ display: "none" }}
          />
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-full min-h-32 flex flex-col items-center justify-center gap-2 rounded-xl border-dashed"
          >
            <ImageIcon className="h-8 w-8 text-gray-400" />
            <span className="text-sm text-gray-500">
              Click to upload QR image
            </span>
          </Button>
        </div>
      ) : (
        <div className="flex-1 w-full overflow-hidden rounded-xl">
          <QrReader
            constraints={{ facingMode }}
            onResult={(result, error) => {
              if (result?.getText()) handleScanResult(result.getText());
              if (error) handleScanError(error);
            }}
            containerStyle={{ width: "100%", height: "100%" }}
            videoStyle={{ width: "100%", height: "100%", objectFit: "cover" }}
            scanDelay={300}
          />
        </div>
      )}

      {/* Status message */}
      {message && (
        <p className="mt-2 text-xs text-muted-foreground text-center">
          {message}
        </p>
      )}

      {/* Toggle */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          setMessage("");
          setLegacyMode((prev) => !prev);
        }}
        className="mt-2 self-center text-xs text-gray-500"
      >
        {legacyMode ? "Use live camera" : "Scan from image"}
      </Button>
    </div>
  );
};

QrCodeScanner.displayName = "QrCodeScanner";

export default QrCodeScanner;
