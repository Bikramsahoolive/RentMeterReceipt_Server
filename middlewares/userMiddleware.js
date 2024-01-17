const morgan = require('morgan');

function requestLog(){
    return (morgan('dev'));
}

module.exports={
    requestLog
}