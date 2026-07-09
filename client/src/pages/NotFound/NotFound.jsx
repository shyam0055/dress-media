import { Link } from 'react-router-dom';
import { FiHome } from 'react-icons/fi';
import '../../styles/globals.css';
import './NotFound.css';

export default function NotFound() {
  return (
    <div className="not-found-page">
      <div className="animated-bg" aria-hidden="true" />
      <div className="not-found-content">
        <span className="not-found-icon">👗</span>
        <h1 className="not-found-code">404</h1>
        <h2 className="not-found-title">Page Not Found</h2>
        <p className="not-found-message">
          This page doesn't exist or has been moved.<br />
          Let's get you back to the fashion.
        </p>
        <Link to="/home" className="btn btn-primary">
          <FiHome /> Back to Home
        </Link>
      </div>
    </div>
  );
}
