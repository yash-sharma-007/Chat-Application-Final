// ChatPanel.js

import React, { useState, useEffect, useRef, memo } from "react";
import { TextField, Button, Box, Typography } from "@mui/material";
import { StringCodec } from "nats.ws";

const ChatPanel = ({ setMessages, messages, nc, fetchChatMessages }) => {
    const [messageInput, setMessageInput] = useState("");
    const messagesContainerRef = useRef(null);
    const [flag,setFlag] = useState(false);

    const handleChange = (event) => {
        setMessageInput(event.target.value);
    };

    const handleSendMessage = async () => {
        if (messageInput.trim() !== '') {
            try {
              setMessages((prevMessages) => [
                ...prevMessages,
                {
                  senderUserId: JSON.parse(localStorage.getItem("currentUser"))._id,
                  receiverUserId: JSON.parse(localStorage.getItem("receiverUser"))._id,
                  message: messageInput,
                },
              ]);
              setMessageInput('');
              if (nc) {
                let userId = `${JSON.parse(localStorage.getItem("currentUser"))._id}${JSON.parse(localStorage.getItem("receiverUser"))._id}`;
                userId = userId.split('').sort().join('');
                await nc.publish(
                  `chat.${userId}`,
                  JSON.stringify({
                    senderUserId: JSON.parse(localStorage.getItem("currentUser"))._id,
                    receiverUserId: JSON.parse(localStorage.getItem("receiverUser"))._id,
                    message: messageInput,
                  })
                );
              } else {
                console.error("NATS connection not available.");
              }
            } catch (error) {
              console.error("Error sending message:", error);
            }
        }
      };

    useEffect(() => {
        if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
    }, [messages]);

    useEffect(() => {
        const handleRecentMessage = async () => {
            if (nc && localStorage.getItem("token")) {
                let userId = `${JSON.parse(localStorage.getItem("currentUser"))._id}${JSON.parse(localStorage.getItem("receiverUser"))._id}`;
                userId = userId.split('').sort().join('');
                const subscription = await nc.subscribe(`chat.${userId}`);
                for await (const m of subscription) {
                    let newMessage = StringCodec().decode(m.data);
                    newMessage = JSON.parse(newMessage);
                    const existingMessage = messages.find(msg => msg._id === newMessage._id);
                    if (!existingMessage) {
                        setMessages(prevMessages => [...prevMessages, newMessage]);
                    }
                }
            }
        };
        handleRecentMessage();
    
    }, [nc]);

    return (
        <Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '500px', overflow: 'scroll' }} ref={messagesContainerRef}>
                <Box sx={{ mb: 2 }}>
                    {messages && messages
                        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                        .map((message, index) => (
                            <Box
                                key={index}
                                sx={{
                                    marginBottom: 1,
                                    padding: 2,
                                    float: message.senderUserId === JSON.parse(localStorage.getItem("currentUser"))._id ? 'right' : 'left',
                                    clear: 'both',
                                    textAlign: message.senderUserId === JSON.parse(localStorage.getItem("currentUser"))._id ? 'right' : 'left',
                                    marginLeft: message.senderUserId === JSON.parse(localStorage.getItem("currentUser"))._id ? 'auto' : '0',
                                }}
                            >
                                <Typography sx={{ backgroundColor: 'whitesmoke' }} >
                                    {message.message}
                                    <Typography variant="caption" sx={{ color: 'gray', display: 'block', fontSize: '0.8rem' }}>
                                        {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </Typography>
                                </Typography>
                            </Box>
                        ))}
                </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TextField
                    label="Type a message"
                    variant="outlined"
                    value={messageInput}
                    onChange={handleChange}
                    sx={{ mr: 2 }}
                />
                <Button variant="contained" onClick={handleSendMessage}>Send</Button>
            </Box>
        </Box>
    );
};

export default memo(ChatPanel);









// import React, { useState, useEffect, useRef, memo } from "react";
// import { TextField, Button, Box, Typography } from "@mui/material";
// import { connect, StringCodec } from "nats.ws";

// const ChatPanel = ({ setMessages, messages, handleSendMessage, nc, fetchChatMessages }) => {
//     const [messageInput, setMessageInput] = useState("");
//     const messagesContainerRef = useRef(null);

//     const handleChange = (event) => {
//         setMessageInput(event.target.value);
//     };

