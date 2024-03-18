import React, { useState, useEffect } from "react";
import { Button, Box, Container, Grid, Typography } from "@mui/material";
import Login from "./components/Login";
import SignUp from "./components/SignUp";
import UserList from "./components/UserList";
import ChatPanel from "./components/ChatPanel";
import { connect } from "nats.ws";

const App = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [showSignUp, setShowSignUp] = useState(false);
  const [nc, setNc] = useState(undefined);
  const [isChatStarted, setIsChatStarted] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("token")) {
      fetchUsers();
    }
  }, []);

  useEffect(() => {
    if (nc === undefined) {
      const connectToNATS = async () => {
        try {
          const connection = await connect({
            servers: ["ws://localhost:5050"],
          });
          setNc(connection);
        } catch (error) {
          console.error("Error connecting to NATS:", error);
        }
      };
      connectToNATS();
    }
  }, []);

  const fetchChatMessages = async () => {
    try {
      if (
        localStorage.getItem("receiverUser") &&
        localStorage.getItem("currentUser")
      ) {
        const response = await fetch(
          `https://chat-application-final-backend.onrender.com/api/chat/getmessages?senderUserId=${
            JSON.parse(localStorage.getItem("currentUser"))._id
          }&receiverUserId=${
            JSON.parse(localStorage.getItem("receiverUser"))._id
          }`
        );
        if (response.ok) {
          const data = await response.json();
          setMessages(data.messages);
        } else {
          throw new Error("Fetch Messages failed");
        }
      }
    } catch (error) {
      console.error("Fetch Messages error:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch(
        `https://chat-application-final-backend.onrender.com/api/users/allusers?emailid=${
          JSON.parse(localStorage.getItem("currentUser")).email
        }`
      );
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
        setAuthenticated(true);
      } else {
        throw new Error("Error fetching users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleSignUp = async (userInfo) => {
    try {
      const response = await fetch("https://chat-application-final-backend.onrender.com/api/users/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userInfo),
      });
      if (response.ok) {
        setAuthenticated(true);
        const data = await response.json();
        setCurrentUser(data.user);
        localStorage.setItem("token", data.token);
      } else {
        throw new Error("Sign up failed");
      }
    } catch (error) {
      console.error("Sign up error:", error);
    }
  };

  const handleLogin = async (userInfo) => {
    try {
      const response = await fetch("https://chat-application-final-backend.onrender.com/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userInfo),
      });
      if (response.ok) {
        setAuthenticated(true);
        const data = await response.json();
        setCurrentUser(data.user);
        localStorage.setItem("token", data.token);
        localStorage.setItem("currentUser", JSON.stringify(data.user));
        localStorage.setItem("isAuthenticated", true);
        fetchUsers();
      } else {
        throw new Error("Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  const handleLogOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("currentUser");
    localStorage.removeItem("receiverUser");
    localStorage.removeItem("isAuthenticated");
    setAuthenticated(false);
    setCurrentUser(null);
  };

  const handleUserClick = (user) => {
    localStorage.setItem("receiverUser", JSON.stringify(user));
    setIsChatStarted(true);
    fetchChatMessages();
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: 2,
      }}
    >
      {!localStorage.getItem("token") && !showSignUp ? (
        <Login
          handleLogin={handleLogin}
          switchToSignUp={() => setShowSignUp(true)}
        />
      ) : !localStorage.getItem("token") && showSignUp ? (
        <SignUp
          handleSignUp={handleSignUp}
          switchToLogin={() => setShowSignUp(false)}
        />
      ) : (
        <Container maxWidth="xl">
          <Box mt={3} sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="h4">
              {localStorage.getItem("currentUser") ? JSON.parse(localStorage.getItem("currentUser")).name : ""}
            </Typography>
            <Button variant="contained" onClick={handleLogOut}>
              Logout
            </Button>
          </Box>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Box
                bgcolor="white"
                p={1}
                borderRadius={4}
                boxShadow="0 0 10px rgba(0, 0, 0, 0.1)"
              >
                <UserList
                  currentUser={JSON.parse(localStorage.getItem("currentUser"))}
                  users={users}
                  handleUserClick={handleUserClick}
                />
              </Box>
            </Grid>
            <Grid item xs={12} md={8}>
              <Box
                bgcolor="white"
                p={3}
                borderRadius={4}
                boxShadow="0 0 10px rgba(0, 0, 0, 0.1)"
              >
                {isChatStarted ? (
                  <>
                    <Typography variant="h5" sx={{ mb: 2 }}>
                      {localStorage.getItem("receiverUser") &&
                        JSON.parse(localStorage.getItem("receiverUser")).name}
                    </Typography>
                    <ChatPanel
                      setMessages={setMessages}
                      messages={messages}
                      nc={nc}
                      fetchChatMessages={fetchChatMessages}
                    />
                  </>
                ) : (
                  <Box>
                    Hello {JSON.parse(localStorage.getItem("currentUser")).name}
                  </Box>
                )}
              </Box>
            </Grid>
          </Grid>
        </Container>
      )}
    </Box>
  );
};

export default App;







