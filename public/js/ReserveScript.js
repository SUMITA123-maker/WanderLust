// Updated ReserveScript.js - Enhanced version with better debugging

document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, initializing mobile booking...');
  
  // ========== MOBILE NAVIGATION ==========
  const navbarToggler = document.querySelector('.navbar-toggler');
  const mobileNavOverlay = document.querySelector('.mobile-nav-overlay');
  const mobileMenuClose = document.querySelector('.mobile-menu-close');

  // Open mobile menu
  if (navbarToggler && mobileNavOverlay) {
    navbarToggler.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      mobileNavOverlay.classList.add('show');
    });
  }

  // Close mobile menu
  if (mobileMenuClose && mobileNavOverlay) {
    mobileMenuClose.addEventListener('click', function() {
      mobileNavOverlay.classList.remove('show');
    });
  }

  // Close menu when clicking outside
  if (mobileNavOverlay) {
    mobileNavOverlay.addEventListener('click', function(e) {
      if (e.target === mobileNavOverlay) {
        mobileNavOverlay.classList.remove('show');
      }
    });
  }

  // Close menu when clicking nav links
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-list a');
  mobileNavLinks.forEach(link => {
    link.addEventListener('click', function() {
      if (mobileNavOverlay) {
        mobileNavOverlay.classList.remove('show');
      }
    });
  });

  // ========== MOBILE BOOKING MODAL - ENHANCED ==========
  const bookingModal = document.getElementById('bookingModal');
  const openBookingBtn = document.getElementById('openBookingModal');
  const closeBookingBtn = document.getElementById('closeBookingModal');

  console.log('Booking elements found:', {
    modal: !!bookingModal,
    openBtn: !!openBookingBtn,
    closeBtn: !!closeBookingBtn,
    modalElement: bookingModal,
    openBtnElement: openBookingBtn
  });

  // Enhanced modal opening with debugging
  if (openBookingBtn) {
    openBookingBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      console.log('Reserve button clicked!');
      // Only open modal on small screens
      // Treat anything below large desktop (< 1200px) as mobile for the modal
      const isMobile = window.matchMedia('(max-width: 1199px)').matches;
      if (!isMobile) {
        console.log('Desktop detected: not opening mobile modal');
        return;
      }
      
      if (bookingModal) {
        console.log('Modal found, opening...');
        
        // Add classes
        bookingModal.classList.add('active');
        document.body.classList.add('modal-open');
        
        // Force display as backup
        bookingModal.style.display = 'flex';
        bookingModal.style.zIndex = '100000';
        bookingModal.style.height = '100dvh';
        
        // Ensure modal is visible on mobile
        bookingModal.style.opacity = '1';
        bookingModal.style.visibility = 'visible';
        
        console.log('Modal classes after click:', bookingModal.className);
        console.log('Modal computed style:', window.getComputedStyle(bookingModal).display);
        console.log('Modal visibility:', window.getComputedStyle(bookingModal).visibility);
        
        // Scroll to top of modal content
        const modalContent = bookingModal.querySelector('.modal-content');
        if (modalContent) {
          modalContent.scrollTop = 0;
          modalContent.style.maxHeight = '96dvh';
          modalContent.style.width = '100%';
        }
        
        // Set date inputs min values
        const today = new Date().toISOString().split('T')[0];
        const checkinMobile = document.getElementById('checkinMobile');
        const checkoutMobile = document.getElementById('checkoutMobile');
        
        if (checkinMobile) {
          checkinMobile.min = today;
        }
        
        if (checkoutMobile && checkinMobile) {
          checkoutMobile.min = checkinMobile.value || today;
        }
        
      } else {
        console.error('ERROR: bookingModal not found!');
      }
    });
    console.log('Click event listener added to Reserve button');
  } else {
    console.error('ERROR: openBookingModal button not found!');
  }

  // Enhanced modal closing
  if (closeBookingBtn) {
    closeBookingBtn.addEventListener('click', function(e) {
      e.preventDefault();
      console.log('Close button clicked');
      closeModal();
    });
  } else {
    console.warn('WARNING: closeBookingModal button not found');
  }

  // Function to close modal
  function closeModal() {
    if (bookingModal) {
      bookingModal.classList.remove('active');
      document.body.classList.remove('modal-open');
      bookingModal.style.display = 'none';
      bookingModal.style.opacity = '0';
      bookingModal.style.visibility = 'hidden';
      console.log('Modal closed');
    }
  }

  // Close modal when clicking outside
  if (bookingModal) {
    bookingModal.addEventListener('click', function(e) {
      if (e.target === bookingModal) {
        console.log('Clicked outside modal, closing...');
        closeModal();
      }
    });
  }

  // ========== ESCAPE KEY HANDLER ==========
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      console.log('Escape key pressed');
      
      // Close booking modal
      if (bookingModal && bookingModal.classList.contains('active')) {
        closeModal();
      }
      
      // Close mobile menu
      if (mobileNavOverlay && mobileNavOverlay.classList.contains('show')) {
        mobileNavOverlay.classList.remove('show');
      }
    }
  });

  // ========== DATE CONSTRAINTS ==========
  const today = new Date().toISOString().split('T')[0];
  const checkinInputs = document.querySelectorAll('input[name="checkin"]');
  const checkoutInputs = document.querySelectorAll('input[name="checkout"]');
  
  // Set minimum dates
  checkinInputs.forEach(input => {
    input.min = today;
    input.addEventListener('change', function() {
      checkoutInputs.forEach(checkoutInput => {
        checkoutInput.min = this.value;
      });
    });
  });
  
  // Mobile specific date handling
  const checkinMobile = document.getElementById('checkinMobile');
  const checkoutMobile = document.getElementById('checkoutMobile');
  
  if (checkinMobile) {
    checkinMobile.min = today;
    checkinMobile.addEventListener('change', function() {
      if (checkoutMobile) {
        checkoutMobile.min = this.value;
      }
    });
  }

  // ========== WINDOW RESIZE HANDLER ==========
  window.addEventListener('resize', function() {
    if (window.innerWidth > 1199) {
      // Close mobile menu if screen becomes large desktop size
      if (mobileNavOverlay) {
        mobileNavOverlay.classList.remove('show');
      }
      // Close mobile modal if screen becomes large desktop size
      if (bookingModal) {
        closeModal();
      }
    }
  });

  // ========== FORM VALIDATION ==========
  const mobileBookingForm = document.getElementById('mobile-booking-form');
  if (mobileBookingForm) {
    console.log('Mobile booking form found');
    
    mobileBookingForm.addEventListener('submit', function(e) {
      console.log('Form submitted');
      const requiredFields = this.querySelectorAll('[required]');
      let allValid = true;
      
      requiredFields.forEach(field => {
        if (!field.value.trim()) {
          allValid = false;
          field.classList.add('is-invalid');
        } else {
          field.classList.remove('is-invalid');
        }
      });

      // Check date logic
      const checkin = this.querySelector('input[name="checkin"]').value;
      const checkout = this.querySelector('input[name="checkout"]').value;
      
      if (checkin && checkout && new Date(checkin) >= new Date(checkout)) {
        e.preventDefault();
        alert('Checkout date must be after check-in date');
        return false;
      }

      if (!allValid) {
        e.preventDefault();
        alert('Please fill in all required fields');
        return false;
      }
      
      console.log('Form validation passed');
    });
  } else {
    console.warn('Mobile booking form not found');
  }

  // ========== ADDITIONAL DEBUGGING ==========
  console.log('Mobile scripts loaded successfully');
  console.log('Screen width:', window.innerWidth);
  console.log('Is mobile view:', window.innerWidth <= 767);
  
  // Check if elements exist after a short delay
  setTimeout(function() {
    console.log('Delayed check - Modal exists:', !!document.getElementById('bookingModal'));
    console.log('Delayed check - Button exists:', !!document.getElementById('openBookingModal'));
    
    const modal = document.getElementById('bookingModal');
    if (modal) {
      console.log('Modal current display:', window.getComputedStyle(modal).display);
      console.log('Modal current visibility:', window.getComputedStyle(modal).visibility);
    }
  }, 1000);
  
  // Test function - remove in production
  window.testModalOpen = function() {
    console.log('Manual modal test');
    if (bookingModal) {
      bookingModal.classList.add('active');
      bookingModal.style.display = 'flex';
      document.body.classList.add('modal-open');
    }
  };
  
  console.log('You can test the modal manually by running: testModalOpen() in console');
});