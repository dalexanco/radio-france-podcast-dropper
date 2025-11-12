import React, { createContext, useContext } from "react";

export interface Options {
  format: string;
  output: string;
}

interface OptionsContextValue {
  options: Options;
}

const OptionsContext = createContext<OptionsContextValue>({
  options: {
    format: "table",
    output: "downloads",
  },
});

export interface OptionsProviderProps {
  options: Options;
  children: React.ReactNode;
}

export const OptionsProvider: React.FC<OptionsProviderProps> = ({
  options,
  children,
}) => {
  return (
    <OptionsContext.Provider value={{ options }}>
      {children}
    </OptionsContext.Provider>
  );
};

export const useOptions = (): OptionsContextValue => {
  const context = useContext(OptionsContext);
  if (!context) {
    throw new Error("useOptions must be used within an OptionsProvider");
  }
  return context;
};

