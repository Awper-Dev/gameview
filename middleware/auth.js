module.exports = (req, res, next) => {
    if (req.session.auth) {
        next();
    } else {
        res.redirect('/users/login');
    }
};