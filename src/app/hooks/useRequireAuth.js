"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"

export function useRequireAuth() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // ⛔ JANGAN redirect sebelum loading selesai
    if (loading) return

    if (!user) {
      router.replace("/sign-in")
    }
  }, [user, loading, router])

  return {
    user,
    loading,
  }
}
