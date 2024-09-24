import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Define a type for the user object
interface User {
  username: string;
  email: string;
  password: string;
}

// Prepopulate local storage with dummy user
const dummyUser: User = {
  username: 'dummyuser',
  email: 'abcd1234@gmail.com',
  password: 'abcd1234',
};

const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
const userExists = users.some((user: User) => user.email === dummyUser.email);

if (!userExists) {
  users.push(dummyUser);
  localStorage.setItem('users', JSON.stringify(users));
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);