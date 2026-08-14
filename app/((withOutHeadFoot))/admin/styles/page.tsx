import React from "react";
import AttributeManager from "../components/AttributeManager";

export default function AdminStylesPage() {
  return (
    <AttributeManager 
      type="styles" 
      title="Styles" 
      description="Manage styles like Formal, Casual, Party Wear, etc." 
    />
  );
}
