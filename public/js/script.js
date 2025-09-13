(() => {
  'use strict'

  const forms = document.querySelectorAll('.needs-validation')

  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault()
        event.stopPropagation()

        // focus first invalid field
        const firstInvalid = form.querySelector(':invalid')
        if (firstInvalid) firstInvalid.focus()
      }

      form.classList.add('was-validated')
    }, false)
  })

  // Mobile navbar toggle
  const mobileToggleButton = document.querySelector('.navbar-toggler')
  const mobileMenuOverlay = document.querySelector('.mobile-nav-overlay')
  const mobileMenuClose = document.querySelector('.mobile-menu-close')

  const openMobileMenu = () => {
    if (mobileMenuOverlay) {
      mobileMenuOverlay.classList.add('show')
      document.body.classList.add('modal-open')
    }
  }

  const closeMobileMenu = () => {
    if (mobileMenuOverlay) {
      mobileMenuOverlay.classList.remove('show')
      document.body.classList.remove('modal-open')
    }
  }

  if (mobileToggleButton) {
    mobileToggleButton.addEventListener('click', openMobileMenu)
  }
  if (mobileMenuClose) {
    mobileMenuClose.addEventListener('click', closeMobileMenu)
  }
  if (mobileMenuOverlay) {
    mobileMenuOverlay.addEventListener('click', (e) => {
      if (e.target === mobileMenuOverlay) closeMobileMenu()
    })
    // Close on nav link click
    mobileMenuOverlay.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', closeMobileMenu)
    })
  }
})()
