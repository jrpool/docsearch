document.addEventListener('DOMContentLoaded', () => {

  const confirmDelete = event => {
    if (!confirm('Are you sure you want to delete this document?')) {
      event.preventDefault();
    }
  };

  [].forEach.call(
    document.querySelectorAll('.delete-document'), link => {
      link.addEventListener('click', confirmDelete);
    }
  );

  const isBlank = value => !value || /^\s*$/.test(value);

  const newContactform = document.querySelector('.new-contact-form');

  if (newContactform) {
    newContactform.addEventListener('submit', event => {
      const errors = [];
      const validateInput = (name, humanizedName) => {
        const input = newContactform.querySelector(
          'input[name="'+name+'"]'
        );
        if (isBlank(input.value)) {
          errors.push(humanizedName+' cannot be blank');
        }
      };
      validateInput('first_name', 'First name');
      validateInput('last_name', 'Last name');
      if (errors.length) {
        event.preventDefault();
        newContactform.querySelector(
          '.form-errors'
        ).textContent = errors.join('\n');
      }
    });
  }

});
