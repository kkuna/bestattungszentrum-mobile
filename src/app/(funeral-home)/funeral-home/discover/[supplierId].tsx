import { useLocalSearchParams } from "expo-router"

import { SupplierDetailScreen } from "@/features/funeral-home/discovery/SupplierDetailScreen"

export default function FuneralHomeSupplierDetailRoute() {
  const params = useLocalSearchParams()

  return (
    <SupplierDetailScreen
      supplierId={getFirstParam(params.supplierId)}
      categoryId={getFirstParam(params.categoryId)}
    />
  )
}

function getFirstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}
