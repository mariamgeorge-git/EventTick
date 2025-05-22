import React from 'react';
import './Footer.css'; // Import the CSS file

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer> {/* Use the footer tag and let CSS handle styling */}
      <div className="footer-container"> {/* Use a class for the container */}
        <p className="footer-text"> {/* Use a class for text */}
          © {currentYear} Your Ticketing System. All rights reserved.
        </p>
        <div className="footer-contact"> {/* Use a class for contact info */}
          <p>Contact: info@yourtickettingsystem.com | Phone: (123) 456-7890</p>
          {/* Add links here if needed */}
          {/* <a href="#">Privacy Policy</a> */}
          {/* <a href="#">Terms of Service</a> */}
        </div>
      </div>
    </footer>
  );
};

export default Footer; 