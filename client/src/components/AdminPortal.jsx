import React from 'react';
import AdminUpload from './AdminUpload';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const AdminPortal = () => (
  <div className="relative bg-background min-h-screen">
    <div className="fixed top-0 left-0 w-full z-10 bg-background border-b border-muted flex items-center justify-between px-4 py-4">
      <h2 className="text-3xl font-bold text-foreground">Admin Portal</h2>
      <Button variant="outline" asChild>
        <a href="/">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Continue to Chat
        </a>
      </Button>
    </div>
    <div className="flex justify-center pt-24 px-4">
      <AdminUpload />
    </div>
  </div>
);

export default AdminPortal; 