'use client';

import React, { useContext, useEffect, useState } from 'react';
import { SecureLocalStorage } from '../utils/secureStorage';
import { createContext } from 'react';

interface SecureStorageContextValue {
    secureStorage: SecureLocalStorage | null;
}

export const SecureStorageContext = createContext<SecureStorageContextValue>({
    secureStorage: null,
});

interface SecureStorageProviderProps {
    children: React.ReactNode;
}

export const SecureStorageProvider: React.FC<SecureStorageProviderProps> = ({ children }) => {
    const [secureStorage, setSecureStorage] = useState<SecureLocalStorage | null>(null);

    useEffect(() => {
        // Ensure this code runs only on the client

        const newSecureStorage = new SecureLocalStorage();
        setSecureStorage(newSecureStorage);
        // newSecureStorage.updateSubscriptions();

    }, []);

    return (
        <SecureStorageContext.Provider value={{ secureStorage }}>
            {children}
        </SecureStorageContext.Provider>
    );
};

export const useSecureStorage = () => {
    const { secureStorage } = useContext(SecureStorageContext);

    return secureStorage;
};