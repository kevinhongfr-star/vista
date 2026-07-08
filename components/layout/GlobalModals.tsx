"use client"

import { useState } from "react"
import { EmailComposer } from "@/components/modals/EmailComposer"
import { ActivityLog } from "@/components/modals/ActivityLog"
import { Toaster, useToasts } from "@/components/ui/toast"
import type { VistaContact, ActivityType } from "@/lib/types"

export function GlobalModals() {
  const { toasts, dismissToast } = useToasts()
  const [emailComposerOpen, setEmailComposerOpen] = useState(false)
  const [activityLogOpen, setActivityLogOpen] = useState(false)
  const [prefilledContact, setPrefilledContact] = useState<VistaContact | undefined>()
  const [prefilledContacts, setPrefilledContacts] = useState<VistaContact[] | undefined>()
  const [prefilledActivityType, setPrefilledActivityType] = useState<ActivityType | undefined>()

  const openEmailComposer = (contact?: VistaContact, contacts?: VistaContact[]) => {
    setPrefilledContact(contact)
    setPrefilledContacts(contacts)
    setEmailComposerOpen(true)
  }

  const openActivityLog = (contact?: VistaContact, activityType?: ActivityType) => {
    setPrefilledContact(contact)
    setPrefilledActivityType(activityType)
    setActivityLogOpen(true)
  }

  return (
    <>
      <EmailComposer
        isOpen={emailComposerOpen}
        onClose={() => setEmailComposerOpen(false)}
        prefilledContact={prefilledContact}
        prefilledContacts={prefilledContacts}
      />
      <ActivityLog
        isOpen={activityLogOpen}
        onClose={() => setActivityLogOpen(false)}
        prefilledContact={prefilledContact}
        prefilledType={prefilledActivityType}
      />
      <Toaster toasts={toasts} onDismiss={dismissToast} />
    </>
  )
}