"use client";

import { useState } from "react";

import {
  Card,
  CardBody,
  Textarea,
  Button,
  CardHeader,
  CardFooter,
  Input,
} from "@heroui/react";

export default function ManualUploadPage() {
  const [curlText, setCurlText] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const extractHeadersFromCurl = (curl: string): Record<string, string> => {
    const headers: Record<string, string> = {};
    const headerRegex = /-H\s+['"]([^:]+):\s?([^'"]+)['"]/g;

    let match;
    while ((match = headerRegex.exec(curl)) !== null) {
      const [, key, value] = match;
      headers[key.trim()] = value.trim();
    }

    return headers;
  };

  const handleUpload = async () => {
    setIsLoading(true);
    setMessage("");
    try {
      if (!apiKey.trim()) {
        setMessage("❌ Please enter your API key.");
        return;
      }

      const headers = extractHeadersFromCurl(curlText);

      if (!headers || Object.keys(headers).length === 0) {
        setMessage("❌ No headers found in curl.");
        return;
      }

      const res = await fetch("/api/stake-crash-history/headers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "app-api-key": apiKey,
        },
        body: JSON.stringify({ headers }),
      });

      const json = await res.json();

      if (res.ok) {
        setMessage("✅ Headers uploaded successfully.");
        console.log("Upload success:", json);
      } else {
        setMessage(`❌ Upload failed: ${json.error}`);
        console.error("Upload error:", json);
      }
    } catch (err) {
      console.error("Upload error:", err);
      setMessage("❌ Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto mt-8">
      <CardHeader className="space-y-2 flex flex-col">
        <h2 className="text-3xl">Manual Header Upload</h2>
        <Input
          label="API Key"
          type="password"
          placeholder="Enter your API key"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className="w-full"
        />
        {message && (
          <p
            className={`mt-2 text-sm ${
              message.startsWith("✅") ? "text-green-600" : "text-red-600"
            }`}
          >
            {message}
          </p>
        )}
      </CardHeader>
      <CardBody>
        <Textarea
          rows={10}
          value={curlText}
          onChange={(e) => setCurlText(e.target.value)}
          className="w-full font-mono"
          placeholder="Paste full curl command here..."
        />
      </CardBody>
      <CardFooter>
        <Button
          className="mx-auto"
          isLoading={isLoading}
          onPress={handleUpload}
        >
          Upload Headers
        </Button>
      </CardFooter>
    </Card>
  );
}
