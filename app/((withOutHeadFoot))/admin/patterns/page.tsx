import React from "react";
import AttributeManager from "../components/AttributeManager";

export default function AdminPatternsPage() {
  return (
    <AttributeManager 
      type="patterns" 
      title="Patterns" 
      description="Manage design patterns such as Solid, Striped, Checked, etc." 
    />
  );
}
