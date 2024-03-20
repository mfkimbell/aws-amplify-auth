# AWS Amplify File Dashboard
An AWS Amplify React application that allows users to sign in using Amplify's authenication through Cognito User Pools, then add comments and files to a group dashboard. A user can upload files for all other users to see and download, as well as add comments. Files are stored in S3 and comments are stores via GraphQL into a DynamoDB table.

# Sign Into Account
<img width="670" alt="Screenshot 2024-03-18 at 10 21 17 PM" src="https://github.com/mfkimbell/aws-amplify-auth/assets/107063397/842ce4d6-157a-42a0-b1d9-c30625fcddad">

# Create Account
<img width="678" alt="Screenshot 2024-03-18 at 10 23 07 PM" src="https://github.com/mfkimbell/aws-amplify-auth/assets/107063397/124226ac-44c6-4472-8c50-5bdf7d3e1ae6">

# Email Sent To User
<img width="836" alt="Screenshot 2024-03-18 at 8 07 44 PM" src="https://github.com/mfkimbell/aws-amplify-auth/assets/107063397/32ed95ae-c637-47cd-8369-00d353fa4cfd">

# Email Verification
<img width="516" alt="Screenshot 2024-03-18 at 8 07 53 PM" src="https://github.com/mfkimbell/aws-amplify-auth/assets/107063397/269577c1-cbea-4683-aaeb-220daf6e4c8a">


# Uploading and Downloading Files
https://github.com/mfkimbell/aws-amplify-auth/assets/107063397/ecea9d35-6007-4402-9e72-87795a9e2235

Here we can see the files have successfully made it on AWS S3
<img width="970" alt="Screenshot 2024-03-19 at 10 59 42 PM" src="https://github.com/mfkimbell/aws-amplify-auth/assets/107063397/a801a72a-5d8c-41bb-bb9e-425a9de57d0e">

# Adding Comments
https://github.com/mfkimbell/aws-amplify-auth/assets/107063397/7174762f-5064-4a33-8553-980d787649ba
``` Javascript
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
```

# Deleting Entries
https://github.com/mfkimbell/aws-amplify-auth/assets/107063397/c6d4bbbb-103e-472a-bc82-534ba62a7401
``` Javascript
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
```



# Why use AWS Amplify?
AWS Amplify is a development platform provided by Amazon Web Services (AWS) that makes it easy for developers to build, deploy, and scale mobile and web applications. It integrates with various AWS services and provides a set of tools and is easy to use and allows for rapid build speeds.

# Adding Comment
We can see the files clearly in the GraphQL
https://github.com/mfkimbell/aws-amplify-auth/assets/107063397/d45fd6e7-a0b4-4f2c-b2f2-a74f7595882c

``` Javascript
async function listTodoItem() {
    const entries = await client.graphql({ query: listTodos });
    console.log("entries: ", entries.data.listTodos.items);
    setItems(entries.data.listTodos.items);
  }
```
This code accesses the AWS Amplify Graphql Client, which interacts with AWS Appsync. The Appsync endpoint takes in the GraphQL request and translates that into the DynamoDB database. GraphQL is useful since it's good for quickly making a flexible api. AppSync allows you to skip the creation of your own GraphQL resolvers and data-source connections, so it streamlines the creation of the API from your application. 

# Adding Photos
``` Javascript
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
```
Here instead of using AppSync, we use the uploadData() function from `aws-amplify/storage`. This connects directly to S3 to allow for storage of larger more complex files (like images shown above).

# Permissions
In order to allow for users to access these files I made the bucket public.
<img width="946" alt="Screenshot 2024-03-19 at 11 50 49 PM" src="https://github.com/mfkimbell/aws-amplify-auth/assets/107063397/30d245cd-6c1c-437b-8974-0d06ac3fabb5">
As well as updating the bucket policy to allow for reading and deleting of files:
```
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": [
                "s3:GetObject",
                "s3:DeleteObject"
            ],
            "Resource": "arn:aws:s3:::amplifyb3502e3fafb5443b9693b46ee84fbfbb215210-dev/*"
        }
    ]
}
```
# Authentication
This "withAuthenticator" wrapper `export default withAuthenticator(App);` redirects unauthorized users to the login page. AWS Amplify allows you to designate the preferred authentication method, and I chose Cognito. Here we can see my two users in my Cognito User Pool that was set up by Amplify:
<img width="1052" alt="Screenshot 2024-03-20 at 12 55 50 AM" src="https://github.com/mfkimbell/aws-amplify-file-dashboard/assets/107063397/a854acc6-15a3-45cd-b61b-320935d11325">
