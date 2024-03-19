import React, { useState, useEffect } from "react";
import { Amplify } from "aws-amplify";
import { withAuthenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import config from "./amplifyconfiguration.json";
import { generateClient } from "aws-amplify/api";
import { createTodo, updateTodo, deleteTodo } from "./graphql/mutations";
import { listTodos } from "./graphql/queries";

Amplify.configure(config);

export function App({ signOut, user }) {
  const [items, setItems] = useState([]);
  useEffect(() => {
    const client = generateClient();
    async function createTodoItem() {
      const result1 = await client.graphql({
        query: createTodo,
        variables: {
          input: {
            name: "My third todo!",
            description: "test description2",
          },
        },
      });
      console.log("result1", result1);
    }
    async function listTodoItem() {
      const entries = await client.graphql({ query: listTodos });
      console.log("entries: ", entries.data.listTodos.items);
      setItems(entries.data.listTodos.items);
    }
    //createTodoItem();
    listTodoItem();
  }, []);

  return (
    <>
      <h1>Hello {user?.username}</h1>
      <button onClick={signOut}>Sign out</button>
      {items.map((item, index) => (
        <div key={index}>
          {item.name} - {item.description}
        </div>
      ))}
    </>
  );
}

export default withAuthenticator(App);
