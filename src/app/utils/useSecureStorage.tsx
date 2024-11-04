import { useEffect, useState } from "react"
import { SecureLocalStorage } from "./secureStorage"

export const useSecureStorage = () => {
    const [secureStorage, setSecureStorage] = useState<SecureLocalStorage>()
    useEffect(() => {
        if (!window?.localStorage) return
        setSecureStorage(new SecureLocalStorage())
    }, [])


    return secureStorage
}