// import React, { useState, useEffect } from "react";
// import { Button, Box, Container, Grid, Typography } from "@mui/material";
// import Login from "./components/Login";
// import SignUp from "./components/SignUp";
// import UserList from "./components/UserList";
// import ChatPanel from "./components/ChatPanel";
// import { connect, StringCodec } from "nats.ws";

// const App = () => {
//   const [authenticated, setAuthenticated] = useState(false);
//   const [users, setUsers] = useState([]);
//   const [currentUser, setCurrentUser] = useState(null);
//   const [messages, setMessages] = useState([]);
//   const [showSignUp, setShowSignUp] = useState(false);
//   const [nc, setNc] = useState(undefined);
//   const [isChatStarted, setIsChatStarted] = useState(false);
//   const[messageSent,setMessageSent] = useState(true);

//   useEffect(() => {
//     if (localStorage.getItem("token")) {
//       fetchUsers();
//     }
//   }, []);


//   // useEffect(() => {
//   //   const handleRecentMessage = async () => {
//   //     if (nc && localStorage.getItem("token")) {
//   //       let userId = `${JSON.parse(localStorage.getItem("currentUser"))._id}${JSON.parse(localStorage.getItem("receiverUser"))._id}`;
//   //       userId = userId.split('').sort().join('');
//   //       const subscription = await nc.subscribe(`chat.${userId}`);
//   //       for await (const m of subscription) {
//   //         let newMessages = StringCodec().decode(m.data);
//   //         newMessages = JSON.parse(newMessages);
//   //         if(!messages.includes(newMessages)){
//   //           setMessages((prevMessages) => [...prevMessages, newMessages]);
//   //         }
//   //       }
//   //       // fetchChatMessages();
//   //     }
//   //   };
//   //   handleRecentMessage();
//   // }, [nc]);

//   useEffect(() => {
//     if (nc === undefined) {
//       const connectToNATS = async () => {
//         try {
//           const connection = await connect({
//             servers: ["ws://localhost:5050"],
//           });
//           console.log(connection);
//           setNc(connection);
//         } catch (error) {
//           console.error("Error connecting to NATS:", error);
//         }
//       };
//       connectToNATS();
//     }
//   }, []);

//   const fetchChatMessages = async () => {
//     try {
//       if (
//         localStorage.getItem("receiverUser") &&
//         localStorage.getItem("currentUser")
//       ) {
//         const response = await fetch(
//           `http://localhost:3001/api/chat/getmessages?senderUserId=${
//             JSON.parse(localStorage.getItem("currentUser"))._id
//           }&receiverUserId=${
//             JSON.parse(localStorage.getItem("receiverUser"))._id
//           }`
//         );
//         if (response.ok) {
//           console.log("Fetch Messages");
//           setAuthenticated(true);
//           const data = await response.json();
//           if(messages!==data.message){
//             setMessages(data.messages);
//           }
//         } else {
//           throw new Error("Fetch Messages failed");
//         }
//       }
//     } catch (error) {
//       console.error("Fetch Messages error:", error);
//     }
//   };

//   const fetchUsers = async () => {
//     try {
//       const response = await fetch(
//         `http://localhost:3001/api/users/allusers?emailid=${
//           JSON.parse(localStorage.getItem("currentUser")).email
//         }`
//       );
//       if (response.ok) {
//         const data = await response.json();
//         setUsers(data.users);
//         setAuthenticated(true);
//       } else {
//         throw new Error("Error fetching users");
//       }
//     } catch (error) {
//       console.error("Error fetching users:", error);
//     }
//   };

//   const handleSendMessage = async (message) => {
//     try {
//       setMessages((prevMessages) => [
//         ...prevMessages,
//         {
//           senderUserId: JSON.parse(localStorage.getItem("currentUser"))._id,
//           receiverUserId: JSON.parse(localStorage.getItem("receiverUser"))._id,
//           message: message,
//         },
//       ]);
//       if (nc) {
//         let userId = `${JSON.parse(localStorage.getItem("currentUser"))._id}${JSON.parse(localStorage.getItem("receiverUser"))._id}`;
//         userId = userId.split('').sort().join('');
//         console.log(userId);
//         await nc.publish(
//           `chat.${userId}`,
//           JSON.stringify({
//             senderUserId: JSON.parse(localStorage.getItem("currentUser"))._id,
//             receiverUserId: JSON.parse(localStorage.getItem("receiverUser"))
//               ._id,
//             message: message,
//           })
//         );
//         // setMessages((prevMessages) => [
//         //   ...prevMessages,
//         //   {
//         //     senderUserId: JSON.parse(localStorage.getItem("currentUser"))._id,
//         //     receiverUserId: JSON.parse(localStorage.getItem("receiverUser"))._id,
//         //     message: message,
//         //   },
//         // ]);
//         // fetchChatMessages();

//       } else {
//         console.error("NATS connection not available.");
//       }
//     } catch (error) {
//       console.error("Error sending message:", error);
//     }
//   };

//   const handleSignUp = async (userInfo) => {
//     try {
//       const response = await fetch("http://localhost:3001/api/users/signup", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(userInfo),
//       });
//       if (response.ok) {
//         setAuthenticated(true);
//         const data = await response.json();
//         setCurrentUser(data.user);
//         localStorage.setItem("token", data.token);
//       } else {
//         throw new Error("Sign up failed");
//       }
//     } catch (error) {
//       console.error("Sign up error:", error);
//     }
//   };

