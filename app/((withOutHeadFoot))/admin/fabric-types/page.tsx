import React from "react";
import AttributeManager from "../components/AttributeManager";

export default function AdminFabricTypesPage() {
  return (
    <AttributeManager 
      type="fabric-types" 
      title="Fabric Types" 
      description="Manage different fabric types like Organic Linen, Bamboo Cotton, etc." 
    />
  );
}
