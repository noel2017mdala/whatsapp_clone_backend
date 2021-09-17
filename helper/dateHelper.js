let date = new Date();
let day = date.getDay();
let month = date.getMonth();
let year = date.getFullYear();
let fullDate = `${day}/${month}/${year}`;

module.exports = fullDate;
