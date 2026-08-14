import React from "react";
import AttributeManager from "../components/AttributeManager";

export default function AdminFabricOriginsPage() {
  return (
    <AttributeManager 
      type="fabric-origins" 
      title="Fabric Origins" 
      description="Manage geographical origins for fabrics, such as India, Italy, etc." 
    />
  );
}
