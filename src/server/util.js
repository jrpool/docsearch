const eng = {
  'accessText': 'You can browse and search documents here. Some of them have access limitations. If you are a BTH member, prospective member, resident, or manager, you can register or log in for additional access.',
  'accessTitle': 'Access',
  'btnDocsAdd': 'Add one',
  'btnDocsBrowse': 'Browse',
  'btnDocsSearch': 'Search',
  'btnCurate': 'Curate',
  'btnCurateCat': 'User categories',
  'btnCurateDir': 'Directory permissions',
  'btnCurateReg': 'A user’s registration',
  'btnDeregister': 'Deregister',
  'btnHome': 'Home',
  'btnLogin': 'Log in',
  'btnRegister': 'Register',
  'btnSeeDocs': 'See documents',
  'btnSeePubDocs': 'See public documents',
  'btnSubmit': 'Submit',
  'catHead': 'Your relationships to BTH:',
  'cats': [
    ['cat1', 'General public'],
    ['cat2', 'Member'],
    ['cat3', 'Nonmember resident'],
    ['cat4', 'Manager'],
    ['cat5', 'Prospective member'],
    ['cat6', 'Director'],
    ['cat7', 'Treasurer'],
    ['cat8', 'Other']
  ],
  'choose': 'Please choose:',
  'curateCatChoose': 'Please choose a category:',
  'curateCatHere': 'You can curate user categories here.',
  'curateChoose': 'Please choose what to curate:',
  'curateDirChoose': 'Please choose a directory permission:',
  'curateDirHere': 'You can curate directory permissions here.',
  'curateHere': 'You can curate this <code>docsearch</code> site here.',
  'curateRegChoose': 'Please choose a user:',
  'curateRegHere': 'You can curate user registrations here.',
  'curateRegEditHere': 'You can curate the registration of user {1} here.',
  'curation': 'Curation',
  'curationCat': 'User-Category Curation',
  'curationDir': 'Directory-Permission Curation',
  'curationReg': 'Registration Curation',
  'curationRegEdit': 'Registration Curation: User {1}',
  'deregAckText': 'Your deregistration succeeded. You are no longer registered or logged in.',
  'deregAckTitle': 'Deregistration Successful',
  'deregMailSubject': 'Deregistration at berkhouse.us',
  'deregMailText': 'This confirms that, at the request of the registrant, the registration of {1} at http://berkhouse.us has been terminated. Please feel free to register again. Thanks!',
  'docsAddHere': 'You can add a document to the repository here.',
  'docsAddTitle': 'Add a Document',
  'docsChoose': 'Please choose what to do with documents:',
  'docsText': 'You can access documents here.',
  'docsBrowseText': 'Click on a directory or file to see its contents.',
  'docsBrowseTitle': 'Browse Documents',
  'docsSearchHere': 'You can search for documents here.',
  'docsSearchTitle': 'Search for Documents',
  'docsTitle': 'Documents from BTH',
  'email': 'Email address:',
  'errAlreadyUsr': 'Someone with that name and email address is already registered.',
  'errGeneral': 'Something was wrong with the inputs.',
  'errLogin': 'Nobody with that ID-password combination is registered.',
  'errNeed2LoginFacts': 'Both an ID and a password are required.',
  'errNeed3RegFacts': 'A name, UID, and email address are required.',
  'errNeed4RegFacts': 'A name, an email address, and duplicate passwords are required.',
  'errPasswordsDiffer': 'The passwords are not identical.',
  'footText': 'Documents from BTH. A <code><a href="https://github.com/jrpool/docsearch">DocSearch</a></code> site.<br><code>DocSearch</code> is under development by <a href="https://github.com/jrpool">Jonathan Pool</a> at <a href="http://learnersguild.org">Learners Guild</a>.',
  'intro': 'Introduction',
  'introText': 'Welcome! <strong>Berkeley Town House</strong> (BTH) is a senior housing cooperative in Berkeley, California. Founded in 1960, it is the <em>first</em> senior housing cooperative in the United States!</p><p>This site is a repository of about 14,000 documents from BTH. A BTH member collected them from 2009 to 2017 in order to help preserve, and facilitate access to, the institutional memory of this historic community.',
  'itemsIn': 'Items in {1}',
  'login': 'Login',
  'loginHere': 'If you are already registered, you can log in here.',
  'loginOKText': 'Your login succeeded.',
  'loginOKTitle': 'Login Successful',
  'logoutOKText': 'Your logout succeeded.',
  'logoutOKTitle': 'Logout Successful',
  'name': 'Name:',
  'pw': 'Password:',
  'pwAgain': 'Reenter the password:',
  'pwNew': 'Create a password:',
  'regAckText': 'Thank you, {1}, for registering! You may log in with this temporary UID: {2}. You should receive an email confirmation and be contacted later for verification.',
  'regAckTitle': 'Registration in Progress',
  'regEditAckText': 'Your revisions to the registration record of user {1} have been made. The current data are:',
  'regEditAckTitle': 'Registration Record Revised',
  'regEditMailSubject': 'Registration revision at berkhouse.us',
  'regEditMailText': 'This confirms that the registration record of {1} at http://berkhouse.us has been updated and now contains: {2}',
  'regHere': 'If you are not yet registered, you can register here.',
  'registration': 'Registration',
  'regMailSubject': 'Registration at berkhouse.us',
  'regMailText': 'This confirms the registration of {1} at http://berkhouse.us. You can log in with temporary UID {2}. After verification, it will be replaced with a durable UID.',
  'status': 'You are logged in as {1}. <span class="link buttonish"><a href="/usr/logout">Log out</a></span>',
  'tblCat': 'Category',
  'tblDate': 'Date',
  'tblID': 'ID',
  'tblItem': 'Item',
  'tblName': 'Name',
  'tblSize': 'Size',
  'tblUID': 'UID',
  'uid': 'UID:',
  'usrEtc': [
    {
      label: 'Your unit, if a member or resident:',
      field: {
        name: 'etc0',
        placeholder: '1XY',
        size: '3',
        minlength: '2',
        maxlength: '3',
        pattern: '\\d[A-H]{1,2}'
      }
    },
    {
      label: 'Your second unit, if any:',
      field: {
        name: 'etc1',
        placeholder: '1XY',
        size: '3',
        minlength: '2',
        maxlength: '3',
        pattern: '\\d[A-H]{1,2}'
      }
    },
    {
      label: 'Your title, if a manager:',
      field: {
        name: 'etc2',
        size: '30',
        maxlength: '30'
      }
    },
    {
      label: 'Additional information:',
      field: {
        name: 'etc3',
        size: '60',
        maxlength: '90'
      }
    },
    {
      label: 'For administrative use:',
      field: {
        name: 'admin',
        size: '20',
        maxlength: '20'
      }
    }
  ]
};

module.exports = {eng};
