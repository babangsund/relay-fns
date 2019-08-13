// @flow

'use strict';

import React from 'react';
import type {IEnvironment} from 'relay-runtime';
import type {Node, AbstractComponent} from 'react';

export const EnvironmentContext = React.createContext<IEnvironment>({});

export function useEnvironment() {
  return React.useContext(EnvironmentContext);
}

export function withEnvironment<Config, Instance>(
  Component: AbstractComponent<
    {|...Config, environment: IEnvironment|},
    Instance,
  >,
) {
  return React.forwardRef<Config, Instance>((props, ref) => (
    <EnvironmentContext.Consumer>
      {context => <Component {...props} ref={ref} environment={context} />}
    </EnvironmentContext.Consumer>
  ));
}

export type EnvironmentProviderProps = {
  children: Node,
  environment: IEnvironment,
};

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
