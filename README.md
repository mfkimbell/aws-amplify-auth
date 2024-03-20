# How AWS Amplify works
AWS Amplify integrates with AWS AppSync (a managed GraphQL service) to provide a backend for web and mobile applications.  
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
