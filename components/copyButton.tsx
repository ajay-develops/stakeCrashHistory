"use client";
import React, { useState } from "react";
import { Copy } from "lucide-react"; // Assuming lucide-react for the Copy icon
import { Button } from "@heroui/button";

const CopyButton = ({ textToCopy = "", children = "Click Here" }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <Button size="sm" variant="flat" onPress={handleCopy}>
      <Copy size={14} />
      {copied ? "Copied!" : children || "Copy Code"}
    </Button>
  );
};

export default CopyButton;
