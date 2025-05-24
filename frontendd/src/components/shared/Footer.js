import React from 'react';
import './Footer.css'; // Import the CSS file
import { FaInstagram, FaFacebookF, FaTwitter, FaTiktok } from 'react-icons/fa'; // Import social media icons

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer> {/* Use the footer tag and let CSS handle styling */}
      <div className="footer-container"> {/* Use a class for the container */}
        <div className="footer-section"> {/* Wrap copyright in a section */}
          <p className="footer-text"> {/* Use a class for text */}
            © {currentYear} Your Ticketing System. All rights reserved.
          </p>
        </div>
        
        <div className="footer-section"> {/* Wrap contact/social in a section */}
          <div className="footer-social">
            <p className="follow-us-text">Follow us</p>
            <div className="social-icons">
              <a href="#" aria-label="Instagram"><FaInstagram /></a>
              <a href="#" aria-label="Facebook"><FaFacebookF /></a>
              <a href="#" aria-label="Twitter"><FaTwitter /></a>
              <a href="#" aria-label="TikTok"><FaTiktok /></a>
            </div>
          </div>
          <div className="footer-contact-info">
             <p>Contact: info@yourtickettingsystem.com | Phone: (123) 456-7890</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 