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
})()