//   const handleLogin = async (userInfo) => {
//     try {
//       const response = await fetch("http://localhost:3001/api/users/login", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(userInfo),
//       });
//       if (response.ok) {
//         setAuthenticated(true);
//         const data = await response.json();
//         setCurrentUser(data.user);
//         localStorage.setItem("token", data.token);
//         localStorage.setItem("currentUser", JSON.stringify(data.user));
//         localStorage.setItem("isAuthenticated", true);
//         fetchUsers();
//       } else {
//         throw new Error("Login failed");
//       }
//     } catch (error) {
//       console.error("Login error:", error);
//     }
//   };

//   const handleLogOut = () => {
//     localStorage.removeItem("token");
//     localStorage.removeItem("currentUser");
//     localStorage.removeItem("receiverUser");
//     localStorage.removeItem("isAuthenticated");
//     setAuthenticated(false);
//     setCurrentUser(null);
//   };

//   const handleUserClick = (user) => {
//     localStorage.setItem("receiverUser", JSON.stringify(user));
//     setIsChatStarted(true);
//     fetchChatMessages();
//   };
  
//   return (
//     <Box
//       sx={{
//         minHeight: "100vh",
//         display: "flex",
//         flexDirection: "column",
//         justifyContent: "center",
//         alignItems: "center",
//         padding: 2,
//       }}
//     >
//       {!localStorage.getItem("token") && !showSignUp ? (
//         <Login
//           handleLogin={handleLogin}
//           switchToSignUp={() => setShowSignUp(true)}
//         />
//       ) : !localStorage.getItem("token") && showSignUp ? (
//         <SignUp
//           handleSignUp={handleSignUp}
//           switchToLogin={() => setShowSignUp(false)}
//         />
//       ) : (
//         <Container maxWidth="xl">
//           <Box mt={3} sx={{ display: "flex", justifyContent: "space-between" }}>
//             <Typography variant="h4">
//               {localStorage.getItem("currentUser") ? JSON.parse(localStorage.getItem("currentUser")).name : ""}
//             </Typography>
//             <Button variant="contained" onClick={handleLogOut}>
//               Logout
//             </Button>
//           </Box>
//           <Grid container spacing={3}>
//             <Grid item xs={12} md={4}>
//               <Box
//                 bgcolor="white"
//                 p={1}
//                 borderRadius={4}
//                 boxShadow="0 0 10px rgba(0, 0, 0, 0.1)"
//               >
//                 <UserList
//                   currentUser={JSON.parse(localStorage.getItem("currentUser"))}
//                   users={users}
//                   handleUserClick={handleUserClick}
//                 />
//               </Box>
//             </Grid>
//             <Grid item xs={12} md={8}>
//               <Box
//                 bgcolor="white"
//                 p={3}
//                 borderRadius={4}
//                 boxShadow="0 0 10px rgba(0, 0, 0, 0.1)"
//               >
//                 {isChatStarted ? (
//                   <>
//                     <Typography variant="h5" sx={{ mb: 2 }}>
//                       {localStorage.getItem("receiverUser") &&
//                         JSON.parse(localStorage.getItem("receiverUser")).name}
//                     </Typography>
//                     <ChatPanel
//                       setMessages={setMessages}
//                       // isChatStarted={isChatStarted}
//                       // currentUser={JSON.parse(localStorage.getItem("currentUser"))}
//                       // receiverUser={JSON.parse(
//                       // localStorage.getItem("receiverUser")
//                       // )}
//                       nc={nc}
//                       fetchChatMessages={fetchChatMessages}
//                       messages={messages}
//                       handleSendMessage={handleSendMessage}
//                     />
//                   </>
//                 ) : (
//                   <Box>
//                     Hello {JSON.parse(localStorage.getItem("currentUser")).name}
//                   </Box>
//                 )}
//               </Box>
//             </Grid>
//           </Grid>
//         </Container>
//       )}
//     </Box>
//   );
// };

// export default App;








// import React, { useState, useEffect } from "react";
// import { Button, Box, Container, Grid, Typography } from "@mui/material";
// import Login from "./components/Login";
// import SignUp from "./components/SignUp";
// import UserList from "./components/UserList";
// import ChatPanel from "./components/ChatPanel";
// import { connect, StringCodec } from "nats.ws";

// const App = () => {
//   const [authenticated, setAuthenticated] = useState(false);
//   const [users, setUsers] = useState([]);
//   const [currentUser, setCurrentUser] = useState(null);
//   const [messages, setMessages] = useState([]);
//   const [showSignUp, setShowSignUp] = useState(false);
//   const [nc, setNc] = useState(undefined);
//   const [messageSent, setMessageSent] = useState(true);
//   const [isChatStarted, setIsChatStarted] = useState(false);
//   const [isReceiverChange, setIsReceiverChange] = useState(false);

//   useEffect(() => {
//     if (localStorage.getItem("currentUser")) {
//       fetchUsers();
//     }
//   }, [authenticated]);

