// @flow
import * as React from 'react';
import type {IEnvironment} from 'relay-runtime';

type EnvironmentProviderProps = {
  environment: IEnvironment,
  children: React.Node,
};

export const EnvironmentContext = React.createContext<IEnvironment>({});

export function useEnvironment() {
  return React.useContext(EnvironmentContext);
}

export function withEnvironment<Config, Instance>(
  Component: React.AbstractComponent<Config>,
) {
  return React.forwardRef<Config, Instance>((props, ref) => (
    <EnvironmentContext.Consumer>
      {context => <Component {...props} ref={ref} environment={context} />}
    </EnvironmentContext.Consumer>
  ));
}

export function EnvironmentProvider({
  environment,
  children,
}: EnvironmentProviderProps) {
  return (
    <EnvironmentContext.Provider value={environment}>
      {children}
    </EnvironmentContext.Provider>
  );
}