//     const handleSend = () => {
//         if (messageInput.trim() !== '') {
//             handleSendMessage(messageInput);
//             setMessageInput('');
//         }
//     };

//     useEffect(() => {
//         if (messagesContainerRef.current) {
//             messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
//         }
//     }, [messages]);

//     useEffect(() => {
//         const handleRecentMessage = async () => {
//             if (nc && localStorage.getItem("token")) {
//                 let userId = `${JSON.parse(localStorage.getItem("currentUser"))._id}${JSON.parse(localStorage.getItem("receiverUser"))._id}`;
//                 userId = userId.split('').sort().join('');
//                 const subscription = await nc.subscribe(`chat.${userId}`);
//                 for await (const m of subscription) {
//                     let newMessage = StringCodec().decode(m.data);
//                     newMessage = JSON.parse(newMessage);
//                     const existingMessage = messages.find(msg => msg._id === newMessage._id);
//                     if (!existingMessage) {
//                         setMessages(prevMessages => [...prevMessages, newMessage]);
//                     }
//                 }
//             }
//         };
//         handleRecentMessage();
//     }, [nc]);

//     return (
//         <Box>
//             <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '500px', overflow: 'scroll' }} ref={messagesContainerRef}>
//                 <Box sx={{ mb: 2 }}>
//                     {messages && messages
//                         .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
//                         .map((message, index) => (
//                             <Box
//                                 key={index} 
//                                 sx={{
//                                     marginBottom: 1,
//                                     padding: 2,
//                                     float: message.senderUserId === JSON.parse(localStorage.getItem("currentUser"))._id ? 'right' : 'left',
//                                     clear: 'both',
//                                     textAlign: message.senderUserId === JSON.parse(localStorage.getItem("currentUser"))._id ? 'right' : 'left',
//                                     marginLeft: message.senderUserId === JSON.parse(localStorage.getItem("currentUser"))._id ? 'auto' : '0',
//                                 }}
//                             >
//                                 <Typography sx={{ backgroundColor: 'whitesmoke' }} >
//                                     {message.message}
//                                     <Typography variant="caption" sx={{ color: 'gray', display: 'block', fontSize: '0.8rem' }}>
//                                         {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//                                     </Typography>
//                                 </Typography>
//                             </Box>
//                         ))}
//                 </Box>
//             </Box>

//             <Box sx={{ display: 'flex', alignItems: 'center' }}>
//                 <TextField
//                     label="Type a message"
//                     variant="outlined"
//                     value={messageInput}
//                     onChange={handleChange}
//                     sx={{ mr: 2 }}
//                 />
//                 <Button variant="contained" onClick={handleSend}>Send</Button>
//             </Box>
//         </Box>
//     );
// };

// export default memo(ChatPanel);








// import React, { useState, useEffect, useRef,memo } from "react";
// import { TextField, Button, Box, Typography } from "@mui/material";
// import { connect, StringCodec } from "nats.ws";

// const ChatPanel = ({setMessages, messages, handleSendMessage,nc,fetchChatMessages }) => {
//     const [messageInput, setMessageInput] = useState("");
//     const messagesContainerRef = useRef(null);
//     const [newMessages,setNewMessages] = useState([]);

//     const handleChange = (event) => {
//         setMessageInput(event.target.value);
//     };

//     const handleSend = () => {
//         if (messageInput.trim() !== '') {
//             setMessages((prevMessages) => [
//                 ...prevMessages,
//                 {
//                   senderUserId: JSON.parse(localStorage.getItem("currentUser"))._id,
//                   receiverUserId: JSON.parse(localStorage.getItem("receiverUser"))._id,
//                   message: messageInput,
//                 },
//               ]);
//             handleSendMessage(messageInput);
//             setMessageInput('');
//         }
//     };

//     useEffect(() => {
//         if (messagesContainerRef.current) {
//             messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
//         }
//     }, [messages]);

//     useEffect(() => {
//         const handleRecentMessage = async () => {
//           if (nc && localStorage.getItem("token")) {
//             let userId = `${JSON.parse(localStorage.getItem("currentUser"))._id}${JSON.parse(localStorage.getItem("receiverUser"))._id}`;
//             userId = userId.split('').sort().join('');
//             const subscription = await nc.subscribe(`chat.${userId}`);
//             for await (const m of subscription) {
//               let newMessages = StringCodec().decode(m.data);
//               newMessages = JSON.parse(newMessages);
//               if(!messages.includes(newMessages)){
//                 setMessages((prevMessages) => [...prevMessages, newMessages]);
//               }
//             }
//           }
//         };
//         handleRecentMessage();
//       }, [nc]);

