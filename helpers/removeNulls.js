const removeNulls = videosArray => {
    return videosArray.filter(video => video !== null);
};

module.exports = removeNulls;
