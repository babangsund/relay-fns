# relay-fns

Functions for Relay

## Installation

Using [npm](https://www.npmjs.com/):

    $ npm install --save relay-fns

Using [yarn](https://yarnpkg.com/):

    $ yarn add relay-fns


Then with a module bundler like [webpack](https://webpack.github.io/), use as you would anything else:

```js
// Using ES6 Modules
import { useCommitMutation } from "relay-fns"
// using CommonJS modules
const useCommitMutation = require("relay-fns").useCommitMutation
```

## Usage

* [Environment](#injecting-environment)
* [fetchQuery](#fetchquery)
* [commitMutation](#commitmutation)
* [createMutation](#create)
* [updateMutation](#update)
* [deleteMutation](#delete)
* [HOCs](#utility-hocs)
* [Executables](#executables)

---

It is required to pass down the [Environment](https://relay.dev/docs/en/relay-environment) via Context on the top-level.  
Why? Passing environment as a parameter to every function polludes the API.

```jsx
import { EnvironmentProvider } from "relay-fns"
import MyApp from "./MyApp"

function MyAppContext({children}) {
	return (
		<EnvironmentProvider environment={environment}>
			<MyApp />
		</EnvironmentProvider>
	)
}
```
---
#### Injecting Environment

```jsx
// With a hook
import { useEnvironment } from "relay-fns"

function MyComponent() {
	const environment = useEnvironment();
	return (
		// Use Environment for something
	)
}

// With a hoc
import { withEnvironment } from "relay-fns"

@withEnvironment
class MyComponent extends React.Component {
	render() {
		return (
      // this.props.environment
			// Use Environment for something
		)
	}
}
```
---
#### FetchQuery
Provides FetchQuery with Environment pre-applied.

```jsx
// With a hook
import { useFetchQuery } from "relay-fns"

function MyComponent() {
	const fetchQuery = useFetchQuery();
	useEffect(() => {
		// Fetch some data
		fetchQuery(QUERY, VARIABLEs)
	})
}

// With a hoc
import { withFetchQuery } from "relay-fns"

@withFetchQuery
class MyComponent extends React.Component {
	componentDidMount() {
		// Fetch some data
		this.props.fetchQuery(QUERY, VARIABLES)
	}
}
```
---
#### CommitMutation
Provides CommitMutation with Environment pre-applied, and returns a promise.
Once the mutation is done,  the promise is resolved.
The promise is rejected if:
* `onError` is called
* `onCompleted` returns errors in the second argument
* The response contains a key named errors - which holds a non-empty value.

```jsx
// With a hook
import { useCommitMutation } from "relay-fns"

function MyComponent() {
	const commitMutation = useCommitMutation();
	function runSomeMutation() {
		commitMutation(MUTATION, INPUT, CONFIG)
			.then(() => console.log("Well done!"))
			.catch(() => console.error("You broke it!"))
	}
}

// With a hoc
import { withCommitMutation } from "relay-fns"

@withCommitMutation
class MyComponent extends React.Component {
	runSomeMutation() {
		this.props.commitMutation(MUTATION, INPUT, CONFIG)
			.then(() => console.log("Well done!"))
			.catch(() => console.error("You broke it!"))
	}
}
```
---
#### Create
If you create an item which resides in a list that isn't a connection, Relay is unable to put the item from the mutation payload, into your list.

To resolve the list, a config is required.
* `listName` The name of the list in GraphQL
* `listArgs` Any arguments required to resolve the list
* `parentID` Name of the parent, which holds the list.
* `rootField` Can be provided instead of `parentID`. Equivalent to `store.getRoot().getLinkedRecord(rootField)`
* `payloadName` Provided, if the name of your payload, does not follow the `createdObject` naming convention.
* `mutationName` Provided, if the name of your mutation, does not follow the `create[Type]` naming convention.

Assuming the query looks like this:
```graphql
query MyQuery {
	viewer {
		todos {
			...TodoFragment
		}
	}
}
```
And the mutation looks like this:
```graphql
mutation MyMutation($input: CreateTodoInput!) {
	createTodo(input: $input) {
		createdObject {
			...TodoFragment
		}
	}
}
```
The config would look like this:
```js
{
	listName: "todos",
	rootField: "viewer"
}
```
In practice, it could be used like this:
```jsx
// With a hook
import { useCreateMutation } from "relay-fns"

function MyComponent() {
	const createTodo = useCreateMutation("Todo");
	function runSomeMutation(input) {
		createTodo(MUTATION, input, CONFIG)
			.then(() => console.log("Todo created"))
			.catch(() => console.error("Failed to create todo"))
	}
}

// With a hoc
import { withCreateMutation } from "relay-fns"

@withCreateMutation("Todo")
class MyComponent extends React.Component {
	runSomeMutation(input) {
		this.props.createMutation(MUTATION, input, CONFIG)
			.then(() => console.log("Todo created"))
			.catch(() => console.error("Failed to create todo"))
	}
}
```
---
#### Update
If you update an item, waiting for the server to respond isn't always necessary.
We may set the values on the object in the Relay Store optimistically.

If `Id` is not included in your input, you will need to provide it in the config, via the `dataID` property.
```jsx
// With a hook
import { useUpdateMutation } from "relay-fns"

function MyComponent() {
	const updateTodo = useUpdateMutation("Todo");
	function runSomeMutation(input) {
		updateTodo(MUTATION, input, CONFIG)
			.then(() => console.log("Todo updated"))
			.catch(() => console.error("Failed to update todo"))
	}
}

// With a hoc
import { withUpdateMutation } from "relay-fns"

@withUpdateMutation("Todo")
class MyComponent extends React.Component {
	runSomeMutation(input) {
		this.props.updateMutation(MUTATION, input, CONFIG)
			.then(() => console.log("Todo updated"))
			.catch(() => console.error("Failed to update todo"))
	}
}
```
---
#### Delete
When you delete an item in a list which is not a connection, the optimistic cleanup can be tedious.
This function provides you with this functionality.

To resolve the list, a config is required.
* `dataID` Required, if the `Id` property does not exist in your input.
* `listName` The name of the list in GraphQL
* `listArgs` Any arguments required to resolve the list
* `parentID` Name of the parent, which holds the list.
* `rootField` Can be provided instead of `parentID`. Equivalent to `store.getRoot().getLinkedRecord(rootField)`

```jsx
// With a hook
import { useDeleteMutation } from "relay-fns"

function MyComponent() {
	const deleteTodo = useDeleteMutation("Todo");
	function runSomeMutation(input) {
		deleteTodo(MUTATION, input, CONFIG)
			.then(() => console.log("Todo deleted"))
			.catch(() => console.error("Failed to delete todo"))
	}
}

// With a hoc
import { withDeleteMutation } from "relay-fns"

@withDeleteMutation("Todo")
class MyComponent extends React.Component {
	runSomeMutation(input) {
		this.props.deleteMutation(MUTATION, input, CONFIG)
			.then(() => console.log("Todo deleted"))
			.catch(() => console.error("Failed to delete todo"))
	}
}
```
---
#### Utility HOCs
* `fragment` = createFragmentContainer
* `refetch` = createRefetchContainer
* `pagination` = createPaginationContainer

```jsx
import { fragment } from "relay-fns"

@fragment({ todo: graphql`...` })
class MyComponent extends React.Component {
	...
}

import { refetch } from "relay-fns"

@refetch({ todo: graphql`...` }, graphql``)
class MyComponent extends React.Component {
	...
}

import { pagination } from "relay-fns"

@pagination({ todo: graphql`...` }, { ...PaginationProps })
class MyComponent extends React.Component {
	...
}
```

---

#### Executables

`relay-fns-enums`
Parameters:
* `--schema` Path to schema.graphql
* `--output` Output file

Add it to `scripts` in `package.json`
Or run it from the terminal:

    $ ./node_modules/.bin/relay-fns-enums --schema ./schema.graphql --output ./src/Enums.js


It will generate a file with enums from your graphql schema.
```javascript
export const MyEnum = {
  Enum1: "Enum1",
  Enum2: "Enum2"
}
```

## Development

1. Clone the repository

2. Install dependencies `npm|yarn install`

3. Build and watch for changes `npm|yarn run watch`

## Credits

relay-fns is built and maintained by **babangsund**.

[@blog](https://babangsund.com/).  
[@github](https://github.com/babangsund).  
[@twitter](https://twitter.com/babangsund).  