//     return (
//         <Box>
//             <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '500px', overflow: 'scroll' }} ref={messagesContainerRef}>
//                 <Box sx={{ mb: 2 }}>
//                     {messages && messages
//                         .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
//                         .map((message, index) => (
//                             <Box
//                                 key={index}
//                                 sx={{
//                                     marginBottom: 1,
//                                     padding: 2,
//                                     float: message.senderUserId === JSON.parse(localStorage.getItem("currentUser"))._id ? 'right' : 'left',
//                                     clear: 'both',
//                                     textAlign: message.senderUserId === JSON.parse(localStorage.getItem("currentUser"))._id ? 'right' : 'left',
//                                     marginLeft: message.senderUserId === JSON.parse(localStorage.getItem("currentUser"))._id ? 'auto' : '0',
//                                 }}
//                             >
//                                 <Typography sx={{ backgroundColor: 'whitesmoke' }} >
//                                     {message.message}
//                                     <Typography variant="caption" sx={{ color: 'gray', display: 'block', fontSize: '0.8rem' }}>
//                                         {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//                                     </Typography>
//                                 </Typography>
//                             </Box>
//                         ))}
//                 </Box>
//             </Box>

//             <Box sx={{ display: 'flex', alignItems: 'center' }}>
//                 <TextField
//                     label="Type a message"
//                     variant="outlined"
//                     value={messageInput}
//                     onChange={handleChange}
//                     sx={{ mr: 2 }}
//                 />
//                 <Button variant="contained" onClick={handleSend}>Send</Button>
//             </Box>
//         </Box>
//     );
// };

// export default memo(ChatPanel);










// import React, { useState, useEffect, useRef,memo } from "react";
// import { TextField, Button, Box, Typography } from "@mui/material";

// const ChatPanel = ({ messages, handleSendMessage, currentUser, receiverUser, isChatStart }) => {
//     const [messageInput, setMessageInput] = useState("");
//     const messagesContainerRef = useRef(null);

//     const handleChange = (event) => {
//         setMessageInput(event.target.value);
//     };

//     const handleSend = () => {
//         if (messageInput.trim() !== '') {
//             handleSendMessage(messageInput);
//             setMessageInput('');
//         }
//     };

//     useEffect(() => {
//         if (messagesContainerRef.current) {
//             messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
//         }
//     }, [messages]);

//     return (
//         <Box>
//             <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '500px', overflow: 'scroll' }} ref={messagesContainerRef}>
//                 <Box sx={{ mb: 2 }}>
//                     {messages && messages
//                         .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
//                         .map((message, index) => (
//                             <Box
//                                 key={index}
//                                 sx={{
//                                     marginBottom: 1,
//                                     padding: 2,
//                                     float: message.senderUserId === JSON.parse(localStorage.getItem("currentUser"))._id ? 'right' : 'left',
//                                     clear: 'both',
//                                     textAlign: message.senderUserId === JSON.parse(localStorage.getItem("currentUser"))._id ? 'right' : 'left',
//                                     marginLeft: message.senderUserId === JSON.parse(localStorage.getItem("currentUser"))._id ? 'auto' : '0',
//                                 }}
//                             >
//                                 <Typography sx={{ backgroundColor: 'whitesmoke' }} >
//                                     {message.message}
//                                     <Typography variant="caption" sx={{ color: 'gray', display: 'block', fontSize: '0.8rem' }}>
//                                         {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//                                     </Typography>
//                                 </Typography>
//                             </Box>
//                         ))}
//                 </Box>
//             </Box>

//             <Box sx={{ display: 'flex', alignItems: 'center' }}>
//                 <TextField
//                     label="Type a message"
//                     variant="outlined"
//                     value={messageInput}
//                     onChange={handleChange}
//                     sx={{ mr: 2 }}
//                 />
//                 <Button variant="contained" onClick={handleSend}>Send</Button>
//             </Box>
//         </Box>
//     );
// };

// export default memo(ChatPanel);