//   useEffect(() => {
//     if (localStorage.getItem("receiverUser")) {
//       fetchChatMessages();
//     }
//   }, [localStorage.getItem("receiverUser")]);

//   useEffect(() => {
//     if (nc === undefined) {
//       const connectToNATS = async () => {
//         try {
//           const connection = await connect({
//             servers: ["ws://localhost:5050"],
//           });
//           setNc(connection);
//         } catch (error) {
//           console.error("Error connecting to NATS:", error);
//         }
//       };
//       connectToNATS();
//     }
//   }, [nc]);

  // useEffect(() => {
  //   const handleRecentMessage = async () => {
  //     if (nc) {
  //       let userId = `${JSON.parse(localStorage.getItem("currentUser"))._id}${JSON.parse(localStorage.getItem("receiverUser"))._id}`;
  //       userId = userId.split('').sort().join('');
  //       const subscription = await nc.subscribe(`chat.${userId}`);
  //       for await (const m of subscription) {
  //         let newMessages = StringCodec().decode(m.data);
  //         newMessages = JSON.parse(newMessages);
  //         setMessages((prevMessages) => [...prevMessages, newMessages]);
  //         fetchChatMessages();
  //       }
  //     }
  //   };
  //   handleRecentMessage();
  // }, [messageSent]);

//   const fetchChatMessages = async () => {
//     try {
//       const response = await fetch(
//         `http://localhost:3001/api/chat/getmessages?senderUserId=${
//           JSON.parse(localStorage.getItem("currentUser"))._id
//         }&receiverUserId=${
//           JSON.parse(localStorage.getItem("receiverUser"))._id
//         }`
//       );
//       if (response.ok) {
//         console.log("Fetch Messages");
//         setAuthenticated(true);
//         const data = await response.json();
//         setMessages(data.messages);
//       } else {
//         throw new Error("Fetch Messages failed");
//       }
//     } catch (error) {
//       console.error("Fetch Messages error:", error);
//     }
//   };

//   const fetchUsers = async () => {
//     try {
//       const response = await fetch(
//         `http://localhost:3001/api/users/allusers?emailid=${
//           JSON.parse(localStorage.getItem("currentUser")).email
//         }`
//       );
//       if (response.ok) {
//         const data = await response.json();
//         setUsers(data.users);
//         setAuthenticated(true);
//       } else {
//         throw new Error("Error fetching users");
//       }
//     } catch (error) {
//       console.error("Error fetching users:", error);
//     }
//   };

//   const handleSendMessage = async (message) => {
//     setMessageSent(!messageSent);
//     setMessages((prevMessages) => [
//       ...prevMessages,
//       {
//         senderUserId: JSON.parse(localStorage.getItem("currentUser"))._id,
//         receiverUserId: JSON.parse(localStorage.getItem("receiverUser"))._id,
//         message: message,
//       },
//     ]);
//     if (nc) {
//       try {
//         let userId = `${JSON.parse(localStorage.getItem("currentUser"))._id}${JSON.parse(localStorage.getItem("receiverUser"))._id}`;
//         userId = userId.split('').sort().join('');
//         await nc.publish(
//           `chat.${userId}`,
//           JSON.stringify({
//             senderUserId: JSON.parse(localStorage.getItem("currentUser"))._id,
//             receiverUserId: JSON.parse(localStorage.getItem("receiverUser"))
//               ._id,
//             message: message,
//           })
//         );
//         fetchChatMessages();
//       } catch (error) {
//         console.error("Error sending message:", error);
//       }
//     } else {
//       console.error("NATS connection not available.");
//     }
//   };

//   const handleSignUp = async (userInfo) => {
//     try {
//       const response = await fetch("http://localhost:3001/api/users/signup", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(userInfo),
//       });
//       if (response.ok) {
//         setAuthenticated(true);
//         const data = await response.json();
//         setCurrentUser(data.user);
//         localStorage.setItem("token", data.token);
//       } else {
//         throw new Error("Sign up failed");
//       }
//     } catch (error) {
//       console.error("Sign up error:", error);
//     }
//   };

//   const handleLogin = async (userInfo) => {
//     try {
//       const response = await fetch("http://localhost:3001/api/users/login", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(userInfo),
//       });
//       if (response.ok) {
//         setAuthenticated(true);
//         const data = await response.json();
//         setCurrentUser(data.user);
//         localStorage.setItem("token", data.token);
//         localStorage.setItem("currentUser", JSON.stringify(data.user));
//         localStorage.setItem("isAuthenticated", true);
//         fetchUsers();
//       } else {
//         throw new Error("Login failed");
//       }
//     } catch (error) {
//       console.error("Login error:", error);
//     }
//   };

//   const handleLogOut = () => {
//     localStorage.removeItem("token");
//     localStorage.removeItem("currentUser");
//     localStorage.removeItem("receiverUser");
//     localStorage.removeItem("isAuthenticated");
//     setAuthenticated(false);
//     setCurrentUser(null);
//   };

//   const handleUserClick = (user) => {
//     localStorage.setItem("receiverUser", JSON.stringify(user));
//     setIsReceiverChange(!isReceiverChange);
//     fetchChatMessages();
//     setIsChatStarted(true);
//   };

