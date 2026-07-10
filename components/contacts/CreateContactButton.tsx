"use client"

import { Button } from "@/components/ui/button"

export function CreateContactButton() {
  const handleClick = () => {
    // TODO: Open create contact modal
    alert("Create contact coming soon")
  }

  return (
    <Button
      onClick={handleClick}
      className="bg-accent-fuchsia hover:bg-accent-fuchsia/90 text-white"
    >
      + Create Contact
    </Button>
  )
}
