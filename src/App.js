import './App.css';
import {useRef} from 'react';
import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { getAllByDisplayValue } from '@testing-library/react';
import { useState } from 'react';

firebase.initializeApp({
   
})
const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {
  const [user] = useAuthState(auth);
  return (
    <div className="App">
      <header className="App-header">
        <h1>ChatApp</h1>
        <SignOut />
      </header>
      <section>
        {user ? <ChatRoom/> : <SignIn />}
      </section>
    </div>
  );
}

function SignIn(){
    const signInWithGoogle = ()=>{
      const provider = new firebase.auth.GoogleAuthProvider();
      auth.signInWithPopup(provider);
    }
    return (
      <button className="sign-in" onClick={signInWithGoogle}> Sign In with Google</button>
    )
}

function SignOut(){
  return auth.currentUser && (
    <button className="sign-out" onClick={() => auth.signOut()}> Sign Out</button>
  )
}
 function ChatRoom(){
   const dummy = useRef();
   const messageRef = firestore.collection('messages');
   const query = messageRef.orderBy('createdAt').limit(25);
   const [messages] = useCollectionData(query, {idField : 'id'});
   const [formValue,setFormValue] = useState('');
   const sendMessage = async(e) => {
     e.preventDefault();
     const { uid,photoURL } = auth.currentUser;
     await messageRef.add({
       text : formValue,
       createdAt : firebase.firestore.FieldValue.serverTimestamp(),
       uid,
       photoURL
     });

     setFormValue('');
     dummy.current.scrollIntoView({behaviour : 'smooth'});
   }
   return(
     <>
     <div>{
       messages && messages.map((msg) => <ChatMessage key={msg.id} message={msg}/>)
       }

     </div>
     <div ref={dummy}></div>
     <form onSubmit={sendMessage}>
       <input value={formValue} onChange={(e) => setFormValue(e.target.value)}/>
       <button type="submit">Send</button>
     </form>
     </>
   )

 }

 function ChatMessage(props){
   const { text ,uid , photoURL } = props.message;
   const messageClass = uid === auth.currentUser.id ? 'sent' : 'received';
   return(
    <div className = {`message ${messageClass}`}>
      <img src={photoURL}></img>
      <p>{text}</p>
      </div>
      )
  }
export default App;