//   return (
//     <Box
//       sx={{
//         minHeight: "100vh",
//         display: "flex",
//         flexDirection: "column",
//         justifyContent: "center",
//         alignItems: "center",
//         padding: 2,
//       }}
//     >
//       {!localStorage.getItem("token") && !showSignUp ? (
//         <Login
//           handleLogin={handleLogin}
//           switchToSignUp={() => setShowSignUp(true)}
//         />
//       ) : !localStorage.getItem("token") && showSignUp ? (
//         <SignUp
//           handleSignUp={handleSignUp}
//           switchToLogin={() => setShowSignUp(false)}
//         />
//       ) : (
//         <Container maxWidth="xl">
//           <Box mt={3} sx={{ display: "flex", justifyContent: "space-between" }}>
//             <Typography variant="h4">
//               {JSON.parse(localStorage.getItem("currentUser"))
//                 ? JSON.parse(localStorage.getItem("currentUser")).name
//                 : ""}
//             </Typography>
//             <Button variant="contained" onClick={handleLogOut}>
//               Logout
//             </Button>
//           </Box>
//           <Grid container spacing={3}>
//             <Grid item xs={12} md={4}>
//               <Box
//                 bgcolor="white"
//                 p={1}
//                 borderRadius={4}
//                 boxShadow="0 0 10px rgba(0, 0, 0, 0.1)"
//               >
//                 <UserList
//                   currentUser={currentUser}
//                   users={users}
//                   handleUserClick={handleUserClick}
//                 />
//               </Box>
//             </Grid>
//             <Grid item xs={12} md={8}>
//               <Box
//                 bgcolor="white"
//                 p={3}
//                 borderRadius={4}
//                 boxShadow="0 0 10px rgba(0, 0, 0, 0.1)"
//               >
//                 {isChatStarted ? (
//                   <>
//                     <Typography variant="h5" sx={{ mb: 2 }}>
//                       {localStorage.getItem("receiverUser") &&
//                         JSON.parse(localStorage.getItem("receiverUser")).name}
//                     </Typography>
//                     <ChatPanel
//                       isChatStarted={isChatStarted}
//                       currentUser={currentUser}
//                       receiverUser={JSON.parse(
//                         localStorage.getItem("receiverUser")
//                       )}
//                       messages={messages}
//                       handleSendMessage={handleSendMessage}
//                     />
//                   </>
//                 ) : (
//                   <Box>
//                     Hello {JSON.parse(localStorage.getItem("currentUser")).name}
//                   </Box>
//                 )}
//               </Box>
//             </Grid>
//           </Grid>
//         </Container>
//       )}
//     </Box>
//   );
// };

// export default App;







// import React, { useState, useEffect } from "react";
// import { Button, Box, Container, Grid, Typography } from "@mui/material";
// import Login from "./components/Login";
// import SignUp from "./components/SignUp";
// import UserList from "./components/UserList";
// import ChatPanel from "./components/ChatPanel";
// import { connect, StringCodec } from "nats.ws";

// const App = () => {
//   const [authenticated, setAuthenticated] = useState(false);
//   const [users, setUsers] = useState([]);
//   const [currentUser, setCurrentUser] = useState(null);
//   const [messages, setMessages] = useState([]);
//   const [showSignUp, setShowSignUp] = useState(false);
//   const [nc, setNc] = useState(undefined);
//   const [messageSent, setMessageSent] = useState(true);
//   const [isChatStarted, setIsChatStarted] = useState(false);
//   const [isReceiverChange, setIsReceiverChange] = useState(false);

//   useEffect(() => {
//     if (localStorage.getItem("currentUser")) {
//       fetchUsers();
//     }
//   }, [authenticated]);

//   useEffect(() => {
//     if (localStorage.getItem("receiverUser")) {
//       fetchChatMessages();
//     }
//   }, [localStorage.getItem("receiverUser")]);

//   useEffect(() => {
//     if (nc === undefined) {
//       const connectToNATS = async () => {
//         try {
//           const connection = await connect({
//             servers: ["ws://localhost:5050"],
//           });
//           setNc(connection);
//         } catch (error) {
//           console.error("Error connecting to NATS:", error);
//         }
//       };
//       connectToNATS();
//     }
//   }, [nc]);

//   useEffect(() => {
//     const handleRecentMessage = async () => {
//       if (nc) {
//         let userId = `${JSON.parse(localStorage.getItem("currentUser"))._id}${JSON.parse(localStorage.getItem("receiverUser"))._id}`;
//         userId = userId.split('').sort().join('');
//         const subscription = await nc.subscribe(`chat.${userId}`);
//         for await (const m of subscription) {
//           let newMessages = StringCodec().decode(m.data);
//           newMessages = JSON.parse(newMessages);
//           setMessages((prevMessages) => [...prevMessages, newMessages]);
//           fetchChatMessages();
//         }
//       }
//     };
//     handleRecentMessage();
//   }, [messageSent]);

