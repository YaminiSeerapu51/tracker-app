// import { useState } from 'react';
// import { login, register } from '../SocketConnect/auth';

// const Login = ({ onLoginSuccess }) => {
//   const [isLogin, setIsLogin] = useState(true);
//   const [formData, setFormData] = useState({
//     username: '',
//     email: '',
//     password: ''
//   });
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);

//   const handleChange = (e) => {
//     setFormData({
//       ...formData,
//       [e.target.name]: e.target.value
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');
//     setLoading(true);

//     try {
//       if (isLogin) {
//         const result = await login(formData.username, formData.password);
//         console.log('Login successful:', result);
//         onLoginSuccess(result.user);
//       } else {
//         const result = await register(formData.username, formData.email, formData.password);
//         console.log('Registration successful:', result);
//         // Auto-login after registration
//         const loginResult = await login(formData.username, formData.password);
//         onLoginSuccess(loginResult.user);
//       }
//     } catch (err) {
//       setError(err.error || 'Authentication failed');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div style={{
//       position: 'fixed',
//       top: 0,
//       left: 0,
//       right: 0,
//       bottom: 0,
//       display: 'flex',
//       justifyContent: 'center',
//       alignItems: 'center',
//       backgroundColor: 'rgba(0, 0, 0, 0.5)',
//       zIndex: 2000
//     }}>
//       <div style={{
//         backgroundColor: 'white',
//         padding: '2rem',
//         borderRadius: '8px',
//         boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
//         width: '100%',
//         maxWidth: '400px'
//       }}>
//         <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
//           {isLogin ? 'Login' : 'Register'}
//         </h2>

//         {error && (
//           <div style={{
//             backgroundColor: '#fee',
//             color: '#c33',
//             padding: '0.75rem',
//             borderRadius: '4px',
//             marginBottom: '1rem',
//             border: '1px solid #fcc'
//           }}>
//             {error}
//           </div>
//         )}

//         <form onSubmit={handleSubmit}>
//           <div style={{ marginBottom: '1rem' }}>
//             <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
//               Username
//             </label>
//             <input
//               type="text"
//               name="username"
//               value={formData.username}
//               onChange={handleChange}
//               required
//               style={{
//                 width: '100%',
//                 padding: '0.5rem',
//                 border: '1px solid #ddd',
//                 borderRadius: '4px',
//                 fontSize: '1rem'
//               }}
//             />
//           </div>

//           {!isLogin && (
//             <div style={{ marginBottom: '1rem' }}>
//               <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
//                 Email
//               </label>
//               <input
//                 type="email"
//                 name="email"
//                 value={formData.email}
//                 onChange={handleChange}
//                 required
//                 style={{
//                   width: '100%',
//                   padding: '0.5rem',
//                   border: '1px solid #ddd',
//                   borderRadius: '4px',
//                   fontSize: '1rem'
//                 }}
//               />
//             </div>
//           )}

//           <div style={{ marginBottom: '1.5rem' }}>
//             <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
//               Password
//             </label>
//             <input
//               type="password"
//               name="password"
//               value={formData.password}
//               onChange={handleChange}
//               required
//               minLength="6"
//               style={{
//                 width: '100%',
//                 padding: '0.5rem',
//                 border: '1px solid #ddd',
//                 borderRadius: '4px',
//                 fontSize: '1rem'
//               }}
//             />
//           </div>

//           <button
//             type="submit"
//             disabled={loading}
//             style={{
//               width: '100%',
//               padding: '0.75rem',
//               backgroundColor: loading ? '#ccc' : '#007bff',
//               color: 'white',
//               border: 'none',
//               borderRadius: '4px',
//               fontSize: '1rem',
//               cursor: loading ? 'not-allowed' : 'pointer',
//               fontWeight: 'bold'
//             }}
//           >
//             {loading ? 'Processing...' : (isLogin ? 'Login' : 'Register')}
//           </button>
//         </form>

//         <div style={{ textAlign: 'center', marginTop: '1rem' }}>
//           <button
//             type="button"
//             onClick={() => {
//               setIsLogin(!isLogin);
//               setError('');
//             }}
//             style={{
//               background: 'none',
//               border: 'none',
//               color: '#007bff',
//               cursor: 'pointer',
//               textDecoration: 'underline',
//               fontSize: '0.9rem'
//             }}
//           >
//             {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Login;


import { useState } from 'react';
import { auth } from '../SocketConnect/auth';

const Login = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // Parent handles login with single source of truth
        await onLoginSuccess(formData.username, formData.password);
      } else {
        // Register first
        const result = await auth.register(formData.username, formData.email, formData.password);
        console.log('Registration successful:', result);
        // Then login
        await onLoginSuccess(formData.username, formData.password);
      }
    } catch (err) {
      setError(err.error || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      zIndex: 2000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          {isLogin ? 'Login' : 'Register'}
        </h2>

        {error && (
          <div style={{
            backgroundColor: '#fee',
            color: '#c33',
            padding: '0.75rem',
            borderRadius: '4px',
            marginBottom: '1rem',
            border: '1px solid #fcc'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem'
              }}
            />
          </div>

          {!isLogin && (
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem'
                }}
              />
            </div>
          )}

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength="6"
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: loading ? '#ccc' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '1rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 'bold'
            }}
          >
            {loading ? 'Processing...' : (isLogin ? 'Login' : 'Register')}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#007bff',
              cursor: 'pointer',
              textDecoration: 'underline',
              fontSize: '0.9rem'
            }}
          >
            {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
