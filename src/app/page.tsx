import { Dashboard } from "@/components/dashboard";
import { buildSnapshot, buildSource } from "@/lib/build-data";
import { getConfig } from "@/lib/config";

export default function HomePage() {
  const config = getConfig();

  return (
    <Dashboard
      initial={buildSnapshot()}
      source={buildSource(config)}
      hasProtected={config.monitors.some((m) => m.secure)}
      contact={config.site.contact}
    />
  );
}