//   const fetchChatMessages = async () => {
//     try {
//       const response = await fetch(
//         `http://localhost:3001/api/chat/getmessages?senderUserId=${
//           JSON.parse(localStorage.getItem("currentUser"))._id
//         }&receiverUserId=${
//           JSON.parse(localStorage.getItem("receiverUser"))._id
//         }`
//       );
//       if (response.ok) {
//         setAuthenticated(true);
//         const data = await response.json();
//         setMessages(data.messages);
//       } else {
//         throw new Error("Fetch Messages failed");
//       }
//     } catch (error) {
//       console.error("Fetch Messages error:", error);
//     }
//   };

//   const fetchUsers = async () => {
//     try {
//       const response = await fetch(
//         `http://localhost:3001/api/users/allusers?emailid=${
//           JSON.parse(localStorage.getItem("currentUser")).email
//         }`
//       );
//       if (response.ok) {
//         const data = await response.json();
//         setUsers(data.users);
//         setAuthenticated(true);
//       } else {
//         throw new Error("Error fetching users");
//       }
//     } catch (error) {
//       console.error("Error fetching users:", error);
//     }
//   };

//   const handleSendMessage = async (message) => {
//     setMessageSent(!messageSent);
//     setMessages((prevMessages) => [
//       ...prevMessages,
//       {
//         senderUserId: JSON.parse(localStorage.getItem("currentUser"))._id,
//         receiverUserId: JSON.parse(localStorage.getItem("receiverUser"))._id,
//         message: message,
//       },
//     ]);
//     if (nc) {
//       try {
//         let userId = `${JSON.parse(localStorage.getItem("currentUser"))._id}${JSON.parse(localStorage.getItem("receiverUser"))._id}`;
//         userId = userId.split('').sort().join('');
//         await nc.publish(
//           `chat.${userId}`,
//           JSON.stringify({
//             senderUserId: JSON.parse(localStorage.getItem("currentUser"))._id,
//             receiverUserId: JSON.parse(localStorage.getItem("receiverUser"))
//               ._id,
//             message: message,
//           })
//         );
//         // fetchChatMessages();
//       } catch (error) {
//         console.error("Error sending message:", error);
//       }
//     } else {
//       console.error("NATS connection not available.");
//     }
//   };

//   const handleSignUp = async (userInfo) => {
//     try {
//       const response = await fetch("http://localhost:3001/api/users/signup", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(userInfo),
//       });
//       if (response.ok) {
//         setAuthenticated(true);
//         const data = await response.json();
//         setCurrentUser(data.user);
//         localStorage.setItem("token", data.token);
//       } else {
//         throw new Error("Sign up failed");
//       }
//     } catch (error) {
//       console.error("Sign up error:", error);
//     }
//   };

//   const handleLogin = async (userInfo) => {
//     try {
//       const response = await fetch("http://localhost:3001/api/users/login", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(userInfo),
//       });
//       if (response.ok) {
//         setAuthenticated(true);
//         const data = await response.json();
//         setCurrentUser(data.user);
//         localStorage.setItem("token", data.token);
//         localStorage.setItem("currentUser", JSON.stringify(data.user));
//         localStorage.setItem("isAuthenticated", true);
//         fetchUsers();
//       } else {
//         throw new Error("Login failed");
//       }
//     } catch (error) {
//       console.error("Login error:", error);
//     }
//   };

//   const handleLogOut = () => {
//     localStorage.removeItem("token");
//     localStorage.removeItem("currentUser");
//     localStorage.removeItem("receiverUser");
//     localStorage.removeItem("isAuthenticated");
//     setAuthenticated(false);
//     setCurrentUser(null);
//   };

//   const handleUserClick = (user) => {
//     localStorage.setItem("receiverUser", JSON.stringify(user));
//     setIsReceiverChange(!isReceiverChange);
//     fetchChatMessages();
//     setIsChatStarted(true);
//   };

//   return (
//     <Box
//       sx={{
//         minHeight: "100vh",
//         display: "flex",
//         flexDirection: "column",
//         justifyContent: "center",
//         alignItems: "center",
//         padding: 2,
//       }}
//     >
//       {!localStorage.getItem("token") && !showSignUp ? (
//         <Login
//           handleLogin={handleLogin}
//           switchToSignUp={() => setShowSignUp(true)}
//         />
//       ) : !localStorage.getItem("token") && showSignUp ? (
//         <SignUp
//           handleSignUp={handleSignUp}
//           switchToLogin={() => setShowSignUp(false)}
//         />
//       ) : (
//         <Container maxWidth="xl">
//           <Box mt={3} sx={{ display: "flex", justifyContent: "space-between" }}>
//             <Typography variant="h4">
//               {JSON.parse(localStorage.getItem("currentUser"))
//                 ? JSON.parse(localStorage.getItem("currentUser")).name
//                 : ""}
//             </Typography>
//             <Button variant="contained" onClick={handleLogOut}>
//               Logout
//             </Button>
//           </Box>
//           <Grid container spacing={3}>
//             <Grid item xs={12} md={4}>
//               <Box
//                 bgcolor="white"
//                 p={1}
//                 borderRadius={4}
//                 boxShadow="0 0 10px rgba(0, 0, 0, 0.1)"
//               >
//                 <UserList
//                   currentUser={currentUser}
//                   users={users}
//                   handleUserClick={handleUserClick}
//                 />
//               </Box>
//             </Grid>
//             <Grid item xs={12} md={8}>
//               <Box
//                 bgcolor="white"
//                 p={3}
//                 borderRadius={4}
//                 boxShadow="0 0 10px rgba(0, 0, 0, 0.1)"
//               >
//                 {isChatStarted ? (
//                   <>
//                     <Typography variant="h5" sx={{ mb: 2 }}>
//                       {localStorage.getItem("receiverUser") &&
//                         JSON.parse(localStorage.getItem("receiverUser")).name}
//                     </Typography>
//                     <ChatPanel
//                       isChatStarted={isChatStarted}
//                       currentUser={currentUser}
//                       receiverUser={JSON.parse(
//                         localStorage.getItem("receiverUser")
//                       )}
//                       messages={messages}
//                       handleSendMessage={handleSendMessage}
//                     />
//                   </>
//                 ) : (
//                   <Box>
//                     Hello {JSON.parse(localStorage.getItem("currentUser")).name}
//                   </Box>
//                 )}
//               </Box>
//             </Grid>
//           </Grid>
//         </Container>
//       )}
//     </Box>
//   );
// };

