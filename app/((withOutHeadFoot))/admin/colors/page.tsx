import React from "react";
import AttributeManager from "../components/AttributeManager";

export default function AdminColorsPage() {
  return (
    <AttributeManager 
      type="colors" 
      title="Colors" 
      description="Manage product colors and their associated hex codes." 
      hasColorCode={true}
    />
  );
}
