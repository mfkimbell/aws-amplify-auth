import React, { useState, useEffect } from "react";
import { Amplify } from "aws-amplify";
import { withAuthenticator } from "@aws-amplify/ui-react";
import { createTodo, updateTodo, deleteTodo } from "./graphql/mutations";
import config from "./amplifyconfiguration.json";
import { generateClient } from "aws-amplify/api";
import { listTodos } from "./graphql/queries";
import { uploadData, remove, list, getUrl } from "aws-amplify/storage";
import "@aws-amplify/ui-react/styles.css";

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
const client = generateClient();

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
      });
      console.log("Succeeded: ", result);
      setFileStatus(true);
      // Refresh the list of files after successful upload
      await listObjectsFromS3();
    } catch (error) {
      console.log("Error : ", error);
    }
  };
  const deleteFile = async (filename) => {
    console.log("filename", filename);
    try {
      await remove({ key: filename, level: "public" });
      console.log("File deleted successfully:", filename);
      // Optionally, refresh the list of files after successful deletion
      await listObjectsFromS3();
    } catch (error) {
      console.error("Error deleting file:", error);
    }
  };
  const uploadComment = async (name, comment) => {
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

  const deleteComment = async (id) => {
    try {
      const result = await client.graphql({
        query: deleteTodo,
        variables: {
          input: {
            id: id,
          },
        },
      });
      console.log("Delete result", result);
      setItems(items.filter((item) => item.id !== id)); // Update state to remove the deleted item
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };
  const handleSubmitComment = async (event) => {
    event.preventDefault(); // Prevent the form from reloading the page
    await uploadComment(name, comment); // Use the provided uploadComment function
    await listTodoItem(); // Reload the comments
    setName(""); // Clear the name input after submission
    setComment(""); // Clear the comment input after submission
  };

  async function listTodoItem() {
    const entries = await client.graphql({ query: listTodos });
    console.log("entries: ", entries.data.listTodos.items);
    setItems(entries.data.listTodos.items);
  }

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
    listTodoItem();
    listObjectsFromS3();
  }, []);

  console.log("final download links", s3DownloadLinks);
  return (
    <div className="App" style={{ paddingTop: "1em" }}>
      <header className="App-header">
        <h1 className="title">User {user?.username}</h1>
        <Button
          variant="contained"
          color="secondary"
          onClick={signOut}
          className="sign-out-button"
        >
          Sign out
        </Button>
      </header>
      <main>
        <section className="comment-section">
          <form onSubmit={handleSubmitComment}>
            <TextField
              label="Name"
              variant="outlined"
              value={name}
              fullWidth
              margin="normal"
              onChange={(e) => setName(e.target.value)}
            />
            <TextField
              label="Comment"
              variant="outlined"
              multiline
              rows={1}
              value={comment}
              fullWidth
              margin="normal"
              onChange={(e) => setComment(e.target.value)}
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
        </section>
        {fileStatus && (
          <div className="success-message">File uploaded successfully!</div>
        )}
        <List>
          {items.map((item, index) => (
            <ListItem key={index} divider>
              <ListItemText primary={`${item.name} - ${item.description}`} />
              <IconButton
                edge="end"
                aria-label="delete"
                onClick={() => deleteComment(item.id)}
              >
                <DeleteIcon />
              </IconButton>
            </ListItem>
          ))}
        </List>
        <section className="upload-section">
          <Button
            variant="contained"
            color="primary"
            onClick={uploadFile}
            className="upload-button"
            style={{ marginRight: "1em" }}
          >
            Upload File
          </Button>
          <input
            type="file"
            className="input-file"
            onChange={(e) => setFileData(e.target.files[0])}
          />
        </section>
        <List>
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
              <IconButton
                edge="end"
                aria-label="delete"
                onClick={() => {
                  console.log("Delete clicked", link.filename);
                  deleteFile(link.filename);
                }}
              >
                <DeleteIcon />
              </IconButton>
            </ListItem>
          ))}
        </List>
      </main>
    </div>
  );
}

export default withAuthenticator(App);
