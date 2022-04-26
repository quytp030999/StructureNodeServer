var validationString = (string) => {
  if (string != "" && string != null && string != undefined) {
    return true;
  }
  return false;
};

module.exports = {
  validationString: validationString,
};
