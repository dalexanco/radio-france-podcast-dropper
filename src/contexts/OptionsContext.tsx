import React, { createContext, useContext } from "react";

export interface Options {
  format: string;
  output: string;
  verbose?: boolean;
}

interface OptionsContextValue {
  options: Options;
}

export const defaultOptions: Options = {
  format: "table",
  output: "downloads",
  verbose: false,
};

const OptionsContext = createContext<OptionsContextValue>({
  options: defaultOptions,
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

