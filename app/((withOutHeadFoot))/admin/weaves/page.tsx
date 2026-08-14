import React from "react";
import AttributeManager from "../components/AttributeManager";

export default function AdminWeavesPage() {
  return (
    <AttributeManager 
      type="weaves" 
      title="Weaves" 
      description="Manage fabric weaves like Twill, Poplin, Oxford, etc." 
    />
  );
}
