const renderError = function(error, request, response) {
  response.send(`ERROR: ${error.message}\n\n${error.stack}`);
};

const eng = {
  'accessText': 'You can browse and search documents here. Some of them have access limitations. If you are a BTH member, prospective member, resident, or manager, you can register or log in for additional access.',
  'accessTitle': 'Access',
  'bthIs': '<strong>Berkeley Town House</strong> (BTH) is a senior housing cooperative in Berkeley, California. Founded in 1960, it is the <em>first</em> senior housing cooperative in the United States!',
  'bthRelation': 'Your relationships to BTH:',
  'btnCurate': 'Curate',
  'btnCurateGrp': 'User categories',
  'btnCurateDir': 'Directory permissions',
  'btnCurateReg': 'A user’s registration',
  'btnDeregister': 'Deregister',
  'btnHome': 'Home',
  'btnLogin': 'Log in',
  'btnRegister': 'Register',
  'btnSeePubDocs': 'See public documents',
  'btnSubmit': 'Submit',
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
  'docsTitle': 'Documents from BTH',
  'email': 'Email address:',
  'errAlreadyUsr': 'Someone with that name and email address is already registered.',
  'errGeneral': 'Something was wrong with the inputs.',
  'errLogin': 'Nobody with that ID-password combination is registered.',
  'errNeed2LoginFacts': 'Both an ID and a password are required.',
  'errNeed3RegFacts': 'A name, UID, and email address are required.',
  'errNeed4RegFacts': 'A name, an email address, and duplicate passwords are required.',
  'errPasswordsDiffer': 'The passwords are not identical.',
  'cats': [
    [0, 'Curator'],
    [1, 'General public'],
    [2, 'Member'],
    [3, 'Nonmember resident'],
    [4, 'Manager'],
    [5, 'Prospective member'],
    [6, 'Director'],
    [7, 'Treasurer']
  ],
  'catCurator': 'Curator',
  'catDirector': 'Director',
  'catManager': 'Manager',
  'catMember': 'Member',
  'catOther': 'Other',
  'catProspect': 'Prospective member',
  'catPublic': 'General public',
  'catResident': 'Nonmember resident',
  'catTreasurer': 'Treasurer',
  'info': 'Additional information:',
  'intro': 'Introduction',
  'login': 'Login',
  'loginHere': 'If you are already registered, you can log in here.',
  'loginOKText': 'Your login succeeded.',
  'loginOKTitle': 'Login Successful',
  'logoutOKText': 'Your logout succeeded.',
  'logoutOKTitle': 'Logout Successful',
  'mgrTitle': 'Your title, if a manager:',
  'name': 'Name:',
  'pw': 'Password:',
  'pwAgain': 'Reenter the password:',
  'pwNew': 'Create a password:',
  'regAckText': 'Thank you, {1} for registering! You may log in with temporary UID {2}. You should receive an email confirmation and be contacted later for verification.',
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
  'tblGrp': 'Category',
  'tblID': 'ID',
  'tblName': 'Name',
  'tblUID': 'UID',
  'uid': 'UID:',
  'unit0': 'Your unit, if a member or resident:',
  'unit1': 'Your second unit, if any:',
  'valueProp': 'This site is a repository of about 14,000 documents from BTH. A BTH member collected them from 2009 to 2017 in order to help preserve, and facilitate access to, the institutional memory of this historic community.',
  'welcome': 'Welcome!'
};

module.exports = {renderError, eng};
