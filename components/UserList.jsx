import { useState, useEffect } from 'react';
import socket from '../SocketConnect/socket';

const UserList = ({ users }) => {
  const [localUsers, setLocalUsers] = useState(users);

  useEffect(() => {
    setLocalUsers(users);
  }, [users]);

  const handleUserClick = (userId) => {
    console.log('Clicked user:', userId);
    // Could add functionality to focus on specific user
  };

  return (
    <div style={{
      position: 'absolute',
      bottom: '10px',
      left: '10px',
      zIndex: 1000,
      backgroundColor: 'white',
      padding: '10px',
      borderRadius: '5px',
      boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
      maxHeight: '200px',
      overflowY: 'auto'
    }}>
      <h3>Connected Users ({localUsers.length})</h3>
      {localUsers.length === 0 ? (
        <p>No users connected</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {localUsers.map((user) => (
            <li 
              key={user.id}
              onClick={() => handleUserClick(user.id)}
              style={{
                padding: '5px',
                cursor: 'pointer',
                '&:hover': { backgroundColor: '#f0f0f0' }
              }}
            >
              User {user.id.slice(0, 8)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default UserList;
