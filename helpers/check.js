const fetch = require('node-fetch');

const check = async id => {
    let res = await fetch(`https://img.youtube.com/vi/${id}/0.jpg`);
    return res.status;
};

module.exports = check;