// export default App;






// import React, { useState, useEffect } from "react";
// import { Button, Box, Container, Grid, Typography } from "@mui/material";
// import Login from "./components/Login";
// import SignUp from "./components/SignUp";
// import UserList from "./components/UserList";
// import ChatPanel from "./components/ChatPanel";
// import { connect, StringCodec } from "nats.ws";

// const App = () => {
//   const [authenticated, setAuthenticated] = useState(false);
//   const [users, setUsers] = useState([]);
//   const [currentUser, setCurrentUser] = useState(null);
//   const [messages, setMessages] = useState([]);
//   const [showSignUp, setShowSignUp] = useState(false);
//   const [nc, setNc] = useState(undefined);
//   const [receiverChange, setReceiverChange] = useState(true);
//   const [messageSent, setMessageSent] = useState(true);
//   const [isChatStarted, setIsChatStarted] = useState(false);
//   const [currentMessage,setCurrentMessage]=useState('');
//   const [flag,setFlag] = useState(true);

//   const fetchChatMessages = async () => {
//     try {
//       const response = await fetch(
//         `http://localhost:3001/api/chat/getmessages?senderUserId=${
//           JSON.parse(localStorage.getItem("currentUser"))._id
//         }&receiverUserId=${
//           JSON.parse(localStorage.getItem("receiverUser"))._id
//         }`
//       );
//       if (response.ok) {
//         setAuthenticated(true);
//         const data = await response.json();
//         setMessages(data.messages);
//       } else {
//         throw new Error("Fetch Messages failed");
//       }
//     } catch (error) {
//       console.error("Fetch Messages error:", error);
//     }
//   };

//   useEffect(() => {
//     if (localStorage.getItem("currentUser")) {
//       fetchUsers();
//     }
//   }, []);

//   useEffect(() => {
//     if (localStorage.getItem("receiverUser")) {
//         fetchChatMessages();
//     }
// },[]);

//   useEffect(() => {
//     if (nc === undefined) {
//       const connectToNATS = async () => {
//         try {
//           const connection = await connect({
//             servers: ["ws://localhost:5050"],
//           });
//           setNc(connection);
//           console.log(nc)
//           console.log("Connected to NATS server...");
//         } catch (error) {
//           console.error("Error connecting to NATS:", error);
//         }
//       };
//       connectToNATS();
//     }
//   }, [nc]);

//   useEffect(() => {
//     console.log("Triger 1");
//     console.log("Triger 2");

//     const handleRecentMessage = async () => {
//       console.log(nc);
//         if (nc) {

//         const userId = `${JSON.parse(localStorage.getItem("currentUser"))._id}_${JSON.parse(localStorage.getItem("receiverUser"))._id}`;
//         const subscription = nc.subscribe(`chat.*`);
//         for await (const m of subscription) {
//           let newMessages = StringCodec().decode(m.data);
//           newMessages = JSON.parse(newMessages);
//           console.log("----")
//           console.log(newMessages);
//           console.log("----")
//           setMessages((prevMessages) => [...prevMessages, newMessages]);
//           fetchChatMessages();
//         }
//       };

//     }

//       console.log("Triger 3");
//       handleRecentMessage();
//       console.log("Triger 4");
//   }, [nc]);

//   const handleSendMessage = async (message) => {
//     setMessageSent(!messageSent);
//     setCurrentMessage(message);
//     setMessages((prevMessages) => [
//       ...prevMessages,
//       {
//         senderUserId: JSON.parse(localStorage.getItem("currentUser"))._id,
//         receiverUserId: JSON.parse(localStorage.getItem("receiverUser"))._id,
//         message: message,
//       },
//     ]);
//     if (nc) {
//       try {
//         await nc.publish(
//           "chat.*",
//           JSON.stringify({
//             senderUserId: JSON.parse(localStorage.getItem("currentUser"))._id,
//             receiverUserId: JSON.parse(localStorage.getItem("receiverUser"))._id,
//             message: message,
//           })
//         );
//         fetchChatMessages();
//       } catch (error) {
//         console.error("Error sending message:", error);
//       }
//     } else {
//       console.error("NATS connection not available.");
//     }
//   };

