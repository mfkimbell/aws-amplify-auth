import React, { useState, useEffect } from "react";
import { Amplify } from "aws-amplify";
import { withAuthenticator } from "@aws-amplify/ui-react";
import { createTodo, updateTodo, deleteTodo } from "./graphql/mutations";
import config from "./amplifyconfiguration.json";
import { generateClient } from "aws-amplify/api";
import { listTodos } from "./graphql/queries";
import { uploadData, list, getUrl } from "aws-amplify/storage";

import "./App.css"; // Import the CSS file
import {
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  IconButton,
} from "@mui/material";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";
import DeleteIcon from "@mui/icons-material/Delete";

Amplify.configure(config);

export function App({ signOut, user }) {
  const [items, setItems] = useState([]);
  const [fileData, setFileData] = useState();
  const [fileStatus, setFileStatus] = useState(false);
  const [s3DownloadLinks, setS3DownloadLinks] = useState([]);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");

  const uploadFile = async () => {
    try {
      const result = await uploadData({
        level: "public",
        key: fileData.name,
        data: fileData,
        options: {
          accessLevel: "public", // had to change this to public
        },
      }).result;
      console.log("Succeeded: ", result);
      setFileStatus(true);
    } catch (error) {
      console.log("Error : ", error);
    }
  };
  const uploadComment = async (name, comment) => {
    const client = generateClient();

    const result1 = await client.graphql({
      query: createTodo,
      variables: {
        input: {
          name: name,
          description: comment,
        },
      },
    });
    console.log("result1", result1);
  };

  const handleSubmitComment = async (event) => {
    event.preventDefault(); // Prevent the form from reloading the page
    await uploadComment(name, comment); // Use the provided uploadComment function
    setName(""); // Clear the name input after submission
    setComment(""); // Clear the comment input after submission
  };

  async function listObjectsFromS3() {
    const s3Objects = await list({
      prefix: "",
    });
    console.log("s3objects", s3Objects);
    console.log("array", s3Objects.items);

    const downloadLinksPromises = s3Objects.items.map(async (item) => {
      // Log the item key to the console
      console.log("item: ", item);
      console.log("item.key: ", item.key);

      // Generate the download links
      const linkPrecursor = await generateDownloadLinks(item.key);
      console.log("linkPrecursor: ", linkPrecursor);

      return linkPrecursor;
    });
    const downloadLinks = await Promise.all(downloadLinksPromises);
    setS3DownloadLinks(downloadLinks);
    console.log("download links 3", s3DownloadLinks);
  }

  async function generateDownloadLinks(fileKey) {
    const result = await getUrl(fileKey, { download: true });
    console.log("download link gen", result);
    const downloadUrl = result.url.origin
      ? `${result.url.origin}/public/${fileKey}`
      : `${result.url}/public/${fileKey}`;

    console.log("Complete download link", downloadUrl);
    return { url: downloadUrl, filename: fileKey }; // Return both URL and filename
  }

  useEffect(() => {
    const client = generateClient();

    async function listTodoItem() {
      const entries = await client.graphql({ query: listTodos });
      console.log("entries: ", entries.data.listTodos.items);
      setItems(entries.data.listTodos.items);
    }

    listTodoItem();
    listObjectsFromS3();
  }, []);

  console.log("final download links", s3DownloadLinks);
  return (
    <div className="App">
      <header className="App-header">
        <h1 className="title">Hello {user?.username}</h1>
        <Button className="button sign-out-button" onClick={signOut}>
          Sign out
        </Button>
      </header>
      <form onSubmit={handleSubmitComment} className="comment-form">
        <TextField
          label="Name"
          variant="outlined"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Comment"
          variant="outlined"
          multiline
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          fullWidth
          margin="normal"
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          className="submit-button"
        >
          Submit Comment
        </Button>
      </form>
      <main>
        <section>
          {items.map((item, index) => (
            <ListItem key={index} divider>
              <ListItemText primary={`${item.name} - ${item.description}`} />
              <IconButton edge="end" aria-label="delete">
                <DeleteIcon />
              </IconButton>
            </ListItem>
          ))}
        </section>
        <section>
          <input
            type="file"
            className="input-file"
            onChange={(e) => setFileData(e.target.files[0])}
          />
          <Button
            variant="contained"
            onClick={uploadFile}
            className="upload-button"
          >
            Upload File
          </Button>
        </section>
        {fileStatus && (
          <p className="success-message">File uploaded successfully!</p>
        )}

        <List style={{ width: "100%" }}>
          {s3DownloadLinks.map((link, index) => (
            <ListItem key={index} divider>
              <ListItemText primary={link.filename} />
              <IconButton
                edge="end"
                aria-label="download"
                href={link.url}
                target="_blank"
              >
                <CloudDownloadIcon />
              </IconButton>
            </ListItem>
          ))}
        </List>
      </main>
    </div>
  );
}

export default withAuthenticator(App);
