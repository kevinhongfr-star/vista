import { createServerClient } from "@/lib/supabase/server"
import { B2CIntegrationSettings } from "./B2CIntegrationSettings"

export const dynamic = 'force-dynamic'

export default async function B2CIntegrationSettingsPage() {
  const supabase = createServerClient()

  const { data: configRow } = await supabase
    .from('platform_settings')
    .select('value')
    .eq('key', 'b2c_integration_config')
    .single()

  return (
    <B2CIntegrationSettings
      initialConfig={configRow?.value || null}
    />
  )
}
