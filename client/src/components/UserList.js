import React,{memo} from 'react';
import { List, ListItem, ListItemText, Typography, Box } from '@mui/material';

const UserList = ({ users, handleUserClick, currentUser }) => {
    return (
        <Box
            sx={{
                width: '80%',
                margin: 'auto',
                border: '1px solid #ccc',
                padding: '20px',
                borderRadius: '10px',
                boxShadow: '0px 0px 10px 0px rgba(0,0,0,0.1)',
            }}
        >
            <Typography variant="h4" gutterBottom>All Users</Typography>
            <List>
                {users &&
                    users
                        .filter(user => user._id !== JSON.parse(localStorage.getItem("currentUser"))._id)
                        .map((user, index) => (
                            <ListItem
                                key={user._id}
                                button
                                // selected={user._id === (currentUser?.receiverUser ? currentUser?.receiverUser._id : null)}
                                onClick={() => handleUserClick(user)}
                            >
                                <ListItemText primary={user.name} />
                            </ListItem>
                        ))
                }
            </List>
        </Box>
    );
};

export default memo(UserList);



// import React from 'react';
// import { List, ListItem, ListItemText, Typography, Box } from '@mui/material';

// const UserList = ({ users, handleUserClick,currentUser }) => {
//     return (
//         <Box
//             sx={{
//                 width: '80%',
//                 margin: 'auto',
//                 border: '1px solid #ccc',
//                 padding: '20px',
//                 borderRadius: '10px',
//                 boxShadow: '0px 0px 10px 0px rgba(0,0,0,0.1)',
//             }}
//         >
//             <Typography variant="h4" gutterBottom>All Users</Typography>
//             <List>
//                 {users.length > 0 ? (
//                     users
//                         .filter(user => user._id !== currentUser._id)
//                         .map((user, index) => (
//                             <ListItem key={user._id} onClick={() => handleUserClick(user)}>
//                                 <ListItemText primary={user.name} />
//                             </ListItem>
//                         ))
//                 ) : (
//                     <></>
//                 )}
// </List>

//         </Box>
//     );
// };

// export default UserList;
