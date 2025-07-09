import { StreamClient } from "./client/index";

const client = new StreamClient({
  url: "http://127.0.0.1:8000",
  secretID: "tokens:daiwg7ymz2r113ifqlie",
  secretKey: "cedqnr1VXoblNtK631hKG4E1qMkEBPEJR11JOlhGXJTXaMPAJS",
});

client.users
  .getUsers()
  .then((users) => {
    console.log("Users:", users.toArray());
  })
  .catch((error) => {
    console.error("Error fetching users:", error);
  });
