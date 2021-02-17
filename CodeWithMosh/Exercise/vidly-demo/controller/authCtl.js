const   _ = require('lodash'),
        bcrypt = require('bcrypt'),
        jwt = require('jsonwebtoken'),
        config = require('config');

const   Joi = require('joi');

const   {User} = require('../models/user');

exports.postUserToLogin = async (req, res) => {
    const {error} = validate(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    let user = await User.findOne({email: req.body.email});
    if(!user) return res.status(400).send('Invalid email or password.');

    const validPassword = await bcrypt.compareSync(req.body.password, user.password);
    if(!validPassword) return res.status(400).send('Invalid email or password.');

    const token = user.generateAuthToken();

    res.send(token);

}

function validate(user) {
    const schema = Joi.object({
        email: Joi.string().min(3).max(255).required().email(),
        password: Joi.string().min(3).max(255).required()
    });

    return schema.validate(user);   
}