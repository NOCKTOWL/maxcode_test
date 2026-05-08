"use client";

import { createContext, useContext, useMemo, useState } from "react";

type NavbarVisibilityContextValue = {
  isVisible: boolean;
  setIsVisible: (value: boolean) => void;
};

const NavbarVisibilityContext = createContext<
  NavbarVisibilityContextValue | undefined
>(undefined);

export const NavbarVisibilityProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const value = useMemo(
    () => ({
      isVisible,
      setIsVisible,
    }),
    [isVisible],
  );

  return (
    <NavbarVisibilityContext.Provider value={value}>
      {children}
    </NavbarVisibilityContext.Provider>
  );
};

export const useNavbarVisibility = () => {
  const context = useContext(NavbarVisibilityContext);
  if (!context) {
    throw new Error(
      "useNavbarVisibility must be used within NavbarVisibilityProvider",
    );
  }
  return context;
};
