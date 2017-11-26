const getUpdateQuery = (tbl, pkPair, entries) => {
  const itemList = Object.keys(entries).map(key => {
    return `${key} = ${entries[key]}`;
  }).join(', ');
  return `UPDATE ${tbl} SET ${itemList} WHERE ${pkPair[0]} = ${pkPair[1]}`;
};

module.exports = {getUpdateQuery};
