import { deploymentConfig } from '../SocketConnect/deploymentConfig.js';

const boxStyle = {
  maxWidth: '520px',
  margin: '0 auto',
  padding: '24px',
  backgroundColor: '#fff',
  borderRadius: '8px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
};

const DeployConfigGate = ({ children }) => {
  if (!deploymentConfig.isProduction || deploymentConfig.isValid) {
    return children;
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      backgroundColor: '#f5f5f5',
      fontFamily: 'system-ui, sans-serif',
    }}>
      <div style={boxStyle}>
        <h1 style={{ margin: '0 0 12px', fontSize: '22px', color: '#c33' }}>
          Deployment configuration required
        </h1>
        <p style={{ margin: '0 0 16px', color: '#444', lineHeight: 1.5 }}>
          This build is missing or has invalid environment variables. Add these in
          Vercel → Project → Settings → Environment Variables, then redeploy.
        </p>
        <ul style={{ margin: '0 0 16px', paddingLeft: '20px', color: '#333' }}>
          {deploymentConfig.errors.map((msg) => (
            <li key={msg} style={{ marginBottom: '8px' }}>{msg}</li>
          ))}
        </ul>
        <pre style={{
          margin: 0,
          padding: '12px',
          backgroundColor: '#f8f8f8',
          borderRadius: '6px',
          fontSize: '13px',
          overflow: 'auto',
        }}>
        </pre>
      </div>
    </div>
  );
};

export default DeployConfigGate;
