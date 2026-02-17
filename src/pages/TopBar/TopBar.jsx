import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
// Removed toggleTheme import
import { openModal } from "../../redux/slices/modalSlice";
import { MapPin, Mail, CalendarDays, Menu, X, Search } from "lucide-react"; // Removed Sun, Moon
import styles from "./TopBar.module.css";
import { catalogService } from "../../services/catalogService";
import { getImageUrl } from "../../utils/imageHelper";

const TopBar = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  // Removed theme selector

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchRef = useRef(null);

  // Handle Scroll Effect
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle Search using backend API
  useEffect(() => {
    const performSearch = async () => {
      if (searchQuery.trim() === "") {
        setSearchResults([]);
        setShowSearchDropdown(false);
        return;
      }

      try {
        const response = await catalogService.search(searchQuery);
        if (response && response.success) {
          setSearchResults(response.data);
          setShowSearchDropdown(response.data.length > 0);
        }
      } catch (error) {
        console.error("Search error:", error);
      }
    };

    const debounce = setTimeout(performSearch, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };

  // Helper to check active state
  const isActive = (path) => location.pathname === path;

  // --- NEW HANDLER FOR QUICK BOOKING ---
  const handleQuickBooking = () => {
    dispatch(openModal({ type: "QUICK_BOOKING" }));
  };

  // --- SEARCH HANDLERS ---
  const handleSearchResultClick = (result) => {
    // Fill the search bar with the complete name
    setSearchQuery(result.fullName || result.name);

    if (result.type === "brand") {
      navigate(`/repair-brand/${result.name.toLowerCase()}`);
    } else {
      // For specific device models, navigate to the model repair page
      // We pass the full object in state as ModelRepairPage expects it
      navigate(`/repair/model/${result.id}`, { state: { model: result } });
    }
    setShowSearchDropdown(false);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
    <>
      {/* --- Top Strip --- */}
      <div className={styles.topStrip}>
        <div className={styles.container}>
          <div className={styles.stripContent}>
            <div className={styles.locationPill}>
              <MapPin size={14} className={styles.icon} />
              <span>Bengaluru | Hyderabad | Mumbai</span>
            </div>

            <div className={styles.rightStripGroup}>
              <div className={styles.emailGroup}>
                <a
                  href="mailto:info@cellclinichyd.com"
                  className={styles.contactLink}
                >
                  <Mail size={14} />
                  <span>info@cellclinichyd.com</span>
                </a>
              </div>

              {/* --- UPDATED BUTTON --- */}
              <button
                className={styles.bookNowBtnSmall}
                onClick={handleQuickBooking}
              >
                <CalendarDays size={14} />
                <span>Book Now</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- Main Navigation Bar --- */}
      <div
        className={`${styles.mainNav} ${isScrolled ? styles.stickyShadow : ""}`}
      >
        <div className={styles.container}>
          <div className={styles.navContent}>
            {/* Logo */}
            <Link to="/" className={styles.logoGroup}>
              <img
                src="/logo.webp"
                alt="Cell Clinic Logo"
                className={styles.logoImage}
              />
              <span className={styles.brandName}>CELL CLINIC HYD</span>
            </Link>

            {/* Desktop Links */}
            <nav className={styles.navLinks}>
              <Link to="/" className={isActive("/") ? styles.linkActive : ""}>
                Home
              </Link>
              <Link
                to="/about"
                className={isActive("/about") ? styles.linkActive : ""}
              >
                About
              </Link>
              <Link
                to="/services"
                className={isActive("/services") ? styles.linkActive : ""}
              >
                Services
              </Link>
              <Link
                to="/privacy-policy"
                className={isActive("/privacy-policy") ? styles.linkActive : ""}
              >
                Privacy Policy
              </Link>
              <Link
                to="/contact"
                className={isActive("/contact") ? styles.linkActive : ""}
              >
                Contact
              </Link>

              {/* Search Bar */}
              <div className={styles.searchContainer} ref={searchRef}>
                <div className={styles.searchInputWrapper}>
                  <Search size={18} className={styles.searchIcon} />
                  <input
                    type="text"
                    placeholder="Search devices..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onFocus={() => searchQuery && setShowSearchDropdown(true)}
                    className={styles.searchInput}
                  />
                </div>

                {/* Search Dropdown */}
                {showSearchDropdown && searchResults.length > 0 && (
                  <div className={styles.searchDropdown}>
                    {searchResults.map((result, index) => (
                      <div
                        key={index}
                        className={styles.searchResultItem}
                        onClick={() => handleSearchResultClick(result)}
                      >
                        <img
                          src={getImageUrl(result.image)}
                          alt={result.name}
                          className={styles.searchResultImage}
                          onError={(e) => (e.target.src = "/logo.webp")}
                        />
                        <div className={styles.searchResultInfo}>
                          <div className={styles.searchResultName}>
                            {result.fullName || result.name}
                          </div>
                          <div className={styles.searchResultType}>
                            {result.type === "brand"
                              ? "Brand"
                              : result.brandName}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </nav>

            {/* Actions */}
            <div className={styles.actions}>
              {/* REMOVED THEME TOGGLE BUTTON HERE */}

              {/* Mobile Toggle */}
              <button
                className={styles.mobileMenuBtn}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* --- Mobile Menu --- */}
        <div
          className={`${styles.mobileMenuContainer} ${isMenuOpen ? styles.menuOpen : ""
            }`}
        >
          <div className={styles.mobileLinks}>
            <Link
              to="/"
              onClick={handleLinkClick}
              className={isActive("/") ? styles.linkActive : ""}
            >
              Home
            </Link>
            <Link
              to="/about"
              onClick={handleLinkClick}
              className={isActive("/about") ? styles.linkActive : ""}
            >
              About
            </Link>
            <Link
              to="/services"
              onClick={handleLinkClick}
              className={isActive("/services") ? styles.linkActive : ""}
            >
              Services
            </Link>
            <Link
              to="/privacy-policy"
              onClick={handleLinkClick}
              className={isActive("/privacy-policy") ? styles.linkActive : ""}
            >
              Privacy Policy
            </Link>
            <Link
              to="/contact"
              onClick={handleLinkClick}
              className={isActive("/contact") ? styles.linkActive : ""}
            >
              Contact
            </Link>

            <div className={styles.mobileBtnWrapper}>
              <button
                className={styles.contactBtnMobile}
                onClick={() => {
                  handleLinkClick();
                  handleQuickBooking();
                }}
              >
                Book a Repair
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TopBar;
