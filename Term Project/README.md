# Cafe X Cowork Inc. Website

A modern, interactive website for a cafe and coworking space business that combines the comfort of a coffee shop with professional workspace amenities.

## Features

### 1. Interactive Header
- Animated typing effect showcasing workspace features
- Dynamic menu interface with page-flip animation
- Responsive reservation buttons for tables and meeting rooms

### 2. Menu System
- Interactive menu display with paper-like design
- Real-time order quantity management
- Local storage integration for order persistence
- Add/Remove items functionality with quantity tracking

### 3. Dynamic Content Sections
- About Us section
- Image carousel (Image slider) for atmosphere showcase
- Expandable FAQ accordion
- Contact forms with validation for email address, and stars rating. (Custom & Native)

### 4. Reservation System
- Table & Meeting room
- Time slot selection
- Form validation for time slot selection with alert

### 5. Order Management
- Interactive ordering system
- Bill generation with item listing
- User preferable input tip and total amount calculation functionality
- Multiple payment method support
- QR code payment (Placeholder)

### 6. User Experience Features
- Background music with controls (YouTube API integration)
- Responsive navigation with hamburger menu (When the viewport size is less than 640px)
- Star rating system for reviews
- Real-time email validation
- Social media in the footer

### 7. Visual Design
- Custom fonts:
  - Averia Sans Libre
  - Balsamiq Sans
  - Caveat
  - Comforter Brush
- Responsive layout design
- Custom modal dialogs for form validations, reservation and ordering system.
- Smooth animations and transitions
- Responsive & professional image carousel

### 8. Technical Implementation

#### JavaScript Features
- Async/Await for typing animations
- Local Storage for data persistence: Used for the ordering system; to create the bill, persist data for responsive layout management
- YouTube IFrame API integration for background music
- Custom form validation and submission handling
- Dynamic DOM manipulation e.g. Image Carousel, Stars Rating, Open/Close modal.
- Responsive layout management with window's "resize" event

#### CSS Features
- Custom properties (**1** CSS variables)
- Tailwind-like structure (Layer base, components, and utilities)
- Flexbox layouts
- CSS Grid implementation
- Custom animations
- Transition for text color and background color for some of the elements that has hover effect.
- Responsive design breakpoints
- Modal overlay styling
- Custom form styling

#### HTML Structure
- Semantic HTML5 elements
- Custom dialog implementations
- Meta tags for SEO

## Browser Compatibility
- Modern browser support (Chrome, Firefox, Safari, Edge)
- Responsive design for mobile, ipad and desktop. (All tested, work fine) 

## Development
This project uses vanilla JavaScript, CSS3, and HTML5 without any external frameworks or libraries except for the YouTube IFrame API for background music functionality.

### File Structure
- `index.html` - Main HTML structure
- `styles.css` - All styling and animations
- `script.js` - JavaScript functionality
- `/imgs` - Image assets directory
    - `/imgs/carousel` Images in carousel.
    - `/imgs/icons` icons
    - `/imgs/menu` Menu items' image

## Credits
- Fonts from Google Fonts
- Icons from Figma assets library and Google Fonts Icon.
- Images from google search engine (filtered for CC licensed ones only)
- YouTube API for background music
