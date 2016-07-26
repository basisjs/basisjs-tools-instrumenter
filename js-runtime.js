window[DEVINFO_API_NAME].fixSourceOffset = function(source, offset) {
  if (offset && typeof btoa == 'function') {
    offset = ':' + (offset || 0) + ',';
    while (offset.length % 3) offset += ' ';  // get rid of base64 padding
    source = source
      //{"version":3,"sections":[{"offset":{"line:0,"
      .replace(/(eyJ2ZXJzaW9uIjozLCJzZWN0aW9ucyI6W3sib2Zmc2V0Ijp7ImxpbmUi)OjAs/, '$1' + btoa(offset))
      // cut off ?instr
      .replace(/P2luc3Ry/, '');
  }

  return source;
};

