// @flow
import * as React from "react"

type EnvironmentProviderProps = {
  environment: any,
  children: React.Node
}

// TODO: Can we resolve environment to a proper type?
export const EnvironmentContext = React.createContext<any>({})

export function useEnvironment() {
  return React.useContext(EnvironmentContext)
}

export function withEnvironment<Config, Instance>(Component: React.AbstractComponent<Config>) {
  return React.forwardRef<Config, Instance>((props, ref) => (
    <EnvironmentContext.Consumer>
      {context => <Component {...props} ref={ref} environment={context} />}
    </EnvironmentContext.Consumer>
  ))
}

export function EnvironmentProvider({ environment, children }: EnvironmentProviderProps) {
  return <EnvironmentContext.Provider value={environment}>{children}</EnvironmentContext.Provider>
}
