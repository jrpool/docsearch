const DbUsr = require('../../db/usr');
const {renderError} = require('../util');
const router = require('express').Router();
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

router.get('/', (request, response) => {
  console.log('here');
  const msgs = response.locals.msgs;
  response.render('curate', {formData: '', msgs});
});

router.get('/reg', (request, response) => {
  const msgs = response.locals.msgs;
  DbUsr.getUsrs()
  .then(usrs => {
    response.render('curate/reg', {formData: '', usrs, msgs});
  })
  .catch(error => renderError(error, request, response));
});

router.get('/reg/:id', (request, response) => {
  const msgs = response.locals.msgs;
  DbUsr.getUsr(request.params.id)
  .then(usr => {
    const grps = msgs.grps.forEach(
      grp => {grp.push(usr.grps.includes(grp[0]))}
    );
    response.render('curate/reg-edit', {usr, grps, msgs});
  })
  .catch(error => renderError(error, request, response));
});

router.get('/grp', (request, response) => {
  const msgs = response.locals.msgs;
  response.render('curate/grp', {formData: '', msgs});
});

router.get('/dir', (request, response) => {
  const msgs = response.locals.msgs;
  response.render('curate/dir', {formData: '', msgs});
});

router.post('/register', (request, response) => {
  const msgs = response.locals.msgs;
  const formData = request.body;
  if (
    !formData.name
    || !formData.email
    || !formData.password1
    || !formData.password2
  ) {
    response.render(
      'usr/register', {formError: msgs.errNeed4RegFacts, formData, msgs}
    );
    return;
  }
  if (formData.password2 !== formData.password1) {
    response.render(
      'usr/register', {formError: msgs.errPasswordsDiffer, formData, msgs}
    );
    return;
  }
  formData.pwHash = getHash(formData.password1);
  DbUsr.getFormUsr('nat', formData)
  .then(usr => {
    if (usr.id) {
      response.render(
        'usr/register', {formError: msgs.errAlreadyUsr, formData, msgs}
      );
    }
    else {
      DbUsr.createUsr(formData)
      /*
        Substitute name into acknowledgements. If registrant is a curator,
        also substitute UID into them.
      */
      .then(result => {
        if (result.length) {
          msgs.regAckText = msgs.regAckTextCur.replace('{1}', result);
          msgs.regMailText = msgs.regMailTextCur.replace('{2}', result);
        }
        response.render('usr/register-ack', {msgs});
        sgMail.send({
          to: {
            email: formData.email,
            name: formData.name.replace(/[,;]/g, '-')
          },
          cc: {
            email: 'info@berkhouse.us',
            name: 'Jonathan Pool'
          },
          from: 'info@berkhouse.us',
          subject: msgs.regMailSubject,
          text: msgs.regMailText.replace('{1}', formData.name)
        });
      });
    }
    return '';
  })
  .catch(error => renderError(error, request, response));
});

router.get('/deregister', (request, response) => {
  const msgs = response.locals.msgs;
  const usr = request.session.usr;
  sgMail.send({
    to: {
      email: usr.email,
      name: usr.name.replace(/[,;]/g, '-')
    },
    cc: {
      email: 'info@berkhouse.us',
      name: 'Jonathan Pool'
    },
    from: 'info@berkhouse.us',
    subject: msgs.deregMailSubject,
    text: msgs.deregMailText.replace('{1}', usr.name)
  });
  DbUsr.deleteUsr(request.session.usr.id)
  .then(() => {
    request.session.destroy();
    msgs.status = '';
    response.render('usr/deregister-ack', {msgs});
    return '';
  })
  .catch(error => renderError(error, request, response));
});

router.get('/login', (request, response) => {
  const msgs = response.locals.msgs;
  response.render('usr/login', {formData: '', msgs});
});

router.post('/login', (request, response) => {
  const msgs = response.locals.msgs;
  const formData = request.body;
  if (!formData.uid || !formData.password) {
    response.render(
      'usr/login', {formError: msgs.errNeed2LoginFacts, formData, msgs}
    );
    return '';
  }
  DbUsr.getFormUsr('uid', formData)
  .then(usr => {
    if (usr.id) {
      if (!bcrypt.compareSync(formData.password, usr.pwhash)) {
        response.render(
          'usr/login', {formError: msgs.errLogin, formData, msgs}
        );
        return '';
      }
      else {
        delete usr.pwhash;
        request.session.usr = usr;
        response.render('usr/login-ack', {msgs});
      }
    }
    else {
      response.render(
        'usr/login', {formError: msgs.errLogin, formData, msgs}
      );
      return '';
    }
  })
  .catch(error => renderError(error, request, response));
});

router.get('/logout', (request, response) => {
  const msgs = response.locals.msgs;
  delete request.session.usr;
  delete request.session.id;
  msgs.status = '';
  response.render('usr/logout-ack', {msgs});
});

module.exports = router;