//   const handleSignUp = async (userInfo) => {
//     try {
//       const response = await fetch("http://localhost:3001/api/users/signup", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(userInfo),
//       });
//       if (response.ok) {
//         setAuthenticated(true);
//         const data = await response.json();
//         setCurrentUser(data.user);
//         localStorage.setItem("token", data.token);
//       } else {
//         throw new Error("Sign up failed");
//       }
//     } catch (error) {
//       console.error("Sign up error:", error);
//     }
//   };

//   const handleLogin = async (userInfo) => {
//     try {
//       const response = await fetch("http://localhost:3001/api/users/login", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(userInfo),
//       });
//       if (response.ok) {
//         setAuthenticated(true);
//         const data = await response.json();
//         setCurrentUser(data.user);
//         localStorage.setItem("token", data.token);
//         localStorage.setItem("currentUser", JSON.stringify(data.user));
//         localStorage.setItem("isAuthenticated", true);
//       } else {
//         throw new Error("Login failed");
//       }
//     } catch (error) {
//       console.error("Login error:", error);
//     }
//   };

//   const handleLogOut = () => {
//     localStorage.removeItem("token");
//     localStorage.removeItem("currentUser");
//     localStorage.removeItem("receiverUser");
//     localStorage.removeItem("isAuthenticated");
//     setAuthenticated(false);
//     setCurrentUser(null);
//   };

//   const fetchUsers = async () => {
//     try {
//       const response = await fetch(
//         `http://localhost:3001/api/users/allusers?emailid=${
//           JSON.parse(localStorage.getItem("currentUser")).email
//         }`
//       );
//       if (response.ok) {
//         const data = await response.json();
//         setUsers(data.users);
//         setAuthenticated(true);
//       } else {
//         throw new Error("Error fetching users");
//       }
//     } catch (error) {
//       console.error("Error fetching users:", error);
//     }
//   };

//   const handleUserClick = (user) => {
//     localStorage.setItem("receiverUser", JSON.stringify(user));
//     // console.log(
//     //   `${JSON.parse(localStorage.getItem("currentUser"))._id}   ${
//     //     JSON.parse(localStorage.getItem("receiverUser"))._id
//     //   }`
//     // );
//     setReceiverChange(!receiverChange);
//     fetchChatMessages();
//     setIsChatStarted(true);
//   };

//   return (
//     <Box
//       sx={{
//         minHeight: "100vh",
//         display: "flex",
//         flexDirection: "column",
//         justifyContent: "center",
//         alignItems: "center",
//         padding: 2,
//       }}
//     >
//       {!localStorage.getItem("token") && !showSignUp ? (
//         <Login
//           handleLogin={handleLogin}
//           switchToSignUp={() => setShowSignUp(true)}
//         />
//       ) : !localStorage.getItem("token") && showSignUp ? (
//         <SignUp
//           handleSignUp={handleSignUp}
//           switchToLogin={() => setShowSignUp(false)}
//         />
//       ) : (
//         <Container maxWidth="xl">
//           <Box mt={3} sx={{ display: "flex", justifyContent: "space-between" }}>
//             <Typography variant="h4">
//               {JSON.parse(localStorage.getItem("currentUser"))
//                 ? JSON.parse(localStorage.getItem("currentUser")).name
//                 : ""}
//             </Typography>
//             <Button variant="contained" onClick={handleLogOut}>
//               Logout
//             </Button>
//           </Box>
//           <Grid container spacing={3}>
//             <Grid item xs={12} md={4}>
//               <Box
//                 bgcolor="white"
//                 p={1}
//                 borderRadius={4}
//                 boxShadow="0 0 10px rgba(0, 0, 0, 0.1)"
//               >
//                 <UserList
//                   currentUser={currentUser}
//                   users={users}
//                   handleUserClick={handleUserClick}
//                 />
//               </Box>
//             </Grid>
//             <Grid item xs={12} md={8}>
//               <Box
//                 bgcolor="white"
//                 p={3}
//                 borderRadius={4}
//                 boxShadow="0 0 10px rgba(0, 0, 0, 0.1)"
//               >
//                 {isChatStarted ? (
//                   <>
//                     <Typography variant="h5" sx={{ mb: 2 }}>
//                       {localStorage.getItem("receiverUser") &&
//                         JSON.parse(localStorage.getItem("receiverUser")).name}
//                     </Typography>
//                     <ChatPanel
//                       isChatStarted={isChatStarted}
//                       currentUser={currentUser}
//                       receiverUser={JSON.parse(localStorage.getItem("receiverUser"))}
//                       messages={messages}
//                       handleSendMessage={handleSendMessage} // Pass handleSendMessage function
//                     />
//                   </>
//                 ) : (
//                   <Box>
//                     Hello {JSON.parse(localStorage.getItem("currentUser")).name}
//                   </Box>
//                 )}
//               </Box>
//             </Grid>
//           </Grid>
//         </Container>
//       )}
//     </Box>
//   );
// };

// export default App;
