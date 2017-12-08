const DbUsr = require('../../db/usr');
const router = require('express').Router();
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const util = require('./util');

let msgs;

// Redirect all curation queries to home page if user is not a curator.
router.use('/', (request, response, next) => {
  DbUsr.hasCat(
    request.session.usrID, Number.parseInt(process.env.CURATOR_CAT)
  )
  .then(isCurator => {
    if (isCurator) {
      msgs = response.locals.msgs;
      next();
    }
    else {
      util.redirectHome(request, response);
    }
  })
  .catch(error => util.renderError(error, request, response));
});

router.get('/', (request, response) => {
  response.render('curate', {formData: ''});
});

// Main page for curation of registrations.
router.get('/reg', (request, response) => {
  DbUsr.getUsrs()
  .then(usrs => {
    response.render('curate/reg', {formData: '', usrs});
  })
  .catch(error => util.renderError(error, request, response));
});

/*
  Define a function that logs a specified user out and deletes all sessions
  of the user.
*/
const anonymizeUsr = (usrID, request, response) => {
  if (usrID === response.locals.usr[0].id) {
    util.anonymizeUsr(request, response);
  }
  else {
    request.sessionStore.list((error, fileNames) => {
      const sids = fileNames.map(v => v.replace(/\.json$/, ''));
      sids.forEach(sid => {
        request.sessionStore.get(sid, (error, session) => {
          if (session.usr && (session.usr.id === usrID)) {
            delete session.usr;
            request.sessionStore.destroy(sid, error => {
              if (error) {
                util.renderError(error, request, response);
              }
            });
          }
        });
      });
    });
  }
  return '';
};

// Page for curator edits of a particular user’s registration.
router.get('/reg/:id(\\d+)', (request, response) => {
  DbUsr.getUsr({type: 'id', id: Number.parseInt(request.params.id)})
  .then(deepUsr => {
    // Append to each msgs.cats element whether the user is in it.
    msgs.cats.forEach(
      cat => {
        cat.push(deepUsr[1].includes(Number.parseInt(cat[0])));
      }
    );
    response.render('curate/reg-edit', {usr: deepUsr[0]});
  })
  .catch(error => util.renderError(error, request, response));
});
router.post('/reg/:id(\\d+)', (request, response) => {
  const formData = request.body;
  if (
    !formData.uid
    || !formData.name
    || !formData.email
  ) {
    response.render(
      'curate/reg-edit', {formError: msgs.errNeed3RegFacts, usr: formData}
    );
    return '';
  }
  if (formData.cats) {
    if (Array.isArray(formData.cats)) {
      formData.cats = formData.cats.map(idString => Number.parseInt(idString));
    }
    else {
      formData.cats = [Number.parseInt(formData.cats)];
    }
  }
  else {
    formData.cats = [];
  }
  msgs.cats.forEach(cat => {
    cat.push(formData.cats.includes(cat[0]));
  });
  formData.id = Number.parseInt(request.params.id);
  /*
    Make the changes in the user’s database record and delete the user’s
    session records, forcibly logging the user out.
  */
  return DbUsr.updateUsr(formData)
  .then(() => {
    return DbUsr.getUsr({type: 'id', id: formData.id})
    .then(targetDeepUsr => {
      delete targetDeepUsr[0].pwhash;
      anonymizeUsr(formData.id, request, response);
      response.render(
        'curate/reg-edit-ack', {
          targetDeepUsr, textParts: msgs.regEditAckText.split('{1}')
        }
      );
      return util.mailSend(
        [targetDeepUsr[0], response.locals.usr[0]],
        msgs.regEditMailSubject,
        msgs.regEditMailText.replace('{1}', targetDeepUsr[0].name).replace(
          '{2}',
          '\n\n' + Object.keys(targetDeepUsr[0]).map(
            key => key + ' = ' + targetDeepUsr[0][key]
          ).join('\n') + '\nCategories: ' + targetDeepUsr[1]
        ),
        msgs
      )
      .catch(error => console.log(error.toString()));
    })
    .catch(error => util.renderError(error, request, response, 'regid1'));
  })
  .catch(error => util.renderError(error, request, response, 'regid2'));
});

// Curator deregistration button of a user also logs the user out.
router.get('/reg/:id(\\d+)/dereg', (request, response) => {
  const targetUsrID = Number.parseInt(request.params.id);
  return DbUsr.getUsr({type: 'id', id: targetUsrID})
  .then(targetDeepUsr => {
    return DbUsr.deleteUsr(targetUsrID)
    .then(() => {
      msgs.curateDeregAckText = msgs.curateDeregAckText.replace(
        '{1}', targetDeepUsr[0].name
      );
      anonymizeUsr(targetUsrID, request, response);
      response.render('curate/deregister-ack');
      return util.mailSend(
        [targetDeepUsr[0], response.locals.usr[0]],
        msgs.curateDeregMailSubject,
        msgs.curateDeregMailText.replace('{1}', targetDeepUsr[0].name),
        msgs
      )
      .catch(error => console.log(error.toString()));
    })
    .catch(error => util.renderError(error, request, response, 'iddereg0'));
  })
  .catch(error => util.renderError(error, request, response, 'iddereg1'));
});

// Page for curator editing of the categories in the schema.
router.get('/cat', (request, response) => {
  response.render('curate/cat', {formData: ''});
});

/*
  Page for curator editing of the directories in the document repository
  and the permissions of user categories on the directories.
*/
router.get('/dir', (request, response) => {
  response.render('curate/dir', {formData: ''});
});

module.exports = router;
