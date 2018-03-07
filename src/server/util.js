const linkButton = (path, msg, opts) => {
  const classes = [];
  let classString = '',
    tabIndex = '',
    tabIndexString = '';
  if (typeof opts === 'object') {
    if (opts.showIf) {
      classes.push(opts.showIf);
    }
    if (opts.kind) {
      classes.push(opts.kind);
    }
    if (opts.tabIndex) {
      tabIndex = tabIndex + opts.tabIndex;
    }
  }
  if (classes.length) {
    classString = `class="${classes.join(' ')}"`;
  }
  if (tabIndex) {
    tabIndexString = `tabindex="${tabIndex}"`;
  }
  return `
      <button
        ${classString ? classString + '\n        ' : ''}${tabIndexString}
        type="button"
        onclick="location.href='${process.env.LINK_PREFIX}${path}'"
      >
        ${msg}
      </button>
  `;
};

const searchButton = (pathStart, msg, opts) => {
  const path = `${pathStart}&q=${document.getElementById('searchText').value}`;
  linkButton(path, msg, opts);
};

const linkButtonP = (path, msg, opts) => `<p>${linkButton(path, msg, opts)}</p>`;

const personalStatusMsg = (usr, locals) => {
  return locals.msgs.statusIfKnown.replace('{1}', usr.name)
  .replace(
    '{2}',
    locals.linkButton('/usr/logout', locals.msgs.btnLogout, {tabIndex: '-1'})
  )
  .replace(
    '{3}',
    locals.linkButton(
      '/usr/deregister',
      locals.msgs.btnDeregister,
      {tabIndex: '-1', kind: 'dangerous'}
    )
  );
};

module.exports = {linkButton, linkButtonP, personalStatusMsg, searchButton};
